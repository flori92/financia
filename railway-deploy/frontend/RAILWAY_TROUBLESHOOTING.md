# 🔧 Guide de Dépannage Railway BMS

## 📋 Vue d'ensemble

Guide complet pour résoudre les problèmes courants lors du déploiement de BMS sur Railway.

---

## 🏥 Problème: Health Check Failed

### **Symptôme**
```
1/1 replicas never became healthy!
Healthcheck failed!
```

### **Causes Possibles**

#### **✅ 1. Endpoint /health Manquant**
**Solution**: L'endpoint `/api/health` a été créé dans `src/app/api/health/route.ts`

```typescript
// Vérifier que le fichier existe:
/src/app/api/health/route.ts ✅

// Test local:
npm run build && npm start
curl http://localhost:3000/api/health
```

#### **✅ 2. Timeout Trop Court**
**Solution**: Timeout augmenté à 180 secondes dans `railway.toml`

```toml
[performance]
healthcheck_timeout = 180  # 3 minutes
```

#### **✅ 3. Application Lent à Démarrer**
**Solution**: Optimisation du démarrage

```bash
# Vérifier les logs Railway
railway logs

# Monitoring du démarrage
curl -I https://bms-web.up.railway.app/api/health
```

---

## 🚀 Problème: Build Échoue

### **Symptôme**
```
Build failed with exit code 1
```

### **Causes et Solutions**

#### **✅ Erreurs TypeScript**
```bash
# Vérifier localement
npm run build

# Corriger les erreurs une par une
npm run lint
npm run type-check
```

#### **✅ Dépendances Manquantes**
```bash
# Installer framer-motion
npm install framer-motion

# Vérifier package.json
cat package.json | grep framer-motion
```

#### **✅ Mémoire Insuffisante**
```toml
# railway.toml
[performance]
memory_limit = "1GB"  # Augmenter si nécessaire
build_timeout = 600   # 10 minutes pour builds complexes
```

---

## 🌐 Problème: Application Inaccessible

### **Symptôme**
``502 Bad Gateway` ou `Service Unavailable``

### **Diagnostic**

#### **✅ 1. Vérifier le Statut**
```bash
# Script de health check
./scripts/test-health.sh

# Manuel
curl https://bms-web.up.railway.app/api/health
```

#### **✅ 2. Vérifier les Logs**
```bash
# Logs en temps réel
railway logs --follow

# Logs spécifiques
railway logs --service bms-web
```

#### **✅ 3. Vérifier les Variables d'Environnement**
```bash
# Lister les variables
railway variables

# Variables requises:
NEXT_PUBLIC_API_URL=https://bms-api-gateway.up.railway.app
NEXT_PUBLIC_COMPANY_ID=1805bc61-7cfd-44e9-8a63-17187bf05dc7
NODE_ENV=production
```

---

## 📊 Problème: Données Non Chargées

### **Symptôme**
L'application se charge mais affiche des erreurs API

### **Diagnostic**

#### **✅ 1. Vérifier la Connectivité Backend**
```bash
# Test API backend
curl https://bms-api-gateway.up.railway.app/health

# Test endpoints spécifiques
curl "https://bms-api-gateway.up.railway.app/api/v1/accounting/dashboard/metrics?companyId=UUID"
```

#### **✅ 2. Vérifier CORS**
```typescript
// Vérifier configuration backend
// Les origins doivent inclure: https://bms-web.up.railway.app
```

#### **✅ 3. Vérifier JWT Token**
```bash
# Token frontend
localStorage.getItem('bms_token')

# Token backend valide?
curl -H "Authorization: Bearer TOKEN" https://bms-api-gateway.up.railway.app/health
```

---

## 🔧 Solutions Rapides

### **Redéploiement Complet**
```bash
# 1. Nettoyer le cache
git clean -fd
npm run build

# 2. Redéployer
git add .
git commit -m "fix: railway health check"
git push origin clean-main

# 3. Déclencher déploiement Railway
railway up --service bms-web --environment production
```

### **Rollback si Nécessaire**
```bash
# Voir les déploiements précédents
railway status

# Retourner au commit précédent
git checkout HEAD~1
git push --force-with-lease origin clean-main
```

---

## 📈 Monitoring et Maintenance

### **Health Check Automatisé**
```bash
# Script de monitoring
./scripts/test-health.sh

# Intégration CI/CD
npm run health-check
```

### **Performance Monitoring**
```bash
# Mémoire et CPU
curl https://bms-web.up.railway.app/api/health | jq '.memory'

# Uptime et statut
curl https://bms-web.up.railway.app/api/health | jq '.uptime, .status'
```

### **Logs Structurés**
```typescript
// Dans l'application
console.log(JSON.stringify({
  timestamp: new Date().toISOString(),
  service: 'bms-web',
  level: 'info',
  message: 'Application started successfully'
}));
```

---

## 🆘 Support et Escalade

### **Railway Support**
- **Dashboard**: https://railway.app/project/bms-web
- **Documentation**: https://docs.railway.app
- **Status**: https://status.railway.app

### **Logs Avancés**
```bash
# Exporter les logs
railway logs > railway-logs.txt

# Filtrer par erreur
railway logs | grep ERROR

# Monitoring temps réel
watch -n 5 './scripts/test-health.sh'
```

### **Métriques Clés**
| Métrique | Seuil d'Alerte | Action |
|----------|----------------|--------|
| **Memory Usage** | > 400MB | Augmenter memory_limit |
| **Response Time** | > 5s | Optimiser ou scaler |
| **Error Rate** | > 5% | Investigation logs |
| **Uptime** | < 99% | Redéploiement |

---

## ✅ Checklist Pré-Déploiement

### **Code**
- [ ] `npm run build` réussi localement
- [ ] `npm run lint` sans erreurs
- [ ] `npm run test` si applicable
- [ ] Variables d'environnement configurées

### **Configuration**
- [ ] `railway.toml` à jour
- [ ] Health check `/api/health` fonctionnel
- [ ] Timeout suffisants (180s+)
- [ ] Memory/CPU adéquats

### **Sécurité**
- [ ] Secrets configurés (JWT_SECRET)
- [ ] CORS correctement configuré
- [ ] HTTPS forcé
- [ ] Rate limiting actif

### **Monitoring**
- [ ] Health check script disponible
- [ ] Logs structurés en place
- [ ] Alertes configurées
- [ ] Dashboard monitoring prêt

---

## 🎯 Résultat Attendu

Après application de ce guide:

```bash
✅ Health check: /api/health → 200 OK
✅ Application: https://bms-web.up.railway.app → Accessible
✅ API Backend: Connecté et fonctionnel
✅ Données: 100% dynamiques depuis PostgreSQL
✅ Monitoring: Logs et métriques disponibles
```

---

**🎉 BMS est maintenant robuste et prêt pour la production Railway !**

*Dernière mise à jour: 4 Novembre 2024*  
*Version: 1.0.0*  
*Statut: PRODUCTION READY ✅*
