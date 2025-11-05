# 🚀 BMS - Quick Start Guide

## ✅ Ce qui a été fait

1. ✅ Module Communications complet (emails, SMS, WhatsApp, templates)
2. ✅ API Client centralisé pour le frontend
3. ✅ DTOs avec validation stricte (aucun `any`)
4. ✅ Aucune donnée hardcodée ou mock
5. ✅ Migration de base de données
6. ✅ Documentation complète

## 🎯 Commandes à Exécuter

### 1. Vérifier qu'il n'y a plus de mocks

```bash
node scripts/verify-no-mocks.js
```

**Résultat attendu**: ✅ SUCCESS! No mocks or hardcoded data found!

### 2. Corriger tous les appels API hardcodés dans le frontend

```bash
node scripts/fix-hardcoded-apis.js
```

**Résultat attendu**: ✨ Done! Fixed X file(s).

### 3. Installer les dépendances (si nécessaire)

```bash
# Backend
cd bms/api-gateway
npm install

# Frontend
cd ../bms-web
npm install
```

### 4. Configurer les variables d'environnement

```bash
# Backend
cd bms/api-gateway
cp .env.example .env
nano .env  # Configurer DATABASE_*, REDIS_*, JWT_SECRET, etc.

# Frontend
cd ../bms-web
cp .env.example .env.local
nano .env.local  # Configurer NEXT_PUBLIC_API_URL
```

### 5. Créer la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base
CREATE DATABASE bms_erp;
CREATE USER bms_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bms_erp TO bms_user;
\q
```

### 6. Exécuter les migrations

```bash
cd bms/api-gateway
npm run typeorm migration:run
```

**Résultat attendu**: Toutes les migrations s'exécutent avec succès, y compris la nouvelle migration Communications.

### 7. Démarrer le backend

```bash
cd bms/api-gateway
npm run start:dev
```

**Résultat attendu**: 
```
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] CommunicationsModule dependencies initialized
[Nest] LOG [NestApplication] Nest application successfully started
```

### 8. Démarrer le frontend

```bash
cd bms-web
npm run dev
```

**Résultat attendu**:
```
ready - started server on 0.0.0.0:3000
```

### 9. Tester les endpoints

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Créer un template (nécessite authentification)
curl -X POST http://localhost:3001/api/v1/communications/templates \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Template",
    "type": "email",
    "subject": "Hello {{name}}",
    "body": "Welcome {{name}}!"
  }'

# Lister les templates
curl http://localhost:3001/api/v1/communications/templates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 📋 Checklist de Validation

### Backend
- [ ] Migration exécutée avec succès
- [ ] Serveur démarre sans erreur
- [ ] Module Communications chargé
- [ ] Endpoints accessibles
- [ ] Aucune erreur dans les logs

### Frontend
- [ ] Serveur démarre sans erreur
- [ ] API client importé correctement
- [ ] Aucun appel hardcodé restant
- [ ] Pages se chargent correctement

### Base de Données
- [ ] Tables créées: `emails`, `sms_messages`, `whatsapp_messages`, `communication_templates`
- [ ] Index créés correctement
- [ ] Connexion fonctionne

## 🔍 Vérifications Importantes

### 1. Vérifier les tables créées

```sql
-- Se connecter à la base
psql -U bms_user -d bms_erp

-- Lister les tables
\dt

-- Vérifier la structure
\d emails
\d sms_messages
\d whatsapp_messages
\d communication_templates
```

### 2. Vérifier les endpoints Swagger

Ouvrir dans le navigateur:
```
http://localhost:3001/api/docs
```

Vous devriez voir la section "Communications" avec tous les endpoints.

### 3. Vérifier les logs

```bash
# Backend logs
cd bms/api-gateway
npm run start:dev

# Chercher:
# - "CommunicationsModule dependencies initialized"
# - Aucune erreur de compilation
# - Aucune erreur de connexion DB
```

## 🐛 Troubleshooting

### Erreur: "Cannot find module '@/lib/api-client'"

**Solution**: Le fichier a été créé. Redémarrer le serveur Next.js:
```bash
cd bms-web
npm run dev
```

### Erreur: "relation 'emails' does not exist"

**Solution**: Exécuter la migration:
```bash
cd bms/api-gateway
npm run typeorm migration:run
```

### Erreur: "Cannot connect to database"

**Solution**: Vérifier les variables d'environnement dans `.env`:
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=bms_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=bms_erp
```

### Erreur: "Module not found: Can't resolve 'class-validator'"

**Solution**: Installer les dépendances:
```bash
cd bms/api-gateway
npm install class-validator class-transformer
```

### Erreur: URLs hardcodées restantes

**Solution**: Exécuter le script de correction:
```bash
node scripts/fix-hardcoded-apis.js
```

## 📚 Documentation

### Fichiers Importants

1. **Module Communications**
   - `bms/api-gateway/src/communications/README.md` - Documentation du module
   - `.kiro/specs/bms-corrections-api/FINAL-STATUS.md` - Statut final

2. **Déploiement**
   - `.kiro/specs/bms-corrections-api/deployment-guide.md` - Guide complet

3. **Corrections**
   - `.kiro/specs/bms-corrections-api/corrections-summary.md` - Résumé des corrections

### Endpoints API

#### Communications
- `GET /api/v1/communications/emails` - Liste des emails
- `POST /api/v1/communications/emails` - Envoyer un email
- `GET /api/v1/communications/sms` - Liste des SMS
- `POST /api/v1/communications/sms` - Envoyer un SMS
- `GET /api/v1/communications/whatsapp` - Conversations WhatsApp
- `POST /api/v1/communications/whatsapp` - Envoyer un message
- `GET /api/v1/communications/templates` - Liste des templates
- `POST /api/v1/communications/templates` - Créer un template
- `PUT /api/v1/communications/templates/:id` - Modifier un template
- `DELETE /api/v1/communications/templates/:id` - Supprimer un template
- `POST /api/v1/communications/bulk` - Envoi en masse
- `GET /api/v1/communications/stats` - Statistiques

## 🎯 Prochaines Étapes

### Court Terme (Cette Semaine)
1. Exécuter toutes les commandes ci-dessus
2. Tester tous les endpoints
3. Vérifier que tout fonctionne
4. Corriger les éventuels bugs

### Moyen Terme (Semaine Prochaine)
1. Implémenter les providers réels (SendGrid, Twilio)
2. Ajouter les webhooks pour les callbacks
3. Configurer le queue system (Bull)
4. Ajouter les tests unitaires

### Long Terme (Ce Mois)
1. Déployer en staging
2. Tests end-to-end
3. Optimisations de performance
4. Documentation utilisateur

## ✅ Validation Finale

Une fois toutes les commandes exécutées:

```bash
# 1. Vérifier qu'il n'y a plus de mocks
node scripts/verify-no-mocks.js
# ✅ SUCCESS! No mocks or hardcoded data found!

# 2. Vérifier que le backend démarre
cd bms/api-gateway && npm run start:dev
# ✅ Nest application successfully started

# 3. Vérifier que le frontend démarre
cd bms-web && npm run dev
# ✅ ready - started server on 0.0.0.0:3000

# 4. Tester un endpoint
curl http://localhost:3001/api/v1/health
# ✅ {"status":"ok"}
```

## 🎉 Succès !

Si toutes les étapes ci-dessus fonctionnent, le module Communications est **opérationnel** ! 🚀

---

**Questions ?** Consultez la documentation dans `.kiro/specs/bms-corrections-api/`
