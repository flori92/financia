#!/bin/bash

API_URL="http://localhost:3001/api/v1"

echo "🚀 Initialisation des données de démonstration BMS..."

# 1. Créer une société
echo "📦 Création de la société..."
COMPANY_RESPONSE=$(curl -s -X POST "$API_URL/companies" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SARL DEMO BMS",
    "nif": "BJ123456789",
    "address": "Cotonou, Bénin",
    "phone": "+22997123456",
    "email": "contact@demo-bms.bj",
    "currency": "XOF",
    "fiscalYear": 2024
  }')

COMPANY_ID=$(echo $COMPANY_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✅ Société créée: $COMPANY_ID"

# 2. Créer un utilisateur
echo "👤 Création de l'utilisateur..."
curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "entrepreneur@test.bj",
    "password": "password123",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+22997123456",
    "companyId": "'$COMPANY_ID'"
  }' > /dev/null

echo "✅ Utilisateur créé: entrepreneur@test.bj"

# 3. Initialiser le plan comptable SYSCOHADA
echo "📚 Initialisation du plan comptable SYSCOHADA..."
curl -s -X POST "$API_URL/accounting/seed-syscohada?companyId=$COMPANY_ID" > /dev/null
echo "✅ Plan comptable initialisé"

# 4. Créer des factures de démonstration
echo "🧾 Création de factures..."
for i in {1..5}; do
  curl -s -X POST "$API_URL/invoices" \
    -H "Content-Type: application/json" \
    -d '{
      "companyId": "'$COMPANY_ID'",
      "invoiceType": "sales",
      "partyName": "Client '$i'",
      "partyEmail": "client'$i'@example.com",
      "items": [
        {
          "itemName": "Prestation de service",
          "quantity": 1,
          "unitPrice": '$((50000 + i * 10000))'
        }
      ]
    }' > /dev/null
done
echo "✅ 5 factures créées"

# 5. Créer des paiements
echo "💰 Création de paiements..."
for i in {1..3}; do
  curl -s -X POST "$API_URL/payments" \
    -H "Content-Type: application/json" \
    -d '{
      "companyId": "'$COMPANY_ID'",
      "amount": '$((30000 + i * 5000))',
      "paymentMethod": "mobile_money",
      "partyType": "customer",
      "reference": "PAY-'$i'",
      "paymentDate": "'$(date -u +"%Y-%m-%d")'"
    }' > /dev/null
done
echo "✅ 3 paiements créés"

# 6. Créer des contacts CRM
echo "👥 Création de contacts CRM..."
for i in {1..3}; do
  curl -s -X POST "$API_URL/crm/contacts" \
    -H "Content-Type: application/json" \
    -d '{
      "companyId": "'$COMPANY_ID'",
      "firstName": "Contact",
      "lastName": "'$i'",
      "email": "contact'$i'@example.com",
      "phone": "+22997'$((100000 + i))'",
      "type": "customer",
      "status": "active"
    }' > /dev/null
done
echo "✅ 3 contacts créés"

echo ""
echo "🎉 Données de démonstration créées avec succès!"
echo ""
echo "📝 Informations de connexion:"
echo "   Email: entrepreneur@test.bj"
echo "   Mot de passe: password123"
echo "   Société ID: $COMPANY_ID"
echo ""
echo "🌐 Accédez à l'application: http://localhost:3000/login"
