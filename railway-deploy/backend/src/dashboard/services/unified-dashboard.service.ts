import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheService } from '../../common/services/cache.service';
import { CACHE_TTL, CACHE_KEYS } from '../../common/constants/cache.constants';
import { AccountingDashboardService } from '../../accounting/accounting-dashboard.service';
import { CrmService } from '../../crm/crm.service';
import { TreasuryService } from '../../treasury/treasury.service';

export interface DashboardOptions {
  forceRefresh?: boolean;
  widgets?: string[];
}

export interface DashboardData {
  metrics?: any;
  crm?: any;
  treasury?: any;
  alerts?: any;
  timestamp: string;
}

/**
 * Service unifié pour les dashboards avec cache intelligent
 */
@Injectable()
export class UnifiedDashboardService {
  private readonly logger = new Logger(UnifiedDashboardService.name);

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
    options?: DashboardOptions,
  ): Promise<DashboardData> {
    try {
      // 1. Vérifier le cache
      const cacheKey = CACHE_KEYS.DASHBOARD(companyId, profile);
      const cached = await this.cacheService.get<DashboardData>(cacheKey);

      if (cached && !options?.forceRefresh) {
        this.logger.debug(`Dashboard cache HIT for ${companyId}:${profile}`);
        return cached;
      }

      this.logger.debug(`Dashboard cache MISS for ${companyId}:${profile}, loading...`);

      // 2. Charger les données en parallèle avec cache par widget
      const [metrics, crm, treasury, alerts] = await Promise.all([
        this.getMetricsWithCache(companyId, profile),
        this.getCrmDataWithCache(companyId),
        this.getTreasuryDataWithCache(companyId),
        this.getAlertsWithCache(companyId),
      ]);

      // 3. Assembler les données
      const dashboardData: DashboardData = {
        metrics,
        crm,
        treasury,
        alerts,
        timestamp: new Date().toISOString(),
      };

      // 4. Mettre en cache avec TTL adaptatif
      await this.cacheService.set(cacheKey, dashboardData, CACHE_TTL.KPIS);

      // 5. Émettre un événement pour les WebSockets
      this.eventEmitter.emit('dashboard.updated', {
        companyId,
        profile,
        data: dashboardData,
      });

      return dashboardData;
    } catch (error) {
      this.logger.error(`Error loading dashboard for ${companyId}:${profile}:`, error);
      throw error;
    }
  }

  /**
   * Récupère les métriques avec cache par widget
   */
  private async getMetricsWithCache(
    companyId: string,
    profile: string,
  ): Promise<any> {
    const cacheKey = CACHE_KEYS.DASHBOARD(companyId, profile, 'metrics');
    const cached = await this.cacheService.get(cacheKey);

    if (cached) return cached;

    const metrics = await this.accountingService.getDashboardMetrics(companyId);
    await this.cacheService.set(cacheKey, metrics, CACHE_TTL.KPIS);

    return metrics;
  }

  /**
   * Récupère les données CRM avec cache
   */
  private async getCrmDataWithCache(companyId: string): Promise<any> {
    const cacheKey = CACHE_KEYS.DASHBOARD(companyId, 'crm', 'data');
    const cached = await this.cacheService.get(cacheKey);

    if (cached) return cached;

    // Charger les statistiques CRM
    try {
      const stats = await this.crmService.getDashboard(companyId);
      await this.cacheService.set(cacheKey, stats, CACHE_TTL.KPIS);
      return stats;
    } catch (error) {
      this.logger.warn(`Error loading CRM data for ${companyId}:`, error);
      return null;
    }
  }

  /**
   * Récupère les données trésorerie avec cache
   */
  private async getTreasuryDataWithCache(companyId: string): Promise<any> {
    const cacheKey = CACHE_KEYS.DASHBOARD(companyId, 'treasury', 'data');
    const cached = await this.cacheService.get(cacheKey);

    if (cached) return cached;

    // Charger les données trésorerie
    try {
      const forecast = await this.treasuryService.getForecast(companyId);
      const alerts = await this.treasuryService.getAlerts(companyId);
      
      const data = { forecast, alerts };
      await this.cacheService.set(cacheKey, data, CACHE_TTL.CHARTS);
      return data;
    } catch (error) {
      this.logger.warn(`Error loading treasury data for ${companyId}:`, error);
      return null;
    }
  }

  /**
   * Récupère les alertes avec cache
   */
  private async getAlertsWithCache(companyId: string): Promise<any> {
    const cacheKey = CACHE_KEYS.DASHBOARD(companyId, 'alerts', 'data');
    const cached = await this.cacheService.get(cacheKey);

    if (cached) return cached;

    // Charger les alertes
    try {
      // Les alertes sont déjà incluses dans les métriques accounting
      const metrics = await this.accountingService.getDashboardMetrics(companyId);
      const accountingAlerts = metrics?.alerts || [];
      
      const treasuryAlerts = await this.treasuryService.getAlerts(companyId);
      const alerts = treasuryAlerts?.alerts || [];
      
      const allAlerts = [...accountingAlerts, ...alerts];
      await this.cacheService.set(cacheKey, allAlerts, CACHE_TTL.ALERTS);
      return allAlerts;
    } catch (error) {
      this.logger.warn(`Error loading alerts for ${companyId}:`, error);
      return [];
    }
  }

  /**
   * Récupère un widget spécifique avec cache
   */
  async getWidget(
    companyId: string,
    profile: string,
    widget: string,
  ): Promise<any> {
    const cacheKey = CACHE_KEYS.DASHBOARD(companyId, profile, widget);
    const cached = await this.cacheService.get(cacheKey);

    if (cached) return cached;

    // Charger le widget selon son type
    let data: any;

    switch (widget) {
      case 'metrics':
        data = await this.accountingService.getDashboardMetrics(companyId);
        break;
      case 'crm':
        data = await this.crmService.getDashboard(companyId);
        break;
      case 'treasury':
        data = await this.treasuryService.getForecast(companyId);
        break;
      default:
        data = null;
    }

    if (data) {
      await this.cacheService.set(cacheKey, data, CACHE_TTL.KPIS);
    }

    return data;
  }
}

