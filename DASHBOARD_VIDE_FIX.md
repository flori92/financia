# 🔧 Solution: Dashboard Vide (0 FCFA partout)

## 🎯 Problème Identifié

Votre dashboard affiche "0 FCFA" partout et aucun graphe n'apparaît, même après avoir inséré des données dans la base.

**Captures d'écran du problème:**
- Comptabilité générale: 0 FCFA
- Trésorerie nette: 0 FCFA  
- CA 2025: 0 FCFA
- Résultat net: 0 FCFA
- Graphes vides

---

## 🔍 Cause Racine

Le dashboard ne reçoit **AUCUN `companyId`** lors des appels API, donc le backend ne sait pas quelle société charger.

**Pourquoi ?**

Incohérence dans le stockage localStorage :
```typescript
// Ancien code (f83ade2191) stockait :
localStorage.setItem('company_id', companyId);  // Avec underscore

// Mais getCompanyId() cherchait :
localStorage.getItem('companyId');  // Sans underscore ❌

// Résultat : undefined ! Aucune donnée chargée.
```

---

## ✅ Solutions Appliquées

### 1. **Fix Immédiat** (Commit 902cb50d8a)

**Fichier:** `railway-deploy/frontend/src/lib/api.ts`

```typescript
export function getCompanyId() {
  // ...
  if (typeof window !== 'undefined') {
    // ✅ Cherche d'abord le nouveau format, fallback sur l'ancien
    return window.localStorage.getItem('companyId') || 
           window.localStorage.getItem('company_id') || 
           undefined;
  }
  return undefined;
}
```

**Résultat:** Compatibilité totale avec les deux formats !

---

### 2. **Stockage au Login**

**Fichier:** `railway-deploy/frontend/src/app/login/page.tsx`

```typescript
if (data.user?.companyId) {
  // Stocke dans le nouveau format
  window.localStorage.setItem("companyId", data.user.companyId);
}
```

---

## 🚀 Comment Résoudre Maintenant

### **Option 1: Redéployer et Se Reconnecter** (Recommandé)

1. **Déployer le fix sur Railway:**
   ```bash
   # Frontend
   cd railway-deploy/frontend
   railway up
   ```

2. **Sur le site en production:**
   - Se déconnecter
   - Se reconnecter
   - ✅ Le `companyId` sera maintenant stocké correctement
   - ✅ Le dashboard affichera les données

---

### **Option 2: Fix Manuel Immédiat** (Sans Redéploiement)

**Dans la console navigateur (F12):**

```javascript
// 1. Récupérer votre companyId depuis les user_data
const userData = JSON.parse(localStorage.getItem('user_data'));
console.log('CompanyId:', userData.companyId);

// 2. Stocker dans les deux formats
localStorage.setItem('companyId', userData.companyId);
localStorage.setItem('company_id', userData.companyId);

// 3. Recharger la page
location.reload();

// ✅ Le dashboard devrait maintenant afficher les données !
```

---

### **Option 3: Vérifier que l'Utilisateur a un CompanyId**

Si même après reconnexion le dashboard reste vide :

**1. Vérifier dans PostgreSQL Railway:**

```sql
-- Connectez-vous à la base PostgreSQL
SELECT id, email, company_id 
FROM users 
WHERE email = 'votre@email.com';
```

**2. Si `company_id` est NULL:**

```sql
-- Trouver une société
SELECT id, name FROM companies LIMIT 1;

-- Assigner l'utilisateur à cette société
UPDATE users 
SET company_id = 'UUID_DE_LA_SOCIETE' 
WHERE email = 'votre@email.com';
```

**3. Utiliser le script SQL fourni:**

```bash
# Fichier: scripts/fix-user-company.sql
# Contient toutes les requêtes de diagnostic et correction
```

---

## 🧪 Test Après Déploiement

### **Checklist de Vérification:**

```javascript
// 1. Console navigateur (F12)
localStorage.getItem('companyId')
// ✅ Devrait retourner: "uuid-de-votre-societe"
// ❌ Ne doit PAS retourner: null ou undefined

// 2. Vérifier les appels API
// Network tab → Filtrer "dashboard/metrics"
// URL devrait contenir: ?companyId=uuid...

// 3. Vérifier la réponse
// Response devrait contenir:
// { kpiMonth: { revenue: 123456, ... }, ... }
// ❌ PAS: { kpiMonth: { revenue: 0, ... } }
```

---

## 📊 Vérifier que la Base a des Données

### **1. Vérifier les Écritures Comptables:**

```sql
SELECT COUNT(*) as total_entries
FROM journal_entries 
WHERE company_id = 'VOTRE_COMPANY_ID'
  AND status = 'posted';
```

**Si 0 résultats:** Vous devez créer des données !

### **2. Créer des Données de Test:**

```bash
# Script fourni
./scripts/generate-test-data.sh

# Ou manuellement via l'interface
# → Comptabilité → Plan Comptable → Initialiser SYSCOHADA
# → Comptabilité → Journal → Créer une écriture
```

---

## 🎯 Résumé de la Solution

| Problème | Solution |
|----------|----------|
| Dashboard vide (0 FCFA) | ✅ Fix compatibilité localStorage |
| getCompanyId() → undefined | ✅ Fallback 'company_id' ajouté |
| Données pas chargées | ✅ companyId maintenant transmis |
| Backend reçoit companyId: undefined | ✅ Résolu après reconnexion |

---

## 🚨 Si le Problème Persiste

### **Diagnostic Avancé:**

```bash
# 1. Exécuter le script de diagnostic
./scripts/check-company-data.sh

# 2. Vérifier les logs Railway
railway logs --service=backend

# 3. Chercher les erreurs:
# "CompanyId non disponible"
# "User not associated with any company"
```

### **Contacter le Support:**

Fournir:
1. Email de l'utilisateur
2. Screenshot console (F12) avec localStorage
3. Screenshot Network tab (appels API)
4. Logs backend Railway

---

## ✅ Commits Appliqués

```bash
✅ 902cb50d8a - Fix compatibilité companyId localStorage
✅ 0966b1ec41 - Scripts diagnostic (check-company-data.sh, fix-user-company.sql)
```

---

## 🎉 Résultat Final

Après le fix :
- ✅ Dashboard affiche les vraies données
- ✅ Graphes "Évolution trésorerie & CA" remplis
- ✅ KPI avec valeurs réelles (pas 0 FCFA)
- ✅ Transactions récentes visibles
- ✅ Alertes de trésorerie fonctionnelles

---

**🚀 Déployez le fix et reconnectez-vous pour profiter de vos données !**
