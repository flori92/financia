# 🎯 Données de Démonstration BMS

## 📋 Vue d'ensemble

Ce dossier contient des **données de démonstration complètes et réalistes** pour le système BMS. Ces données sont **modulables, dynamiques et supprimables** - parfaites pour des démonstrations professionnelles.

## ✨ Caractéristiques

- ✅ **Données réalistes** basées sur des cas d'usage africains
- ✅ **Modulables** - Vous pouvez modifier, ajouter ou supprimer
- ✅ **Dynamiques** - Pas de mocks codés en dur
- ✅ **Complètes** - Couvre tous les modules BMS
- ✅ **Cohérentes** - Relations entre entités respectées
- ✅ **Prêtes pour production** - Format SQL standard

## 📦 Contenu des données

### 1. Entreprises (3)
- Cabinet Comptable Excellence (Cotonou)
- Restaurant Le Palmier (Cotonou)
- Tech Solutions Afrique (Cotonou)

### 2. Utilisateurs (4)
| Email | Rôle | Mot de passe |
|-------|------|--------------|
| admin@bms.bj | Admin | password123 |
| comptable@cabinet.bj | Comptable | password123 |
| entrepreneur@test.bj | Entrepreneur | password123 |
| taxadmin@dgi.bj | Admin Fiscal | password123 |

### 3. Plan Comptable SYSCOHADA (32 comptes)
- Classe 1: Capitaux (5 comptes)
- Classe 2: Immobilisations (4 comptes)
- Classe 3: Stocks (2 comptes)
- Classe 4: Tiers (5 comptes)
- Classe 5: Trésorerie (2 comptes)
- Classe 6: Charges (7 comptes)
- Classe 7: Produits (7 comptes)

### 4. Clients (5)
- Hôtel Palm Beach
- Société ABC Trading
- Restaurant Le Béninois
- Pharmacie Centrale
- Supermarché Erevan

### 5. Fournisseurs (5)
- Distributeur Alimentaire BJ
- Fournitures Bureau Plus
- Électricité Services
- Imprimerie Moderne
- Transport Express

### 6. Factures (8)
- 3 factures payées (1,003,000 + 1,416,000 + 531,000 XOF)
- 3 factures envoyées en attente (802,400 + 1,085,600 + 1,357,000 XOF)
- 1 facture partiellement payée (2,950,000 XOF, payé 1,500,000)
- 1 brouillon (885,000 XOF)

### 7. Comptes Bancaires (3)
- Compte Principal BOA: 15,750,000 XOF
- Compte Épargne Ecobank: 8,500,000 XOF
- Compte Devises SGBB: 12,500 EUR

### 8. Transactions Bancaires (12)
- 4 encaissements clients
- 3 paiements fournisseurs
- 1 paiement salaires
- 1 paiement charges sociales
- 1 paiement TVA
- 2 transactions non rapprochées

### 9. Produits (10)
- 4 services (comptabilité, audit, conseil, formation)
- 3 fournitures de bureau
- 3 produits informatiques

### 10. Mouvements de Stock (14)
- 6 entrées de stock
- 6 sorties de stock
- 2 ajustements d'inventaire

### 11. Écritures Comptables (9)
- 2 ventes avec TVA
- 2 encaissements
- 1 achat avec TVA
- 1 paiement fournisseur
- 1 écriture salaires
- 1 écriture charges sociales
- 1 écriture TVA

### 12. Prévisions de Trésorerie (10)
- 4 entrées prévues (mars 2024)
- 5 sorties prévues (mars 2024)
- 1 entrée prévue (avril 2024)

## 🚀 Installation

### Méthode 1: Script automatique (Recommandé)

```bash
# 1. Définir l'URL de la base de données
export DATABASE_URL='postgresql://user:password@localhost:5432/bms'

# 2. Exécuter le script d'import
cd bms/api-gateway/src/database/seeds
./IMPORT_DEMO_DATA.sh
```

### Méthode 2: Import manuel

```bash
# Importer chaque fichier dans l'ordre
psql $DATABASE_URL -f demo-data-complete.sql
psql $DATABASE_URL -f demo-data-customers-suppliers.sql
psql $DATABASE_URL -f demo-data-invoices.sql
psql $DATABASE_URL -f demo-data-banking.sql
psql $DATABASE_URL -f demo-data-products-stock.sql
psql $DATABASE_URL -f demo-data-journal-entries.sql
```

### Méthode 3: Via Railway

```bash
# 1. Récupérer l'URL de la base Railway
railway variables --service backend | grep DATABASE_URL

# 2. Exporter l'URL
export DATABASE_URL='<url-from-railway>'

# 3. Importer
./IMPORT_DEMO_DATA.sh
```

## 🔧 Modification des données

### Ajouter un client

```sql
INSERT INTO customers (company_id, name, email, phone, payment_terms, is_active)
VALUES (
  '1805bc61-7cfd-44e9-8a63-17187bf05dc7',
  'Nouveau Client',
  'client@example.com',
  '+22997999999',
  30,
  true
);
```

### Ajouter une facture

```sql
INSERT INTO invoices (company_id, customer_id, invoice_number, invoice_date, due_date, status, subtotal, vat_amount, total_amount, currency)
VALUES (
  '1805bc61-7cfd-44e9-8a63-17187bf05dc7',
  '<customer_id>',
  'FAC-2024-009',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'draft',
  500000,
  90000,
  590000,
  'XOF'
);
```

### Modifier un produit

```sql
UPDATE products 
SET unit_price = 550000, stock_quantity = 100
WHERE sku = 'SERV-COMPTA-001';
```

### Supprimer des données

```sql
-- Supprimer une facture et ses lignes (CASCADE)
DELETE FROM invoices WHERE invoice_number = 'FAC-2024-008';

-- Supprimer un client (attention aux contraintes)
DELETE FROM customers WHERE name = 'Nouveau Client';
```

## 🧹 Nettoyage complet

Pour supprimer toutes les données de démonstration :

```sql
BEGIN;

-- Supprimer dans l'ordre inverse des dépendances
DELETE FROM journal_entry_lines;
DELETE FROM journal_entries;
DELETE FROM stock_movements;
DELETE FROM products;
DELETE FROM cash_flow_forecast;
DELETE FROM bank_transactions;
DELETE FROM bank_accounts;
DELETE FROM invoice_lines;
DELETE FROM invoices;
DELETE FROM suppliers;
DELETE FROM customers;
DELETE FROM accounts;
DELETE FROM users WHERE email LIKE '%@bms.bj' OR email LIKE '%@cabinet.bj' OR email LIKE '%@test.bj' OR email LIKE '%@dgi.bj';
DELETE FROM companies WHERE nif LIKE 'BJ2024%';

COMMIT;
```

## 📊 Vérification des données

```sql
-- Compter les enregistrements
SELECT 
  (SELECT COUNT(*) FROM companies) as companies,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM accounts) as accounts,
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM suppliers) as suppliers,
  (SELECT COUNT(*) FROM invoices) as invoices,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM bank_accounts) as bank_accounts,
  (SELECT COUNT(*) FROM bank_transactions) as transactions,
  (SELECT COUNT(*) FROM journal_entries) as journal_entries;
```

## 🎯 Cas d'usage

### Démonstration Comptabilité
- Plan comptable SYSCOHADA complet
- Écritures comptables avec TVA
- Rapprochement bancaire
- Balance et grand livre

### Démonstration Facturation
- Factures avec différents statuts
- Calcul automatique de la TVA
- Suivi des paiements
- Relances clients

### Démonstration Trésorerie
- Comptes bancaires multi-devises
- Transactions bancaires
- Prévisions de trésorerie
- Cash flow

### Démonstration Stock
- Gestion des produits
- Mouvements de stock (entrées/sorties)
- Alertes de stock minimum
- Inventaire

## 🔐 Sécurité

⚠️ **Important**: Ces données sont pour démonstration uniquement.

- Les mots de passe sont hashés mais simples (password123)
- Les NIFs et données sont fictifs
- Ne pas utiliser en production sans modification
- Changer tous les mots de passe en production

## 📝 Notes

- Les IDs sont des UUIDs pour éviter les conflits
- Les montants sont en XOF (Franc CFA)
- Les dates sont relatives à NOW() pour rester actuelles
- Les contraintes ON CONFLICT permettent des imports multiples
- Toutes les transactions sont dans des BEGIN/COMMIT

## 🆘 Support

En cas de problème:

1. Vérifier que le schéma de base est créé (`schema.sql`)
2. Vérifier les contraintes de clés étrangères
3. Vérifier les permissions PostgreSQL
4. Consulter les logs d'erreur

## 📚 Documentation

- [Schema SQL](../schema.sql)
- [Guide de déploiement](../../../../../../RAILWAY_DEPLOY_GUIDE.md)
- [README principal](../../../../../../README.md)

---

**Créé avec ❤️ pour BMS - Business Management System**
