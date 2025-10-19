#!/bin/bash

echo "🛑 Arrêt de BMS..."

# Arrêter le backend
if [ -f /Users/floriace/MERP/bms/api-gateway/backend.pid ]; then
  BACKEND_PID=$(cat /Users/floriace/MERP/bms/api-gateway/backend.pid)
  kill $BACKEND_PID 2>/dev/null
  rm /Users/floriace/MERP/bms/api-gateway/backend.pid
  echo "✅ Backend arrêté"
fi

# Arrêter le frontend
if [ -f /Users/floriace/MERP/bms-web/frontend.pid ]; then
  FRONTEND_PID=$(cat /Users/floriace/MERP/bms-web/frontend.pid)
  kill $FRONTEND_PID 2>/dev/null
  rm /Users/floriace/MERP/bms-web/frontend.pid
  echo "✅ Frontend arrêté"
fi

echo "✨ BMS arrêté"
