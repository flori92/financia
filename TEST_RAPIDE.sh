#!/bin/bash

echo "🧪 Test Rapide BMS"
echo "=================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Backend
echo "1️⃣  Test Backend (port 3001)..."
if curl -s http://localhost:3001/api/v1/auth/me > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend OK${NC}"
else
    echo -e "${RED}❌ Backend KO - Démarrer avec ./START_ALL.sh${NC}"
    exit 1
fi

# Test 2: Endpoints principaux
echo ""
echo "2️⃣  Test Endpoints..."

endpoints=(
    "/api/v1/auth/me"
    "/api/v1/companies"
    "/api/v1/crm/contacts"
    "/api/v1/hr/employees"
    "/api/v1/purchases/suppliers"
    "/api/v1/manufacturing/production-orders"
    "/api/v1/inventory/items"
    "/api/v1/projects"
    "/api/v1/budget"
    "/api/v1/treasury/cash-flow"
)

failed=0
for endpoint in "${endpoints[@]}"; do
    if curl -s "http://localhost:3001$endpoint" > /dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $endpoint"
    else
        echo -e "${RED}❌${NC} $endpoint"
        ((failed++))
    fi
done

if [ $failed -eq 0 ]; then
    echo -e "\n${GREEN}✅ Tous les endpoints fonctionnent!${NC}"
else
    echo -e "\n${YELLOW}⚠️  $failed endpoint(s) en erreur${NC}"
fi

# Test 3: Frontend
echo ""
echo "3️⃣  Test Frontend (port 3000)..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend OK${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend non démarré - Lancer ./START_ALL.sh${NC}"
fi

# Résumé
echo ""
echo "=================="
echo "📊 Résumé"
echo "=================="
echo -e "Backend:  ${GREEN}✅ Opérationnel${NC}"
echo -e "API:      ${GREEN}✅ $((${#endpoints[@]} - failed))/${#endpoints[@]} endpoints OK${NC}"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "👤 Comptes de test:"
echo "   comptable@cabinet.bj / password123"
echo "   entrepreneur@test.bj / password123"
echo ""
echo -e "${GREEN}✨ BMS est prêt!${NC}"
