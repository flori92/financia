# 📚 Documentation Utilisateur - BMS (Business Management System)

## Table des Matières

1. [Introduction](#introduction)
2. [Démarrage Rapide](#démarrage-rapide)
3. [Modules](#modules)
4. [Guide par Fonctionnalité](#guide-par-fonctionnalité)
5. [FAQ](#faq)
6. [Support](#support)

---

## Introduction

BMS est une plateforme ERP complète conçue pour les PME béninoises et ouest-africaines. Elle intègre :

- ✅ **Comptabilité OHADA/SYSCOHADA**
- ✅ **Gestion de trésorerie**
- ✅ **Facturation et devis**
- ✅ **CRM Client**
- ✅ **Télédéclaration fiscale**
- ✅ **Analyse financière**

---

## Démarrage Rapide

### 1. Connexion

1. Accédez à `http://localhost:3000/login`
2. Utilisez les identifiants démo :
   - **Entrepreneur** : `entrepreneur@test.com` / `test123`
   - **Comptable** : `accountant@test.com` / `test123`

### 2. Premier Paramétrage

1. Allez dans **Paramètres** → **Entreprise**
2. Renseignez :
   - Nom de l'entreprise
   - IFU (Identifiant Fiscal Unique)
   - Adresse
   - Contact

3. Allez dans **Plan Comptable**
4. Cliquez sur **Initialiser Plan SYSCOHADA** (si vide)

---

## Modules

### 📊 Dashboard

**Accès :** `/` (entrepreneur) ou `/accountant` (comptable)

**Fonctionnalités :**
- Vue d'ensemble KPI
- Graphiques évolution CA/Charges
- Alertes trésorerie
- Activité récente

### 💰 Trésorerie

**Accès :** `/treasury`

**Fonctionnalités :**

#### 1. Vue d'Ensemble
- Solde actuel
- Prévisions 7/30/90 jours
- Runway (jours de trésorerie disponible)

#### 2. Aperçu
- Graphique encaissements vs décaissements
- Timeline des opérations
- Alertes runway critique (<15j)

#### 3. Flux de Trésorerie
- Historique des transactions
- Filtres par période
- Catégorisation automatique

#### 4. Prévisions
- Modèle prédictif naïf (30 jours historique)
- Niveau de confiance
- Recommandations actions

#### 5. Prélèvements Automatiques
- Gestion mandats SEPA
- Calendrier des prélèvements
- Suivi des statuts (actif/suspendu/annulé)

**Actions :**
- ✅ Créer un prélèvement
- ✅ Suspendre/Réactiver
- ✅ Modifier montant/fréquence
- ✅ Annuler un mandat

### 📄 Factures

**Accès :** `/invoices`

**Types de documents :**
- Devis
- Factures
- Avoirs
- Factures proforma

**Workflow :**
1. Créer document
2. Validation brouillon
3. Envoi client (email)
4. Suivi paiement
5. Lettrage automatique

**Fonctionnalités avancées :**
- TVA automatique
- Remises
- Conditions de paiement
- Relances automatiques

### 👥 CRM

**Accès :** `/crm/contacts`

**Entités :**
- Clients
- Fournisseurs
- Prospects
- Partenaires

**Données par contact :**
- Informations générales
- Historique factures
- Communications
- Documents joints

**Emails automatiques :**
- Bienvenue nouveau client
- Notification facture
- Relance paiement
- Alerte trésorerie

### 📚 Comptabilité OHADA

**Accès :** `/accountant`

#### Plan Comptable

**Accès :** `/accountant/chart-of-accounts`

**Classes SYSCOHADA :**
- Classe 1 : Comptes de capitaux
- Classe 2 : Comptes d'immobilisations
- Classe 3 : Comptes de stocks
- Classe 4 : Comptes de tiers
- Classe 5 : Comptes de trésorerie
- Classe 6 : Comptes de charges
- Classe 7 : Comptes de produits
- Classe 8 : Comptes de résultats

**Actions :**
- ✅ Créer compte personnalisé
- ✅ Modifier libellé
- ✅ Activer/Désactiver
- ✅ Export CSV

#### Journal des Écritures

**Accès :** `/accountant/journal`

**Fonctionnalités :**
- Saisie en partie double
- Validation Débit = Crédit
- Ajout/suppression lignes
- Import CSV
- Export comptable

**Champs obligatoires :**
- Date écriture
- Compte (débit/crédit)
- Libellé
- Montant

#### Balance de Vérification

**Accès :** `/accountant/trial-balance`

**Colonnes :**
- Numéro compte
- Libellé
- Débit total
- Crédit total
- Solde (Débiteur/Créditeur)

**Export :** CSV avec période sélectionnable

#### Compte de Résultat

**Accès :** `/accountant/profit-loss`

**Structure :**
- **Produits** (Classe 7)
  - Ventes marchandises
  - Ventes services
  - Autres produits

- **Charges** (Classe 6)
  - Achats
  - Services extérieurs
  - Charges personnel
  - Dotations

- **Résultat Net** = Produits - Charges

#### Bilan Comptable

**Accès :** `/accountant/balance-sheet`

**Structure OHADA :**

**Actif :**
- Actif immobilisé (Classe 2)
- Actif circulant (Classe 3, 4, 5)

**Passif :**
- Capitaux propres (Classe 1)
- Dettes (Classe 4)

**Équation :** Actif = Passif + Capitaux Propres

#### Balance Âgée

**Accès :** `/accountant/aged-balance`

**Analyses :**

**1. Créances Clients (Compte 411)**
- 0-30 jours : Vert
- 30-60 jours : Bleu
- 60-90 jours : Orange
- >90 jours : Rouge ⚠️

**2. Dettes Fournisseurs (Compte 401)**
- Même ventilation par ancienneté
- Actions : paiement prioritaire >90j

**Utilisations :**
- Relances clients ciblées
- Négociation délais fournisseurs
- Détection risques impayés
- Optimisation BFR

### 📊 Budget

**Accès :** `/budget`

**Fonctionnalités :**

#### 1. Création Budget
- Budget annuel/exercice
- Répartition par compte
- Montants prévisionnels

#### 2. Suivi Réalisé vs Prévu
- Écarts par ligne
- % consommation
- Alertes dépassement

#### 3. Révisions
- Historique versions
- Validation workflow
- Commentaires

### 💸 TVA & Fiscalité

**Accès :** `/accountant/tax`

#### Déclarations TVA

**Supports :**
- CA3 (mensuel/trimestriel)
- Export FEC (Fichier Écritures Comptables)
- PDF CA3 officiel

**Workflow :**
1. Calcul TVA collectée (classe 7)
2. Calcul TVA déductible (classe 6)
3. TVA nette = Collectée - Déductible
4. Génération PDF CA3
5. Export FEC pour télédéclaration

**Recalcul automatique :**
- Bouton "Recalculer TVA"
- Mise à jour temps réel

### 🤖 OCR & IA

**Accès :** `/ai/ocr`

**Types de documents :**
- Factures fournisseurs
- Reçus
- Relevés bancaires

**Technologies :**
- Tesseract.js (OCR local)
- Support français/anglais
- Détection automatique layout

**Workflow :**
1. Upload document (JPG/PNG/PDF)
2. Extraction automatique
3. Édition manuelle si besoin
4. Validation données
5. Création écriture comptable

**Champs extraits :**
- Date
- Montant HT/TTC
- TVA
- Fournisseur
- Numéro facture
- Lignes de détail

### 📈 Rapports & Exports

**Formats disponibles :**
- CSV (comptabilité)
- PDF (CA3, factures)
- Excel (analyses)
- FEC (télédéclaration)

**Rapports standards :**
- Balance de vérification
- Grand livre
- Journal comptable
- États financiers
- Prévisions trésorerie

---

## Guide par Fonctionnalité

### Créer une Facture

1. Allez dans **Factures** → **Nouvelle facture**
2. Sélectionnez le client
3. Ajoutez des lignes :
   - Désignation
   - Quantité
   - Prix unitaire HT
4. TVA calculée automatiquement
5. Enregistrez en **Brouillon**
6. Validez → Statut **À payer**
7. Envoyez par email au client

### Effectuer un Rapprochement Bancaire

1. Allez dans **Rapprochement Bancaire**
2. Importez relevé CSV :
   ```
   Date,Montant,Libellé,Référence
   2025-11-01,50000,Paiement Facture,INV-2025-001
   ```
3. Système suggère correspondances automatiques
4. Validez les rapprochements
5. Ignorez les lignes non pertinentes

### Configurer un Prélèvement Automatique

1. Allez dans **Prélèvements**
2. Cliquez **Nouveau prélèvement**
3. Renseignez :
   - Référence mandat
   - Bénéficiaire
   - Montant
   - Fréquence (mensuel/trimestriel/annuel)
   - Jour du mois
   - Dates début/fin
4. Enregistrez
5. Système calcule automatiquement prochaines dates

**Actions disponibles :**
- **Suspendre** : pause temporaire
- **Réactiver** : reprise après suspension
- **Annuler** : arrêt définitif
- **Modifier** : changement montant/fréquence

### Gérer les Alertes Trésorerie

**Types d'alertes :**

#### Critique (Rouge) 🔴
- Runway < 15 jours
- Action : mobilisation urgente fonds

#### Avertissement (Orange) 🟠
- Runway 15-30 jours
- Action : planifier recettes

#### Info (Vert) 🟢
- Runway > 30 jours
- Situation saine

**Configuration :**
- Emails automatiques (09h00 quotidien)
- Seuils personnalisables
- Désactivation possible

### Exporter Données Comptables

#### Format FEC (Télédéclaration DGI)
1. Allez dans **Comptabilité** → **Export FEC**
2. Sélectionnez période
3. Cliquez **Générer FEC**
4. Téléchargez fichier `.txt`
5. Uploadez sur portail DGI

#### Format CSV (Analyse)
1. Sélectionnez rapport (Balance, Journal, etc.)
2. Cliquez **Exporter CSV**
3. Ouvrez dans Excel/Sheets

### Initialiser Plan Comptable

**Première utilisation :**
1. Allez dans **Plan Comptable**
2. Cliquez **Initialiser Plan SYSCOHADA**
3. 55+ comptes créés automatiquement
4. Personnalisez si besoin

**Comptes principaux créés :**
- 101 Capital
- 106 Réserves
- 411 Clients
- 401 Fournisseurs
- 512 Banque
- 531 Caisse
- 707 Ventes marchandises
- 706 Prestations de services
- 607 Achats
- 4457 TVA collectée
- 4456 TVA déductible

---

## FAQ

### Comptabilité

**Q: Comment corriger une écriture validée ?**
R: Créez une écriture d'extourne (inversion débit/crédit) avec référence à l'écriture initiale.

**Q: La balance ne s'équilibre pas ?**
R: Vérifiez que toutes les écritures respectent la partie double (débit = crédit).

**Q: Peut-on supprimer un compte ?**
R: Non, désactivez-le pour éviter son utilisation future mais conserver l'historique.

### Trésorerie

**Q: Comment améliorer le runway ?**
R:
1. Relancer clients créances >30j
2. Négocier délais fournisseurs
3. Différer dépenses non urgentes
4. Mobiliser ligne de crédit

**Q: Les prévisions sont-elles fiables ?**
R: Le modèle utilise les 30 derniers jours. Fiabilité moyenne 60-80% selon stabilité activité.

### Prélèvements

**Q: Que se passe-t-il si compte insuffisant ?**
R: Le prélèvement sera rejeté. Système enverra notification. Reprogrammez manuellement.

**Q: Peut-on modifier un prélèvement actif ?**
R: Oui, modifiez montant/fréquence. Nouveau calcul dates automatique.

### TVA

**Q: Comment télédéclarer la TVA ?**
R:
1. Générez PDF CA3
2. Exportez FEC
3. Connectez-vous portail DGI
4. Uploadez documents
5. Validez déclaration

**Q: Erreur montants TVA ?**
R: Cliquez "Recalculer TVA" pour mise à jour temps réel.

---

## Support

### Assistance Technique

**Email :** support@bms.app  
**Téléphone :** +229 XX XX XX XX  
**Horaires :** Lun-Ven 8h-18h (WAT)

### Ressources

- 📖 [Guide PDF complet](https://docs.bms.app)
- 🎥 [Vidéos tutoriels](https://youtube.com/@bms)
- 💬 [Forum communauté](https://forum.bms.app)
- 🐛 [Signaler un bug](https://github.com/bms/issues)

### Formation

**Formations disponibles :**
- Initiation BMS (2h)
- Comptabilité OHADA (4h)
- Télédéclaration fiscale (1h)
- Analyse financière (3h)

**Tarifs :**
- En ligne : 15 000 FCFA/module
- Sur site : 200 000 FCFA/jour (groupe)

---

## Changelog

### Version 1.5.0 (Nov 2025)
- ✅ Prélèvements automatiques
- ✅ PDF CA3 professionnel
- ✅ Emails SendGrid
- ✅ DirectDebits complet
- ✅ Balance âgée
- ✅ Dashboard avancé

### Version 1.0.0 (Oct 2025)
- ✅ Comptabilité SYSCOHADA
- ✅ Trésorerie prévisions
- ✅ OCR Tesseract.js
- ✅ Facturation
- ✅ CRM
- ✅ TVA automatique

---

## Glossaire

**BFR** : Besoin en Fonds de Roulement  
**CA** : Chiffre d'Affaires  
**DGI** : Direction Générale des Impôts  
**FEC** : Fichier des Écritures Comptables  
**IFU** : Identifiant Fiscal Unique  
**NIF** : Numéro d'Identification Fiscale  
**OHADA** : Organisation pour l'Harmonisation en Afrique du Droit des Affaires  
**Runway** : Nombre de jours avant épuisement trésorerie  
**SYSCOHADA** : Système Comptable OHADA  
**TVA** : Taxe sur la Valeur Ajoutée  

---

**Dernière mise à jour :** 1er Novembre 2025  
**Version document :** 1.0
