#!/bin/bash
set -euo pipefail

PORT="${PORT:-11434}"
export OLLAMA_HOST="0.0.0.0:${PORT}"
export OLLAMA_ORIGINS="${OLLAMA_ORIGINS:-*}"
MODEL="${OLLAMA_MODEL:-llama2:7b}"

echo "🚀 Starting Ollama server on ${OLLAMA_HOST}..."

ollama serve &

echo "⏳ Waiting for Ollama to be ready..."
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${PORT}/api/tags" >/dev/null; then
    break
  fi
  sleep 2
done

if ! ollama list | grep -q "${MODEL}"; then
  echo "📥 Pulling model ${MODEL}..."
  ollama pull "${MODEL}"
fi

echo "✅ Ollama is ready with ${MODEL}!"
echo "🌐 API available at http://0.0.0.0:${PORT}"

wait
