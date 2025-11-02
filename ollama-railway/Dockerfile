# Dockerfile pour Ollama avec Llama sur Railway Pro Plan

FROM ollama/ollama:latest

# Exposition du port Ollama
EXPOSE 11434

# Variables d'environnement
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=*

# Créer le répertoire pour les modèles
RUN mkdir -p /root/.ollama

# Remplacer l'ENTRYPOINT par défaut pour utiliser bash
ENTRYPOINT ["/bin/bash", "-c"]

# Démarrer Ollama en arrière-plan et télécharger le modèle
CMD "ollama serve & sleep 10 && ollama pull llama2:7b && wait"
