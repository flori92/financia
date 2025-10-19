#!/bin/bash

echo "🚀 Installation de BMS..."

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js n'est pas installé${NC}"
    echo "Installez Node.js depuis https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v) détecté${NC}"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm n'est pas installé${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm -v) détecté${NC}"

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}⚠️  Docker n'est pas installé (optionnel)${NC}"
else
    echo -e "${GREEN}✅ Docker $(docker -v) détecté${NC}"
fi

# Installation API Gateway
echo -e "\n${BLUE}📦 Installation de l'API Gateway...${NC}"
cd api-gateway
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
fi
npm install
echo -e "${GREEN}✅ Dépendances API installées${NC}"
cd ..

# Installation Web
echo -e "\n${BLUE}📦 Installation du Frontend Web...${NC}"
cd ../bms-web
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo -e "${GREEN}✅ Fichier .env.local créé${NC}"
fi
npm install
echo -e "${GREEN}✅ Dépendances Web installées${NC}"
cd ..

# Démarrer Docker Compose
echo -e "\n${BLUE}🐳 Démarrage des services Docker...${NC}"
cd bms
if command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres redis
    echo -e "${GREEN}✅ PostgreSQL et Redis démarrés${NC}"
else
    echo -e "${RED}⚠️  docker-compose non disponible${NC}"
    echo "Installez PostgreSQL et Redis manuellement"
fi

echo -e "\n${GREEN}✨ Installation terminée !${NC}"
echo -e "\n${BLUE}Prochaines étapes:${NC}"
echo "1. Configurer les variables d'environnement dans bms/api-gateway/.env"
echo "2. Démarrer l'API: cd bms/api-gateway && npm run start:dev"
echo "3. Démarrer le Web: cd bms-web && npm run dev"
echo "4. Accéder à http://localhost:3000"
echo ""
echo -e "${BLUE}Documentation API:${NC} http://localhost:3001/api/docs"
