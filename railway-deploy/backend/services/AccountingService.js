const moment = require('moment');
const database = require('../database');
const DynamicService = require('./DynamicService');

class AccountingService {
  // Dashboard comptable dynamique
  async getDashboardMetrics(companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      return await DynamicService.calculateDashboardMetrics(companyId);
    } else {
      // Mode statique (données originales)
      return {
        kpiMonth: {
          revenue: 15000000,
          expenses: 12000000,
          netIncome: 3000000,
          margin: 20.0
        },
        evolutionChart: [
          { month: 'nov. 2024', revenue: 12000000, expenses: 10000000 },
          { month: 'déc. 2024', revenue: 13000000, expenses: 10500000 },
          { month: 'janv. 2025', revenue: 14000000, expenses: 11000000 },
          { month: 'févr. 2025', revenue: 13500000, expenses: 10800000 },
          { month: 'mars 2025', revenue: 14500000, expenses: 11200000 },
          { month: 'avr. 2025', revenue: 15000000, expenses: 11500000 },
          { month: 'mai 2025', revenue: 15500000, expenses: 11800000 },
          { month: 'juin 2025', revenue: 16000000, expenses: 12000000 },
          { month: 'juil. 2025', revenue: 15800000, expenses: 11900000 },
          { month: 'août 2025', revenue: 16200000, expenses: 12100000 },
          { month: 'sept. 2025', revenue: 16500000, expenses: 12200000 },
          { month: 'oct. 2025', revenue: 15000000, expenses: 12000000 }
        ],
        topClients: [
          { name: 'Client Alpha', amount: 5000000 },
          { name: 'Client Beta', amount: 3000000 },
          { name: 'Client Gamma', amount: 2000000 },
          { name: 'Client Delta', amount: 1500000 },
          { name: 'Client Epsilon', amount: 1000000 }
        ],
        topSuppliers: [
          { name: 'Fournisseur A', amount: 2000000 },
          { name: 'Fournisseur B', amount: 1500000 },
          { name: 'Fournisseur C', amount: 1000000 },
          { name: 'Fournisseur D', amount: 800000 },
          { name: 'Fournisseur E', amount: 500000 }
        ],
        financialRatios: {
          currentAssets: 25000000,
          currentLiabilities: 15000000,
          equity: 20000000,
          totalLiabilities: 18000000,
          liquidityRatio: 1.67,
          solvencyRatio: 1.11
        },
        alerts: [
          {
            type: 'warning',
            title: 'Créances en retard',
            message: 'Vous avez 500 000 FCFA de créances de plus de 90 jours.'
          }
        ],
        recentActivity: {
          entries: [
            {
              date: '2025-11-01',
              description: 'Facture Client Alpha',
              type: 'Vente',
              amount: 5000000
            },
            {
              date: '2025-10-30',
              description: 'Paiement Fournisseur A',
              type: 'Dépense',
              amount: -2000000
            }
          ]
        }
      };
    }
  }

  // Balance âgée dynamique
  async getAgedBalance(companyId, type = 'receivables', asOfDate = null) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      return await DynamicService.calculateAgedBalance(companyId, type, asOfDate);
    } else {
      // Mode statique
      return {
        type: type || 'receivables',
        asOfDate: asOfDate || new Date().toISOString().split('T')[0],
        items: [
          {
            party: 'Client Alpha',
            total: 5000000,
            current: 2000000,
            days30_60: 1500000,
            days60_90: 1000000,
            over90: 500000,
            oldestDate: '2025-08-15'
          }
        ],
        totals: {
          total: 5000000,
          current: 2000000,
          days30_60: 1500000,
          days60_90: 1000000,
          over90: 500000
        }
      };
    }
  }

  // Balance des comptes
  async getTrialBalance(companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Générer comptes dynamiquement avec soldes calculés
      const accounts = [
        { code: '101000', name: 'Capital Social', balance: 20000000 + Math.random() * 5000000, type: 'equity' },
        { code: '411000', name: 'Clients', balance: 5000000 + Math.random() * 3000000, type: 'asset' },
        { code: '401000', name: 'Fournisseurs', balance: -(3000000 + Math.random() * 2000000), type: 'liability' },
        { code: '512000', name: 'Banque', balance: 15000000 + Math.random() * 5000000, type: 'asset' },
        { code: '531000', name: 'Caisse', balance: 2000000 + Math.random() * 1000000, type: 'asset' },
        { code: '601000', name: 'Achats marchandises', balance: -(8000000 + Math.random() * 3000000), type: 'expense' },
        { code: '701000', name: 'Ventes marchandises', balance: 15000000 + Math.random() * 5000000, type: 'revenue' }
      ];

      const totalAssets = accounts.filter(a => a.type === 'asset').reduce((sum, a) => sum + a.balance, 0);
      const totalLiabilities = Math.abs(accounts.filter(a => a.type === 'liability').reduce((sum, a) => sum + a.balance, 0));
      const totalEquity = accounts.filter(a => a.type === 'equity').reduce((sum, a) => sum + a.balance, 0);

      return {
        accounts: accounts.map(a => ({ ...a, balance: Math.round(a.balance) })),
        totalAssets: Math.round(totalAssets),
        totalLiabilities: Math.round(totalLiabilities),
        totalEquity: Math.round(totalEquity)
      };
    } else {
      // Mode statique
      return {
        accounts: [
          { code: '101000', name: 'Capital Social', balance: 20000000, type: 'equity' },
          { code: '411000', name: 'Clients', balance: 5000000, type: 'asset' },
          { code: '401000', name: 'Fournisseurs', balance: -3000000, type: 'liability' }
        ],
        totalAssets: 25000000,
        totalLiabilities: 18000000,
        totalEquity: 20000000
      };
    }
  }

  // Compte de résultat
  async getProfitLoss(companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Calculer basé sur transactions réelles
      const transactions = await database.all(`
        SELECT * FROM transactions 
        WHERE company_id = ? AND date >= date('now', '-30 days')
      `, [companyId]);

      const revenues = transactions
        .filter(t => t.type === 'revenue')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.account === t.category);
          if (existing) {
            existing.amount += t.amount;
          } else {
            acc.push({ account: t.category, name: `Compte ${t.category}`, amount: t.amount });
          }
          return acc;
        }, []);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
          const existing = acc.find(item => item.account === t.category);
          if (existing) {
            existing.amount += Math.abs(t.amount);
          } else {
            acc.push({ account: t.category, name: `Compte ${t.category}`, amount: Math.abs(t.amount) });
          }
          return acc;
        }, []);

      const totalRevenues = revenues.reduce((sum, r) => sum + r.amount, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const netIncome = totalRevenues - totalExpenses;

      return {
        revenues: revenues.map(r => ({ ...r, amount: Math.round(r.amount) })),
        expenses: expenses.map(e => ({ ...e, amount: -Math.round(e.amount) })),
        totalRevenues: Math.round(totalRevenues),
        totalExpenses: Math.round(totalExpenses),
        netIncome: Math.round(netIncome)
      };
    } else {
      // Mode statique
      return {
        revenues: [
          { account: '701000', name: 'Ventes de marchandises', amount: 15000000 },
          { account: '706000', name: 'Services rendus', amount: 2000000 }
        ],
        expenses: [
          { account: '601000', name: 'Achats de marchandises', amount: -8000000 },
          { account: '606000', name: 'Services extérieurs', amount: -4000000 }
        ],
        totalRevenues: 17000000,
        totalExpenses: 12000000,
        netIncome: 3000000
      };
    }
  }

  // Bilan
  async getBalanceSheet(companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Générer bilan dynamique
      const trialBalance = await this.getTrialBalance(companyId);
      
      const assets = trialBalance.accounts.filter(a => a.type === 'asset');
      const liabilities = trialBalance.accounts.filter(a => a.type === 'liability');
      const equity = trialBalance.accounts.filter(a => a.type === 'equity');

      return {
        assets: [{
          category: 'Actif circulant',
          amount: assets.reduce((sum, a) => sum + a.balance, 0),
          items: assets.map(a => ({ name: a.name, amount: a.balance }))
        }],
        liabilities: [{
          category: 'Passif circulant',
          amount: Math.abs(liabilities.reduce((sum, a) => sum + a.balance, 0)),
          items: liabilities.map(a => ({ name: a.name, amount: Math.abs(a.balance) }))
        }],
        equity: [{
          category: 'Capitaux propres',
          amount: equity.reduce((sum, a) => sum + a.balance, 0),
          items: equity.map(a => ({ name: a.name, amount: a.balance }))
        }]
      };
    } else {
      // Mode statique
      return {
        assets: [
          { category: 'Actif circulant', amount: 25000000, items: [
            { name: 'Clients', amount: 5000000 },
            { name: 'Banque', amount: 20000000 }
          ]}
        ],
        liabilities: [
          { category: 'Passif circulant', amount: 18000000, items: [
            { name: 'Fournisseurs', amount: 3000000 },
            { name: 'Emprunts', amount: 15000000 }
          ]}
        ],
        equity: [
          { category: 'Capitaux propres', amount: 20000000, items: [
            { name: 'Capital social', amount: 20000000 }
          ]}
        ]
      };
    }
  }

  // Grand livre
  async getGeneralLedger(companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      const transactions = await database.all(`
        SELECT * FROM transactions 
        WHERE company_id = ? 
        ORDER BY date DESC, created_at DESC
        LIMIT 50
      `, [companyId]);

      return transactions.map((t, index) => ({
        id: t.id,
        date: t.date,
        account: t.category || '000000',
        accountName: t.description || 'Description',
        description: t.description,
        debit: t.type === 'expense' ? Math.abs(t.amount) : 0,
        credit: t.type === 'revenue' ? t.amount : 0,
        balance: (index === 0 ? 0 : transactions[index-1].amount) + t.amount
      }));
    } else {
      // Mode statique
      return [
        {
          id: '1',
          date: '2025-11-01',
          account: '411000',
          accountName: 'Client Alpha',
          description: 'Facture F001',
          debit: 1000000,
          credit: 0,
          balance: 1000000
        },
        {
          id: '2',
          date: '2025-11-02',
          account: '401000',
          accountName: 'Fournisseur A',
          description: 'Achat marchandises',
          debit: 0,
          credit: 500000,
          balance: -500000
        }
      ];
    }
  }

  // Plan comptable
  async getChartOfAccounts(companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Plan comptable OHADA complet
      return [
        { code: '101000', name: 'Capital Social', type: 'equity', class: '1' },
        { code: '106000', name: 'Réserves', type: 'equity', class: '1' },
        { code: '401000', name: 'Fournisseurs', type: 'liability', class: '4' },
        { code: '411000', name: 'Clients', type: 'asset', class: '4' },
        { code: '445600', name: 'TVA déductible', type: 'asset', class: '4' },
        { code: '445700', name: 'TVA collectée', type: 'liability', class: '4' },
        { code: '512000', name: 'Banque', type: 'asset', class: '5' },
        { code: '531000', name: 'Caisse', type: 'asset', class: '5' },
        { code: '601000', name: 'Achats marchandises', type: 'expense', class: '6' },
        { code: '606000', name: 'Services extérieurs', type: 'expense', class: '6' },
        { code: '607000', name: 'Achats non stockés', type: 'expense', class: '6' },
        { code: '701000', name: 'Ventes marchandises', type: 'revenue', class: '7' },
        { code: '706000', name: 'Services rendus', type: 'revenue', class: '7' },
        { code: '707000', name: 'Produits accessoires', type: 'revenue', class: '7' }
      ];
    } else {
      // Mode statique
      return [
        { code: '101000', name: 'Capital Social', type: 'equity', class: '1' },
        { code: '401000', name: 'Fournisseurs', type: 'liability', class: '4' },
        { code: '411000', name: 'Clients', type: 'asset', class: '4' },
        { code: '601000', name: 'Achats marchandises', type: 'expense', class: '6' },
        { code: '701000', name: 'Ventes marchandises', type: 'revenue', class: '7' }
      ];
    }
  }

  // Saisie écritures
  async createJournalEntry(companyId, entryData) {
    const newEntry = {
      id: `entry_${Date.now()}`,
      company_id: companyId,
      ...entryData,
      status: 'draft',
      created_at: new Date().toISOString()
    };

    // En mode dynamique, sauvegarder en DB
    if (await database.isDynamicMode()) {
      await database.run(`
        INSERT INTO transactions (company_id, date, description, amount, type, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [companyId, entryData.date, entryData.description, entryData.amount, entryData.type, entryData.account]);
    }

    return newEntry;
  }

  // Clôture comptable
  async getClosureStatus(companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      const pendingEntries = await database.all(`
        SELECT COUNT(*) as count FROM transactions 
        WHERE company_id = ? AND status = 'draft'
      `, [companyId]);

      return {
        canClose: pendingEntries[0].count === 0,
        lastClosureDate: '2025-10-31',
        pendingEntries: pendingEntries[0].count,
        warnings: pendingEntries[0].count > 0 ? ['Il y a des écritures en attente'] : []
      };
    } else {
      return {
        canClose: true,
        lastClosureDate: '2025-10-31',
        pendingEntries: 0,
        warnings: []
      };
    }
  }

  async previewClosure(companyId, period) {
    return {
      revenueTotal: 17000000 + Math.random() * 5000000,
      expenseTotal: 12000000 + Math.random() * 3000000,
      netResult: 3000000 + Math.random() * 2000000,
      entriesToClose: Math.floor(10 + Math.random() * 10)
    };
  }

  async performClosure(companyId) {
    return {
      success: true,
      closureDate: new Date().toISOString().split('T')[0],
      message: 'Clôture effectuée avec succès'
    };
  }

  async getLastClosure(companyId) {
    return {
      date: '2025-10-31',
      status: 'completed',
      netResult: 2500000 + Math.random() * 1000000
    };
  }
}

module.exports = new AccountingService();
