# 🔧 **SCRIPT DE CORRECTIONS AUTOMATIQUES**

## 📋 **Vue d'ensemble**

Script pour corriger automatiquement les problèmes critiques identifiés dans l'audit.

---

## 🚀 **Corrections à Appliquer Automatiquement**

### **1. Remplacer les CompanyId Hardcodés**

#### **Pattern à détecter:**
```typescript
const companyId = localStorage.getItem('bms_company_id') || 'demo-company-123';
const companyId = 'demo-company-123';
const companyId = 'company-1';
```

#### **Remplacer par:**
```typescript
import { useCompanyId } from '@/hooks/useCompanyId';
// ...
const companyId = useCompanyId();
```

#### **Fichiers à corriger:**
1. `/src/app/accountant/tax/vat/page.tsx` - Ligne ~25
2. `/src/app/accountant/chart-of-accounts/page.tsx` - Ligne ~22
3. `/src/app/accountant/general-ledger/page.tsx` - Ligne ~30
4. `/src/app/accountant/transactions/page.tsx` - Ligne ~18
5. `/src/app/budget/page.tsx` - Ligne ~35
6. `/src/app/settings/users/page.tsx` - Ligne ~15
7. `/src/app/accountant/cash-flow-coherence/page.tsx` - Ligne ~28
8. `/src/hooks/useAuth.ts` - Lignes 15,19,34,38

---

### **2. Ajouter SecurePage sur Routes Sensibles**

#### **Pattern à détecter:**
```typescript
export default function AccountantPage() {
  return (
    <div>
      {/* Contenu */}
    </div>
  );
}
```

#### **Remplacer par:**
```typescript
import { SecurePage } from '@/components/SecurePage';

export default function AccountantPage() {
  return (
    <SecurePage requiredProfile="accountant">
      <div>
        {/* Contenu */}
      </div>
    </SecurePage>
  );
}
```

#### **Fichiers à modifier:**
- Tous les fichiers dans `/src/app/accountant/*.tsx` (20+ fichiers)
- Tous les fichiers dans `/src/app/entrepreneur/*.tsx` (5+ fichiers)
- Tous les fichiers dans `/src/app/expert/*.tsx` (3+ fichiers)
- Tous les fichiers dans `/src/app/bank-partner/*.tsx` (2+ fichiers)
- Tous les fichiers dans `/src/app/tax-admin/*.tsx` (2+ fichiers)

---

### **3. Générer des IDs Dynamiques pour Mock Data**

#### **Pattern à détecter:**
```typescript
const mockData = [
  { id: '1', name: 'Item 1' },
  { id: '2', name: 'Item 2' }
];
```

#### **Remplacer par:**
```typescript
const mockData = [
  { id: crypto.randomUUID(), name: 'Item 1' },
  { id: crypto.randomUUID(), name: 'Item 2' }
];
```

---

### **4. Remplacer alert() par toast**

#### **Pattern à détecter:**
```typescript
alert('Message');
alert("Message");
```

#### **Remplacer par:**
```typescript
import { toast } from 'sonner';
// ...
toast.success('Message');
toast.error('Message'); // selon le contexte
toast.info('Message');
```

---

### **5. Ajouter Gestion d'Erreurs Complète**

#### **Pattern à détecter:**
```typescript
const loadData = async () => {
  const data = await apiGet('/endpoint');
  setData(data);
};
```

#### **Remplacer par:**
```typescript
const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await apiGet('/endpoint');
    setData(data);
  } catch (error) {
    const message = error instanceof Error 
      ? error.message 
      : 'Erreur lors du chargement des données';
    setError(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};
```

---

## 📝 **Liste de Contrôle pour Chaque Fichier**

### **Checklist Page Comptable:**
```typescript
// ✅ 1. Imports nécessaires
import { SecurePage } from '@/components/SecurePage';
import { useCompanyId } from '@/hooks/useCompanyId';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// ✅ 2. États requis
const [data, setData] = useState<DataType | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// ✅ 3. CompanyId dynamique
const companyId = useCompanyId();

// ✅ 4. Fonction de chargement avec gestion d'erreurs
const loadData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await apiClient.get('/endpoint', { companyId });
    setData(response.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur';
    setError(message);
    toast.error(message);
  } finally {
    setLoading(false);
  }
};

// ✅ 5. États de UI
if (loading) return <LoadingState />;
if (error) return <ErrorState message={error} />;
if (!data) return <EmptyState />;

// ✅ 6. Wrapper SecurePage
export default function Page() {
  return (
    <SecurePage requiredProfile="accountant">
      {/* Contenu */}
    </SecurePage>
  );
}
```

---

## 🔍 **Commandes de Recherche et Remplacement**

### **VSCode Find & Replace (Regex):**

#### **1. Trouver CompanyId hardcodé:**
```regex
const companyId = ['"](?:demo-company-123|company-1|1)['"];?
```

#### **2. Trouver alert():**
```regex
alert\(['"]([^'"]+)['"]\);?
```

#### **3. Trouver IDs hardcodés:**
```regex
\bid:\s*['"]1['"]\b
```

#### **4. Trouver fonctions sans try/catch:**
```regex
const \w+ = async \(\) => \{[\s\S]*?await[\s\S]*?\};\s*(?!.*catch)
```

---

## 🛠️ **Script Node.js pour Corrections Automatiques**

```javascript
// scripts/auto-fix.js
const fs = require('fs');
const path = require('path');

// Fonction pour corriger un fichier
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Remplacer companyId hardcodé
  const oldContent = content;
  content = content.replace(
    /const companyId = localStorage\.getItem\(['"]bms_company_id['"]\) \|\| ['"][^'"]+['"];?/g,
    "const companyId = useCompanyId();"
  );
  
  content = content.replace(
    /const companyId = ['"](?:demo-company-123|company-1|1)['"];?/g,
    "const companyId = useCompanyId();"
  );

  // 2. Ajouter import useCompanyId si nécessaire
  if (content !== oldContent && !content.includes('useCompanyId')) {
    const importLine = "import { useCompanyId } from '@/hooks/useCompanyId';\n";
    content = importLine + content;
    modified = true;
  }

  // 3. Remplacer alert() par toast
  content = content.replace(
    /alert\(['"]([^'"]+)['"]\);?/g,
    "toast.success('$1');"
  );

  // 4. Ajouter import toast si nécessaire
  if (content.includes('toast.') && !content.includes("from 'sonner'")) {
    const importLine = "import { toast } from 'sonner';\n";
    content = importLine + content;
    modified = true;
  }

  // 5. Remplacer IDs hardcodés
  content = content.replace(
    /\bid:\s*['"]1['"]/g,
    "id: crypto.randomUUID()"
  );

  if (content !== oldContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Corrigé: ${filePath}`);
    return true;
  }

  return false;
}

// Scanner tous les fichiers TypeScript
function scanDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let fixedCount = 0;

  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory() && !file.name.startsWith('.') && file.name !== 'node_modules') {
      fixedCount += scanDirectory(fullPath);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      if (fixFile(fullPath)) {
        fixedCount++;
      }
    }
  }

  return fixedCount;
}

// Lancer le script
const srcPath = path.join(__dirname, '../frontend/src');
console.log('🔍 Recherche des fichiers à corriger...\n');

const fixed = scanDirectory(srcPath);

console.log(`\n✨ Terminé! ${fixed} fichiers corrigés.`);
```

### **Utilisation:**
```bash
cd /Users/floriace/MERP/railway-deploy
node scripts/auto-fix.js
```

---

## ⚠️ **Avertissements**

1. **Backup:** Toujours faire un commit avant de lancer les corrections automatiques
2. **Review:** Vérifier manuellement les changements après le script
3. **Tests:** Lancer les tests après les corrections
4. **Build:** Vérifier que le build passe après les modifications

---

## 📊 **Progression Attendue**

Après l'exécution du script:
- ✅ 12 fichiers avec companyId corrigés
- ✅ 30+ fichiers avec alert() corrigés
- ✅ 50+ fichiers avec IDs dynamiques
- ✅ Imports ajoutés automatiquement
- ⚠️ Révision manuelle nécessaire pour les handlers

---

*Script généré le 4 Novembre 2025 - Corrections automatiques BMS v3.0*
