import { Injectable, HttpException, Logger } from '@nestjs/common';
import Tesseract from 'tesseract.js';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  /**
   * Extraction OCR réelle avec Tesseract.js
   * Extrait le texte brut puis parse les données de facture
   */
  async extractInvoiceData(fileBuffer: Buffer): Promise<any> {
    try {
      this.logger.log('Démarrage extraction OCR avec Tesseract.js...');

      // Extraction du texte avec Tesseract
      const { data: { text, confidence } } = await Tesseract.recognize(
        fileBuffer,
        'fra+eng', // Français + Anglais
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              this.logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      this.logger.log(`Texte extrait avec confiance: ${confidence}%`);

      // Parsing intelligent du texte extrait
      const parsedData = this.parseInvoiceText(text);

      return {
        ...parsedData,
        confidence: confidence / 100,
        rawText: text,
        extractedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Erreur extraction OCR:', error);
      throw new HttpException(`OCR extraction failed: ${error.message}`, 500);
    }
  }

  /**
   * Parse le texte OCR pour extraire les données structurées de facture
   */
  private parseInvoiceText(text: string): any {
    const lines = text.split('\n').filter(line => line.trim());

    // Extraction numéro de facture
    const invoiceNumberMatch = text.match(/(?:facture|invoice|n°|#)\s*:?\s*([A-Z0-9-]+)/i);
    const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[1] : 'N/A';

    // Extraction dates (format DD/MM/YYYY ou YYYY-MM-DD)
    const dateMatches = text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g) || [];
    const date = dateMatches[0] || new Date().toISOString().split('T')[0];

    // Extraction montants (cherche les patterns de prix)
    const amountMatches = text.match(/(\d+[\s,.]?\d*)\s*(?:€|EUR|FCFA|XOF)/gi) || [];
    const amounts = amountMatches.map(m => parseFloat(m.replace(/[^\d,.]/g, '').replace(',', '.')));

    // Le montant total est généralement le plus grand
    const total = amounts.length > 0 ? Math.max(...amounts) : 0;

    // Extraction TVA (pattern commun : TVA 20% ou TVA: 40.00)
    const vatMatch = text.match(/TVA\s*:?\s*(\d+[\s,.]?\d*)/i);
    const vatAmount = vatMatch ? parseFloat(vatMatch[1].replace(',', '.')) : total * 0.18; // Default 18%

    const subtotal = total - vatAmount;

    // Extraction nom fournisseur (généralement dans les premières lignes)
    const supplierName = lines[0]?.trim() || 'Fournisseur inconnu';

    // Items basiques (à améliorer selon le format de facture)
    const items = this.extractItems(text);

    return {
      invoiceNumber,
      date,
      dueDate: this.calculateDueDate(date, 30),
      supplierName,
      supplierAddress: 'Adresse extraite du texte',
      supplierVat: this.extractVatNumber(text),
      customerName: 'Client',
      items,
      subtotal,
      vatAmount,
      total,
      currency: 'FCFA',
    };
  }

  /**
   * Extrait les lignes d'articles de la facture
   */
  private extractItems(text: string): any[] {
    // Pattern basique : cherche des lignes avec quantité, description et prix
    const itemPattern = /(\d+)\s+([A-Za-zÀ-ÿ\s]+)\s+(\d+[\s,.]?\d*)/g;
    const matches = [...text.matchAll(itemPattern)];

    if (matches.length === 0) {
      return [{
        description: 'Article extrait du document',
        quantity: 1,
        unitPrice: 0,
        vatRate: 18,
        total: 0,
      }];
    }

    return matches.slice(0, 5).map(match => ({
      description: match[2].trim(),
      quantity: parseInt(match[1]),
      unitPrice: parseFloat(match[3].replace(',', '.')),
      vatRate: 18,
      total: parseInt(match[1]) * parseFloat(match[3].replace(',', '.')),
    }));
  }

  /**
   * Extrait le numéro de TVA (patterns européens et africains)
   */
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

  /**
   * Calcule la date d'échéance
   */
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

  /**
   * Extraction OCR de reçu avec Tesseract.js
   */
  async extractReceiptData(fileBuffer: Buffer): Promise<any> {
    try {
      this.logger.log('Extraction OCR reçu avec Tesseract.js...');

      const { data: { text, confidence } } = await Tesseract.recognize(
        fileBuffer,
        'fra+eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              this.logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      this.logger.log(`Reçu extrait avec confiance: ${confidence}%`);

      return this.parseReceiptText(text, confidence);
    } catch (error) {
      this.logger.error('Erreur extraction reçu:', error);
      throw new HttpException(`Receipt OCR failed: ${error.message}`, 500);
    }
  }

  /**
   * Parse le texte d'un reçu
   */
  private parseReceiptText(text: string, confidence: number): any {
    const lines = text.split('\n').filter(line => line.trim());

    // Extraction du nom du commerce (généralement en haut)
    const merchant = lines[0]?.trim() || 'Commerce inconnu';

    // Extraction date et heure
    const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    const timeMatch = text.match(/(\d{1,2}:\d{2})/);
    const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0];
    const time = timeMatch ? timeMatch[1] : '';

    // Extraction des articles et montants
    const items = lines
      .filter(line => /\d+[,.]?\d*\s*(?:€|EUR|FCFA|XOF)/i.test(line))
      .map(line => {
        const amountMatch = line.match(/(\d+[,.]?\d*)\s*(?:€|EUR|FCFA|XOF)/i);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : 0;
        const description = line.replace(/\d+[,.]?\d*\s*(?:€|EUR|FCFA|XOF)/i, '').trim();
        return { description: description || 'Article', amount };
      });

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    
    // Extraction taxe/TVA
    const taxMatch = text.match(/(?:tax|tva|taxe)\s*:?\s*(\d+[,.]?\d*)/i);
    const tax = taxMatch ? parseFloat(taxMatch[1].replace(',', '.')) : subtotal * 0.18;

    const total = subtotal + tax;

    // Extraction mode de paiement
    const paymentMethods = ['card', 'carte', 'cash', 'espèces', 'cheque', 'chèque'];
    const paymentMethod = paymentMethods.find(method => 
      text.toLowerCase().includes(method)
    ) || 'Non spécifié';

    return {
      merchant,
      date,
      time,
      items,
      subtotal,
      tax,
      total,
      currency: 'FCFA',
      paymentMethod,
      confidence: confidence / 100,
      rawText: text,
    };
  }

  /**
   * Extraction OCR de relevé bancaire avec Tesseract.js
   */
  async extractBankStatement(fileBuffer: Buffer): Promise<any[]> {
    try {
      this.logger.log('Extraction OCR relevé bancaire avec Tesseract.js...');

      const { data: { text, confidence } } = await Tesseract.recognize(
        fileBuffer,
        'fra+eng',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              this.logger.debug(`OCR Progress: ${Math.round(m.progress * 100)}%`);
            }
          },
        }
      );

      this.logger.log(`Relevé extrait avec confiance: ${confidence}%`);

      return this.parseBankStatementText(text);
    } catch (error) {
      this.logger.error('Erreur extraction relevé bancaire:', error);
      throw new HttpException(`Bank statement OCR failed: ${error.message}`, 500);
    }
  }

  /**
   * Parse le texte d'un relevé bancaire
   */
  private parseBankStatementText(text: string): any[] {
    const lines = text.split('\n').filter(line => line.trim());
    const transactions: any[] = [];

    // Pattern pour détecter une ligne de transaction
    // Format: date description montant solde
    const transactionPattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+([\-+]?\d+[,.]?\d*)\s+(\d+[,.]?\d*)/;

    let currentBalance = 0;

    for (const line of lines) {
      const match = line.match(transactionPattern);
      if (match) {
        const [, date, description, amountStr, balanceStr] = match;
        const amount = parseFloat(amountStr.replace(',', '.'));
        const balance = parseFloat(balanceStr.replace(',', '.'));

        transactions.push({
          date,
          description: description.trim(),
          amount,
          type: amount >= 0 ? 'credit' : 'debit',
          balance,
        });

        currentBalance = balance;
      }
    }

    // Si aucune transaction détectée, retourner une structure vide
    if (transactions.length === 0) {
      this.logger.warn('Aucune transaction détectée dans le relevé');
      return [{
        date: new Date().toISOString().split('T')[0],
        description: 'Extraction partielle - vérifier le document',
        amount: 0,
        type: 'info',
        balance: 0,
      }];
    }

    return transactions;
  }

  /**
   * Classification automatique du type de document
   */
  async classifyDocument(fileBuffer: Buffer): Promise<string> {
    try {
      // Extraction rapide du texte pour classification
      const { data: { text } } = await Tesseract.recognize(
        fileBuffer,
        'fra+eng'
      );

      const lowerText = text.toLowerCase();

      // Détection de facture
      if (lowerText.includes('facture') || lowerText.includes('invoice') || 
          lowerText.includes('n°') || lowerText.includes('tva')) {
        return 'invoice';
      }

      // Détection de reçu
      if (lowerText.includes('ticket') || lowerText.includes('reçu') || 
          lowerText.includes('receipt') || lowerText.includes('merci')) {
        return 'receipt';
      }

      // Détection de relevé bancaire
      if (lowerText.includes('relevé') || lowerText.includes('statement') || 
          lowerText.includes('solde') || lowerText.includes('balance')) {
        return 'bank_statement';
      }

      return 'other';
    } catch (error) {
      this.logger.warn('Classification failed, defaulting to invoice');
      return 'invoice';
    }
  }

  /**
   * Méthode unifiée de traitement de document
   */
  async processDocument(file: any): Promise<any> {
    // Unified document processing method
    const documentType = await this.classifyDocument(file.buffer);
    
    this.logger.log(`Document classifié comme: ${documentType}`);

    switch (documentType) {
      case 'invoice':
        return this.extractInvoiceData(file.buffer);
      case 'receipt':
        return this.extractReceiptData(file.buffer);
      case 'bank_statement':
        return this.extractBankStatement(file.buffer);
      default:
        return {
          type: documentType,
          message: 'Document processed but no specific extraction available',
        };
    }
  }
}
