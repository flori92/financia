#!/bin/bash

# Script de vérification de la compilation BMS
# Usage: ./check-build.sh

set -e

echo "🔍 Vérification de la compilation BMS"
echo "======================================"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier le backend
echo ""
echo "📦 Vérification du backend..."
cd bms/api-gateway

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules manquant, installation...${NC}"
    npm install
fi

echo "🔨 Compilation TypeScript..."
if npm run build; then
    echo -e "${GREEN}✅ Backend compilé avec succès${NC}"
else
    echo -e "${RED}❌ Erreur de compilation du backend${NC}"
    exit 1
fi

cd ../..

# Vérifier le frontend
echo ""
echo "🎨 Vérification du frontend..."
cd bms-web

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules manquant, installation...${NC}"
    npm install
fi

echo "🔨 Compilation Next.js..."
if npm run build; then
    echo -e "${GREEN}✅ Frontend compilé avec succès${NC}"
else
    echo -e "${RED}❌ Erreur de compilation du frontend${NC}"
    exit 1
fi

cd ..

echo ""
echo -e "${GREEN}🎉 Toutes les vérifications sont passées !${NC}"
echo ""
echo "Prochaines étapes :"
echo "1. Exécuter les migrations : cd bms/api-gateway && npm run typeorm migration:run"
echo "2. Démarrer les services : ./start-bms.sh"
echo "3. Tester l'application : http://localhost:3000"
