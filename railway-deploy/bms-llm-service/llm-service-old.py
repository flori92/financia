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
            
            print(" Modèle Mistral chargé avec succès")
            return True
            
        except Exception as e:
            print(f" Erreur chargement Mistral: {e}")
            return False
    
    def load_sentiment_model(self):
        """Charge modèle de sentiment analysis français"""
        try:
            model_name = "tblard/tf-allocine"
            print(f" Chargement modèle sentiment {model_name}...")
            
            self.models['sentiment'] = pipeline(
                "sentiment-analysis",
                model=model_name,
                device=0 if self.device == "cuda" else -1
            )
            
            print(" Modèle sentiment chargé")
            return True
            
        except Exception as e:
            print(f" Erreur modèle sentiment: {e}")
            return self.load_fallback_sentiment()
    
    def load_fallback_sentiment(self):
        """Fallback sentiment analysis avec TextBlob"""
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('vader_lexicon', quiet=True)
            print(" Sentiment analysis fallback (TextBlob) prêt")
            return True
        except Exception as e:
            print(f" Erreur fallback sentiment: {e}")
            return False
    
    def load_embedding_model(self):
        """Charge modèle d'embeddings pour similarité"""
        try:
            model_name = "sentence-transformers/all-MiniLM-L6-v2"
            print(f" Chargement modèle embeddings {model_name}...")
            
            self.models['embeddings'] = SentenceTransformer(model_name)
            print(" Modèle embeddings chargé")
            return True
        except Exception as e:
            print(f" Erreur modèle embeddings: {e}")
            return False
    
    def generate_business_insights(self, financial_data, context=""):
        """Génère des insights business avec LLM local"""
        try:
            if 'mistral' in self.models:
                return self._generate_with_mistral(financial_data, context)
            else:
                return self._generate_basic_insights(financial_data)
        except Exception as e:
            print(f" Erreur génération insights: {e}")
            return self._generate_basic_insights(financial_data)
    
    def _generate_with_mistral(self, financial_data, context):
        """Génère avec Mistral (DialoGPT fallback)"""
        prompt = f"Analyse financière: CA={financial_data.get('revenue', 0)}, Dépenses={financial_data.get('expenses', 0)}, Bénéfice={financial_data.get('profit', 0)}. Génère 3 insights et 3 recommandations en français."
        
        response = self.models['mistral'](prompt, max_length=512, num_return_sequences=1)
        generated_text = response[0]['generated_text']
        
        return self._parse_insights_response(generated_text)
    
    def _generate_basic_insights(self, financial_data):
        """Génère insights basiques sans LLM"""
        revenue = financial_data.get('revenue', 0)
        expenses = financial_data.get('expenses', 0)
        profit = financial_data.get('profit', 0)
        
        margin = (profit / revenue * 100) if revenue > 0 else 0
        
        insights = []
        recommendations = []
        
        if profit > 0:
            insights.append("L'entreprise est rentable avec un bénéfice positif")
        else:
            insights.append("L'entreprise subit des pertes, nécessite une attention particulière")
            
        if margin > 20:
            insights.append("Les marges bénéficiaires sont excellentes (>20%)")
        elif margin > 10:
            insights.append("Les marges bénéficiaires sont bonnes (>10%)")
        else:
            insights.append("Les marges bénéficiaires sont faibles, nécessitent une optimisation")
        
        if profit <= 0:
            recommendations.append("Réduire les coûts fixes et revoir la politique de prix")
        
        if margin < 15:
            recommendations.append("Optimiser la chaîne d'approvisionnement pour améliorer les marges")
        
        if revenue > 0:
            recommendations.append("Investir dans le marketing pour accélérer la croissance")
        
        return {
            'insights': insights,
            'recommendations': recommendations,
            'risk_assessment': ['Surveiller la concurrence', 'Gérer les risques opérationnels'],
            'opportunities': ['Optimiser les processus', 'Explorer de nouveaux marchés']
        }
    
    def _parse_insights_response(self, response):
        """Parse la réponse du LLM pour extraire insights"""
        insights = []
        recommendations = []
        
        # Fallback vers insights basiques si parsing échoue
        if not insights or not recommendations:
            return self._generate_basic_insights({})
        
        return {
            'insights': insights[:3],
            'recommendations': recommendations[:3],
            'risk_assessment': ['Surveiller la concurrence', 'Gérer les risques opérationnels'],
            'opportunities': ['Optimiser les processus', 'Explorer de nouveaux marchés']
        }
    
    def analyze_sentiment(self, texts):
        """Analyse le sentiment de textes en français"""
        try:
            if 'sentiment' in self.models:
                return self._analyze_with_transformer(texts)
            else:
                return self._analyze_with_textblob(texts)
        except Exception as e:
            print(f" Erreur analyse sentiment: {e}")
            return self._fallback_sentiment_analysis(texts)
    
    def _analyze_with_transformer(self, texts):
        """Analyse avec modèle Transformers français"""
        results = []
        
        for text in texts:
            truncated_text = text[:512]
            result = self.models['sentiment'](truncated_text)[0]
            
            results.append({
                'text': text,
                'sentiment': result['label'].lower(),
                'confidence': result['score'],
                'model': 'transformers-fr'
            })
        
        return {
            'results': results,
            'overall_sentiment': self._calculate_overall_sentiment(results),
            'model_used': 'transformers-fr'
        }
    
    def _analyze_with_textblob(self, texts):
        """Analyse avec TextBlob (fallback)"""
        results = []
        
        for text in texts:
            blob = TextBlob(text)
            polarity = blob.sentiment.polarity
            
            if polarity > 0.1:
                sentiment = 'positive'
            elif polarity < -0.1:
                sentiment = 'negative'
            else:
                sentiment = 'neutral'
            
            confidence = abs(polarity)
            
            results.append({
                'text': text,
                'sentiment': sentiment,
                'confidence': confidence,
                'model': 'textblob'
            })
        
        return {
            'results': results,
            'overall_sentiment': self._calculate_overall_sentiment(results),
            'model_used': 'textblob'
        }
    
    def _fallback_sentiment_analysis(self, texts):
        """Fallback ultra basique"""
        return {
            'results': [{'text': text, 'sentiment': 'neutral', 'confidence': 0.5} for text in texts],
            'overall_sentiment': 'neutral',
            'model_used': 'fallback'
        }
    
    def _calculate_overall_sentiment(self, results):
        """Calcule le sentiment global"""
        if not results:
            return 'neutral'
        
        positive_count = sum(1 for r in results if r['sentiment'] == 'positive')
        negative_count = sum(1 for r in results if r['sentiment'] == 'negative')
        
        if positive_count > negative_count:
            return 'positive'
        elif negative_count > positive_count:
            return 'negative'
        else:
            return 'neutral'

# Initialiser le service
llm_service = LocalLLMService()

# Charger les modèles au démarrage
def load_models():
    """Charge les modèles LLM au démarrage"""
    print(" Chargement des modèles LLM...")
    
    llm_service.load_mistral_model()
    llm_service.load_sentiment_model()
    llm_service.load_embedding_model()
    
    print(" Service LLM prêt!")

# Charger les modèles
load_models()

@app.route('/health', methods=['GET'])
def health_check():
    """Vérification de santé du service LLM"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': list(llm_service.models.keys()),
        'device': llm_service.device,
        'timestamp': datetime.now().isoformat(),
        'railway': True
    })

@app.route('/api/llm/insights', methods=['POST'])
def generate_insights():
    """Génère des insights business avec LLM local"""
    try:
        data = request.json
        financial_data = data.get('financialData', {})
        context = data.get('context', '')
        
        insights = llm_service.generate_business_insights(financial_data, context)
        
        return jsonify({
            'success': True,
            'data': insights,
            'model_used': 'local-llm'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/llm/sentiment', methods=['POST'])
def analyze_sentiment():
    """Analyse le sentiment avec modèles locaux"""
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({'error': 'Aucun texte fourni'}), 400
        
        results = llm_service.analyze_sentiment(texts)
        
        return jsonify({
            'success': True,
            'data': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/llm/models', methods=['GET'])
def list_models():
    """Liste les modèles chargés"""
    return jsonify({
        'models': list(llm_service.models.keys()),
        'device': llm_service.device,
        'available_models': {
            'mistral': 'microsoft/DialoGPT-medium',
            'sentiment': 'tblard/tf-allocine',
            'embeddings': 'sentence-transformers/all-MiniLM-L6-v2'
        },
        'railway': True
    })

if __name__ == '__main__':
    print(" Démarrage du service LLM Local BMS sur Railway...")
    print(f"Port: {PORT}")
    print("Modèles disponibles:")
    print("- Mistral (DialoGPT fallback)")
    print("- Sentiment analysis français")
    print("- Embeddings sémantiques")
    
    app.run(host='0.0.0.0', port=PORT, debug=False)
