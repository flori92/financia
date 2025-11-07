#!/bin/bash
set -euo pipefail

PORT="${PORT:-11434}"
export OLLAMA_HOST="0.0.0.0:${PORT}"
export OLLAMA_ORIGINS="${OLLAMA_ORIGINS:-*}"
MODEL="${OLLAMA_MODEL:-llama2:7b}"

# R2 (S3-compatible) configuration
R2_BUCKET="${R2_BUCKET:-}"
R2_PREFIX="${R2_PREFIX:-ollama}"
R2_S3_ENDPOINT="${R2_S3_ENDPOINT:-}"
AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-}"
AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-}"

restore_from_r2() {
  if command -v aws >/dev/null 2>&1 \
     && [ -n "$R2_BUCKET" ] && [ -n "$R2_S3_ENDPOINT" ] \
     && [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "📦 Restoring Ollama data from R2 s3://$R2_BUCKET/$R2_PREFIX"
    mkdir -p /root/.ollama
    aws s3 sync "s3://$R2_BUCKET/$R2_PREFIX" \
      /root/.ollama \
      --endpoint-url "$R2_S3_ENDPOINT" \
      --no-progress || echo "⚠️ R2 restore skipped/failed (continuing)"
  else
    echo "ℹ️ R2 restore not configured (skipping)"
  fi
}

sync_to_r2() {
  if command -v aws >/dev/null 2>&1 \
     && [ -n "$R2_BUCKET" ] && [ -n "$R2_S3_ENDPOINT" ] \
     && [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    echo "🔄 Syncing Ollama data to R2 s3://$R2_BUCKET/$R2_PREFIX"
    aws s3 sync /root/.ollama \
      "s3://$R2_BUCKET/$R2_PREFIX" \
      --endpoint-url "$R2_S3_ENDPOINT" \
      --delete --no-progress || echo "⚠️ R2 sync failed (continuing)"
  else
    echo "ℹ️ R2 sync not configured (skipping)"
  fi
}

echo "🚀 Starting Ollama server on ${OLLAMA_HOST}..."

# Optionally restore models from R2 before serving (fast boot if present)
restore_from_r2

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
  # Persist the freshly pulled model to R2 for future restarts
  sync_to_r2
fi

echo "✅ Ollama is ready with ${MODEL}!"
echo "🌐 API available at http://0.0.0.0:${PORT}"

wait
