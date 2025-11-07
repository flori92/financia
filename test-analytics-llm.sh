#!/usr/bin/env bash
# Test rapide des endpoints LLM de bms-ai-analytics
# Usage: ./test-analytics-llm.sh <ANALYTICS_URL>

ANALYTICS_URL=${1:-https://bms-ai-analytics-production.up.railway.app}
echo "🔍 Test sur $ANALYTICS_URL"

print_resp() {
  local data="$1"
  if echo "$data" | jq . >/dev/null 2>&1; then
    echo "$data" | jq .
  else
    echo "$data"
  fi
}

# 1) Health
echo -e "\n✅ /health"
resp=$(curl -s "$ANALYTICS_URL/health")
print_resp "$resp"

# 2) Status (affiche le provider & modèle)
echo -e "\n✅ /api/models/status"
resp=$(curl -s "$ANALYTICS_URL/api/models/status")
print_resp "$resp"

# 3) Chat simple (génération + fallback)
echo -e "\n✅ POST /api/llm/chat"
resp=$(curl -s -X POST "$ANALYTICS_URL/api/llm/chat" \
  -H "Content-Type: application/json" \
  -d '{
        "question": "Quels conseils pour améliorer la trésorerie ?",
        "companyData": {
          "name": "Ma PME",
          "industry": "Retail",
          "country": "CI"
        }
      }')
print_resp "$resp"

echo -e "\n✅ Terminé. Si tout répond 200 et contient du texte, c’est OK."