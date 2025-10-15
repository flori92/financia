# 💼 BMS - Business Management System

**"La sophistication européenne, adaptée à l'Afrique"**

## 🏗️ Structure du Projet

```
bms/
├── backend-frappe/      # Backend Frappe/ERPNext adapté
├── api-gateway/         # API Gateway NestJS pour mobile/web
├── mobile/              # Application React Native (iOS/Android)
├── web-admin/           # Interface admin Next.js
├── docs/                # Documentation technique
├── scripts/             # Scripts d'installation et déploiement
└── config/              # Configurations partagées
```

## 🚀 Quick Start

### Prérequis
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Docker & Docker Compose

### Installation Complète

```bash
# 1. Backend Frappe
cd backend-frappe
./scripts/setup.sh

# 2. API Gateway
cd ../api-gateway
npm install
npm run start:dev

# 3. Mobile App
cd ../mobile
npm install
npx react-native run-android  # ou run-ios

# 4. Web Admin
cd ../web-admin
npm install
npm run dev
```

### Docker (Recommandé pour Démarrage Rapide)

```bash
# Tout démarrer avec Docker
docker-compose up -d

# Accès:
# - API Gateway: http://localhost:3001
# - Backend Frappe: http://localhost:8000
# - Web Admin: http://localhost:3000
# - PostgreSQL: localhost:5432
# - Redis: localhost:6379
```

## 🔧 Développement

### Démarrer le Backend
```bash
cd backend-frappe
bench start
```

### Démarrer l'API Gateway
```bash
cd api-gateway
npm run start:dev
```

### Démarrer l'App Mobile
```bash
cd mobile
npm start
npx react-native run-android
```

### Tests
```bash
# Backend
cd backend-frappe
bench run-tests

# API Gateway
cd api-gateway
npm test

# Mobile
cd mobile
npm test
```

## 📚 Documentation

- [Architecture](../BMS_ANALYSE.md)
- [Roadmap](../BMS_ROADMAP.md)
- [Spécifications Techniques](../BMS_SPECS_TECHNIQUES.md)
- [Setup Cloudflare](../CLOUDFLARE_SETUP.md)
- [Next Actions](../NEXT_ACTIONS.md)

## 🤝 Contribution

Voir [CONTRIBUTING.md](./CONTRIBUTING.md) pour les guidelines.

## 📄 Licence

GPL-3.0 (comme ERPNext)
