import { Injectable } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class PrometheusService {
    private readonly registry: client.Registry;
    private readonly httpRequestDuration: client.Histogram;
    private readonly httpRequestTotal: client.Counter;
    private readonly bankSyncDuration: client.Histogram;
    private readonly bankTransactionsProcessed: client.Counter;
    private readonly bankAnomaliesDetected: client.Counter;
    private readonly activeWebsocketConnections: client.Gauge;
    private readonly notificationsSent: client.Counter;
    private readonly aiAnalysisLatency: client.Histogram;

    constructor() {
        this.registry = new client.Registry();
        
        // Métriques HTTP générales
        this.httpRequestDuration = new client.Histogram({
            name: 'http_request_duration_seconds',
            help: 'Durée des requêtes HTTP',
            labelNames: ['method', 'route', 'status']
        });

        this.httpRequestTotal = new client.Counter({
            name: 'http_requests_total',
            help: 'Nombre total de requêtes HTTP',
            labelNames: ['method', 'route', 'status']
        });

        // Métriques spécifiques aux opérations bancaires
        this.bankSyncDuration = new client.Histogram({
            name: 'bank_sync_duration_seconds',
            help: 'Durée des synchronisations bancaires',
            labelNames: ['bankCode', 'operation']
        });

        this.bankTransactionsProcessed = new client.Counter({
            name: 'bank_transactions_processed_total',
            help: 'Nombre total de transactions bancaires traitées',
            labelNames: ['bankCode', 'status']
        });

        this.bankAnomaliesDetected = new client.Counter({
            name: 'bank_anomalies_detected_total',
            help: 'Nombre total d\'anomalies bancaires détectées',
            labelNames: ['type', 'severity']
        });

        // Métriques WebSocket
        this.activeWebsocketConnections = new client.Gauge({
            name: 'websocket_connections_active',
            help: 'Nombre de connexions WebSocket actives'
        });

        // Métriques de notifications
        this.notificationsSent = new client.Counter({
            name: 'notifications_sent_total',
            help: 'Nombre total de notifications envoyées',
            labelNames: ['type', 'channel', 'priority']
        });

        // Métriques d'analyse IA
        this.aiAnalysisLatency = new client.Histogram({
            name: 'ai_analysis_latency_seconds',
            help: 'Latence des analyses IA',
            labelNames: ['operation', 'model']
        });

        // Enregistrer toutes les métriques
        this.registry.registerMetric(this.httpRequestDuration);
        this.registry.registerMetric(this.httpRequestTotal);
        this.registry.registerMetric(this.bankSyncDuration);
        this.registry.registerMetric(this.bankTransactionsProcessed);
        this.registry.registerMetric(this.bankAnomaliesDetected);
        this.registry.registerMetric(this.activeWebsocketConnections);
        this.registry.registerMetric(this.notificationsSent);
        this.registry.registerMetric(this.aiAnalysisLatency);

        // Métriques par défaut de Node.js
        this.registry.setDefaultLabels({
            app: 'bms-api-gateway'
        });
        client.collectDefaultMetrics({ register: this.registry });
    }

    async getMetrics(): Promise<string> {
        return this.registry.metrics();
    }

    // Méthodes d'instrumentation pour les requêtes HTTP
    recordHttpRequest(method: string, route: string, status: number, duration: number) {
        this.httpRequestDuration.observe({ method, route, status }, duration);
        this.httpRequestTotal.inc({ method, route, status });
    }

    // Méthodes d'instrumentation pour les opérations bancaires
    startBankSync(bankCode: string, operation: string): number {
        return Date.now();
    }

    endBankSync(bankCode: string, operation: string, startTime: number) {
        const duration = (Date.now() - startTime) / 1000;
        this.bankSyncDuration.observe({ bankCode, operation }, duration);
    }

    recordTransactionProcessed(bankCode: string, status: string) {
        this.bankTransactionsProcessed.inc({ bankCode, status });
    }

    recordAnomalyDetected(type: string, severity: string) {
        this.bankAnomaliesDetected.inc({ type, severity });
    }

    // Méthodes d'instrumentation pour WebSocket
    recordWebsocketConnection() {
        this.activeWebsocketConnections.inc();
    }

    recordWebsocketDisconnection() {
        this.activeWebsocketConnections.dec();
    }

    // Méthodes d'instrumentation pour les notifications
    recordNotificationSent(type: string, channel: string, priority: string) {
        this.notificationsSent.inc({ type, channel, priority });
    }

    // Méthodes d'instrumentation pour l'analyse IA
    startAiAnalysis(operation: string, model: string): number {
        return Date.now();
    }

    endAiAnalysis(operation: string, model: string, startTime: number) {
        const duration = (Date.now() - startTime) / 1000;
        this.aiAnalysisLatency.observe({ operation, model }, duration);
    }
}