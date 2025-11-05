#!/bin/bash

# Script pour tester les endpoints API manquants
# Usage: ./scripts/test-api-endpoints.sh

API_URL="${API_URL:-https://bms-production-d9e9.up.railway.app}"
COMPANY_ID="e611a153-8dd5-41dd-bb8e-9434766a0dfd"

# Récupérer le token depuis les logs (à remplacer par votre token)
TOKEN="${BMS_TOKEN:-eyJhbGciOiJIUzI1NiIs...}"

echo "🔍 Test des endpoints API BMS"
echo "================================"
echo ""

# Test 1: Aged Balance Receivables
echo "📊 Test 1: GET /api/v1/accounting/aged-balance (receivables)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/accounting/aged-balance?companyId=${COMPANY_ID}&type=receivables&asOfDate=2025-11-29" \
  | jq '.' 2>/dev/null || echo "Response non-JSON ou erreur"
echo ""

# Test 2: Aged Balance Payables
echo "📊 Test 2: GET /api/v1/accounting/aged-balance (payables)"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/accounting/aged-balance?companyId=${COMPANY_ID}&type=payables&asOfDate=2025-11-29" \
  | jq '.' 2>/dev/null || echo "Response non-JSON ou erreur"
echo ""

# Test 3: Users List
echo "👥 Test 3: GET /api/v1/users"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/users?companyId=${COMPANY_ID}" \
  | jq '.' 2>/dev/null || echo "Response non-JSON ou erreur"
echo ""

# Test 4: Dashboard Metrics
echo "📈 Test 4: GET /api/v1/accounting/dashboard/metrics"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/accounting/dashboard/metrics?companyId=${COMPANY_ID}" \
  | jq '.' 2>/dev/null || echo "Response non-JSON ou erreur"
echo ""

# Test 5: Treasury Forecast
echo "💰 Test 5: GET /api/v1/treasury/forecast"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/treasury/forecast?companyId=${COMPANY_ID}" \
  | jq '.' 2>/dev/null || echo "Response non-JSON ou erreur"
echo ""

# Test 6: Treasury Alerts
echo "⚠️  Test 6: GET /api/v1/treasury/alerts"
curl -s -w "\nHTTP Status: %{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  "${API_URL}/api/v1/treasury/alerts?companyId=${COMPANY_ID}" \
  | jq '.' 2>/dev/null || echo "Response non-JSON ou erreur"
echo ""

echo "================================"
echo "✅ Tests terminés"
