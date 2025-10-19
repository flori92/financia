#!/bin/bash

echo "🚀 Démarrage de BMS..."

# Démarrer le backend
cd /Users/floriace/MERP/bms/api-gateway
echo "📦 Démarrage du backend API..."
npm run start:dev > backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > backend.pid
echo "✅ Backend démarré (PID: $BACKEND_PID)"

# Attendre que le backend soit prêt
sleep 10

# Démarrer le frontend
cd /Users/floriace/MERP/bms-web
echo "🌐 Démarrage du frontend..."
npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > frontend.pid
echo "✅ Frontend démarré (PID: $FRONTEND_PID)"

echo ""
echo "✨ BMS est démarré !"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo ""
echo "Pour arrêter: ./STOP_BMS.sh"
