#!/bin/bash

echo "🚀 Déploiement du backend BMS sur Netlify..."

# Vérifier si Netlify CLI est installé
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI n'est pas installé. Installation..."
    npm install -g netlify-cli
fi

# Aller dans le dossier backend-netlify
cd backend-netlify

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Déployer sur Netlify
echo "🌐 Déploiement sur Netlify..."
netlify deploy --prod --dir=. --site=bms-api-netlify

echo "✅ Backend déployé avec succès !"
echo "🔗 URL: https://bms-api-netlify.netlify.app"
