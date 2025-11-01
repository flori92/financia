# 📄 OCR Configuration - Extraction Réelle de Documents

## 🎯 Aperçu

Le système OCR utilise maintenant **3 moteurs** en cascade pour garantir une extraction maximale :

1. **OCR.space API** (prioritaire) - Service cloud gratuit et fiable
2. **Tesseract.js** (fallback) - OCR local open-source  
3. **Simulation** (dernier recours) - Données mockées pour tests

## 🔧 Installation et Configuration

### 1. Dépendances requises

```bash
# Déjà installées dans le projet
npm install tesseract.js axios
```

### 2. Configuration OCR.space

**Option A - Clé gratuite (déjà configurée)**
```typescript
// Dans ocr.service.ts - déjà configuré
'apikey': 'helloworld' // 250 requêtes/mois gratuites
```

**Option B - Clé pro (pour production)**
```typescript
// Inscrivez-vous sur https://ocr.space/
'apikey': 'votre_clé_pro_ici'
```

## 📋 Formats supportés

### Documents acceptés
- **Images** : JPG, PNG, BMP, GIF (max 5MB)
- **PDF** : PDF avec du texte (max 5MB)
- **Langues** : Français, Anglais (et 100+ autres)

### Types de documents
- ✅ **Factures** : Extraction complète (numéro, dates, TVA, articles)
- ✅ **Reçus** : Extraction commerce, articles, montant
- ✅ **Relevés bancaires** : Extraction des transactions

## 🚀 Utilisation

### API Endpoint

```bash
POST /api/v1/ai/ocr/invoice
Content-Type: multipart/form-data

# Body: file (multipart)
```

### Réponse exemple

```json
{
  "invoiceNumber": "FA-2025-001",
  "date": "2025-01-15",
  "supplierName": "Fournisseur SARL",
  "totalAmount": 1200.00,
  "items": [
    {
      "description": "Produit A",
      "quantity": 2,
      "unitPrice": 500.00,
      "total": 1000.00
    }
  ],
  "confidence": 0.95,
  "ocrEngine": "ocr.space",
  "extractedAt": "2025-01-15T10:30:00Z"
}
```

### Moteurs de détection

```json
{
  "ocrEngine": "ocr.space",      // ✅ Meilleur précision
  "ocrEngine": "tesseract.js",   // ⚡ Local et rapide
  "ocrEngine": "simulation"      // 🧪 Mode démo
}
```

## 🎛 Personnalisation

### Ajouter des langues

```typescript
// Dans extractWithOCRSpace()
formData.append('language', 'fr'); // Français
// Options: 'en', 'es', 'de', 'it', 'pt', etc.
```

### Parser personnalisé

```typescript
// Dans parseInvoiceText()
private parseInvoiceText(text: string): any {
  // Ajouter vos règles de parsing personnifiées
  const customPatterns = {
    // Vos patterns spécifiques
  };
}
```

## 🔍 Monitoring

### Vérifier le statut

```bash
GET /api/v1/ai/ocr/status
```

### Logs

```typescript
// Les logs montrent le moteur utilisé
"OCR.space: Texte extrait avec confiance: 95%"
"Tesseract: Texte extrait avec confiance: 87%"
"OCR réel indisponible, utilisation mode simulation"
```

## 📊 Performance

### Temps de traitement moyen
- **OCR.space** : 2-5 secondes
- **Tesseract.js** : 5-15 secondes  
- **Simulation** : < 1 seconde

### Limits OCR.space gratuit
- 250 requêtes/mois
- 5MB par fichier
- 1 requête/seconde

## 🛠 Dépannage

### Problèmes courants

**1. "OCR.space API indisponible"**
```bash
# Vérifier la connexion internet
curl https://api.ocr.space/parse/image

# Utiliser Tesseract.js en fallback
# Automatic dans le code
```

**2. "Tesseract.js échoué"**
```bash
# Réinstaller les dépendances
npm rebuild tesseract.js

# Vérifier l'espace disque (nécessite ~100MB)
df -h
```

**3. Fichier non supporté**
```bash
# Vérifier le format et la taille
file document.pdf
ls -lh document.jpg

# Convertir si nécessaire
convert document.tiff document.jpg
```

## 🎯 Production

### Configuration production

```typescript
// environment variables
OCR_SPACE_API_KEY='votre_clé_pro'
OCR_TIMEOUT=30000
OCR_MAX_FILE_SIZE=5242880 // 5MB
```

### Monitoring

```typescript
// Ajouter des métriques
@Injectable()
export class OcrService {
  private readonly metrics = {
    ocrSpaceSuccess: 0,
    tesseractSuccess: 0,
    simulationUsed: 0
  };
}
```

## 📞 Support

- **Documentation OCR.space** : https://ocr.space/ocrapi/
- **Documentation Tesseract.js** : https://github.com/naptha/tesseract.js/
- **Issues du projet** : GitHub Issues

---

🎉 **Votre OCR est maintenant prêt pour la production !**

Utilisez OCR.space pour la meilleure précision, Tesseract.js comme fallback local, et la simulation pour les tests.
