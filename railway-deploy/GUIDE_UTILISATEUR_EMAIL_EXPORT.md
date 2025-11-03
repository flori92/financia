# 📧 Guide Utilisateur - Système Email & Export Professionnel

## 🎯 Vue d'ensemble

BMS dispose maintenant d'un système d'emailing professionnel et d'une prévisualisation d'export avancée pour une gestion optimale de vos communications et rapports.

---

## 📨 Système Email Professionnel

### Accès
- Page **Factures** → Bouton "Envoyer" sur une facture → Choisir "Email"
- Composant: `ProfessionalEmailDialog`

### ✨ Fonctionnalités Principales

#### 1️⃣ **Templates Pré-configurés**

**4 templates prêts à l'emploi:**

| Template | Utilisation | Variables incluses |
|----------|-------------|-------------------|
| 📄 **Envoi Facture** | Envoi initial de facture | Numéro, Montant, Échéance |
| ⏰ **Relance Facture** | Rappel facture échue | Date d'échéance dépassée |
| 💼 **Envoi Devis** | Transmission devis | Validité 30 jours |
| 🙏 **Remerciement** | Confirmation paiement | Montant payé |

**Comment utiliser:**
1. Cliquez sur le template souhaité
2. Les champs sont pré-remplis automatiquement
3. Les variables `{{...}}` sont remplacées par les vraies données
4. Modifiez si nécessaire
5. Envoyez !

#### 2️⃣ **Variables Dynamiques**

```
{{clientName}}      → Nom du client
{{invoiceNumber}}   → N° de facture
{{amount}}          → Montant formaté
{{dueDate}}         → Date d'échéance
{{companyName}}     → Votre entreprise (BMS)
```

**Exemple:**
```
Bonjour {{clientName}},

Veuillez trouver votre facture {{invoiceNumber}} 
d'un montant de {{amount}} FCFA.

Échéance: {{dueDate}}
```

**Devient:**
```
Bonjour Jean Dupont,

Veuillez trouver votre facture FAC-2024-001 
d'un montant de 250 000 FCFA.

Échéance: 15/11/2024
```

#### 3️⃣ **Créer vos Propres Templates**

**Étapes:**
1. Cliquez sur "**Gérer les templates**"
2. Rédigez votre email avec variables
3. Entrez un nom pour le template
4. Cliquez "**Sauvegarder**"
5. Le template apparaît dans la liste !

**💡 Astuce:** Utilisez les variables pour réutiliser vos templates sur différentes factures.

**Sauvegarde:** Templates personnalisés stockés dans votre navigateur (localStorage)

**Suppression:** Cliquez sur l'icône 🗑️ à côté du template personnalisé

#### 4️⃣ **Pièces Jointes**

**Formats supportés:** PDF, JPG, PNG, DOCX, XLSX, etc.
**Limite:** 10 MB par fichier

**Comment ajouter:**
1. Cliquez sur la zone "📎 Cliquez pour ajouter des fichiers"
2. Sélectionnez vos fichiers (multi-sélection possible)
3. Prévisualisez la liste des fichiers
4. Supprimez individuellement avec ❌

**Affichage:**
- Nom du fichier
- Taille en KB
- Bouton de suppression

#### 5️⃣ **Prévisualisation en Temps Réel**

**Mode Prévisualisation:**
- Cliquez sur "👁️ **Prévisualiser**"
- Voir le résultat final avec variables remplacées
- Repasser en mode édition: "**Éditer**"

**Avantages:**
- Vérifier le rendu avant envoi
- Éviter les erreurs de variables
- Valider le formatage

#### 6️⃣ **Champ CC (Copie Carbone)**

- Envoyer copie à un autre email
- Utile pour: comptabilité, responsable, archives
- Optionnel

### 📋 Interface Complète

```
┌─────────────────────────────────────────────┐
│ 📧 Composer un email                    [X] │
├─────────────────────────────────────────────┤
│ 📋 Templates disponibles                    │
│ [Envoi Facture] [Relance] [Devis] [Merci]  │
│                        [Gérer templates ⚙️] │
├─────────────────────────────────────────────┤
│ Destinataire * : jean.dupont@email.com      │
│ Copie (CC)     : compta@entreprise.com      │
│ Objet *        : Facture FAC-2024-001       │
│                                             │
│ Message * :                  [👁️ Prévisua.] │
│ ┌─────────────────────────────────────────┐ │
│ │ Bonjour Jean Dupont,                    │ │
│ │                                         │ │
│ │ Veuillez trouver votre facture...       │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Pièces jointes:                             │
│ 📎 Cliquez pour ajouter des fichiers        │
│                                             │
│ ✅ facture-001.pdf (125 KB)           [❌]  │
│ ✅ conditions.pdf (89 KB)             [❌]  │
├─────────────────────────────────────────────┤
│ 📎 2 fichier(s) joint(s)                    │
│                     [Annuler] [📧 Envoyer]  │
└─────────────────────────────────────────────┘
```

---

## 📊 Système de Prévisualisation Export

### Accès
- Page **Factures** → Bouton "**Prévisualiser & Exporter**"
- Composant: `ExportPreviewDialog`

### ✨ Fonctionnalités

#### 1️⃣ **Choix du Format**

**3 formats disponibles:**

| Format | Icône | Utilisation | Avantages |
|--------|-------|-------------|-----------|
| **PDF** | 📄 | Impression & Partage | Mise en page pro, signatures |
| **Excel** | 📊 | Analyse approfondie | Formules, graphiques, tri |
| **CSV** | 📑 | Import autres logiciels | Universel, léger |

**Comment choisir:**
1. Cliquez sur le format souhaité
2. La sélection devient verte (🟢)
3. Informations spécifiques s'affichent

#### 2️⃣ **Prévisualisation des Données**

**Affichage:**
- **20 premières lignes** pour performance
- Toutes les colonnes avec formatage
- Message si plus de données: "📊 Affichage 20/150 lignes"

**Colonnes factures:**
- N° Facture
- Client
- Date
- Échéance
- Montant (formaté)
- Statut

#### 3️⃣ **Résumé Statistiques (KPI Cards)**

**4 indicateurs clés:**

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total        │ CA Réalisé   │ Impayés      │ Taux         │
│ Factures     │              │              │ Paiement     │
│              │              │              │              │
│    45        │ 12 500 000   │ 3 200 000    │    78%       │
│              │     FCFA     │     FCFA     │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

#### 4️⃣ **Informations Export**

**Panneau jaune d'information:**
- ✅ Nombre de lignes
- ✅ Nombre de colonnes
- ✅ Format sélectionné
- ✅ Date d'export
- ✅ Optimisations spécifiques

**Exemples:**
- PDF: "Optimisé pour impression A4 paysage"
- Excel: "Inclut formules et formatage avancé"
- CSV: "Compatible avec tous les tableurs"

### 📋 Interface Complète

```
┌─────────────────────────────────────────────────┐
│ 👁️ Prévisualisation avant export          [X]  │
│ Factures                                        │
├─────────────────────────────────────────────────┤
│ Format d'export                                 │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
│ │ 📄 PDF    │ │ 📊 Excel  │ │ 📑 CSV    │     │
│ │ Impression│ │ Analyse   │ │ Import    │     │
│ │  & Partage│ │ approfondie│ │  autres   │     │
│ └───────────┘ └───────────┘ └───────────┘     │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ Résumé                                      │ │
│ │ [Total: 45] [CA: 12.5M] [Impayés: 3.2M]    │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ N° Facture │ Client  │ Date   │ Montant    │ │
│ ├────────────┼─────────┼────────┼────────────┤ │
│ │ FAC-001    │ Dupont  │ 01/11  │ 250 000 F  │ │
│ │ FAC-002    │ Martin  │ 02/11  │ 180 000 F  │ │
│ │ ...        │ ...     │ ...    │ ...        │ │
│ └─────────────────────────────────────────────┘ │
│ 📊 Affichage de 20 lignes sur 45 total        │
│ L'export complet inclura toutes les données    │
│                                                 │
│ ℹ️ Informations sur l'export                   │
│ • 45 ligne(s) de données                       │
│ • 6 colonne(s)                                  │
│ • Format: PDF                                   │
│ • Date d'export: 03/11/2024                    │
│ • Optimisé pour l'impression A4 paysage        │
├─────────────────────────────────────────────────┤
│ ✅ Prêt à exporter 45 ligne(s)                  │
│                  [Annuler] [⬇️ Exporter en PDF] │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Cas d'Utilisation

### Scénario 1: Envoi Facture Initial
1. Créer facture
2. Clic "Envoyer" → "Email"
3. Template "Envoi Facture" automatique
4. Variables remplies (client, montant, date)
5. Ajouter PDF facture en pièce jointe
6. Prévisualiser
7. Envoyer ✅

### Scénario 2: Relance Client
1. Identifier facture échue
2. Clic "Envoyer" → "Email"
3. Template "Relance Facture"
4. Message personnalisé si besoin
5. Copie au responsable (CC)
6. Envoyer ✅

### Scénario 3: Export Rapport Mensuel
1. Filtrer factures du mois
2. Clic "Prévisualiser & Exporter"
3. Vérifier KPI (CA, impayés)
4. Vérifier données (20 premières lignes)
5. Choisir Excel pour analyse
6. Exporter ✅
7. Ouvrir dans Excel
8. Créer graphiques et tableaux croisés

### Scénario 4: Template Personnalisé
1. Situation spéciale (promotion, annonce)
2. Ouvrir EmailDialog
3. "Gérer templates"
4. Rédiger message avec variables
5. Nommer "Promotion Black Friday"
6. Sauvegarder
7. Réutiliser pour tous les clients !

---

## 💡 Conseils & Bonnes Pratiques

### Email
✅ **À FAIRE:**
- Utiliser templates pour cohérence
- Toujours prévisualiser avant envoi
- Joindre PDF facture
- Copier comptabilité (CC)
- Variables pour personnalisation

❌ **À ÉVITER:**
- Envoyer sans vérifier destinataire
- Oublier pièces jointes
- Modifier variables manuellement
- Messages trop longs

### Export
✅ **À FAIRE:**
- Toujours prévisualiser
- Vérifier KPI avant export
- PDF pour archives officielles
- Excel pour analyses
- CSV pour import externe

❌ **À ÉVITER:**
- Exporter sans filtrer
- Exporter données sensibles en CSV
- Ignorer les statistiques affichées

### Sécurité
🔒 **Important:**
- Templates en localStorage (local)
- Pas d'envoi automatique
- Validation avant chaque action
- Données client sécurisées

---

## 🆘 Dépannage

### Email ne s'envoie pas
1. Vérifier adresse email client
2. Vérifier connexion internet
3. Consulter console (F12)
4. Voir logs backend

### Templates disparaissent
- Templates personnalisés = localStorage
- Si cache effacé = perte temporaire
- Solution: Re-créer ou sauvegarder hors navigateur

### Pièces jointes trop volumineuses
- Limite: 10 MB par fichier
- Solution: Compresser PDF, réduire images

### Export vide
- Vérifier filtres appliqués
- Vérifier données disponibles
- Rafraîchir page

---

## 📞 Support

**Questions:** Ouvrir une issue GitHub
**Bugs:** Signaler avec captures d'écran
**Améliorations:** Suggestions bienvenues !

---

**Version:** 1.0.0  
**Date:** Novembre 2024  
**Auteur:** BMS Development Team
