# BMS API - Backend Netlify Functions

Ce dossier contient le backend BMS déployé sur Netlify Functions.

## Déploiement

### Prérequis
- Compte Netlify
- Netlify CLI installé

### Déploiement automatique
1. Push ce dossier sur un repository GitHub
2. Connecter le repository à Netlify
3. Netlify détectera automatiquement le projet et le déploiera

### Déploiement manuel
```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
netlify deploy --prod --dir=.
```

## Endpoints disponibles

- `GET /health` - Health check
- `GET /api/v1/companies` - Liste des entreprises
- `GET /api/v1/accounting/dashboard/metrics?companyId=XXX` - Dashboard comptable
- `GET /api/v1/accounting/aged-balance?type=receivables&asOfDate=2025-11-02` - Balance âgée

## URL de production

https://bms-api-netlify.netlify.app

## Architecture

- **Runtime** : Node.js 18
- **Framework** : Express.js
- **Serverless** : Netlify Functions
- **CORS** : Activé pour tous les origines
- **Logging** : Console logs intégrés
