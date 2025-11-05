#!/bin/bash

# Script pour supprimer tous les emojis de l'interface BMS

cd "$(dirname "$0")"

echo "🧹 Suppression des emojis de l'interface BMS..."

# Supprimer tous les emojis courants des fichiers TSX et TS
find src -name "*.tsx" -o -name "*.ts" -type f | while read file; do
  # Remplacer les emojis par du texte vide ou rien
  sed -i '' \
    -e 's/💼//g' \
    -e 's/📊//g' \
    -e 's/🚀//g' \
    -e 's/✨//g' \
    -e 's/📈//g' \
    -e 's/💰//g' \
    -e 's/🎯//g' \
    -e 's/🔔//g' \
    -e 's/⚡//g' \
    -e 's/📱//g' \
    -e 's/🎉//g' \
    -e 's/🌍//g' \
    -e 's/📚//g' \
    -e 's/🏆//g' \
    -e 's/💡//g' \
    -e 's/🔍//g' \
    -e 's/📄//g' \
    -e 's/✅//g' \
    -e 's/❌//g' \
    -e 's/⚠️//g' \
    -e 's/🔑//g' \
    -e 's/🗑️//g' \
    -e 's/↩️//g' \
    -e 's/🚨//g' \
    -e 's/📡//g' \
    -e 's/🤖//g' \
    -e 's/🔧//g' \
    -e 's/🧹//g' \
    -e 's/🔗//g' \
    "$file"
done

echo "✓ Suppression des emojis terminée!"
echo "📋 Fichiers vérifiés: $(find src -name '*.tsx' -o -name '*.ts' | wc -l) fichiers"
