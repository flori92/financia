#!/bin/bash

echo "🚀 Démarrage Rapide - Déploiement BMS sur Railway"
echo "=================================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# Fonction pour afficher les étapes
step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Vérifications préalables
step "Étape 1: Vérifications préalables"

if ! command -v railway &> /dev/null; then
    error "Railway CLI non installé"
    echo "Installation: brew install railway"
    exit 1
fi
success "Railway CLI installé"

if ! command -v node &> /dev/null; then
    error "Node.js non installé"
    exit 1
fi
success "Node.js installé"

if ! command -v git &> /dev/null; then
    error "Git non installé"
    exit 1
fi
success "Git installé"

# Vérifier la branche
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "clean-main" ]; then
    warning "Vous êtes sur la branche $BRANCH"
    read -p "Voulez-vous continuer? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    success "Sur la branche clean-main"
fi

# Connexion Railway
step "Étape 2: Connexion à Railway"
echo "Veuillez vous connecter à Railway..."
railway login
success "Connecté à Railway"

# Créer ou lier le projet
step "Étape 3: Configuration du projet"
echo "Voulez-vous:"
echo "1) Créer un nouveau projet"
echo "2) Lier un projet existant"
read -p "Votre choix (1 ou 2): " choice

if [ "$choice" = "1" ]; then
    railway init
    success "Nouveau projet créé"
elif [ "$choice" = "2" ]; then
    railway link
    success "Projet lié"
else
    error "Choix invalide"
    exit 1
fi

# Ajouter PostgreSQL
step "Étape 4: Ajout de PostgreSQL"
read -p "Voulez-vous ajouter PostgreSQL? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    railway add postgresql
    success "PostgreSQL ajouté"
fi

# Créer les services
step "Étape 5: Création des services"

echo "Création du service backend..."
railway service create backend
success "Service backend créé"

echo "Création du service frontend..."
railway service create frontend
success "Service frontend créé"

# Configuration des variables d'environnement
step "Étape 6: Configuration des variables d'environnement"

echo "Génération des secrets..."
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo "Configuration du backend..."
railway variables --service backend set \
  JWT_SECRET="$JWT_SECRET" \
  JWT_EXPIRATION="7d" \
  JWT_REFRESH_EXPIRATION="30d" \
  PORT="3001" \
  NODE_ENV="production"

success "Variables backend configurées"

echo ""
warning "IMPORTANT: Vous devez configurer manuellement:"
echo "  1. DATABASE_* (après ajout de PostgreSQL)"
echo "  2. NEXT_PUBLIC_API_URL dans le frontend (URL du backend)"
echo "  3. NEXTAUTH_URL dans le frontend (URL du frontend)"
echo ""
echo "NEXTAUTH_SECRET généré: $NEXTAUTH_SECRET"
echo "Sauvegardez-le pour la configuration frontend!"
echo ""

read -p "Appuyez sur Entrée pour continuer..."

# Déploiement
step "Étape 7: Déploiement"

echo "Déploiement du backend..."
cd bms/api-gateway
railway up --service backend
success "Backend déployé"

echo ""
echo "Déploiement du frontend..."
cd ../../bms-web
railway up --service frontend
success "Frontend déployé"

cd ../..

# Génération des domaines
step "Étape 8: Génération des domaines"

echo "Génération du domaine backend..."
railway domain --service backend
BACKEND_URL=$(railway domain --service backend 2>&1 | grep -o 'https://[^ ]*')
success "Domaine backend: $BACKEND_URL"

echo ""
echo "Génération du domaine frontend..."
railway domain --service frontend
FRONTEND_URL=$(railway domain --service frontend 2>&1 | grep -o 'https://[^ ]*')
success "Domaine frontend: $FRONTEND_URL"

# Configuration finale
step "Étape 9: Configuration finale"

echo "Configuration des URLs..."
railway variables --service frontend set \
  NEXT_PUBLIC_API_URL="$BACKEND_URL" \
  NEXTAUTH_URL="$FRONTEND_URL" \
  NEXTAUTH_SECRET="$NEXTAUTH_SECRET"

success "Configuration finale terminée"

# Résumé
step "🎉 Déploiement Terminé!"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Votre application BMS est déployée!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📊 URLs de vos services:${NC}"
echo -e "   Frontend: ${GREEN}$FRONTEND_URL${NC}"
echo -e "   Backend:  ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${BLUE}🔑 Secrets générés:${NC}"
echo -e "   JWT_SECRET: ${YELLOW}$JWT_SECRET${NC}"
echo -e "   NEXTAUTH_SECRET: ${YELLOW}$NEXTAUTH_SECRET${NC}"
echo ""
echo -e "${BLUE}📝 Prochaines étapes:${NC}"
echo "   1. Vérifier les logs: railway logs --service backend"
echo "   2. Vérifier les logs: railway logs --service frontend"
echo "   3. Tester l'application: $FRONTEND_URL"
echo "   4. Vérifier le healthcheck: $BACKEND_URL/api/v1/health"
echo ""
echo -e "${YELLOW}⚠️  N'oubliez pas de:${NC}"
echo "   - Configurer les variables DATABASE_* si PostgreSQL est ajouté"
echo "   - Configurer les services tiers (SendGrid, Twilio, etc.)"
echo "   - Exécuter les migrations de base de données"
echo ""
echo -e "${GREEN}🎊 Félicitations! Votre BMS est en production!${NC}"
