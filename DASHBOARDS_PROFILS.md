# 📊 Dashboards Spécifiques par Profil - BMS ERP

**Date**: 5 Novembre 2025  
**Objectif**: Chaque profil doit avoir son tableau de bord intelligent et moderne

---

## 🎯 Vue d'Ensemble

Chaque profil utilisateur dispose d'un dashboard personnalisé avec des KPIs et fonctionnalités adaptées à ses besoins spécifiques.

---

## 📋 État Actuel des Dashboards

### ✅ **Dashboards Existants**

#### 1. **Expert Comptable** (`/expert-comptable`)
- **Fichier**: `/railway-deploy/frontend/src/app/expert-comptable/page.tsx`
- **KPIs**: Comptabilité complète, audit, conformité OHADA
- **Fonctionnalités**: 
  - Vue d'ensemble comptable
  - Écritures en attente de validation
  - États financiers (Bilan, P&L, Balance)
  - Alertes de conformité

#### 2. **Comptable** (`/accountant`) ✅
- **Fichier**: `/railway-deploy/frontend/src/app/accountant/page.tsx`
- **Backend**: `/api/v1/accounting/dashboard/metrics` ✅
- **Permissions**: ACCOUNTANT, EXPERT_COMPTABLE, ADMIN ✅
- **KPIs Actuels**:
  - CA du mois (Produits classe 7)
  - Charges du mois (Charges classe 6)
  - Résultat Net (Bénéfice/Perte)
  - Marge Brute (%)
  - Graphique évolution 12 mois
  - Top 5 Clients/Fournisseurs
  - Ratios financiers (Liquidité, Solvabilité)
  - Alertes comptables
  - Activité récente

#### 3. **Entrepreneur** (`/entrepreneur`)
- **Fichier**: `/railway-deploy/frontend/src/app/entrepreneur/page.tsx`
- **KPIs**: Vision stratégique, performance globale
- **Fonctionnalités**:
  - KPIs business temps réel
  - Prévisions financières
  - Analyse des tendances
  - Décisions stratégiques

#### 4. **Administration Fiscale** (`/fiscal-admin`)
- **Fichier**: `/railway-deploy/frontend/src/app/fiscal-admin/page.tsx`
- **KPIs**: Fiscalité, conformité, déclarations
- **Fonctionnalités**:
  - Suivi déclarations
  - Contrôles fiscaux
  - Statistiques fiscales
  - Alertes conformité

#### 5. **RH Manager** (`/hr-manager`)
- **Fichier**: `/railway-deploy/frontend/src/app/hr-manager/page.tsx`
- **KPIs**: Ressources humaines, paie, talents
- **Fonctionnalités**:
  - Effectifs et absences
  - Masse salariale
  - Recrutements en cours
  - Performance équipes

#### 6. **Manager** (`/manager-space`)
- **Fichier**: `/railway-deploy/frontend/src/app/manager-space/page.tsx`
- **KPIs**: Équipe, projets, objectifs
- **Fonctionnalités**:
  - Performance équipe
  - Projets en cours
  - Objectifs et KPIs
  - Planning et tâches

#### 7. **Employé** (`/employee-space`)
- **Fichier**: `/railway-deploy/frontend/src/app/employee-space/page.tsx`
- **KPIs**: Personnel, tâches, congés
- **Fonctionnalités**:
  - Mes tâches
  - Mes congés/absences
  - Mes fiches de paie
  - Mes objectifs

#### 8. **Admin** (`/admin`)
- **Fichier**: `/railway-deploy/frontend/src/app/admin/page.tsx`
- **KPIs**: Système global, utilisateurs, configuration
- **Fonctionnalités**:
  - Gestion utilisateurs
  - Configuration système
  - Monitoring global
  - Logs et audit

#### 9. **Banque** (`/bank-partner`)
- **Fichier**: `/railway-deploy/frontend/src/app/bank-partner/page.tsx`
- **KPIs**: Opérations bancaires, risques, conformité
- **Fonctionnalités**:
  - Transactions en temps réel
  - Gestion des risques
  - Conformité réglementaire
  - API bancaires

---

## 🚀 Améliorations Recommandées par Profil

### 1. **Expert Comptable**
**Dashboard Avancé à Créer** :
```
- 📊 KPIs Principaux:
  • Nombre de sociétés gérées
  • Écritures en attente de validation
  • Déclarations fiscales à venir
  • Solde de trésorerie global
  
- 📈 Graphiques:
  • Évolution CA multi-sociétés
  • Répartition charges par société
  • Analyse comparative inter-sociétés
  
- ⚠️ Alertes Intelligentes:
  • Anomalies comptables détectées (IA)
  • Écritures déséquilibrées
  • Rapprochements bancaires en retard
  • Deadlines déclarations fiscales
```

### 2. **Comptable** ✅
**Dashboard Actuel - À Enrichir** :
```
- 📊 Ajouts Suggérés:
  • Budget vs Réalisé (graphique variance)
  • Prévisions trésorerie 30j
  • Alertes factures impayées >30j
  • Scan documents IA (OCR)
  
- 🤖 Automatisation IA:
  • Suggestions écritures automatiques
  • Détection anomalies (montants anormaux)
  • Catégorisation intelligente
```

### 3. **Entrepreneur**
**Dashboard Stratégique à Créer** :
```
- 📊 KPIs Business:
  • CA vs Objectifs (% réalisation)
  • Cash-flow runway (mois restants)
  • Marges nettes et brutes
  • EBITDA et résultat net
  
- 📈 Visualisations:
  • Burn rate mensuel
  • Prévisions croissance
  • Analyse produits/services
  • Funnel commercial
  
- 🎯 Objectifs & OKRs:
  • Suivi objectifs stratégiques
  • KPIs équipes
  • Projets stratégiques
```

### 4. **Administration Fiscale**
**Dashboard Conformité à Créer** :
```
- 📊 KPIs Fiscaux:
  • Déclarations TVA du mois
  • Impôts sur sociétés
  • Pénalités et retards
  • Crédits d'impôt
  
- 📅 Calendrier:
  • Échéances déclarations
  • Rappels automatiques
  • Historique conformité
  
- ⚡ Actions:
  • Télédéclaration rapide
  • Export formats officiels
  • Simulations fiscales
```

### 5. **RH Manager**
**Dashboard RH Complet à Créer** :
```
- 👥 KPIs RH:
  • Effectifs (actifs/absents)
  • Turnover (%)
  • Masse salariale
  • Budget formation
  
- 📊 Analytics:
  • Pyramide des âges
  • Ancienneté moyenne
  • Taux satisfaction
  • Absentéisme
  
- 🎯 Recrutement:
  • Postes ouverts
  • Candidatures en cours
  • Time-to-hire
  • Onboarding en cours
```

### 6. **Manager**
**Dashboard Équipe à Créer** :
```
- 👥 Mon Équipe:
  • Membres actifs/absents
  • Congés à valider
  • Performance individuelle
  • Charge de travail
  
- 📊 Projets:
  • Projets en cours
  • Taux avancement
  • Budget vs Dépensé
  • Risques identifiés
  
- 🎯 Objectifs:
  • OKRs équipe
  • Sprints/Milestones
  • Productivité
```

### 7. **Employé**
**Dashboard Personnel à Créer** :
```
- 📋 Mon Espace:
  • Mes tâches du jour
  • Mes congés restants
  • Mes absences
  • Mes demandes en cours
  
- 💰 Ma Paie:
  • Dernier bulletin
  • Historique salaires
  • Primes et bonus
  • Avantages
  
- 🎯 Mes Objectifs:
  • Objectifs personnels
  • Formations suivies
  • Évaluations
```

### 8. **Admin**
**Dashboard Système à Créer** :
```
- 🖥️ Système:
  • Utilisateurs actifs
  • Stockage utilisé
  • Performance système
  • Logs d'erreur
  
- 👥 Gestion:
  • Utilisateurs par rôle
  • Connexions récentes
  • Actions critiques
  • Audit trail
  
- ⚙️ Configuration:
  • Paramètres système
  • Intégrations actives
  • Licences
  • Sauvegardes
```

### 9. **Banque**
**Dashboard Bancaire à Créer** :
```
- 💳 Opérations:
  • Transactions du jour
  • Virements en cours
  • Prélèvements
  • Alertes fraude
  
- 📊 Analyse:
  • Volume transactions
  • Flux entrants/sortants
  • Clients à risque
  • Conformité KYC
  
- 🔒 Sécurité:
  • Transactions suspectes
  • Limites dépassées
  • Authentifications échouées
```

---

## 🛠️ Architecture Technique

### **Backend - Endpoints Dashboard**

Chaque profil doit avoir son endpoint dédié :

```typescript
// Expert Comptable
GET /api/v1/expert-comptable/dashboard/metrics

// Comptable ✅
GET /api/v1/accounting/dashboard/metrics

// Entrepreneur
GET /api/v1/entrepreneur/dashboard/metrics

// Administration Fiscale
GET /api/v1/fiscal-admin/dashboard/metrics

// RH Manager
GET /api/v1/hr/dashboard/metrics

// Manager
GET /api/v1/manager/dashboard/metrics

// Employé
GET /api/v1/employee/dashboard/metrics

// Admin
GET /api/v1/admin/dashboard/metrics

// Banque
GET /api/v1/bank/dashboard/metrics
```

### **Frontend - Pages Dashboard**

Structure standardisée pour chaque dashboard :

```tsx
"use client";
import { useState, useEffect } from "react";
import { apiGet, getCompanyId } from "@/lib/api";

export default function [Profile]DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    const cid = getCompanyId();
    if (!cid) { 
      setError('Aucune société sélectionnée'); 
      setLoading(false); 
      return; 
    }
    
    setLoading(true);
    try {
      const metrics = await apiGet('/api/v1/[profil]/dashboard/metrics', { 
        companyId: cid 
      });
      setData(metrics);
      setError(null);
    } catch (e: any) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { 
    loadDashboard(); 
    
    // Écouter les changements de société
    const handleCompanyChange = () => loadDashboard();
    window.addEventListener('bms-company-changed', handleCompanyChange);
    return () => window.removeEventListener('bms-company-changed', handleCompanyChange);
  }, []);

  // Rendu du dashboard avec KPIs, graphiques, alertes
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      {/* KPIs Cards */}
      {/* Charts */}
      {/* Alertes */}
      {/* Actions rapides */}
    </div>
  );
}
```

---

## 📊 Composants UI Réutilisables

### **KPI Card**
```tsx
<div className="bg-white rounded-xl p-6 border border-slate-200">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-slate-600 font-medium">{title}</h3>
    <Icon className="w-8 h-8 text-[#0D9488]" />
  </div>
  <div className="text-3xl font-bold text-slate-900">{value}</div>
  <div className="mt-2 text-sm text-slate-500">{subtitle}</div>
</div>
```

### **Chart Container**
```tsx
<div className="bg-white rounded-xl p-6 border border-slate-200">
  <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>
  {/* Recharts ou Chart.js */}
</div>
```

### **Alert Card**
```tsx
<div className={`p-4 rounded-lg border ${alertStyles[type]}`}>
  <div className="flex items-start gap-3">
    <AlertIcon className="w-5 h-5 flex-shrink-0" />
    <div>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-sm mt-1">{message}</p>
    </div>
  </div>
</div>
```

---

## 🎯 Priorités de Développement

### **Phase 1 - Urgent** (Cette semaine)
1. ✅ Dashboard Comptable - Permissions OK
2. 🔧 Dashboard Expert Comptable - À améliorer
3. 🔧 Dashboard Entrepreneur - À créer/améliorer

### **Phase 2 - Important** (Semaine prochaine)
4. 🔧 Dashboard RH Manager - À créer/améliorer
5. 🔧 Dashboard Manager - À créer/améliorer
6. 🔧 Dashboard Employé - À créer/améliorer

### **Phase 3 - Secondaire** (Dans 2 semaines)
7. 🔧 Dashboard Administration Fiscale - À créer
8. 🔧 Dashboard Admin - À améliorer
9. 🔧 Dashboard Banque - À créer

---

## ✅ Actions Immédiates

1. **Backend** :
   - ✅ Ajouter permissions ACCOUNTANT au dashboard comptable
   - 🔄 Créer endpoints dashboard pour chaque profil
   - 🔄 Implémenter services de calcul KPIs spécifiques

2. **Frontend** :
   - ✅ Dashboard Comptable fonctionnel
   - 🔄 Améliorer les dashboards existants
   - 🔄 Créer les dashboards manquants
   - 🔄 Standardiser les composants UI

3. **Design** :
   - 🔄 Palette cohérente (Slate + Teal #0D9488)
   - 🔄 Pas de gradients (design professionnel)
   - 🔄 KPIs cards uniformes
   - 🔄 Graphiques modernes (Recharts)

---

**Fin du document** - Dashboard intelligent et moderne par profil
