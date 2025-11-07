# 🚀 BMS - Stratégie Dynamique et Moderne pour Alimenter les Dashboards

## 📊 Analyse de l'Architecture Actuelle

### État des Lieux

#### ✅ Points Forts
- Architecture modulaire avec services dédiés par module
- Utilisation de TypeORM pour les requêtes
- Bull Queue configuré pour les tâches asynchrones
- PostgreSQL comme base de données principale
- Railway pour le déploiement

#### ❌ Points à Améliorer
- **Redis désactivé** : Cache non utilisé actuellement
- **Requêtes multiples** : Dashboards font 8+ appels API en parallèle
- **Pas de cache** : Chaque requête interroge directement la DB
- **Pas de temps réel** : Pas de WebSockets/SSE pour les mises à jour
- **Pas de préchargement** : Données chargées à la demande uniquement
- **Pas d'invalidation intelligente** : Cache non géré
- **Requêtes non optimisées** : Pas d'agrégation côté DB

---

## 🎯 Stratégie Globale : Architecture en 3 Couches

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  WebSockets  │  │  SSE Stream  │  │  REST API    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼─────────┐
│         │                  │                  │          │
│    ┌────▼──────────────────▼──────────────────▼────┐    │
│    │         API GATEWAY (NestJS)                   │    │
│    │  ┌──────────────────────────────────────────┐  │    │
│    │  │     Cache Layer (Redis)                   │  │    │
│    │  │  - TTL Adaptatif                          │  │    │
│    │  │  - Invalidation Intelligente              │  │    │
│    │  │  - Préchargement                          │  │    │
│    │  └──────────────────────────────────────────┘  │    │
│    │  ┌──────────────────────────────────────────┐  │    │
│    │  │     Dashboard Service Unifié              │  │    │
│    │  │  - Agrégation Intelligente                │  │    │
│    │  │  - Requêtes Optimisées                    │  │    │
│    │  │  - Précalcul des KPIs                    │  │    │
│    │  └──────────────────────────────────────────┘  │    │
│    └─────────────────────────────────────────────────┘    │
│                                                           │
│    ┌───────────────────────────────────────────────┐    │
│    │         DATABASE (PostgreSQL)                  │    │
│    │  - Indexes Optimisés                          │    │
│    │  - Vues Matérialisées                         │    │
│    │  - Triggers pour Cache Invalidation           │    │
│    └───────────────────────────────────────────────┘    │
└───────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture Technique Détaillée

### 1. **Couche Cache Redis (Intelligente)**

#### 1.1 Structure de Cache Multi-Niveaux

```typescript
// Structure des clés Redis
dashboard:{companyId}:{profile}:{widget}     // Cache par widget
dashboard:{companyId}:{profile}:full          // Cache complet dashboard
kpi:{companyId}:{type}:{period}              // KPIs précalculés
aggregate:{companyId}:{entity}:{date}        // Agrégations
realtime:{companyId}:{channel}                // Données temps réel
```

#### 1.2 TTL Adaptatif par Type de Données

```typescript
const CACHE_TTL = {
  // Données très dynamiques (mises à jour fréquentes)
  REALTIME: 30,              // 30 secondes
  TRANSACTIONS: 60,          // 1 minute
  ACTIVITIES: 120,           // 2 minutes
  
  // Données modérément dynamiques
  KPIS: 300,                 // 5 minutes
  CHARTS: 600,               // 10 minutes
  ALERTS: 180,               // 3 minutes
  
  // Données relativement statiques
  RATIOS: 1800,              // 30 minutes
  TOP_CLIENTS: 3600,         // 1 heure
  FINANCIAL_RATIOS: 3600,    // 1 heure
  
  // Données statiques
  COMPANY_INFO: 86400,       // 24 heures
  CHART_OF_ACCOUNTS: 86400,  // 24 heures
};
```

#### 1.3 Système d'Invalidation Intelligente

```typescript
// Tags pour invalidation groupée
cache:company:{companyId}:dashboard:*         // Invalide tous les dashboards
cache:company:{companyId}:accounting:*        // Invalide module comptabilité
cache:company:{companyId}:crm:*              // Invalide module CRM
cache:company:{companyId}:treasury:*         // Invalide module trésorerie
```

---

### 2. **Service Dashboard Unifié**

#### 2.1 Architecture du Service

```typescript
@Injectable()
export class UnifiedDashboardService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly accountingService: AccountingDashboardService,
    private readonly crmService: CrmService,
    private readonly treasuryService: TreasuryService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Récupère les données du dashboard avec cache intelligent
   */
  async getDashboardData(
    companyId: string,
    profile: string,
    options?: DashboardOptions
  ): Promise<DashboardData> {
    // 1. Vérifier le cache
    const cacheKey = `dashboard:${companyId}:${profile}:full`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached && !options?.forceRefresh) {
      // Retourner depuis le cache
      return cached;
    }

    // 2. Charger les données en parallèle avec cache par widget
    const [metrics, crm, treasury, alerts] = await Promise.all([
      this.getMetricsWithCache(companyId, profile),
      this.getCrmDataWithCache(companyId),
      this.getTreasuryDataWithCache(companyId),
      this.getAlertsWithCache(companyId),
    ]);

    // 3. Assembler les données
    const dashboardData = {
      metrics,
      crm,
      treasury,
      alerts,
      timestamp: new Date().toISOString(),
    };

    // 4. Mettre en cache avec TTL adaptatif
    await this.cacheService.set(
      cacheKey,
      dashboardData,
      CACHE_TTL.KPIS
    );

    return dashboardData;
  }

  /**
   * Récupère les métriques avec cache par widget
   */
  private async getMetricsWithCache(
    companyId: string,
    profile: string
  ): Promise<Metrics> {
    const cacheKey = `dashboard:${companyId}:${profile}:metrics`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) return cached;

    // Charger depuis le service
    const metrics = await this.accountingService.getDashboardMetrics(companyId);
    
    // Mettre en cache
    await this.cacheService.set(cacheKey, metrics, CACHE_TTL.KPIS);
    
    return metrics;
  }
}
```

---

### 3. **Système de Préchargement Intelligent**

#### 3.1 Préchargement par Profil

```typescript
@Injectable()
export class DashboardPreloadService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly unifiedDashboard: UnifiedDashboardService,
    private readonly scheduler: SchedulerRegistry,
  ) {}

  /**
   * Précharge les données pour un profil spécifique
   */
  async preloadForProfile(companyId: string, profile: string) {
    // Précharger les données les plus utilisées
    const preloadTasks = [
      this.unifiedDashboard.getDashboardData(companyId, profile),
      this.preloadKPIs(companyId),
      this.preloadCharts(companyId),
      this.preloadAlerts(companyId),
    ];

    await Promise.all(preloadTasks);
  }

  /**
   * Précharge les KPIs pour toutes les entreprises actives
   */
  @Cron('*/5 * * * *') // Toutes les 5 minutes
  async preloadActiveCompanies() {
    const activeCompanies = await this.getActiveCompanies();
    
    for (const company of activeCompanies) {
      // Précharger pour les profils les plus utilisés
      await Promise.all([
        this.preloadForProfile(company.id, 'accountant'),
        this.preloadForProfile(company.id, 'entrepreneur'),
        this.preloadForProfile(company.id, 'expert-comptable'),
      ]);
    }
  }
}
```

---

### 4. **WebSockets / Server-Sent Events pour Temps Réel**

#### 4.1 Gateway WebSocket

```typescript
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/dashboard',
})
export class DashboardGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly unifiedDashboard: UnifiedDashboardService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    // Authentifier le client
    const { companyId, profile } = client.handshake.auth;
    
    // Rejoindre la room pour cette entreprise
    client.join(`company:${companyId}`);
    client.join(`profile:${profile}`);
  }

  /**
   * Écoute les événements de mise à jour
   */
  @OnEvent('dashboard.updated')
  handleDashboardUpdate(payload: { companyId: string; profile: string; data: any }) {
    // Envoyer la mise à jour à tous les clients connectés
    this.server
      .to(`company:${payload.companyId}`)
      .to(`profile:${payload.profile}`)
      .emit('dashboard:update', payload.data);
  }

  /**
   * Écoute les événements de cache invalidation
   */
  @OnEvent('cache.invalidated')
  handleCacheInvalidation(payload: { companyId: string; tags: string[] }) {
    // Notifier les clients pour recharger les données
    this.server
      .to(`company:${payload.companyId}`)
      .emit('cache:invalidated', { tags: payload.tags });
  }
}
```

#### 4.2 Server-Sent Events (Alternative)

```typescript
@Controller('dashboard/stream')
export class DashboardStreamController {
  constructor(
    private readonly unifiedDashboard: UnifiedDashboardService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Get(':companyId/:profile')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  async streamDashboard(
    @Param('companyId') companyId: string,
    @Param('profile') profile: string,
    @Res() response: Response,
  ) {
    // Envoyer les données initiales
    const initialData = await this.unifiedDashboard.getDashboardData(
      companyId,
      profile
    );
    response.write(`data: ${JSON.stringify(initialData)}\n\n`);

    // Écouter les événements de mise à jour
    const listener = (data: any) => {
      response.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    this.eventEmitter.on(`dashboard.updated.${companyId}.${profile}`, listener);

    // Nettoyer à la déconnexion
    response.on('close', () => {
      this.eventEmitter.off(`dashboard.updated.${companyId}.${profile}`, listener);
    });
  }
}
```

---

### 5. **Invalidation Intelligente du Cache**

#### 5.1 Système d'Événements pour Invalidation

```typescript
@Injectable()
export class CacheInvalidationService {
  constructor(
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Invalide le cache lors d'une modification
   */
  async invalidateOnChange(
    companyId: string,
    entity: string,
    action: 'create' | 'update' | 'delete'
  ) {
    // Déterminer les tags à invalider
    const tags = this.getInvalidationTags(companyId, entity, action);
    
    // Invalider les clés correspondantes
    for (const tag of tags) {
      const keys = await this.cacheService.keys(`${tag}*`);
      await Promise.all(keys.map(key => this.cacheService.del(key)));
    }

    // Émettre un événement pour notifier les clients
    this.eventEmitter.emit('cache.invalidated', {
      companyId,
      tags,
    });
  }

  /**
   * Détermine les tags à invalider selon l'entité
   */
  private getInvalidationTags(
    companyId: string,
    entity: string,
    action: string
  ): string[] {
    const tags: string[] = [`cache:company:${companyId}:*`];

    // Mapping entité -> tags
    const entityTagMap: Record<string, string[]> = {
      'journal-entry': [
        `cache:company:${companyId}:accounting:*`,
        `cache:company:${companyId}:dashboard:*`,
        `kpi:${companyId}:*`,
      ],
      'contact': [
        `cache:company:${companyId}:crm:*`,
        `cache:company:${companyId}:dashboard:*`,
      ],
      'transaction': [
        `cache:company:${companyId}:treasury:*`,
        `cache:company:${companyId}:dashboard:*`,
        `kpi:${companyId}:treasury:*`,
      ],
      'invoice': [
        `cache:company:${companyId}:accounting:*`,
        `cache:company:${companyId}:dashboard:*`,
        `kpi:${companyId}:revenue:*`,
      ],
    };

    const entityTags = entityTagMap[entity] || [];
    tags.push(...entityTags);

    return tags;
  }
}
```

#### 5.2 Intercepteurs pour Invalidation Automatique

```typescript
@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, params, body } = request;

    // Détecter les modifications
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap(async (result) => {
          // Extraire companyId et entity
          const companyId = params.companyId || body.companyId;
          const entity = this.extractEntity(request.url);
          const action = this.getAction(method);

          if (companyId && entity) {
            await this.cacheInvalidation.invalidateOnChange(
              companyId,
              entity,
              action
            );
          }
        })
      );
    }

    return next.handle();
  }

  private extractEntity(url: string): string {
    // Extraire l'entité depuis l'URL
    const patterns = [
      { pattern: /\/journal-entries/, entity: 'journal-entry' },
      { pattern: /\/contacts/, entity: 'contact' },
      { pattern: /\/transactions/, entity: 'transaction' },
      { pattern: /\/invoices/, entity: 'invoice' },
    ];

    for (const { pattern, entity } of patterns) {
      if (pattern.test(url)) return entity;
    }

    return 'unknown';
  }

  private getAction(method: string): 'create' | 'update' | 'delete' {
    if (method === 'POST') return 'create';
    if (method === 'DELETE') return 'delete';
    return 'update';
  }
}
```

---

### 6. **Optimisation des Requêtes Base de Données**

#### 6.1 Vues Matérialisées pour Agrégations

```sql
-- Vue matérialisée pour les KPIs mensuels
CREATE MATERIALIZED VIEW mv_monthly_kpis AS
SELECT
  company_id,
  DATE_TRUNC('month', entry_date) AS month,
  SUM(CASE WHEN account_number LIKE '7%' THEN credit ELSE 0 END) AS revenue,
  SUM(CASE WHEN account_number LIKE '6%' THEN debit ELSE 0 END) AS expenses,
  SUM(CASE WHEN account_number LIKE '7%' THEN credit ELSE 0 END) - 
  SUM(CASE WHEN account_number LIKE '6%' THEN debit ELSE 0 END) AS net_income
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
JOIN accounts a ON jel.account_id = a.id
WHERE je.status = 'posted'
GROUP BY company_id, DATE_TRUNC('month', entry_date);

-- Index pour performance
CREATE INDEX idx_mv_monthly_kpis_company_month 
ON mv_monthly_kpis(company_id, month DESC);

-- Rafraîchir la vue toutes les heures
CREATE OR REPLACE FUNCTION refresh_monthly_kpis()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_kpis;
END;
$$ LANGUAGE plpgsql;
```

#### 6.2 Index Optimisés

```sql
-- Index pour les requêtes de dashboard
CREATE INDEX idx_journal_entries_company_status_date 
ON journal_entries(company_id, status, entry_date DESC);

CREATE INDEX idx_journal_lines_account_entry 
ON journal_entry_lines(account_id, journal_entry_id);

CREATE INDEX idx_contacts_company_status 
ON contacts(company_id, status);

CREATE INDEX idx_transactions_company_date 
ON bank_transactions(company_id, transaction_date DESC);

-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_dashboard_metrics 
ON journal_entries(company_id, status, entry_date) 
INCLUDE (total_debit, total_credit);
```

---

### 7. **Configuration Redis pour Railway**

#### 7.1 Module Redis avec Configuration Railway

```typescript
// app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // ... autres imports
    
    // Redis Cache avec support Railway
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        // Railway fournit REDIS_URL ou REDIS_HOST/REDIS_PORT
        const redisUrl = config.get('REDIS_URL');
        
        if (redisUrl) {
          // Parse REDIS_URL (format: redis://user:pass@host:port)
          const url = new URL(redisUrl);
          return {
            store: redisStore,
            host: url.hostname,
            port: parseInt(url.port) || 6379,
            password: url.password,
            ttl: 300, // TTL par défaut
            max: 1000, // Nombre max d'items en cache
          };
        }
        
        // Fallback pour variables individuelles
        return {
          store: redisStore,
          host: config.get('REDIS_HOST', 'localhost'),
          port: parseInt(config.get('REDIS_PORT', '6379')),
          password: config.get('REDIS_PASSWORD'),
          ttl: 300,
          max: 1000,
        };
      },
    }),
  ],
})
```

#### 7.2 Service Cache Wrapper

```typescript
@Injectable()
export class CacheService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: Logger,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      return await this.cacheManager.get<T>(key);
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null; // Fallback: retourner null en cas d'erreur
    }
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
      // Ne pas bloquer si le cache échoue
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
    } catch (error) {
      this.logger.error(`Cache del error for key ${key}:`, error);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      // Implémentation dépend de la librairie Redis utilisée
      const store = this.cacheManager.store as any;
      if (store.keys) {
        return await store.keys(pattern);
      }
      return [];
    } catch (error) {
      this.logger.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }
}
```

---

## 📋 Plan d'Implémentation

### Phase 1 : Infrastructure de Cache (Semaine 1)
- [ ] Activer Redis dans `app.module.ts`
- [ ] Créer `CacheService` wrapper
- [ ] Implémenter TTL adaptatif
- [ ] Configurer Redis pour Railway

### Phase 2 : Service Dashboard Unifié (Semaine 2)
- [ ] Créer `UnifiedDashboardService`
- [ ] Implémenter cache par widget
- [ ] Intégrer avec services existants
- [ ] Tests unitaires

### Phase 3 : Invalidation Intelligente (Semaine 3)
- [ ] Créer `CacheInvalidationService`
- [ ] Implémenter intercepteurs
- [ ] Système d'événements
- [ ] Tests d'invalidation

### Phase 4 : Temps Réel (Semaine 4)
- [ ] Implémenter WebSocket Gateway
- [ ] Alternative SSE
- [ ] Tests de connexion
- [ ] Documentation

### Phase 5 : Optimisation DB (Semaine 5)
- [ ] Créer vues matérialisées
- [ ] Ajouter index optimisés
- [ ] Créer fonctions de rafraîchissement
- [ ] Tests de performance

### Phase 6 : Préchargement (Semaine 6)
- [ ] Créer `DashboardPreloadService`
- [ ] Implémenter cron jobs
- [ ] Tests de préchargement
- [ ] Monitoring

---

## 🎯 Métriques de Performance Attendues

### Avant Optimisation
- **Temps de chargement dashboard** : 2-5 secondes
- **Requêtes DB par dashboard** : 8-12 requêtes
- **Charge DB** : Élevée (requêtes répétées)
- **Temps réel** : ❌ Non disponible

### Après Optimisation
- **Temps de chargement dashboard** : 200-500ms (cache hit)
- **Requêtes DB par dashboard** : 0-2 requêtes (cache hit)
- **Charge DB** : Réduite de 80%
- **Temps réel** : ✅ Disponible via WebSocket/SSE

---

## 🔧 Configuration Railway

### Variables d'Environnement

```bash
# Redis (Railway fournit automatiquement)
REDIS_URL=redis://default:password@host:port

# Ou variables individuelles
REDIS_HOST=host.railway.app
REDIS_PORT=6379
REDIS_PASSWORD=password

# Cache Configuration
CACHE_TTL_DEFAULT=300
CACHE_MAX_ITEMS=1000

# Dashboard Configuration
DASHBOARD_PRELOAD_ENABLED=true
DASHBOARD_PRELOAD_INTERVAL=300000  # 5 minutes
```

### Railway Service Configuration

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "services": {
    "redis": {
      "image": "redis:7-alpine",
      "volumes": ["redis-data:/data"]
    }
  }
}
```

---

## 📊 Monitoring et Observabilité

### Métriques à Surveiller

1. **Cache Hit Rate** : Taux de succès du cache
2. **Cache Miss Rate** : Taux d'échec du cache
3. **Temps de réponse** : Latence des requêtes
4. **Charge DB** : Nombre de requêtes DB
5. **Connexions WebSocket** : Nombre de clients connectés
6. **Taille du cache** : Mémoire utilisée par Redis

### Dashboard de Monitoring

```typescript
@Controller('monitoring/cache')
export class CacheMonitoringController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('stats')
  async getCacheStats() {
    return {
      hitRate: await this.getHitRate(),
      missRate: await this.getMissRate(),
      size: await this.getCacheSize(),
      keys: await this.getKeyCount(),
    };
  }
}
```

---

## 🚀 Prochaines Étapes

1. **Révision de la stratégie** avec l'équipe
2. **Validation des choix techniques**
3. **Implémentation progressive** par phase
4. **Tests de performance** à chaque phase
5. **Déploiement en production** avec monitoring

---

*Document généré automatiquement - Stratégie dynamique pour BMS*

