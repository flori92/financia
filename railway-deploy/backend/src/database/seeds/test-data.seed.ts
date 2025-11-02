import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../../accounting/entities/journal-entry-line.entity';
import { Account } from '../../accounting/entities/account.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { Payment } from '../../payments/entities/payment.entity';
import { MobileMoneyTransaction } from '../../mobile-money/entities/mobile-money-transaction.entity';

@Injectable()
export class TestDataSeedService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntryRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalLineRepo: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    @InjectRepository(Invoice)
    private invoiceRepo: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentRepo: Repository<Payment>,
    @InjectRepository(MobileMoneyTransaction)
    private mobileMoneyRepo: Repository<MobileMoneyTransaction>,
  ) {}

  async seedTestData(companyId: string) {
    console.log('🌱 Création des données de test BMS...');

    // 1. Vérifier si les comptes SYSCOHADA existent
    const accounts = await this.accountRepo.find({ where: { companyId } });
    if (accounts.length === 0) {
      console.log('❌ Veuillez d\'abord exécuter le seed SYSCOHADA');
      return;
    }

    // 2. Créer des factures et paiements pour les 12 derniers mois
    await this.seedInvoicesAndPayments(companyId);
    
    // 3. Créer des écritures comptables variées
    await this.seedJournalEntries(companyId);
    
    // 4. Créer des transactions mobile money
    await this.seedMobileMoneyTransactions(companyId);

    console.log('✅ Données de test créées avec succès !');
  }

  private async seedInvoicesAndPayments(companyId: string) {
    const clients = [
      { name: 'SOCIETE GENERAL', email: 'facturation@sgb.sn', phone: '+221338995000' },
      { name: 'ECOBANK SENEGAL', email: 'comptable@ecobank.sn', phone: '+221338496000' },
      { name: 'SONATEL SA', email: 'paiements@sonatel.sn', phone: '+221338690000' },
      { name: 'SENELEC', email: 'finance@senelec.sn', phone: '+221338959000' },
      { name: 'BOUYGUES SENEGAL', email: 'billing@bouygues.sn', phone: '+221338699000' },
    ];

    const fournisseurs = [
      { name: 'FOURNISSEUR INFO TECH', email: 'contact@infotech.sn' },
      { name: 'MATERIEL BUREAU SA', email: 'commande@bureau.sn' },
      { name: 'SERVICES NETTOYAGE', email: 'services@nettoyage.sn' },
      { name: 'CARBURANT ENERGY', email: 'fuel@energy.sn' },
      { name: 'TELECOM PROVIDER', email: 'business@telecom.sn' },
    ];

    // Créer 30 factures sur 12 mois
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - Math.floor(i / 2.5));
      date.setDate(Math.floor(Math.random() * 28) + 1);

      const isClient = Math.random() > 0.3;
      const client = isClient ? clients[Math.floor(Math.random() * clients.length)] : null;
      const fournisseur = !isClient ? fournisseurs[Math.floor(Math.random() * fournisseurs.length)] : null;

      const subtotal = Math.floor(Math.random() * 5000000) + 500000;
      const vatAmount = Math.floor(Math.random() * 900000) + 100000;
      const total = subtotal + vatAmount;

      const invoice = this.invoiceRepo.create({
        companyId,
        invoiceNumber: `F${String(date.getFullYear()).slice(2)}${String(date.getMonth() + 1).padStart(2, '0')}${String(i + 1).padStart(4, '0')}`,
        issueDate: date.toISOString().split('T')[0],
        dueDate: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: Math.random() > 0.2 ? 'paid' : 'pending',
        type: isClient ? 'sale' : 'purchase',
        subtotal,
        vatAmount,
        total,
        customerName: client?.name || fournisseur?.name,
        customerEmail: client?.email || fournisseur?.email,
        customerPhone: client?.phone,
      });
      await this.invoiceRepo.save(invoice);

      // Créer un paiement pour 80% des factures
      if (Math.random() > 0.2) {
        const paymentDate = new Date(date.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000);
        const payment = this.paymentRepo.create({
          companyId,
          invoiceId: invoice.id,
          paymentNumber: `P${String(paymentDate.getFullYear()).slice(2)}${String(i + 1).padStart(5, '0')}`,
          amount: invoice.total * (0.8 + Math.random() * 0.2),
          paymentDate: paymentDate.toISOString().split('T')[0],
          paymentMethod: ['bank_transfer', 'mobile_money', 'cash', 'check'][Math.floor(Math.random() * 4)],
          status: 'completed',
          reference: `REF${String(i + 1).padStart(6, '0')}`,
        });

        await this.paymentRepo.save(payment);
      }
    }
  }

  private async seedJournalEntries(companyId: string) {
    // Récupérer les comptes SYSCOHADA
    const accounts = await this.accountRepo.find({ where: { companyId } });
    const accountMap = new Map(accounts.map(acc => [acc.accountNumber, acc]));

    // Créer des écritures variées sur 12 mois
    for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
      const currentDate = new Date();
      currentDate.setMonth(currentDate.getMonth() - monthOffset);
      
      // Nombre d'écritures par mois (varie pour simuler l'activité)
      const entriesCount = Math.floor(Math.random() * 15) + 5;

      for (let i = 0; i < entriesCount; i++) {
        const entryDate = new Date(currentDate);
        entryDate.setDate(Math.floor(Math.random() * 28) + 1);

        // Types d'écritures variés
        const entryTypes = [
          this.createSaleEntry,
          this.createPurchaseEntry,
          this.createBankOperationEntry,
          this.createExpenseEntry,
          this.createTaxEntry,
        ];

        const entryType = entryTypes[Math.floor(Math.random() * entryTypes.length)];
        await entryType.call(this, entryDate, companyId, accountMap);
      }
    }
  }

  private async createSaleEntry(date: Date, companyId: string, accountMap: Map<string, Account>) {
    const amount = Math.floor(Math.random() * 3000000) + 500000;
    const vat = Math.floor(amount * 0.18);

    const entry = this.journalEntryRepo.create({
      companyId,
      entryNumber: `EC${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      entryDate: date.toISOString().split('T')[0],
      description: 'Vente de marchandises',
      status: 'posted',
      totalDebit: amount + vat,
      totalCredit: amount + vat,
    });

    await this.journalEntryRepo.save(entry);

    // Lignes d'écriture
    const lines = [
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('411')?.id, // Clients
        debit: amount + vat,
        credit: 0,
        label: 'CLIENT FACTURE ' + entry.entryNumber,
      },
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('707')?.id, // Ventes marchandises
        debit: 0,
        credit: amount,
        label: 'VENTE MARCHANDISES',
      },
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('4457')?.id, // TVA collectée
        debit: 0,
        credit: vat,
        label: 'TVA COLLECTEE',
      },
    ];

    for (const lineData of lines) {
      if (lineData.accountId) {
        const line = this.journalLineRepo.create(lineData);
        await this.journalLineRepo.save(line);
      }
    }
  }

  private async createPurchaseEntry(date: Date, companyId: string, accountMap: Map<string, Account>) {
    const amount = Math.floor(Math.random() * 2000000) + 300000;
    const vat = Math.floor(amount * 0.18);

    const entry = this.journalEntryRepo.create({
      companyId,
      entryNumber: `EF${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      entryDate: date.toISOString().split('T')[0],
      description: 'Achat de marchandises',
      status: 'posted',
      totalDebit: amount + vat,
      totalCredit: amount + vat,
    });

    await this.journalEntryRepo.save(entry);

    const lines = [
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('607')?.id, // Achats marchandises
        debit: amount,
        credit: 0,
        label: 'ACHAT MARCHANDISES',
      },
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('4456')?.id, // TVA déductible
        debit: vat,
        credit: 0,
        label: 'TVA DEDUCTIBLE',
      },
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('401')?.id, // Fournisseurs
        debit: 0,
        credit: amount + vat,
        label: 'FOURNISSEUR FACTURE ' + entry.entryNumber,
      },
    ];

    for (const lineData of lines) {
      if (lineData.accountId) {
        const line = this.journalLineRepo.create(lineData);
        await this.journalLineRepo.save(line);
      }
    }
  }

  private async createBankOperationEntry(date: Date, companyId: string, accountMap: Map<string, Account>) {
    const amount = Math.floor(Math.random() * 5000000) + 1000000;
    const isCredit = Math.random() > 0.3;

    const entry = this.journalEntryRepo.create({
      companyId,
      entryNumber: `BK${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      entryDate: date.toISOString().split('T')[0],
      description: isCredit ? 'Encaissement client' : 'Paiement fournisseur',
      status: 'posted',
      totalDebit: isCredit ? amount : 0,
      totalCredit: isCredit ? 0 : amount,
    });

    await this.journalEntryRepo.save(entry);

    const lines = [
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('512')?.id, // Banque
        debit: isCredit ? amount : 0,
        credit: isCredit ? 0 : amount,
        label: isCredit ? 'ENCAISSEMENT BANQUE' : 'PAIEMENT BANQUE',
      },
      {
        journalEntryId: entry.id,
        accountId: isCredit ? accountMap.get('411')?.id : accountMap.get('401')?.id, // Clients ou Fournisseurs
        debit: isCredit ? 0 : amount,
        credit: isCredit ? amount : 0,
        label: isCredit ? 'REGLEMENT CLIENT' : 'REGLEMENT FOURNISSEUR',
      },
    ];

    for (const lineData of lines) {
      if (lineData.accountId) {
        const line = this.journalLineRepo.create(lineData);
        await this.journalLineRepo.save(line);
      }
    }
  }

  private async createExpenseEntry(date: Date, companyId: string, accountMap: Map<string, Account>) {
    const amount = Math.floor(Math.random() * 1000000) + 100000;

    const entry = this.journalEntryRepo.create({
      companyId,
      entryNumber: `EX${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      entryDate: date.toISOString().split('T')[0],
      description: 'Frais de fonctionnement',
      status: 'posted',
      totalDebit: amount,
      totalCredit: amount,
    });

    await this.journalEntryRepo.save(entry);

    const expenseAccounts = ['606', '607', '613', '623', '626', '631']; // Various expense accounts
    const selectedAccount = expenseAccounts[Math.floor(Math.random() * expenseAccounts.length)];

    const lines = [
      {
        journalEntryId: entry.id,
        accountId: accountMap.get(selectedAccount)?.id,
        debit: amount,
        credit: 0,
        label: 'FONCTIONNEMENT',
      },
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('512')?.id, // Banque
        debit: 0,
        credit: amount,
        label: 'PAIEMENT PAR BANQUE',
      },
    ];

    for (const lineData of lines) {
      if (lineData.accountId) {
        const line = this.journalLineRepo.create(lineData);
        await this.journalLineRepo.save(line);
      }
    }
  }

  private async createTaxEntry(date: Date, companyId: string, accountMap: Map<string, Account>) {
    const amount = Math.floor(Math.random() * 800000) + 200000;

    const entry = this.journalEntryRepo.create({
      companyId,
      entryNumber: `TX${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      entryDate: date.toISOString().split('T')[0],
      description: 'Déclaration TVA',
      status: 'posted',
      totalDebit: amount,
      totalCredit: amount,
    });

    await this.journalEntryRepo.save(entry);

    const lines = [
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('4457')?.id, // TVA collectée
        debit: amount,
        credit: 0,
        label: 'TVA A DECLARER',
      },
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('4456')?.id, // TVA déductible
        debit: 0,
        credit: Math.floor(amount * 0.7),
        label: 'TVA DEDUCTIBLE',
      },
      {
        journalEntryId: entry.id,
        accountId: accountMap.get('4455')?.id, // TVA à décaisser
        debit: 0,
        credit: Math.floor(amount * 0.3),
        label: 'TVA A DECAISSER',
      },
    ];

    for (const lineData of lines) {
      if (lineData.accountId) {
        const line = this.journalLineRepo.create(lineData);
        await this.journalLineRepo.save(line);
      }
    }
  }

  private async seedMobileMoneyTransactions(companyId: string) {
    const providers = ['mtn', 'moov', 'orange', 'wave', 'kkiapay', 'fedapay'];
    const statuses = ['success', 'failed', 'pending', 'processing'];
    
    // Créer 50 transactions mobile money sur 3 mois
    for (let i = 0; i < 50; i++) {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const amount = Math.floor(Math.random() * 500000) + 10000;
      
      const transaction = this.mobileMoneyRepo.create({
        companyId,
        provider: providers[Math.floor(Math.random() * providers.length)],
        amount,
        currency: 'XOF',
        txRef: `MM${date.getFullYear()}${String(i + 1).padStart(4, '0')}`,
        phoneNumber: `+221${Math.floor(Math.random() * 90000000) + 10000000}`,
        customerName: `CLIENT ${i + 1}`,
        customerEmail: `client${i + 1}@example.sn`,
        status,
        statusMessage: status === 'success' ? 'Transaction réussie' : 
                       status === 'failed' ? 'Échec de la transaction' : 
                       'Transaction en cours',
        createdAt: date.toISOString(),
        completedAt: status === 'success' ? new Date(date.getTime() + Math.random() * 3600000).toISOString() : null,
        providerResponse: {
          status,
          transactionId: `TXN${Math.floor(Math.random() * 1000000)}`,
          processedAt: date.toISOString(),
        },
        metadata: {
          source: 'mobile_app',
          device: 'mobile',
        },
      });

      await this.mobileMoneyRepo.save(transaction);
    }
  }
}
