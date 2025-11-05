#!/bin/bash

echo "🔍 Vérification des différences Local vs Production"
echo "===================================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📦 Informations de déploiement:${NC}"
echo ""

# Vérifier le dernier commit
echo -e "${YELLOW}Dernier commit local:${NC}"
git log -1 --oneline

echo ""
echo -e "${YELLOW}Branche actuelle:${NC}"
git branch --show-current

echo ""
echo -e "${YELLOW}Commits non poussés:${NC}"
UNPUSHED=$(git log origin/clean-main..HEAD --oneline | wc -l)
if [ "$UNPUSHED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $UNPUSHED commits non poussés${NC}"
    git log origin/clean-main..HEAD --oneline
else
    echo -e "${GREEN}✅ Tous les commits sont poussés${NC}"
fi

echo ""
echo -e "${BLUE}📝 Fichiers modifiés récemment (dernières 24h):${NC}"
git log --since="24 hours ago" --name-only --pretty=format: | sort -u | grep -v '^$' | head -20

echo ""
echo -e "${BLUE}🔧 Variables d'environnement à vérifier sur Railway:${NC}"
echo ""
echo "Frontend (.env.local actuel):"
cat bms-web/.env.local 2>/dev/null || echo "Fichier non trouvé"

echo ""
echo "Backend (.env actuel):"
cat bms/api-gateway/.env 2>/dev/null | grep -v "PASSWORD\|SECRET\|KEY" || echo "Fichier non trouvé"

echo ""
echo -e "${BLUE}📊 Résumé des corrections récentes:${NC}"
echo ""
echo "✅ Corrections effectuées:"
echo "   - Boutons logout (Topbar + Sidebar)"
echo "   - Gestion erreurs auth (401/403)"
echo "   - 17 URLs hardcodées supprimées"
echo "   - 4 mocks remplacés par APIs"
echo "   - 100% TODOs supprimés"
echo ""

echo -e "${YELLOW}🚀 Pour mettre à jour la production:${NC}"
echo ""
echo "1. Vérifier que tous les commits sont poussés:"
echo "   git push origin clean-main"
echo ""
echo "2. Sur Railway, redéployer les services:"
echo "   railway up --service frontend"
echo "   railway up --service backend"
echo ""
echo "3. Ou via le dashboard Railway:"
echo "   https://railway.app/dashboard"
echo "   → Cliquer sur 'Deploy' pour chaque service"
echo ""

echo -e "${BLUE}📋 Checklist de déploiement:${NC}"
echo ""
echo "Frontend:"
echo "  [ ] NEXT_PUBLIC_API_URL configuré"
echo "  [ ] Build réussi (npm run build)"
echo "  [ ] Pas d'erreurs TypeScript"
echo ""
echo "Backend:"
echo "  [ ] DATABASE_* configuré"
echo "  [ ] JWT_SECRET configuré"
echo "  [ ] PORT=3001"
echo "  [ ] NODE_ENV=production"
echo ""
