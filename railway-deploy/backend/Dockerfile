# Dockerfile multi-stage pour l'API Gateway

# Stage 1: Builder
FROM node:18-alpine AS builder

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
FROM node:18-alpine

WORKDIR /app

# Installation des dépendances natives nécessaires en production
RUN apk add --no-cache python3

# Copie des fichiers nécessaires depuis le builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Configuration des variables d'environnement
ENV NODE_ENV=production \
    TZ=UTC

# Exposition du port de l'application
EXPOSE 3001

# Commande de démarrage
CMD ["npm", "run", "start:prod"]