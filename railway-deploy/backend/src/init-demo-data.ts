import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CompaniesService } from './companies/companies.service';
import { AccountingService } from './accounting/accounting.service';

async function initializeDemoData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const companiesService = app.get(CompaniesService);
  const accountingService = app.get(AccountingService);

  try {
    console.log('Initialisation donnees demo BMS...');

    // 1. Créer l'entreprise démo
    const company = await companiesService.create({
      id: '1805bc61-7cfd-44e9-8a63-17187bf05dc7',
      name: 'BMS Demo SARL',
      legalName: 'BMS Demo Société à Responsabilité Limitée',
      registrationNumber: 'BJS123456789',
      taxId: 'BJS987654321',
      industry: 'Services Numériques',
      size: 'small',
      addressLine1: '123 Rue du Commerce, Cotonou, Bénin',
      city: 'Cotonou',
      postalCode: '',
      country: 'BJ',
      phone: '+229 12345678',
      email: 'demo@bms.bj',
      website: 'https://bms-demo.bj',
      vatRate: 0.18,
      fiscalYearStart: new Date('2025-01-01'),
      defaultCurrency: 'XOF',
    });

    console.log(`Entreprise cree: ${company.id}`);

    // 2. Créer les comptes comptables essentiels
    const essentialAccounts = [
      { code: '101000', name: 'Capital social', type: 'Equity' },
      { code: '401000', name: 'Fournisseurs', type: 'Liability' },
      { code: '411000', name: 'Clients', type: 'Asset' },
      { code: '445600', name: 'TVA déductible', type: 'Asset' },
      { code: '445700', name: 'TVA collectée', type: 'Liability' },
      { code: '512000', name: 'Banque', type: 'Asset' },
      { code: '607000', name: 'Achats marchandises', type: 'Expense' },
      { code: '701000', name: 'Ventes marchandises', type: 'Revenue' },
    ];

    for (const account of essentialAccounts) {
      await accountingService.createAccount({
        accountNumber: account.code,
        accountName: account.name,
        accountType: account.type.toLowerCase(),
        companyId: company.id,
        description: `Compte ${account.name}`,
        syscohadaClass: parseInt(account.code.substring(0, 1)),
      });
    }

    console.log('Comptes comptables crees');

    // 3. Créer quelques écritures de base
    await accountingService.createJournalEntry({
      companyId: company.id,
      description: 'Capital initial',
      entryDate: '2025-06-01',
      journalType: 'general',
      createdBy: 'system',
      lines: [
        { accountId: '512000', debit: 10000000, credit: 0, label: 'Dépôt capital' },
        { accountId: '101000', debit: 0, credit: 10000000, label: 'Capital social' },
      ],
    });

    await accountingService.createJournalEntry({
      companyId: company.id,
      description: 'Ventes novembre 2025',
      entryDate: '2025-11-01',
      journalType: 'sales',
      createdBy: 'system',
      lines: [
        { accountId: '411000', debit: 5000000, credit: 0, label: 'Client Alpha' },
        { accountId: '701000', debit: 0, credit: 4237288, label: 'Ventes HT' },
        { accountId: '445700', debit: 0, credit: 762712, label: 'TVA collectée' },
      ],
    });

    console.log('Ecritures comptables creees');

    console.log('Donnees demo initialisees avec succes !');
    return {
      companyId: company.id,
      message: 'Données démo créées - Dashboard prêt'
    };

  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Exécuter l'initialisation
initializeDemoData()
  .then(result => {
    console.log('Initialisation terminee:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur initialisation:', error);
    process.exit(1);
  });
