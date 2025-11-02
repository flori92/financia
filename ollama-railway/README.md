# 🤖 Ollama + Llama sur Railway Pro Plan

Service dédié pour héberger Ollama avec Llama2 sur Railway.

## 📋 **Prérequis**

- ✅ Railway Pro Plan (32 GB RAM minimum)
- ✅ Projet Railway BMS existant

---

## 🚀 **Déploiement sur Railway**

### **Étape 1 : Pusher le Code**

```bash
cd /Users/floriace/MERP
git add ollama-railway/
git commit -m "🤖 Ajouter service Ollama pour Railway"
git push origin clean-main
```

### **Étape 2 : Créer le Service dans Railway**

1. Ouvrez votre projet Railway : https://railway.com/project/a003a9ae-d435-4d5a-a29a-f2d3f9c0f910
2. Cliquez **"+ New"**
3. Sélectionnez **"GitHub Repo"** → **flori92/financia**
4. **Root Directory** : `ollama-railway`
5. Cliquez **"Deploy Now"**

### **Étape 3 : Configuration**

Dans le service **ollama-llama** :

#### **Settings → Variables**
```
OLLAMA_HOST = 0.0.0.0
OLLAMA_ORIGINS = *
```

#### **Settings → Networking**
- Cliquez **"Generate Domain"**
- Copiez l'URL générée : `https://ollama-llama-production.up.railway.app`

#### **Settings → Resources** (Important !)
- **RAM** : 8 GB minimum (recommandé : 16 GB)
- **CPU** : 4 vCPU minimum

---

## 🔗 **Connecter le Backend**

### **Dans le service Backend Railway :**

1. **Settings → Variables**
2. Ajoutez :
   ```
   OLLAMA_HOST = https://ollama-llama-production.up.railway.app
   AI_ENABLED = true
   ```
3. **Redéployez** le backend

---

## 📊 **Modèles Disponibles**

Avec 32 GB RAM, vous pouvez utiliser :

| Modèle | RAM | Performance | Recommandé |
|--------|-----|-------------|------------|
| `llama2:7b` | ~8 GB | Rapide | ✅ Production |
| `llama2:13b` | ~16 GB | Équilibré | ✅ Meilleur qualité |
| `llama2:70b` | ~48 GB | Excellent | ❌ Trop lourd |
| `codellama:7b` | ~8 GB | Spécialisé code | ⭐ Pour le dev |

**Recommandation** : `llama2:13b` pour le meilleur équilibre qualité/performance avec 32 GB RAM.

---

## 🧪 **Tester l'API Ollama**

Une fois déployé :

```bash
# Vérifier que Ollama répond
curl https://ollama-llama-production.up.railway.app/api/tags

# Tester une génération
curl https://ollama-llama-production.up.railway.app/api/generate -d '{
  "model": "llama2:7b",
  "prompt": "Qu'est-ce qu'un bilan comptable ?"
}'
```

---

## 🎯 **Architecture Finale**

```
┌─────────────────┐
│   PostgreSQL    │ ← Railway Database
└────────┬────────┘
         │
         ▼
┌─────────────────┐      ┌──────────────────┐
│  BMS Backend    │ ───→ │  Ollama + Llama  │
│  NestJS:3001    │      │  Port: 11434     │
└────────┬────────┘      └──────────────────┘
         │                    ↑ 8-16 GB RAM
         ▼
┌─────────────────┐
│  BMS Frontend   │
│  Next.js:3000   │
└─────────────────┘
```

---

## 💰 **Coût Estimé**

Avec Railway Pro Plan :
- Backend : ~$5/mois
- Frontend : ~$5/mois
- PostgreSQL : ~$5/mois
- **Ollama (8-16 GB RAM)** : ~$15-30/mois

**Total** : ~$30-45/mois (tout inclus)

---

## 🔧 **Dépannage**

### **Service ne démarre pas**
- Vérifiez que vous avez au moins 8 GB RAM alloués
- Regardez les logs : `railway logs --service ollama-llama`

### **Timeout lors du téléchargement du modèle**
- Le premier démarrage prend ~10-15 minutes (téléchargement de Llama2)
- Railway peut timeout → Solution : augmenter le healthcheck timeout

### **Backend ne se connecte pas**
- Vérifiez que `OLLAMA_HOST` pointe vers l'URL Railway (pas localhost)
- Vérifiez que le port 11434 est bien exposé

---

## 🎉 **Résultat**

Votre chatbot IA BMS fonctionnera avec :
- ✅ Llama2 hébergé sur Railway
- ✅ Réponses intelligentes basées sur vos données comptables
- ✅ RAG (Retrieval Augmented Generation)
- ✅ 100% privé et sécurisé

**URL Chat** : `https://[frontend].railway.app/chat`
