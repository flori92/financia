# Dockerfile pour Ollama avec Llama sur Railway Pro Plan

FROM ollama/ollama:latest

# Exposition du port par défaut (Railway utilise $PORT, on s’y adapte au runtime)
EXPOSE 11434

# Variables d'environnement par défaut
ENV OLLAMA_ORIGINS="*"
ENV OLLAMA_MODEL="llama2:7b"

    # Dépendances utilitaires pour healthcheck et sync R2 (installer AWS CLI v2 via installeur officiel)
    RUN apt-get update && apt-get install -y curl jq unzip ca-certificates && rm -rf /var/lib/apt/lists/*

    # Installer AWS CLI v2 (support x86_64 et aarch64)
    RUN set -e; arch="$(uname -m)"; \
        if [ "$arch" = "x86_64" ] || [ "$arch" = "amd64" ]; then \
          url="https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip"; \
        elif [ "$arch" = "aarch64" ] || [ "$arch" = "arm64" ]; then \
          url="https://awscli.amazonaws.com/awscli-exe-linux-aarch64.zip"; \
        else \
          echo "Unsupported architecture: $arch"; exit 1; \
        fi; \
        curl -fsSL "$url" -o /tmp/awscliv2.zip && \
        unzip -q /tmp/awscliv2.zip -d /tmp && \
        /tmp/aws/install --update && \
        rm -rf /tmp/aws /tmp/awscliv2.zip

# Créer le répertoire pour les modèles
RUN mkdir -p /root/.ollama

# Healthcheck HTTP sur l’API Ollama (utilise $PORT si fourni par Railway)
HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=12 \
  CMD curl -fsS "http://127.0.0.1:${PORT:-11434}/api/tags" || exit 1

# Copier le script de démarrage avec restauration/synchronisation R2
COPY start-ollama.sh /usr/local/bin/start-ollama.sh
RUN chmod +x /usr/local/bin/start-ollama.sh

# Utiliser le script comme point d'entrée
ENTRYPOINT ["/usr/local/bin/start-ollama.sh"]
