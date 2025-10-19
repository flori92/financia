#!/bin/bash

# Script de démarrage rapide BMS
# Usage: ./start-bms.sh

set -e

echo "🚀 Démarrage de BMS - Business Management System"
echo "================================================"

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker n'est pas installé${NC}"
    echo "Installez Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose n'est pas installé${NC}"
    echo "Installez Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker et Docker Compose sont installés${NC}"

# Vérifier si les fichiers .env existent
if [ ! -f "bms/api-gateway/.env" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env manquant pour l'API${NC}"
    echo "Création du fichier .env..."
    cp bms/api-gateway/.env.example bms/api-gateway/.env 2>/dev/null || echo "Fichier .env.example non trouvé"
fi

if [ ! -f "bms-web/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Fichier .env.local manquant pour le frontend${NC}"
    echo "Création du fichier .env.local..."
    cp bms-web/.env.example bms-web/.env.local 2>/dev/null || echo "Fichier .env.example non trouvé"
fi

# Arrêter les conteneurs existants
echo ""
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down 2>/dev/null || true

# Démarrer les services
echo ""
echo "🐳 Démarrage des services Docker..."
docker-compose up -d

# Attendre que PostgreSQL soit prêt
echo ""
echo "⏳ Attente du démarrage de PostgreSQL..."
sleep 5

# Vérifier l'état des services
echo ""
echo "📊 État des services:"
docker-compose ps

# Afficher les logs
echo ""
echo "📝 Logs des services (Ctrl+C pour quitter):"
echo ""
docker-compose logs -f

# Note: Le script continuera à afficher les logs jusqu'à ce que l'utilisateur appuie sur Ctrl+C
