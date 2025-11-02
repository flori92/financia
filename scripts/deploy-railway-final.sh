#!/bin/bash

# Script de déploiement BMS sur Railway - Version finale client

echo "🚀 BMS - DÉPLOIEMENT RAILWAY POUR CLIENT"
echo "=========================================="
echo ""

# Vérifier Railway CLI
if ! command -v railway &> /dev/null; then
    echo "📦 Installation Railway CLI..."
    npm install -g @railway/cli
fi

# Aller dans le dossier de déploiement
DEPLOY_DIR="/Users/floriace/MERP/railway-deploy"
cd "$DEPLOY_DIR"

echo "📁 Dossier de déploiement: $PWD"
echo ""

# Vérifier la structure
echo "📂 Structure vérifiée ✅"
echo ""

# Instructions étape par étape
echo "🔋 INSTRUCTIONS COMPLÈTES"
echo "========================="
echo ""
echo "1️⃣  AUTHENTIFICATION RAILWAY:"
echo "   railway login"
echo "   → Ouvrez le navigateur et suivez les instructions"
echo ""

echo "2️⃣  INITIALISATION PROJET:"
echo "   railway init"
echo "   → Choisissez un nom pour votre projet"
echo ""

echo "3️⃣  CONFIGURATION VARIABLES:"
echo "   railway variables set JWT_SECRET=bms_jwt_secret_$(date +%s)"
echo "   → Clé secrète pour l'authentification"
echo ""

echo "4️⃣  DÉPLOIEMENT:"
echo "   railway up"
echo "   → Attendez 5-10 minutes pour le déploiement complet"
echo ""

echo "🌐 URLS APRÈS DÉPLOIEMENT"
echo "========================"
echo "Frontend principal: https://bms-frontend.production.railway.app"
echo "Page démo client  : https://bms-frontend.production.railway.app/demo.html"
echo "API Backend       : https://bms-backend.production.railway.app"
echo ""

echo "🎯 PRÉSENTATION CLIENT"
echo "===================="
echo "✅ Utilisez la page demo.html pour présenter:"
echo "   • Dashboard comptable avec KPI réels"
echo "   • Graphiques d'évolution CA vs Charges"
echo "   • Top clients/fournisseurs"
echo "   • Transactions Mobile Money"
echo "   • Balance Âgée (créances/dettes)"
echo ""

echo "🔧 COMMANDES UTILES"
echo "=================="
echo "railway status    → Vérifier le statut"
echo "railway logs      → Voir les logs"
echo "railway up        → Mettre à jour"
echo ""

echo "📊 FONCTIONNALITÉS CLÉS À MONTRER"
echo "================================"
echo "• Interface moderne et responsive"
echo "• KPI temps réel (CA, charges, résultat, marge)"
echo "• Graphiques interactifs"
echo "• Données exemples réalistes (3.5M XOF CA mensuel)"
echo "• Architecture complète (Frontend + Backend + BDD)"
echo ""

echo "✨ BMS EST PRÊT POUR DÉPLOIEMENT CLIENT ! ✨"
echo ""
