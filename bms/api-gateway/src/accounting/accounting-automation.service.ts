import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { AccountingService } from './accounting.service';

/**
 * Service d'automatisation des écritures comptables
 * Génère automatiquement des écritures à partir des transactions business
 */
@Injectable()
export class AccountingAutomationService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    private accountingService: AccountingService,
  ) {}

  /**
   * Génère une écriture de vente (facture client)
   * Débit: 411 Clients
   * Crédit: 707 Ventes de marchandises (ou 706 Services)
   * Crédit: 4457 TVA collectée (si TVA)
   */
  async generateSaleEntry(params: {
    companyId: string;
    invoiceNumber: string;
    invoiceDate: string;
    customerName: string;
    amountHT: number;
    vatAmount: number;
    amountTTC: number;
    serviceType?: 'goods' | 'services';
    userId: string;
  }): Promise<any> {
    const { companyId, invoiceNumber, invoiceDate, customerName, amountHT, vatAmount, amountTTC, serviceType = 'goods', userId } = params;

    // Récupérer les comptes nécessaires
    const accounts = await this.accountsRepository.find({ where: { companyId } });
    const client = accounts.find((a) => a.accountNumber === '411');
    const revenue = accounts.find((a) => a.accountNumber === (serviceType === 'services' ? '706' : '707'));
    const vatCollected = accounts.find((a) => a.accountNumber === '4457');

    if (!client || !revenue) {
      throw new Error('Comptes 411 (Clients) ou 706/707 (Produits) introuvables. Initialisez le plan comptable.');
    }

    const lines: any[] = [
      { accountId: client.id, debit: amountTTC, credit: 0, label: `Client: ${customerName}` },
      { accountId: revenue.id, debit: 0, credit: amountHT, label: `Vente ${serviceType === 'services' ? 'services' : 'marchandises'}` },
    ];

    if (vatAmount > 0 && vatCollected) {
      lines.push({ accountId: vatCollected.id, debit: 0, credit: vatAmount, label: 'TVA collectée' });
    }

    return this.accountingService.createJournalEntry({
      companyId,
      entryDate: invoiceDate,
      journalType: 'sales',
      reference: invoiceNumber,
      description: `Facture client ${invoiceNumber} - ${customerName}`,
      createdBy: userId,
      lines,
    });
  }

  /**
   * Génère une écriture d'achat (facture fournisseur)
   * Débit: 607 Achats de marchandises (ou 606 Achats non stockés)
   * Débit: 4456 TVA déductible (si TVA)
   * Crédit: 401 Fournisseurs
   */
  async generatePurchaseEntry(params: {
    companyId: string;
    invoiceNumber: string;
    invoiceDate: string;
    supplierName: string;
    amountHT: number;
    vatAmount: number;
    amountTTC: number;
    purchaseType?: 'goods' | 'services';
    userId: string;
  }): Promise<any> {
    const { companyId, invoiceNumber, invoiceDate, supplierName, amountHT, vatAmount, amountTTC, purchaseType = 'goods', userId } = params;

    const accounts = await this.accountsRepository.find({ where: { companyId } });
    const supplier = accounts.find((a) => a.accountNumber === '401');
    const expense = accounts.find((a) => a.accountNumber === (purchaseType === 'goods' ? '607' : '606'));
    const vatDeductible = accounts.find((a) => a.accountNumber === '4456');

    if (!supplier || !expense) {
      throw new Error('Comptes 401 (Fournisseurs) ou 606/607 (Achats) introuvables.');
    }

    const lines: any[] = [
      { accountId: expense.id, debit: amountHT, credit: 0, label: `Achat ${purchaseType === 'goods' ? 'marchandises' : 'services'}` },
      { accountId: supplier.id, debit: 0, credit: amountTTC, label: `Fournisseur: ${supplierName}` },
    ];

    if (vatAmount > 0 && vatDeductible) {
      lines.push({ accountId: vatDeductible.id, debit: vatAmount, credit: 0, label: 'TVA déductible' });
    }

    return this.accountingService.createJournalEntry({
      companyId,
      entryDate: invoiceDate,
      journalType: 'purchase',
      reference: invoiceNumber,
      description: `Facture fournisseur ${invoiceNumber} - ${supplierName}`,
      createdBy: userId,
      lines,
    });
  }

  /**
   * Génère une écriture d'encaissement client
   * Débit: 512 Banque (ou 531 Caisse)
   * Crédit: 411 Clients
   */
  async generateCustomerPaymentEntry(params: {
    companyId: string;
    paymentNumber: string;
    paymentDate: string;
    customerName: string;
    amount: number;
    paymentMethod: 'bank' | 'cash' | 'mobile_money';
    userId: string;
  }): Promise<any> {
    const { companyId, paymentNumber, paymentDate, customerName, amount, paymentMethod, userId } = params;

    const accounts = await this.accountsRepository.find({ where: { companyId } });
    const treasury = accounts.find((a) => a.accountNumber === (paymentMethod === 'cash' ? '531' : '512'));
    const client = accounts.find((a) => a.accountNumber === '411');

    if (!treasury || !client) {
      throw new Error('Comptes 512/531 (Trésorerie) ou 411 (Clients) introuvables.');
    }

    const lines = [
      { accountId: treasury.id, debit: amount, credit: 0, label: paymentMethod === 'cash' ? 'Caisse' : 'Banque' },
      { accountId: client.id, debit: 0, credit: amount, label: `Client: ${customerName}` },
    ];

    return this.accountingService.createJournalEntry({
      companyId,
      entryDate: paymentDate,
      journalType: 'bank',
      reference: paymentNumber,
      description: `Encaissement client ${paymentNumber} - ${customerName}`,
      createdBy: userId,
      lines,
    });
  }

  /**
   * Génère une écriture de décaissement fournisseur
   * Débit: 401 Fournisseurs
   * Crédit: 512 Banque (ou 531 Caisse)
   */
  async generateSupplierPaymentEntry(params: {
    companyId: string;
    paymentNumber: string;
    paymentDate: string;
    supplierName: string;
    amount: number;
    paymentMethod: 'bank' | 'cash' | 'mobile_money';
    userId: string;
  }): Promise<any> {
    const { companyId, paymentNumber, paymentDate, supplierName, amount, paymentMethod, userId } = params;

    const accounts = await this.accountsRepository.find({ where: { companyId } });
    const treasury = accounts.find((a) => a.accountNumber === (paymentMethod === 'cash' ? '531' : '512'));
    const supplier = accounts.find((a) => a.accountNumber === '401');

    if (!treasury || !supplier) {
      throw new Error('Comptes 512/531 (Trésorerie) ou 401 (Fournisseurs) introuvables.');
    }

    const lines = [
      { accountId: supplier.id, debit: amount, credit: 0, label: `Fournisseur: ${supplierName}` },
      { accountId: treasury.id, debit: 0, credit: amount, label: paymentMethod === 'cash' ? 'Caisse' : 'Banque' },
    ];

    return this.accountingService.createJournalEntry({
      companyId,
      entryDate: paymentDate,
      journalType: 'bank',
      reference: paymentNumber,
      description: `Décaissement fournisseur ${paymentNumber} - ${supplierName}`,
      createdBy: userId,
      lines,
    });
  }
}
