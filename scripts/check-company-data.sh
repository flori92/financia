#!/bin/bash

echo "🔍 Vérification des données BMS..."
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables Railway (à adapter selon votre configuration)
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"

echo "📡 Backend URL: $BACKEND_URL"
echo ""

# 1. Vérifier les sociétés
echo "1️⃣  Vérification des sociétés..."
echo "GET $BACKEND_URL/api/v1/companies"
echo ""

# 2. Vérifier les utilisateurs avec leur companyId
echo "2️⃣  Vérification des utilisateurs..."
echo "   Vérifiez dans la base de données PostgreSQL:"
echo "   SELECT id, email, role, company_id FROM users;"
echo ""

# 3. Vérifier les données comptables
echo "3️⃣  Pour tester avec un companyId spécifique:"
echo "   GET $BACKEND_URL/api/v1/accounting/dashboard/metrics?companyId=VOTRE_COMPANY_ID"
echo ""

# 4. Instructions
echo "📋 ${YELLOW}INSTRUCTIONS:${NC}"
echo ""
echo "a) ${GREEN}Vérifier qu'un utilisateur a un companyId:${NC}"
echo "   - Connectez-vous à la base PostgreSQL Railway"
echo "   - Exécutez: SELECT id, email, company_id FROM users WHERE email='votre@email.com';"
echo ""
echo "b) ${GREEN}Assigner un companyId à un utilisateur:${NC}"
echo "   - Trouvez l'ID d'une société: SELECT id, name FROM companies;"
echo "   - Assignez: UPDATE users SET company_id='ID_SOCIETE' WHERE email='votre@email.com';"
echo ""
echo "c) ${GREEN}Créer des données de test:${NC}"
echo "   - Utilisez les scripts dans scripts/generate-test-data.sh"
echo "   - Ou créez manuellement des écritures comptables"
echo ""
echo "d) ${GREEN}Vérifier après login:${NC}"
echo "   - Ouvrez la console navigateur (F12)"
echo "   - Tapez: localStorage.getItem('companyId')"
echo "   - Devrait retourner un UUID"
echo ""
echo "e) ${GREEN}Forcer un companyId de test:${NC}"
echo "   - Console navigateur: localStorage.setItem('companyId', 'UUID_DE_VOTRE_SOCIETE')"
echo "   - Rechargez la page"
echo ""

echo "✅ Script de diagnostic terminé"
echo ""
echo "💡 ${YELLOW}Problème principal probable:${NC}"
echo "   Les utilisateurs n'ont pas de companyId assigné dans la base de données"
echo "   OU la société n'a pas de données (écritures comptables, transactions, etc.)"
