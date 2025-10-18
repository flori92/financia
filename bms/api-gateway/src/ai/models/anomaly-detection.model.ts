import * as tf from '@tensorflow/tfjs-node';

export class AnomalyDetectionModel {
    private model: tf.LayersModel;
    private threshold: number = 0.7;
    private readonly inputDim = 14; // Amount + Hour + Day + Type + 10 categories

    constructor() {
        this.buildModel();
    }

    private buildModel() {
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [this.inputDim],
                    units: 32,
                    activation: 'relu'
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({
                    units: 16,
                    activation: 'relu'
                }),
                tf.layers.dropout({ rate: 0.2 }),
                tf.layers.dense({
                    units: 8,
                    activation: 'relu'
                }),
                tf.layers.dense({
                    units: 1,
                    activation: 'sigmoid'
                })
            ]
        });

        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });
    }

    async train(features: tf.Tensor2D) {
        // Normaliser les données
        const normalizedFeatures = this.normalizeFeatures(features);
        
        // Générer des labels synthétiques (supposer que la plupart des transactions sont normales)
        const labels = tf.randomUniform([features.shape[0]], 0, 0.1);

        // Entraîner le modèle
        await this.model.fit(normalizedFeatures, labels, {
            epochs: 50,
            batchSize: 32,
            validationSplit: 0.2,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}`);
                }
            }
        });

        // Calculer le seuil d'anomalie
        const predictions = this.model.predict(normalizedFeatures) as tf.Tensor;
        const scores = predictions.dataSync();
        this.threshold = this.calculateThreshold(scores);
    }

    async update(features: tf.Tensor2D) {
        const normalizedFeatures = this.normalizeFeatures(features);
        const labels = tf.randomUniform([features.shape[0]], 0, 0.1);

        await this.model.fit(normalizedFeatures, labels, {
            epochs: 10,
            batchSize: 32,
            shuffle: true
        });
    }

    async detectAnomalies(features: tf.Tensor2D): Promise<number[]> {
        const normalizedFeatures = this.normalizeFeatures(features);
        const predictions = this.model.predict(normalizedFeatures) as tf.Tensor;
        return Array.from(predictions.dataSync());
    }

    getThreshold(): number {
        return this.threshold;
    }

    private normalizeFeatures(features: tf.Tensor2D): tf.Tensor2D {
        // Normalisation min-max pour chaque caractéristique
        const min = features.min(0);
        const max = features.max(0);
        return features.sub(min).div(max.sub(min).add(tf.scalar(1e-8)));
    }

    private calculateThreshold(scores: Float32Array): number {
        // Utiliser la méthode des percentiles pour définir le seuil
        const sortedScores = Array.from(scores).sort((a, b) => a - b);
        const threshold = sortedScores[Math.floor(sortedScores.length * 0.95)];
        return Math.max(threshold, 0.7); // Au moins 0.7 pour éviter les faux positifs
    }

    async saveModel(path: string): Promise<void> {
        await this.model.save(`file://${path}`);
    }

    async loadModel(path: string): Promise<void> {
        this.model = await tf.loadLayersModel(`file://${path}`);
    }
}