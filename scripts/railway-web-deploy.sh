#!/bin/bash

# Script pour déployer BMS sur Railway via l'interface web

echo "🚀 DÉPLOIEMENT BMS SUR RAILWAY - INTERFACE WEB"
echo "=============================================="
echo ""

PROJECT_URL="https://railway.com/project/a003a9ae-d435-4d5a-a29a-f2d3f9c0f910"

echo "✅ Projet Railway créé avec succès !"
echo "   Nom: BMS"
echo "   URL: $PROJECT_URL"
echo ""

echo "📋 ÉTAPES À SUIVRE (via Interface Web)"
echo "======================================"
echo ""

echo "1️⃣  OUVRIR LE PROJET:"
echo "   Je vais ouvrir automatiquement l'interface Railway..."
echo ""

# Ouvrir l'URL dans le navigateur
open "$PROJECT_URL" 2>/dev/null || xdg-open "$PROJECT_URL" 2>/dev/null || echo "   Ouvrez manuellement: $PROJECT_URL"

sleep 2

echo "2️⃣  DÉPLOYER LE BACKEND (API):"
echo "   • Cliquez sur 'New Service' → 'GitHub Repo'"
echo "   • Sélectionnez: flori92/financia"
echo "   • Root Directory: railway-deploy/backend"
echo "   • Variables d'environnement:"
echo "     - NODE_ENV=production"
echo "     - PORT=3001"
echo "     - JWT_SECRET=bms_jwt_secret_$(date +%s)"
echo ""

echo "3️⃣  AJOUTER POSTGRESQL:"
echo "   • Cliquez sur 'New Service' → 'Database' → 'PostgreSQL'"
echo "   • Railway configure automatiquement DATABASE_URL"
echo ""

echo "4️⃣  DÉPLOYER LE FRONTEND:"
echo "   • Cliquez sur 'New Service' → 'GitHub Repo'"
echo "   • Sélectionnez: flori92/financia"
echo "   • Root Directory: railway-deploy/frontend"
echo "   • Variables d'environnement:"
echo "     - NODE_ENV=production"
echo "     - PORT=3000"
echo "     - NEXT_PUBLIC_API_URL=[URL du backend]"
echo ""

echo "⏱️  TEMPS ESTIMÉ: 10-15 minutes pour le premier déploiement"
echo ""

echo "🌐 URLS APRÈS DÉPLOIEMENT:"
echo "=========================="
echo "Frontend: https://[votre-frontend].up.railway.app"
echo "Demo:     https://[votre-frontend].up.railway.app/demo.html"
echo "Backend:  https://[votre-backend].up.railway.app"
echo ""

echo "🎯 POUR LA PRÉSENTATION CLIENT:"
echo "==============================="
echo "Utilisez la page /demo.html qui contient:"
echo "• Dashboard avec KPI (CA: 3.5M XOF, Marge: 40%)"
echo "• Graphiques d'évolution sur 12 mois"
echo "• Top clients et fournisseurs"
echo "• Mobile Money (25 transactions)"
echo "• Balance Âgée (créances/dettes)"
echo ""

echo "📖 GUIDE COMPLET: Consultez RAILWAY_DEPLOY_GUIDE.md"
echo ""

echo "✨ INTERFACE RAILWAY OUVERTE - SUIVEZ LES ÉTAPES CI-DESSUS ✨"
