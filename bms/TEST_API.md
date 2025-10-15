# 🧪 FINANCIA PRO - Guide de Test API

## 🚀 Démarrage Rapide

### 1. Démarrer les Services

```bash
cd /Users/floriace/MERP/financia-pro

# Démarrer PostgreSQL, Redis, RabbitMQ
docker-compose up -d

# Vérifier que les services sont démarrés
docker ps
```

### 2. Installer et Démarrer l'API

```bash
cd api-gateway

# Créer le fichier .env
cp .env.example .env

# Installer les dépendances
npm install

# Démarrer en mode dev
npm run start:dev
```

Vous devriez voir:
```
╔═══════════════════════════════════════════════════════╗
║   💼 FINANCIA PRO - API Gateway                      ║
║   🚀 Server running on: http://localhost:3001        ║
║   📚 API Docs: http://localhost:3001/api/docs        ║
╚═══════════════════════════════════════════════════════╝
```

---

## 📚 Documentation Interactive

Ouvrir dans le navigateur: **http://localhost:3001/api/docs**

Vous aurez accès à Swagger UI avec tous les endpoints testables.

---

## 🧪 Tests Manuels (curl)

### 1. Health Check

```bash
curl http://localhost:3001/health
```

**Réponse attendue**:
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  }
}
```

---

### 2. Inscription Utilisateur

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@financia.com",
    "password": "SecurePass123!",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+22997123456",
    "countryCode": "BJ",
    "uxLevel": "simple"
  }'
```

**Réponse attendue**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-xxxx-xxxx",
    "email": "jean.dupont@financia.com",
    "firstName": "Jean",
    "lastName": "Dupont",
    "role": "user",
    "uxLevel": "simple"
  }
}
```

💾 **Sauvegarder le token pour les prochaines requêtes**

---

### 3. Connexion

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@financia.com",
    "password": "SecurePass123!"
  }'
```

---

### 4. Créer une Facture

```bash
# Remplacer YOUR_TOKEN par le access_token reçu
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST http://localhost:3001/api/v1/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "test-company-id",
    "invoiceType": "sales",
    "partyName": "Entreprise ABC SARL",
    "partyPhone": "+22997654321",
    "partyEmail": "contact@abc.com",
    "currency": "XOF",
    "items": [
      {
        "itemName": "Consultation juridique",
        "description": "Consultation pour création de société",
        "quantity": 2,
        "unitPrice": 25000,
        "taxPercent": 18
      },
      {
        "itemName": "Rédaction statuts",
        "quantity": 1,
        "unitPrice": 50000
      }
    ],
    "mobileMoneyProvider": "mtn"
  }'
```

**Réponse attendue**:
```json
{
  "id": "uuid-invoice",
  "invoiceNumber": "FINV-202410-0001",
  "invoiceType": "sales",
  "invoiceDate": "2024-10-15",
  "partyName": "Entreprise ABC SARL",
  "subtotal": 100000,
  "taxAmount": 9000,
  "totalAmount": 109000,
  "outstandingAmount": 109000,
  "status": "draft",
  "qrCodeData": "{...}",
  "items": [...]
}
```

---

### 5. Lister les Factures

```bash
curl http://localhost:3001/api/v1/invoices?companyId=test-company-id \
  -H "Authorization: Bearer $TOKEN"
```

**Avec filtres**:
```bash
# Factures impayées
curl "http://localhost:3001/api/v1/invoices?companyId=test-company-id&paymentStatus=unpaid" \
  -H "Authorization: Bearer $TOKEN"

# Factures du mois
curl "http://localhost:3001/api/v1/invoices?companyId=test-company-id&startDate=2024-10-01&endDate=2024-10-31" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 6. Soumettre une Facture

```bash
# Passer de draft à submitted
curl -X PATCH "http://localhost:3001/api/v1/invoices/INVOICE_ID/submit?companyId=test-company-id" \
  -H "Authorization: Bearer $TOKEN"
```

---

### 7. Mobile Money - Initier un Paiement

```bash
curl -X POST http://localhost:3001/api/v1/mobile-money/pay \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 109000,
    "currency": "XOF",
    "phoneNumber": "+22997123456",
    "provider": "mtn",
    "invoiceId": "uuid-invoice"
  }'
```

**Réponse attendue (sandbox)**:
```json
{
  "status": "success",
  "data": {
    "tx_ref": "FIN-1697123456-abc123",
    "status": "pending"
  },
  "message": "Paiement initié. Suivez les instructions sur votre téléphone."
}
```

---

### 8. Vérifier une Transaction

```bash
curl http://localhost:3001/api/v1/mobile-money/verify/TRANSACTION_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

### 9. Synchronisation - Push

```bash
curl -X POST http://localhost:3001/api/v1/sync/push \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "mobile-device-123",
    "last_sync": "2024-10-14T10:00:00Z",
    "changes": [
      {
        "entity_type": "invoice",
        "entity_id": "local-invoice-1",
        "action": "create",
        "data": {
          "invoiceNumber": "DRAFT-001",
          "totalAmount": 50000
        },
        "timestamp": "2024-10-15T08:30:00Z"
      }
    ]
  }'
```

---

### 10. Synchronisation - Pull

```bash
curl -X POST http://localhost:3001/api/v1/sync/pull \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "client_id": "mobile-device-123",
    "last_sync": "2024-10-14T10:00:00Z"
  }'
```

---

## 🔍 Vérifier la Base de Données

```bash
# Se connecter à PostgreSQL
docker exec -it financia-postgres psql -U financia -d financia_pro

# Commandes SQL utiles
\dt                              # Lister les tables
SELECT * FROM users;             # Voir les utilisateurs
SELECT * FROM invoices;          # Voir les factures
SELECT * FROM invoice_items;     # Voir les lignes de facture

# Statistiques
SELECT status, COUNT(*), SUM(total_amount) 
FROM invoices 
GROUP BY status;
```

---

## 🐛 Dépannage

### Erreur: Cannot connect to database

```bash
# Vérifier que PostgreSQL tourne
docker ps | grep postgres

# Redémarrer
docker-compose restart postgres

# Vérifier les logs
docker logs financia-postgres
```

### Erreur: Port 3001 already in use

```bash
# Trouver le processus
lsof -ti:3001

# Tuer le processus
kill -9 $(lsof -ti:3001)
```

### Erreur: Flutterwave authentication failed

Vérifier dans `api-gateway/.env`:
```env
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-xxxxx
```

---

## 📊 Scénario de Test Complet

### Workflow: Créer Facture → Payer → Synchroniser

```bash
# 1. S'inscrire
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@financia.com","password":"Test123!","firstName":"Test","lastName":"User"}'

# Copier le access_token
export TOKEN="..."

# 2. Créer une facture
curl -X POST http://localhost:3001/api/v1/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "companyId": "test-company",
    "invoiceType": "sales",
    "partyName": "Client Test",
    "items": [{"itemName": "Service", "quantity": 1, "unitPrice": 50000}]
  }'

# Copier l'ID de la facture
export INVOICE_ID="..."

# 3. Soumettre la facture
curl -X PATCH "http://localhost:3001/api/v1/invoices/$INVOICE_ID/submit?companyId=test-company" \
  -H "Authorization: Bearer $TOKEN"

# 4. Initier paiement Mobile Money
curl -X POST http://localhost:3001/api/v1/mobile-money/pay \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "currency": "XOF",
    "phoneNumber": "+22997123456",
    "provider": "mtn",
    "invoiceId": "'$INVOICE_ID'"
  }'

# 5. Vérifier la transaction
export TX_ID="..."
curl http://localhost:3001/api/v1/mobile-money/verify/$TX_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## ✅ Checklist de Test

- [ ] Health check fonctionne
- [ ] Inscription utilisateur réussie
- [ ] Connexion avec email/password
- [ ] Token JWT valide
- [ ] Création facture avec calculs corrects
- [ ] Génération automatique numéro facture
- [ ] Listing factures avec filtres
- [ ] Soumission facture
- [ ] Annulation facture
- [ ] Initiation paiement Mobile Money
- [ ] Vérification transaction
- [ ] Sync push (client → serveur)
- [ ] Sync pull (serveur → client)
- [ ] Swagger UI accessible

---

## 🎯 Prochains Tests

1. **Performance**: Créer 100+ factures et tester la latence
2. **Concurrence**: Plusieurs utilisateurs simultanés
3. **Offline**: Tester la sync après 24h hors ligne
4. **Mobile**: Tests sur vrais devices Android/iOS
5. **Flutterwave**: Tests avec vraies transactions (sandbox)

---

**Documentation générée le**: 15 Oct 2025  
**Version API**: 1.0.0-alpha
