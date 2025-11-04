#!/bin/bash

# Script de test du health check pour BMS Railway
echo "🏥 Test Health Check BMS Railway"
echo "================================"

# Variables
RAILWAY_URL="https://bms-web.up.railway.app"
HEALTH_ENDPOINT="/health"
API_HEALTH_ENDPOINT="/api/health"

echo "📍 URL: $RAILWAY_URL$HEALTH_ENDPOINT"
echo ""

# Test du health check
echo "🔍 Testing health endpoint..."
response=$(curl -s -w "\n%{http_code}" "$RAILWAY_URL$HEALTH_ENDPOINT")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

echo "📊 Status Code: $http_code"
echo "📄 Response Body:"
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

# Analyse du résultat
if [ "$http_code" = "200" ]; then
    echo "✅ Health check SUCCESS!"
    
    # Vérifier le status dans la réponse
    status=$(echo "$body" | jq -r '.status' 2>/dev/null)
    if [ "$status" = "healthy" ]; then
        echo "✅ Application status: $status"
    else
        echo "⚠️  Application status: $status"
    fi
    
    # Vérifier l'uptime
    uptime=$(echo "$body" | jq -r '.uptime' 2>/dev/null)
    if [ "$uptime" != "null" ]; then
        echo "⏱️  Uptime: ${uptime}s"
    fi
    
    # Vérifier la mémoire
    memory_used=$(echo "$body" | jq -r '.memory.used' 2>/dev/null)
    if [ "$memory_used" != "null" ]; then
        echo "💾 Memory: ${memory_used}MB used"
    fi
    
else
    echo "❌ Health check FAILED!"
    echo "🚨 HTTP Status: $http_code"
    
    case $http_code in
        503)
            echo "💡 Service Unavailable - L'application démarre peut-être encore"
            ;;
        404)
            echo "💡 Not Found - L'endpoint health n'existe pas"
            ;;
        500)
            echo "💡 Internal Server Error - Erreur serveur"
            ;;
        *)
            echo "💡 Erreur inconnue"
            ;;
    esac
fi

echo ""
echo "🔗 Direct URLs:"
echo "  - Health Check: $RAILWAY_URL$HEALTH_ENDPOINT"
echo "  - API Health:   $RAILWAY_URL$API_HEALTH_ENDPOINT"
echo "📈 Railway Dashboard: https://railway.app/project/bms-web"
echo ""
echo "🏁 Test terminé!"
