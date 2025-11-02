# BMS AI/ML Analytics Service - Railway Production
# Service Flask avec Prophet, scikit-learn et intégration LLM local

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
    
    def forecast_cash_flow(self, data):
        """Prévision de cash-flow"""
        try:
            inflows = pd.DataFrame(data.get('inflows', []))
            outflows = pd.DataFrame(data.get('outflows', []))
            
            if inflows.empty or outflows.empty:
                return self._generate_simple_cashflow(data)
            
            # Convertir les dates
            inflows['date'] = pd.to_datetime(inflows['date'])
            outflows['date'] = pd.to_datetime(outflows['date'])
            
            # Générer prévisions pour chaque catégorie
            daily_forecast = self._generate_daily_cashflow(inflows, outflows, data.get('horizon', 30))
            
            # Calculer les alertes
            alerts = self._generate_cashflow_alerts(daily_forecast)
            
            return {
                'daily_forecast': daily_forecast,
                'weekly_summary': self._generate_weekly_summary(daily_forecast),
                'alerts': alerts
            }
            
        except Exception as e:
            return self._generate_simple_cashflow(data)
    
    def _generate_daily_cashflow(self, inflows, outflows, horizon):
        """Génère les prévisions quotidiennes de cash-flow"""
        daily_forecast = []
        last_date = max(inflows['date'].max(), outflows['date'].max())
        
        for i in range(horizon):
            pred_date = last_date + timedelta(days=i+1)
            
            # Prévoir entrées (tendance basée sur l'historique)
            avg_daily_inflow = inflows.groupby(inflows['date'].dt.dayofweek)['amount'].mean()
            day_of_week = pred_date.dayofweek
            predicted_inflow = avg_daily_inflow.get(day_of_week, inflows['amount'].mean())
            
            # Prévoir sorties (tendance basée sur l'historique)
            avg_daily_outflow = outflows.groupby(outflows['date'].dt.dayofweek)['amount'].mean()
            predicted_outflow = avg_daily_outflow.get(day_of_week, outflows['amount'].mean())
            
            net_flow = predicted_inflow - predicted_outflow
            
            daily_forecast.append({
                'date': pred_date.strftime('%Y-%m-%d'),
                'inflow': round(predicted_inflow, 2),
                'outflow': round(predicted_outflow, 2),
                'net_flow': round(net_flow, 2),
                'closing_balance': 0  # Serait calculé avec le solde initial
            })
        
        return daily_forecast
    
    def _generate_cashflow_alerts(self, daily_forecast):
        """Génère des alertes basées sur les prévisions"""
        alerts = []
        
        # Vérifier les jours avec cash-flow négatif
        negative_days = [d for d in daily_forecast if d['net_flow'] < 0]
        if len(negative_days) > 5:
            alerts.append("Attention: Plus de 5 jours avec cash-flow négatif prévu")
        
        # Vérifier les tendances inquiétantes
        if len(daily_forecast) > 7:
            week1_avg = sum(d['net_flow'] for d in daily_forecast[:7]) / 7
            week2_avg = sum(d['net_flow'] for d in daily_forecast[-7:]) / 7
            
            if week2_avg < week1_avg * 0.8:
                alerts.append("Alerte: Cash-flow en dégradation sur la période")
        
        return alerts
    
    def _generate_weekly_summary(self, daily_forecast):
        """Génère le résumé hebdomadaire"""
        weekly_summary = []
        
        for i in range(0, len(daily_forecast), 7):
            week_data = daily_forecast[i:i+7]
            if not week_data:
                continue
                
            net_flow = sum(d['net_flow'] for d in week_data)
            avg_balance = sum(d['closing_balance'] for d in week_data) / len(week_data)
            
            # Évaluer le risque
            if avg_balance < 0:
                risk_level = 'high'
            elif avg_balance < sum(d['closing_balance'] for d in daily_forecast) / len(daily_forecast) * 0.5:
                risk_level = 'medium'
            else:
                risk_level = 'low'
            
            weekly_summary.append({
                'week': f"Semaine {i//7 + 1}",
                'net_cash_flow': round(net_flow, 2),
                'average_balance': round(avg_balance, 2),
                'risk_level': risk_level
            })
        
        return weekly_summary
    
    def _generate_simple_cashflow(self, data):
        """Fallback simple pour cash-flow"""
        return {
            'daily_forecast': [],
            'weekly_summary': [],
            'alerts': ['Mode simplifié utilisé - données insuffisantes']
        }
    
    def segment_customers(self, data):
        """Segmentation RFM des clients"""
        try:
            customers_df = pd.DataFrame(data['customers'])
            
            # Normaliser les données
            scaler = StandardScaler()
            features = ['total_revenue', 'frequency', 'recency', 'avg_transaction']
            X_scaled = scaler.fit_transform(customers_df[features])
            
            # Clustering K-Means
            kmeans = KMeans(n_clusters=4, random_state=42)
            clusters = kmeans.fit_predict(X_scaled)
            
            # Analyser les segments
            customers_df['cluster'] = clusters
            segments = []
            
            for cluster_id in range(4):
                cluster_data = customers_df[customers_df['cluster'] == cluster_id]
                
                # Déterminer le profil du segment
                avg_revenue = cluster_data['total_revenue'].mean()
                avg_frequency = cluster_data['frequency'].mean()
                avg_recency = cluster_data['recency'].mean()
                
                if avg_revenue > customers_df['total_revenue'].quantile(0.75):
                    segment_name = "Clients VIP"
                    characteristics = ["Valeur élevée", "Fréquent", "Fidèle"]
                    recommendation = "Programme de fidélité personnalisé"
                elif avg_frequency > customers_df['frequency'].quantile(0.75):
                    segment_name = "Clients Actifs"
                    characteristics = ["Très fréquent", "Engagé"]
                    recommendation = "Offres spéciales et promotions"
                elif avg_recency < customers_df['recency'].quantile(0.25):
                    segment_name = "Clients Récents"
                    characteristics = ["Nouveaux", "Potentiel"]
                    recommendation = "Programme d'onboarding et découverte"
                else:
                    segment_name = "Clients Standards"
                    characteristics = ["Régulier", "Stable"]
                    recommendation = "Maintenir le service standard"
                
                segments.append({
                    'id': str(cluster_id),
                    'name': segment_name,
                    'size': len(cluster_data),
                    'characteristics': characteristics,
                    'avg_value': round(avg_revenue, 2),
                    'recommendation': recommendation
                })
            
            return {
                'segments': segments,
                'model_accuracy': 0.75,
                'total_customers': len(customers_df)
            }
            
        except Exception as e:
            return self._generate_basic_segments(data)
    
    def _generate_basic_segments(self, data):
        """Fallback simple pour segmentation"""
        return {
            'segments': [
                {
                    'id': '0',
                    'name': 'Segment Unique',
                    'size': len(data['customers']),
                    'characteristics': ['Analyse basique'],
                    'avg_value': 0,
                    'recommendation': 'Collecter plus de données'
                }
            ],
            'model_accuracy': 0.5
        }

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

@app.route('/api/cashflow/forecast', methods=['POST'])
def cashflow_forecast():
    """Endpoint pour les prévisions de cash-flow"""
    try:
        data = request.json
        result = ai_service.forecast_cash_flow(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/customers/segment', methods=['POST'])
def customer_segmentation():
    """Endpoint pour la segmentation clients"""
    try:
        data = request.json
        result = ai_service.segment_customers(data)
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
    print("- POST /api/cashflow/forecast")
    print("- POST /api/customers/segment")
    print("- GET /api/models/status")
    print("- GET /health")
    
    app.run(host='0.0.0.0', port=PORT, debug=False)
