# 📋 PLAN D'ACTION - Modules BMS

**Date audit:** 3 Nov 2025  
**Modules analysés:** 34 modules frontend

---

## 🎯 Priorités par profil utilisateur

### **PRIORITÉ 1** - Modules critiques (utilisation quotidienne)

#### 1. ✅ **COMPTABILITÉ** - Production Ready
- Status: **95% COMPLET**
- Profil: Expert-Comptable
- Tous endpoints fonctionnels
- Toutes pages opérationnelles
- Rapprochement bancaire avancé (CSV, filtres, bulk, historique)

#### 2. ⚠️ **FACTURES** (invoices/)
- Status: **À vérifier**
- Actions:
  - [ ] Vérifier création factures
  - [ ] Tester envoi email/SMS
  - [ ] Vérifier statuts paiement
  - [ ] Intégrer Mobile Money KkiaPay

#### 3. ⚠️ **TRÉSORERIE** (treasury/)
- Status: **Partiellement fonctionnel**
- Existant: Comptes bancaires, prévisions mock
- Actions:
  - [ ] Connecter API bancaire réelle
  - [ ] Implémenter alertes seuils
  - [ ] Lier avec rapprochement bancaire
  - [ ] Dashboard flux de trésorerie

#### 4. ⚠️ **CRM** (crm/)
- Status: **À vérifier**
- Actions:
  - [ ] Vérifier gestion contacts/clients
  - [ ] Pipeline ventes
  - [ ] Opportunités
  - [ ] Intégration communications

---

### **PRIORITÉ 2** - Modules business

#### 5. ⚠️ **VENTES** (sales/)
- Actions:
  - [ ] Devis
  - [ ] Commandes
  - [ ] Lien factures
  - [ ] Statistiques ventes

#### 6. ⚠️ **ACHATS** (purchases/)
- Actions:
  - [ ] Demandes d'achat
  - [ ] Bons de commande
  - [ ] Gestion fournisseurs
  - [ ] Réceptions

#### 7. ✅ **STOCK** (inventory/)
- Status: **Page corrigée**
- Affiche maintenant: 5 produits avec SKU, prix, warehouse
- Actions restantes:
  - [ ] Mouvements de stock
  - [ ] Inventaires physiques
  - [ ] Alertes rupture

#### 8. ⚠️ **RH** (hr/)
- Actions:
  - [ ] Gestion employés
  - [ ] Paie
  - [ ] Congés/Absences
  - [ ] Contrats

---

### **PRIORITÉ 3** - Modules support

#### 9. ✅ **COMMUNICATIONS** - Quasi-complet
- Status: **90% OK**
- ✅ Modals email/SMS/WhatsApp/Templates complètes
- ✅ Services intégrés (Resend + Africa's Talking)
- Reste quelques `alert()` à remplacer par toasts

#### 10. ⚠️ **PROJETS** (projects/)
- Actions:
  - [ ] Gestion projets
  - [ ] Tâches
  - [ ] Temps passé
  - [ ] Budgets projets

#### 11. ⚠️ **BUDGET** (budget/)
- Actions:
  - [ ] Budgets annuels
  - [ ] Suivi vs réalisé
  - [ ] Révisions

---

## 🚨 Problèmes détectés à corriger

### **ALERTS restants** (à remplacer par toasts)
```
📍 communications/emails/page.tsx (ligne 210)
📍 communications/sms/page.tsx (ligne 181)
📍 communications/whatsapp/page.tsx (ligne 181)
📍 communications/templates/page.tsx (ligne 197)
📍 settings/companies/page.tsx (lignes 66, 70)
📍 settings/notifications/page.tsx (lignes 82, 87)
📍 treasury/page.tsx (lignes 45, 74)
```

### **Modals placeholder** (déjà corrigées)
- ✅ Email: Modal complète
- ✅ SMS: Modal complète
- ✅ WhatsApp: Modal complète
- ✅ Templates: Modal complète

---

## 📊 RÉSUMÉ PAR STATUS

### ✅ **Production-Ready (3 modules)**
1. Comptabilité (accountant)
2. Stock (inventory) - données corrigées
3. Communications (90%)

### ⚠️ **Fonctionnel mais incomplet (5 modules)**
1. Trésorerie (treasury) - mock data
2. Factures (invoices) - à tester
3. CRM - à vérifier
4. Ventes (sales) - à vérifier
5. Achats (purchases) - à vérifier

### 🔴 **À implémenter (6 modules)**
1. RH (hr)
2. Projets (projects)
3. Budget (budget)
4. Manufacturing (manufacturing)
5. Marketing (marketing)
6. Learning (learning)

---

## 🎯 RECOMMANDATIONS IMMÉDIATES

### **Phase 1 - Cette semaine** (Critique)
1. ✅ Remplacer tous les `alert()` par `show()` toast
2. ✅ Tester module Factures end-to-end
3. ✅ Vérifier CRM contacts/pipeline
4. ✅ Lier Treasury avec Banking

### **Phase 2 - Semaine prochaine** (Important)
1. Implémenter Ventes complètes
2. Implémenter Achats complets
3. Module RH basique (employés + paie)
4. Projets basique

### **Phase 3 - Mois prochain** (Nice to have)
1. Manufacturing
2. Marketing avancé
3. Learning platform
4. Analytics avancés

---

## 📝 ENDPOINTS BACKEND À VÉRIFIER

### Endpoints manquants potentiels:
```
⚠️ /api/v1/invoices/* - à tester
⚠️ /api/v1/crm/* - à vérifier
⚠️ /api/v1/sales/* - à vérifier
⚠️ /api/v1/purchases/* - à vérifier
⚠️ /api/v1/hr/* - à implémenter
⚠️ /api/v1/projects/* - à implémenter
```

### Endpoints OK:
```
✅ /api/v1/accounting/*
✅ /api/v1/banking/*
✅ /api/v1/mobile-money/*
✅ /api/v1/communications/email/*
✅ /api/v1/communications/sms/*
✅ /api/v1/inventory/items
```

---

## 🔧 ACTIONS TECHNIQUES IMMÉDIATES

### 1. Nettoyer les alerts
```typescript
// Remplacer partout:
alert('Message')
// Par:
show({ title: 'Message', variant: 'success' })
```

### 2. Standardiser les modals
- Utiliser composant Modal réutilisable
- Overlay + animations cohérentes
- Boutons Annuler/Confirmer standards

### 3. Vérifier les endpoints
- Créer script de test automatique
- Vérifier que chaque page a son endpoint
- Ajouter endpoints manquants

---

## 📈 MÉTRIQUES ACTUELLES

**Modules analysés:** 34  
**Fonctionnels complets:** 3 (9%)  
**Partiellement fonctionnels:** 5 (15%)  
**À implémenter:** 26 (76%)

**Objectif court terme:**  
- 10 modules production-ready (30%)

**Objectif moyen terme:**  
- 20 modules production-ready (60%)

---

**Prochaine étape:** Commencer Phase 1 - Nettoyage alerts + Tests factures/CRM
