#!/bin/bash

# Script complet pour configurer les données de démonstration BMS
# Supporte plusieurs modes: démo frontend, données réelles via API, ou SQL direct

set -e

MODE=${1:-"demo"}  # demo, api, sql
COMPANY_ID=${2:-"demo-company"}

echo "🎯 Configuration BMS - Mode: $MODE"
echo "📊 Société: $COMPANY_ID"
echo ""

case $MODE in
  "demo")
    echo "🎭 Mode Démo Frontend"
    echo "✅ Page de démonstration prête: http://localhost:3000/demo"
    echo ""
    echo "📋 Fonctionnalités disponibles:"
    echo "   • Dashboard comptable avec KPI et graphiques"
    echo "   • Transactions Mobile Money"
    echo "   • Balance Âgée (créances/dettes)"
    echo "   • Données exemples réalistes"
    echo ""
    echo "🌐 Accès direct:"
    echo "   • Dashboard: http://localhost:3000/demo (onglet Dashboard)"
    echo "   • Mobile Money: http://localhost:3000/demo (onglet Mobile Money)"
    echo "   • Balance Âgée: http://localhost:3000/demo (onglet Balance Âgée)"
    ;;
    
  "api")
    echo "🔌 Mode API Backend"
    echo "⚠️  Ce mode nécessite que le backend soit fonctionnel"
    echo ""
    
    # Tester si le backend est accessible
    if curl -s "http://localhost:3001/api/v1/accounting/dashboard/metrics?companyId=$COMPANY_ID" > /dev/null; then
      echo "✅ Backend accessible"
      
      # Utiliser le script de création de données
      if [ -f "/Users/floriace/MERP/scripts/create-demo-data.sh" ]; then
        echo "🌱 Création des données via API..."
        /Users/floriace/MERP/scripts/create-demo-data.sh $COMPANY_ID
      else
        echo "❌ Script create-demo-data.sh non trouvé"
      fi
    else
      echo "❌ Backend non accessible sur http://localhost:3001"
      echo "💡 Démarrez le backend avec: cd bms/api-gateway && npm run start:dev"
    fi
    ;;
    
  "sql")
    echo "🗃️  Mode SQL Direct"
    echo "⚠️  Ce mode nécessite un accès direct à PostgreSQL"
    echo ""
    
    # Vérifier PostgreSQL
    if command -v psql &> /dev/null; then
      echo "✅ psql disponible"
      
      if [ -f "/Users/floriace/MERP/scripts/simple-test-data.sql" ]; then
        echo "🌱 Insertion des données SQL..."
        psql -h localhost -U postgres -d postgres < /Users/floriace/MERP/scripts/simple-test-data.sql
      else
        echo "❌ Script simple-test-data.sql non trouvé"
      fi
    else
      echo "❌ psql non installé"
      echo "💡 Installez PostgreSQL ou utilisez le mode demo"
    fi
    ;;
    
  *)
    echo "❌ Mode inconnu: $MODE"
    echo ""
    echo "💡 Usage: $0 [demo|api|sql] [company-id]"
    echo ""
    echo "Modes disponibles:"
    echo "   demo  - Page de démonstration frontend (recommandé)"
    echo "   api   - Création données via API backend"
    echo "   sql   - Insertion directe SQL dans PostgreSQL"
    exit 1
    ;;
esac

echo ""
echo "🎉 Configuration terminée !"
echo ""
echo "📚 Documentation:"
echo "   • Mode démo: aucune configuration requise"
echo "   • Mode API: backend doit être sur http://localhost:3001"
echo "   • Mode SQL: PostgreSQL sur localhost:5432"
echo ""
echo "🔄 Pour recommencer:"
echo "   ./scripts/setup-demo-data.sh demo"
echo "   ./scripts/setup-demo-data.sh api"
echo "   ./scripts/setup-demo-data.sh sql"
