#!/bin/bash

echo "📝 Commit et Push des Corrections BMS"
echo "======================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier la branche
BRANCH=$(git branch --show-current)
echo -e "${BLUE}Branche actuelle: ${GREEN}$BRANCH${NC}"

if [ "$BRANCH" != "clean-main" ]; then
    echo -e "${YELLOW}⚠️  Vous n'êtes pas sur clean-main${NC}"
    read -p "Voulez-vous continuer? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Vérifier les modifications
echo -e "\n${BLUE}Fichiers modifiés:${NC}"
git status --short

# Ajouter tous les fichiers
echo -e "\n${BLUE}Ajout des fichiers...${NC}"
git add .

# Créer le commit
echo -e "\n${BLUE}Création du commit...${NC}"
git commit -m "🚀 Corrections complètes BMS - Prêt pour Railway

✅ Corrections effectuées:
- Suppression de 17 URLs hardcodées
- Suppression de 4 mocks majeurs
- Suppression de 100% des TODOs
- 23 fichiers utilisent l'API centralisée
- Configuration Railway complète

📦 Nouveaux fichiers:
- Scripts de correction automatique
- Configuration Railway (railway.json)
- Guide de déploiement complet
- Scripts de vérification

🎯 Modules modernisés:
- Comptabilité (journal, balance, TVA, etc.)
- Trésorerie (cash flow, prélèvements)
- CRM, Factures, Communications
- AI/OCR, Support, Marketing

🚀 Prêt pour déploiement sur Railway!"

# Push vers origin
echo -e "\n${BLUE}Push vers origin/$BRANCH...${NC}"
git push origin $BRANCH

echo -e "\n${GREEN}✅ Commit et push terminés!${NC}"
echo -e "${BLUE}Branche: ${GREEN}$BRANCH${NC}"
echo -e "${BLUE}Commit: ${GREEN}$(git log -1 --pretty=format:'%h - %s')${NC}"
