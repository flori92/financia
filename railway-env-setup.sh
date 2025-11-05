#!/bin/bash

echo "🚂 Configuration des variables d'environnement Railway"
echo "======================================================="

# Backend variables
echo "📦 Configuration Backend..."
railway variables --service backend set \
  DATABASE_HOST=\${{PGHOST}} \
  DATABASE_PORT=\${{PGPORT}} \
  DATABASE_USER=\${{PGUSER}} \
  DATABASE_PASSWORD=\${{PGPASSWORD}} \
  DATABASE_NAME=\${{PGDATABASE}} \
  JWT_SECRET=\${{JWT_SECRET}} \
  JWT_EXPIRATION=7d \
  JWT_REFRESH_EXPIRATION=30d \
  PORT=3001 \
  NODE_ENV=production

# Frontend variables
echo "🎨 Configuration Frontend..."
railway variables --service frontend set \
  NEXT_PUBLIC_API_URL=\${{BACKEND_URL}} \
  NEXTAUTH_URL=\${{RAILWAY_PUBLIC_DOMAIN}} \
  NEXTAUTH_SECRET=\${{NEXTAUTH_SECRET}}

echo "✅ Variables d'environnement configurées!"
echo ""
echo "⚠️  N'oubliez pas de définir manuellement:"
echo "  - JWT_SECRET (secret aléatoire)"
echo "  - NEXTAUTH_SECRET (secret aléatoire)"
echo "  - BACKEND_URL (URL du service backend)"
