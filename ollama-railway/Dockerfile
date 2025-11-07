# Dockerfile pour Ollama avec Llama sur Railway Pro Plan

FROM ollama/ollama:latest

# Exposition du port par défaut (Railway utilise $PORT, on s’y adapte au runtime)
EXPOSE 11434

# Variables d'environnement par défaut
ENV OLLAMA_ORIGINS="*"
ENV OLLAMA_MODEL="llama2:7b"

# Dépendances utilitaires pour healthcheck et sync R2
RUN apt-get update && apt-get install -y curl awscli jq && rm -rf /var/lib/apt/lists/*

# Créer le répertoire pour les modèles
RUN mkdir -p /root/.ollama

# Healthcheck HTTP sur l’API Ollama (utilise $PORT si fourni par Railway)
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=12 \
  CMD curl -fsS "http://127.0.0.1:${PORT:-11434}/api/tags" || exit 1

# Remplacer l'ENTRYPOINT par défaut pour utiliser bash
ENTRYPOINT ["/bin/bash", "-c"]

# Démarrage robuste : bind sur $PORT, attendre readiness, pull modèle si absent
CMD "export OLLAMA_HOST=0.0.0.0:${PORT:-11434}; \
     echo '🚀 Starting Ollama on '${OLLAMA_HOST}; \
     ollama serve & \
     for i in $(seq 1 30); do \
       curl -fsS http://127.0.0.1:${PORT:-11434}/api/tags && break || sleep 2; \
     done; \
     if ! ollama list | grep -q \"${OLLAMA_MODEL}\"; then \
       echo '📥 Pulling model '${OLLAMA_MODEL}; \
       ollama pull ${OLLAMA_MODEL}; \
     fi; \
     echo '✅ Ollama ready'; \
     wait"
