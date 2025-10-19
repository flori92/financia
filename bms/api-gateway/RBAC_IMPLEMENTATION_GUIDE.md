# 🔐 Guide d'Implémentation RBAC

## ✅ Ce qui a été créé

### Entities
- ✅ `Permission` entity - Permissions système
- ✅ `Role` entity - Rôles avec permissions
- ✅ `User` entity - Relation many-to-many avec roles

### Services
- ✅ `RbacService` - Gestion des rôles et permissions
- ✅ `AuditService` - Logging des actions

### Guards & Interceptors
- ✅ `PermissionsGuard` - Vérification des permissions
- ✅ `AuditInterceptor` - Logging automatique

### Migrations
- ✅ `CreateRolesAndPermissions` - Tables BDD
- ✅ `permissions.seed.ts` - Seed des permissions par défaut

---

## 🚀 Comment Utiliser

### 1. Appliquer le Guard Globalement

**Option A: Guard global (recommandé)**
```typescript
// app.module.ts
import { APP_GUARD } from '@nestjs/core';
import { PermissionsGuard } from './rbac/guards/permissions.guard';

providers: [
  {
    provide: APP_GUARD,
    useClass: PermissionsGuard,
  },
]
```

**Option B: Par controller**
```typescript
@Controller('invoices')
@UseGuards(PermissionsGuard)
export class InvoicesController { }
```

### 2. Protéger les Routes

```typescript
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@Controller('invoices')
export class InvoicesController {
  
  @Post()
  @RequirePermissions('invoices:create')
  create(@Body() dto: CreateInvoiceDto) {
    // Seuls les users avec permission 'invoices:create' peuvent accéder
  }

  @Get()
  @RequirePermissions('invoices:read')
  findAll() {
    // Permission 'invoices:read' requise
  }

  @Patch(':id/validate')
  @RequirePermissions('invoices:validate')
  validate(@Param('id') id: string) {
    // Permission 'invoices:validate' requise
  }

  @Delete(':id')
  @RequirePermissions('invoices:delete')
  remove(@Param('id') id: string) {
    // Permission 'invoices:delete' requise
  }
}
```

### 3. Permissions Multiples (OR logic)

```typescript
@Post()
@RequirePermissions('invoices:create', 'invoices:admin')
create() {
  // User doit avoir 'invoices:create' OU 'invoices:admin'
}
```

### 4. Audit Logging Automatique

```typescript
// app.module.ts
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';

providers: [
  {
    provide: APP_INTERCEPTOR,
    useClass: AuditInterceptor,
  },
]
```

L'interceptor loggera automatiquement:
- Toutes les modifications (POST, PUT, PATCH, DELETE)
- Sur les endpoints sensibles (invoices, payments, accounting, tax, users, roles, settings)

---

## 📋 Permissions Par Défaut

### Accounting
- `accounting:read` - Voir la comptabilité
- `accounting:create` - Créer des écritures
- `accounting:update` - Modifier des écritures
- `accounting:delete` - Supprimer des écritures
- `accounting:validate` - Valider des écritures
- `accounting:close` - Clôturer des périodes

### Invoices
- `invoices:read` - Voir les factures
- `invoices:create` - Créer des factures
- `invoices:update` - Modifier des factures
- `invoices:delete` - Supprimer des factures
- `invoices:validate` - Valider des factures
- `invoices:send` - Envoyer des factures

### Payments
- `payments:read` - Voir les paiements
- `payments:create` - Créer des paiements
- `payments:update` - Modifier des paiements
- `payments:delete` - Supprimer des paiements
- `payments:validate` - Valider des paiements

### CRM
- `crm:read` - Voir les contacts
- `crm:create` - Créer des contacts
- `crm:update` - Modifier des contacts
- `crm:delete` - Supprimer des contacts
- `crm:export` - Exporter des contacts

### Banking
- `banking:read` - Voir les comptes bancaires
- `banking:sync` - Synchroniser les banques
- `banking:reconcile` - Rapprocher les comptes

### Tax
- `tax:read` - Voir les déclarations
- `tax:create` - Créer des déclarations
- `tax:submit` - Soumettre des déclarations

### Reports
- `reports:read` - Voir les rapports
- `reports:export` - Exporter les rapports

### Settings
- `settings:read` - Voir les paramètres
- `settings:update` - Modifier les paramètres

### Users
- `users:read` - Voir les utilisateurs
- `users:create` - Créer des utilisateurs
- `users:update` - Modifier des utilisateurs
- `users:delete` - Supprimer des utilisateurs

### Roles
- `roles:read` - Voir les rôles
- `roles:create` - Créer des rôles
- `roles:update` - Modifier des rôles
- `roles:delete` - Supprimer des rôles

---

## 🎯 Rôles Suggérés

### 1. Admin (Super User)
Toutes les permissions

### 2. Comptable
- `accounting:*`
- `invoices:*`
- `payments:read`
- `banking:*`
- `tax:*`
- `reports:*`

### 3. Commercial
- `crm:*`
- `invoices:create`
- `invoices:read`
- `invoices:send`
- `reports:read`

### 4. Gestionnaire
- `invoices:*`
- `payments:*`
- `crm:read`
- `reports:*`

### 5. Consultant (Read-only)
- `accounting:read`
- `invoices:read`
- `payments:read`
- `crm:read`
- `reports:read`

---

## 🔧 Créer des Rôles via API

```typescript
// Créer un rôle "Comptable"
const role = await rbacService.createRole(
  'Comptable',
  companyId,
  [
    'accounting:read',
    'accounting:create',
    'accounting:update',
    'invoices:read',
    'invoices:create',
    'reports:read',
  ],
  'Rôle pour les comptables'
);

// Assigner le rôle à un utilisateur
user.roles = [role];
await userRepository.save(user);
```

---

## 🧪 Tester

```bash
# 1. Lancer les migrations
npm run typeorm migration:run

# 2. Seed les permissions
npm run seed

# 3. Créer un rôle de test
curl -X POST http://localhost:3001/api/v1/roles \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Comptable",
    "permissionIds": ["permission-id-1", "permission-id-2"]
  }'

# 4. Tester l'accès
curl -X POST http://localhost:3001/api/v1/invoices \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "amount": 1000 }'
```

---

## ⚠️ Important

1. **Super Admin Bypass**: Les users avec `role === 'admin'` ont accès à tout
2. **Permissions Cumulatives**: Un user peut avoir plusieurs rôles
3. **Company Isolation**: Les rôles sont isolés par `companyId`
4. **Audit Automatique**: Toutes les actions sensibles sont loggées

---

## 📝 TODO

- [ ] Créer endpoints REST pour gérer les rôles
- [ ] Créer UI pour assigner les permissions
- [ ] Ajouter cache Redis pour les permissions
- [ ] Implémenter permission inheritance (rôles hiérarchiques)
- [ ] Ajouter permissions dynamiques (ex: "own_invoices:update")
