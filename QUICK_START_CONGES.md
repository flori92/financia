# 🚀 Quick Start - Module Congés

Guide rapide pour tester le module Congés immédiatement.

---

## ⚡ Démarrage Rapide (2 minutes)

### 1. Installer les dépendances
```bash
cd bms-web
npm install
```

### 2. Démarrer le serveur de développement
```bash
npm run dev
```

### 3. Ouvrir dans le navigateur
```
http://localhost:3000/hr/leaves
```

---

## 🎯 Pages Disponibles

| Page | URL | Description |
|------|-----|-------------|
| **Liste** | `/hr/leaves` | Toutes les demandes de congés |
| **Création** | `/hr/leaves/new` | Créer une nouvelle demande |
| **Détails** | `/hr/leaves/[id]` | Voir une demande spécifique |
| **Calendrier** | `/hr/leaves/calendar` | Vue calendrier mensuel |

---

## 🧪 Scénarios de Test

### Scénario 1: Créer une Demande
1. Aller sur `/hr/leaves`
2. Cliquer sur "Nouvelle demande"
3. Sélectionner "Congés annuels"
4. Choisir les dates (ex: du 15/12/2025 au 20/12/2025)
5. Ajouter un motif (optionnel)
6. Cliquer sur "Créer en brouillon"
7. ✅ Vérifier que la demande apparaît dans la liste

### Scénario 2: Soumettre une Demande
1. Créer une demande (voir Scénario 1)
2. Cliquer sur la carte de la demande
3. Cliquer sur "Soumettre"
4. ✅ Vérifier que le statut passe à "En attente"
5. ✅ Vérifier que le workflow d'approbation s'affiche

### Scénario 3: Filtrer les Demandes
1. Aller sur `/hr/leaves`
2. Cliquer sur "Filtres"
3. Sélectionner un statut (ex: "En attente")
4. ✅ Vérifier que seules les demandes correspondantes s'affichent

### Scénario 4: Vue Calendrier
1. Aller sur `/hr/leaves/calendar`
2. Naviguer entre les mois avec les flèches
3. ✅ Vérifier que les congés s'affichent sur les bonnes dates
4. Cliquer sur un congé dans le calendrier
5. ✅ Vérifier la redirection vers les détails

### Scénario 5: Vérifier les Soldes
1. Aller sur `/hr/leaves`
2. ✅ Vérifier l'affichage des cartes de solde
3. ✅ Vérifier les barres de progression
4. Créer une demande avec plus de jours que le solde
5. ✅ Vérifier le message "Solde insuffisant"

---

## 🔍 Points de Vérification

### Interface
- [ ] Les pages se chargent sans erreur
- [ ] Les composants sont responsive (tester sur mobile)
- [ ] Les couleurs et badges s'affichent correctement
- [ ] Les icônes sont visibles
- [ ] Les dates sont formatées en français

### Fonctionnalités
- [ ] Création de demande fonctionne
- [ ] Calcul automatique des jours
- [ ] Validation du solde
- [ ] Soumission de demande
- [ ] Annulation de demande
- [ ] Filtres fonctionnent
- [ ] Navigation entre les pages

### Performance
- [ ] Chargement rapide (< 2 secondes)
- [ ] Pas de lag lors de la navigation
- [ ] États de chargement visibles
- [ ] Pas d'erreurs dans la console

---

## 🐛 Dépannage

### Erreur: "Cannot find module '@/types/leave'"
**Solution:**
```bash
# Vérifier que tsconfig.json contient:
"@/types/*": ["src/types/*"]
```

### Erreur: "date-fns not found"
**Solution:**
```bash
cd bms-web
npm install date-fns
```

### Erreur: "Failed to fetch"
**Cause:** Le backend n'est pas accessible  
**Solution:** Vérifier que l'API est déployée sur Railway

### Page blanche
**Solution:**
1. Ouvrir la console du navigateur (F12)
2. Vérifier les erreurs JavaScript
3. Vérifier que le serveur dev tourne
4. Redémarrer avec `npm run dev`

---

## 📊 Données de Test

### IDs Utilisés
```typescript
COMPANY_ID = 'e611a153-8dd5-41dd-bb8e-9434766a0dfd'
EMPLOYEE_ID = 'current-user-id' // À remplacer
```

### Types de Congés
- Congés annuels (30 jours/an)
- Congé maladie (15 jours/an)
- Congé sans solde
- Congé maternité
- Congé paternité
- Congé parental

### Statuts
- Brouillon (gris)
- En attente (ambre)
- Approuvé (vert)
- Rejeté (rouge)
- Annulé (gris clair)

---

## 🎨 Captures d'Écran Attendues

### Liste des Demandes
- Header avec titre et bouton "Nouvelle demande"
- 2 cartes de solde (annuel et maladie)
- Section filtres (repliable)
- Grid de cartes de demandes (3 colonnes desktop)

### Création de Demande
- Formulaire avec 4 champs principaux
- Cartes de solde en haut
- Calcul automatique des jours
- Boutons "Annuler" et "Créer"

### Détails de Demande
- Informations de l'employé
- Détails du congé (type, dates, durée)
- Workflow d'approbation visuel
- Boutons d'action contextuels

### Vue Calendrier
- Navigation mois précédent/suivant
- Grid 7x5 (jours de la semaine)
- Congés affichés sur les bonnes dates
- Liste des congés à venir en bas

---

## 🔗 Liens Utiles

### Documentation
- [Guide d'implémentation](./GUIDE_IMPLEMENTATION_CONGES.md)
- [Documentation complète](./MODULE_CONGES_IMPLEMENTATION.md)
- [Roadmap](./ROADMAP_PROCHAINES_ETAPES.md)

### Code Source
- Types: `bms-web/src/types/leave.ts`
- Composants: `bms-web/src/components/hr/`
- Hooks: `bms-web/src/hooks/`
- Pages: `bms-web/src/app/hr/leaves/`

### API
- Backend: `bms/api-gateway/src/modules/hr/`
- Controller: `hr.controller.ts`
- Service: `leave.service.ts`

---

## ✅ Checklist de Test Complet

### Fonctionnalités de Base
- [ ] Créer une demande en brouillon
- [ ] Créer et soumettre directement
- [ ] Modifier une demande en brouillon
- [ ] Soumettre une demande
- [ ] Annuler une demande en attente
- [ ] Supprimer un brouillon

### Validation
- [ ] Vérifier le calcul des jours
- [ ] Vérifier la validation du solde
- [ ] Tester avec des dates invalides
- [ ] Tester avec un solde insuffisant

### Navigation
- [ ] Liste → Détails
- [ ] Liste → Création
- [ ] Liste → Calendrier
- [ ] Détails → Liste
- [ ] Création → Liste

### Filtres
- [ ] Filtrer par statut
- [ ] Filtrer par type
- [ ] Combiner plusieurs filtres
- [ ] Réinitialiser les filtres

### Responsive
- [ ] Tester sur mobile (< 768px)
- [ ] Tester sur tablette (768-1024px)
- [ ] Tester sur desktop (> 1024px)

---

## 🎯 Résultat Attendu

Après avoir suivi ce guide, vous devriez avoir:
- ✅ Une interface fonctionnelle de gestion des congés
- ✅ Toutes les pages accessibles et responsive
- ✅ Les fonctionnalités de base opérationnelles
- ✅ Une compréhension du workflow

**Temps estimé:** 15-20 minutes de test

---

## 🆘 Besoin d'Aide ?

### Problèmes Techniques
1. Vérifier les logs de la console
2. Vérifier que le backend est accessible
3. Vérifier les dépendances npm
4. Redémarrer le serveur dev

### Questions Fonctionnelles
1. Consulter la documentation complète
2. Vérifier les types TypeScript
3. Regarder les exemples de code

---

**Bon test ! 🚀**
