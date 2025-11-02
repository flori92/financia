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
    // TODO: Implement full anomaly detection
    return { status: 'not_implemented', message: 'Anomaly detection coming soon' };
  }

  async getPrediction(data: any) {
    // TODO: Implement prediction service
    return { status: 'not_implemented', message: 'Prediction service coming soon' };
  }

  async chatResponse(content: string, context?: any) {
    this.logger.log(` Chat request: "${content.substring(0, 50)}..."`);

    // Essayer d'utiliser Ollama RAG pour une réponse intelligente
    try {
      const companyId = context?.companyId || '1805bc61-7cfd-44e9-8a63-17187bf05dc7';
      
      this.logger.log(` Utilisation de Ollama RAG avec companyId: ${companyId}`);
      
      const intelligentResponse = await this.ollamaRAGService.generateIntelligentResponse(
        content,
        companyId,
      );

      return { response: intelligentResponse };
    } catch (error) {
      this.logger.warn(` Ollama RAG indisponible, fallback sur réponses pré-configurées:`, error.message);
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
        response: "Concernant la TVA :\n\n Vous pouvez générer votre déclaration de TVA dans le module 'Déclaration TVA'\n\n• TVA collectée (compte 4457) : sur vos ventes\n• TVA déductible (compte 4456) : sur vos achats\n• TVA nette à payer = Collectée - Déductible\n\nLe système calcule automatiquement ces montants à partir de vos écritures comptables. Voulez-vous que je vous explique comment remplir votre déclaration ?"
      };
    }
    
    if (lowerContent.includes('trésorerie') || lowerContent.includes('cash') || lowerContent.includes('prévision')) {
      return {
        response: "Pour optimiser votre trésorerie :\n\n Tableau de bord disponible avec :\n• Évolution sur 12 mois (graphique)\n• Ratio de liquidité\n• Top 5 clients et fournisseurs\n• Prévisions basées sur l'historique\n\n Recommandations :\n1. Surveillez vos ratios (liquidité ≥ 1.5 = Excellent)\n2. Anticipez les échéances de paiement\n3. Utilisez le rapprochement bancaire pour suivre les flux\n\nSouhaitez-vous analyser un point spécifique ?"
      };
    }
    
    if (lowerContent.includes('comptable') || lowerContent.includes('écriture') || lowerContent.includes('journal')) {
      return {
        response: "Pour vos écritures comptables :\n\n Le système propose :\n• Saisie en partie double (Débit = Crédit)\n• Automatisation des écritures courantes (ventes, achats, paiements)\n• Validation des écritures avant comptabilisation\n• Grand livre et balance automatiques\n\n Automatisations disponibles :\n- Vente : 411 (client) / 707 (produits) + 4457 (TVA)\n- Achat : 607 (charges) / 401 (fournisseur) + 4456 (TVA)\n- Paiements clients/fournisseurs\n\nQue voulez-vous enregistrer ?"
      };
    }
    
    if (lowerContent.includes('clôture') || lowerContent.includes('bilan') || lowerContent.includes('résultat')) {
      return {
        response: "Pour la clôture comptable :\n\n Module de clôture de période disponible :\n1. Calcul automatique du résultat (Produits - Charges)\n2. Génération de l'OD de clôture\n3. Transfert vers compte 120 (Résultat)\n4. Verrouillage de la période\n\n États comptables générés :\n• Balance des comptes\n• Compte de résultat (P&L)\n• Bilan (Actif/Passif)\n\n Important : La clôture est irréversible !\n\nVoulez-vous que je vous guide étape par étape ?"
      };
    }
    
    if (lowerContent.includes('ocr') || lowerContent.includes('scan') || lowerContent.includes('extraction')) {
      return {
        response: "L'OCR de MERP :\n\n Extraction automatique depuis :\n• Factures (PDF, images)\n• Reçus\n• Relevés bancaires\n\n Technologies utilisées :\n1. OCR.space (prioritaire) - précision élevée\n2. Tesseract.js (fallback) - local et rapide\n3. Mode simulation (tests)\n\n Données extraites :\n- Numéro de facture\n- Dates (émission, échéance)\n- Montants (HT, TVA, TTC)\n- Client/Fournisseur\n- Articles détaillés\n\nUploadez votre document et le système l'analysera automatiquement !"
      };
    }
    
    if (lowerContent.includes('aide') || lowerContent.includes('help') || lowerContent.includes('comment')) {
      return {
        response: "Je peux vous aider sur les sujets suivants :\n\n Modules disponibles :\n• Comptabilité (écritures, plan comptable OHADA/SYSCOHADA)\n• TVA (déclaration, calculs automatiques)\n• Trésorerie (prévisions, ratios)\n• OCR (extraction documents)\n• Clôture de période\n• Rapprochement bancaire\n• États comptables (balance, P&L, bilan)\n\n Posez-moi une question sur :\n- Comment enregistrer une facture ?\n- Comment calculer ma TVA ?\n- Comment analyser ma trésorerie ?\n- Comment utiliser l'OCR ?\n\nQue voulez-vous savoir ?"
      };
    }
    
    // Réponse générique pour autres questions
    return {
      response: `J'ai bien reçu votre question : "${content}"\n\nJe suis votre assistant comptable BMS et je peux vous aider avec :\n\n Comptabilité & Fiscalité\n Analyse financière\n Gestion de trésorerie\n Automatisation des tâches\n\nPour une aide plus précise, posez-moi une question sur :\n- Factures et écritures comptables\n- Déclaration TVA\n- Prévisions de trésorerie\n- OCR et extraction de documents\n- Clôture comptable\n- États financiers\n\nComment puis-je vous assister ?`
    };
  }

  /**
   * Analyse une transaction bancaire pour détecter des anomalies
   */
  async analyzeBankTransaction(params: {
    amount: number;
    description: string;
    date: Date;
    accountId: string;
    usualAmounts?: number[];
    usualCategories?: string[];
  }): Promise<{
    isAnomalous: boolean;
    riskScore: number; // 0-100
    anomalies: string[];
    suggestedCategory?: string;
    confidence: number;
  }> {
    const { amount, description, usualAmounts = [], usualCategories = [] } = params;
    
    // Calcul du score de risque
    let riskScore = 0;
    const anomalies: string[] = [];
    
    // Anomalie 1: Montant inhabituel
    if (usualAmounts.length > 0) {
      const avgAmount = usualAmounts.reduce((a, b) => a + b, 0) / usualAmounts.length;
      const deviation = Math.abs(amount - avgAmount) / avgAmount;
      
      if (deviation > 2) {
        riskScore += 40;
        anomalies.push('Montant très inhabituel');
      } else if (deviation > 1) {
        riskScore += 20;
        anomalies.push('Montant inhabituel');
      }
    }
    
    // Anomalie 2: Heure anormale (nuit/week-end)
    const transactionHour = params.date.getHours();
    const isWeekend = params.date.getDay() === 0 || params.date.getDay() === 6;
    
    if (transactionHour >= 22 || transactionHour <= 5) {
      riskScore += 15;
      anomalies.push('Transaction nocturne');
    }
    
    if (isWeekend) {
      riskScore += 10;
      anomalies.push('Transaction week-end');
    }
    
    // Anomalie 3: Description suspecte
    const suspiciousKeywords = ['urgent', 'immediate', 'secret', 'cash', 'withdrawal', 'transfer'];
    const lowerDescription = description.toLowerCase();
    
    for (const keyword of suspiciousKeywords) {
      if (lowerDescription.includes(keyword)) {
        riskScore += 10;
        anomalies.push(`Description suspecte: ${keyword}`);
        break;
      }
    }
    
    // Suggestion de catégorie basée sur la description
    let suggestedCategory: string | undefined;
    let confidence = 0.5;
    
    const categoryKeywords = {
      'salary': ['salaire', 'paie', 'salary', 'wage'],
      'rent': ['loyer', 'rent', 'housing'],
      'utilities': ['edf', 'eau', 'electricity', 'water', 'internet', 'phone'],
      'food': ['restaurant', 'carrefour', 'auchan', 'food', 'grocery'],
      'transport': ['uber', 'taxi', 'essence', 'transport', 'fuel'],
      'entertainment': ['netflix', 'spotify', 'cinema', 'movie'],
      'shopping': ['amazon', 'fnac', 'shopping', 'store']
    };
    
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => lowerDescription.includes(keyword))) {
        suggestedCategory = category;
        confidence = 0.8;
        break;
      }
    }
    
    // Limiter le score de risque à 100
    riskScore = Math.min(riskScore, 100);
    
    const isAnomalous = riskScore > 50;
    
    return {
      isAnomalous,
      riskScore,
      anomalies,
      suggestedCategory,
      confidence
    };
  }
}
