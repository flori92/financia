#!/bin/bash

echo "🚀 Démarrage de BMS..."

# Arrêter les processus existants
echo "🛑 Arrêt des processus existants..."
pkill -f "node server-mock.js" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
sleep 2

# Démarrer le backend
echo "🔧 Démarrage du backend (port 3001)..."
cd /Users/floriace/MERP/bms/api-gateway
nohup node server-mock.js > mock.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend démarré (PID: $BACKEND_PID)"

# Attendre que le backend soit prêt
sleep 3

# Démarrer le frontend
echo "🎨 Démarrage du frontend (port 3000)..."
cd /Users/floriace/MERP/bms-web
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend démarré (PID: $FRONTEND_PID)"

echo ""
echo "✨ BMS est démarré!"
echo ""
echo "📊 Backend API: http://localhost:3001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "👤 Comptes de test:"
echo "   - Entrepreneur: entrepreneur@test.bj / password123"
echo "   - Comptable: comptable@cabinet.bj / password123"
echo "   - Admin: admin@bms.bj / password123"
echo ""
echo "📝 Logs:"
echo "   - Backend: /Users/floriace/MERP/bms/api-gateway/mock.log"
echo "   - Frontend: /Users/floriace/MERP/bms-web/frontend.log"
echo ""
echo "🛑 Pour arrêter: ./STOP_ALL.sh"
