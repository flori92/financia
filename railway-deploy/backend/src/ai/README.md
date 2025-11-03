# 🤖 Module OCR Hybride - Google Vision + OCR Space

## 📋 Vue d'ensemble

Ce module implémente un système d'**extraction OCR hybride** qui combine deux providers pour une fiabilité maximale :

1. **Google Cloud Vision API** (Prioritaire) - Haute qualité, 95%+ accuracy
2. **OCR Space API** (Fallback) - Backup gratuit si Google échoue

## 🎯 Stratégie Hybride

```
┌─────────────────────────────────────────┐
│  1. Tentative Google Vision (Primary)  │
│     ✓ Haute qualité                    │
│     ✓ Score confiance détaillé         │
│     ✓ 1000 docs gratuits/mois          │
└─────────────────────────────────────────┘
              ↓ (En cas d'échec)
┌─────────────────────────────────────────┐
│  2. Fallback OCR Space (Secondary)     │
│     ✓ Backup fiable                    │
│     ✓ Gratuit tier disponible          │
│     ✓ Engine 2 optimisé documents      │
└─────────────────────────────────────────┘
```

## 🔧 Configuration

### Variables d'environnement (.env)

```bash
# Google Cloud Vision API (Primary)
GOOGLE_VISION_API_KEY=AIzaSyDZ61ADn2_QzLw7ZkceKIZw8OoOYL5Fq3Q

# OCR Space API (Fallback - Optionnel)
OCR_SPACE_API_KEY=your-ocr-space-key-here
```

### Installation dépendances

```bash
npm install axios form-data multer
```

## 🚀 Utilisation

### Endpoint Principal

**POST** `/api/v1/ai/ocr/:type`

Types supportés :
- `invoice` - Factures fournisseurs
- `receipt` - Reçus de caisse
- `bank_statement` - Relevés bancaires

### Exemple avec cURL

```bash
# Extraire une facture
curl -X POST http://localhost:3001/api/v1/ai/ocr/invoice \
  -H "Content-Type: multipart/form-data" \
  -F "file=@facture.jpg"
```

### Exemple avec JavaScript (Frontend)

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/v1/ai/ocr/invoice', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
// {
//   success: true,
//   provider: 'google-vision',
//   confidence: 0.94,
//   data: {
//     invoiceNumber: 'F2025-001',
//     supplierName: 'FOURNISSEUR EXEMPLE',
//     total: 2500000,
//     ...
//   }
// }
```

## 📊 Formats Supportés

- **Images:** JPG, JPEG, PNG
- **Documents:** PDF (première page)
- **Taille max:** 10 MB

## 🎨 Structure des Données Extraites

### Facture (invoice)

```json
{
  "invoiceNumber": "F2025-001",
  "date": "2025-11-03",
  "supplierName": "FOURNISSEUR EXEMPLE SARL",
  "total": 2500000,
  "subtotal": 2083333,
  "vatAmount": 416667,
  "currency": "XOF",
  "items": [
    {
      "description": "Produit A",
      "quantity": 10,
      "unitPrice": 125000,
      "total": 1250000
    }
  ]
}
```

### Reçu (receipt)

```json
{
  "merchant": "SUPERMARCHE EXEMPLE",
  "date": "2025-11-03",
  "time": "14:30",
  "total": 15000,
  "subtotal": 12500,
  "tax": 2500,
  "currency": "XOF",
  "paymentMethod": "Carte bancaire",
  "items": [...]
}
```

### Relevé bancaire (bank_statement)

```json
[
  {
    "date": "2025-10-29",
    "description": "Virement client ABC",
    "amount": 500000,
    "type": "credit",
    "balance": 2500000
  },
  {
    "date": "2025-10-31",
    "description": "Paiement fournisseur XYZ",
    "amount": 200000,
    "type": "debit",
    "balance": 2300000
  }
]
```

## 📈 Statistiques & Monitoring

### GET `/api/v1/ai/ocr/stats`

Retourne les statistiques d'utilisation :

```json
{
  "success": true,
  "stats": {
    "googleSuccess": 145,
    "googleFailed": 5,
    "ocrSpaceSuccess": 3,
    "ocrSpaceFailed": 1,
    "googleRate": 0.97,
    "ocrSpaceRate": 0.75
  }
}
```

### POST `/api/v1/ai/ocr/test`

Test de configuration :

```bash
curl -X POST http://localhost:3001/api/v1/ai/ocr/test
```

Réponse :
```json
{
  "success": true,
  "message": "Configuration OCR valide",
  "config": {
    "googleVision": true,
    "ocrSpace": false
  },
  "stats": {...}
}
```

## 🔍 Extractors Intelligents

Le service inclut des extractors spécialisés pour l'Afrique :

### Numéros de facture
```javascript
// Patterns reconnus
"Facture N° F2025-001"
"Invoice: INV-123456"
"N° 2025/001/AB"
```

### Montants FCFA/XOF
```javascript
// Formats supportés
"Total: 2 500 000 FCFA"
"Montant TTC: 1.500.000 XOF"
"Total 3500000 CFA"
```

### Dates
```javascript
// Formats acceptés
"01/11/2025"
"2025-11-01"
"01-11-2025"
```

## 💰 Coûts

### Google Cloud Vision
- **Gratuit:** 1000 documents/mois
- **Payant:** $1.50 / 1000 documents
- **Recommandé pour:** Production

### OCR Space
- **Gratuit:** 25000 requêtes/mois
- **Limitations:** Qualité inférieure, pas de score confiance
- **Recommandé pour:** Fallback uniquement

## 🛠️ Debugging

### Activer les logs détaillés

Les logs sont automatiques dans la console :

```
[OCR] Extraction invoice - facture.jpg
[OCR] Tentative Google Vision...
[OCR] ✅ Google Vision réussi
[OCR] Parsing invoice...
```

### Tester manuellement

```javascript
const OCRService = require('./ocr.service');
const fs = require('fs');

const ocrService = new OCRService();
const imageBuffer = fs.readFileSync('facture.jpg');

ocrService.extractDocument(imageBuffer, 'invoice', 'facture.jpg')
  .then(result => console.log(result))
  .catch(error => console.error(error));
```

## 🔒 Sécurité

### Bonnes pratiques

1. **Restrictions API Key Google:**
   - Restreindre aux IPs du serveur
   - Limiter à Cloud Vision API uniquement
   - Configurer des quotas

2. **Validation fichiers:**
   - Taille max 10 MB
   - Formats whitelist uniquement
   - Scan antivirus recommandé

3. **Données sensibles:**
   - Ne pas logger les données extraites complètes
   - Supprimer fichiers temporaires
   - Anonymiser les logs

## 📚 Références

- [Google Cloud Vision API Docs](https://cloud.google.com/vision/docs)
- [OCR Space API Docs](https://ocr.space/ocrapi)
- [Multer File Upload](https://github.com/expressjs/multer)

## 🚀 Roadmap

- [ ] Support multi-pages PDF
- [ ] Cache résultats (Redis)
- [ ] Webhook notifications
- [ ] Custom training models
- [ ] Batch processing
- [ ] Azure Form Recognizer intégration

---

**Version:** 1.0.0  
**Dernière mise à jour:** 03 Nov 2025  
**Auteur:** BMS Team
