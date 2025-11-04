# 🚀 BMS - Business Management System

**Architecture Complete avec Rôles Cumulables & Super Admin**

---

## 📋 Vue d'ensemble

BMS est un système de gestion d'entreprise moderne avec **8 rôles utilisateurs**, **espaces dédiés**, et **gestion flexible des permissions**. Conçu pour les PME et entreprises modernes nécessitant une gestion polyvalente.

---

## 🎯 Architecture des Rôles

### Rôles Internes (cumulables)
- **Employé** - Espace personnel : congés, bulletins, CRA, frais
- **Manager** - Gestion équipe + validation + fiscalité  
- **RH** - Administration complète : paie, politiques, recrutement
- **Expert Comptable** - Comptabilité avancée + fiscalité (si interne)
- **Entrepreneur** - Vision stratégique + fiscalité (si interne)

### Rôles Spécialisés
- **Fiscal Admin** - Déclarations d'impôts et conformité
- **Banque** - Services financiers et analyse de crédit
- **Super Admin** - Accès universel à tous les espaces

### 🔄 Cumul Intelligent
```
Manager = Employee + Manager + Fiscal
Expert Comptable = Employee + Expert Comptable + Fiscal (interne)
Entrepreneur = Employee + Entrepreneur + Fiscal (interne)
Super Admin = Accès à TOUS les espaces
```

---

## 🚀 Démarrage Rapide

### Installation
```bash
git clone https://github.com/flori92/financia.git
cd railway-deploy/frontend
npm install
```

### Développement
```bash
npm run dev
# Accès: http://localhost:3000
```

### Production
```bash
npm run build
npm start
```

---

## 🎮 Démonstration des Rôles

### Page Interactive
- **URL**: `/role-demo`
- **Fonction**: Testez tous les rôles avec simulation d'authentification
- **Usage**: Sélectionnez un rôle → naviguez vers les espaces accessibles

### Espaces Disponibles
- `/employee-space` - Espace personnel employé
- `/manager-space` - Management d'équipe
- `/hr-space` - Administration RH
- `/expert-comptable` - Comptabilité professionnelle
- `/entrepreneur` - Tableau de bord stratégique
- `/fiscal-admin` - Déclarations fiscales
- `/banking` - Services bancaires
- `/admin` - Panneau Super Admin (accès universel)

---

## 🛠️ Stack Technique

- **Frontend**: Next.js 14 + TypeScript + TailwindCSS
- **UI Components**: Lucide React + Shadcn/UI
- **Authentification**: JWT avec rôles multiples
- **Déploiement**: Railway Cloud Platform
- **Architecture**: Microservices avec API REST

---

## 📊 Fonctionnalités par Espace

### 👔 Employé
- Gestion des congés et absences
- Bulletins de paie et documents
- Comptes rendus d'activité (CRA)
- Notes de frais et remboursements

### 👨‍💼 Manager
- Vue d'ensemble équipe et performance
- Validation congés/CRA/frais
- Analytics et reporting équipe
- Allocation des ressources

### 👩‍💼 RH
- Paie et administration globale
- Politiques et procédures RH
- Recrutement et onboarding
- Analytics globaux et dashboards

### 📊 Expert Comptable
- Plan comptable OHADA/SYSCOHADA
- États financiers (Bilan, P&L, Balance)
- Automatisation comptable
- Déclarations fiscales (si interne)

### 🚀 Entrepreneur
- KPI stratégiques temps réel
- Prévisions et insights business
- Optimisation des coûts
- Tableau de bord personnalisé

### 🏛️ Fiscal Admin
- Déclarations TVA automatisées
- Impôts sociétés et conformité
- Audit et contrôles fiscaux
- Rapports réglementaires

### 🏦 Banque
- Analyse de crédit client
- Services financiers personnalisés
- KYC et conformité bancaire
- Suivi des rentabilités

### 👑 Super Admin
- Administration complète du système
- Gestion utilisateurs et permissions
- Monitoring et maintenance
- Logs d'activité et sécurité

---

## 🔐 Sécurité

- **Authentification**: JWT sécurisé avec rôles multiples
- **Permissions**: Validation granulaire par espace
- **Super Admin**: Contrôle total avec audit complet
- **Session**: Timeout configurable et logs d'audit
- **Protection**: Rate limiting et validation inputs

---

## 📈 Déploiement

### Railway (Recommandé)
```bash
# Configuration automatique
railway up
```

### Variables Environnement
```bash
NEXTAUTH_URL=votre-url
NEXTAUTH_SECRET=votre-secret
DATABASE_URL=postgresql://...
JWT_SECRET=votre-jwt-secret
```

---

## 📚 Documentation

- **Architecture Complète**: `BMS_ROLES_ARCHITECTURE.md`
- **Guide Déploiement**: `BMS_DEPLOYMENT_GUIDE.md`

---

## 🎯 Scénarios d'Usage

### PME Technologique
```
CEO: Entrepreneur + Fiscal
CTO: Manager + Fiscal  
Expert Comptable: Expert Comptable + Fiscal
Développeurs: Employee
Admin: Super Admin
```

### Cabinet Comptable
```
Associé: Entrepreneur + Fiscal
Experts: Expert Comptable + Fiscal
Gestionnaires: Manager
Assistants: Employee
```

---

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit vos changements
4. Push vers la branche
5. Ouvrir une Pull Request

---

## 📄 Licence

MIT License - Voir le fichier LICENSE pour détails

---

**🚀 BMS v3.0 - Prêt pour la Production !**

*Architecture flexible, sécurisée et scalable pour la gestion d'entreprise moderne*
