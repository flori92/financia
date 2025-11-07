#!/usr/bin/env python3
"""
BMS AI Analytics Service - Railway Production
Service Flask avec Prophet, scikit-learn et intégration LLM local
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import warnings
warnings.filterwarnings('ignore')

# ML Libraries
from prophet import Prophet
from sklearn.ensemble import RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

app = Flask(__name__)
CORS(app)

# Configuration Railway
PORT = int(os.environ.get('PORT', 8000))
LLM_SERVICE_URL = os.environ.get('LLM_SERVICE_URL', 'http://localhost:8001')
LLM_PROVIDER = os.environ.get('LLM_PROVIDER', 'simplified')  # 'simplified' | 'free' | 'ollama'
OLLAMA_MODEL = os.environ.get('OLLAMA_MODEL', 'llama2:7b')

class BMSAIAnalytics:
    def __init__(self):
        self.models = {}
        
    def generate_prophet_forecast(self, data):
        """Génère des prévisions avec Prophet"""
        try:
            # Préparer les données
            df = pd.DataFrame(data['historicalData'])
            df.columns = ['ds', 'y']
            df['ds'] = pd.to_datetime(df['ds'])
            
            # Créer et entraîner le modèle Prophet
            model = Prophet(
                daily_seasonality=data['frequency'] == 'daily',
                weekly_seasonality=data['frequency'] == 'weekly', 
                monthly_seasonality=data['frequency'] == 'monthly',
                yearly_seasonality=True
            )
            
            model.fit(df)
            
            # Générer les prévisions futures
            future = model.make_future_dataframe(periods=data['horizon'])
            forecast = model.predict(future)
            
            # Extraire les prévisions futures
            predictions = forecast.tail(data['horizon'])
            
            # Calculer les métriques sur les données historiques
            historical_forecast = forecast[:-data['horizon']]
            mae = mean_absolute_error(df['y'], historical_forecast['yhat'])
            rmse = np.sqrt(mean_squared_error(df['y'], historical_forecast['yhat']))
            mape = np.mean(np.abs((df['y'] - historical_forecast['yhat']) / df['y'])) * 100
            r2 = r2_score(df['y'], historical_forecast['yhat'])
            
            # Générer insights et recommandations
            trend_direction = "croissance" if predictions['trend'].iloc[-1] > predictions['trend'].iloc[0] else "décroissance"
            seasonality_strength = predictions['seasonal'].std()
            
            insights = [
                f"Tendance {trend_direction} détectée",
                f"Saisonnalité {'forte' if seasonality_strength > predictions['yhat'].std() * 0.1 else 'faible'}",
                f"Précision du modèle: {100-mape:.1f}%"
            ]
            
            recommendations = [
                "Surveiller les points de changement détectés",
                "Considérer les facteurs externes dans l'analyse", 
                "Mettre à jour le modèle mensuellement pour plus de précision"
            ]
            
            result = {
                'predictions': [
                    {
                        'date': row['ds'].strftime('%Y-%m-%d'),
                        'value': max(0, row['yhat']),
                        'confidence': max(0.3, min(0.95, 1 - (row['yhat_lower'] - row['yhat_upper']) / row['yhat'])),
                        'upper_bound': max(0, row['yhat_upper']),
                        'lower_bound': max(0, row['yhat_lower'])
                    }
                    for _, row in predictions.iterrows()
                ],
                'model_metrics': {
                    'mae': round(mae, 2),
                    'rmse': round(rmse, 2),
                    'mape': round(mape, 2),
                    'r2_score': round(r2, 3)
                },
                'insights': insights,
                'recommendations': recommendations
            }
            
            return result
            
        except Exception as e:
            return self.generate_simple_forecast(data)
    
    def generate_simple_forecast(self, data):
        """Fallback simple si Prophet échoue"""
        try:
            df = pd.DataFrame(data['historicalData'])
            values = df.iloc[:, 1].values
            last_date = pd.to_datetime(df.iloc[-1, 0])
            
            # Calculer tendance simple
            if len(values) > 1:
                trend = (values[-1] - values[0]) / len(values)
            else:
                trend = 0
            
            horizon = data['horizon']
            predictions = []
            
            for i in range(horizon):
                if data['frequency'] == 'daily':
                    pred_date = last_date + timedelta(days=i+1)
                elif data['frequency'] == 'weekly':
                    pred_date = last_date + timedelta(weeks=i+1)
                else:  # monthly
                    pred_date = last_date + timedelta(days=30*(i+1))
                
                predicted = max(0, values[-1] + trend * (i + 1))
                confidence = max(0.3, 1 - (i * 0.1))
                
                predictions.append({
                    'date': pred_date.strftime('%Y-%m-%d'),
                    'value': predicted,
                    'confidence': confidence,
                    'upper_bound': predicted * (1 + 0.2),
                    'lower_bound': predicted * (1 - 0.2)
                })
            
            return {
                'predictions': predictions,
                'model_metrics': {
                    'mae': None,
                    'rmse': None, 
                    'mape': None,
                    'r2_score': None
                },
                'insights': ['Mode simplifié utilisé - tendance linéaire'],
                'recommendations': ['Collecter plus de données pour améliorer la précision']
            }
            
        except Exception as e:
            return {'error': str(e)}

# Initialiser le service
ai_service = BMSAIAnalytics()

def build_company_context(company_data: dict) -> str:
    name = company_data.get('name', 'Entreprise')
    industry = company_data.get('industry', 'Secteur')
    country = company_data.get('country', 'Pays')
    total_debit = company_data.get('total_debit', 0)
    total_credit = company_data.get('total_credit', 0)
    entry_count = company_data.get('entry_count', 0)
    last_entry_date = company_data.get('last_entry_date', 'N/A')

    return (
        f"Entreprise: {name} | Secteur: {industry} | Pays: {country}\n"
        f"Débits: {total_debit} | Crédits: {total_credit} | Écritures: {entry_count} | Dernière écriture: {last_entry_date}"
    )

def call_llm_generate(prompt: str, context: str):
    base = LLM_SERVICE_URL.rstrip('/')
    if LLM_PROVIDER == 'ollama':
        url = f"{base}/api/generate"
        payload = {
            'model': OLLAMA_MODEL,
            'prompt': f"Contexte:\n{context}\n\nQuestion:\n{prompt}",
            'stream': False
        }
    else:
        # simplified ou free utilisent /generate avec {prompt, context}
        url = f"{base}/generate"
        payload = {'prompt': prompt, 'context': context}
    return requests.post(url, json=payload, timeout=8)

def call_llm_chat(question: str, company_data: dict):
    base = LLM_SERVICE_URL.rstrip('/')
    if LLM_PROVIDER == 'ollama':
        url = f"{base}/api/chat"
        context_msg = build_company_context(company_data)
        payload = {
            'model': OLLAMA_MODEL,
            'messages': [
                {'role': 'system', 'content': context_msg},
                {'role': 'user', 'content': question}
            ],
            'stream': False
        }
    else:
        # simplified/free: /chat avec {question, companyData}
        url = f"{base}/chat"
        payload = {'question': question, 'companyData': company_data}
    return requests.post(url, json=payload, timeout=8)

@app.route('/health', methods=['GET'])
def health_check():
    """Vérification de santé du service"""
    return jsonify({
        'status': 'healthy',
        'service': 'bms-ai-analytics',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'railway': True
    })

@app.route('/api/forecast/prophet', methods=['POST'])
def prophet_forecast():
    """Endpoint pour les prévisions Prophet"""
    try:
        data = request.json
        result = ai_service.generate_prophet_forecast(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/models/status', methods=['GET'])
def models_status():
    """Statut des modèles chargés"""
    return jsonify({
        'models': ['prophet', 'kmeans', 'random_forest'],
        'status': 'ready',
        'llm_service': LLM_SERVICE_URL,
        'llm_provider': LLM_PROVIDER,
        'ollama_model': OLLAMA_MODEL if LLM_PROVIDER == 'ollama' else None,
        'railway': True
    })

@app.route('/api/llm/generate', methods=['POST'])
def llm_generate():
    """Proxy vers LLM /generate (prompt/context)"""
    try:
        data = request.get_json() or {}
        prompt = data.get('prompt', '')
        context = data.get('context', '')

        if not prompt:
            return jsonify({'error': 'Champ "prompt" requis'}), 400

        resp = call_llm_generate(prompt, context)

        if resp.status_code == 200:
            return jsonify(resp.json())
        else:
            return jsonify({'error': 'LLM generate a échoué', 'status': resp.status_code, 'details': resp.text}), 502

    except Exception as e:
        return jsonify({'error': f'Exception proxy generate: {str(e)}'}), 502

@app.route('/api/llm/chat', methods=['POST'])
def llm_chat():
    """Proxy vers LLM /chat (question/companyData), fallback sur /generate"""
    try:
        data = request.get_json() or {}
        question = data.get('question', '')
        company_data = data.get('companyData', {})

        if not question:
            return jsonify({'error': 'Champ "question" requis'}), 400

        # Essai endpoint /chat selon provider
        chat_resp = call_llm_chat(question, company_data)

        if chat_resp.status_code == 200:
            return jsonify(chat_resp.json())

        # Fallback vers /generate avec un contexte simple basé sur companyData
        context = build_company_context(company_data)
        gen_resp = call_llm_generate(question, context)

        if gen_resp.status_code == 200:
            return jsonify(gen_resp.json())
        else:
            return jsonify({
                'error': 'LLM chat/generate a échoué',
                'chat_status': chat_resp.status_code,
                'generate_status': gen_resp.status_code,
                'chat_details': chat_resp.text,
                'generate_details': gen_resp.text
            }), 502

    except Exception as e:
        return jsonify({'error': f'Exception proxy chat: {str(e)}'}), 502

@app.route('/api/llm/proxy', methods=['POST'])
def llm_proxy():
    """Proxy générique vers le service LLM: body { path, payload }"""
    try:
        data = request.get_json() or {}
        path = data.get('path', '')
        payload = data.get('payload', {})

        if not path or not isinstance(path, str) or not path.startswith('/'):
            return jsonify({'error': 'Champ "path" requis et doit commencer par /'}), 400

        url = f"{LLM_SERVICE_URL.rstrip('/')}{path}"
        resp = requests.post(url, json=payload, timeout=8)

        # Passe la réponse telle quelle si possible
        try:
            body = resp.json()
        except Exception:
            body = {'raw': resp.text}

        status = resp.status_code
        if status == 200:
            return jsonify(body)
        else:
            return jsonify({'error': 'LLM proxy a échoué', 'status': status, 'body': body}), 502

    except Exception as e:
        return jsonify({'error': f'Exception proxy LLM: {str(e)}'}), 502

if __name__ == '__main__':
    print("Demarrage du service BMS AI Analytics sur Railway...")
    print(f"Port: {PORT}")
    print(f"LLM Service: {LLM_SERVICE_URL}")
    print("Endpoints disponibles:")
    print("- POST /api/forecast/prophet")
    print("- GET /api/models/status")
    print("- GET /health")
    
    app.run(host='0.0.0.0', port=PORT, debug=False)
