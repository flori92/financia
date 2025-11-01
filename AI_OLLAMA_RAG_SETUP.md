# 🤖 IA Ollama + RAG - Assistant Intelligent ERP

## 🎯 Vue d'ensemble

Votre ERP dispose maintenant d'une **vraie IA intelligente** basée sur vos données comptables réelles :

- ✅ **100% Gratuit** - Ollama open source
- ✅ **100% Local** - Vos données restent privées
- ✅ **Vraies analyses** - Accès direct à PostgreSQL
- ✅ **RAG (Retrieval Augmented Generation)** - Réponses contextualisées

## 🏗 Architecture

```
Question utilisateur
    ↓
OllamaRAGService (analyse la question)
    ↓
Récupération contexte depuis PostgreSQL
    ├─ Trésorerie (comptes 512, 531)
    ├─ TVA (comptes 4457, 4456)
    ├─ Résultats (classes 6, 7)
    ├─ Clients/Fournisseurs (411, 401)
    └─ Écritures récentes
    ↓
Prompt enrichi avec contexte réel
    ↓
Ollama (modèle Qwen2.5:7b)
    ↓
Réponse intelligente personnalisée
```

## 📦 Composants

### **1. Modèle IA : Qwen2.5:7b**

**Pourquoi Qwen2.5** :
- ⭐ Excellent pour le français
- ⭐ Spécialisé en analyse financière
- ⭐ 7B paramètres = rapide et précis
- ⭐ 4096 tokens de contexte

**Modèles alternatifs disponibles** :
```bash
# Si besoin de plus de puissance
ollama pull qwen2.5:14b    # Meilleur mais plus lent

# Si mémoire limitée
ollama pull mistral:7b     # Très bon aussi

# Si anglais principalement
ollama pull llama3.1:8b    # Excellent généraliste
```

### **2. OllamaRAGService**

**Localisation** : `bms/api-gateway/src/ai/services/ollama-rag.service.ts`

**Fonctionnalités** :

#### **Analyse contextuelle intelligente**
L'IA détecte automatiquement le contexte nécessaire :

```typescript
// Question sur trésorerie
"Quelle est ma situation de trésorerie ?"
→ Récupère soldes banque (512) + caisse (531)
→ Calcule évolution 3 derniers mois
→ Génère analyse personnalisée

// Question sur TVA
"Combien de TVA je dois payer ?"
→ Récupère TVA collectée (4457)
→ Récupère TVA déductible (4456)
→ Calcule TVA nette
→ Donne montant exact avec détails

// Question sur résultats
"Est-ce que mon entreprise est rentable ?"
→ Analyse écritures classe 7 (produits)
→ Analyse écritures classe 6 (charges)
→ Calcule résultat net et marge
→ Compare avec historique
```

#### **Contextes disponibles** :

1. **`getTreasuryContext()`** - Trésorerie
   - Solde banque + caisse
   - Nombre de comptes
   - Mouvements récents

2. **`getVATContext()`** - TVA
   - TVA collectée
   - TVA déductible
   - TVA nette à payer

3. **`getProfitLossContext()`** - Résultats
   - Produits du mois
   - Charges du mois
   - Résultat net
   - Marge %

4. **`getPartiesContext()`** - Clients/Fournisseurs
   - Créances clients
   - Dettes fournisseurs
   - Ratios

5. **`getRecentEntriesContext()`** - Écritures récentes
   - 5 dernières écritures
   - Dates et descriptions

6. **`getGeneralOverview()`** - Vue d'ensemble
   - Total écritures
   - Total comptes
   - Infos système

## 🚀 Utilisation

### **1. Via l'interface chat**

Accédez à `/ai/chat` et posez vos questions :

**Exemples de questions** :

```
💰 Trésorerie
"Quelle est ma trésorerie actuelle ?"
"Ai-je assez de liquidités ?"
"Compare ma trésorerie avec le mois dernier"

📊 TVA & Fiscalité
"Combien de TVA je dois payer ce mois ?"
"Calcule ma déclaration de TVA"
"Quelle est ma TVA collectée ?"

📈 Résultats
"Mon entreprise est-elle rentable ?"
"Quel est mon résultat net ce mois ?"
"Quelle est ma marge actuelle ?"

👥 Clients & Fournisseurs
"Combien mes clients me doivent ?"
"Quelles sont mes dettes fournisseurs ?"
"Qui sont mes plus gros clients ?"

📝 Comptabilité
"Montre-moi mes dernières écritures"
"Y a-t-il des écritures en brouillon ?"
"Résume mon activité comptable"

🔍 Analyses complexes
"Analyse ma situation financière globale"
"Quels sont mes risques financiers ?"
"Donne-moi des recommandations pour améliorer ma trésorerie"
```

### **2. Via l'API**

```bash
curl -X POST http://localhost:3001/api/v1/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Quelle est ma trésorerie actuelle ?",
    "context": {
      "companyId": "1805bc61-7cfd-44e9-8a63-17187bf05dc7"
    }
  }'
```

**Réponse exemple** :
```json
{
  "response": "Voici votre situation de trésorerie actuelle :

💰 SOLDE DISPONIBLE: 125,450.00 FCFA
- Banque (compte 512): 120,000.00 FCFA
- Caisse (compte 531): 5,450.00 FCFA

📊 ÉVOLUTION:
Sur les 3 derniers mois, vous avez enregistré 247 mouvements de trésorerie.

✅ ANALYSE:
Votre trésorerie est saine. Le ratio banque/caisse (95%/5%) est optimal.

💡 RECOMMANDATIONS:
1. Surveillez vos échéances de paiement à venir
2. Maintenez un coussin de sécurité de 30 jours de charges
3. Utilisez le module de prévision de trésorerie pour anticiper"
}
```

## ⚙️ Configuration

### **Variables d'environnement** (optionnel)

```env
# Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5:7b

# IA Settings
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=4096
```

### **Paramètres du modèle**

Dans `ollama-rag.service.ts` :

```typescript
const response = await this.ollama.generate({
  model: 'qwen2.5:7b',
  prompt: prompt,
  options: {
    temperature: 0.7,      // Créativité (0.0-1.0)
    top_p: 0.9,           // Diversité
    num_ctx: 4096,        // Taille contexte
  },
});
```

**Ajuster pour vos besoins** :
- `temperature: 0.3` → Réponses plus précises, moins créatives
- `temperature: 0.9` → Réponses plus créatives, moins strictes
- `num_ctx: 8192` → Contexte plus large (plus lent)

## 📊 Performance

### **Temps de réponse typiques**

| Type de question | Contexte | IA | Total |
|-----------------|----------|-----|-------|
| Trésorerie simple | 50ms | 2-3s | ~3s |
| TVA calcul | 80ms | 2-4s | ~4s |
| Analyse complexe | 150ms | 4-6s | ~6s |

### **Ressources**

- **RAM** : ~2GB pour le modèle 7B
- **CPU** : Optimisé pour Apple Silicon (M1/M2/M3)
- **Stockage** : ~4.5GB pour qwen2.5:7b

## 🔧 Maintenance

### **Vérifier le status d'Ollama**

```bash
# Vérifier si Ollama tourne
ollama list

# Logs
tail -f /tmp/ollama.log

# Redémarrer si nécessaire
killall ollama
ollama serve
```

### **Mettre à jour le modèle**

```bash
# Mettre à jour qwen2.5
ollama pull qwen2.5:7b

# Essayer un nouveau modèle
ollama pull qwen2.5:14b

# Supprimer un modèle
ollama rm qwen2.5:7b
```

### **Optimiser les performances**

```bash
# Limiter la RAM utilisée
OLLAMA_MAX_LOADED_MODELS=1 ollama serve

# Utiliser GPU si disponible (automatique sur Mac)
OLLAMA_METAL=1 ollama serve
```

## 🐛 Dépannage

### **Problème : Ollama ne répond pas**

```bash
# Vérifier si Ollama tourne
ps aux | grep ollama

# Démarrer Ollama
ollama serve &

# Tester
ollama run qwen2.5:7b "Bonjour"
```

### **Problème : Réponses lentes**

1. **Réduire le contexte** :
```typescript
num_ctx: 2048  // Au lieu de 4096
```

2. **Modèle plus léger** :
```bash
ollama pull mistral:7b
```

3. **Précharger le modèle** :
```bash
ollama run qwen2.5:7b ""
# Garde le modèle en mémoire
```

### **Problème : Erreurs de connexion DB**

Vérifiez que les entités sont bien importées :
```typescript
// ai.module.ts
TypeOrmModule.forFeature([
  JournalEntry,
  JournalEntryLine,
  Account,
])
```

## 🎯 Feuille de route

### **Phase 1 - Actuel ✅**
- [x] RAG de base avec contexte comptable
- [x] Analyses trésorerie, TVA, résultats
- [x] Intégration chat UI

### **Phase 2 - Prochainement**
- [ ] Détection d'anomalies automatique
- [ ] Prédictions de trésorerie ML
- [ ] Recommandations fiscales personnalisées
- [ ] Export des analyses en PDF

### **Phase 3 - Futur**
- [ ] Multi-langues (EN, ES, etc.)
- [ ] Voice assistant
- [ ] Analyse avancée avec graphiques
- [ ] Intégration bancaire temps réel

## 💡 Cas d'usage avancés

### **1. Alertes proactives**

```typescript
// Créer un endpoint qui analyse quotidiennement
async getDailyAlerts(companyId: string) {
  const alerts = [];
  
  // Vérifier liquidité
  const treasuryContext = await this.getTreasuryContext(companyId);
  const prompt = `Analyse cette trésorerie et génère des alertes si nécessaire:
${treasuryContext}`;
  
  const response = await this.ollama.generate({...});
  alerts.push(response.response);
  
  return alerts;
}
```

### **2. Rapports automatiques**

```typescript
// Générer rapport mensuel intelligent
async generateMonthlyReport(companyId: string) {
  const context = await this.getFullMonthContext(companyId);
  const prompt = `Génère un rapport comptable mensuel professionnel basé sur:
${context}

Format: Introduction, KPIs, Analyses, Recommandations`;

  return await this.ollama.generate({...});
}
```

### **3. Conseiller fiscal**

```typescript
// Optimisations fiscales personnalisées
async getTaxOptimizations(companyId: string) {
  const vatContext = await this.getVATContext(companyId);
  const plContext = await this.getProfitLossContext(companyId);
  
  const prompt = `En tant qu'expert fiscal, analyse ces données et suggère des optimisations:
${vatContext}
${plContext}`;

  return await this.ollama.generate({...});
}
```

## 📞 Support

- **Documentation Ollama** : https://ollama.ai/
- **Documentation Qwen2.5** : https://qwenlm.github.io/
- **Issues GitHub** : Créez une issue dans le repo

---

🎉 **Votre ERP dispose maintenant d'une vraie IA intelligente basée sur vos données réelles !**

Profitez d'analyses personnalisées, de réponses contextuelles et de recommandations actionnables, le tout gratuitement et en local.
