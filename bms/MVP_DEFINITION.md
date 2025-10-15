# 🎯 BMS - Définition du MVP (Minimum Viable Product)

**Date**: 15 Octobre 2025  
**Version**: 1.0  
**Cible**: Entrepreneurs & Experts-Comptables en Afrique de l'Ouest

---

## 🎪 Vue d'Ensemble du MVP

### **Positionnement**
BMS est la première plateforme qui **rend la gestion d'entreprise accessible** aux TPE/PME africaines, tout en offrant des **outils professionnels** aux cabinets comptables.

### **Promesse Principale**
> "De la facturation au bilan OHADA en quelques clics, depuis ton téléphone"

---

## 👔 POUR LES ENTREPRENEURS

### **Profil Cible**
- Micro-entreprises (1-5 employés)
- TPE/PME (5-50 employés)
- Commerçants, artisans, prestataires
- Revenus: 500k - 50M FCFA/an

### **🎯 Fonctionnalités MVP Entrepreneurs**

#### **1. Facturation Simplifiée** ⭐ PRIORITÉ 1
```
✅ Créer facture en 30 secondes
✅ Factures professionnelles (logo, NIF, etc.)
✅ Envoi automatique (WhatsApp, SMS, Email)
✅ QR Code pour paiement mobile money
✅ Suivi paiements (payé/impayé/en retard)
✅ Relances automatiques
✅ Multi-devises (FCFA, EUR, USD)
```

**Workflows**:
- Créer client → Créer facture → Envoyer → Recevoir paiement → Tout!
- Templates de factures prédéfinis par secteur
- Numérotation automatique conforme

#### **2. Encaissement Mobile Money** ⭐ PRIORITÉ 1
```
✅ Intégration MTN, Moov, Orange Money, Wave
✅ Génération QR Code paiement
✅ Lien de paiement unique par facture
✅ Notification instantanée de paiement
✅ Rapprochement automatique facture-paiement
```

**Workflows**:
- Client reçoit facture avec QR Code → Scanne → Paie → Entrepreneur notifié
- Lien de paiement partageable (WhatsApp, SMS)

#### **3. Suivi Trésorerie Simple** ⭐ PRIORITÉ 2
```
✅ Tableau de bord clair
   - Chiffre d'affaires du mois
   - Factures en attente
   - Paiements reçus aujourd'hui
   - Solde disponible
✅ Graphiques simples (CA mensuel, évolution)
✅ Alertes factures impayées > 30 jours
✅ Prévisions trésorerie 30 jours
```

**Vue Dashboard**:
```
╔═══════════════════════════════════════════╗
║  📊 Mon Entreprise - Octobre 2025        ║
╠═══════════════════════════════════════════╣
║  💰 CA ce mois : 2,450,000 FCFA          ║
║  ⏰ En attente  : 850,000 FCFA (4 fact.) ║
║  ✅ Encaissé    : 1,600,000 FCFA          ║
║  📈 vs mois dernier : +15%                ║
╚═══════════════════════════════════════════╝
```

#### **4. Comptabilité Basique OHADA** ⭐ PRIORITÉ 2
```
✅ Journal des ventes (automatique depuis factures)
✅ Journal des achats (saisie manuelle simple)
✅ Journal de banque/caisse
✅ Grand livre simplifié
✅ Balance des comptes
✅ Compte de résultat simplifié
```

**Approche**:
- L'entrepreneur **ne voit PAS** les écritures comptables
- Tout se fait automatiquement en arrière-plan
- Il voit juste : "Ventes", "Achats", "Résultat"

#### **5. Demande de NIF** ⭐ PRIORITÉ 3
```
✅ Formulaire simplifié de demande NIF
✅ Upload documents (RCCM, IFU, etc.)
✅ Suivi statut demande
✅ Notification validation/rejet
✅ Stockage NIF dans profil entreprise
```

**Workflow**:
- Remplir formulaire → Upload docs → Soumettre → Attendre validation DGI

#### **6. Score de Crédit** ⭐ PRIORITÉ 3
```
✅ Calcul automatique du credit score (0-100)
✅ Facteurs pris en compte:
   - Volume transactions
   - Régularité paiements
   - Ancienneté
   - Conformité fiscale (NIF)
✅ Visualisation claire du score
✅ Recommandations d'amélioration
✅ Montant max empruntable estimé
```

**Affichage**:
```
╔═══════════════════════════════════════════╗
║  🎯 Votre Score de Crédit                ║
╠═══════════════════════════════════════════╣
║  Score : 72/100  ⭐⭐⭐⭐☆               ║
║  Niveau : BON                             ║
║                                           ║
║  Vous pouvez emprunter jusqu'à :         ║
║  💰 5,000,000 FCFA                       ║
║                                           ║
║  Pour améliorer :                         ║
║  ✓ Obtenir votre NIF (+10 pts)          ║
║  ✓ Augmenter CA mensuel (+5 pts)        ║
╚═══════════════════════════════════════════╝
```

#### **7. Demande de Prêt** ⭐ PRIORITÉ 3
```
✅ Simulation de prêt (montant, durée, taux)
✅ Vérification éligibilité (score min requis)
✅ Formulaire demande simplifié
✅ Envoi automatique aux banques partenaires
✅ Suivi statut demande
✅ Notifications décision
```

**Workflow**:
- Simuler prêt → Vérifier score → Demander → Banques évaluent → Réponse

#### **8. Application Mobile** ⭐ PRIORITÉ 1
```
✅ iOS + Android (React Native)
✅ Toutes fonctions entrepreneurs
✅ Mode offline (sync auto quand online)
✅ Notifications push
✅ Appareil photo pour documents
✅ Partage factures direct (WhatsApp)
```

**Fonctions Offline**:
- Créer factures
- Enregistrer paiements
- Consulter dashboard
- → Sync auto quand connexion revient

---

## 👨‍💼 POUR LES EXPERTS-COMPTABLES

### **Profil Cible**
- Cabinets comptables (1-10 comptables)
- Experts-comptables indépendants
- Gèrent 5-100 clients TPE/PME
- Besoin conformité OHADA stricte

### **🎯 Fonctionnalités MVP Experts-Comptables**

#### **1. Gestion Multi-Clients** ⭐ PRIORITÉ 1
```
✅ Tableau de bord tous clients
✅ Vue consolidée (CA total, dossiers en retard)
✅ Accès complet dossiers clients
✅ Switch rapide entre clients
✅ Filtres et recherche
✅ Statistiques cabinet
```

**Dashboard Cabinet**:
```
╔═══════════════════════════════════════════╗
║  📊 Cabinet ABC - 45 Clients Actifs      ║
╠═══════════════════════════════════════════╣
║  ⚠️  À traiter :                          ║
║     • 12 dossiers en retard              ║
║     • 8 validations en attente           ║
║     • 5 déclarations fiscales ce mois    ║
║                                           ║
║  💰 CA Total Clients : 150M FCFA/mois    ║
║  📈 Nouveaux ce mois : 3 clients         ║
╚═══════════════════════════════════════════╝
```

#### **2. Comptabilité OHADA Complète** ⭐ PRIORITÉ 1
```
✅ Saisie écritures comptables classique
✅ Plan comptable SYSCOHADA complet
✅ Journaux multiples (ventes, achats, OD, banque)
✅ Lettrage comptes
✅ Validation écritures
✅ Clôture exercice
✅ Reports à nouveau
```

**Interface Comptable**:
- Saisie par guide (débit/crédit)
- Import écritures Excel/CSV
- Modèles d'écritures récurrentes
- Vérification équilibre automatique

#### **3. Rapports Professionnels** ⭐ PRIORITÉ 1
```
✅ Balance générale
✅ Grand livre
✅ Journaux détaillés
✅ Compte de résultat SYSCOHADA
✅ Bilan SYSCOHADA
✅ Balance âgée (clients/fournisseurs)
✅ Tableau de trésorerie
✅ Export PDF/Excel
```

**Formats**:
- Conformes normes OHADA
- Prêts pour administration fiscale
- Personnalisables (logo cabinet)

#### **4. Révision & Validation** ⭐ PRIORITÉ 2
```
✅ File d'attente révision
✅ Validation écritures par lot
✅ Commentaires et annotations
✅ Historique modifications
✅ Verrouillage périodes
✅ Points de contrôle automatiques
```

**Workflow**:
- Client saisit → Expert révise → Valide ou Rejette avec commentaires

#### **5. Déclarations Fiscales** ⭐ PRIORITÉ 2
```
✅ Calcul automatique TVA
✅ Génération déclaration TVA
✅ Calcul IR/IS
✅ Préremplissage formulaires DGI
✅ Export format DGI
✅ Historique déclarations
```

**Conformité**:
- Respect calendrier fiscal
- Alertes échéances
- Archives conformes

#### **6. Collaboration Client-Expert** ⭐ PRIORITÉ 2
```
✅ Messagerie intégrée
✅ Demandes de pièces justificatives
✅ Upload documents par client
✅ Validation opérations par expert
✅ Notifications temps réel
✅ Historique échanges
```

**Communication**:
```
Expert : "Merci d'envoyer factures achats Septembre"
Client : [Upload 12 fichiers]
Expert : "Reçu, traitement en cours"
```

#### **7. Facturation Cabinet** ⭐ PRIORITÉ 3
```
✅ Facturer honoraires clients
✅ Forfaits mensuels
✅ Prestations ponctuelles
✅ Suivi paiements honoraires
✅ Relances automatiques
```

#### **8. Application Web Bureau** ⭐ PRIORITÉ 1
```
✅ Interface bureau complète
✅ Multi-onglets
✅ Raccourcis clavier
✅ Saisie rapide
✅ Mode plein écran
```

---

## 📱 APPLICATIONS & PLATEFORMES MVP

### **1. Application Mobile (React Native)**
**Pour**: Entrepreneurs  
**Plateformes**: iOS 13+, Android 8+  
**Taille**: ~30 MB  

**Fonctions Clés**:
- Facturation complète
- Mobile money
- Dashboard
- Mode offline
- Notifications

### **2. Application Web (Next.js)**
**Pour**: Experts-comptables + Entrepreneurs (bureau)  
**Compatible**: Chrome, Safari, Firefox, Edge  

**Fonctions Clés**:
- Toutes fonctions comptabilité
- Rapports avancés
- Multi-clients
- Export/Import

### **3. API Gateway (NestJS)**
**Backend unifié**  
**Port**: 3001  
**Documentation**: Swagger  

**Services**:
- 61 endpoints REST
- Authentification JWT
- Sync temps réel
- Webhooks

---

## 🎨 PARCOURS UTILISATEUR MVP

### **Entrepreneur - Premier Jour**

```
1. Télécharge app mobile
2. Inscrit entreprise (nom, secteur)
3. Crée premier client
4. Émet première facture
5. Envoie par WhatsApp avec QR Code
6. Client paie via mobile money
7. Notification paiement reçu
8. Voit CA à jour sur dashboard
   
   ⏱️ Temps total : 10 minutes
```

### **Expert-Comptable - Premier Jour**

```
1. S'inscrit comme cabinet
2. Crée profil cabinet
3. Invite premier client
4. Client accepte invitation
5. Accède au dossier client
6. Révise écritures du mois
7. Génère bilan
8. Envoie au client
   
   ⏱️ Temps total : 30 minutes
```

---

## 💰 MODÈLE TARIFAIRE MVP

### **Pour Entrepreneurs**

| Plan | Prix FCFA/mois | Inclus | Cible |
|------|----------------|--------|-------|
| **Starter** | 7,500 | 50 factures/mois<br>1 utilisateur<br>Mobile + Web<br>Support email | Micro-entreprises |
| **Business** | 15,000 | 200 factures/mois<br>3 utilisateurs<br>Multi-devises<br>Support prioritaire | TPE |
| **Pro** | 25,000 | Factures illimitées<br>10 utilisateurs<br>API access<br>Expert dédié | PME |

### **Pour Experts-Comptables**

| Plan | Prix FCFA/mois | Inclus | Cible |
|------|----------------|--------|-------|
| **Cabinet Starter** | 25,000 | 10 clients<br>2 comptables<br>Tous rapports | Indépendants |
| **Cabinet Business** | 50,000 | 50 clients<br>5 comptables<br>White-label | Petits cabinets |
| **Cabinet Pro** | 100,000 | Clients illimités<br>Comptables illimités<br>API<br>Support dédié | Grands cabinets |

**Essai gratuit**: 30 jours tous plans

---

## 🚀 ROADMAP MVP (3 Mois)

### **Mois 1 : Core Features**
```
Semaine 1-2 : Auth + Companies + Invoices
Semaine 3-4 : Payments + Mobile Money
```

### **Mois 2 : Accounting & Mobile**
```
Semaine 5-6 : Accounting OHADA + Reports
Semaine 7-8 : Mobile App (iOS + Android)
```

### **Mois 3 : Advanced & Polish**
```
Semaine 9-10 : NIF + Scoring + Loans
Semaine 11-12 : Tests + Debug + Launch
```

---

## ✅ CRITÈRES DE SUCCÈS MVP

### **Métriques Techniques**
- ✅ API response time < 200ms
- ✅ Mobile app < 30 MB
- ✅ 99.5% uptime
- ✅ Sync offline < 30s

### **Métriques Utilisateurs**
- 🎯 100 entrepreneurs actifs
- 🎯 10 cabinets comptables
- 🎯 1,000 factures créées
- 🎯 500,000 FCFA transités
- 🎯 NPS > 50

### **Métriques Business**
- 🎯 10,000 FCFA MRR (Monthly Recurring Revenue)
- 🎯 < 5% churn mensuel
- 🎯 50% des users actifs quotidiens
- 🎯 3 min temps moyen création facture

---

## 🎯 CE QUI N'EST PAS DANS LE MVP

### **Reporté à V2**
- ❌ Gestion stock/inventaire
- ❌ Paie / RH
- ❌ Manufacturing
- ❌ CRM avancé
- ❌ Multi-sociétés
- ❌ Consolidation
- ❌ Budget/Prévisionnel
- ❌ Immobilisations détaillées

### **Pourquoi ?**
- Focus sur la **simplicité**
- Valider le **product-market fit**
- Itérer rapidement sur **l'essentiel**

---

## 📊 ÉTAT ACTUEL (15 Oct 2025)

### **✅ Déjà Implémenté (85%)**
- ✅ Auth & JWT
- ✅ Companies
- ✅ Invoices (complet)
- ✅ Payments (complet)
- ✅ Mobile Money (4 providers)
- ✅ Accounting OHADA (complet)
- ✅ Sync Offline
- ✅ NIF
- ✅ Scoring
- ✅ Loans
- ✅ API Gateway (61 endpoints)
- ✅ Swagger Documentation

### **⏳ En Cours**
- ⏳ Application Mobile (à démarrer)
- ⏳ Interface Web (Next.js à démarrer)
- ⏳ Intégration Frappe (optionnel)

### **🔜 À Faire**
- 🔜 Tests utilisateurs
- 🔜 Design UI/UX
- 🔜 Déploiement production
- 🔜 Onboarding
- 🔜 Documentation utilisateur

---

## 🎉 PROPOSITION DE VALEUR UNIQUE

### **Pour Entrepreneurs**
> "Gère ton business comme un pro, depuis ton téléphone, sans être comptable"

**Bénéfices**:
- ⚡ Facturation en 30 secondes
- 💰 Encaissement instant (mobile money)
- 📊 Vision trésorerie temps réel
- 🎯 Accès au crédit (scoring)
- 📱 100% mobile, fonctionne offline

### **Pour Experts-Comptables**
> "Tous vos clients au même endroit, conformité OHADA garantie"

**Bénéfices**:
- 🚀 3x plus productif (automatisation)
- ✅ Conformité OHADA assurée
- 👥 Collaboration fluide avec clients
- 📈 Développer cabinet (nouveaux clients)
- 💼 Professionnalisme renforcé

---

## 📞 PROCHAINES ÉTAPES

1. **Valider cette définition MVP** avec toi ✅
2. **Prioriser** : Mobile App ou Web App d'abord ?
3. **Design** : Créer maquettes UI/UX
4. **Développement** : Sprint 2 semaines
5. **Tests** : 5-10 bêta-testeurs
6. **Launch** : Soft launch Bénin

---

**Questions à trancher** :
- On développe **Mobile** ou **Web** en premier ?
- Quel pays pour le **pilot** (Bénin, Togo, Sénégal) ?
- Prix **OK** ou ajuster ?
- Autres fonctionnalités **critiques** manquantes ?
