# 📄 Module OCR & Import/Export - Documentation Complète

**Date de création :** 1 novembre 2025
**Version :** 1.0.0
**Statut :** Production-ready (mode simulation)

---

## 🎯 Objectif

Implémentation complète d'un module OCR pour l'extraction automatique de données depuis des documents comptables (factures, reçus, relevés bancaires), ainsi que des fonctionnalités d'import/export CSV pour les données comptables.

---

## 📦 Composants Implémentés

### **Backend (NestJS)**

#### 1. **AIController** (`bms/api-gateway/src/ai/ai.controller.ts`)

**Endpoints OCR :**
- `POST /api/v1/ai/ocr/invoice` - Extraction de factures
- `POST /api/v1/ai/ocr/receipt` - Extraction de reçus
- `POST /api/v1/ai/ocr/bank-statement` - Extraction de relevés bancaires
- `GET /api/v1/ai/ocr/status` - Vérification du statut du service

**Fonctionnalités :**
- Upload multipart/form-data
- Validation fichiers (PDF, JPG, PNG)
- Documentation Swagger complète
- Gestion d'erreurs avec BadRequestException

**Exemple de requête :**
```bash
curl -X POST http://localhost:3001/api/v1/ai/ocr/invoice \
  -H "Content-Type: multipart/form-data" \
  -F "file=@facture.pdf"
```

**Réponse simulée :**
```json
{
  "invoiceNumber": "INV-2024-001",
  "date": "2024-11-01",
  "supplierName": "Acme Corp",
  "items": [...],
  "total": 240.00,
  "confidence": 0.95
}
```

#### 2. **AccountingController** (`bms/api-gateway/src/accounting/accounting.controller.ts`)

**Endpoints Export CSV :**
- `GET /api/v1/accounting/export/journal-entries` - Export écritures comptables
- `GET /api/v1/accounting/export/trial-balance` - Export balance de vérification
- `GET /api/v1/accounting/export/chart-of-accounts` - Export plan comptable

**Paramètres :**
- `companyId` (required)
- `startDate` (optional)
- `endDate` (optional)

**Format de réponse :**
```json
{
  "filename": "journal_2024-11-01.csv",
  "data": "date;entryNumber;description;...",
  "contentType": "text/csv"
}
```

**Helper CSV :**
```typescript
private convertToCSV(data: any[], columns: string[]): string
```
- Conversion automatique en format CSV
- Séparateur point-virgule (;)
- Échappement des chaînes contenant des délimiteurs

---

### **Frontend (React/Next.js)**

#### 1. **Page OCR Dédiée** (`bms-web/src/app/ai/ocr/page.tsx`)

**Fonctionnalités :**
- ✅ Sélection du type de document (facture, reçu, relevé bancaire)
- ✅ Upload drag & drop avec validation (JPG, PNG, PDF, max 10 Mo)
- ✅ Extraction OCR avec affichage des résultats structurés
- ✅ Indicateur de confiance (95%)
- ✅ Actions post-extraction (créer écriture, exporter JSON)
- ✅ Message d'information sur le mode simulation

**Interface utilisateur :**
- Design moderne avec Tailwind CSS
- 2 colonnes : upload à gauche, résultats à droite
- Gestion des états (uploading, error, success)
- Toast notifications

**Affichage résultats par type :**

**Facture :**
- N° facture, date, fournisseur, montant TTC
- Tableau des articles (description, qté, prix unitaire, total)
- Détail sous-total HT, TVA, total TTC

**Reçu :**
- Commerce, date, heure
- Liste des articles
- Sous-total, taxe, total, mode de paiement

**Relevé bancaire :**
- Tableau des transactions
- Date, description, montant (crédit/débit), solde

#### 2. **Page Journal Améliorée** (`bms-web/src/app/accountant/journal/page.tsx`)

**Nouvelles fonctionnalités :**
- ✅ Bouton "Import CSV" fonctionnel avec ImportButton
- ✅ Bouton "Export CSV" fonctionnel avec ExportButton
- ✅ Lien vers page OCR dédiée
- ✅ Parsing CSV automatique (détection headers)
- ✅ Téléchargement automatique du fichier CSV exporté

**Code import CSV :**
```typescript
const handleImport = async (file: File) => {
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());
  const headers = lines[0].split(';');
  const dataLines = lines.slice(1);
  // Traitement des données...
}
```

**Code export CSV :**
```typescript
const handleExport = async () => {
  const response = await fetch(
    `${API_URL}/accounting/export/journal-entries?companyId=${id}`
  );
  const result = await response.json();
  const blob = new Blob([result.data], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = result.filename;
  link.click();
}
```

#### 3. **Navigation (Sidebar)** (`bms-web/src/components/layout/ModernSidebar.tsx`)

**Nouveau menu :**
```
Intelligence Artificielle
  ├─ OCR Documents [Badge: NEW]
  ├─ Assistant virtuel [Badge: Bêta]
  └─ Prédictions
```

**Icônes :**
- Menu principal : Sparkles (✨)
- OCR : Scan
- Assistant : Activity
- Prédictions : TrendingUp

---

## 🚀 Utilisation

### **1. Extraction OCR depuis la page dédiée**

1. Accéder à `/ai/ocr`
2. Sélectionner le type de document
3. Glisser-déposer ou sélectionner un fichier
4. Cliquer sur "Lancer l'extraction OCR"
5. Consulter les résultats extraits
6. Créer une écriture comptable ou exporter en JSON

### **2. Import CSV dans le journal**

1. Accéder à `/accountant/journal`
2. Cliquer sur "Import CSV"
3. Sélectionner un fichier CSV avec format :
   ```csv
   date;entryNumber;description;reference;debit;credit
   2024-11-01;JE-001;Achat fournitures;REF-123;1000;0
   ```
4. Validation automatique et affichage des données importées

### **3. Export CSV depuis le journal**

1. Accéder à `/accountant/journal`
2. Cliquer sur "Export CSV"
3. Le fichier `journal_YYYY-MM-DD.csv` se télécharge automatiquement

---

## 🔧 Configuration

### **Variables d'environnement**

Backend (`.env`) :
```env
PORT=3001
NODE_ENV=development
```

Frontend :
```typescript
const API_URL = 'http://localhost:3001/api/v1';
```

### **Formats supportés**

**Upload OCR :**
- Images : JPG, JPEG, PNG
- Documents : PDF
- Taille max : 10 Mo

**Import CSV :**
- Encodage : UTF-8
- Séparateur : point-virgule (;)
- Header obligatoire

---

## 📊 Architecture Technique

### **Flow OCR**

```
Frontend Upload
    ↓
POST /api/v1/ai/ocr/{type}
    ↓
AIService.processDocument()
    ↓
OcrService.extract{Type}Data()
    ↓
Retour données structurées
    ↓
Affichage résultats
```

### **Flow Export CSV**

```
Frontend Click Export
    ↓
GET /api/v1/accounting/export/{type}
    ↓
AccountingService.generate{Type}()
    ↓
AccountingController.convertToCSV()
    ↓
Retour JSON {filename, data, contentType}
    ↓
Création Blob + Download automatique
```

---

## 🎨 Design Patterns

### **Backend**

- **Separation of Concerns** : Controllers, Services, DTOs séparés
- **Dependency Injection** : NestJS IoC container
- **API Documentation** : Swagger/OpenAPI
- **Error Handling** : Exceptions standardisées

### **Frontend**

- **Component Composition** : Composants réutilisables (ImportButton, ExportButton)
- **State Management** : React hooks (useState, useEffect, useMemo)
- **File Handling** : FileReader API, Blob API
- **UI/UX** : Tailwind CSS, Lucide Icons

---

## 🧪 Tests

### **Tests Backend (à implémenter)**

```bash
# Tests unitaires
npm test -- ai.controller.spec.ts
npm test -- accounting.controller.spec.ts

# Tests E2E
npm run test:e2e -- ocr.e2e-spec.ts
```

### **Tests Frontend (manuel)**

✅ Upload fichier PDF → Extraction réussie
✅ Upload fichier > 10 Mo → Erreur affichée
✅ Upload format non supporté → Erreur affichée
✅ Import CSV valide → Données chargées
✅ Export CSV → Fichier téléchargé
✅ Navigation vers page OCR → Page accessible

---

## 🚧 Limitations Actuelles

### **Mode Simulation**

⚠️ **L'extraction OCR utilise actuellement des données mock.**

**Intégrations futures :**
- Google Cloud Vision AI
- AWS Textract
- Azure Computer Vision
- Tesseract.js (local)

### **Import CSV**

- Pas de validation stricte du format
- Pas de mapping colonnes personnalisable
- Pas de prévisualisation avant import

### **Export CSV**

- Format fixe (non personnalisable)
- Pas de choix du séparateur
- Pas d'export Excel (.xlsx)

---

## 🔮 Roadmap

### **Phase 2 - Q1 2025**

- [ ] Intégration Google Vision AI / AWS Textract
- [ ] Validation avancée des données extraites
- [ ] Correction manuelle post-OCR
- [ ] Apprentissage automatique sur les factures récurrentes
- [ ] Détection automatique du fournisseur (base de données)

### **Phase 3 - Q2 2025**

- [ ] Import/Export Excel (.xlsx)
- [ ] Mapping colonnes personnalisable
- [ ] Templates d'import/export
- [ ] Batch processing (traitement lot)
- [ ] API Webhooks pour intégration externe

### **Phase 4 - Q3 2025**

- [ ] OCR manuscrit
- [ ] Multi-langues (anglais, arabe)
- [ ] Extraction de contrats
- [ ] Extraction de tickets de caisse (OCR mobile)
- [ ] Intégration mobile (React Native / Flutter)

---

## 📝 Notes de Développement

### **Commits**

- **Commit hash :** `d22d09a64d`
- **Message :** ✨ [FEAT] Module OCR complet + Import/Export CSV
- **Fichiers modifiés :** 5
- **Insertions :** +709 lignes
- **Branch :** clean-main

### **Stack Technique**

**Backend :**
- NestJS 10.x
- TypeScript 5.x
- TypeORM
- Swagger/OpenAPI
- Multer (file upload)

**Frontend :**
- React 18.x
- Next.js 14.x
- TypeScript 5.x
- Tailwind CSS 3.x
- Lucide React (icons)

---

## 🤝 Contribution

### **Standards de Code**

- ESLint + Prettier configurés
- Commits conventionnels (feat, fix, docs, etc.)
- Messages en français
- Documentation inline

### **Pull Requests**

1. Créer une branche feature/nom-fonctionnalite
2. Implémenter + tester
3. Mettre à jour la documentation
4. Créer PR vers clean-main
5. Code review + merge

---

## 📞 Support

**Issues :** Créer un ticket GitHub
**Questions :** Documentation interne
**Bugs :** Utiliser le template de bug report

---

**Développé avec ❤️ pour le projet BMS**

*Dernière mise à jour : 1 novembre 2025*
