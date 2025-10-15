# 🚀 FINANCIA PRO - Guide de Démarrage

## 🎯 Démarrage Rapide (5 minutes)

### Option 1: Docker (Recommandé)

```bash
# 1. Cloner le projet
cd /Users/floriace/MERP/financia-pro

# 2. Démarrer tous les services
docker-compose up -d

# 3. Accéder aux interfaces
# - API Gateway: http://localhost:3001
# - API Docs: http://localhost:3001/api/docs
# - Web Admin: http://localhost:3000
```

### Option 2: Installation Manuelle

```bash
# 1. Exécuter le script de setup
./scripts/setup-dev.sh

# 2. Démarrer les services séparément (3 terminaux)

# Terminal 1 - API Gateway
cd api-gateway
npm run start:dev

# Terminal 2 - Mobile App
cd mobile
npm start
# Dans un autre terminal:
npx react-native run-android

# Terminal 3 - Web Admin
cd web-admin
npm run dev
```

---

## 📱 Développement Mobile

### Android

```bash
cd mobile

# Premier lancement
npm install
npx react-native run-android

# Développement normal
npm start
# Puis dans un autre terminal:
npx react-native run-android
```

### iOS (Mac seulement)

```bash
cd mobile

# Installation pods
cd ios && pod install && cd ..

# Lancement
npx react-native run-ios
```

---

## 🧪 Tester l'API

### 1. Inscription

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@financia.com",
    "password": "SecurePass123!",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+22997123456",
    "countryCode": "BJ",
    "uxLevel": "simple"
  }'
```

### 2. Connexion

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type": application/json" \
  -d '{
    "email": "test@financia.com",
    "password": "SecurePass123!"
  }'
```

Réponse:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "test@financia.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "uxLevel": "simple"
  }
}
```

### 3. Créer une Facture (avec token)

```bash
curl -X POST http://localhost:3001/api/v1/invoices \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "invoiceType": "sales",
    "partyName": "Client ABC",
    "partyPhone": "+22997654321",
    "totalAmount": 50000,
    "currency": "XOF",
    "items": [
      {
        "itemName": "Consultation",
        "quantity": 1,
        "unitPrice": 50000
      }
    ]
  }'
```

---

## 🗄️ Base de Données

### Accès PostgreSQL

```bash
# Via Docker
docker exec -it financia-postgres psql -U financia -d financia_pro

# Local
psql -h localhost -U financia -d financia_pro
# Password: financia_dev_password
```

### Commandes Utiles

```sql
-- Lister les tables
\dt

-- Voir les utilisateurs
SELECT id, email, first_name, last_name, ux_level FROM users;

-- Voir les factures
SELECT invoice_number, party_name, total_amount, status 
FROM invoices;

-- Statistiques
SELECT status, COUNT(*), SUM(total_amount) 
FROM invoices 
GROUP BY status;
```

---

## 🔧 Configuration Avancée

### Variables d'Environnement

#### API Gateway (.env)
```env
NODE_ENV=development
PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_USER=financia
DB_PASSWORD=financia_dev_password
DB_NAME=financia_pro

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Flutterwave (à obtenir sur flutterwave.com)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx
```

#### Mobile (.env)
```env
API_URL=http://localhost:3001
```

#### Web Admin (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENV=development
```

---

## 🐛 Debugging

### API Gateway ne démarre pas

```bash
# Vérifier PostgreSQL
docker ps | grep postgres

# Vérifier les logs
cd api-gateway
npm run start:dev

# Vérifier la connexion DB
psql -h localhost -U financia -d financia_pro -c "SELECT 1;"
```

### Mobile ne se connecte pas à l'API

```bash
# Android: Utiliser 10.0.2.2 au lieu de localhost
# Dans mobile/.env:
API_URL=http://10.0.2.2:3001

# iOS: localhost fonctionne
API_URL=http://localhost:3001
```

### Erreur de synchronisation offline

```bash
# Nettoyer la base locale
cd mobile
npx react-native run-android --reset-cache
```

---

## 📚 Ressources

### Documentation
- [Architecture complète](../FINANCIA_PRO_ANALYSE.md)
- [Roadmap technique](../FINANCIA_PRO_ROADMAP.md)
- [Setup Cloudflare](../CLOUDFLARE_SETUP.md)

### API
- Swagger UI: http://localhost:3001/api/docs
- Postman Collection: `./docs/postman/`

### Monitoring
- RabbitMQ UI: http://localhost:15672 (guest/guest)
- Logs API: `cd api-gateway && npm run start:dev`

---

## 🆘 Support

### Problèmes Courants

**Port 3001 déjà utilisé**
```bash
# Trouver et tuer le processus
lsof -ti:3001 | xargs kill -9
```

**PostgreSQL connection refused**
```bash
# Redémarrer Docker
docker-compose restart postgres
```

**React Native erreur build Android**
```bash
cd mobile/android
./gradlew clean
cd ../..
npx react-native run-android
```

---

## ✅ Checklist Première Utilisation

- [ ] Docker Desktop installé et démarré
- [ ] Node.js 18+ installé
- [ ] Python 3.10+ installé (pour Frappe)
- [ ] `./scripts/setup-dev.sh` exécuté sans erreur
- [ ] Services Docker démarrés (`docker ps`)
- [ ] API Gateway accessible (http://localhost:3001/api/docs)
- [ ] Test inscription/connexion réussi
- [ ] Mobile app démarre (Android ou iOS)

---

## 🎉 Prochaines Étapes

1. ✅ Tester l'authentification
2. ✅ Créer votre première facture
3. ✅ Tester le paiement Mobile Money (sandbox)
4. ✅ Explorer le dashboard mobile
5. ✅ Lire la roadmap pour contribuer

**Bon développement ! 💼**
