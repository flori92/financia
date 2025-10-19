import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as tf from '@tensorflow/tfjs-node';
import { NotificationGateway } from '../../notifications/gateways/notification.gateway';
import { BankTransaction } from '../../banking/entities/bank-transaction.entity';
import { AnomalyDetectionModel } from '../models/anomaly-detection.model';
import { TransactionAnomaly } from '../entities/transaction-anomaly.entity';

@Injectable()
export class AnomalyDetectionService {
    private readonly logger = new Logger(AnomalyDetectionService.name);
    private models: Map<string, AnomalyDetectionModel> = new Map();

    constructor(
        @InjectRepository(BankTransaction)
        private readonly transactionRepo: Repository<BankTransaction>,
        @InjectRepository(TransactionAnomaly)
        private readonly anomalyRepo: Repository<TransactionAnomaly>,
        private readonly notificationGateway: NotificationGateway
    ) {}

    async detectAnomalies(companyId: string, accountId: string) {
        // Charger ou créer le modèle pour ce compte
        let model = this.models.get(`${companyId}-${accountId}`);
        if (!model) {
            model = await this.initializeModel(companyId, accountId);
            this.models.set(`${companyId}-${accountId}`, model);
        }

        // Récupérer les transactions récentes non analysées
        const recentTransactions = await this.transactionRepo.find({
            where: {
                companyId,
                accountId,
                anomalyChecked: false
            },
            order: { date: 'DESC' }
        });

        if (recentTransactions.length === 0) {
            return { status: 'success', anomaliesDetected: 0 };
        }

        // Préparer les données pour l'analyse
        const features = this.prepareFeatures(recentTransactions);
        
        // Détecter les anomalies
        const predictions = await model.detectAnomalies(features);
        
        // Traiter les résultats
        const anomalies = [];
        for (let i = 0; i < recentTransactions.length; i++) {
            const transaction = recentTransactions[i];
            const isAnomaly = predictions[i] > model.getThreshold();

            if (isAnomaly) {
                const anomaly = this.anomalyRepo.create({
                    companyId,
                    accountId,
                    transactionId: transaction.id,
                    score: predictions[i],
                    type: this.determineAnomalyType(transaction, predictions[i]),
                    status: 'pending',
                    detectedAt: new Date()
                });

                await this.anomalyRepo.save(anomaly);
                anomalies.push(anomaly);

                // Notifier de l'anomalie
                this.notificationGateway.sendToCompany(companyId, 'anomaly_detected', {
                    accountId,
                    transactionId: transaction.id,
                    anomalyType: anomaly.type,
                    severity: this.calculateSeverity(predictions[i])
                });
            }

            // Marquer la transaction comme analysée
            await this.transactionRepo.update(transaction.id, { anomalyChecked: true });
        }

        // Mettre à jour le modèle si nécessaire
        if (recentTransactions.length > 50) {
            await this.updateModel(model, companyId, accountId);
        }

        return {
            status: 'success',
            transactionsAnalyzed: recentTransactions.length,
            anomaliesDetected: anomalies.length,
            anomalies
        };
    }

    private async initializeModel(companyId: string, accountId: string): Promise<AnomalyDetectionModel> {
        // Charger l'historique des transactions
        const historicalTransactions = await this.transactionRepo.find({
            where: {
                companyId,
                accountId,
                anomalyChecked: true
            },
            order: { date: 'DESC' },
            take: 1000 // Utiliser les 1000 dernières transactions pour l'entraînement
        });

        if (historicalTransactions.length < 100) {
            throw new Error('Insufficient historical data for model initialization');
        }

        // Créer et entraîner le modèle
        const model = new AnomalyDetectionModel();
        const features = this.prepareFeatures(historicalTransactions);
        await model.train(features);

        return model;
    }

    private async updateModel(
        model: AnomalyDetectionModel,
        companyId: string,
        accountId: string
    ): Promise<void> {
        // Récupérer les données récentes pour la mise à jour
        const recentData = await this.transactionRepo.find({
            where: {
                companyId,
                accountId,
                anomalyChecked: true
            },
            order: { date: 'DESC' },
            take: 500
        });

        const features = this.prepareFeatures(recentData);
        await model.update(features);
    }

    private prepareFeatures(transactions: BankTransaction[]): tf.Tensor2D {
        // Extraire et normaliser les caractéristiques pertinentes
        const features = transactions.map(tx => [
            tx.amount,
            this.normalizeHourOfDay(tx.date),
            this.normalizeDayOfWeek(tx.date),
            this.normalizeTransactionType(tx.type),
            ...this.extractCategoryFeatures(tx.category)
        ]);

        return tf.tensor2d(features);
    }

    private normalizeHourOfDay(date: Date): number {
        return date.getHours() / 24;
    }

    private normalizeDayOfWeek(date: Date): number {
        return date.getDay() / 7;
    }

    private normalizeTransactionType(type: string): number {
        return type === 'credit' ? 1 : 0;
    }

    private extractCategoryFeatures(category: string): number[] {
        const categories = [
            'salary', 'rent', 'food', 'transport', 'utilities',
            'telecom', 'education', 'health', 'shopping', 'other'
        ];
        return categories.map(cat => cat === category ? 1 : 0);
    }

    private determineAnomalyType(
        transaction: BankTransaction,
        anomalyScore: number
    ): string {
        if (anomalyScore > 0.9) {
            return 'critical';
        } else if (anomalyScore > 0.7) {
            return 'suspicious';
        } else {
            return 'unusual';
        }
    }

    private calculateSeverity(anomalyScore: number): 'low' | 'medium' | 'high' {
        if (anomalyScore > 0.9) {
            return 'high';
        } else if (anomalyScore > 0.7) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    async getAnomalies(
        companyId: string,
        accountId: string,
        status?: 'pending' | 'reviewed' | 'false_positive'
    ) {
        return this.anomalyRepo.find({
            where: {
                companyId,
                accountId,
                ...(status && { status })
            },
            order: { detectedAt: 'DESC' },
            relations: ['transaction']
        });
    }

    async reviewAnomaly(
        anomalyId: string,
        review: {
            status: 'reviewed' | 'false_positive';
            notes?: string;
        }
    ) {
        const anomaly = await this.anomalyRepo.findOne({
            where: { id: anomalyId }
        });

        if (!anomaly) {
            throw new Error('Anomaly not found');
        }

        anomaly.status = review.status;
        anomaly.reviewNotes = review.notes;
        anomaly.reviewedAt = new Date();

        await this.anomalyRepo.save(anomaly);

        return anomaly;
    }
}