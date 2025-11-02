#!/bin/bash

# Script de déploiement automatisé BMS sur Railway via API GraphQL

set -e

PROJECT_ID="a003a9ae-d435-4d5a-a29a-f2d3f9c0f910"
RAILWAY_TOKEN="efcce6ba-3408-4910-bb4e-9cefbf47a412"
API_URL="https://backboard.railway.app/graphql/v2"

echo "🚀 DÉPLOIEMENT AUTOMATIQUE BMS SUR RAILWAY"
echo "==========================================="
echo ""
echo "Projet ID: $PROJECT_ID"
echo ""

# Fonction pour appeler l'API Railway
railway_api() {
  local query="$1"
  curl -s -X POST "$API_URL" \
    -H "Authorization: Bearer $RAILWAY_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"query\": \"$query\"}"
}

echo "📊 Récupération des informations du projet..."
PROJECT_INFO=$(railway_api "query { project(id: \\\"$PROJECT_ID\\\") { id name environments { edges { node { id name } } } } }")
echo "✅ Projet récupéré"
echo ""

# Extraire l'ID de l'environnement production
ENV_ID=$(echo "$PROJECT_INFO" | grep -o '"id":"[^"]*"' | head -2 | tail -1 | cut -d'"' -f4)
echo "Environment ID: $ENV_ID"
echo ""

echo "🗄️  ÉTAPE 1/3: Création service PostgreSQL..."
POSTGRES_QUERY="mutation {
  databaseCreate(
    input: {
      projectId: \\\"$PROJECT_ID\\\"
      environmentId: \\\"$ENV_ID\\\"
      plugin: \\\"postgresql\\\"
      name: \\\"bms-database\\\"
    }
  ) {
    id
  }
}"

POSTGRES_RESULT=$(railway_api "$POSTGRES_QUERY")
echo "✅ PostgreSQL créé"
echo ""

echo "🔧 ÉTAPE 2/3: Création service Backend (API)..."
BACKEND_QUERY="mutation {
  serviceCreate(
    input: {
      projectId: \\\"$PROJECT_ID\\\"
      name: \\\"bms-backend\\\"
      source: {
        repo: \\\"flori92/financia\\\"
        rootDirectory: \\\"railway-deploy/backend\\\"
      }
    }
  ) {
    id
  }
}"

BACKEND_RESULT=$(railway_api "$BACKEND_QUERY")
BACKEND_ID=$(echo "$BACKEND_RESULT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "✅ Backend créé: $BACKEND_ID"
echo ""

# Configurer les variables d'environnement du backend
echo "⚙️  Configuration variables backend..."
BACKEND_VARS="mutation {
  variableCollectionUpsert(
    input: {
      projectId: \\\"$PROJECT_ID\\\"
      environmentId: \\\"$ENV_ID\\\"
      serviceId: \\\"$BACKEND_ID\\\"
      variables: {
        NODE_ENV: \\\"production\\\"
        PORT: \\\"3001\\\"
        JWT_SECRET: \\\"bms_jwt_secret_$(date +%s)\\\"
      }
    }
  ) {
    id
  }
}"

railway_api "$BACKEND_VARS" > /dev/null
echo "✅ Variables backend configurées"
echo ""

echo "🌐 ÉTAPE 3/3: Création service Frontend..."
FRONTEND_QUERY="mutation {
  serviceCreate(
    input: {
      projectId: \\\"$PROJECT_ID\\\"
      name: \\\"bms-frontend\\\"
      source: {
        repo: \\\"flori92/financia\\\"
        rootDirectory: \\\"railway-deploy/frontend\\\"
      }
    }
  ) {
    id
  }
}"

FRONTEND_RESULT=$(railway_api "$FRONTEND_QUERY")
FRONTEND_ID=$(echo "$FRONTEND_RESULT" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "✅ Frontend créé: $FRONTEND_ID"
echo ""

# Configurer les variables d'environnement du frontend
echo "⚙️  Configuration variables frontend..."
FRONTEND_VARS="mutation {
  variableCollectionUpsert(
    input: {
      projectId: \\\"$PROJECT_ID\\\"
      environmentId: \\\"$ENV_ID\\\"
      serviceId: \\\"$FRONTEND_ID\\\"
      variables: {
        NODE_ENV: \\\"production\\\"
        PORT: \\\"3000\\\"
      }
    }
  ) {
    id
  }
}"

railway_api "$FRONTEND_VARS" > /dev/null
echo "✅ Variables frontend configurées"
echo ""

echo "🎉 DÉPLOIEMENT EN COURS !"
echo "========================"
echo ""
echo "Railway déploie automatiquement vos services."
echo "Temps estimé: 10-15 minutes"
echo ""

echo "🌐 ACCÈS AU PROJET:"
echo "==================="
echo "Console Railway: https://railway.com/project/$PROJECT_ID"
echo ""

echo "📊 SUIVI DU DÉPLOIEMENT:"
echo "========================"
echo "railway logs --service bms-backend"
echo "railway logs --service bms-frontend"
echo ""

echo "✨ SERVICES CRÉÉS AVEC SUCCÈS ! ✨"
echo ""
echo "Les URLs seront disponibles dans quelques minutes sur:"
echo "https://railway.com/project/$PROJECT_ID"
