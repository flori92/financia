#!/bin/bash

echo "🛑 Arrêt de BMS..."

# Arrêter le backend
echo "Arrêt du backend..."
pkill -f "node server-mock.js" 2>/dev/null || true

# Arrêter le frontend
echo "Arrêt du frontend..."
pkill -f "next dev" 2>/dev/null || true

sleep 2

echo "✅ BMS arrêté"
