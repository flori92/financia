# 👤 Guide Utilisateur BMS - Module Comptable

**Version** : 1.0.0  
**Date** : 18 Octobre 2025  
**Public** : Comptables, Experts-comptables, Gestionnaires

---

## 📋 Table des Matières

1. [Démarrage Rapide](#démarrage-rapide)
2. [Plan Comptable](#plan-comptable)
3. [Journal des Écritures](#journal-des-écritures)
4. [Grand Livre](#grand-livre)
5. [États Comptables](#états-comptables)
6. [Balance Âgée](#balance-âgée)
7. [Rapprochement Bancaire](#rapprochement-bancaire)
8. [Déclaration TVA](#déclaration-tva)
9. [Clôture de Période](#clôture-de-période)
10. [Dashboard](#dashboard)
11. [FAQ](#faq)

---

## 🚀 Démarrage Rapide

### 1. Premier Accès

Accédez au module comptable via :
```
Menu → Comptabilité → Dashboard Comptable
```

### 2. Initialisation du Plan Comptable

**Si c'est votre première utilisation** :

1. Allez sur **Plan Comptable SYSCOHADA**
2. Cliquez sur **"Initialiser le Plan Comptable"**
3. Le système créera automatiquement 55+ comptes OHADA

✅ **Comptes créés** : Classes 1 à 8 (Capital, Immobilisations, Stocks, Créances, etc.)

---

## 📊 Plan Comptable

### Accès
```
Menu → Plan Comptable SYSCOHADA
```

### Fonctionnalités

#### 🔍 Recherche
- Tapez un numéro de compte : `411`
- Tapez un nom : `Clients`
- Recherche instantanée dans toute la liste

#### 🎯 Filtrage par Classe
Utilisez les boutons rapides :
- **Classe 1** : Capitaux
- **Classe 2** : Immobilisations
- **Classe 3** : Stocks
- **Classe 4** : Tiers (Clients, Fournisseurs)
- **Classe 5** : Trésorerie
- **Classe 6** : Charges
- **Classe 7** : Produits
- **Classe 8** : Résultats

#### ➕ Créer un Compte Personnalisé

1. Cliquez sur **"Nouveau Compte"**
2. Remplissez :
   - **N° Compte** : Ex: `411001`
   - **Nom** : Ex: `Client ABC Corporation`
   - **Type** : Asset / Liability / Equity / Revenue / Expense
3. Cliquez sur **"Créer"**

💡 **Astuce** : Respectez la numérotation SYSCOHADA pour les comptes auxiliaires

---

## 📝 Journal des Écritures

### Accès
```
Menu → Journal des Écritures
```

### Créer une Écriture Comptable

#### Méthode Manuelle (Partie Double)

1. Cliquez sur **"Nouvelle Écriture"**
2. Remplissez l'en-tête :
   - **Date** : Date de l'opération
   - **Description** : Ex: "Facture client ABC"
   - **Type de journal** : Ventes / Achats / Banque / OD
   - **Référence** : Ex: "FINV-2025-003"

3. Ajoutez les lignes (minimum 2) :
   
   **Ligne 1 - Débit** :
   - Compte : `411 - Clients`
   - Libellé : `Facture ABC`
   - Débit : `590 000`
   
   **Ligne 2 - Crédit** :
   - Compte : `707 - Ventes de marchandises`
   - Libellé : `Vente marchandises`
   - Crédit : `500 000`
   
   **Ligne 3 - Crédit** :
   - Compte : `4457 - TVA Collectée`
   - Libellé : `TVA 18%`
   - Crédit : `90 000`

4. **Validation automatique** :
   - ✅ Total Débit = Total Crédit (590 000 = 590 000)
   - ✅ Bouton "Enregistrer" devient actif

5. Enregistrez → Status **"Brouillon"**

#### Méthode Automatique (Rapide)

Pour les opérations courantes, utilisez les **écritures automatiques** :

**Vente Client** :
```
Automatisation → Vente Client
```
- Nom client : `ABC Corporation`
- Montant HT : `500 000`
- TVA : `18%`
- Type : `Marchandises / Services`

→ Génère automatiquement les 3 lignes

**Achat Fournisseur** :
```
Automatisation → Achat Fournisseur
```

**Paiement Client** :
```
Automatisation → Paiement Client
```

**Paiement Fournisseur** :
```
Automatisation → Paiement Fournisseur
```

### Valider une Écriture

1. Dans la liste, cliquez sur **"Valider"**
2. L'écriture passe en status **"Validée"**
3. ⚠️ **Attention** : Une écriture validée ne peut plus être modifiée

💡 **Bonne pratique** : Validez vos écritures après vérification complète

---

## 📖 Grand Livre

### Accès
```
Menu → Grand Livre
```

### Consulter un Compte Spécifique

1. **Filtres** :
   - Sélectionnez un compte : `411 - Clients`
   - Période : Date début → Date fin
   
2. Cliquez sur **"Afficher"**

### Informations Affichées

**En-tête** :
- Numéro et nom du compte
- Type de compte

**Tableau des Mouvements** :
| Date | N° Écriture | Description | Référence | Débit | Crédit | **Solde** |
|------|-------------|-------------|-----------|-------|--------|-----------|
| 17/10 | JNL-001 | Facture ABC | FINV-003 | 590 000 | - | **590 000** |
| 18/10 | JNL-002 | Paiement ABC | PAY-045 | - | 590 000 | **0** |

**Résumé** :
- Total Débit : `590 000 FCFA`
- Total Crédit : `590 000 FCFA`
- **Solde Final** : `0 FCFA` (vert si positif, rouge si négatif)

💡 **Le solde progressif** permet de suivre l'évolution du compte ligne par ligne

---

## 📑 États Comptables

### Balance de Vérification

**Accès** : `Menu → Balance de Vérification`

**Utilité** : Vérifier l'équilibre Débit = Crédit

**Colonnes** :
- N° Compte
- Nom du compte
- Total Débit
- Total Crédit
- **Solde** (Débit - Crédit)

**Footer** : Totaux généraux (doivent être égaux)

### Compte de Résultat

**Accès** : `Menu → Compte de Résultat`

**Structure** :

**Produits (Classe 7)** | **Charges (Classe 6)**
--- | ---
707 - Ventes : 5 000 000 | 607 - Achats : 3 000 000
706 - Services : 1 500 000 | 621 - Personnel : 800 000
**Total** : 6 500 000 | **Total** : 3 800 000

**Résultat Net** : 2 700 000 FCFA ✅ (Bénéfice)

💡 Si résultat négatif → Perte (affiché en rouge)

### Bilan

**Accès** : `Menu → Bilan`

**Structure** :

**ACTIF** | **PASSIF**
--- | ---
**Immobilisations** | **Capitaux Propres**
Matériel : 2 000 000 | Capital : 5 000 000
**Actif Circulant** | Résultat : 2 700 000
Stocks : 1 500 000 | **Dettes**
Clients : 1 200 000 | Fournisseurs : 800 000
Banque : 4 000 000 | TVA : 200 000
**Total** : 8 700 000 | **Total** : 8 700 000

✅ **L'équilibre Actif = Passif doit toujours être respecté**

---

## ⏰ Balance Âgée

### Accès
```
Menu → Balance Âgée
```

### Utilité
Analyser l'ancienneté des **créances clients** et **dettes fournisseurs**.

### Onglets

#### 1. Créances Clients

**Répartition par ancienneté** :
- **0-30 jours** : 600 000 FCFA (vert)
- **30-60 jours** : 350 000 FCFA (bleu)
- **60-90 jours** : 200 000 FCFA (orange)
- **> 90 jours** : 100 000 FCFA ⚠️ (rouge - À recouvrer)

**Tableau détaillé par client** :
| Client | Total | 0-30j | 30-60j | 60-90j | >90j | Plus ancienne |
|--------|-------|-------|--------|--------|------|---------------|
| ABC Corp | 250 000 | 100 000 | 80 000 | 50 000 | 20 000 | 15/05/2025 |

**Alerte** : Si >90j ≠ 0 → Message rouge "Actions de recouvrement recommandées"

#### 2. Dettes Fournisseurs

Même structure pour les dettes à payer.

💡 **Utilisez cet écran pour** :
- Prioriser les relances clients
- Planifier les paiements fournisseurs
- Négocier les délais

---

## 🏦 Rapprochement Bancaire

### Accès
```
Menu → Rapprochement Bancaire
```

### Étapes du Rapprochement

#### 1. Import du Relevé Bancaire

1. Préparez votre fichier **CSV** avec colonnes :
   ```
   Date;Montant;Libellé;Référence
   17/10/2025;250000;Virement client ABC;VIR20251017
   ```

2. Cliquez sur **"Importer CSV"**
3. Sélectionnez votre fichier
4. Les transactions sont importées avec status **"À rapprocher"**

#### 2. Rapprochement Automatique

Pour chaque transaction bancaire :

1. Cliquez sur **"Suggérer"**
2. Le système propose des paiements correspondants :
   - Montant ±5%
   - Date ±7 jours
3. Cliquez sur **"Rapprocher"** pour valider

#### 3. Rapprochement Manuel

Si aucune suggestion :

1. Recherchez manuellement le paiement
2. Sélectionnez-le dans la liste
3. Cliquez sur **"Rapprocher"**

#### 4. Ignorer une Transaction

Pour les transactions sans correspondance comptable :
- Cliquez sur **"Ignorer"**
- Status → **"Ignoré"**

### Filtres

Utilisez les filtres pour faciliter le rapprochement :
- **À rapprocher** : Transactions en attente
- **Rapproché** : Transactions validées
- **Ignoré** : Transactions ignorées

---

## 💸 Déclaration TVA

### Accès
```
Menu → Déclaration TVA
```

### Calculer la TVA à Déclarer

1. **Sélectionnez la période** :
   - Boutons rapides : Mois en cours / Trimestre / Année
   - OU dates personnalisées

2. Cliquez sur **"Calculer"**

### Résultat Affiché

**Détail du calcul** :

| Élément | Montant |
|---------|---------|
| **Chiffre d'Affaires HT** | 5 000 000 |
| **TVA Collectée (18%)** | 900 000 |
| **Achats HT** | 3 000 000 |
| **TVA Déductible (18%)** | 540 000 |
| **TVA Nette à Payer** | **360 000** |

✅ Si résultat positif → TVA à payer  
↩️ Si résultat négatif → Crédit de TVA

### Export pour la DGI

1. Cliquez sur **"Exporter CSV"**
2. Fichier généré au format **e-impôts Bénin**
3. Importez-le directement sur le portail DGI

💡 **Périodicité** : Mensuelle pour les grandes entreprises, trimestrielle pour les PME

---

## 🔒 Clôture de Période

### Accès
```
Menu → Clôture de Période
```

⚠️ **ATTENTION : Opération IRRÉVERSIBLE**

### Quand Clôturer ?

- **Clôture Mensuelle** : Fin de chaque mois (optionnel)
- **Clôture Annuelle** : 31 Décembre (obligatoire)

### Étapes de la Clôture

#### 1. Aperçu Avant Clôture

1. Sélectionnez la période : `01/01/2025` → `31/12/2025`
2. Cliquez sur **"Aperçu"**

**Informations affichées** :
- Total Produits (Classe 7)
- Total Charges (Classe 6)
- **Résultat** (Bénéfice ou Perte)
- ✅ Possibilité de clôturer (oui/non)

#### 2. Vérifications Avant Clôture

✅ **Check-list** :
- [ ] Toutes les écritures sont validées (pas de brouillon)
- [ ] Rapprochement bancaire terminé
- [ ] TVA déclarée et payée
- [ ] Balance équilibrée (Débit = Crédit)
- [ ] Inventaire effectué (pour les stocks)

#### 3. Lancer la Clôture

1. Cliquez sur **"Clôturer la Période"**
2. Confirmez l'opération

**Le système effectue automatiquement** :

1. **Calcul du résultat** : Produits - Charges
2. **Génération OD de clôture** :
   - Débit comptes de Produits (solder)
   - Crédit comptes de Charges (solder)
   - Transfert résultat → Compte 120
3. **Verrouillage de la période** : Plus d'écritures possibles
4. **Création enregistrement** : Audit trail complet

#### 4. Après la Clôture

✅ **Période verrouillée** : Aucune modification possible  
📊 **États disponibles** : Balance, P&L, Bilan de clôture  
📝 **Nouvelle période** : Prête pour l'exercice suivant

💡 **Si erreur détectée après clôture** : Corriger dans le nouvel exercice avec une écriture de correction

---

## 📊 Dashboard Comptable

### Accès
```
Menu → Dashboard Comptable
```

### Vue d'Ensemble

#### Alertes (en haut)

**Types d'alertes** :
- 🔴 **Danger** : Liquidité faible, situation critique
- 🟠 **Warning** : Écritures en brouillon, résultat négatif
- 🔵 **Info** : Situation saine, aucune alerte

#### KPI du Mois En Cours

**4 cartes principales** :

1. **CA du Mois**
   - Montant : Somme classe 7 (Produits)
   - Couleur : Bleu
   
2. **Charges du Mois**
   - Montant : Somme classe 6 (Charges)
   - Couleur : Orange
   
3. **Résultat Net**
   - Montant : CA - Charges
   - Couleur : Vert (bénéfice) / Rouge (perte)
   
4. **Marge Brute**
   - Calcul : (Résultat / CA) × 100
   - Qualification :
     - ≥20% : Excellente
     - ≥10% : Bonne
     - <10% : Faible

#### Graphique Évolution (12 Mois)

Barres verticales affichant :
- **Bleu** : Produits
- **Orange** : Charges

💡 Permet de visualiser la tendance et la saisonnalité

#### Top 5 Clients / Fournisseurs

**Clients** : Montants des créances  
**Fournisseurs** : Montants des dettes

→ Identifiez vos partenaires principaux

#### Ratios Financiers

**1. Ratio de Liquidité**
- Calcul : Actif Circulant / Passif Circulant
- Interprétation :
  - ≥1.5 : ✅ Excellent
  - ≥1.0 : ⚠️ Acceptable
  - <1.0 : ❌ Faible (risque de trésorerie)

**2. Ratio de Solvabilité**
- Calcul : Capitaux Propres / Total Passif
- Interprétation :
  - ≥0.5 : ✅ Solide
  - ≥0.3 : ⚠️ Modéré
  - <0.3 : ❌ Fragile (dépendance aux dettes)

#### Activité Récente

Tableau des **5 dernières écritures** :
- Date
- Description
- Type (badge)
- Montant

---

## ❓ FAQ - Questions Fréquentes

### 1. Comment corriger une écriture validée ?

❌ **Impossible** : Une écriture validée ne peut pas être modifiée.

✅ **Solution** : Créer une **écriture de correction** (contrepassation) :
1. Créez une nouvelle écriture avec les montants inversés
2. Puis créez l'écriture correcte

### 2. Pourquoi je ne peux pas créer d'écriture ?

**Causes possibles** :
- ⚠️ Période clôturée → Créer l'écriture dans la nouvelle période
- ❌ Débit ≠ Crédit → Vérifier les montants
- ❌ Moins de 2 lignes → Ajouter au moins 2 lignes

### 3. Comment calculer automatiquement la TVA ?

Utilisez les **écritures automatiques** :
```
Automatisation → Vente Client
```
→ La TVA est calculée et ajoutée automatiquement

### 4. Quelle est la différence entre Brouillon et Validé ?

- **Brouillon** : Écriture modifiable, non comptabilisée
- **Validé** : Écriture définitive, comptabilisée, immuable

### 5. Comment annuler un rapprochement bancaire ?

1. Trouvez la transaction dans la liste
2. Cliquez sur **"Annuler le rapprochement"**
3. Status revient à **"À rapprocher"**

### 6. Puis-je annuler une clôture ?

❌ **NON** : La clôture est **irréversible** par sécurité.

💡 Vérifiez bien avant de clôturer !

### 7. Comment savoir si ma balance est équilibrée ?

Consultez la **Balance de Vérification** :
- Si Total Débit = Total Crédit → ✅ Équilibrée
- Si différence → ❌ Erreur (chercher l'écriture incorrecte)

### 8. La TVA est-elle calculée automatiquement ?

✅ **Oui**, si vous utilisez les écritures automatiques.

❌ **Non**, si vous créez manuellement → Vous devez ajouter la ligne TVA

### 9. Comment exporter mes états comptables ?

Actuellement : **Impression** via navigateur (Ctrl+P)

À venir : Export PDF et Excel

### 10. Quelle est la norme comptable utilisée ?

**SYSCOHADA Révisé 2017** (Norme OHADA - Bénin)

---

## 📞 Support

**Besoin d'aide ?**

- 📧 Email : support@bms.com
- 📞 Téléphone : +229 XX XX XX XX
- 💬 Chat : Disponible dans l'application

---

## 📖 Ressources Complémentaires

- **API Documentation** : `API_DOCUMENTATION.md`
- **Status Projet** : `STATUS_PROJET_BMS.md`
- **Audit Technique** : `AUDIT_PLACEHOLDERS.md`

---

_Guide Utilisateur BMS v1.0.0 - © 2025 - Tous droits réservés_
