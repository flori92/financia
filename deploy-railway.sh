#!/bin/bash

echo "🚂 Déploiement BMS sur Railway"
echo "================================"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Vérifier Railway CLI
if ! command -v railway &> /dev/null; then
    echo -e "${RED}❌ Railway CLI non installé${NC}"
    echo "Installation: brew install railway"
    exit 1
fi

echo -e "${GREEN}✅ Railway CLI installé${NC}\n"

# Se connecter
echo -e "${YELLOW}📡 Connexion à Railway...${NC}"
railway login

# Lier le projet
echo -e "\n${YELLOW}🔗 Liaison du projet...${NC}"
railway link

# Déployer le backend
echo -e "\n${BLUE}🔧 Déploiement du Backend...${NC}"
cd bms/api-gateway
railway up --service backend

# Déployer le frontend
echo -e "\n${BLUE}🎨 Déploiement du Frontend...${NC}"
cd ../../bms-web
railway up --service frontend

# Afficher les URLs
echo -e "\n${GREEN}✅ Déploiement terminé!${NC}\n"
echo -e "${YELLOW}📊 URLs des services:${NC}"
railway status

echo -e "\n${GREEN}🎉 BMS déployé avec succès sur Railway!${NC}"
