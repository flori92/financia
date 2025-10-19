# 🚀 BMS - Business Management System

**Système de gestion comptable, trésorerie et fiscalité pour l'Afrique**

[![License](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/typescript-%3E%3D5.0.0-blue.svg)](https://www.typescriptlang.org)

## 📋 Vue d'ensemble

BMS est une plateforme complète de gestion d'entreprise spécialement conçue pour les PME africaines, offrant :

- 📊 **Comptabilité SYSCOHADA** - Conforme aux normes comptables africaines
- 💰 **Gestion de trésorerie** - Suivi des flux de trésorerie en temps réel
- 📄 **Facturation** - Devis, factures, paiements
- 👥 **CRM** - Gestion des contacts et opportunités
- 🏦 **Intégrations bancaires** - Synchronisation automatique des transactions
- 📱 **Multi-plateforme** - Web responsive et applications mobiles
- 🔐 **Sécurité avancée** - 2FA, chiffrement, audit complet

## 🎯 Fonctionnalités principales

### ✅ Implémenté (95%)

- [x] Authentification JWT avec 2FA
- [x] Multi-tenant avec isolation des données
- [x] Comptabilité complète (plan comptable, journaux, grand livre)
- [x] Gestion des factures et devis
- [x] CRM (contacts, opportunités, pipeline)
- [x] Rapprochement bancaire (import CSV)
- [x] Gestion de trésorerie
- [x] Déclarations fiscales (TVA, IFU)
- [x] Tableaux de bord et reporting
- [x] API REST documentée (Swagger)
- [x] Notifications en temps réel (WebSocket)

### 🔄 En cours (5%)

- [ ] Intégrations bancaires API (Budget Insight, Bridge)
- [ ] Passerelles de paiement (Stripe, PayPal)
- [ ] Applications mobiles (iOS/Android)
- [ ] Tests automatisés (70% coverage)

## 🏗️ Architecture

```
bms/
├── api-gateway/          # Backend NestJS
│   ├── src/
│   │   ├── auth/         # Authentification & 2FA
│   │   ├── accounting/   # Comptabilité SYSCOHADA
│   │   ├── crm/          # CRM & Contacts
│   │   ├── invoices/     # Facturation
│   │   ├── banking/      # Intégrations bancaires
│   │   ├── payments/     # Paiements
│   │   ├── tax/          # Fiscalité
│   │   └── ...
│   └── package.json
│
├── bms-web/              # Frontend Next.js
│   ├── src/
│   │   ├── app/          # Pages (App Router)
│   │   ├── components/   # Composants réutilisables
│   │   └── lib/          # Utilitaires
│   └── package.json
│
└── docker-compose.yml    # Orchestration Docker
```

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker & Docker Compose (recommandé)

### Installation avec Docker (Recommandé)

```bash
# Cloner le repository
git clone https://github.com/your-org/bms.git
cd bms

# Rendre le script exécutable
chmod +x start-bms.sh

# Démarrer tous les services
./start-bms.sh
```

L'application sera accessible sur :
- Frontend : http://localhost:3000
- API : http://localhost:3001
- Documentation API : http://localhost:3001/api/docs

### Installation manuelle

Voir le [Guide d'installation complet](INSTALLATION_GUIDE.md)

## 📚 Documentation

- [Guide d'installation](INSTALLATION_GUIDE.md) - Installation détaillée
- [Roadmap d'implémentation](BMS_IMPLEMENTATION_ROADMAP.md) - Plan de développement
- [Checklist d'actions](IMMEDIATE_ACTION_CHECKLIST.md) - Tâches prioritaires
- [Corrections appliquées](CORRECTIONS_APPLIED.md) - Historique des corrections
- [Documentation API](http://localhost:3001/api/docs) - Swagger (après démarrage)

## 🔐 Sécurité

BMS implémente les meilleures pratiques de sécurité :

- ✅ Authentification JWT avec refresh tokens
- ✅ 2FA avec TOTP (Google Authenticator)
- ✅ Codes de secours pour 2FA
- ✅ Chiffrement des données sensibles
- ✅ Audit complet des actions
- ✅ Protection CSRF
- ✅ Rate limiting
- ✅ Validation des entrées
- ✅ Isolation multi-tenant

## 🧪 Tests

```bash
# Backend
cd bms/api-gateway
npm run test              # Tests unitaires
npm run test:e2e          # Tests E2E
npm run test:cov          # Coverage

# Frontend
cd bms-web
npm run test              # Tests unitaires
npm run test:e2e          # Tests Playwright
```

## 📊 Modules

### Comptabilité
- Plan comptable SYSCOHADA
- Journaux (ventes, achats, banque, OD)
- Grand livre et balance
- Bilan et compte de résultat
- Clôture d'exercice

### CRM
- Gestion des contacts (clients, prospects, fournisseurs)
- Pipeline de ventes
- Opportunités commerciales
- Activités et historique
- Import/Export CSV

### Facturation
- Devis et factures
- Facturation récurrente
- Multi-devises
- Suivi des paiements
- Relances automatiques

### Trésorerie
- Prévisions de trésorerie
- Alertes de découvert
- Rapprochement bancaire
- Suivi des échéances

### Fiscalité
- Déclarations TVA
- Gestion IFU/NIF
- Conformité SYSCOHADA
- Exports comptables

## 🌍 Pays supportés

- 🇧🇯 Bénin
- 🇹🇬 Togo
- 🇨🇮 Côte d'Ivoire
- 🇸🇳 Sénégal
- 🇧🇫 Burkina Faso
- 🇲🇱 Mali
- 🇳🇪 Niger
- Et autres pays OHADA

## 🤝 Contribution

Les contributions sont les bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md)

## 📝 License

GPL-3.0 - Voir [LICENSE](LICENSE)

## 👥 Équipe

- **Développement** : Équipe BMS
- **Support** : support@bms.local
- **Documentation** : https://docs.bms.local

## 🗺️ Roadmap

### Phase 1 - MVP (Complété à 95%)
- [x] Authentification & 2FA
- [x] Comptabilité SYSCOHADA
- [x] CRM de base
- [x] Facturation
- [x] Trésorerie

### Phase 2 - Intégrations (En cours)
- [ ] Budget Insight / Bridge API
- [ ] Stripe / PayPal
- [ ] WooCommerce / Shopify
- [ ] Tests automatisés

### Phase 3 - Mobile (Q2 2026)
- [ ] Application iOS
- [ ] Application Android
- [ ] Mode hors ligne
- [ ] Synchronisation

### Phase 4 - IA & Automation (Q3 2026)
- [ ] OCR de factures
- [ ] Prédictions de trésorerie
- [ ] Détection d'anomalies
- [ ] Workflows automatisés

## 📞 Support

- Email : support@bms.local
- Documentation : https://docs.bms.local
- Issues : https://github.com/your-org/bms/issues

## 🎉 Remerciements

Merci à tous les contributeurs et utilisateurs qui font de BMS une solution de référence pour la gestion d'entreprise en Afrique !

---

**BMS** - Simplifier la gestion d'entreprise en Afrique 🌍
