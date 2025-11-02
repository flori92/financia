# Service LLM Local pour BMS
# Utilise Llama, Mistral, et autres modèles open source gratuits

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import (
    AutoTokenizer, 
    AutoModelForCausalLM, 
    pipeline,
    AutoModelForSequenceClassification
)
from sentence_transformers import SentenceTransformer
import spacy
import nltk
from textblob import TextBlob
import json
import os
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

app = Flask(__name__)
CORS(app)

class LocalLLMService:
    def __init__(self):
        self.models = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f" Initialisation service LLM sur device: {self.device}")
        
    def load_llama_model(self):
        """Charge le modèle Llama (version légère pour Railway)"""
        try:
            model_name = "microsoft/DialoGPT-medium"  # Alternative légère à Llama
            print(f" Chargement modèle {model_name}...")
            
            self.models['llama'] = pipeline(
                "text-generation",
                model=model_name,
                device=0 if self.device == "cuda" else -1,
                max_length=512,
                temperature=0.7,
                do_sample=True
            )
            
            print(" Modèle Llama chargé avec succès")
            return True
            
        except Exception as e:
            print(f" Erreur chargement Llama: {e}")
            # Fallback vers modèle encore plus léger
            return self.load_lightweight_model()
    
    def load_mistral_model(self):
        """Charge le modèle Mistral (open source gratuit)"""
        try:
            model_name = "mistralai/Mistral-7B-Instruct-v0.1"
            print(f" Chargement modèle {model_name}...")
            
            tokenizer = AutoTokenizer.from_pretrained(model_name)
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                device_map="auto" if self.device == "cuda" else None,
                load_in_8bit=True if self.device == "cuda" else False
            )
            
            self.models['mistral'] = {
                'tokenizer': tokenizer,
                'model': model
            }
            
            print(" Modèle Mistral chargé avec succès")
            return True
            
        except Exception as e:
            print(f" Erreur chargement Mistral: {e}")
            return False
    
    def load_lightweight_model(self):
        """Charge un modèle ultra-léger pour fallback"""
        try:
            model_name = "distilbert-base-uncased"
            print(f" Chargement modèle léger {model_name}...")
            
            self.models['lightweight'] = pipeline(
                "text-generation",
                model=model_name,
                device=0 if self.device == "cuda" else -1,
                max_new_tokens=256
            )
            
            print(" Modèle léger chargé")
            return True
            
        except Exception as e:
            print(f" Erreur modèle léger: {e}")
            return False
    
    def load_sentiment_model(self):
        """Charge modèle de sentiment analysis français"""
        try:
            # Modèle français pour sentiment analysis
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
            # Fallback vers TextBlob
            return self.load_fallback_sentiment()
    
    def load_fallback_sentiment(self):
        """Fallback sentiment analysis avec TextBlob"""
        try:
            # Télécharger les données NLTK si nécessaire
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
    
    def load_french_nlp(self):
        """Charge le modèle NLP français spaCy"""
        try:
            print(" Chargement modèle français spaCy...")
            
            # Télécharger et charger le modèle français
            os.system("python -m spacy download fr_core_news_sm > /dev/null 2>&1")
            self.models['french_nlp'] = spacy.load("fr_core_news_sm")
            
            print(" Modèle français spaCy chargé")
            return True
            
        except Exception as e:
            print(f" Erreur modèle français: {e}")
            return False
    
    def generate_business_insights(self, financial_data, context=""):
        """Génère des insights business avec Llama/Mistral"""
        try:
            # Utiliser Mistral si disponible, sinon Llama, sinon fallback
            if 'mistral' in self.models:
                return self._generate_with_mistral(financial_data, context)
            elif 'llama' in self.models:
                return self._generate_with_llama(financial_data, context)
            else:
                return self._generate_basic_insights(financial_data)
                
        except Exception as e:
            print(f" Erreur génération insights: {e}")
            return self._generate_basic_insights(financial_data)
    
    def _generate_with_mistral(self, financial_data, context):
        """Génère avec Mistral"""
        model = self.models['mistral']['model']
        tokenizer = self.models['mistral']['tokenizer']
        
        prompt = f"""En tant qu'expert financier, analyse ces données et génère 3 insights clés et 3 recommandations actionnables:

Données financières: {json.dumps(financial_data, indent=2)}
Contexte: {context}

Réponds en français avec ce format:
INSIGHTS:
1. [insight 1]
2. [insight 2] 
3. [insight 3]

RECOMMANDATIONS:
1. [recommandation 1]
2. [recommandation 2]
3. [recommandation 3]"""

        inputs = tokenizer(prompt, return_tensors="pt").to(self.device)
        
        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=512,
                temperature=0.7,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return self._parse_insights_response(response)
    
    def _generate_with_llama(self, financial_data, context):
        """Génère avec Llama (DialoGPT fallback)"""
        prompt = f"Analyse financière: CA={financial_data.get('revenue', 0)}, Dépenses={financial_data.get('expenses', 0)}, Bénéfice={financial_data.get('profit', 0)}. Génère insights et recommandations en français."
        
        response = self.models['llama'](prompt, max_length=512, num_return_sequences=1)
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
        
        # Insights basés sur règles
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
        
        if expenses > revenue * 0.8:
            insights.append("Les dépenses représentent plus de 80% du CA, risque de structure de coûts lourde")
        
        # Recommandations basées sur règles
        if profit <= 0:
            recommendations.append("Réduire les coûts fixes et revoir la politique de prix")
        
        if margin < 15:
            recommendations.append("Optimiser la chaîne d'approvisionnement pour améliorer les marges")
        
        if revenue > 0:
            recommendations.append("Investir dans le marketing pour accélérer la croissance")
        
        recommendations.append("Mettre en place un suivi hebdomadaire des indicateurs clés")
        
        return {
            'insights': insights,
            'recommendations': recommendations,
            'risk_assessment': self._assess_risks(financial_data),
            'opportunities': self._identify_opportunities(financial_data)
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
            # Limiter la longueur du texte
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
    
    def generate_embeddings(self, texts):
        """Génère des embeddings pour similarité sémantique"""
        try:
            if 'embeddings' not in self.models:
                return self._fallback_embeddings(texts)
            
            embeddings = self.models['embeddings'].encode(texts)
            
            return {
                'embeddings': embeddings.tolist(),
                'dimension': embeddings.shape[1],
                'model': 'sentence-transformers'
            }
            
        except Exception as e:
            print(f" Erreur embeddings: {e}")
            return self._fallback_embeddings(texts)
    
    def _fallback_embeddings(self, texts):
        """Fallback embeddings basiques"""
        # Simuler des embeddings avec hash simple
        import hashlib
        
        embeddings = []
        for text in texts:
            # Créer un embedding basé sur le hash du texte
            hash_obj = hashlib.md5(text.encode())
            embedding = [float(int(hash_obj.hexdigest()[i:i+2], 16)) / 255.0 for i in range(0, min(32, len(hash_obj.hexdigest())), 2)]
            # Compléter si nécessaire
            while len(embedding) < 32:
                embedding.append(0.0)
            
            embeddings.append(embedding[:32])
        
        return {
            'embeddings': embeddings,
            'dimension': 32,
            'model': 'hash-fallback'
        }
    
    def _parse_insights_response(self, response):
        """Parse la réponse du LLM pour extraire insights"""
        try:
            insights = []
            recommendations = []
            
            lines = response.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if 'INSIGHTS' in line.upper():
                    current_section = 'insights'
                elif 'RECOMMANDATIONS' in line.upper():
                    current_section = 'recommendations'
                elif line.startswith(('1.', '2.', '3.', '4.', '5.')):
                    content = line[2:].strip()
                    if content and current_section == 'insights':
                        insights.append(content)
                    elif content and current_section == 'recommendations':
                        recommendations.append(content)
            
            # S'assurer qu'on a au moins 3 éléments chacun
            while len(insights) < 3:
                insights.append("Analyse supplémentaire recommandée")
            
            while len(recommendations) < 3:
                recommendations.append("Surveiller les indicateurs de performance")
            
            return {
                'insights': insights[:3],
                'recommendations': recommendations[:3],
                'risk_assessment': ["Surveiller la concurrence", "Gérer les risques opérationnels"],
                'opportunities': ["Optimiser les processus", "Explorer de nouveaux marchés"]
            }
            
        except Exception as e:
            print(f" Erreur parsing response: {e}")
            return self._generate_basic_insights({})
    
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
    
    def _assess_risks(self, financial_data):
        """Évalue les risques financiers"""
        risks = []
        
        if financial_data.get('profit', 0) <= 0:
            risks.append("Perte financière détectée")
        
        if financial_data.get('expenses', 0) > financial_data.get('revenue', 0):
            risks.append("Structure de coûts non soutenable")
        
        risks.append("Volatilité du marché")
        risks.append("Dépendance clients")
        
        return risks[:2]
    
    def _identify_opportunities(self, financial_data):
        """Identifie les opportunités"""
        opportunities = []
        
        if financial_data.get('revenue', 0) > 0:
            opportunities.append("Potentiel de croissance existant")
        
        opportunities.append("Optimisation digitale")
        opportunities.append("Nouveaux segments marché")
        
        return opportunities[:2]

# Initialiser le service
llm_service = LocalLLMService()

# Charger les modèles au démarrage
@app.before_first_request
def load_models():
    """Charge les modèles LLM au démarrage"""
    print(" Chargement des modèles LLM...")
    
    # Charger dans l'ordre de préférence
    llm_service.load_mistral_model()
    llm_service.load_llama_model()
    llm_service.load_sentiment_model()
    llm_service.load_embedding_model()
    llm_service.load_french_nlp()
    
    print(" Service LLM prêt!")

@app.route('/health', methods=['GET'])
def health_check():
    """Vérification de santé du service LLM"""
    return jsonify({
        'status': 'healthy',
        'models_loaded': list(llm_service.models.keys()),
        'device': llm_service.device,
        'timestamp': datetime.now().isoformat()
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

@app.route('/api/llm/embeddings', methods=['POST'])
def generate_embeddings():
    """Génère des embeddings locaux"""
    try:
        data = request.json
        texts = data.get('texts', [])
        
        if not texts:
            return jsonify({'error': 'Aucun texte fourni'}), 400
        
        results = llm_service.generate_embeddings(texts)
        
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
            'mistral': 'mistralai/Mistral-7B-Instruct-v0.1',
            'llama': 'microsoft/DialoGPT-medium',
            'sentiment': 'tblard/tf-allocine',
            'embeddings': 'sentence-transformers/all-MiniLM-L6-v2',
            'french_nlp': 'fr_core_news_sm'
        }
    })

if __name__ == '__main__':
    print(" Démarrage du service LLM Local BMS...")
    print("Modèles disponibles:")
    print("- Mistral 7B (instruct)")
    print("- Llama (DialoGPT fallback)")
    print("- Sentiment analysis français")
    print("- Embeddings sémantiques")
    print("- NLP français (spaCy)")
    
    app.run(host='0.0.0.0', port=8001, debug=False)
