# BMS ERP - Backend Only (Railway)
# Utilisation de Debian au lieu d'Alpine pour compatibilité TensorFlow
FROM node:20-slim

WORKDIR /app

# Copie et installation backend
COPY backend/package*.json ./
RUN npm ci --legacy-peer-deps

# Copie du code backend
COPY backend/ .

# Build de l'application NestJS
RUN npm run build

# Port exposé (Railway détecte automatiquement)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Démarrage backend (ENTRYPOINT est plus difficile à override que CMD)
ENTRYPOINT ["node", "server.js"]
