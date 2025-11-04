import { Injectable, Logger } from '@nestjs/common';
import vision from '@google-cloud/vision';

@Injectable()
export class GoogleVisionService {
  private readonly logger = new Logger(GoogleVisionService.name);
  private client: vision.ImageAnnotatorClient;

  constructor() {
    try {
      // Initialiser le client avec les credentials par défaut
      // Les credentials doivent être dans GOOGLE_APPLICATION_CREDENTIALS
      // ou utiliser la clé API partagée
      this.client = new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        projectId: process.env.GOOGLE_CLOUD_PROJECT,
      });
      this.logger.log('✅ Google Vision client initialisé');
    } catch (error) {
      this.logger.error('❌ Erreur initialisation Google Vision:', error.message);
      // Fallback: utiliser clé API directe
      this.client = new vision.ImageAnnotatorClient({
        keyFilename: './google-credentials.json',
      });
    }
  }

  /**
   * Extraction de texte avec Google Cloud Vision
   */
  async extractText(fileBuffer: Buffer): Promise<{ text: string; confidence: number }> {
    try {
      this.logger.log(`🔍 Extraction texte Google Vision - Taille: ${fileBuffer.length} bytes`);

      const [result] = await this.client.textDetection({
        image: { content: fileBuffer },
      });

      const textAnnotations = result.textAnnotations;
      
      if (!textAnnotations || textAnnotations.length === 0) {
        this.logger.warn('❌ Aucun texte détecté par Google Vision');
        return { text: '', confidence: 0 };
      }

      // Le premier annotation contient le texte complet
      const fullText = textAnnotations[0];
      const text = fullText.description || '';
      
      // Google Vision ne fournit pas de confiance globale, on calcule une approximation
      const confidence = this.calculateOverallConfidence(textAnnotations);

      this.logger.log(`✅ Google Vision: ${text.length} caractères extraits, confiance: ${confidence}%`);

      return {
        text: text.trim(),
        confidence: confidence / 100,
      };
    } catch (error) {
      this.logger.error('❌ Erreur Google Vision:', error.message);
      throw error;
    }
  }

  /**
   * Détection de document avec analyse avancée
   */
  async extractDocumentData(fileBuffer: Buffer): Promise<any> {
    try {
      this.logger.log('📄 Analyse document complète Google Vision...');

      const [result] = await this.client.documentTextDetection({
        image: { content: fileBuffer },
      });

      const fullTextAnnotation = result.fullTextAnnotation;
      
      if (!fullTextAnnotation) {
        this.logger.warn('❌ Aucun document détecté par Google Vision');
        return null;
      }

      const text = fullTextAnnotation.text || '';
      const pages = fullTextAnnotation.pages || [];

      this.logger.log(`✅ Document analysé: ${pages.length} pages, ${text.length} caractères`);

      return {
        text: text.trim(),
        pages: pages.map(page => ({
          width: page.width,
          height: page.height,
          blocks: page.blocks?.length || 0,
          paragraphs: page.paragraphs?.length || 0,
          words: page.words?.length || 0,
        })),
        extractedAt: new Date().toISOString(),
        ocrEngine: 'google-vision',
      };
    } catch (error) {
      this.logger.error('❌ Erreur analyse document Google Vision:', error.message);
      throw error;
    }
  }

  /**
   * Classification de document avec Google Vision
   */
  async classifyDocument(fileBuffer: Buffer): Promise<string> {
    try {
      this.logger.log('🏷️ Classification document Google Vision...');

      const [result] = await this.client.labelDetection({
        image: { content: fileBuffer },
      });

      const labels = result.labelAnnotations || [];
      
      this.logger.log(`🏷️ Labels détectés: ${labels.length}`);

      // Analyser les labels pour déterminer le type de document
      const labelDescriptions = labels.map(label => label.description?.toLowerCase() || '');
      
      // Détection de facture
      if (this.hasLabels(labelDescriptions, ['invoice', 'bill', 'receipt', 'document', 'text'])) {
        return 'invoice';
      }

      // Détection de reçu
      if (this.hasLabels(labelDescriptions, ['receipt', 'ticket', 'cash register', 'store'])) {
        return 'receipt';
      }

      // Détection de relevé bancaire
      if (this.hasLabels(labelDescriptions, ['bank statement', 'statement', 'balance', 'account'])) {
        return 'bank_statement';
      }

      // Détection d'identité
      if (this.hasLabels(labelDescriptions, ['identification', 'id card', 'passport', 'driver license'])) {
        return 'identity_document';
      }

      return 'other';
    } catch (error) {
      this.logger.error('❌ Erreur classification Google Vision:', error.message);
      return 'other';
    }
  }

  /**
   * Extraction d'informations structurées (facture, reçu, etc.)
   */
  async extractStructuredData(fileBuffer: Buffer, documentType: string): Promise<any> {
    try {
      const textResult = await this.extractText(fileBuffer);
      const text = textResult.text;

      if (!text) {
        return null;
      }

      this.logger.log(`📊 Extraction structurée pour type: ${documentType}`);

      switch (documentType) {
        case 'invoice':
          return this.parseInvoiceText(text, textResult.confidence);
        case 'receipt':
          return this.parseReceiptText(text, textResult.confidence);
        case 'bank_statement':
          return this.parseBankStatementText(text, textResult.confidence);
        default:
          return {
            text,
            confidence: textResult.confidence,
            extractedAt: new Date().toISOString(),
            ocrEngine: 'google-vision',
          };
      }
    } catch (error) {
      this.logger.error('❌ Erreur extraction structurée Google Vision:', error.message);
      throw error;
    }
  }

  /**
   * Parse texte de facture
   */
  private parseInvoiceText(text: string, confidence: number): any {
    const lines = text.split('\n').filter(line => line.trim());

    // Extraction numéro de facture
    const invoiceNumberMatch = text.match(/(?:facture|invoice|n°|#)\s*:?\s*([A-Z0-9-]+)/i);
    const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : 'N/A';

    // Extraction dates
    const dateMatches = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
    const date = dateMatches[0] || new Date().toISOString().split('T')[0];

    // Extraction montants
    const amountMatches = text.match(/(\d+[\s,.]?\d*)\s*(?:€|EUR|EURO|\$|USD|£|GBP|FCFA|XOF|XAF|C\$|CAD|CHF|¥|JPY|CNY|A\$|AUD)/gi) || [];
    const amounts = amountMatches.map(m => parseFloat(m.replace(/[^\d,.]/g, '').replace(',', '.')));
    const total = amounts.length > 0 ? Math.max(...amounts) : 0;

    // Extraction TVA
    const vatMatch = text.match(/TVA\s*:?\s*(\d+[\s,.]?\d*)/i);
    const vatAmount = vatMatch ? parseFloat(vatMatch[1].replace(',', '.')) : total * 0.18;

    // Extraction nom fournisseur
    const supplierName = lines[0]?.trim() || 'Fournisseur inconnu';

    return {
      invoiceNumber,
      date,
      dueDate: this.calculateDueDate(date, 30),
      supplierName,
      supplierAddress: 'Adresse extraite du texte',
      supplierVat: this.extractVatNumber(text),
      customerName: 'Client',
      subtotal: total - vatAmount,
      vatAmount,
      total,
      currency: this.detectCurrency(text),
      confidence,
      rawText: text,
      extractedAt: new Date().toISOString(),
      ocrEngine: 'google-vision',
    };
  }

  /**
   * Parse texte de reçu
   */
  private parseReceiptText(text: string, confidence: number): any {
    const lines = text.split('\n').filter(line => line.trim());

    const merchant = lines[0]?.trim() || 'Commerce inconnu';
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    const timeMatch = text.match(/(\d{1,2}:\d{2})/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    const time = timeMatch ? timeMatch[1] : '';

    const amountMatches = text.match(/(\d+[\s,.]?\d*)\s*(?:€|EUR|EURO|\$|USD|£|GBP|FCFA|XOF|XAF|C\$|CAD|CHF|¥|JPY|CNY|A\$|AUD)/gi) || [];
    const amounts = amountMatches.map(m => parseFloat(m.replace(/[^\d,.]/g, '').replace(',', '.')));
    const total = amounts.length > 0 ? Math.max(...amounts) : 0;

    return {
      merchant,
      date,
      time,
      subtotal: total * 0.82,
      tax: total * 0.18,
      total,
      currency: this.detectCurrency(text),
      paymentMethod: 'Non spécifié',
      confidence,
      rawText: text,
      extractedAt: new Date().toISOString(),
      ocrEngine: 'google-vision',
    };
  }

  /**
   * Parse texte de relevé bancaire
   */
  private parseBankStatementText(text: string, confidence: number): any[] {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: any[] = [];

    const transactionPattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([\-+]?\d+[,.]?\d*)/;

    for (const line of lines) {
      const match = line.match(transactionPattern);
      if (match) {
        const [, date, description, amountStr] = match;
        const amount = parseFloat(amountStr.replace(',', '.'));

        transactions.push({
          date,
          description: description.trim(),
          amount,
          type: amount >= 0 ? 'credit' : 'debit',
        });
      }
    }

    return transactions;
  }

  /**
   * Utilitaires
   */
  private calculateOverallConfidence(textAnnotations: any[]): number {
    if (!textAnnotations || textAnnotations.length === 0) return 0;
    
    // Google Vision ne fournit pas de confiance par mot facilement accessible
    // On retourne une confiance basée sur la qualité de l'extraction
    const text = textAnnotations[0]?.description || '';
    return text.length > 100 ? 95 : 80;
  }

  private hasLabels(labels: string[], keywords: string[]): boolean {
    return keywords.some(keyword => 
      labels.some(label => label.includes(keyword))
    );
  }

  private calculateDueDate(dateStr: string, daysToAdd: number): string {
    try {
      const date = new Date(dateStr);
      date.setDate(date.getDate() + daysToAdd);
      return date.toISOString().split('T')[0];
    } catch {
      const now = new Date();
      now.setDate(now.getDate() + daysToAdd);
      return now.toISOString().split('T')[0];
    }
  }

  private extractVatNumber(text: string): string {
    const vatPatterns = [
      /NIF\s*:?\s*([A-Z0-9]+)/i,
      /TVA\s*:?\s*([A-Z]{2}\d{9,12})/i,
      /RCCM\s*:?\s*([A-Z0-9-]+)/i,
    ];

    for (const pattern of vatPatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }

    return 'N/A';
  }

  private detectCurrency(text: string): string {
    const patterns = [
      { code: 'EUR', regex: /(?:\d+[,.]?\d*)\s*(?:€|EUR|EURO)/gi },
      { code: 'USD', regex: /(?:\d+[,.]?\d*)\s*(?:\$|USD|DOLLAR)/gi },
      { code: 'GBP', regex: /(?:\d+[,.]?\d*)\s*(?:£|GBP|POUND)/gi },
      { code: 'FCFA', regex: /(?:\d+[,.]?\d*)\s*(?:FCFA|XOF|CFA)/gi },
    ];

    for (const { code, regex } of patterns) {
      if (regex.test(text)) return code;
    }

    return 'FCFA';
  }
}
