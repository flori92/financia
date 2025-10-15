#!/bin/bash

# ========================================
# BMS - Setup Développement
# ========================================

set -e

echo "╔═══════════════════════════════════════════════════╗"
echo "║                                                   ║"
echo "║   💼 BMS - Setup Développement                   ║"
echo "║                                                   ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier les prérequis
echo -e "${BLUE}[1/6] Vérification des prérequis...${NC}"

command -v node >/dev/null 2>&1 || { echo "❌ Node.js n'est pas installé. Installation requise."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm n'est pas installé. Installation requise."; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python 3 n'est pas installé. Installation requise."; exit 1; }
command -v docker >/dev/null 2>&1 || { echo "⚠️  Docker n'est pas installé. Recommandé pour PostgreSQL/Redis."; }

echo -e "${GREEN}✅ Prérequis OK${NC}"
echo ""

# Docker compose pour les services
echo -e "${BLUE}[2/6] Démarrage des services (PostgreSQL, Redis, RabbitMQ)...${NC}"

if command -v docker-compose >/dev/null 2>&1; then
    cd "$(dirname "$0")/.."
    docker-compose up -d postgres redis rabbitmq
    echo -e "${GREEN}✅ Services démarrés${NC}"
    
    # Attendre que PostgreSQL soit prêt
    echo "⏳ Attente de PostgreSQL..."
    sleep 5
else
    echo -e "${YELLOW}⚠️  Docker Compose non disponible. Configurez PostgreSQL et Redis manuellement.${NC}"
fi
echo ""

# Configuration API Gateway
echo -e "${BLUE}[3/6] Installation API Gateway (NestJS)...${NC}"
cd api-gateway

if [ ! -f ".env" ]; then
    echo "📝 Création du fichier .env..."
    cat > .env << EOF
# API Gateway Configuration
NODE_ENV=development
PORT=3001

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=bms
DB_PASSWORD=bms_dev_password
DB_NAME=bms

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Flutterwave (Sandbox)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-XXXXX
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-XXXXX
FLUTTERWAVE_ENCRYPTION_KEY=FLWSECK_TEST-XXXXX
EOF
fi

npm install
echo -e "${GREEN}✅ API Gateway configurée${NC}"
cd ..
echo ""

# Configuration Mobile
echo -e "${BLUE}[4/6] Installation Application Mobile...${NC}"
cd mobile
npm install
echo -e "${GREEN}✅ Application mobile configurée${NC}"
cd ..
echo ""

# Configuration Web Admin
echo -e "${BLUE}[5/6] Installation Web Admin (Next.js)...${NC}"
if [ -d "web-admin" ]; then
    cd web-admin
    
    if [ ! -f ".env.local" ]; then
        echo "📝 Création du fichier .env.local..."
        cat > .env.local << EOF
# Web Admin Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENV=development
EOF
    fi
    
    npm install
    echo -e "${GREEN}✅ Web admin configuré${NC}"
    cd ..
fi
echo ""

# Résumé
echo -e "${BLUE}[6/6] Résumé de l'installation${NC}"
echo ""
echo "╔═══════════════════════════════════════════════════╗"
echo "║   ✅ Installation terminée !                      ║"
echo "╚═══════════════════════════════════════════════════╝"
echo ""
echo "📦 Services disponibles:"
echo "  - PostgreSQL:   localhost:5432"
echo "  - Redis:        localhost:6379"
echo "  - RabbitMQ:     localhost:5672 (UI: 15672)"
echo ""
echo "🚀 Pour démarrer:"
echo ""
echo "  1. API Gateway:"
echo "     cd api-gateway && npm run start:dev"
echo ""
echo "  2. Application Mobile:"
echo "     cd mobile && npm start"
echo "     npx react-native run-android  # ou run-ios"
echo ""
echo "  3. Web Admin:"
echo "     cd web-admin && npm run dev"
echo ""
echo "📚 Documentation:"
echo "  - API Docs: http://localhost:3001/api/docs"
echo ""
echo "🔐 Accès base de données:"
echo "  psql -h localhost -U bms -d bms"
echo "  Mot de passe: bms_dev_password"
echo ""
echo -e "${GREEN}Bon développement ! 🎉${NC}"
