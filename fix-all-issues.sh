#!/bin/bash

echo "🚀 Correction complète du projet BMS"
echo "======================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 1. Vérifier Railway CLI
echo -e "\n${YELLOW}1. Vérification Railway CLI...${NC}"
if ! command -v railway &> /dev/null; then
    echo -e "${RED}Railway CLI non installé. Installation...${NC}"
    brew install railway
fi
railway --version

# 2. Se connecter à Railway
echo -e "\n${YELLOW}2. Connexion à Railway...${NC}"
railway login

# 3. Lier le projet
echo -e "\n${YELLOW}3. Liaison du projet Railway...${NC}"
cd /Users/floriace/MERP
railway link

# 4. Corriger les appels API hardcodés
echo -e "\n${YELLOW}4. Correction des appels API hardcodés...${NC}"
node scripts/fix-hardcoded-apis.js

# 5. Supprimer les mocks
echo -e "\n${YELLOW}5. Suppression des mocks...${NC}"
node scripts/remove-mocks.js

# 6. Moderniser comptabilité
echo -e "\n${YELLOW}6. Modernisation module comptabilité...${NC}"
node scripts/modernize-accounting.js

# 7. Moderniser trésorerie
echo -e "\n${YELLOW}7. Modernisation module trésorerie...${NC}"
node scripts/modernize-treasury.js

# 8. Vérifier les erreurs
echo -e "\n${YELLOW}8. Vérification des erreurs...${NC}"
node scripts/check-errors.js

echo -e "\n${GREEN}✅ Corrections terminées!${NC}"
