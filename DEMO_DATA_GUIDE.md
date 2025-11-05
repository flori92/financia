# 🎯 Guide des Données de Démonstration BMS

## ✅ Ce qui a été créé

J'ai analysé tout le projet BMS et créé un système complet de données de démonstration **réalistes, modulables et dynamiques** pour tous les modules.

## 📦 Fichiers créés

### 1. Fichiers SQL de données
```
bms/api-gateway/src/database/seeds/
├── demo-data-complete.sql              # Entreprises, utilisateurs, plan comptable
├── demo-data-customers-suppliers.sql   # Clients et fournisseurs
├── demo-data-invoices.sql              # Factures et lignes
├── demo-data-banking.sql               # Comptes bancaires, transactions, trésorerie
├── demo-data-products-stock.sql        # Produits et mouvements de stock
├── demo-data-journal-entries.sql       # Écritures comptables
├── IMPORT_DEMO_DATA.sh                 # Script d'import automatique
└── README_DEMO_DATA.md                 # Documentation complète
```

## 🎯 Données créées

### Résumé quantitatif
- ✅ **3 entreprises** (Cabinet comptable, Restaurant, Tech)
- ✅ **4 utilisateurs** (Admin, Comptable, Entrepreneur, Tax Admin)
- ✅ **32 comptes SYSCOHADA** (Classes 1-7 complètes)
- ✅ **5 clients** avec coordonnées complètes
- ✅ **5 fournisseurs** avec coordonnées complètes
- ✅ **8 factures** (payées, envoyées, brouillon, partielle)
- ✅ **3 comptes bancaires** (XOF et EUR)
- ✅ **12 transactions bancaires** (encaissements, paiements)
- ✅ **10 produits** (services et fournitures)
- ✅ **14 mouvements de stock** (entrées, sorties, ajustements)
- ✅ **9 écritures comptables** avec lignes détaillées
- ✅ **10 prévisions de trésorerie** (mars-avril 2024)

### Montants réalistes
- **Chiffre d'affaires**: ~7,000,000 XOF
- **Encaissements**: ~4,450,000 XOF
- **Factures en attente**: ~3,245,000 XOF
- **Trésorerie totale**: ~24,250,000 XOF + 12,500 EUR
- **Stock**: ~1,500,000 XOF

## 🚀 Comment utiliser

### Option 1: Import automatique (Recommandé)

```bash
# 1. Se connecter à Railway
railway login

# 2. Lier le projet
railway link

# 3. Récupérer l'URL de la base de données
railway variables --service backend | grep DATABASE_URL

# 4. Exporter l'URL
export DATABASE_URL='postgresql://...'

# 5. Importer les données
cd bms/api-gateway/src/database/seeds
./IMPORT_DEMO_DATA.sh
```

### Option 2: Via Railway Shell

```bash
# 1. Ouvrir un shell Railway
railway shell --service backend

# 2. Naviguer vers les seeds
cd src/database/seeds

# 3. Importer
./IMPORT_DEMO_DATA.sh
```

### Option 3: Import manuel fichier par fichier

```bash
psql $DATABASE_URL -f demo-data-complete.sql
psql $DATABASE_URL -f demo-data-customers-suppliers.sql
psql $DATABASE_URL -f demo-data-invoices.sql
psql $DATABASE_URL -f demo-data-banking.sql
psql $DATABASE_URL -f demo-data-products-stock.sql
psql $DATABASE_URL -f demo-data-journal-entries.sql
```

## 🎨 Caractéristiques des données

### ✅ Réalistes
- Noms d'entreprises africaines authentiques
- Adresses à Cotonou, Bénin
- NIFs au format béninois
- Montants en XOF (Franc CFA)
- Plan comptable SYSCOHADA conforme

### ✅ Modulables
- Toutes les données peuvent être modifiées via SQL
- IDs en UUID pour éviter les conflits
- Contraintes ON CONFLICT pour imports multiples
- Relations cohérentes entre entités

### ✅ Dynamiques
- Aucun mock codé en dur dans le code
- Données stockées en base de données
- Modifiables via l'interface BMS
- Supprimables à tout moment

### ✅ Complètes
- Couvre tous les modules principaux:
  - ✅ Comptabilité (SYSCOHADA)
  - ✅ Facturation
  - ✅ Trésorerie
  - ✅ Stock
  - ✅ Clients/Fournisseurs
  - ✅ Banque

## 📊 Modules couverts

### 1. Dashboard
- KPIs calculés depuis les vraies données
- Chiffre d'affaires: 7M XOF
- Factures impayées: 3.2M XOF
- Trésorerie: 24.2M XOF

### 2. Comptabilité
- Plan SYSCOHADA complet (32 comptes)
- 9 écritures comptables
- Balance équilibrée
- Grand livre avec mouvements

### 3. Factures
- 8 factures avec statuts variés
- Lignes de factures détaillées
- Calcul TVA 18%
- Suivi des paiements

### 4. Trésorerie
- 3 comptes bancaires
- 12 transactions
- 10 prévisions
- Rapprochement bancaire

### 5. Stock
- 10 produits
- 14 mouvements
- Alertes stock minimum
- Valorisation

### 6. CRM
- 5 clients avec historique
- Coordonnées complètes
- Limites de crédit
- Conditions de paiement

### 7. Achats
- 5 fournisseurs
- Conditions de paiement
- Historique d'achats

## 🔑 Comptes de test

| Email | Mot de passe | Rôle | Accès |
|-------|--------------|------|-------|
| admin@bms.bj | password123 | Admin | Tous les modules |
| comptable@cabinet.bj | password123 | Comptable | Comptabilité, Factures |
| entrepreneur@test.bj | password123 | Entrepreneur | Dashboard, Factures |
| taxadmin@dgi.bj | password123 | Admin Fiscal | Déclarations fiscales |

## 🎯 Scénarios de démonstration

### Scénario 1: Comptabilité
1. Se connecter avec `comptable@cabinet.bj`
2. Voir le plan comptable SYSCOHADA
3. Consulter les écritures comptables
4. Générer une balance
5. Voir le grand livre

### Scénario 2: Facturation
1. Voir les 8 factures existantes
2. Créer une nouvelle facture
3. Envoyer une facture
4. Enregistrer un paiement
5. Voir les statistiques

### Scénario 3: Trésorerie
1. Voir les 3 comptes bancaires
2. Consulter les transactions
3. Faire un rapprochement bancaire
4. Voir les prévisions de trésorerie
5. Analyser le cash flow

### Scénario 4: Stock
1. Voir les 10 produits
2. Consulter les mouvements
3. Voir les alertes de stock
4. Faire un ajustement d'inventaire
5. Valoriser le stock

## 🧹 Gestion des données

### Modifier des données

```sql
-- Modifier un client
UPDATE customers 
SET email = 'nouveau@email.com', phone = '+22997999999'
WHERE name = 'Hôtel Palm Beach';

-- Ajouter une facture
INSERT INTO invoices (company_id, customer_id, invoice_number, ...)
VALUES (...);

-- Modifier un produit
UPDATE products 
SET unit_price = 600000, stock_quantity = 150
WHERE sku = 'SERV-COMPTA-001';
```

### Supprimer des données

```sql
-- Supprimer une facture (CASCADE supprime les lignes)
DELETE FROM invoices WHERE invoice_number = 'FAC-2024-008';

-- Supprimer un client
DELETE FROM customers WHERE name = 'Nouveau Client';
```

### Nettoyer toutes les données de démo

```sql
-- Voir le fichier README_DEMO_DATA.md pour le script complet
BEGIN;
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
-- ... etc
COMMIT;
```

## 📈 Prochaines étapes

### 1. Importer les données
```bash
cd bms/api-gateway/src/database/seeds
export DATABASE_URL='<your-railway-db-url>'
./IMPORT_DEMO_DATA.sh
```

### 2. Vérifier l'import
```bash
# Se connecter à la base
psql $DATABASE_URL

# Compter les enregistrements
SELECT COUNT(*) FROM companies;  -- Devrait retourner 3
SELECT COUNT(*) FROM invoices;   -- Devrait retourner 8
SELECT COUNT(*) FROM accounts;   -- Devrait retourner 32
```

### 3. Tester l'application
```bash
# Démarrer le frontend
cd bms-web
npm run dev

# Se connecter avec comptable@cabinet.bj / password123
# Explorer les modules
```

### 4. Personnaliser
- Modifier les montants selon vos besoins
- Ajouter plus de clients/fournisseurs
- Créer plus de factures
- Ajuster les dates

## 🎉 Avantages

### Pour les démonstrations
- ✅ Données réalistes et crédibles
- ✅ Montants cohérents
- ✅ Contexte africain authentique
- ✅ Tous les modules fonctionnels

### Pour le développement
- ✅ Environnement de test complet
- ✅ Données reproductibles
- ✅ Facile à réinitialiser
- ✅ Modifiable à volonté

### Pour la production
- ✅ Pas de mocks en dur
- ✅ Architecture propre
- ✅ Données en base
- ✅ Supprimable facilement

## 📝 Notes importantes

1. **Mots de passe**: Tous les comptes utilisent `password123` - À changer en production !

2. **NIFs**: Les numéros NIF sont fictifs - Format: BJ2024XXXXXX

3. **Dates**: Les dates utilisent NOW() pour rester actuelles

4. **Montants**: En XOF (Franc CFA) - 1 EUR ≈ 655 XOF

5. **IDs**: UUIDs générés - Pas de conflits possibles

6. **Imports multiples**: Les scripts utilisent ON CONFLICT DO NOTHING

## 🆘 Dépannage

### Erreur: "relation does not exist"
→ Le schéma n'est pas créé. Exécuter d'abord `schema.sql`

### Erreur: "duplicate key value"
→ Les données existent déjà. Nettoyer d'abord ou ignorer

### Erreur: "foreign key constraint"
→ Respecter l'ordre d'import des fichiers

### Données ne s'affichent pas
→ Vérifier le company_id dans les requêtes API

## 📚 Documentation

- [README des données](bms/api-gateway/src/database/seeds/README_DEMO_DATA.md)
- [Schema SQL](bms/api-gateway/src/database/schema.sql)
- [Guide Railway](RAILWAY_DEPLOY_GUIDE.md)
- [README principal](README.md)

---

**🎉 Votre BMS est maintenant prêt avec des données de démonstration professionnelles !**

Les données sont:
- ✅ Réalistes (contexte africain)
- ✅ Modulables (modifiables via SQL)
- ✅ Dynamiques (en base de données)
- ✅ Complètes (tous les modules)
- ✅ Supprimables (script de nettoyage)

**Aucun mock codé en dur - Tout est en base de données ! 🚀**
