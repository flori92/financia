# 🏢 PROFILS BMS - Hiérarchie & Permissions

## 📋 Rôles et Hiérarchie

### **1. EXPERT-COMPTABLE** 👨‍💼 *(Super Admin)*
**Peut faire TOUT ce que les autres peuvent faire + en plus**
- ✅ Accès COMPLET à tous les modules
- ✅ Gestion multi-clients
- ✅ Audit et validation
- ✅ Configuration avancée
- ✅ Export et reporting complet

**Modules:**
- 📊 **Comptabilité** (100% - module maître)
- 💰 **Trésorerie** (100%)
- 🏦 **Banque** (100% - rapprochement)
- 🏛️ **Fiscal** (100% - déclarations)
- 💼 **Entrepreneur** (vue expert)
- 📧 **Communications** (100%)
- 📦 **Stock** (100%)
- 🧾 **Factures** (100%)
- 🛒 **Achats** (100%)
- 💸 **Ventes** (100%)
- 👥 **CRM** (100%)
- 👤 **RH** (100%)
- 📋 **Projets** (100%)
- 🏭 **Manufacturing** (100%)

---

### **2. ENTREPRENEUR** 🚀 *(Business Owner)*
**Vue simplifiée, focus sur l'opérationnel**
- ✅ Dashboard KPIs business
- ✅ Gestion quotidienne
- ✅ Pas d'accès configuration avancée
- ✅ Pas d'audit/validation

**Modules autorisés:**
- 📊 **Comptabilité** (vue simplifiée - PAS de configuration)
- 💰 **Trésorerie** (vue KPIs - PAS de rapprochement)
- 💼 **Dashboard Entrepreneur** (vue principale)
- 📧 **Communications** (envoi limité)
- 📦 **Stock** (consultation)
- 🧾 **Factures** (création/envoi)
- 🛒 **Achats** (demandes)
- 💸 **Ventes** (devis/commandes)
- 👥 **CRM** (gestion clients)
- 📋 **Projets** (consultation)

**Modules INTERDITS:**
- ❌ **Banque** (rapprochement expert-only)
- ❌ **Fiscal** (déclarations expert-only)
- ❌ **RH** (paie expert-only)
- ❌ **Manufacturing** (expert-only)

---

### **3. BANQUE** 🏦 *(Bank Partner)*
**Vue limitée aux opérations bancaires**
- ✅ Consultation soldes
- ✅ Validation transactions
- ❌ Pas d'accès interne entreprise

**Modules autorisés:**
- 🏦 **Bank Partner** (vue principale)
- 📊 **Comptabilité** (consultation soldes SEULEMENT)
- 💰 **Trésorerie** (consultation soldes SEULEMENT)

**Modules INTERDITS:**
- ❌ **Entrepreneur** (trop interne)
- ❌ **Fiscal** (confidentiel)
- ❌ **Communications** (privé)
- ❌ **Stock, Factures, Achats, Ventes, CRM, RH, Projets**

---

### **4. ADMINISTRATION FISCALE** 🏛️ *(Tax Authority)*
**Vue limitée aux déclarations fiscales**
- ✅ Consultation déclarations
- ✅ Validation TVA/Impôts
- ❌ Pas d'accès opérations internes

**Modules autorisés:**
- 🏛️ **Tax Admin** (vue principale)
- 📊 **Comptabilité** (consultation rapports fiscaux SEULEMENT)
- 💰 **Trésorerie** (consultation flux SEULEMENT)

**Modules INTERDITS:**
- ❌ **Entrepreneur** (confidentiel)
- ❌ **Banque** (opérations privées)
- ❌ **Communications** (privé)
- ❌ **Stock, Factures, Achats, Ventes, CRM, RH, Projets**

---

## 🔐 Contrôles d'accès à implémenter

### **Par page/component:**
```typescript
// Hook de permissions
const { userRole, canAccess } = usePermissions();

// Dans chaque page
if (!canAccess('banking', userRole)) {
  return <UnauthorizedPage />;
}
```

### **Par fonctionnalité:**
```typescript
// Boutons/actions conditionnels
{userRole === 'expert-comptable' && (
  <Button>Configuration avancée</Button>
)}

{['expert-comptable', 'entrepreneur'].includes(userRole) && (
  <Button>Créer facture</Button>
)}
```

---

## 📊 Matrice des permissions

| Module | Expert | Entrepreneur | Banque | Fiscal |
|--------|--------|--------------|---------|---------|
| Comptabilité | ✅✅✅ | 👁️ | 👁️💰 | 👁️📋 |
| Trésorerie | ✅✅✅ | 👁️ | 👁️💰 | 👁️💰 |
| Banque | ✅✅✅ | ❌ | ✅ | ❌ |
| Fiscal | ✅✅✅ | ❌ | ❌ | ✅ |
| Entrepreneur | ✅✅✅ | ✅ | ❌ | ❌ |
| Communications | ✅✅✅ | 📧 | ❌ | ❌ |
| Stock | ✅✅✅ | 👁️ | ❌ | ❌ |
| Factures | ✅✅✅ | 📝 | ❌ | ❌ |
| Achats | ✅✅✅ | 📝 | ❌ | ❌ |
| Ventes | ✅✅✅ | 📝 | ❌ | ❌ |
| CRM | ✅✅✅ | 👥 | ❌ | ❌ |
| RH | ✅✅✅ | ❌ | ❌ | ❌ |
| Projets | ✅✅✅ | 👁️ | ❌ | ❌ |

**Légende:**
- ✅✅✅ = Accès complet (lecture + écriture + configuration)
- 👁️ = Lecture seule
- 💰 = Consultation soldes/flux
- 📝 = Création/édition limitée
- 📧 = Envoi limité
- 👥 = Gestion limitée
- ❌ = Accès interdit

---

## 🎯 Actions immédiates

### **1. Créer hook de permissions**
```typescript
// hooks/usePermissions.ts
export const usePermissions = () => {
  const { userRole } = useAuth();
  
  const canAccess = (module: string, action: string = 'read') => {
    // Logique de vérification
  };
  
  return { userRole, canAccess };
};
```

### **2. Protéger les routes**
```typescript
// middleware de route
if (!canAccessModule(module, userRole)) {
  redirect('/unauthorized');
}
```

### **3. Cacher/masquer les fonctionnalités**
- Boutons configuration (expert-only)
- Actions sensibles (expert-only)
- Vues confidentielles (profil-specific)

### **4. Sidebar dynamique**
- Afficher seulement les liens autorisés
- Icônes différentes selon profil
- Messages "accès limité"

---

## 🚨 Problèmes actuels détectés

### **Pages à corriger:**
1. **Entrepreneur** - Affiche trop de fonctionnalités expert
2. **Bank Partner** - Accès potentiel à modules internes
3. **Tax Admin** - Vue trop large
4. **Sidebar** - Mêmes liens pour tous les profils

### **Solutions:**
- Ajouter guards de permission
- Créer sidebars par profil
- Limiter les données exposées
- Messages "accès limité" clairs

---

**Prochaine étape:** Implémenter les contrôles d'accès et sidebars spécifiques
