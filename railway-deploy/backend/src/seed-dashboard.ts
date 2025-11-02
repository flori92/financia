import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CompaniesService } from './companies/companies.service';
import { AccountingService } from './accounting/accounting.service';
import { BankingService } from './banking/banking.service';

async function seedDashboardData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const companiesService = app.get(CompaniesService);
  const accountingService = app.get(AccountingService);
  const bankingService = app.get(BankingService);

  try {
    console.log('Creation des donnees dashboard...');

    // 1. Créer une entreprise
    const company = await companiesService.create({
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

    // 2. Créer le plan comptable OHADA simplifié
    const accounts = [
      { code: '101000', name: 'Capital social', type: 'Equity' },
      { code: '106000', name: 'Réserves', type: 'Equity' },
      { code: '120000', name: 'Résultat de l\'exercice', type: 'Equity' },
      { code: '401000', name: 'Fournisseurs', type: 'Liability' },
      { code: '411000', name: 'Clients', type: 'Asset' },
      { code: '445600', name: 'TVA déductible', type: 'Asset' },
      { code: '445700', name: 'TVA collectée', type: 'Liability' },
      { code: '512000', name: 'Banque', type: 'Asset' },
      { code: '531000', name: 'Caisse', type: 'Asset' },
      { code: '601000', name: 'Achats matières premières', type: 'Expense' },
      { code: '607000', name: 'Achats marchandises', type: 'Expense' },
      { code: '613000', name: 'Locations', type: 'Expense' },
      { code: '622000', name: 'Honoraires', type: 'Expense' },
      { code: '641000', name: 'Salaires', type: 'Expense' },
      { code: '701000', name: 'Ventes marchandises', type: 'Revenue' },
      { code: '706000', name: 'Services vendus', type: 'Revenue' },
      { code: '707000', name: 'Produits accessoires', type: 'Revenue' },
    ];

    for (const account of accounts) {
      await accountingService.createAccount({
        accountNumber: account.code,
        accountName: account.name,
        accountType: account.type.toLowerCase(),
        companyId: company.id,
        description: `Compte ${account.name}`,
        syscohadaClass: parseInt(account.code.substring(0, 1)),
      });
    }

    console.log('Plan comptable cree');

    // 3. Créer 6 mois d'écritures comptables (juin - novembre 2025)
    const months = [
      { name: 'juin', days: 30 },
      { name: 'juillet', days: 31 },
      { name: 'août', days: 31 },
      { name: 'septembre', days: 30 },
      { name: 'octobre', days: 31 },
      { name: 'novembre', days: 30 },
    ];

    let entryCounter = 1;

    for (const month of months) {
      const monthStart = new Date(2025, months.indexOf(month), 1);
      
      // Écritures mensuelles récurrentes
      await accountingService.createJournalEntry({
        companyId: company.id,
        description: `Salaires ${month.name} 2025`,
        entryDate: monthStart.toISOString().split('T')[0],
        journalType: 'general',
        createdBy: 'system',
        lines: [
          { accountId: '641000', debit: 2500000, credit: 0, label: 'Salaires nets' },
          { accountId: '512000', debit: 0, credit: 2500000, label: 'Paiement salaires' },
        ],
      });

      // Ventes mensuelles (croissantes)
      const monthlyRevenue = 8000000 + (months.indexOf(month) * 500000);
      await accountingService.createJournalEntry({
        companyId: company.id,
        description: `Ventes ${month.name} 2025`,
        entryDate: new Date(monthStart.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        journalType: 'sales',
        createdBy: 'system',
        lines: [
          { accountId: '411000', debit: monthlyRevenue, credit: 0, label: 'Clients divers' },
          { accountId: '701000', debit: 0, credit: monthlyRevenue * 0.7, label: 'Ventes marchandises HT' },
          { accountId: '445700', debit: 0, credit: monthlyRevenue * 0.13, label: 'TVA collectée' },
          { accountId: '707000', debit: 0, credit: monthlyRevenue * 0.17, label: 'Services facturés' },
        ],
      });

      // Achats mensuels
      const monthlyPurchases = 4500000 + (months.indexOf(month) * 200000);
      await accountingService.createJournalEntry({
        companyId: company.id,
        description: `Achats ${month.name} 2025`,
        entryDate: new Date(monthStart.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        journalType: 'purchase',
        createdBy: 'system',
        lines: [
          { accountId: '607000', debit: monthlyPurchases * 0.8, credit: 0, label: 'Achats marchandises HT' },
          { accountId: '445600', debit: monthlyPurchases * 0.13, credit: 0, label: 'TVA déductible' },
          { accountId: '401000', debit: 0, credit: monthlyPurchases * 0.93, label: 'Fournisseurs divers' },
        ],
      });

      // Frais généraux
      await accountingService.createJournalEntry({
        companyId: company.id,
        description: `Frais généraux ${month.name} 2025`,
        entryDate: new Date(monthStart.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        journalType: 'general',
        createdBy: 'system',
        lines: [
          { accountId: '613000', debit: 800000, credit: 0, label: 'Loyer bureau' },
          { accountId: '622000', debit: 600000, credit: 0, label: 'Honoraires comptables' },
          { accountId: '512000', debit: 0, credit: 1400000, label: 'Paiement frais généraux' },
        ],
      });

      console.log(`Ecritures ${month.name} creees`);
    }

    // 4. Créer des transactions bancaires
    const bankTransactions = [
      { date: '2025-06-15', amount: 8000000, label: 'Versement client A', reference: 'VIR202506001' },
      { date: '2025-06-20', amount: -2500000, label: 'Paiement salaires', reference: 'SAL202506001' },
      { date: '2025-07-15', amount: 8500000, label: 'Versement client B', reference: 'VIR202507001' },
      { date: '2025-07-20', amount: -2600000, label: 'Paiement salaires', reference: 'SAL202507001' },
      { date: '2025-08-15', amount: 9000000, label: 'Versement client C', reference: 'VIR202508001' },
      { date: '2025-08-20', amount: -2700000, label: 'Paiement salaires', reference: 'SAL202508001' },
      { date: '2025-09-15', amount: 9500000, label: 'Versement client D', reference: 'VIR202509001' },
      { date: '2025-09-20', amount: -2800000, label: 'Paiement salaires', reference: 'SAL202509001' },
      { date: '2025-10-15', amount: 10000000, label: 'Versement client E', reference: 'VIR202510001' },
      { date: '2025-10-20', amount: -2900000, label: 'Paiement salaires', reference: 'SAL202510001' },
      { date: '2025-11-15', amount: 10500000, label: 'Versement client F', reference: 'VIR202511001' },
      { date: '2025-11-20', amount: -3000000, label: 'Paiement salaires', reference: 'SAL202511001' },
    ];

    for (const transaction of bankTransactions) {
      const csvContent = `Date,Montant,Libellé,Référence\n${transaction.date},${transaction.amount},${transaction.label},${transaction.reference}`;
      await bankingService.importFromCsv({
        csvContent,
        companyId: company.id,
        format: 'standard'
      });
    }

    console.log('Transactions bancaires creees');

    // 5. Mettre à jour l'utilisateur admin avec cette entreprise
    // (Ceci nécessiterait un UserService, mais pour l'instant on retourne le companyId)

    console.log('Donnees dashboard creees avec succes !');
    console.log(`Company ID: ${company.id}`);
    console.log('Dashboard pret avec 6 mois d\'activite');
    
    return {
      companyId: company.id,
      message: 'Dashboard peuplé avec succès'
    };

  } catch (error) {
    console.error('Erreur lors du seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Exécuter le seeding
seedDashboardData()
  .then(result => {
    console.log('Seeding termine:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur seeding:', error);
    process.exit(1);
  });
