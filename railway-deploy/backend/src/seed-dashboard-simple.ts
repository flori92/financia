import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CompaniesService } from './companies/companies.service';
import { AccountingService } from './accounting/accounting.service';

async function seedDashboardData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const companiesService = app.get(CompaniesService);
  const accountingService = app.get(AccountingService);

  try {
    console.log(' Création des données dashboard...');

    // 1. Créer une entreprise directement en base
    const company = await companiesService['companyRepository'].save({
      name: 'BMS Demo SARL',
      legalName: 'BMS Demo Société à Responsabilité Limitée',
      registrationNumber: 'BJS123456789',
      taxId: 'BJS987654321',
      industry: 'Services Numériques',
      size: 'small',
      address: '123 Rue du Commerce, Cotonou, Bénin',
      phone: '+229 12345678',
      email: 'demo@bms.bj',
      website: 'https://bms-demo.bj',
      vatRate: 0.18,
      fiscalYearStart: '01-01',
      currency: 'XOF',
    });

    console.log(` Entreprise créée: ${company.id}`);

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
      await accountingService['accountRepository'].save({
        ...account,
        companyId: company.id,
        description: `Compte ${account.name}`,
      });
    }

    console.log(' Plan comptable créé');

    // 3. Créer 6 mois d'écritures comptables
    const months = [
      { name: 'juin', year: 2025, month: 5 },
      { name: 'juillet', year: 2025, month: 6 },
      { name: 'août', year: 2025, month: 7 },
      { name: 'septembre', year: 2025, month: 8 },
      { name: 'octobre', year: 2025, month: 9 },
      { name: 'novembre', year: 2025, month: 10 },
    ];

    for (let i = 0; i < months.length; i++) {
      const month = months[i];
      const monthStart = new Date(month.year, month.month, 1);
      
      // Capital initial (premier mois seulement)
      if (i === 0) {
        await accountingService['journalEntriesRepository'].save({
          companyId: company.id,
          description: 'Apport capital social',
          entryDate: monthStart,
          status: 'posted',
          lines: [
            { accountId: '512000', debit: 10000000, credit: 0, label: 'Dépôt capital banque' },
            { accountId: '101000', debit: 0, credit: 10000000, label: 'Capital social apporté' },
          ],
        });
      }

      // Ventes mensuelles (croissantes)
      const monthlyRevenue = 8000000 + (i * 500000);
      await accountingService['journalEntriesRepository'].save({
        companyId: company.id,
        description: `Ventes ${month.name} ${month.year}`,
        entryDate: new Date(monthStart.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: 'posted',
        lines: [
          { accountId: '411000', debit: monthlyRevenue, credit: 0, label: 'Clients divers' },
          { accountId: '701000', debit: 0, credit: monthlyRevenue * 0.7, label: 'Ventes marchandises HT' },
          { accountId: '445700', debit: 0, credit: monthlyRevenue * 0.13, label: 'TVA collectée' },
          { accountId: '707000', debit: 0, credit: monthlyRevenue * 0.17, label: 'Services facturés' },
        ],
      });

      // Achats mensuels
      const monthlyPurchases = 4500000 + (i * 200000);
      await accountingService['journalEntriesRepository'].save({
        companyId: company.id,
        description: `Achats ${month.name} ${month.year}`,
        entryDate: new Date(monthStart.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: 'posted',
        lines: [
          { accountId: '607000', debit: monthlyPurchases * 0.8, credit: 0, label: 'Achats marchandises HT' },
          { accountId: '445600', debit: monthlyPurchases * 0.13, credit: 0, label: 'TVA déductible' },
          { accountId: '401000', debit: 0, credit: monthlyPurchases * 0.93, label: 'Fournisseurs divers' },
        ],
      });

      // Frais généraux mensuels
      await accountingService['journalEntriesRepository'].save({
        companyId: company.id,
        description: `Frais généraux ${month.name} ${month.year}`,
        entryDate: new Date(monthStart.getTime() + 20 * 24 * 60 * 60 * 1000),
        status: 'posted',
        lines: [
          { accountId: '613000', debit: 800000, credit: 0, label: 'Loyer bureau' },
          { accountId: '622000', debit: 600000, credit: 0, label: 'Honoraires comptables' },
          { accountId: '641000', debit: 2500000, credit: 0, label: 'Salaires nets' },
          { accountId: '512000', debit: 0, credit: 3900000, label: 'Paiement frais généraux' },
        ],
      });

      console.log(` Écritures ${month.name} créées`);
    }

    console.log(' Données dashboard créées avec succès !');
    console.log(` Company ID: ${company.id}`);
    console.log(' Dashboard prêt avec 6 mois d\'activité');
    
    return {
      companyId: company.id,
      message: 'Dashboard peuplé avec succès'
    };

  } catch (error) {
    console.error(' Erreur lors du seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Exécuter le seeding
seedDashboardData()
  .then(result => {
    console.log(' Seeding terminé:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error(' Erreur seeding:', error);
    process.exit(1);
  });
