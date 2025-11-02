#!/usr/bin/env python3
"""
Service LLM Simplifié pour BMS - Railway Production
Version ultra-légère sans dépendances ML lourdes
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import random

app = Flask(__name__)
CORS(app)

# Configuration Railway
PORT = int(os.environ.get('PORT', 8001))

class SimplifiedLLMService:
    def __init__(self):
        self.responses = {
            "greeting": [
                "Bonjour ! Je suis votre assistant IA pour la gestion d'entreprise.",
                "Bonjour ! Comment puis-je vous aider avec votre business aujourd'hui ?",
                "Bienvenue ! Je suis là pour vous assister dans vos analyses."
            ],
            "business_advice": [
                "Pour optimiser vos finances, je recommande d'analyser vos flux de trésorerie mensuels.",
                "La segmentation client peut améliorer votre stratégie commerciale.",
                "L'automatisation des processus comptables libère du temps pour le développement."
            ],
            "financial_analysis": [
                "Vos indicateurs financiers suggèrent une croissance stable. Continuez sur cette voie !",
                "L'analyse des tendances révèle des opportunités d'optimisation des coûts.",
                "Vos marges sont dans la moyenne du secteur. Considérez la diversification."
            ]
        }
        print(" Service LLM Simplifié initialisé")
        
    def generate_response(self, prompt, context="business"):
        """Génère une réponse basique sans modèle ML"""
        try:
            # Analyse simple du prompt
            prompt_lower = prompt.lower()
            
            if any(word in prompt_lower for word in ["bonjour", "salut", "hello"]):
                category = "greeting"
            elif any(word in prompt_lower for word in ["finance", "argent", "coût", "budget"]):
                category = "financial_analysis"
            else:
                category = "business_advice"
            
            # Sélectionne une réponse aléatoire dans la catégorie
            response = random.choice(self.responses[category])
            
            return {
                "response": response,
                "confidence": 0.85,
                "model": "simplified-rules-v1",
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                "response": "Désolé, je ne peux pas traiter cette demande pour le moment.",
                "confidence": 0.1,
                "model": "fallback",
                "error": str(e)
            }

# Initialisation du service
llm_service = SimplifiedLLMService()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "bms-llm-service",
        "version": "simplified-v1",
        "timestamp": datetime.now().isoformat()
    })

@app.route('/generate', methods=['POST'])
def generate_text():
    """Génère du texte basique"""
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({"error": "Prompt requis"}), 400
        
        prompt = data['prompt']
        context = data.get('context', 'business')
        
        result = llm_service.generate_response(prompt, context)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/analyze', methods=['POST'])
def analyze_text():
    """Analyse basique de texte"""
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({"error": "Texte requis"}), 400
        
        text = data['text']
        
        # Analyse très basique
        word_count = len(text.split())
        char_count = len(text)
        
        sentiment = "neutre"
        if any(word in text.lower() for word in ["bon", "excellent", "super"]):
            sentiment = "positif"
        elif any(word in text.lower() for word in ["mauvais", "problème", "échec"]):
            sentiment = "négatif"
        
        return jsonify({
            "word_count": word_count,
            "char_count": char_count,
            "sentiment": sentiment,
            "language": "fr",
            "analysis_type": "basic"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/models', methods=['GET'])
def list_models():
    """Liste les modèles disponibles (simulation)"""
    return jsonify({
        "available_models": [
            {
                "name": "simplified-rules-v1",
                "type": "rule-based",
                "status": "active",
                "description": "Modèle simplifié basé sur règles"
            }
        ],
        "total_models": 1
    })

@app.route('/', methods=['GET'])
def home():
    """Page d'accueil du service"""
    return jsonify({
        "service": "BMS LLM Service - Simplified",
        "status": "running",
        "endpoints": [
            "GET /health - Vérification santé",
            "POST /generate - Génération texte",
            "POST /analyze - Analyse texte",
            "GET /models - Modèles disponibles"
        ],
        "version": "1.0.0-simplified"
    })

if __name__ == '__main__':
    print(f" Démarrage service LLM simplifié sur port {PORT}")
    app.run(host='0.0.0.0', port=PORT, debug=False)
