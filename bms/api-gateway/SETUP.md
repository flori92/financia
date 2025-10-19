# Configuration BMS ERP

## Installation rapide

### 1. Installer PostgreSQL
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15

# Créer la base de données
createdb bms_erp

# Importer le schéma
psql bms_erp < src/database/schema.sql
```

### 2. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos paramètres
nano .env
```

### 3. Installer les dépendances
```bash
npm install
```

### 4. Démarrer le serveur
```bash
# Mode développement
npm run start:dev

# Mode production
npm run build
npm run start:prod
```

## Vérification

Le serveur devrait démarrer sur http://localhost:3001

Test de connexion:
```bash
curl http://localhost:3001/api/v1/companies
```

## Données de test

Pour insérer des données de test:
```bash
psql bms_erp < src/database/seed.sql
```

## Troubleshooting

### Erreur de connexion PostgreSQL
```bash
# Vérifier que PostgreSQL tourne
brew services list

# Redémarrer si nécessaire
brew services restart postgresql@15
```

### Port déjà utilisé
```bash
# Changer le port dans .env
PORT=3002
```

## Structure des modules

- `/api/v1/accounting` - Comptabilité
- `/api/v1/treasury` - Trésorerie
- `/api/v1/invoices` - Facturation
- `/api/v1/inventory` - Stocks
- `/api/v1/crm` - CRM
- `/api/v1/purchases` - Achats
