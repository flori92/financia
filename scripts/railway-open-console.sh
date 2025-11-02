#!/bin/bash

# Script pour ouvrir la console Railway et guider le déploiement

PROJECT_URL="https://railway.com/project/a003a9ae-d435-4d5a-a29a-f2d3f9c0f910"

clear

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     🚀 BMS - DÉPLOIEMENT RAILWAY AUTOMATISÉ 🚀             ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 INFORMATIONS PROJET"
echo "======================"
echo "Projet ID  : a003a9ae-d435-4d5a-a29a-f2d3f9c0f910"
echo "Repository : flori92/financia"
echo "Branch     : clean-main"
echo ""

echo "🎯 SERVICES À CRÉER (3)"
echo "======================="
echo ""
echo "1️⃣  PostgreSQL Database"
echo "   → + New → Database → Add PostgreSQL"
echo "   → Nom: bms-database"
echo ""
echo "2️⃣  Backend API (NestJS)"
echo "   → + New → GitHub Repo → flori92/financia"
echo "   → Root: railway-deploy/backend"
echo "   → Variables:"
echo "     • NODE_ENV=production"
echo "     • PORT=3001"
echo "     • JWT_SECRET=bms_jwt_secret_1762048259"
echo "     • DATABASE_URL=\${{Postgres.DATABASE_URL}}"
echo "   → Generate Domain"
echo ""
echo "3️⃣  Frontend Web (Next.js)"
echo "   → + New → GitHub Repo → flori92/financia"
echo "   → Root: railway-deploy/frontend"
echo "   → Variables:"
echo "     • NODE_ENV=production"
echo "     • PORT=3000"
echo "     • NEXT_PUBLIC_API_URL=https://[backend-url].railway.app"
echo "   → Generate Domain"
echo ""

echo "⏱️  TEMPS ESTIMÉ: 10-15 minutes"
echo ""

echo "🎭 URL DÉMO POUR CLIENT"
echo "======================="
echo "https://[frontend-url].railway.app/demo.html"
echo ""

echo "📖 GUIDE COMPLET: Consultez RAILWAY_QUICK_START.md"
echo ""

read -p "📱 Ouvrir la console Railway maintenant ? [O/n] " response
response=${response:-O}

if [[ $response =~ ^[Oo]$ ]]; then
    echo ""
    echo "🌐 Ouverture de Railway..."
    open "$PROJECT_URL" 2>/dev/null || xdg-open "$PROJECT_URL" 2>/dev/null || echo "Ouvrez: $PROJECT_URL"
    echo ""
    echo "✅ Console Railway ouverte !"
    echo ""
    echo "👉 Suivez les étapes ci-dessus pour créer les 3 services"
else
    echo ""
    echo "👉 Ouvrez manuellement: $PROJECT_URL"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 BMS prêt pour déploiement Railway ! 🎉"
echo "═══════════════════════════════════════════════════════════"
echo ""
