#!/bin/bash

echo "🔍 Vérification Finale des Corrections BMS"
echo "==========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

# 1. Vérifier les URLs hardcodées
echo -e "${BLUE}1. Vérification des URLs hardcodées...${NC}"
HARDCODED=$(grep -r "localhost:3001" bms-web/src --include="*.tsx" --include="*.ts" | grep -v "api-client.ts" | grep -v "api.ts" | grep -v "route.ts" | wc -l)
if [ "$HARDCODED" -gt 0 ]; then
    echo -e "${RED}   ❌ $HARDCODED URLs hardcodées trouvées${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}   ✅ Aucune URL hardcodée${NC}"
fi

# 2. Vérifier les mocks
echo -e "\n${BLUE}2. Vérification des mocks...${NC}"
MOCKS=$(grep -r "const mock" bms-web/src/app --include="*.tsx" | grep -v "// mock" | wc -l)
if [ "$MOCKS" -gt 0 ]; then
    echo -e "${YELLOW}   ⚠️  $MOCKS mocks trouvés (certains peuvent être légitimes)${NC}"
else
    echo -e "${GREEN}   ✅ Aucun mock trouvé${NC}"
fi

# 3. Vérifier les TODOs
echo -e "\n${BLUE}3. Vérification des TODOs...${NC}"
TODOS=$(grep -r "// TODO" bms-web/src/app --include="*.tsx" --include="*.ts" | wc -l)
if [ "$TODOS" -gt 0 ]; then
    echo -e "${YELLOW}   ⚠️  $TODOS TODOs trouvés${NC}"
else
    echo -e "${GREEN}   ✅ Aucun TODO trouvé${NC}"
fi

# 4. Vérifier l'utilisation de l'API centralisée
echo -e "\n${BLUE}4. Vérification de l'API centralisée...${NC}"
API_IMPORTS=$(grep -r "from '@/lib/api'" bms-web/src/app --include="*.tsx" | wc -l)
echo -e "${GREEN}   ✅ $API_IMPORTS fichiers utilisent l'API centralisée${NC}"

# 5. Vérifier les fichiers de configuration
echo -e "\n${BLUE}5. Vérification des fichiers de configuration...${NC}"

if [ -f "bms-web/.env.local" ]; then
    echo -e "${GREEN}   ✅ .env.local existe${NC}"
else
    echo -e "${RED}   ❌ .env.local manquant${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "bms/api-gateway/.env" ]; then
    echo -e "${GREEN}   ✅ backend .env existe${NC}"
else
    echo -e "${RED}   ❌ backend .env manquant${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 6. Vérifier Railway CLI
echo -e "\n${BLUE}6. Vérification Railway CLI...${NC}"
if command -v railway &> /dev/null; then
    VERSION=$(railway --version)
    echo -e "${GREEN}   ✅ Railway CLI installé ($VERSION)${NC}"
else
    echo -e "${RED}   ❌ Railway CLI non installé${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 7. Vérifier la branche Git
echo -e "\n${BLUE}7. Vérification de la branche Git...${NC}"
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "clean-main" ]; then
    echo -e "${GREEN}   ✅ Sur la branche clean-main${NC}"
else
    echo -e "${YELLOW}   ⚠️  Sur la branche $BRANCH (devrait être clean-main)${NC}"
fi

# 8. Vérifier les dépendances
echo -e "\n${BLUE}8. Vérification des dépendances...${NC}"
if [ -d "bms-web/node_modules" ]; then
    echo -e "${GREEN}   ✅ Frontend: node_modules présent${NC}"
else
    echo -e "${YELLOW}   ⚠️  Frontend: node_modules manquant (npm install requis)${NC}"
fi

if [ -d "bms/api-gateway/node_modules" ]; then
    echo -e "${GREEN}   ✅ Backend: node_modules présent${NC}"
else
    echo -e "${YELLOW}   ⚠️  Backend: node_modules manquant (npm install requis)${NC}"
fi

# 9. Vérifier les fichiers Railway
echo -e "\n${BLUE}9. Vérification des fichiers Railway...${NC}"
if [ -f "bms-web/railway.json" ]; then
    echo -e "${GREEN}   ✅ Frontend railway.json existe${NC}"
else
    echo -e "${RED}   ❌ Frontend railway.json manquant${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "bms/api-gateway/railway.json" ]; then
    echo -e "${GREEN}   ✅ Backend railway.json existe${NC}"
else
    echo -e "${RED}   ❌ Backend railway.json manquant${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Résumé
echo -e "\n${BLUE}=========================================${NC}"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Toutes les vérifications sont passées!${NC}"
    echo -e "${GREEN}🚀 Prêt pour le déploiement sur Railway${NC}"
else
    echo -e "${RED}❌ $ERRORS erreurs critiques détectées${NC}"
    echo -e "${YELLOW}⚠️  Corrigez les erreurs avant de déployer${NC}"
fi

echo -e "\n${BLUE}📊 Statistiques:${NC}"
echo -e "   - URLs hardcodées: $HARDCODED"
echo -e "   - Mocks: $MOCKS"
echo -e "   - TODOs: $TODOS"
echo -e "   - Fichiers avec API centralisée: $API_IMPORTS"

exit $ERRORS
