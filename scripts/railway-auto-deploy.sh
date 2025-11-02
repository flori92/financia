#!/bin/bash

# Script de déploiement automatisé BMS avec Railway CLI

set -e

export RAILWAY_TOKEN="efcce6ba-3408-4910-bb4e-9cefbf47a412"
PROJECT_ID="a003a9ae-d435-4d5a-a29a-f2d3f9c0f910"

echo "🚀 DÉPLOIEMENT AUTOMATIQUE BMS SUR RAILWAY"
echo "==========================================="
echo ""

cd /Users/floriace/MERP/railway-deploy

echo "📊 Vérification du projet..."
railway link $PROJECT_ID
echo "✅ Projet lié"
echo ""

echo "🗄️  Création et déploiement des services via Railway..."
echo ""

# Railway va détecter automatiquement les configurations
# Nous allons déployer le backend et le frontend séparément

echo "📦 BACKEND: Déploiement depuis railway-deploy/backend..."
cd backend
railway up --service bms-backend --detach || railway up --detach
echo "✅ Backend en cours de déploiement"
cd ..
echo ""

echo "🌐 FRONTEND: Déploiement depuis railway-deploy/frontend..."
cd frontend  
railway up --service bms-frontend --detach || railway up --detach
echo "✅ Frontend en cours de déploiement"
cd ..
echo ""

echo "🎉 DÉPLOIEMENTS LANCÉS !"
echo "========================"
echo ""
echo "⏱️  Temps estimé: 10-15 minutes"
echo ""
echo "🌐 SUIVI EN TEMPS RÉEL:"
echo "https://railway.com/project/$PROJECT_ID"
echo ""
echo "📊 VOIR LES LOGS:"
echo "railway logs"
echo ""
echo "✨ Les services se déploient maintenant automatiquement ! ✨"
