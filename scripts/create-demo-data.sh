#!/bin/bash

# Script pour créer des données de démonstration BMS
# Utilise l'API pour créer les écritures comptables

set -e

COMPANY_ID=${1:-"demo-company"}

echo "🌱 Création des données de démonstration BMS..."
echo "📊 Société: $COMPANY_ID"

# 1. Créer le plan comptable SYSCOHADA (si erreur, on continue)
echo "📋 Création du plan comptable..."
curl -X POST "http://localhost:3001/api/v1/accounting/seed-syscohada?companyId=$COMPANY_ID" \
  -H "Content-Type: application/json" \
  -s > /dev/null || echo "⚠️  Le plan comptable existe peut-être déjà"

# 2. Créer des écritures comptables via l'API d'automatisation
echo "💰 Création des écritures de vente..."

# Créer 5 ventes sur les 3 derniers mois
for month in 09 10 11; do
  for i in {1..2}; do
    amount=$((500000 + RANDOM % 1500000))
    echo "   • Vente $month-2024: $((amount / 1000))K XOF"
    
    curl -X POST "http://localhost:3001/api/v1/accounting/auto/sale" \
      -H "Content-Type: application/json" \
      -d "{
        \"companyId\": \"$COMPANY_ID\",
        \"amount\": $amount,
        \"customerName\": \"CLIENT $month-$i\",
        \"customerEmail\": \"client$month$i@example.com\",
        \"description\": \"Vente marchandises $month/2024\",
        \"date\": \"2024-$month-15\"
      }" \
      -s > /dev/null
  done
done

echo "🛍️  Création des écritures d'achat..."

# Créer 3 achats
for i in {1..3}; do
  amount=$((300000 + RANDOM % 700000))
  month=$((9 + i))
  echo "   • Achat $month-2024: $((amount / 1000))K XOF"
  
  curl -X POST "http://localhost:3001/api/v1/accounting/auto/purchase" \
    -H "Content-Type: application/json" \
    -d "{
      \"companyId\": \"$COMPANY_ID\",
      \"amount\": $amount,
      \"supplierName\": \"FOURNISSEUR $i\",
      \"description\": \"Achat fournitures $month/2024\",
      \"date\": \"2024-$month-10\"
    }" \
    -s > /dev/null
done

echo ""
echo "✅ Données de démonstration créées !"
echo ""
echo "📊 Données générées :"
echo "   • 6 ventes (sept-nov 2024)"
echo "   • 3 achats (sept-nov 2024)"
echo "   • Plan comptable SYSCOHADA"
echo "   • Écritures comptables validées"
echo ""
echo "🌐 Accédez aux tableaux de bord :"
echo "   • Dashboard: http://localhost:3000/accountant"
echo "   • Journal: http://localhost:3000/accountant/journal"
echo "   • Balance: http://localhost:3000/accountant/trial-balance"
echo "   • Compte Résultat: http://localhost:3000/accountant/profit-loss"
echo ""
echo "🔄 Actualisez les pages pour voir les graphiques et KPI !"

# Vérifier les données créées
echo ""
echo "📈 Vérification des données:"
curl -s "http://localhost:3001/api/v1/accounting/dashboard/metrics?companyId=$COMPANY_ID" | jq '{
  "CA Mois": .kpiMonth.revenue,
  "Charges Mois": .kpiMonth.expenses,
  "Résultat Net": .kpiMonth.netIncome,
  "Marge": .kpiMonth.margin,
  "Alertes": (.alerts | length),
  "Top Clients": (.topClients | length)
}'
