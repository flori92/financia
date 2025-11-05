#!/bin/bash

# 🚀 Script de Déploiement Production BMS ERP
# Mode Démo avec Po le Panda

echo "🚀 Déploiement BMS ERP en Production"
echo "======================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier la branche actuelle
current_branch=$(git branch --show-current)
echo -e "${BLUE}📍 Branche actuelle: $current_branch${NC}"

if [ "$current_branch" != "clean-main" ]; then
    echo -e "${YELLOW}⚠️  Vous n'êtes pas sur clean-main${NC}"
    echo "Voulez-vous basculer sur clean-main ? (o/n)"
    read -r switch_branch
    if [ "$switch_branch" = "o" ] || [ "$switch_branch" = "O" ]; then
        git checkout clean-main
        echo -e "${GREEN}✅ Basculé sur clean-main${NC}"
    else
        echo -e "${RED}❌ Déploiement annulé${NC}"
        exit 1
    fi
fi

# Vérifier qu'on est à jour
echo ""
echo -e "${BLUE}📥 Vérification des mises à jour...${NC}"
git fetch origin

# Comparer avec origin
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/clean-main)

if [ "$LOCAL" != "$REMOTE" ]; then
    echo -e "${YELLOW}⚠️  Votre branche n'est pas synchronisée avec origin${NC}"
    echo "Voulez-vous pull les dernières modifications ? (o/n)"
    read -r pull_changes
    if [ "$pull_changes" = "o" ] || [ "$pull_changes" = "O" ]; then
        git pull origin clean-main
        echo -e "${GREEN}✅ Mis à jour avec origin${NC}"
    fi
fi

# Afficher les derniers commits
echo ""
echo -e "${BLUE}📝 Derniers commits:${NC}"
git log --oneline -5
echo ""

# Vérifier les fichiers modifiés non commités
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}⚠️  Vous avez des fichiers modifiés non commités${NC}"
    git status --short
    echo ""
    echo "Voulez-vous les commiter maintenant ? (o/n)"
    read -r commit_changes
    if [ "$commit_changes" = "o" ] || [ "$commit_changes" = "O" ]; then
        echo "Message du commit:"
        read -r commit_message
        git add -A
        git commit -m "$commit_message"
        git push origin clean-main
        echo -e "${GREEN}✅ Changements commités et poussés${NC}"
    fi
fi

# Checklist pré-déploiement
echo ""
echo -e "${BLUE}📋 Checklist Pré-Déploiement${NC}"
echo "======================================"
echo ""

echo "✅ 1. Code commité et poussé sur clean-main"
echo "✅ 2. Tests locaux passés"
echo "✅ 3. Variables d'environnement configurées dans Railway"
echo "✅ 4. Mot de passe Gmail app créé"
echo ""

echo "Tout est prêt pour le déploiement ? (o/n)"
read -r ready_deploy

if [ "$ready_deploy" != "o" ] && [ "$ready_deploy" != "O" ]; then
    echo -e "${RED}❌ Déploiement annulé${NC}"
    exit 1
fi

# Options de déploiement
echo ""
echo -e "${BLUE}🚂 Options de Déploiement${NC}"
echo "======================================"
echo ""
echo "1. Railway CLI (Recommandé)"
echo "2. Ouvrir Railway Dashboard"
echo "3. Vérifier le statut uniquement"
echo "4. Annuler"
echo ""
echo "Choisissez une option (1-4):"
read -r deploy_option

case $deploy_option in
    1)
        echo ""
        echo -e "${BLUE}🚂 Déploiement via Railway CLI${NC}"
        
        # Vérifier si Railway CLI est installé
        if ! command -v railway &> /dev/null; then
            echo -e "${YELLOW}⚠️  Railway CLI n'est pas installé${NC}"
            echo "Voulez-vous l'installer maintenant ? (o/n)"
            read -r install_railway
            if [ "$install_railway" = "o" ] || [ "$install_railway" = "O" ]; then
                npm install -g @railway/cli
                echo -e "${GREEN}✅ Railway CLI installé${NC}"
            else
                echo -e "${RED}❌ Déploiement annulé${NC}"
                exit 1
            fi
        fi
        
        # Se connecter à Railway
        echo ""
        echo -e "${BLUE}🔐 Connexion à Railway...${NC}"
        railway login
        
        # Déployer le frontend
        echo ""
        echo -e "${BLUE}📦 Déploiement du Frontend...${NC}"
        cd railway-deploy/frontend || exit
        railway up
        
        echo ""
        echo -e "${GREEN}✅ Déploiement lancé !${NC}"
        echo "Vérifiez le statut dans Railway Dashboard"
        ;;
        
    2)
        echo ""
        echo -e "${BLUE}🌐 Ouverture de Railway Dashboard...${NC}"
        open "https://railway.app" || xdg-open "https://railway.app"
        echo ""
        echo "📝 Instructions:"
        echo "1. Sélectionnez le projet BMS ERP"
        echo "2. Cliquez sur le service Frontend"
        echo "3. Onglet Deployments"
        echo "4. Cliquez sur 'Deploy Now'"
        ;;
        
    3)
        echo ""
        echo -e "${BLUE}📊 Vérification du statut...${NC}"
        
        if command -v railway &> /dev/null; then
            cd railway-deploy/frontend || exit
            railway status
        else
            echo -e "${YELLOW}⚠️  Railway CLI non installé${NC}"
            echo "Ouvrez Railway Dashboard manuellement"
        fi
        ;;
        
    4)
        echo -e "${RED}❌ Déploiement annulé${NC}"
        exit 0
        ;;
        
    *)
        echo -e "${RED}❌ Option invalide${NC}"
        exit 1
        ;;
esac

# Post-déploiement
echo ""
echo -e "${BLUE}🧪 Tests Post-Déploiement${NC}"
echo "======================================"
echo ""
echo "Attendez 3-5 minutes pour que le build se termine"
echo ""
echo "Ensuite, testez :"
echo "✅ 1. Landing page: https://votre-domaine.com/"
echo "✅ 2. Mode démo: https://votre-domaine.com/demo-preview"
echo "✅ 3. Po apparaît en cliquant sur une section"
echo "✅ 4. Formulaire de contact fonctionne"
echo "✅ 5. Email reçu sur florifavi@gmail.com"
echo ""
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo ""
echo "📚 Consultez DEPLOIEMENT_PRODUCTION.md pour plus de détails"
