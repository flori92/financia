# Données de Démonstration BMS

Ce document explique comment générer et visualiser des données de test dans BMS pour voir les graphiques, KPI et fonctionnalités.

## 🎯 Modes Disponibles

### 1. Mode Démo Frontend (Recommandé) ⭐

Le plus simple et rapide - aucune configuration requise !

```bash
./scripts/setup-demo-data.sh demo
```

**Accès:**
- URL: http://localhost:3000/demo
- Page complète avec dashboard, mobile money et balance âgée
- Données exemples réalistes intégrées

**Fonctionnalités:**
- ✅ Dashboard comptable avec KPI temps réel
- ✅ Graphiques d'évolution CA vs Charges (12 mois)
- ✅ Top 5 Clients/Fournisseurs
- ✅ Ratios financiers (liquidité, solvabilité)
- ✅ Transactions Mobile Money avec stats
- ✅ Balance Âgée (créances/dettes par ancienneté)
- ✅ Activité récente et alertes

---

### 2. Mode API Backend

Pour créer des données réelles dans la base via l'API BMS.

```bash
./scripts/setup-demo-data.sh api [company-id]
```

**Prérequis:**
- Backend BMS démarré: `cd bms/api-gateway && npm run start:dev`
- API accessible sur http://localhost:3001

**Données générées:**
- Plan comptable SYSCOHADA complet
- 6 ventes (sept-nov 2024)
- 3 achats (sept-nov 2024)
- Écritures comptables validées
- TVA 18% incluse

---

### 3. Mode SQL Direct

Insertion directe dans PostgreSQL (pour utilisateurs avancés).

```bash
./scripts/setup-demo-data.sh sql
```

**Prérequis:**
- PostgreSQL installé et accessible
- Base de données BMS créée

## 📊 Visualisation des Données

### Dashboard Comptable
- **KPI du mois:** CA, Charges, Résultat Net, Marge
- **Graphique:** Évolution 12 mois avec barres comparatives
- **Top parties:** Clients (créances) et Fournisseurs (dettes)
- **Ratios:** Liquidité (>2.5 = excellent) et Solvabilité (>0.5 = solide)
- **Alertes:** Messages contextuels sur la santé financière
- **Activité:** 5 dernières écritures comptables

### Mobile Money
- **Statistiques:** Total transactions, montant, succès/échecs
- **Provider breakdown:** Wave, Orange, MTN, Kkiapay, Moov
- **Tableau détaillé:** Toutes les transactions avec statuts
- **Montants réels:** 50K - 500K XOF par transaction

### Balance Âgée
- **Créances Clients:** Analyse par ancienneté (0-30j, 30-60j, 60-90j, +90j)
- **Dettes Fournisseurs:** Même ventilation par tranches
- **Alertes:** Actions de recouvrement pour créances >90j
- **Pourcentages:** Répartition visuelle des échéances

## 🎨 Données Exemples

### Chiffres Clés Démo
- **CA mensuel:** 3.5M XOF
- **Charges mensuelles:** 2.1M XOF  
- **Résultat net:** 1.4M XOF (+40% marge)
- **Liquidité:** 2.66 (excellent)
- **Solvabilité:** 0.62 (solide)

### Transactions Mobile Money
- **Total:** 25 transactions
- **Montant total:** 4.25M XOF
- **Taux succès:** 80% (20/25)
- **Providers:** Wave (leader), Orange, MTN...

### Balance Âgée
- **Créances totales:** 5.5M XOF
- **Créances >90j:** 300K XOF (5.5%)
- **Dettes totales:** 2.4M XOF
- **Dettes >90j:** 150K XOF (6.2%)

## 🛠️ Scripts Disponibles

| Script | Usage | Description |
|--------|-------|-------------|
| `setup-demo-data.sh` | `./scripts/setup-demo-data.sh demo` | Script principal - 3 modes |
| `create-demo-data.sh` | `./scripts/create-demo-data.sh` | API backend only |
| `generate-test-data.sh` | `./scripts/generate-test-data.sh` | SQL direct only |
| `simple-test-data.sql` | `psql < simple-test-data.sql` | Requêtes SQL pures |

## 🌐 Accès Rapide

### Mode Démo
```
Dashboard: http://localhost:3000/demo
Mobile Money: http://localhost:3000/demo (onglet)
Balance Âgée: http://localhost:3000/demo (onglet)
```

### Mode Réel (après configuration)
```
Dashboard: http://localhost:3000/accountant
Mobile Money: http://localhost:3000/accountant/mobile-money
Balance Âgée: http://localhost:3000/accountant/aged-balance
Trésorerie: http://localhost:3000/treasury
```

## 🔧 Personnalisation

### Modifier les montants
Éditez `/bms-web/src/lib/demo-data.ts`:
```typescript
kpiMonth: {
  revenue: 5000000,  // Modifier CA
  expenses: 3000000, // Modifier charges
  // ...
}
```

### Ajouter des transactions
Éditez `demoMobileMoneyData.transactions` dans le même fichier.

### Changer la période
Modifiez les dates dans `evolutionChart` pour changer l'historique.

## 🚨 Dépannage

### Frontend ne charge pas
```bash
# Vérifier que Next.js tourne
cd bms-web
npm run dev
```

### Backend erreur 500
```bash
# Vérifier les logs
cd bms/api-gateway
npm run start:dev
```

### SQL: relation n'existe pas
```bash
# Les tables n'ont pas été créées par TypeORM
# Utilisez le mode demo à la place
```

## 📈 Prochaines Étapes

1. **Tester le mode demo:** `./scripts/setup-demo-data.sh demo`
2. **Naviguer sur http://localhost:3000/demo**
3. **Explorer les 3 onglets:** Dashboard, Mobile Money, Balance Âgée
4. **Observer les graphiques et KPI réalistes**
5. **Configurer le mode api/sql** si besoin de données réelles

---

💡 **Conseil:** Commencez toujours par le mode demo pour découvrir les fonctionnalités, puis passez au mode api pour des données persistantes.
