#!/usr/bin/env python3
"""
BMS AI Analytics Service - Railway Production
Service Flask avec Prophet, scikit-learn et intégration LLM local
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
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
        'railway': True
    })

if __name__ == '__main__':
    print("🚀 Démarrage du service BMS AI Analytics sur Railway...")
    print(f"Port: {PORT}")
    print(f"LLM Service: {LLM_SERVICE_URL}")
    print("Endpoints disponibles:")
    print("- POST /api/forecast/prophet")
    print("- GET /api/models/status")
    print("- GET /health")
    
    app.run(host='0.0.0.0', port=PORT, debug=False)
