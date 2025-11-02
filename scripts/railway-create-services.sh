#!/bin/bash

# Script pour créer automatiquement les services Railway via API GraphQL

set -e

PROJECT_ID="a003a9ae-d435-4d5a-a29a-f2d3f9c0f910"
RAILWAY_TOKEN="efcce6ba-3408-4910-bb4e-9cefbf47a412"
API_URL="https://backboard.railway.app/graphql/v2"

echo "🚀 CRÉATION AUTOMATIQUE DES SERVICES RAILWAY"
echo "=============================================="
echo ""

# Fonction pour appeler l'API Railway
call_railway_api() {
    local query="$1"
    curl -s -X POST "$API_URL" \
        -H "Authorization: Bearer $RAILWAY_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{\"query\":\"$query\"}" 2>/dev/null
}

echo "📊 Récupération du projet..."
PROJECT_QUERY="query { project(id: \"$PROJECT_ID\") { id name environments { edges { node { id name } } } } }"
PROJECT_INFO=$(call_railway_api "$PROJECT_QUERY")

if echo "$PROJECT_INFO" | grep -q "error"; then
    echo "❌ Erreur: Impossible d'accéder au projet"
    echo "$PROJECT_INFO"
    exit 1
fi

echo "✅ Projet BMS récupéré"
echo ""

# Extraire l'environment ID (production)
ENV_ID=$(echo "$PROJECT_INFO" | grep -o '"id":"[a-f0-9-]*"' | head -2 | tail -1 | cut -d'"' -f4)
echo "Environment ID: $ENV_ID"
echo ""

# 1. Créer le service PostgreSQL
echo "🗄️  SERVICE 1/3: Création PostgreSQL..."
POSTGRES_MUTATION="mutation { serviceCreate(input: { environmentId: \"$ENV_ID\", projectId: \"$PROJECT_ID\", name: \"bms-database\", source: { image: \"postgres:15\" } }) { id name } }"

POSTGRES_RESULT=$(call_railway_api "$POSTGRES_MUTATION")
if echo "$POSTGRES_RESULT" | grep -q "id"; then
    POSTGRES_ID=$(echo "$POSTGRES_RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "✅ PostgreSQL créé: $POSTGRES_ID"
else
    echo "⚠️  PostgreSQL existe déjà ou erreur"
    echo "$POSTGRES_RESULT"
fi
echo ""

# 2. Créer le service Backend
echo "🔧 SERVICE 2/3: Création Backend API..."
BACKEND_MUTATION="mutation { serviceCreate(input: { environmentId: \"$ENV_ID\", projectId: \"$PROJECT_ID\", name: \"bms-backend\", source: { repo: \"flori92/financia\", branch: \"clean-main\" } }) { id name } }"

BACKEND_RESULT=$(call_railway_api "$BACKEND_MUTATION")
if echo "$BACKEND_RESULT" | grep -q "id"; then
    BACKEND_ID=$(echo "$BACKEND_RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "✅ Backend créé: $BACKEND_ID"
    
    # Configurer les variables backend
    echo "⚙️  Configuration variables backend..."
    BACKEND_VARS_MUTATION="mutation { variableUpsert(input: { environmentId: \"$ENV_ID\", serviceId: \"$BACKEND_ID\", name: \"NODE_ENV\", value: \"production\" }) { id } variableUpsert(input: { environmentId: \"$ENV_ID\", serviceId: \"$BACKEND_ID\", name: \"PORT\", value: \"3001\" }) { id } variableUpsert(input: { environmentId: \"$ENV_ID\", serviceId: \"$BACKEND_ID\", name: \"JWT_SECRET\", value: \"bms_jwt_secret_1762048259\" }) { id } }"
    
    call_railway_api "$BACKEND_VARS_MUTATION" > /dev/null
    echo "✅ Variables backend configurées"
else
    echo "⚠️  Backend existe déjà ou erreur"
    echo "$BACKEND_RESULT"
fi
echo ""

# 3. Créer le service Frontend
echo "🌐 SERVICE 3/3: Création Frontend..."
FRONTEND_MUTATION="mutation { serviceCreate(input: { environmentId: \"$ENV_ID\", projectId: \"$PROJECT_ID\", name: \"bms-frontend\", source: { repo: \"flori92/financia\", branch: \"clean-main\" } }) { id name } }"

FRONTEND_RESULT=$(call_railway_api "$FRONTEND_MUTATION")
if echo "$FRONTEND_RESULT" | grep -q "id"; then
    FRONTEND_ID=$(echo "$FRONTEND_RESULT" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "✅ Frontend créé: $FRONTEND_ID"
    
    # Configurer les variables frontend
    echo "⚙️  Configuration variables frontend..."
    FRONTEND_VARS_MUTATION="mutation { variableUpsert(input: { environmentId: \"$ENV_ID\", serviceId: \"$FRONTEND_ID\", name: \"NODE_ENV\", value: \"production\" }) { id } variableUpsert(input: { environmentId: \"$ENV_ID\", serviceId: \"$FRONTEND_ID\", name: \"PORT\", value: \"3000\" }) { id } }"
    
    call_railway_api "$FRONTEND_VARS_MUTATION" > /dev/null
    echo "✅ Variables frontend configurées"
else
    echo "⚠️  Frontend existe déjà ou erreur"
    echo "$FRONTEND_RESULT"
fi
echo ""

echo "🎉 SERVICES CRÉÉS AVEC SUCCÈS !"
echo "================================"
echo ""
echo "⏱️  Les déploiements sont en cours (10-15 minutes)"
echo ""
echo "🌐 SUIVI:"
echo "https://railway.com/project/$PROJECT_ID"
echo ""
echo "📊 Note: Configurez les Root Directories dans Railway:"
echo "   • Backend: railway-deploy/backend"
echo "   • Frontend: railway-deploy/frontend"
echo ""
echo "✨ Consultez la console Railway pour suivre les déploiements ✨"
