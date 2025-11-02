# BMS ERP - Railway Deployment

## Instructions

1. Installer Railway CLI:
```bash
npm install -g @railway/cli
```

2. Authentification:
```bash
railway login
```

3. Déploiement:
```bash
cd railway-deploy
railway init
railway variables set JWT_SECRET=votre_secret_ici
railway up
```

## Services

- **bms-backend**: API NestJS (port 3001)
- **bms-frontend**: Next.js (port 3000)
- **PostgreSQL**: Database

## URLs après déploiement

- Frontend: `https://bms-frontend.production.railway.app`
- Demo: `https://bms-frontend.production.railway.app/demo.html`
- Backend: `https://bms-backend.production.railway.app`
