# Dockerfile pour Ollama avec Llama sur Railway Pro Plan

FROM ollama/ollama:latest

# Exposition du port Ollama
EXPOSE 11434

# Variables d'environnement
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*

# Créer le répertoire pour les modèles
RUN mkdir -p /root/.ollama

# Script de démarrage
COPY start-ollama.sh /start-ollama.sh
RUN chmod +x /start-ollama.sh

# Commande de démarrage
CMD ["/start-ollama.sh"]
