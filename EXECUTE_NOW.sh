#!/bin/bash

# Script d'exécution rapide pour BMS
# Auteur: Kiro AI
# Date: 19 Octobre 2025

set -e  # Exit on error

echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   🚀 BMS - Exécution RBAC & Audit                   ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Fonction pour afficher les étapes
step() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Vérifier qu'on est dans le bon répertoire
if [ ! -d "bms/api-gateway" ]; then
    error "Erreur: Répertoire bms/api-gateway non trouvé"
    error "Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

cd bms/api-gateway

echo "📦 Étape 1: Vérification des dépendances..."
if [ ! -d "node_modules" ]; then
    warning "node_modules non trouvé, installation en cours..."
    npm install
    step "Dépendances installées"
else
    step "Dépendances OK"
fi

echo ""
echo "🗄️  Étape 2: Migrations de la base de données..."
echo "   Voulez-vous lancer les migrations ? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    npm run typeorm migration:run || warning "Migrations échouées (peut-être déjà appliquées)"
    step "Migrations terminées"
else
    warning "Migrations ignorées"
fi

echo ""
echo "🌱 Étape 3: Seed des permissions..."
echo "   Voulez-vous seed les permissions ? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    npm run seed || warning "Seed échoué"
    step "Seed terminé"
else
    warning "Seed ignoré"
fi

echo ""
echo "🔍 Étape 4: Vérification TypeScript..."
npx tsc --noEmit && step "Aucune erreur TypeScript" || error "Erreurs TypeScript détectées"

echo ""
echo "🧪 Étape 5: Tests..."
echo "   Voulez-vous lancer les tests ? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    npm run test || warning "Tests échoués"
    step "Tests terminés"
else
    warning "Tests ignorés"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════╗"
echo "║                                                       ║"
echo "║   ✅ CONFIGURATION TERMINÉE                          ║"
echo "║                                                       ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""
echo "🚀 Pour démarrer le serveur:"
echo "   cd bms/api-gateway"
echo "   npm run start:dev"
echo ""
echo "📚 Documentation:"
echo "   - RBAC_IMPLEMENTATION_GUIDE.md"
echo "   - BMS_COMPREHENSIVE_STATUS_REPORT.md"
echo "   - EXECUTION_COMPLETE.md"
echo ""
echo "🧪 Pour tester l'API:"
echo "   curl -X POST http://localhost:3001/api/v1/auth/login \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\": \"admin@bms.com\", \"password\": \"password\"}'"
echo ""
echo "📊 Swagger UI:"
echo "   http://localhost:3001/api/docs"
echo ""
