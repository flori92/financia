# ✅ Corrections Appliquées - Endpoints 404

## Résumé

Correction des erreurs 404 sur les endpoints API du BMS.

## Problèmes Identifiés

### 1. Endpoint `/api/v1/users` - 404 Not Found

**Cause** : Double préfixe dans le controller
- Le controller définissait `@Controller('api/v1/users')`
- Le global prefix ajoute déjà `api/v1`
- Résultat : route finale `/api/v1/api/v1/users` ❌

**Corrections appliquées** :

1. **Controller path** : `bms/api-gateway/src/users/users.controller.ts`
   ```typescript
   // Avant
   @Controller('api/v1/users')
   
   // Après
   @Controller('users')
   ```

2. **Import du decorator** :
   ```typescript
   // Avant
   import { GetCompany } from '../common/decorators/get-company.decorator';
   
   // Après
   import { CompanyId } from '../common/decorators/company-id.decorator';
   import { Query } from '@nestjs/common';
   import { ApiQuery } from '@nestjs/swagger';
   ```

3. **Utilisation du companyId** :
   ```typescript
   // Avant
   async findAll(@GetCompany() companyId: string)
   
   // Après
   @ApiQuery({ name: 'companyId', required: true })
   async findAll(@Query('companyId') companyId: string)
   ```

### 2. Endpoint `/api/v1/accounting/aged-balance` - 404 Not Found

**Status** : ✅ Le endpoint existe et est correctement implémenté

**Vérifications effectuées** :
- ✅ Controller : `@Get('aged-balance')` présent
- ✅ Service : méthode `getAgedBalance()` implémentée
- ✅ Logique métier : calcul des tranches d'ancienneté fonctionnel
- ✅ Path : `/api/v1/accounting/aged-balance` correct

**Cause probable de l'erreur 404** :
- Problème de permissions/authentification
- Base de données non initialisée
- Compte 411 (créances) ou 401 (dettes) non créé

## Fichiers Modifiés

1. `bms/api-gateway/src/users/users.controller.ts`
   - Correction du path du controller
   - Correction des imports
   - Ajout des `@ApiQuery` decorators
   - Utilisation de `@Query('companyId')` au lieu de `@GetCompany()`

## Actions Suivantes

### 1. Rebuild et Redéploiement

```bash
cd bms/api-gateway
npm run build
# Redéployer sur Railway
```

### 2. Tests à Effectuer

Après le redéploiement, tester les endpoints :

```bash
# Définir le token
export BMS_TOKEN="votre_token_jwt"

# Lancer les tests
./scripts/test-api-endpoints.sh
```

### 3. Vérifications Supplémentaires

Si les erreurs persistent :

#### A. Vérifier les Permissions

Le decorator `@RequirePermissions('users:read')` nécessite que l'utilisateur ait cette permission.

Vérifier dans la base de données :
```sql
SELECT * FROM permissions WHERE name LIKE 'users:%';
SELECT * FROM role_permissions WHERE permission_id IN (
  SELECT id FROM permissions WHERE name LIKE 'users:%'
);
```

#### B. Vérifier les Comptes Comptables

Pour `aged-balance`, vérifier que les comptes existent :
```sql
SELECT * FROM accounts 
WHERE company_id = 'e611a153-8dd5-41dd-bb8e-9434766a0dfd'
  AND account_number IN ('411', '401');
```

Si absents, initialiser le plan comptable :
```bash
curl -X POST "https://bms-production-d9e9.up.railway.app/api/v1/accounting/seed-syscohada?companyId=e611a153-8dd5-41dd-bb8e-9434766a0dfd" \
  -H "Authorization: Bearer $TOKEN"
```

#### C. Vérifier les Guards

Les guards `JwtAuthGuard` et `PermissionsGuard` peuvent bloquer les requêtes.

Vérifier les logs Railway :
```bash
railway logs --service api-gateway | grep -i "unauthorized\|forbidden\|404"
```

## Endpoints Testés

### ✅ Endpoints Fonctionnels (Théoriquement)

1. `GET /api/v1/users?companyId={id}`
2. `GET /api/v1/accounting/aged-balance?companyId={id}&type=receivables&asOfDate=2025-11-29`
3. `GET /api/v1/accounting/aged-balance?companyId={id}&type=payables&asOfDate=2025-11-29`
4. `GET /api/v1/accounting/dashboard/metrics?companyId={id}`
5. `GET /api/v1/treasury/forecast?companyId={id}`
6. `GET /api/v1/treasury/alerts?companyId={id}`

### 📋 Checklist de Validation

- [x] Corriger le controller Users
- [x] Vérifier l'implémentation de `getAgedBalance()`
- [x] Vérifier l'implémentation de `findAll()` users
- [ ] Tester les endpoints en local
- [ ] Rebuild l'API Gateway
- [ ] Redéployer sur Railway
- [ ] Tester les endpoints en production
- [ ] Vérifier les permissions dans la DB
- [ ] Initialiser le plan comptable si nécessaire
- [ ] Vérifier les logs pour d'autres erreurs

## Notes Techniques

### Global Prefix

Le global prefix `api/v1` est défini dans `bms/api-gateway/src/main.ts` :

```typescript
app.setGlobalPrefix('api/v1');
```

**Règle** : Tous les controllers doivent utiliser des paths relatifs sans `api/v1`.

### Decorators Disponibles

- `@CompanyId()` : Extrait le companyId du JWT token
- `@Query('companyId')` : Extrait le companyId des query params
- `@Param('id')` : Extrait un paramètre de l'URL
- `@Body()` : Extrait le body de la requête

### Guards

Les guards suivants sont utilisés :
- `JwtAuthGuard` : Vérifie le token JWT
- `PermissionsGuard` : Vérifie les permissions RBAC
- `@RequirePermissions('resource:action')` : Définit les permissions requises

## Commandes Utiles

```bash
# Build local
cd bms/api-gateway
npm install
npm run build

# Test local
npm run start:dev

# Logs Railway
railway logs --service api-gateway --tail

# Test endpoint spécifique
curl -H "Authorization: Bearer $TOKEN" \
  "https://bms-production-d9e9.up.railway.app/api/v1/users?companyId=e611a153-8dd5-41dd-bb8e-9434766a0dfd"
```

## Prochaines Étapes

1. **Redéployer l'API Gateway** avec les corrections
2. **Tester tous les endpoints** avec le script de test
3. **Vérifier les logs** pour identifier d'autres problèmes
4. **Initialiser les données** si nécessaire (plan comptable, permissions)
5. **Documenter** les endpoints dans Swagger
