#!/bin/bash

# ==========================================
# Script d'import des données de démonstration BMS
# ==========================================

set -e

echo "🌱 Import des données de démonstration BMS..."
echo ""

# Vérifier les variables d'environnement
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Erreur: DATABASE_URL n'est pas défini"
    echo "Exemple: export DATABASE_URL='postgresql://user:password@localhost:5432/bms'"
    exit 1
fi

echo "📊 Base de données: $DATABASE_URL"
echo ""

# Fonction pour exécuter un fichier SQL
execute_sql() {
    local file=$1
    local description=$2
    
    echo "⏳ $description..."
    psql "$DATABASE_URL" -f "$file" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ $description - OK"
    else
        echo "❌ $description - ERREUR"
        exit 1
    fi
}

# Ordre d'exécution des fichiers
echo "📦 Import en cours..."
echo ""

execute_sql "demo-data-complete.sql" "1/6 Entreprises, utilisateurs et plan comptable"
execute_sql "demo-data-customers-suppliers.sql" "2/6 Clients et fournisseurs"
execute_sql "demo-data-invoices.sql" "3/6 Factures"
execute_sql "demo-data-banking.sql" "4/6 Comptes bancaires et trésorerie"
execute_sql "demo-data-products-stock.sql" "5/6 Produits et stock"
execute_sql "demo-data-journal-entries.sql" "6/6 Écritures comptables"

echo ""
echo "✅ Import terminé avec succès!"
echo ""
echo "📝 Comptes de test créés:"
echo "   - admin@bms.bj (Admin)"
echo "   - comptable@cabinet.bj (Comptable)"
echo "   - entrepreneur@test.bj (Entrepreneur)"
echo "   - taxadmin@dgi.bj (Admin Fiscal)"
echo ""
echo "🔑 Mot de passe pour tous: password123"
echo ""
echo "📊 Données créées:"
echo "   - 3 entreprises"
echo "   - 4 utilisateurs"
echo "   - 32 comptes SYSCOHADA"
echo "   - 5 clients"
echo "   - 5 fournisseurs"
echo "   - 8 factures"
echo "   - 3 comptes bancaires"
echo "   - 12 transactions bancaires"
echo "   - 10 produits"
echo "   - 14 mouvements de stock"
echo "   - 9 écritures comptables"
echo "   - 10 prévisions de trésorerie"
echo ""
echo "🎉 Votre BMS est prêt avec des données de démonstration!"
