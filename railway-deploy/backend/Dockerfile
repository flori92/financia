# Dockerfile multi-stage pour l'API Gateway

# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Installation des dépendances natives
RUN apk add --no-cache python3 make g++

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances avec résolution des conflits peer
RUN npm ci --legacy-peer-deps

# Copie du code source
COPY . .

# Build de l'application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Installation des dépendances natives nécessaires en production
RUN apk add --no-cache python3

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Copier server.js depuis le code source (après build)
COPY server.js ./

# Configuration des variables d'environnement
ENV NODE_ENV=production \
    TZ=UTC

# Exposition du port de l'application (Railway détecte automatiquement)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Commande de démarrage
CMD ["node", "server.js"]