#!/usr/bin/env python3
"""
Service LLM GRATUIT avec Llama 3.2 pour BMS - Railway Production
Version économique utilisant modèles open-source gratuits
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import requests
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)

# Configuration Railway
PORT = int(os.environ.get('PORT', 8001))

# Configuration Llama (modèles gratuits)
LLAMA_CONFIG = {
    "models": {
        "llama-3.2-3b": {
            "url": "https://api.together.xyz/v1/chat/completions",
            "model": "meta-llama/Llama-3.2-3B-Instruct-Turbo",
            "api_key": os.environ.get("TOGETHER_API_KEY", ""),
            "cost_per_1k_tokens": 0.0, # GRATUIT sur Together API
            "max_tokens": 2000
        },
        "llama-3.1-8b": {
            "url": "https://api.together.xyz/v1/chat/completions", 
            "model": "meta-llama/Llama-3.1-8B-Instruct-Turbo",
            "api_key": os.environ.get("TOGETHER_API_KEY", ""),
            "cost_per_1k_tokens": 0.0, # GRATUIT
            "max_tokens": 4000
        },
        "mixtral-8x7b": {
            "url": "https://api.together.xyz/v1/chat/completions",
            "model": "mistralai/Mixtral-8x7B-Instruct-v0.1", 
            "api_key": os.environ.get("TOGETHER_API_KEY", ""),
            "cost_per_1k_tokens": 0.0, # GRATUIT
            "max_tokens": 4000
        }
    },
    "default_model": "llama-3.2-3b"
}

class FreeLLMService:
    def __init__(self):
        self.current_model = LLAMA_CONFIG["default_model"]
        self.logger = logging.getLogger(__name__)
        logging.basicConfig(level=logging.INFO)
        
        print("🦙 Service LLM GRATUIT initialisé")
        print(f"   Modèle par défaut: {self.current_model}")
        print(f"   Coût: 0 FCFA (100% GRATUIT)")
        
    def get_bms_context(self, company_data):
        """Construire le contexte BMS pour le modèle"""
        context = f"""
CONTEXTE ENTREPRISE BMS:
- Nom: {company_data.get('name', 'Non spécifié')}
- Secteur: {company_data.get('industry', 'Non spécifié')}
- Pays: {company_data.get('country', 'Afrique')}

INDICATEURS FINANCIERS (30 derniers jours):
- Total débits: {self.format_currency(company_data.get('total_debit', 0))} FCFA
- Total crédits: {self.format_currency(company_data.get('total_credit', 0))} FCFA
- Nombre d'écritures: {company_data.get('entry_count', 0)}
- Dernière écriture: {company_data.get('last_entry_date', 'N/A')}

PRINCIPAUX TIERS (clients/fournisseurs):
{self.format_parties(company_data.get('parties', []))}

COMPÉTENCES SPÉCIALISÉES:
- Comptabilité OHADA et normes africaines
- Analyse financière PME
- Optimisation fiscale (TVA, IS, impôts locaux)
- Gestion de trésorerie
- Conseils business pour marché africain

OBJECTIF: Aider l'entrepreneur avec des analyses intelligentes basées sur ses données réelles.
"""
        return context
        
    def format_currency(self, amount):
        """Formater les montants en FCFA"""
        return "{:,}".format(int(amount or 0)).replace(',', ' ')
        
    def format_parties(self, parties):
        """Formater la liste des tiers"""
        if not parties:
            return "Aucun tiers récent"
        return "\n".join([
            f"- {p.get('name', 'N/A')}: {self.format_currency(p.get('balance', 0))} FCFA ({p.get('transactions', 0)} transactions)"
            for p in parties[:5]
        ])
    
    def call_llama_api(self, question, context=""):
        """Appeler l'API Llama GRATUITE"""
        model_config = LLAMA_CONFIG["models"][self.current_model]
        
        system_prompt = f"""Tu es un assistant IA expert pour BMS (Business Management System), un logiciel de gestion d'entreprise pour les PME en Afrique.

{context}

RÈGLES IMPORTANTES:
1. Réponds en français professionnel et accessible
2. Base tes analyses sur les données fournies
3. Donne des recommandations actionnables et concrètes
4. Sois précis avec les chiffres et calculs
5. Structure tes réponses avec des sections claires
6. Pour les conseils fiscaux, précise que ce sont des suggestions générales
7. Sois concis mais complet

COMPÉTENCES: Comptabilité OHADA, fiscalité africaine, analyse financière, trésorerie, business."""
        
        try:
            payload = {
                "model": model_config["model"],
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": question}
                ],
                "max_tokens": model_config["max_tokens"],
                "temperature": 0.3,
                "top_p": 0.7,
                "top_k": 50
            }
            
            headers = {
                "Authorization": f"Bearer {model_config['api_key']}",
                "Content-Type": "application/json"
            }
            
            response = requests.post(
                model_config["url"],
                json=payload,
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "success": True,
                    "response": data["choices"][0]["message"]["content"],
                    "model": self.current_model,
                    "tokens_used": data.get("usage", {}).get("total_tokens", 0),
                    "cost": 0.0, # GRATUIT !
                    "provider": "Together AI (Llama)"
                }
            else:
                self.logger.error(f"Erreur API Llama: {response.status_code} - {response.text}")
                return self.get_fallback_response(question)
                
        except Exception as e:
            self.logger.error(f"Exception appel Llama: {str(e)}")
            return self.get_fallback_response(question)
    
    def get_fallback_response(self, question):
        """Réponse de fallback si API indisponible"""
        fallback_responses = {
            "finance": "D'après vos données disponibles, je recommande de surveiller attentivement votre trésorerie et d'analyser régulièrement vos flux financiers. Le service LLM est temporairement indisponible.",
            "comptabilité": "Pour vos écritures comptables, assurez-vous de suivre les normes OHADA et de conserver une trace claire de toutes vos transactions. Le service IA expert sera bientôt de retour.",
            "conseil": "Basez vos décisions sur une analyse régulière de vos indicateurs financiers. N'hésitez pas à consulter un expert-comptable pour des conseils personnalisés."
        }
        
        category = self.detect_category(question)
        response = fallback_responses.get(category, fallback_responses["conseil"])
        
        return {
            "success": True,
            "response": response,
            "model": "fallback",
            "tokens_used": 0,
            "cost": 0.0,
            "provider": "Fallback local"
        }
    
    def detect_category(self, question):
        """Détecter la catégorie de la question"""
        question_lower = question.lower()
        
        if any(word in question_lower for word in ["finance", "argent", "budget", "trésorerie"]):
            return "finance"
        elif any(word in question_lower for word in ["compt", "écriture", "débit", "crédit", "ohada"]):
            return "comptabilité"
        
        return "conseil"

# Routes API
@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "service": "bms-free-llm-service",
        "model": LLAMA_CONFIG["default_model"],
        "cost": "GRATUIT",
        "provider": "Together AI (Llama)"
    })

@app.route('/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        question = data.get('question', '')
        company_data = data.get('companyData', {})
        
        if not question:
            return jsonify({"error": "Question requise"}), 400
            
        llm_service = FreeLLMService()
        context = llm_service.get_bms_context(company_data)
        result = llm_service.call_llama_api(question, context)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({"error": f"Erreur traitement: {str(e)}"}), 500

@app.route('/models', methods=['GET'])
def get_models():
    """Lister les modèles disponibles"""
    return jsonify({
        "available_models": list(LLAMA_CONFIG["models"].keys()),
        "current_model": LLAMA_CONFIG["default_model"],
        "all_gratis": True,
        "provider": "Together AI"
    })

@app.route('/switch-model', methods=['POST'])
def switch_model():
    """Changer de modèle Llama"""
    try:
        data = request.get_json()
        model_name = data.get('model')
        
        if model_name not in LLAMA_CONFIG["models"]:
            return jsonify({"error": "Modèle non disponible"}), 400
            
        LLAMA_CONFIG["default_model"] = model_name
        
        return jsonify({
            "success": True,
            "new_model": model_name,
            "message": f"Modèle changé vers {model_name} (toujours GRATUIT !)"
        })
        
    except Exception as e:
        return jsonify({"error": f"Erreur changement modèle: {str(e)}"}), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Statistiques d'utilisation (GRATUIT)"""
    return jsonify({
        "total_cost": 0.0,
        "total_tokens": 0,
        "model": LLAMA_CONFIG["default_model"],
        "provider": "Together AI (Llama)",
        "cost_per_call": 0.0,
        "message": "100% GRATUIT - Aucun coût d'utilisation !"
    })

if __name__ == '__main__':
    print("🦙 Démarrage Service LLM GRATUIT BMS")
    print(f"   Port: {PORT}")
    print(f"   Modèles: {list(LLAMA_CONFIG['models'].keys())}")
    print(f"   Coût: 0 FCFA (TOUJOURS GRATUIT)")
    
    app.run(host='0.0.0.0', port=PORT, debug=False)
