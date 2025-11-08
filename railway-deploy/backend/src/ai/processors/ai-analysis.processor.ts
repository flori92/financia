import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import * as tf from '@tensorflow/tfjs-node';

@Injectable()
@Processor('ai-analysis')
export class AIAnalysisProcessor {
    private readonly logger = new Logger(AIAnalysisProcessor.name);
    private model: tf.LayersModel;

    constructor() {
        this.initializeModel();
    }

    private async initializeModel() {
        try {
            // Charger le modèle pré-entraîné
            this.model = await tf.loadLayersModel('file://models/transaction-analysis/model.json');
            this.logger.log('Modèle AI chargé avec succès');
        } catch (error) {
            this.logger.error('Erreur lors du chargement du modèle AI', error.stack);
        }
    }

    @Process('analyze-transaction')
    async handleTransactionAnalysis(job: Job<{
        transactionId: string;
        amount: number;
        currency: string;
        description: string;
        type: string;
        category: string;
    }>) {
        try {
            const { amount, description, type, category } = job.data;

            // Prétraitement des données
            const features = await this.preprocessTransaction({
                amount,
                description,
                type,
                category
            });

            // Prédiction avec le modèle
            const prediction = await this.model.predict(features) as tf.Tensor;
            const anomalyScore = await prediction.data();

            return { anomalyScore: anomalyScore[0] };
        } catch (error) {
            this.logger.error(
                `Erreur lors de l'analyse de la transaction ${job.data.transactionId}`,
                error.stack
            );
            throw error;
        }
    }

    @Process('analyze-patterns')
    async handlePatternAnalysis(job: Job<{
        transactions: Array<{
            id: string;
            amount: number;
            currency: string;
            date: Date;
            description: string;
            type: string;
            category: string;
        }>;
    }>) {
        try {
            const { transactions } = job.data;

            // Analyse des motifs temporels
            const temporalPatterns = this.analyzeTemporalPatterns(transactions);

            // Analyse des motifs de montant
            const amountPatterns = this.analyzeAmountPatterns(transactions);

            // Analyse des motifs de description
            const descriptionPatterns = this.analyzeDescriptionPatterns(transactions);

            return {
                patterns: [
                    ...temporalPatterns,
                    ...amountPatterns,
                    ...descriptionPatterns
                ]
            };
        } catch (error) {
            this.logger.error('Erreur lors de l\'analyse des motifs', error.stack);
            throw error;
        }
    }

    @Process('detect-fraud')
    async handleFraudDetection(job: Job<{
        transactionId: string;
        amount: number;
        currency: string;
        description: string;
        type: string;
        category: string;
        date: Date;
    }>) {
        try {
            const { amount, description, type, date } = job.data;

            // Vérification des règles métier
            const rules = this.checkFraudRules({ amount, description, type, date });

            // Analyse ML pour la détection de fraude
            const mlPrediction = await this.predictFraud({
                amount,
                description,
                type,
                date
            });

            return {
                isFraudulent: mlPrediction.score > 0.8 || rules.some(r => r.severity === 'high'),
                confidence: mlPrediction.score,
                reasons: rules.map(r => r.reason)
            };
        } catch (error) {
            this.logger.error(`Erreur lors de la détection de fraude`, error.stack);
            throw error;
        }
    }

    private async preprocessTransaction(data: {
        amount: number;
        description: string;
        type: string;
        category: string;
    }): Promise<tf.Tensor> {
        // Normalisation du montant
        const normalizedAmount = this.normalizeAmount(data.amount);

        // Vectorisation de la description
        const descriptionVector = await this.vectorizeText(data.description);

        // Encodage one-hot du type et de la catégorie
        const typeVector = this.oneHotEncode(data.type, ['credit', 'debit']);
        const categoryVector = this.oneHotEncode(data.category, [
            'salary',
            'food',
            'transport',
            'utilities',
            'other'
        ]);

        // Concaténer toutes les features
        return tf.concat([
            tf.tensor([normalizedAmount]),
            descriptionVector,
            typeVector,
            categoryVector
        ]);
    }

    private normalizeAmount(amount: number): number {
        // Normalisation simple entre 0 et 1
        // TODO: Utiliser des statistiques plus robustes basées sur l'historique
        const MAX_AMOUNT = 1000000;
        return Math.min(Math.abs(amount) / MAX_AMOUNT, 1);
    }

    private async vectorizeText(text: string): Promise<tf.Tensor> {
        // TODO: Implémenter un vrai modèle de vectorisation de texte
        // Pour l'instant, retourne un vecteur simple basé sur la longueur
        return tf.tensor([
            text.length / 100, // Longueur normalisée
            text.split(' ').length / 20, // Nombre de mots normalisé
            (text.match(/\d+/g) || []).length / 5 // Nombre de chiffres normalisé
        ]);
    }

    private oneHotEncode(value: string, categories: string[]): tf.Tensor {
        const vector = new Array(categories.length).fill(0);
        const index = categories.indexOf(value);
        if (index !== -1) {
            vector[index] = 1;
        }
        return tf.tensor(vector);
    }

    private analyzeTemporalPatterns(transactions: any[]): Array<{
        type: string;
        description: string;
        confidence: number;
    }> {
        const patterns = [];
        
        // Détecter les transactions régulières
        const regularTransactions = this.detectRegularTransactions(transactions);
        if (regularTransactions.length > 0) {
            patterns.push({
                type: 'regular_transaction',
                description: 'Transactions régulières détectées',
                confidence: 0.9
            });
        }

        // Détecter les changements soudains
        const suddenChanges = this.detectSuddenChanges(transactions);
        if (suddenChanges.length > 0) {
            patterns.push({
                type: 'sudden_change',
                description: 'Changement soudain dans le comportement',
                confidence: 0.85
            });
        }

        return patterns;
    }

    private analyzeAmountPatterns(transactions: any[]): Array<{
        type: string;
        description: string;
        confidence: number;
    }> {
        const patterns = [];

        // Calculer les statistiques de base
        const amounts = transactions.map(t => t.amount);
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const stdDev = Math.sqrt(
            amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length
        );

        // Détecter les valeurs aberrantes
        const outliers = amounts.filter(a => Math.abs(a - mean) > 2 * stdDev);
        if (outliers.length > 0) {
            patterns.push({
                type: 'amount_outlier',
                description: 'Montants inhabituels détectés',
                confidence: 0.8
            });
        }

        return patterns;
    }

    private analyzeDescriptionPatterns(transactions: any[]): Array<{
        type: string;
        description: string;
        confidence: number;
    }> {
        const patterns = [];

        // Analyser les mots clés fréquents
        const descriptions = transactions.map(t => t.description.toLowerCase());
        const keywords = this.extractKeywords(descriptions);

        if (keywords.length > 0) {
            patterns.push({
                type: 'recurring_keywords',
                description: 'Motifs récurrents dans les descriptions',
                confidence: 0.75
            });
        }

        return patterns;
    }

    private detectRegularTransactions(transactions: any[]): any[] {
        // TODO: Implémenter la détection de transactions régulières
        return [];
    }

    private detectSuddenChanges(transactions: any[]): any[] {
        // TODO: Implémenter la détection de changements soudains
        return [];
    }

    private extractKeywords(descriptions: string[]): string[] {
        // TODO: Implémenter l'extraction de mots clés
        return [];
    }

    private checkFraudRules(transaction: {
        amount: number;
        description: string;
        type: string;
        date: Date;
    }): Array<{
        severity: 'low' | 'medium' | 'high';
        reason: string;
    }> {
        const rules = [];

        // Règle 1: Montants élevés
        if (transaction.amount > 10000) {
            rules.push({
                severity: 'high',
                reason: 'Montant inhabituel élevé'
            });
        }

        // Règle 2: Transactions en dehors des heures ouvrables
        const hour = transaction.date.getHours();
        if (hour < 6 || hour > 22) {
            rules.push({
                severity: 'medium',
                reason: 'Transaction effectuée en dehors des heures normales'
            });
        }

        // TODO: Ajouter plus de règles métier

        return rules;
    }

    private async predictFraud(transaction: {
        amount: number;
        description: string;
        type: string;
        date: Date;
    }): Promise<{
        score: number;
    }> {
        // TODO: Implémenter la prédiction ML pour la fraude
        return { score: 0 };
    }
}