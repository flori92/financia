#!/bin/bash

echo "🚀 Starting Ollama server..."

# Démarrer Ollama en arrière-plan
ollama serve &

# Attendre que Ollama soit prêt
echo "⏳ Waiting for Ollama to be ready..."
sleep 10

# Télécharger et charger le modèle Llama2 (optimisé pour 32GB RAM)
echo "📥 Pulling Llama2 7B model..."
ollama pull llama2:7b

echo "✅ Ollama is ready with Llama2!"
echo "🌐 API available at http://0.0.0.0:11434"

# Garder le conteneur actif
wait
