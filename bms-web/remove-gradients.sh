#!/bin/bash

# Script pour remplacer les dégradés par des couleurs solides professionnelles

cd "$(dirname "$0")"

echo "🔧 Suppression des dégradés de l'interface BMS..."

# Remplacer les gradients bg-gradient-to-* par des couleurs solides
find src/app -name "*.tsx" -type f -exec sed -i '' \
  -e 's/bg-gradient-to-br from-blue-50 to-blue-100/bg-blue-50/g' \
  -e 's/bg-gradient-to-br from-orange-50 to-orange-100/bg-orange-50/g' \
  -e 's/bg-gradient-to-br from-emerald-50 to-emerald-100/bg-emerald-50/g' \
  -e 's/bg-gradient-to-br from-purple-50 to-purple-100/bg-purple-50/g' \
  -e 's/bg-gradient-to-br from-amber-50 to-amber-100/bg-amber-50/g' \
  -e 's/bg-gradient-to-br from-green-50 to-green-100/bg-green-50/g' \
  -e 's/bg-gradient-to-br from-red-50 to-red-100/bg-red-50/g' \
  -e 's/bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900/bg-slate-900/g' \
  -e 's/bg-gradient-to-r from-blue-600\/5 to-emerald-600\/5/bg-slate-800\/10/g' \
  -e 's/bg-gradient-to-br from-blue-600 to-emerald-600/bg-[#0D9488]/g' \
  -e 's/bg-gradient-to-r from-blue-600 to-emerald-600/bg-[#0D9488]/g' \
  -e 's/bg-gradient-to-r from-\[#0F3D3A\] to-\[#0D9488\]/bg-[#0D9488]/g' \
  -e 's/bg-gradient-to-br from-\[#0F3D3A\] to-\[#0D9488\]/bg-[#0D9488]/g' \
  -e 's/bg-gradient-to-br from-\[#0D9488\]\/10 to-\[#0D9488\]\/5/bg-[#0D9488]\/10/g' \
  -e 's/bg-gradient-to-br from-blue-500\/10 to-blue-500\/5/bg-blue-500\/10/g' \
  -e 's/bg-gradient-to-br from-green-500\/10 to-green-500\/5/bg-green-500\/10/g' \
  -e 's/bg-gradient-to-br from-orange-500\/10 to-orange-500\/5/bg-orange-500\/10/g' \
  -e 's/bg-gradient-to-br from-gray-100 to-gray-50/bg-gray-100/g' \
  -e 's/bg-gradient-to-r from-gray-900 to-gray-800/bg-gray-900/g' \
  -e 's/hover:from-blue-700 hover:to-emerald-700/hover:bg-[#0B7C74]/g' \
  -e 's/from-blue-400 to-emerald-400/text-[#0D9488]/g' \
  -e 's/bg-gradient-to-br \${profile\.color}\/10 shadow-lg/bg-slate-800\/50/g' \
  {} +

# Remplacer les textes transparents avec gradient par des couleurs solides
find src/app -name "*.tsx" -type f -exec sed -i '' \
  -e 's/text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400/text-[#0D9488]/g' \
  {} +

echo "✅ Nettoyage des dégradés terminé!"
echo "📝 Fichiers modifiés: $(find src/app -name '*.tsx' -type f | wc -l) fichiers TSX"
