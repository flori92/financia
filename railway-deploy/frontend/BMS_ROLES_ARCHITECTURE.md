# 🏗️ Architecture des Rôles Utilisateurs BMS avec ML/IA (Version 2.0)

**Date**: 4 Novembre 2025  
**Infrastructure**: Railway Cloud Platform  
**Framework**: Next.js + TypeScript + NestJS + TensorFlow.js

---

## 👥 **Rôles Utilisateurs avec Cumul Possible**

### **🎯 Principe de Base**
- **ROLE_EMPLOYEE**: Rôle de base pour TOUS les personnels de l'entreprise
- **Rôles cumulables**: Manager, RH peuvent cumuler avec ROLE_EMPLOYEE
- **Rôles spécialisés**: Expert Comptable, Entrepreneur, Fiscal, Banque (non cumulables)

---

## 📋 **Structure Détaillée des Rôles**

### 1. 👔 **ROLE_EMPLOYEE (Rôle de Base)**
**Route**: `/employee-space`  
**Obligatoire pour**: Tous les employés sauf Banque et Administration Fiscale

#### Fonctionnalités Exclusives
- ✅ **Gestion des Congés**
  - Demande de congés (annuels, RTT, maladie, exceptionnels)
  - Suivi des solde de congés en temps réel
  - Historique des demandes avec statuts
- ✅ **Bulletins de Salaire**
  - Consultation des bulletins mensuels
  - Téléchargement des fiches de paie au format PDF
  - Historique complet des rémunérations
- ✅ **CRA (Compte Rendu d'Activité)**
  - Saisie mensuelle des heures et activités
  - Soumission pour validation manager
  - Suivi du statut de validation
- ✅ **Notes de Frais**
  - Soumission des dépenses professionnelles
  - Upload des reçus et justificatifs
  - Suivi du remboursement
- ✅ **Espace Personnel**
  - Informations personnelles et coordonnées
  - Documents administratifs
  - Messagerie interne

#### Accès Cumulé
- ✅ Les Managers ont aussi accès à cet espace
- ✅ Les RH ont aussi accès à cet espace
- ❌ Expert Comptable, Entrepreneur, Fiscal, Banque: accès spécialisé uniquement

---

### 2. 👥 **ROLE_MANAGER (Cumulable avec Employee)**
**Route**: `/manager-space`  
**Prérequis**: ROLE_EMPLOYEE + permissions management

#### Fonctionnalités de Management
- ✅ **Gestion d'Équipe**
  - Vue d'ensemble de l'équipe (effectif, performance, projets)
  - Suivi des statuts des collaborateurs
  - Analytics de l'équipe en temps réel
- ✅ **Validation des Congés**
  - Approbation/refus des demandes de congés de l'équipe
  - Planning des absences et gestion des conflits
  - Notifications des demandes en attente
- ✅ **Validation des CRA**
  - Review et approbation des comptes rendus d'activité
  - Suivi des heures travaillées par collaborateur
  - Reporting de productivité équipe
- ✅ **Validation des Notes de Frais**
  - Approbation des dépenses de l'équipe
  - Vérification des justificatifs
  - Gestion des budgets de frais

#### Interface Spécialisée
- Dashboard manager avec KPI équipe
- Système de validation en un clic
- Notifications temps réel des demandes
- Reporting avancé de l'équipe

---

### 3. 🎓 **ROLE_HR (Cumulable avec Employee)**
**Route**: `/hr-space`  
**Prérequis**: ROLE_EMPLOYEE + permissions RH

#### Fonctionnalités RH Globales
- ✅ **Administration Globale des Congés**
  - Politiques de congés entreprise
  - Planning global des absences
  - Analytics des taux d'absentéisme
- ✅ **Administration de la Paie**
  - Génération des bulletins de salaire
  - Administration de la masse salariale
  - Déclarations sociales et fiscales
- ✅ **Politiques et Procédures**
  - Gestion des documents RH (politiques, chartes)
  - Veille réglementaire et conformité
  - Communication interne RH
- ✅ **Recrutement**
  - Gestion des offres d'emploi
  - Suivi des processus de recrutement
  - Interface candidats et entretiens

#### Vue d'Ensemble Entreprise
- Dashboard RH avec métriques globales
- Gestion multi-départements
- Reporting pour direction
- Conformité légale et audits

---

### 4. 📊 **ROLE_EXPERT_COMPTABLE (Spécialisé)**
**Route**: `/expert-comptable`  
**Non cumulable**: Accès comptabilité uniquement

#### Fonctionnalités Exclusives
- ✅ **Expertise Comptable Avancée**
  - Plan comptable SYSCOHADA enrichi (55+ comptes)
  - États financiers prévisionnels par ML
  - Analyse des ratios et indicateurs
- ✅ **Conseil Stratégique**
  - Recommandations d'optimisation financière
  - Prévisions de trésorerie par IA
  - Analyse de rentabilité par segment
- ✅ **Automatisation Comptable**
  - Génération automatique des écritures
  - Rapprochement bancaire intelligent
  - Clôture automatique des périodes

---

### 5. 💼 **ROLE_ENTREPRENEUR (Spécialisé)**
**Route**: `/entrepreneur`  
**Non cumulable**: Vue stratégique uniquement

#### Fonctionnalités Stratégiques
- ✅ **Tableau de Bord Stratégique**
  - KPI essentiels avec alertes intelligentes
  - Prévisions de croissance par ML
  - Analyse concurrentielle automatisée
- ✅ **Gestion Simplifiée**
  - Prise de décision assistée par IA
  - Prévisions de ventes et cash-flow
  - Optimisation des coûts par algorithme
- ✅ **Business Intelligence**
  - Tableaux de bord interactifs
  - Recommandations d'investissement
  - Analyse de marché en temps réel

---

### 6. 🏛️ **ROLE_FISCAL_ADMIN (Spécialisé)**
**Route**: `/fiscal-admin`  
**Non cumulable**: Accès fiscal uniquement

#### Fonctionnalités Fiscales
- ✅ **Déclarations Fiscales Automatisées**
  - TVA avec calcul ML d'optimisation
  - Impôt sur les sociétés avec prévisions
  - Déclarations fiscales SYSCOHADA
- ✅ **Contrôle et Audit**
  - Audit automatisé des écritures comptables
  - Détection d'anomalies fiscales par IA
  - Génération automatique des rapports fiscaux
- ✅ **Conformité Réglementaire**
  - Vérification automatique de la conformité OHADA
  - Alertes de changements réglementaires
  - Documentation légale intégrée

---

### 7. 🏦 **ROLE_BANKING_INSTITUTION (Spécialisé)**
**Route**: `/banking`  
**Non cumulable**: Accès bancaire uniquement

#### Fonctionnalités Bancaires
- ✅ **Analyse de Crédit**
  - Scoring de crédit par ML avancé
  - Évaluation des risques financiers
  - Historique des transactions analysé
- ✅ **Services Financiers**
  - Gestion des prêts et crédits
  - Analyse de la rentabilité client
  - Prévisions des besoins de financement
- ✅ **Conformité Bancaire**
  - KYC automatisé avec vérification IA
  - Lutte anti-blanchage (AML) par ML
  - Rapports réglementaires automatiques

---

## 🔄 **Logique de Cumul des Rôles**

### **Matrix d'Accès**
| Rôle Principal | Employee | Manager | HR | Expert Comptable | Entrepreneur | Fiscal | Banque |
|----------------|----------|---------|----|------------------|--------------|--------|--------|
| Employee       | ✅       | ❌      | ❌ | ❌               | ❌           | ❌     | ❌     |
| Manager        | ✅       | ✅      | ❌ | ❌               | ❌           | ❌     | ❌     |
| HR             | ✅       | ❌      | ✅ | ❌               | ❌           | ❌     | ❌     |
| Expert Comptable | ❌     | ❌      | ❌ | ✅               | ❌           | ❌     | ❌     |
| Entrepreneur   | ❌       | ❌      | ❌ | ❌               | ✅           | ❌     | ❌     |
| Fiscal Admin   | ❌       | ❌      | ❌ | ❌               | ❌           | ✅     | ❌     |
| Bank           | ❌       | ❌      | ❌ | ❌               | ❌           | ❌     | ✅     |

### **Exemples Concrets**
- **Alice (Développeur)**: ROLE_EMPLOYEE → Accès `/employee-space`
- **Bob (Tech Lead)**: ROLE_EMPLOYEE + ROLE_MANAGER → Accès `/employee-space` + `/manager-space`
- **Carol (DRH)**: ROLE_EMPLOYEE + ROLE_HR → Accès `/employee-space` + `/hr-space`
- **David (Expert Comptable)**: ROLE_EXPERT_COMPTABLE → Accès `/expert-comptable` uniquement
- **Eva (Entrepreneur)**: ROLE_ENTREPRENEUR → Accès `/entrepreneur` uniquement

---

## 🤖 **Fonctionnalités ML/IA par Rôle**

### **Pour les Employés**
- **Assistant Personnel**: Recommandations de formation, bien-être
- **Prévision Congés**: Suggestions optimales basées sur l'activité équipe
- **Optimisation CRA**: Aide à la saisie et catégorisation automatique

### **Pour les Managers**
- **Performance Prédictive**: Détection des risques de performance
- **Optimisation Planning**: ML pour l'approbation intelligente des congés
- **Analytics Équipe**: Tendances et recommandations management

### **Pour les RH**
- **Turnover Prediction**: ML pour anticiper les départs
- **Recrutement Intelligent: Matching candidats-postes par IA
- **Paie Optimisée**: Détection d'anomalies et optimisations

### **Pour les Rôles Spécialisés**
- **Expert Comptable**: Prévisions financières et optimisations fiscales
- **Entrepreneur**: Insights marché et recommandations stratégiques
- **Fiscal/ Banque**: Analyse de risque et scoring avancé

---

## 🚀 **Infrastructure Railway**

### **Architecture Multi-Tenants**
```yaml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
healthcheckPath = "/api/health"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"

[services]
frontend = { memory = "1GB", cpu = "1" }
api = { memory = "2GB", cpu = "2" }
ml-service = { memory = "4GB", cpu = "2" }
database = { plan = "postgresql-14" }
redis = { plan = "redis-7" }
```

### **Services Spécialisés par Rôle**
- **Frontend**: Next.js avec routing par rôle
- **API**: NestJS avec middleware de validation de rôles
- **ML Service**: TensorFlow.js avec modèles spécialisés
- **Database**: PostgreSQL avec schéma multi-rôles
- **Cache**: Redis pour sessions et analytics

---

## 🔐 **Sécurité et Authentification**

### **Système de Rôles Cumulables**
```typescript
interface User {
  id: string;
  roles: string[]; // ["ROLE_EMPLOYEE", "ROLE_MANAGER"]
  permissions: Permission[];
  department: string;
  managedTeam?: string[]; // Pour les managers
}

interface Permission {
  resource: string;
  action: 'read' | 'write' | 'approve' | 'admin';
  scope: 'personal' | 'team' | 'department' | 'company';
}
```

### **Validation d'Accès**
- **JWT Tokens** avec payload rôles multiples
- **Middleware** de validation par route
- **RBAC** (Role-Based Access Control) granulaire
- **Audit Trail** complet des accès

---

## 📱 **Interface Utilisateur Adaptive**

### **Navigation par Rôle**
- **Employee**: Espace personnel avec onglets Congés/Bulletins/CRA/Frais
- **Manager**: Dashboard équipe + validation des demandes
- **HR**: Vue globale entreprise + administration RH
- **Spécialisés**: Interfaces métier dédiées sans distractions

### **Expérience Unifiée**
- **Design System** cohérent across tous les rôles
- **Navigation intuitive** par fonctionnalités métier
- **Responsive Design** pour mobile et desktop
- **Accessibilité** WCAG 2.1 AA compliant

---

## 🎯 **Scénarios d'Utilisation Réels**

### **Scénario 1: Employé Standard**
```
1. Marie se connecte → ROLE_EMPLOYEE
2. Accède à /employee-space
3. Pose ses congés de décembre
4. Télécharge son bulletin d'octobre
5. Soumet son CRA mensuel
6. Envoie sa note de frais de déplacement
```

### **Scénario 2: Manager Technique**
```
1. Thomas se connecte → ROLE_EMPLOYEE + ROLE_MANAGER
2. Accède à son espace employee (conges personnels)
3. Accède à /manager-space
4. Valide les congés de son équipe
5. Approuve les CRA des développeurs
6. Valide les notes de frais de l'équipe
```

### **Scénario 3: DRH**
```
1. Sophie se connecte → ROLE_EMPLOYEE + ROLE_HR
2. Accède à son espace employee (admin personnel)
3. Accède à /hr-space
4. Génère les bulletins de paie du mois
5. Gère les politiques RH
6. Suit les processus de recrutement
```

---

## 📊 **Métriques de Succès**

### **Adoption par Rôle**
- **Employee**: 100% des employés (cible)
- **Manager**: 85% des managers (cible)
- **HR**: 95% des équipes RH (cible)
- **Spécialisés**: 90% des experts (cible)

### **Performance Technique**
- **Load Time**: <1.5s pour tous les rôles
- **API Response**: <50ms 95th percentile
- **ML Inference**: <200ms par prédiction
- **Uptime**: 99.9% garanti

### **Business Impact**
- **Productivité**: +40% via automatisation
- **Satisfaction**: >4.5/5 utilisateurs
- **Réduction Coûts**: 25% optimisations
- **ROI**: 200% première année

---

**Architecture BMS v2.0 - Rôles Cumulables avec Espaces Dédiés - Production Ready** 🚀
