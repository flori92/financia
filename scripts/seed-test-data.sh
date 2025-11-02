#!/bin/bash

# Script pour générer des données de test BMS
# Usage: ./scripts/seed-test-data.sh <company-id>

set -e

COMPANY_ID=${1:-"test-company"}

echo "🌱 Génération des données de test BMS pour la société: $COMPANY_ID"

# 1. D'abord s'assurer que les comptes SYSCOHADA sont créés
echo "📋 Création du plan comptable SYSCOHADA..."
curl -X POST "http://localhost:3001/api/v1/accounting/seed-syscohada?companyId=$COMPANY_ID" \
  -H "Content-Type: application/json" \
  -s | jq '.'

# 2. Créer les données de test
echo "💰 Création des données de test..."
curl -X POST "http://localhost:3001/api/v1/database/seed-test-data" \
  -H "Content-Type: application/json" \
  -d "{\"companyId\": \"$COMPANY_ID\"}" \
  -s | jq '.'

echo ""
echo "✅ Données de test créées avec succès !"
echo ""
echo "📊 Données générées :"
echo "   • 30 factures (ventes + achats) sur 12 mois"
echo "   • ~24 paiements associés"
echo "   • ~180 écritures comptables variées"
echo "   • 50 transactions mobile money"
echo ""
echo "🌐 Accédez aux tableaux de bord :"
echo "   • Dashboard: http://localhost:3000/accountant"
echo "   • Mobile Money: http://localhost:3000/accountant/mobile-money"
echo "   • Trésorerie: http://localhost:3000/treasury"
echo ""
echo "🔄 Actualisez les pages pour voir les graphiques et KPI !"
