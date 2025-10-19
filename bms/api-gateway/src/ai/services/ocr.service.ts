import { Injectable, HttpException } from '@nestjs/common';

@Injectable()
export class OcrService {
  async extractInvoiceData(fileBuffer: Buffer): Promise<any> {
    try {
      // Simulate OCR extraction - in production, use Tesseract, Google Vision, or AWS Textract
      const mockData = {
        invoiceNumber: 'INV-2024-001',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        supplierName: 'Acme Corp',
        supplierAddress: '123 Main St',
        supplierVat: 'FR12345678901',
        customerName: 'Client XYZ',
        items: [
          {
            description: 'Product A',
            quantity: 2,
            unitPrice: 100.00,
            vatRate: 20,
            total: 200.00,
          },
        ],
        subtotal: 200.00,
        vatAmount: 40.00,
        total: 240.00,
        currency: 'EUR',
        confidence: 0.95,
      };

      return mockData;
    } catch (error) {
      throw new HttpException('OCR extraction failed', 500);
    }
  }

  async extractReceiptData(fileBuffer: Buffer): Promise<any> {
    try {
      const mockData = {
        merchant: 'Restaurant ABC',
        date: new Date().toISOString().split('T')[0],
        time: '19:30',
        items: [
          { description: 'Meal', amount: 25.00 },
          { description: 'Drink', amount: 5.00 },
        ],
        subtotal: 30.00,
        tax: 6.00,
        total: 36.00,
        currency: 'EUR',
        paymentMethod: 'Card',
        confidence: 0.88,
      };

      return mockData;
    } catch (error) {
      throw new HttpException('Receipt OCR failed', 500);
    }
  }

  async extractBankStatement(fileBuffer: Buffer): Promise<any[]> {
    try {
      const mockTransactions = [
        {
          date: '2024-10-15',
          description: 'Payment received',
          amount: 1000.00,
          type: 'credit',
          balance: 5000.00,
        },
        {
          date: '2024-10-16',
          description: 'Supplier payment',
          amount: -500.00,
          type: 'debit',
          balance: 4500.00,
        },
      ];

      return mockTransactions;
    } catch (error) {
      throw new HttpException('Bank statement OCR failed', 500);
    }
  }

  async classifyDocument(fileBuffer: Buffer): Promise<string> {
    // Simple classification based on content patterns
    // In production, use ML model
    const types = ['invoice', 'receipt', 'bank_statement', 'contract', 'other'];
    return types[Math.floor(Math.random() * types.length)];
  }

  async processDocument(file: Express.Multer.File): Promise<any> {
    // Unified document processing method
    const documentType = await this.classifyDocument(file.buffer);
    
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
