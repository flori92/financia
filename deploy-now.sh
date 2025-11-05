#!/bin/bash

echo "🚀 Déploiement Rapide sur Railway"
echo "=================================="
echo ""

# Vérifier Railway CLI
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI non installé"
    exit 1
fi

echo "✅ Railway CLI installé"
echo ""

# Se connecter
echo "📡 Connexion à Railway..."
railway login

echo ""
echo "🔗 Liaison du projet..."
railway link

echo ""
echo "🎨 Déploiement du Frontend..."
cd bms-web
railway up --service frontend

echo ""
echo "✅ Déploiement terminé!"
echo ""
echo "📊 Vérifier le déploiement:"
echo "   railway logs --service frontend"
echo ""
echo "🌐 URL de production:"
echo "   https://bms-frontend-production.up.railway.app"
