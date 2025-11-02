#!/bin/bash

# Script pour générer des données de test BMS
# Crée des écritures comptables pour visualiser les graphiques

set -e

echo "🌱 Génération des données de test BMS..."

# Vérifier si PostgreSQL est accessible
if ! command -v psql &> /dev/null; then
    echo "❌ psql n'est pas installé. Essayez avec docker..."
    
    # Essayer avec Docker
    if command -v docker &> /dev/null; then
        echo "🐳 Utilisation de Docker PostgreSQL (Supabase)..."
        docker exec -i supabase_db_FloService psql -U postgres -d postgres < /Users/floriace/MERP/scripts/simple-test-data.sql
    else
        echo "❌ Docker non trouvé. Installez PostgreSQL ou Docker."
        exit 1
    fi
else
    echo "🐘 Utilisation de PostgreSQL local..."
    psql -h localhost -U postgres -d postgres < /Users/floriace/MERP/scripts/simple-test-data.sql
fi

echo ""
echo "✅ Données de test créées avec succès !"
echo ""
echo "📊 Données générées :"
echo "   • ~60 écritures comptables sur 6 mois"
echo "   • Ventes (70%) + Achats (30%)"
echo "   • Montants variés : 500K - 2.5M XOF"
echo "   • TVA 18% incluse"
echo ""
echo "🌐 Accédez aux tableaux de bord :"
echo "   • Dashboard: http://localhost:3000/accountant"
echo "   • Trésorerie: http://localhost:3000/treasury"
echo "   • Balance Âgée: http://localhost:3000/accountant/aged-balance"
echo ""
echo "🔄 Actualisez les pages pour voir les graphiques et KPI !"
echo ""
echo "💡 Pour supprimer les données de test :"
echo "   DELETE FROM journal_entry_lines WHERE journal_entry_id IN (SELECT id FROM journal_entries WHERE company_id = 'test-company');"
echo "   DELETE FROM journal_entries WHERE company_id = 'test-company';"
