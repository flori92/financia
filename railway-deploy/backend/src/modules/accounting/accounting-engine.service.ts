import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountingEngineService {
  
  validateDoubleEntry(lines: any[]): { valid: boolean; error?: string } {
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return { valid: false, error: `Déséquilibre: Débit ${totalDebit} ≠ Crédit ${totalCredit}` };
    }
    return { valid: true };
  }

  generateSaleEntry(invoice: any): any {
    return {
      entryDate: invoice.invoiceDate,
      reference: invoice.invoiceNumber,
      description: `Vente - ${invoice.customerName}`,
      journalCode: 'VT',
      lines: [
        { accountNumber: '411000', debit: invoice.totalAmount, credit: 0, label: `Facture ${invoice.invoiceNumber}` },
        { accountNumber: '701000', debit: 0, credit: invoice.subtotal, label: `Vente ${invoice.invoiceNumber}` },
        ...(invoice.vatAmount > 0 ? [{ accountNumber: '443100', debit: 0, credit: invoice.vatAmount, label: 'TVA collectée' }] : [])
      ]
    };
  }

  generatePurchaseEntry(bill: any): any {
    return {
      entryDate: bill.billDate,
      reference: bill.billNumber,
      description: `Achat - ${bill.supplierName}`,
      journalCode: 'AC',
      lines: [
        { accountNumber: '601000', debit: bill.subtotal, credit: 0, label: `Achat ${bill.billNumber}` },
        ...(bill.vatAmount > 0 ? [{ accountNumber: '445200', debit: bill.vatAmount, credit: 0, label: 'TVA déductible' }] : []),
        { accountNumber: '401000', debit: 0, credit: bill.totalAmount, label: `Facture ${bill.billNumber}` }
      ]
    };
  }

  generateCustomerPaymentEntry(payment: any): any {
    const accountNumber = payment.method === 'cash' ? '531000' : '512000';
    return {
      entryDate: payment.paymentDate,
      reference: payment.reference,
      description: `Encaissement - ${payment.customerName}`,
      journalCode: 'BQ',
      lines: [
        { accountNumber, debit: payment.amount, credit: 0, label: `Encaissement ${payment.customerName}` },
        { accountNumber: '411000', debit: 0, credit: payment.amount, label: `Règlement ${payment.customerName}`, reconciliationKey: payment.invoiceNumber }
      ]
    };
  }

  calculateAccountBalance(lines: any[]): number {
    const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return totalDebit - totalCredit;
  }
}
