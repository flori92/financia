import { Injectable, Logger } from '@nestjs/common';
import { OcrService } from './services/ocr.service';
import { OllamaRAGService } from './services/ollama-rag.service';
// import { AnomalyDetectionService } from './services/anomaly-detection.service';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly ollamaRAGService: OllamaRAGService,
    // private readonly anomalyDetection: AnomalyDetectionService,
  ) {}

  async processDocument(file: Express.Multer.File) {
    return this.ocrService.processDocument(file);
  }

  async analyzeData(data: any) {
    const transactions = Array.isArray(data?.transactions)
      ? data.transactions.filter((tx) => typeof tx?.amount === 'number' && !Number.isNaN(tx.amount))
      : [];

    if (transactions.length === 0) {
      return {
        status: 'no_data',
        message: 'Aucune transaction exploitable fournie',
      };
    }

    const absoluteAmounts = transactions.map((tx) => Math.abs(tx.amount));
    const totalAmount = absoluteAmounts.reduce((acc, amount) => acc + amount, 0);
    const averageAmount = totalAmount / transactions.length;
    const stdDeviation = this.calculateStandardDeviation(absoluteAmounts, averageAmount);
    const upperThreshold = averageAmount + 2 * stdDeviation;

    const anomalies = transactions
      .filter((tx) => Math.abs(tx.amount) > upperThreshold)
      .map((tx) => ({
        ...tx,
        reason: `Montant ${tx.amount.toFixed(2)} supérieur au seuil ${upperThreshold.toFixed(2)}`,
      }));

    const byCategory = this.groupByKey(transactions, (tx) => tx.category ?? 'unknown');
    const byType = this.groupByKey(transactions, (tx) => tx.type ?? 'unspecified');

    const dailyTotals = this.aggregateDailyTotals(transactions);
    const trend = this.buildTrendInsights(dailyTotals);

    return {
      status: 'success',
      summary: {
        transactions: transactions.length,
        totalAmount,
        averageAmount,
        standardDeviation: stdDeviation,
        upperThreshold,
      },
      distribution: {
        byCategory,
        byType,
      },
      anomalies,
      trend,
    };
  }

  /**
   * Analyse une transaction bancaire et retourne un score d'anomalie entre 0 et 1.
   * Implémentation heuristique légère en attendant un moteur IA dédié.
   */
  async analyzeBankTransaction(transaction: {
    amount: number;
    description?: string;
    type?: string;
    category?: string;
  }): Promise<number> {
    const amount = Math.abs(transaction.amount || 0);

    // Heuristique simple : montants très élevés => score plus fort
    const amountScore = Math.min(amount / 1_000_000, 1);

    // Heuristique basique sur la description
    const riskyKeywords = ['fraude', 'fraud', 'suspicious', 'soupçon'];
    const descriptionScore = transaction.description
      ? riskyKeywords.some((kw) => transaction.description!.toLowerCase().includes(kw))
        ? 0.8
        : 0
      : 0;

    // Moyenne pondérée
    const score = Math.min(amountScore * 0.6 + descriptionScore * 0.4, 1);
    this.logger.debug(`Analyse transaction bancaire - score=${score.toFixed(2)} amount=${amount}`);

    return score;
  }

  async getPrediction(data: any) {
    const transactions = Array.isArray(data?.transactions)
      ? data.transactions.filter((tx) => typeof tx?.amount === 'number' && tx?.date)
      : [];

    if (transactions.length === 0) {
      return {
        status: 'no_data',
        message: 'Aucune transaction horodatée pour réaliser une projection',
      };
    }

    const horizonDays = Number.isInteger(data?.horizonDays) ? Math.max(1, data.horizonDays) : 7;
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const dailyTotals = this.aggregateDailyTotals(sorted);

    if (dailyTotals.length === 0) {
      return {
        status: 'no_data',
        message: 'Impossible de calculer une série temporelle consolidée',
      };
    }

    const movingAverageWindow = Math.min(7, dailyTotals.length);
    const movingAverages = this.computeMovingAverage(dailyTotals, movingAverageWindow);
    const lastKnown = dailyTotals[dailyTotals.length - 1];

    const forecast = Array.from({ length: horizonDays }).map((_, index) => {
      const baseDate = new Date(lastKnown.date);
      baseDate.setDate(baseDate.getDate() + index + 1);
      const reference = movingAverages[movingAverages.length - 1] ?? lastKnown.total;
      const seasonalFactor = this.estimateSeasonalityFactor(dailyTotals, baseDate.getDay());
      return {
        date: baseDate.toISOString().split('T')[0],
        expectedAmount: Number((reference * seasonalFactor).toFixed(2)),
      };
    });

    const averageDailyAmount = dailyTotals.reduce((acc, item) => acc + item.total, 0) / dailyTotals.length;

    return {
      status: 'success',
      horizonDays,
      averageDailyAmount,
      forecast,
    };
  }

  private calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length <= 1) {
      return 0;
    }
    const variance = values.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private groupByKey<T extends Record<string, any>>(items: T[], keySelector: (item: T) => string) {
    return items.reduce<Record<string, { count: number; totalAmount: number }>>((acc, item) => {
      const key = keySelector(item);
      if (!acc[key]) {
        acc[key] = { count: 0, totalAmount: 0 };
      }
      acc[key].count += 1;
      acc[key].totalAmount += Math.abs(item.amount ?? 0);
      return acc;
    }, {});
  }

  private aggregateDailyTotals(transactions: Array<{ date?: string | Date; amount: number }>) {
    const totals = new Map<string, number>();

    transactions.forEach((tx) => {
      const date = tx.date ? new Date(tx.date) : null;
      if (!date || Number.isNaN(date.getTime())) {
        return;
      }
      const key = date.toISOString().split('T')[0];
      const current = totals.get(key) ?? 0;
      totals.set(key, current + tx.amount);
    });

    return Array.from(totals.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  private buildTrendInsights(dailyTotals: Array<{ date: string; total: number }>) {
    if (dailyTotals.length === 0) {
      return { trend: 'stable', variation: 0 };
    }

    const firstHalf = dailyTotals.slice(0, Math.floor(dailyTotals.length / 2));
    const secondHalf = dailyTotals.slice(Math.floor(dailyTotals.length / 2));
    const avgFirst = firstHalf.reduce((acc, item) => acc + item.total, 0) / (firstHalf.length || 1);
    const avgSecond = secondHalf.reduce((acc, item) => acc + item.total, 0) / (secondHalf.length || 1);
    const variation = avgFirst === 0 ? 0 : ((avgSecond - avgFirst) / Math.abs(avgFirst)) * 100;

    let trend = 'stable';
    if (variation > 10) {
      trend = 'upward';
    } else if (variation < -10) {
      trend = 'downward';
    }

    return {
      trend,
      variation,
      latestTotal: dailyTotals[dailyTotals.length - 1]?.total ?? 0,
    };
  }

  private computeMovingAverage(series: Array<{ total: number }>, window: number) {
    if (series.length === 0 || window <= 1) {
      return series.map((item) => item.total);
    }

    const result: number[] = [];
    for (let i = 0; i < series.length; i++) {
      const start = Math.max(0, i - window + 1);
      const slice = series.slice(start, i + 1);
      const average = slice.reduce((acc, item) => acc + item.total, 0) / slice.length;
      result.push(average);
    }
    return result;
  }

  private estimateSeasonalityFactor(series: Array<{ date: string; total: number }>, weekday: number) {
    const totalsForWeekday = series
      .filter((item) => new Date(item.date).getDay() === weekday)
      .map((item) => Math.abs(item.total));

    if (totalsForWeekday.length === 0) {
      return 1;
    }

    const overallAverage = series.reduce((acc, item) => acc + Math.abs(item.total), 0) / series.length;
    const weekdayAverage = totalsForWeekday.reduce((acc, value) => acc + value, 0) / totalsForWeekday.length;

    if (overallAverage === 0) {
      return 1;
    }

    const factor = weekdayAverage / overallAverage;
    return Math.min(Math.max(factor, 0.5), 1.5);
  }

  async chatResponse(content: string, context?: any) {
    this.logger.log(`💬 Chat request: "${content.substring(0, 50)}..."`);

    // Essayer d'utiliser Ollama RAG pour une réponse intelligente
    try {
      const companyId = context?.companyId || '1805bc61-7cfd-44e9-8a63-17187bf05dc7';
      
      this.logger.log(`🤖 Utilisation de Ollama RAG avec companyId: ${companyId}`);
      
      const intelligentResponse = await this.ollamaRAGService.generateIntelligentResponse(
        content,
        companyId,
      );

      return { response: intelligentResponse };
    } catch (error) {
      this.logger.warn(`⚠️ Ollama RAG indisponible, fallback sur réponses pré-configurées:`, error.message);
    }

    // Fallback: Assistant virtuel basé sur mots-clés
    const lowerContent = content.toLowerCase();
    
    // Réponses contextuelles basées sur les mots-clés
    if (lowerContent.includes('facture') || lowerContent.includes('invoice')) {
      return {
        response: "Pour gérer vos factures, je vous recommande :\n\n1. Utilisez l'OCR pour extraire automatiquement les données des factures PDF\n2. Vérifiez le numéro de facture et la TVA\n3. Créez une écriture comptable automatique (411/707+4457)\n4. Suivez le paiement dans le module de rapprochement bancaire\n\nSouhaitez-vous que je vous guide sur l'un de ces points ?"
      };
    }
    
    if (lowerContent.includes('tva') || lowerContent.includes('taxe')) {
      return {
        response: "Concernant la TVA :\n\n📊 Vous pouvez générer votre déclaration de TVA dans le module 'Déclaration TVA'\n\n• TVA collectée (compte 4457) : sur vos ventes\n• TVA déductible (compte 4456) : sur vos achats\n• TVA nette à payer = Collectée - Déductible\n\nLe système calcule automatiquement ces montants à partir de vos écritures comptables. Voulez-vous que je vous explique comment remplir votre déclaration ?"
      };
    }
    
    if (lowerContent.includes('trésorerie') || lowerContent.includes('cash') || lowerContent.includes('prévision')) {
      return {
        response: "Pour optimiser votre trésorerie :\n\n💰 Tableau de bord disponible avec :\n• Évolution sur 12 mois (graphique)\n• Ratio de liquidité\n• Top 5 clients et fournisseurs\n• Prévisions basées sur l'historique\n\n📈 Recommandations :\n1. Surveillez vos ratios (liquidité ≥ 1.5 = Excellent)\n2. Anticipez les échéances de paiement\n3. Utilisez le rapprochement bancaire pour suivre les flux\n\nSouhaitez-vous analyser un point spécifique ?"
      };
    }
    
    if (lowerContent.includes('comptable') || lowerContent.includes('écriture') || lowerContent.includes('journal')) {
      return {
        response: "Pour vos écritures comptables :\n\n📝 Le système propose :\n• Saisie en partie double (Débit = Crédit)\n• Automatisation des écritures courantes (ventes, achats, paiements)\n• Validation des écritures avant comptabilisation\n• Grand livre et balance automatiques\n\n✨ Automatisations disponibles :\n- Vente : 411 (client) / 707 (produits) + 4457 (TVA)\n- Achat : 607 (charges) / 401 (fournisseur) + 4456 (TVA)\n- Paiements clients/fournisseurs\n\nQue voulez-vous enregistrer ?"
      };
    }
    
    if (lowerContent.includes('clôture') || lowerContent.includes('bilan') || lowerContent.includes('résultat')) {
      return {
        response: "Pour la clôture comptable :\n\n🔒 Module de clôture de période disponible :\n1. Calcul automatique du résultat (Produits - Charges)\n2. Génération de l'OD de clôture\n3. Transfert vers compte 120 (Résultat)\n4. Verrouillage de la période\n\n📊 États comptables générés :\n• Balance des comptes\n• Compte de résultat (P&L)\n• Bilan (Actif/Passif)\n\n⚠️ Important : La clôture est irréversible !\n\nVoulez-vous que je vous guide étape par étape ?"
      };
    }
    
    if (lowerContent.includes('ocr') || lowerContent.includes('scan') || lowerContent.includes('extraction')) {
      return {
        response: "L'OCR de MERP :\n\n🎯 Extraction automatique depuis :\n• Factures (PDF, images)\n• Reçus\n• Relevés bancaires\n\n🔧 Technologies utilisées :\n1. OCR.space (prioritaire) - précision élevée\n2. Tesseract.js (fallback) - local et rapide\n3. Mode simulation (tests)\n\n✅ Données extraites :\n- Numéro de facture\n- Dates (émission, échéance)\n- Montants (HT, TVA, TTC)\n- Client/Fournisseur\n- Articles détaillés\n\nUploadez votre document et le système l'analysera automatiquement !"
      };
    }
    
    if (lowerContent.includes('aide') || lowerContent.includes('help') || lowerContent.includes('comment')) {
      return {
        response: "Je peux vous aider sur les sujets suivants :\n\n📚 Modules disponibles :\n• Comptabilité (écritures, plan comptable OHADA/SYSCOHADA)\n• TVA (déclaration, calculs automatiques)\n• Trésorerie (prévisions, ratios)\n• OCR (extraction documents)\n• Clôture de période\n• Rapprochement bancaire\n• États comptables (balance, P&L, bilan)\n\n💡 Posez-moi une question sur :\n- Comment enregistrer une facture ?\n- Comment calculer ma TVA ?\n- Comment analyser ma trésorerie ?\n- Comment utiliser l'OCR ?\n\nQue voulez-vous savoir ?"
      };
    }
    
    // Réponse générique pour autres questions
    return {
      response: `J'ai bien reçu votre question : "${content}"\n\nJe suis votre assistant comptable BMS et je peux vous aider avec :\n\n💼 Comptabilité & Fiscalité\n📊 Analyse financière\n💰 Gestion de trésorerie\n🤖 Automatisation des tâches\n\nPour une aide plus précise, posez-moi une question sur :\n- Factures et écritures comptables\n- Déclaration TVA\n- Prévisions de trésorerie\n- OCR et extraction de documents\n- Clôture comptable\n- États financiers\n\nComment puis-je vous assister ?`
    };
  }
}
