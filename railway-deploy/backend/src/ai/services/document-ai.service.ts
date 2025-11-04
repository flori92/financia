import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class DocumentAIService {
  private readonly logger = new Logger(DocumentAIService.name);
  private readonly projectId = '791063237298';
  private readonly location = 'us';
  private readonly processorId = '72848ec2a90cd631';
  private readonly apiKey = process.env.GOOGLE_DOCUMENT_AI_API_KEY || 'AIzaSyDZ61ADn2_QzLw7ZkceKIZw8OoOYL5Fq3Q';
  private readonly endpoint = `https://${this.location}-documentai.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/processors/${this.processorId}:process`;

  constructor() {
    this.logger.log('✅ Document AI service initialisé');
  }

  /**
   * Extraction de document avec Google Document AI (plus puissant que Vision)
   */
  async extractDocumentData(fileBuffer: Buffer, mimeType: string = 'application/pdf'): Promise<any> {
    try {
      this.logger.log(`📄 Extraction Document AI - Taille: ${fileBuffer.length} bytes, Type: ${mimeType}`);

      // Préparer la requête pour Document AI
      const request = {
        skipHumanReview: true,
        rawDocument: {
          mimeType: mimeType,
          content: fileBuffer.toString('base64'),
        },
      };

      // Appeler l'API Document AI avec la clé API
      const response = await axios.post(this.endpoint, request, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json; charset=utf-8',
        },
        timeout: 30000, // 30 secondes timeout
      });

      const document = response.data.document;
      
      if (!document) {
        this.logger.warn('❌ Aucun document retourné par Document AI');
        return null;
      }

      // Extraire le texte complet
      const fullText = document.text || '';
      
      // Extraire les entités structurées
      const entities = document.entities || [];
      
      // Analyser les pages
      const pages = document.pages || [];
      
      this.logger.log(`✅ Document AI: ${pages.length} pages, ${entities.length} entités, ${fullText.length} caractères`);

      // Parser selon le type de document détecté
      const documentType = this.detectDocumentType(entities, fullText);
      const structuredData = this.parseDocumentData(documentType, entities, fullText);

      return {
        documentType,
        text: fullText,
        entities: entities.map(entity => ({
          type: entity.type,
          text: entity.textAnchor?.content || '',
          confidence: entity.confidence || 0,
        })),
        pages: pages.map(page => ({
          pageNumber: page.pageNumber || 1,
          width: page.dimension?.width || 0,
          height: page.dimension?.height || 0,
          paragraphs: page.paragraphs?.length || 0,
          lines: page.lines?.length || 0,
        })),
        structuredData,
        confidence: this.calculateOverallConfidence(entities),
        extractedAt: new Date().toISOString(),
        ocrEngine: 'google-document-ai',
      };

    } catch (error) {
      this.logger.error('❌ Erreur Document AI:', error.message);
      if (error.response) {
        this.logger.error('Response status:', error.response.status);
        this.logger.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      throw error;
    }
  }

  /**
   * Détecter le type de document à partir des entités
   */
  private detectDocumentType(entities: any[], fullText: string): string {
    // Chercher des entités spécifiques pour identifier le type
    const entityTypes = entities.map(e => e.type?.toLowerCase() || '');
    
    // Facture
    if (this.hasEntities(entityTypes, ['invoice_number', 'invoice_date', 'total_amount', 'vat_amount']) ||
        fullText.toLowerCase().includes('facture') || fullText.toLowerCase().includes('invoice')) {
      return 'invoice';
    }
    
    // Reçu
    if (this.hasEntities(entityTypes, ['receipt_number', 'merchant_name', 'transaction_date']) ||
        fullText.toLowerCase().includes('reçu') || fullText.toLowerCase().includes('ticket')) {
      return 'receipt';
    }
    
    // Relevé bancaire
    if (this.hasEntities(entityTypes, ['account_number', 'statement_date', 'balance']) ||
        fullText.toLowerCase().includes('relevé') || fullText.toLowerCase().includes('statement')) {
      return 'bank_statement';
    }
    
    // Document d'identité
    if (this.hasEntities(entityTypes, ['document_number', 'issue_date', 'expiry_date', 'full_name']) ||
        fullText.toLowerCase().includes('carte') || fullText.toLowerCase().includes('identité')) {
      return 'identity_document';
    }
    
    return 'other';
  }

  /**
   * Parser les données structurées selon le type de document
   */
  private parseDocumentData(documentType: string, entities: any[], fullText: string): any {
    const entityMap = new Map();
    entities.forEach(entity => {
      if (entity.type && entity.textAnchor?.content) {
        entityMap.set(entity.type.toLowerCase(), entity.textAnchor.content);
      }
    });

    switch (documentType) {
      case 'invoice':
        return this.parseInvoiceData(entityMap, fullText);
      case 'receipt':
        return this.parseReceiptData(entityMap, fullText);
      case 'bank_statement':
        return this.parseBankStatementData(entityMap, fullText);
      case 'identity_document':
        return this.parseIdentityData(entityMap, fullText);
      default:
        return { text: fullText, entities: Object.fromEntries(entityMap) };
    }
  }

  /**
   * Parser les données de facture
   */
  private parseInvoiceData(entityMap: Map<string, string>, fullText: string): any {
    return {
      invoiceNumber: entityMap.get('invoice_number') || this.extractInvoiceNumber(fullText),
      date: entityMap.get('invoice_date') || this.extractDate(fullText),
      dueDate: entityMap.get('due_date') || this.calculateDueDate(this.extractDate(fullText), 30),
      supplierName: entityMap.get('supplier_name') || this.extractSupplierName(fullText),
      supplierVat: entityMap.get('supplier_vat') || this.extractVatNumber(fullText),
      customerName: entityMap.get('customer_name') || 'Client',
      subtotal: this.parseAmount(entityMap.get('subtotal_amount')) || 0,
      vatAmount: this.parseAmount(entityMap.get('vat_amount')) || 0,
      total: this.parseAmount(entityMap.get('total_amount')) || this.extractTotalAmount(fullText),
      currency: this.detectCurrency(fullText),
    };
  }

  /**
   * Parser les données de reçu
   */
  private parseReceiptData(entityMap: Map<string, string>, fullText: string): any {
    return {
      merchant: entityMap.get('merchant_name') || this.extractMerchantName(fullText),
      date: entityMap.get('transaction_date') || this.extractDate(fullText),
      time: entityMap.get('transaction_time') || this.extractTime(fullText),
      subtotal: this.parseAmount(entityMap.get('subtotal_amount')) || 0,
      tax: this.parseAmount(entityMap.get('tax_amount')) || 0,
      total: this.parseAmount(entityMap.get('total_amount')) || this.extractTotalAmount(fullText),
      currency: this.detectCurrency(fullText),
      paymentMethod: entityMap.get('payment_method') || 'Non spécifié',
    };
  }

  /**
   * Parser les données de relevé bancaire
   */
  private parseBankStatementData(entityMap: Map<string, string>, fullText: string): any {
    return {
      accountNumber: entityMap.get('account_number') || this.extractAccountNumber(fullText),
      statementDate: entityMap.get('statement_date') || this.extractDate(fullText),
      balance: this.parseAmount(entityMap.get('balance')) || 0,
      transactions: this.extractTransactions(fullText),
    };
  }

  /**
   * Parser les données d'identité
   */
  private parseIdentityData(entityMap: Map<string, string>, fullText: string): any {
    return {
      fullName: entityMap.get('full_name') || this.extractFullName(fullText),
      documentNumber: entityMap.get('document_number') || this.extractDocumentNumber(fullText),
      issueDate: entityMap.get('issue_date') || this.extractDate(fullText),
      expiryDate: entityMap.get('expiry_date') || this.extractExpiryDate(fullText),
      dateOfBirth: entityMap.get('date_of_birth') || this.extractDateOfBirth(fullText),
      placeOfBirth: entityMap.get('place_of_birth') || 'Non spécifié',
    };
  }

  /**
   * Utilitaires d'extraction
   */
  private hasEntities(entityTypes: string[], keywords: string[]): boolean {
    return keywords.some(keyword => entityTypes.some(type => type.includes(keyword)));
  }

  private calculateOverallConfidence(entities: any[]): number {
    if (!entities || entities.length === 0) return 0;
    const totalConfidence = entities.reduce((sum, entity) => sum + (entity.confidence || 0), 0);
    return totalConfidence / entities.length;
  }

  private extractInvoiceNumber(text: string): string {
    const match = text.match(/(?:facture|invoice|n°|#)\s*:?\s*([A-Z0-9-]+)/i);
    return match ? match[1] : 'N/A';
  }

  private extractDate(text: string): string {
    const match = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/);
    return match ? match[1] : new Date().toISOString().split('T')[0];
  }

  private extractSupplierName(text: string): string {
    const lines = text.split('\n').filter(line => line.trim());
    return lines[0]?.trim() || 'Fournisseur inconnu';
  }

  private extractVatNumber(text: string): string {
    const patterns = [
      /NIF\s*:?\s*([A-Z0-9]+)/i,
      /TVA\s*:?\s*([A-Z]{2}\d{9,12})/i,
      /RCCM\s*:?\s*([A-Z0-9-]+)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return 'N/A';
  }

  private extractTotalAmount(text: string): number {
    const matches = text.match(/(\d+[\s,.]?\d*)\s*(?:€|EUR|EURO|\$|USD|£|GBP|FCFA|XOF|XAF)/gi) || [];
    const amounts = matches.map(m => parseFloat(m.replace(/[^\d,.]/g, '').replace(',', '.')));
    return amounts.length > 0 ? Math.max(...amounts) : 0;
  }

  private parseAmount(amountStr: string): number {
    if (!amountStr) return 0;
    return parseFloat(amountStr.replace(/[^\d,.]/g, '').replace(',', '.')) || 0;
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

  private extractMerchantName(text: string): string {
    const lines = text.split('\n').filter(line => line.trim());
    return lines[0]?.trim() || 'Commerce inconnu';
  }

  private extractTime(text: string): string {
    const match = text.match(/(\d{1,2}:\d{2})/);
    return match ? match[1] : '';
  }

  private extractAccountNumber(text: string): string {
    const match = text.match(/(?:compte|account)\s*:?\s*([A-Z0-9]+)/i);
    return match ? match[1] : 'N/A';
  }

  private extractTransactions(text: string): any[] {
    const lines = text.split('\n');
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

  private extractFullName(text: string): string {
    const match = text.match(/(?:nom|name)\s*:?\s*([A-Z\s]+)/i);
    return match ? match[1].trim() : 'Non spécifié';
  }

  private extractDocumentNumber(text: string): string {
    const match = text.match(/(?:numéro|number|n°)\s*:?\s*([A-Z0-9-]+)/i);
    return match ? match[1] : 'N/A';
  }

  private extractExpiryDate(text: string): string {
    const match = text.match(/(?:expiration|expiry|valide jusqu'au)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    return match ? match[1] : 'N/A';
  }

  private extractDateOfBirth(text: string): string {
    const match = text.match(/(?:né le|date de naissance|birth)\s*:?\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
    return match ? match[1] : 'N/A';
  }
}
