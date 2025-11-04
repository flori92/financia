# Architecture Portails Spécialisés BMS

## 🎯 Objectif
Créer des portails spécialisés par profil tout en préservant les 4 profils existants et en ajoutant les portails RH/Comptabilité.

## 🏗️ Architecture Backend

### Profils Existants (Préservés)
1. **Expert Comptable** - `/expert-comptable`
2. **Entrepreneur** - `/entrepreneur` 
3. **Banque** - `/banque`
4. **Administration Fiscale** - `/fiscal`

### Nouveaux Portails Spécialisés
5. **RH Manager** - `/hr`
6. **Comptabilité** - `/accounting`
7. **Manager** - `/manager`
8. **Employé** - `/employee`
9. **Admin** - `/admin`

## 📁 Structure Frontend

```
src/app/
├── (auth)/                    # Layout authentification
│   ├── login/
│   └── register/
├── expert-comptable/          # Portail Expert Comptable
│   ├── dashboard/
│   ├── accounting/
│   ├── tax/
│   └── reports/
├── entrepreneur/              # Portail Entrepreneur (existant)
│   ├── dashboard/
│   ├── treasury/
│   ├── formalization/
│   └── employees/
├── banque/                    # Portail Banque
│   ├── transactions/
│   ├── reconciliation/
│   └── transfers/
├── fiscal/                     # Portail Administration Fiscale
│   ├── vat/
│   ├── corporate-tax/
│   └── audit/
├── hr/                         # Portail RH (NOUVEAU)
│   ├── employees/
│   ├── timesheets/
│   ├── leave/
│   ├── payroll/
│   ├── transfers/
│   ├── documents/
│   └── analytics/
├── accounting/                 # Portail Comptabilité (NOUVEAU)
│   ├── dashboard/
│   ├── chart-of-accounts/
│   ├── journal/
│   ├── trial-balance/
│   ├── profit-loss/
│   ├── balance-sheet/
│   ├── vat/
│   ├── bank/
│   └── reports/
├── manager/                    # Portail Manager (NOUVEAU)
│   ├── team/
│   ├── timesheets/
│   ├── leave-approval/
│   └── team-analytics/
├── employee/                   # Portail Employé (NOUVEAU)
│   ├── profile/
│   ├── timesheets/
│   ├── leave-requests/
│   ├── payslips/
│   └── documents/
└── admin/                      # Portail Admin (NOUVEAU)
    ├── system/
    ├── users/
    ├── companies/
    └── all-modules/
```

## 🔧 Guards et Permissions

### ProfileGuard
```typescript
@Profiles(UserProfile.HR_MANAGER, UserProfile.ADMIN)
@UseGuards(JwtAuthGuard, ProfileGuard)
async hrOnlyEndpoint() { ... }
```

### UserRole + UserProfile
```typescript
// Mapping automatique rôle → profil → modules
const userModules = getModulesByRole(user.role);
const portalRoute = getPortalByRole(user.role);
```

## 🎛️ Navigation Dynamique

### Sidebar par Profil
```typescript
const getNavigationByProfile = (profile: UserProfile) => {
  const navigation = {
    [UserProfile.EXPERT_COMPTABLE]: ACCOUNTANT_NAV,
    [UserProfile.ENTREPRENEUR]: ENTREPRENEUR_NAV,
    [UserProfile.BANQUE]: BANKING_NAV,
    [UserProfile.ADMINISTRATION_FISCAL]: FISCAL_NAV,
    [UserProfile.HR_MANAGER]: HR_NAV,
    [UserProfile.ACCOUNTANT]: ACCOUNTING_NAV,
    [UserProfile.MANAGER]: MANAGER_NAV,
    [UserProfile.EMPLOYEE]: EMPLOYEE_NAV,
    [UserProfile.ADMIN]: ADMIN_NAV
  };
  
  return navigation[profile] || ENTREPRENEUR_NAV;
};
```

## 🔄 Router Middleware

### Redirection automatique par profil
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  
  if (token) {
    const user = await decodeJWT(token);
    const portalRoute = getPortalByRole(user.role);
    
    // Rediriger vers le bon portail
    if (request.nextUrl.pathname === '/login') {
      return NextResponse.redirect(new URL(portalRoute, request.url));
    }
  }
  
  return NextResponse.next();
}
```

## 🎨 Layouts Spécialisés

### Layout RH
```typescript
// hr/layout.tsx
export default function HRLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="hr-portal">
      <HRHeader />
      <HRSidebar />
      <main>{children}</main>
    </div>
  );
}
```

### Layout Comptabilité
```typescript
// accounting/layout.tsx
export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="accounting-portal">
      <AccountingHeader />
      <AccountingSidebar />
      <main>{children}</main>
    </div>
  );
}
```

## 📊 Modules Disponibles par Profil

### Expert Comptable
- ✅ Tableau de bord comptable
- ✅ Plan comptable SYSCOHADA
- ✅ Journal des écritures
- ✅ Balance de vérification
- ✅ Compte de résultat
- ✅ Bilan
- ✅ Balance âgée
- ✅ Déclaration TVA
- ✅ Clôture de période
- ✅ Rapprochement bancaire
- ✅ Automatisation comptable

### Entrepreneur
- ✅ Dashboard entreprise
- ✅ Trésorerie (prévisions, alertes)
- ✅ Formalisation NIF
- ✅ Gestion employés (vue globale)
- ✅ CRA/Timesheets (validation)
- ✅ Congés (validation)
- ✅ Paie (approbation)
- ✅ Virements (programmation)
- ✅ Documents (consultation)

### RH Manager
- ✅ Gestion complète employés
- ✅ CRA/Timesheets (validation)
- ✅ Congés (workflow complet)
- ✅ Paie (calcul + bulletins)
- ✅ Virements (Mobile Money)
- ✅ Coffret fort (validation)
- ✅ Analytics RH

### Comptabilité
- ✅ Dashboard comptable
- ✅ Plan comptable
- ✅ Journal et écritures
- ✅ États financiers
- ✅ TVA et déclarations
- ✅ Rapprochement bancaire
- ✅ Reporting

## 🚀 Avantages

1. **✅ Préservation profils existants** - Aucune régression
2. **✅ Code réutilisé à 100%** - Backend inchangé
3. **✅ Navigation contextuelle** - UI adaptée par profil
4. **✅ Sécurité granulaire** - Guards par profil
5. **✅ Évolutivité** - Ajout facile de nouveaux modules
6. **✅ Maintenance** - Architecture modulaire

## 📋 Implémentation

### Phase 1 (2-3 heures)
- ✅ Créer guards et decorators
- ✅ Mettre en place structure routes
- ✅ Layouts de base

### Phase 2 (3-4 heures)
- ✅ Navigation dynamique
- ✅ Redirection automatique
- ✅ Sidebar par profil

### Phase 3 (2-3 heures)
- ✅ Tests et validation
- ✅ Documentation
- ✅ Déploiement

**Total estimé : 7-10 heures**
