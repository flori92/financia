const axios = require('axios');
const FormData = require('form-data');

/**
 * Service OCR Hybride - Combine OCR Space + Google Cloud Vision
 * Stratégie: Google Vision en priorité, OCR Space en fallback
 */
class OCRService {
  constructor() {
    this.googleApiKey = process.env.GOOGLE_VISION_API_KEY;
    this.ocrSpaceApiKey = process.env.OCR_SPACE_API_KEY;
    
    // Stats pour monitoring
    this.stats = {
      googleSuccess: 0,
      googleFailed: 0,
      ocrSpaceSuccess: 0,
      ocrSpaceFailed: 0
    };
  }

  /**
   * Extrait texte d'un document avec stratégie hybride
   */
  async extractDocument(fileBuffer, documentType, filename) {
    console.log(`[OCR] Extraction ${documentType} - ${filename}`);
    
    let rawText = null;
    let provider = null;
    let confidence = 0;

    // Stratégie 1: Google Vision (meilleure qualité)
    try {
      if (this.googleApiKey) {
        console.log('[OCR] Tentative Google Vision...');
        const result = await this.extractWithGoogleVision(fileBuffer);
        rawText = result.text;
        confidence = result.confidence;
        provider = 'google-vision';
        this.stats.googleSuccess++;
        console.log('[OCR] ✅ Google Vision réussi');
      }
    } catch (error) {
      console.log('[OCR] ⚠️ Google Vision échoué:', error.message);
      this.stats.googleFailed++;
    }

    // Stratégie 2: OCR Space (fallback)
    if (!rawText && this.ocrSpaceApiKey) {
      try {
        console.log('[OCR] Tentative OCR Space (fallback)...');
        const result = await this.extractWithOCRSpace(fileBuffer, filename);
        rawText = result.text;
        confidence = result.confidence;
        provider = 'ocr-space';
        this.stats.ocrSpaceSuccess++;
        console.log('[OCR] ✅ OCR Space réussi');
      } catch (error) {
        console.log('[OCR] ⚠️ OCR Space échoué:', error.message);
        this.stats.ocrSpaceFailed++;
      }
    }

    if (!rawText) {
      throw new Error('Échec extraction OCR - Tous les providers ont échoué');
    }

    // Parser selon le type de document
    const parsedData = this.parseDocument(rawText, documentType);
    
    return {
      success: true,
      provider,
      confidence,
      data: parsedData,
      rawText: rawText.substring(0, 500) // Extrait pour debug
    };
  }

  /**
   * Extraction avec Google Cloud Vision
   */
  async extractWithGoogleVision(imageBuffer) {
    const base64Image = imageBuffer.toString('base64');
    
    const response = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${this.googleApiKey}`,
      {
        requests: [
          {
            image: { content: base64Image },
            features: [
              { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
            ]
          }
        ]
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 30000
      }
    );

    if (!response.data.responses || !response.data.responses[0]) {
      throw new Error('Réponse Google Vision invalide');
    }

    const result = response.data.responses[0];
    
    if (result.error) {
      throw new Error(result.error.message || 'Erreur Google Vision');
    }

    const fullText = result.fullTextAnnotation?.text || '';
    
    // Calculer confiance moyenne
    let totalConfidence = 0;
    let wordCount = 0;
    
    if (result.fullTextAnnotation?.pages) {
      for (const page of result.fullTextAnnotation.pages) {
        for (const block of page.blocks || []) {
          if (block.confidence) {
            totalConfidence += block.confidence;
            wordCount++;
          }
        }
      }
    }
    
    const avgConfidence = wordCount > 0 ? totalConfidence / wordCount : 0.85;

    return {
      text: fullText,
      confidence: avgConfidence
    };
  }

  /**
   * Extraction avec OCR Space
   */
  async extractWithOCRSpace(imageBuffer, filename) {
    const form = new FormData();
    form.append('file', imageBuffer, { filename: filename || 'document.jpg' });
    form.append('language', 'fre'); // Français
    form.append('isOverlayRequired', 'false');
    form.append('detectOrientation', 'true');
    form.append('scale', 'true');
    form.append('OCREngine', '2'); // Engine 2 = meilleur pour documents

    const response = await axios.post(
      'https://api.ocr.space/parse/image',
      form,
      {
        headers: {
          ...form.getHeaders(),
          'apikey': this.ocrSpaceApiKey
        },
        timeout: 30000
      }
    );

    if (!response.data || response.data.IsErroredOnProcessing) {
      throw new Error(response.data?.ErrorMessage || 'Erreur OCR Space');
    }

    const parsedText = response.data.ParsedResults?.[0]?.ParsedText || '';
    
    return {
      text: parsedText,
      confidence: 0.80 // OCR Space ne fournit pas de score de confiance
    };
  }

  /**
   * Parse le texte brut selon le type de document
   */
  parseDocument(text, documentType) {
    console.log(`[OCR] Parsing ${documentType}...`);
    
    switch (documentType) {
      case 'invoice':
        return this.parseInvoice(text);
      case 'receipt':
        return this.parseReceipt(text);
      case 'bank_statement':
        return this.parseBankStatement(text);
      default:
        return { rawText: text };
    }
  }

  /**
   * Parser pour factures
   */
  parseInvoice(text) {
    const data = {
      invoiceNumber: this.extractInvoiceNumber(text),
      date: this.extractDate(text),
      supplierName: this.extractSupplier(text),
      total: this.extractTotal(text),
      subtotal: this.extractSubtotal(text),
      vatAmount: this.extractVAT(text),
      currency: this.extractCurrency(text),
      items: this.extractLineItems(text)
    };

    return data;
  }

  /**
   * Parser pour reçus
   */
  parseReceipt(text) {
    return {
      merchant: this.extractMerchant(text),
      date: this.extractDate(text),
      time: this.extractTime(text),
      total: this.extractTotal(text),
      subtotal: this.extractSubtotal(text),
      tax: this.extractVAT(text),
      currency: this.extractCurrency(text),
      paymentMethod: this.extractPaymentMethod(text),
      items: this.extractLineItems(text)
    };
  }

  /**
   * Parser pour relevés bancaires
   */
  parseBankStatement(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const transactions = [];
    
    // Pattern pour transactions: Date | Description | Montant
    const transactionPattern = /(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+([-+]?\d[\d\s,\.]+)/g;
    
    let match;
    while ((match = transactionPattern.exec(text)) !== null) {
      const amount = parseFloat(match[3].replace(/[\s,]/g, '').replace(/\./g, ''));
      transactions.push({
        date: this.parseDate(match[1]),
        description: match[2].trim(),
        amount: Math.abs(amount),
        type: amount >= 0 ? 'credit' : 'debit',
        balance: 0 // À calculer
      });
    }

    return transactions;
  }

  // ========== EXTRACTORS ==========

  extractInvoiceNumber(text) {
    const patterns = [
      /(?:Facture|Invoice|N°|No)\s*:?\s*([A-Z0-9\-\/]+)/i,
      /N°\s*(\d{4,})/i,
      /INV[-_]?(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    
    return 'N/A';
  }

  extractDate(text) {
    const patterns = [
      /(\d{2}\/\d{2}\/\d{4})/,
      /(\d{4}-\d{2}-\d{2})/,
      /(\d{2}-\d{2}-\d{4})/
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return this.parseDate(match[1]);
    }
    
    return new Date().toISOString().split('T')[0];
  }

  parseDate(dateStr) {
    // Format DD/MM/YYYY ou DD-MM-YYYY
    if (dateStr.includes('/') || dateStr.includes('-')) {
      const parts = dateStr.split(/[\/\-]/);
      if (parts[0].length === 2) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }
    return dateStr;
  }

  extractTime(text) {
    const match = text.match(/(\d{2}:\d{2})/);
    return match ? match[1] : '00:00';
  }

  extractSupplier(text) {
    const lines = text.split('\n').filter(l => l.trim());
    // Généralement le fournisseur est dans les 5 premières lignes
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 5 && line.length < 100 && !line.match(/facture|invoice|date/i)) {
        return line;
      }
    }
    return 'Fournisseur inconnu';
  }

  extractMerchant(text) {
    const lines = text.split('\n').filter(l => l.trim());
    return lines[0]?.trim() || 'Commerce inconnu';
  }

  extractTotal(text) {
    const patterns = [
      /(?:Total|TOTAL|Montant)\s*(?:TTC)?\s*:?\s*([\d\s,\.]+)\s*(?:FCFA|XOF|CFA)?/i,
      /(?:Net à payer)\s*:?\s*([\d\s,\.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/[\s,]/g, '').replace(/\./g, ''));
      }
    }
    
    return 0;
  }

  extractSubtotal(text) {
    const patterns = [
      /(?:Sous[-\s]total|Subtotal|Total HT)\s*:?\s*([\d\s,\.]+)/i,
      /(?:HT)\s*:?\s*([\d\s,\.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/[\s,]/g, '').replace(/\./g, ''));
      }
    }
    
    return 0;
  }

  extractVAT(text) {
    const patterns = [
      /(?:TVA|VAT|Tax)\s*(?:\d+%)?\s*:?\s*([\d\s,\.]+)/i,
      /(?:Taxe)\s*:?\s*([\d\s,\.]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseFloat(match[1].replace(/[\s,]/g, '').replace(/\./g, ''));
      }
    }
    
    return 0;
  }

  extractCurrency(text) {
    if (text.match(/FCFA|XOF|CFA/i)) return 'XOF';
    if (text.match(/EUR|€/i)) return 'EUR';
    if (text.match(/USD|\$/i)) return 'USD';
    return 'XOF'; // Par défaut pour l'Afrique de l'Ouest
  }

  extractPaymentMethod(text) {
    if (text.match(/carte|card|CB/i)) return 'Carte bancaire';
    if (text.match(/espèces|cash/i)) return 'Espèces';
    if (text.match(/mobile money|momo/i)) return 'Mobile Money';
    if (text.match(/virement|transfer/i)) return 'Virement';
    return 'Inconnu';
  }

  extractLineItems(text) {
    const lines = text.split('\n');
    const items = [];
    
    // Pattern pour lignes d'articles: Description Quantité Prix Total
    const itemPattern = /(.+?)\s+(\d+)\s+([\d\s,\.]+)\s+([\d\s,\.]+)/;
    
    for (const line of lines) {
      const match = line.match(itemPattern);
      if (match) {
        items.push({
          description: match[1].trim(),
          quantity: parseInt(match[2]),
          unitPrice: parseFloat(match[3].replace(/[\s,]/g, '')),
          total: parseFloat(match[4].replace(/[\s,]/g, ''))
        });
      }
    }
    
    return items;
  }

  /**
   * Obtenir statistiques d'utilisation
   */
  getStats() {
    return {
      ...this.stats,
      googleRate: this.stats.googleSuccess / (this.stats.googleSuccess + this.stats.googleFailed) || 0,
      ocrSpaceRate: this.stats.ocrSpaceSuccess / (this.stats.ocrSpaceSuccess + this.stats.ocrSpaceFailed) || 0
    };
  }
}

module.exports = OCRService;
