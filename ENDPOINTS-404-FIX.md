# 🔧 Correction des Endpoints 404

## Problème Identifié

Le frontend appelle plusieurs endpoints qui retournent des erreurs 404 :

### Endpoints en Erreur
1. ❌ `GET /api/v1/accounting/aged-balance` (receivables & payables)
2. ❌ `GET /api/v1/users`

## Analyse

### 1. Endpoint Users - ✅ CORRIGÉ

**Problème** : Double préfixe dans le controller
- Controller définit : `@Controller('api/v1/users')`
- Global prefix : `api/v1`
- Résultat : `/api/v1/api/v1/users` ❌

**Solution** : Modifier le controller pour utiliser seulement `'users'`

```typescript
// Avant
@Controller('api/v1/users')

// Après
@Controller('users')
```

**Fichier modifié** : `bms/api-gateway/src/users/users.controller.ts`

### 2. Endpoint Aged Balance - À VÉRIFIER

**Status** : Le endpoint existe dans le controller ✅

```typescript
@Get('aged-balance')
@ApiOperation({ summary: 'Balance âgée des créances clients ou dettes fournisseurs' })
async getAgedBalance(
  @Query('companyId') companyId: string,
  @Query('type') type: 'receivables' | 'payables',
  @Query('asOfDate') asOfDate?: string,
): Promise<any> {
  const date = asOfDate || new Date().toISOString().slice(0, 10);
  return this.accountingService.getAgedBalance(companyId, type, date);
}
```

**Problèmes possibles** :
1. Service non implémenté correctement
2. Erreur dans la logique métier
3. Problème de permissions/authentification
4. Base de données non initialisée

## Actions à Effectuer

### Étape 1 : Redéployer l'API Gateway ✅

```bash
cd bms/api-gateway
npm run build
# Redéployer sur Railway
```

### Étape 2 : Tester les Endpoints

Utiliser le script de test :

```bash
# Définir votre token
export BMS_TOKEN="votre_token_jwt"

# Lancer les tests
./scripts/test-api-endpoints.sh
```

### Étape 3 : Vérifier les Services

Si les endpoints retournent toujours 404 ou 500, vérifier :

1. **Service Accounting** : `bms/api-gateway/src/accounting/accounting.service.ts`
   - Méthode `getAgedBalance()` implémentée ?
   - Requêtes SQL correctes ?
   - Gestion des erreurs ?

2. **Service Users** : `bms/api-gateway/src/users/users.service.ts`
   - Méthode `findAll()` implémentée ?
   - Permissions correctes ?

3. **Base de données**
   - Tables créées ?
   - Données de test présentes ?

### Étape 4 : Implémenter les Services Manquants

Si les services ne sont pas implémentés, créer des implémentations minimales :

#### A. Service Aged Balance

```typescript
async getAgedBalance(
  companyId: string,
  type: 'receivables' | 'payables',
  asOfDate: string,
): Promise<any> {
  // Requête SQL pour récupérer les créances/dettes
  const accountClass = type === 'receivables' ? '411' : '401';
  
  const query = `
    SELECT 
      je.reference,
      je.description,
      je.entry_date,
      SUM(jel.debit - jel.credit) as balance,
      EXTRACT(DAY FROM AGE($1::date, je.entry_date)) as age_days
    FROM journal_entries je
    JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
    JOIN accounts a ON jel.account_id = a.id
    WHERE je.company_id = $2
      AND a.account_number LIKE $3
      AND je.status = 'posted'
      AND je.entry_date <= $1
    GROUP BY je.id, je.reference, je.description, je.entry_date
    HAVING SUM(jel.debit - jel.credit) != 0
    ORDER BY je.entry_date
  `;
  
  const result = await this.db.query(query, [asOfDate, companyId, `${accountClass}%`]);
  
  // Grouper par tranches d'ancienneté
  const ranges = {
    current: [],      // 0-30 jours
    days30: [],       // 31-60 jours
    days60: [],       // 61-90 jours
    days90: [],       // 90+ jours
  };
  
  result.rows.forEach(row => {
    const days = parseInt(row.age_days);
    if (days <= 30) ranges.current.push(row);
    else if (days <= 60) ranges.days30.push(row);
    else if (days <= 90) ranges.days60.push(row);
    else ranges.days90.push(row);
  });
  
  return {
    type,
    asOfDate,
    ranges,
    totals: {
      current: ranges.current.reduce((sum, r) => sum + parseFloat(r.balance), 0),
      days30: ranges.days30.reduce((sum, r) => sum + parseFloat(r.balance), 0),
      days60: ranges.days60.reduce((sum, r) => sum + parseFloat(r.balance), 0),
      days90: ranges.days90.reduce((sum, r) => sum + parseFloat(r.balance), 0),
    }
  };
}
```

#### B. Service Users

```typescript
async findAll(companyId: string): Promise<any[]> {
  const query = `
    SELECT 
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.is_active,
      u.created_at,
      r.name as role_name
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    WHERE u.company_id = $1
      AND u.deleted_at IS NULL
    ORDER BY u.created_at DESC
  `;
  
  const result = await this.db.query(query, [companyId]);
  return result.rows;
}
```

## Checklist de Déploiement

- [x] Corriger le controller Users (double préfixe)
- [ ] Vérifier l'implémentation du service `getAgedBalance()`
- [ ] Vérifier l'implémentation du service `findAll()` users
- [ ] Tester les endpoints en local
- [ ] Rebuild l'API Gateway
- [ ] Redéployer sur Railway
- [ ] Tester les endpoints en production
- [ ] Vérifier les logs Railway pour d'autres erreurs

## Commandes Utiles

```bash
# Build local
cd bms/api-gateway
npm run build

# Test local
npm run start:dev

# Logs Railway
railway logs --service api-gateway

# Test endpoints
./scripts/test-api-endpoints.sh
```

## Notes

- Le global prefix `api/v1` est défini dans `main.ts`
- Tous les controllers doivent utiliser des paths relatifs (sans `api/v1`)
- Les guards JWT et Permissions doivent être correctement configurés
- Vérifier que les variables d'environnement sont correctes sur Railway
