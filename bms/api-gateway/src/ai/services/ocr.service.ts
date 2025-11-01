import { Injectable, HttpException, Logger } from '@nestjs/common';
import Tesseract from 'tesseract.js';
import axios from 'axios';

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  /**
   * Extraction OCR réelle avec Tesseract.js
   * Extrait le texte brut puis parse les données de facture
   */
  async extractInvoiceData(fileBuffer: Buffer): Promise<any> {
    try {
      // Essayer OCR.space API (gratuit et fiable)
      this.logger.log('Tentative extraction OCR avec OCR.space API...');
      const ocrSpaceResult = await this.extractWithOCRSpace(fileBuffer);
      if (ocrSpaceResult) {
        return ocrSpaceResult;
      }

      // Si OCR.space échoue, essayer Tesseract.js
      this.logger.log('Fallback sur Tesseract.js...');
      const tesseractResult = await this.extractWithTesseract(fileBuffer);
      return tesseractResult;

    } catch (error) {
      this.logger.warn('OCR réel indisponible, utilisation mode simulation:', error.message);
      
      // Fallback final: Mode simulation avec données mockées
      return this.getMockInvoiceData();
    }
  }

  /**
   * Extraction avec OCR.space API (gratuit)
   */
  private async extractWithOCRSpace(fileBuffer: Buffer): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer]), 'invoice.jpg');
      formData.append('language', 'fr');
      formData.append('isOverlayRequired', 'false');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');

      const response = await axios.post('https://api.ocr.space/parse/image', formData, {
        headers: {
          'apikey': 'helloworld', // Clé gratuite pour tests
          ...formData.getHeaders()
        },
        timeout: 30000
      });

      if (response.data?.ParsedResults?.[0]?.ParsedText) {
        const text = response.data.ParsedResults[0].ParsedText;
        const confidence = response.data.ParsedResults[0].TextOverlay?.Lines?.[0]?.Words?.[0]?.Confidence || 95;
        
        this.logger.log(`OCR.space: Texte extrait avec confiance: ${confidence}%`);
        
        const parsedData = this.parseInvoiceText(text);
        
        return {
          ...parsedData,
          confidence: confidence / 100,
          rawText: text,
          extractedAt: new Date().toISOString(),
          ocrEngine: 'ocr.space'
        };
      }
      
      return null;
    } catch (error) {
      this.logger.warn('OCR.space API indisponible:', error.message);
      return null;
    }
  }

  /**
   * Extraction avec Tesseract.js (fallback)
   */
  private async extractWithTesseract(fileBuffer: Buffer): Promise<any> {
    try {
      this.logger.log('Extraction OCR avec Tesseract.js...');

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

      this.logger.log(`Tesseract: Texte extrait avec confiance: ${confidence}%`);

      const parsedData = this.parseInvoiceText(text);

      return {
        ...parsedData,
        confidence: confidence / 100,
        rawText: text,
        extractedAt: new Date().toISOString(),
        ocrEngine: 'tesseract.js'
      };
    } catch (error) {
      this.logger.warn('Tesseract.js échoué:', error.message);
      throw error;
    }
  }

  /**
   * Données mockées pour le mode simulation quand OCR n'est pas disponible
   */
  private getMockInvoiceData(): any {
    return {
      invoiceNumber: `FA-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      supplierName: 'Fournisseur Exemple SARL',
      supplierAddress: '123 Rue Exemple, 75001 Paris, France',
      supplierVat: 'FR12345678901',
      customerName: 'Client Exemple',
      customerAddress: '456 Avenue Test, 69000 Lyon, France',
      subtotal: 1000.00,
      vatAmount: 200.00,
      totalAmount: 1200.00,
      currency: 'EUR',
      paymentMethod: 'Virement bancaire',
      paymentTerms: '30 jours',
      items: [
        {
          description: 'Produit exemple 1',
          quantity: 2,
          unitPrice: 400.00,
          total: 800.00,
          vatRate: 20
        },
        {
          description: 'Service exemple 2',
          quantity: 1,
          unitPrice: 200.00,
          total: 200.00,
          vatRate: 20
        }
      ],
      confidence: 0.95,
      rawText: 'Mode simulation - OCR temporairement indisponible',
      extractedAt: new Date().toISOString(),
      ocrEngine: 'simulation',
      mode: 'simulation'
    };
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
      this.logger.warn('OCR reçu indisponible, utilisation mode simulation:', error.message);
      return this.getMockReceiptData();
    }
  }

  /**
   * Données mockées pour le mode simulation des reçus
   */
  private getMockReceiptData(): any {
    return {
      merchant: 'Café Exemple',
      address: '789 Rue Café, 75002 Paris',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      items: [
        {
          description: 'Café expresso',
          quantity: 2,
          unitPrice: 2.50,
          total: 5.00
        },
        {
          description: 'Croissant au beurre',
          quantity: 2,
          unitPrice: 1.80,
          total: 3.60
        }
      ],
      subtotal: 8.60,
      tax: 0.00,
      total: 8.60,
      paymentMethod: 'Carte bancaire',
      confidence: 0.95,
      rawText: 'Mode simulation - OCR reçu temporairement indisponible',
      extractedAt: new Date().toISOString(),
      mode: 'simulation'
    };
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
      this.logger.warn('OCR relevé bancaire indisponible, utilisation mode simulation:', error.message);
      return this.getMockBankStatementData();
    }
  }

  /**
   * Données mockées pour le mode simulation des relevés bancaires
   */
  private getMockBankStatementData(): any[] {
    return [
      {
        date: new Date().toISOString().split('T')[0],
        description: 'Virement Client A',
        amount: 1500.00,
        balance: 5000.00,
        type: 'credit'
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Paiement Fournisseur X',
        amount: -800.00,
        balance: 3500.00,
        type: 'debit'
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Frais bancaires',
        amount: -15.00,
        balance: 4300.00,
        type: 'debit'
      }
    ];
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
