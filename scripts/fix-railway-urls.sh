#!/bin/bash

# Script pour remplacer toutes les URLs Railway hardcodées

echo "🔧 Remplacement des URLs Railway hardcodées..."

# Remplacer dans tous les fichiers TypeScript/TSX
find bms-web/src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  -e 's|https://bms-production-d9e9\.up\.railway\.app||g' \
  -e "s|process\.env\.NEXT_PUBLIC_API_URL \|\| 'https://bms-production-d9e9\.up\.railway\.app'|process.env.NEXT_PUBLIC_API_URL \|\| ''|g" \
  {} +

echo "✅ URLs Railway remplacées !"
echo "📝 Vérification..."

# Compter les occurrences restantes
count=$(grep -r "bms-production-d9e9.up.railway.app" bms-web/src 2>/dev/null | wc -l)

if [ "$count" -eq 0 ]; then
  echo "✅ Aucune URL Railway trouvée !"
else
  echo "⚠️  $count occurrences restantes trouvées"
  grep -r "bms-production-d9e9.up.railway.app" bms-web/src
fi
