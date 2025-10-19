const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data - Multiple companies
const companies = [
  { id: 'comp-1', name: 'SARL TechAfrique', siret: '12345678900001', nif: 'BJ123456789', rccm: 'RB/COT/2020/A/123', status: 'active', sector: 'Technologie', city: 'Cotonou' },
  { id: 'comp-2', name: 'SA Commerce Plus', siret: '98765432100002', nif: 'BJ987654321', rccm: 'RB/COT/2019/B/456', status: 'active', sector: 'Commerce', city: 'Porto-Novo' },
  { id: 'comp-3', name: 'EURL AgriPro', siret: '55566677700003', nif: 'BJ555666777', rccm: 'RB/PAR/2021/C/789', status: 'active', sector: 'Agriculture', city: 'Parakou' },
  { id: 'comp-4', name: 'SAS TransportExpress', siret: '11122233300004', nif: 'BJ111222333', rccm: 'RB/COT/2018/D/012', status: 'active', sector: 'Transport', city: 'Cotonou' }
];

const clients = [
  { id: 'cli-1', companyId: 'comp-1', name: 'Ministère Digital', email: 'contact@mindigital.bj', phone: '+229 21 30 00 00', address: 'Cotonou', type: 'Public', balance: 5000000 },
  { id: 'cli-2', companyId: 'comp-1', name: 'Banque Atlantique', email: 'info@ba.bj', phone: '+229 21 31 00 00', address: 'Cotonou', type: 'Privé', balance: 8500000 },
  { id: 'cli-3', companyId: 'comp-2', name: 'SuperMarché Erevan', email: 'erevan@shop.bj', phone: '+229 21 32 00 00', address: 'Porto-Novo', type: 'Privé', balance: 3200000 },
  { id: 'cli-4', companyId: 'comp-3', name: 'Coopérative Agricole', email: 'coop@agri.bj', phone: '+229 23 00 00 00', address: 'Parakou', type: 'Coopérative', balance: 2100000 }
];

const invoices = [
  { id: 'inv-1', companyId: 'comp-1', clientId: 'cli-1', number: 'FA-2025-001', date: '2025-01-10', dueDate: '2025-02-10', amount: 2500000, status: 'paid', items: [{ description: 'Développement site web', quantity: 1, unitPrice: 2500000 }] },
  { id: 'inv-2', companyId: 'comp-1', clientId: 'cli-2', number: 'FA-2025-002', date: '2025-01-15', dueDate: '2025-02-15', amount: 4200000, status: 'pending', items: [{ description: 'Maintenance système', quantity: 12, unitPrice: 350000 }] },
  { id: 'inv-3', companyId: 'comp-2', clientId: 'cli-3', number: 'FA-2025-003', date: '2024-12-20', dueDate: '2025-01-20', amount: 1800000, status: 'overdue', items: [{ description: 'Fournitures bureau', quantity: 1, unitPrice: 1800000 }] }
];

const syscohadaAccounts = [
  { code: '101000', name: 'Capital social', type: 'Capitaux propres', balance: 50000000 },
  { code: '106000', name: 'Réserves', type: 'Capitaux propres', balance: 15000000 },
  { code: '121000', name: 'Résultat net', type: 'Capitaux propres', balance: 8500000 },
  { code: '211000', name: 'Terrains', type: 'Immobilisations', balance: 25000000 },
  { code: '231000', name: 'Bâtiments', type: 'Immobilisations', balance: 45000000 },
  { code: '244000', name: 'Matériel informatique', type: 'Immobilisations', balance: 8000000 },
  { code: '281000', name: 'Amortissements bâtiments', type: 'Immobilisations', balance: -12000000 },
  { code: '311000', name: 'Marchandises', type: 'Stocks', balance: 12000000 },
  { code: '411000', name: 'Clients', type: 'Créances', balance: 18900000 },
  { code: '416000', name: 'Créances douteuses', type: 'Créances', balance: 2100000 },
  { code: '421000', name: 'Personnel', type: 'Dettes', balance: -3500000 },
  { code: '431000', name: 'Sécurité sociale', type: 'Dettes', balance: -1800000 },
  { code: '401000', name: 'Fournisseurs', type: 'Dettes', balance: -9500000 },
  { code: '443100', name: 'TVA collectée', type: 'Dettes', balance: -2800000 },
  { code: '445200', name: 'TVA déductible', type: 'Créances', balance: 1900000 },
  { code: '521000', name: 'Banques', type: 'Trésorerie', balance: 15000000 },
  { code: '531000', name: 'Caisse', type: 'Trésorerie', balance: 2500000 },
  { code: '601000', name: 'Achats marchandises', type: 'Charges', balance: 35000000 },
  { code: '604000', name: 'Achats matières', type: 'Charges', balance: 12000000 },
  { code: '661000', name: 'Salaires', type: 'Charges', balance: 28000000 },
  { code: '663000', name: 'Charges sociales', type: 'Charges', balance: 8500000 },
  { code: '701000', name: 'Ventes marchandises', type: 'Produits', balance: 95000000 },
  { code: '706000', name: 'Prestations services', type: 'Produits', balance: 42000000 }
];

const journalEntries = [
  { id: 'je-1', date: '2025-01-15', reference: 'VT-001', description: 'Vente client Ministère', debit: { account: '411000', amount: 2500000 }, credit: { account: '701000', amount: 2500000 } },
  { id: 'je-2', date: '2025-01-16', reference: 'AC-001', description: 'Achat fournitures', debit: { account: '604000', amount: 850000 }, credit: { account: '401000', amount: 850000 } },
  { id: 'je-3', date: '2025-01-17', reference: 'SA-001', description: 'Salaires janvier', debit: { account: '661000', amount: 3200000 }, credit: { account: '421000', amount: 3200000 } }
];

function calculateDashboard() {
  const totalRevenue = syscohadaAccounts.filter(a => a.type === 'Produits').reduce((sum, a) => sum + a.balance, 0);
  const totalExpenses = syscohadaAccounts.filter(a => a.type === 'Charges').reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalRevenue - totalExpenses;
  const margin = totalRevenue ? ((netIncome / totalRevenue) * 100) : 0;
  
  return {
    kpiMonth: { revenue: totalRevenue, expenses: totalExpenses, netIncome, margin },
    evolutionChart: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(2025, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
      revenue: totalRevenue * (0.7 + Math.random() * 0.6),
      expenses: totalExpenses * (0.7 + Math.random() * 0.6)
    })),
    topClients: clients.slice(0, 3),
    topSuppliers: [{ name: 'Fournisseur Tech', amount: 4500000 }, { name: 'Fournisseur Matériel', amount: 3200000 }],
    financialRatios: { 
      liquidityRatio: 1.8, 
      solvencyRatio: 0.65,
      currentAssets: syscohadaAccounts.filter(a => ['Stocks', 'Créances', 'Trésorerie'].includes(a.type)).reduce((s, a) => s + Math.abs(a.balance), 0),
      currentLiabilities: syscohadaAccounts.filter(a => a.type === 'Dettes').reduce((s, a) => s + Math.abs(a.balance), 0),
      equity: syscohadaAccounts.filter(a => a.type === 'Capitaux propres').reduce((s, a) => s + Math.abs(a.balance), 0),
      totalLiabilities: syscohadaAccounts.filter(a => a.type === 'Dettes').reduce((s, a) => s + Math.abs(a.balance), 0)
    },
    recentActivity: { 
      entries: journalEntries.slice(-5).map(je => ({
        description: je.description,
        type: je.reference.startsWith('VT') ? 'Vente' : je.reference.startsWith('AC') ? 'Achat' : 'Opération',
        amount: je.debit.amount - je.credit.amount,
        date: je.date
      }))
    },
    alerts: [
      ...invoices.filter(inv => inv.status === 'overdue').map(inv => ({
        type: 'danger',
        title: 'Facture en retard critique',
        message: `${inv.number} dépasse 90 jours (${inv.amount.toLocaleString()} FCFA)`
      })),
      { type: 'warning', title: 'TVA à déclarer', message: 'Déclaration CA3 due le 15/02/2025' },
      { type: 'info', title: 'Rapprochement bancaire', message: '5 opérations à rapprocher' }
    ]
  };
}

app.get('/api/v1/accounting/dashboard/metrics', (req, res) => res.json(calculateDashboard()));
app.get('/api/v1/accounting/accounts', (req, res) => res.json([]));
app.get('/api/v1/accounting/journal-entries', (req, res) => res.json(journalEntries));
app.get('/api/v1/accounting/aged-balance', (req, res) => {
  const type = req.query.type;
  res.json({ 
    items: [],
    totals: { 
      current: 2000000, 
      days30_60: 1500000, 
      days60_90: 800000, 
      over90: 500000, 
      total: 4800000 
    }
  });
});
app.get('/api/v1/accounting/trial-balance', (req, res) => res.json({ accounts: [] }));
app.get('/api/v1/accounting/profit-loss', (req, res) => {
  const revenue = syscohadaAccounts.filter(a => a.type === 'Produits').reduce((sum, a) => sum + a.balance, 0);
  const expenses = syscohadaAccounts.filter(a => a.type === 'Charges').reduce((sum, a) => sum + a.balance, 0);
  res.json({ 
    revenue, 
    expenses, 
    netProfit: revenue - expenses,
    details: {
      products: syscohadaAccounts.filter(a => a.type === 'Produits'),
      charges: syscohadaAccounts.filter(a => a.type === 'Charges')
    }
  });
});

app.get('/api/v1/accounting/balance-sheet', (req, res) => {
  const assets = syscohadaAccounts.filter(a => ['Immobilisations', 'Stocks', 'Créances', 'Trésorerie'].includes(a.type));
  const liabilities = syscohadaAccounts.filter(a => ['Capitaux propres', 'Dettes'].includes(a.type));
  res.json({
    assets: assets.reduce((sum, a) => sum + Math.abs(a.balance), 0),
    liabilities: liabilities.reduce((sum, a) => sum + Math.abs(a.balance), 0),
    details: { assets, liabilities }
  });
});
app.get('/api/v1/invoices', (req, res) => {
  res.json(invoices);
});

app.post('/api/v1/invoices', (req, res) => {
  const newInvoice = {
    id: `inv-${Date.now()}`,
    number: `FA-2025-${String(invoices.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    status: 'pending',
    ...req.body
  };
  invoices.push(newInvoice);
  res.json(newInvoice);
});

app.post('/api/v1/invoices/:id/send', (req, res) => {
  const invoice = invoices.find(i => i.id === req.params.id);
  res.json({ success: true, message: `Facture ${invoice?.number} envoyée par email` });
});

app.get('/api/v1/invoices/:id/export', (req, res) => {
  res.json({ url: `/exports/invoice-${req.params.id}.pdf` });
});
app.get('/api/v1/payments', (req, res) => {
  res.json([{
    id: '1',
    paymentNumber: 'PAY-2025-001',
    amount: 1000000,
    paymentDate: '2025-01-15',
    partyType: 'customer',
    reference: 'Paiement facture #001',
    status: 'completed'
  }]);
});

// Auth endpoints
app.post('/api/v1/auth/login', (req, res) => {
  res.json({
    access_token: 'mock-token-123',
    user: {
      id: '1',
      email: 'demo@bms.com',
      name: 'Demo User',
      role: 'admin',
      companyId: 'company-1'
    }
  });
});

app.get('/api/v1/auth/me', (req, res) => {
  res.json({
    id: '1',
    email: 'demo@bms.com',
    name: 'Demo User',
    role: 'admin',
    companyId: 'company-1'
  });
});

app.get('/api/auth/session', (req, res) => {
  res.json({
    user: {
      id: '1',
      email: 'demo@bms.com',
      name: 'Demo User'
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
  });
});

app.get('/api/v1/companies', (req, res) => {
  res.json(companies);
});

app.post('/api/v1/companies', (req, res) => {
  const newCompany = {
    id: `comp-${Date.now()}`,
    ...req.body,
    status: 'active'
  };
  companies.push(newCompany);
  res.json(newCompany);
});

app.get('/api/v1/companies/:id', (req, res) => {
  const company = companies.find(c => c.id === req.params.id);
  res.json(company || {});
});

app.get('/api/user/profile', (req, res) => {
  res.json({
    id: '1',
    role: 'admin',
    permissions: ['read', 'write', 'admin'],
    preferences: {
      theme: 'light',
      language: 'fr',
      dashboardLayout: 'default'
    }
  });
});

// CRM endpoints
app.get('/api/v1/crm/contacts', (req, res) => {
  res.json(clients);
});

app.post('/api/v1/crm/contacts', (req, res) => {
  const newClient = {
    id: `cli-${Date.now()}`,
    ...req.body,
    balance: 0
  };
  clients.push(newClient);
  res.json(newClient);
});

app.get('/api/v1/crm/contacts/:id', (req, res) => {
  const client = clients.find(c => c.id === req.params.id);
  res.json(client || {});
});

app.get('/api/v1/crm/opportunities', (req, res) => {
  res.json([{
    id: '1',
    title: 'Opportunité Demo',
    value: 5000000,
    stage: 'negotiation',
    probability: 75
  }]);
});

app.get('/api/v1/crm/stats', (req, res) => {
  res.json({
    totalContacts: 150,
    totalOpportunities: 25,
    totalRevenue: 50000000,
    conversionRate: 35
  });
});

// HR endpoints
app.get('/api/v1/hr/employees', (req, res) => {
  res.json([{
    id: '1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@demo.com',
    position: 'Développeur',
    department: 'IT',
    salary: 500000
  }]);
});

app.get('/api/v1/hr/payroll', (req, res) => {
  res.json([{
    id: '1',
    employeeId: '1',
    month: '2025-01',
    grossSalary: 500000,
    netSalary: 425000,
    status: 'paid'
  }]);
});

// Purchases endpoints
app.get('/api/v1/purchases/suppliers', (req, res) => {
  res.json([{
    id: '1',
    name: 'Fournisseur Demo',
    email: 'fournisseur@demo.com',
    phone: '+229 87654321',
    status: 'active'
  }]);
});

app.get('/api/v1/purchases/orders', (req, res) => {
  res.json([{
    id: '1',
    supplierId: '1',
    orderNumber: 'PO-2025-001',
    amount: 2000000,
    status: 'pending'
  }]);
});

// Manufacturing endpoints
app.get('/api/v1/manufacturing/production-orders', (req, res) => {
  res.json([{
    id: '1',
    productName: 'Produit Demo',
    quantity: 100,
    status: 'in_progress',
    startDate: '2025-01-01'
  }]);
});

app.get('/api/v1/manufacturing/bom', (req, res) => {
  res.json([{
    id: '1',
    productName: 'Produit Demo',
    components: [
      { name: 'Composant A', quantity: 2 },
      { name: 'Composant B', quantity: 1 }
    ]
  }]);
});

// Inventory endpoints
app.get('/api/v1/inventory/items', (req, res) => {
  res.json([{
    id: '1',
    name: 'Article Demo',
    sku: 'ART-001',
    quantity: 500,
    unitPrice: 10000,
    warehouse: 'Entrepôt Principal'
  }]);
});

app.get('/api/v1/inventory/movements', (req, res) => {
  res.json([{
    id: '1',
    itemId: '1',
    type: 'in',
    quantity: 100,
    date: '2025-01-15'
  }]);
});

// Projects endpoints
app.get('/api/v1/projects', (req, res) => {
  res.json([{
    id: '1',
    name: 'Projet Demo',
    status: 'in_progress',
    budget: 10000000,
    spent: 6000000,
    progress: 60
  }]);
});

// Budget endpoints
app.get('/api/v1/budget', (req, res) => {
  res.json({
    categories: [
      { name: 'Marketing', budgeted: 5000000, actual: 4500000 },
      { name: 'Opérations', budgeted: 10000000, actual: 9500000 },
      { name: 'Personnel', budgeted: 20000000, actual: 19000000 }
    ],
    totalBudgeted: 35000000,
    totalActual: 33000000
  });
});

// Treasury endpoints
app.get('/api/v1/treasury/cash-flow', (req, res) => {
  res.json({
    currentBalance: 15000000,
    projectedInflows: 8000000,
    projectedOutflows: 6000000,
    projectedBalance: 17000000
  });
});

app.get('/api/v1/treasury/bank-accounts', (req, res) => {
  res.json([{
    id: '1',
    name: 'Compte Principal',
    bank: 'Banque Demo',
    balance: 15000000,
    currency: 'FCFA'
  }]);
});

// Settings endpoints
app.get('/api/v1/settings/users', (req, res) => {
  res.json([{
    id: '1',
    name: 'Demo User',
    email: 'demo@bms.com',
    role: 'admin',
    status: 'active'
  }]);
});

// Banking endpoints
app.get('/api/v1/banking/accounts', (req, res) => {
  res.json([{
    id: '1',
    name: 'Compte Principal',
    bankName: 'Banque Demo',
    accountNumber: '123456789',
    iban: 'BJ06 BJ12 0123 4567 8901 2345',
    bic: 'BSICBJBJ',
    currency: 'XOF',
    currentBalance: 15000000,
    isActive: true,
    lastTransactionDate: '2025-01-15'
  }]);
});

app.post('/api/v1/banking/accounts', (req, res) => {
  res.json({
    id: '2',
    ...req.body,
    currentBalance: req.body.openingBalance || 0,
    isActive: true
  });
});

// Treasury endpoints
app.get('/api/v1/treasury/summary', (req, res) => {
  res.json({
    in: { amount: 8000000 },
    out: { amount: 6000000 },
    net: 2000000
  });
});

app.get('/api/v1/treasury/timeseries', (req, res) => {
  res.json({
    data: [
      { date: '2025-01', in: 5000000, out: 3000000, net: 2000000, cumulative: 2000000 },
      { date: '2025-02', in: 6000000, out: 4000000, net: 2000000, cumulative: 4000000 }
    ]
  });
});

app.get('/api/v1/treasury/forecast', (req, res) => {
  res.json({
    summary: { currentBalance: 15000000 },
    series: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(2025, i, 1).toISOString(),
      balance: 15000000 + (i * 500000)
    })),
    confidence: 0.85,
    points: [
      { date: '2025-01-20', projectedBalance: 15500000 },
      { date: '2025-01-27', projectedBalance: 16000000 }
    ],
    recommendations: ['Situation stable', 'Continuer le suivi']
  });
});

app.get('/api/v1/banking/transactions', (req, res) => {
  res.json([{
    id: '1',
    date: '2025-01-15',
    description: 'Virement client',
    amount: 1000000,
    status: 'reconciled'
  }, {
    id: '2',
    date: '2025-01-16',
    description: 'Paiement fournisseur',
    amount: -500000,
    status: 'pending'
  }]);
});

app.get('/api/v1/treasury/alerts', (req, res) => {
  res.json({
    alerts: [{
      level: 'warning',
      title: 'Trésorerie faible',
      message: 'Le solde bancaire est inférieur au seuil recommandé'
    }],
    metrics: {
      runwayDays: 45
    }
  });
});

app.get('/api/v1/accounting/close/last', (req, res) => {
  res.json({
    endDate: '2024-12-31',
    status: 'Clôturé'
  });
});

app.get('/api/v1/tax/vat/return', (req, res) => {
  const collected = syscohadaAccounts.find(a => a.code === '443100')?.balance || 0;
  const deductible = syscohadaAccounts.find(a => a.code === '445200')?.balance || 0;
  res.json({
    collected: Math.abs(collected),
    deductible,
    netVat: Math.abs(collected) - deductible,
    dueDate: '2025-02-15',
    period: '2025-01',
    status: 'pending'
  });
});

app.post('/api/v1/tax/vat/declare', (req, res) => {
  res.json({ success: true, message: 'Déclaration TVA transmise à la DGI', reference: `TVA-2025-${Date.now()}` });
});

app.get('/api/v1/accounting/fec/export', (req, res) => {
  res.json({ url: '/exports/fec-2025.txt', format: 'FEC', norm: 'SYSCOHADA' });
});

app.post('/api/v1/contacts/:id/email', (req, res) => {
  res.json({ success: true, message: 'Email envoyé avec succès' });
});

// Additional endpoints to prevent 404s
app.get('/api/v1/accounting/chart-of-accounts', (req, res) => {
  res.json(syscohadaAccounts);
});

app.post('/api/v1/accounting/chart-of-accounts', (req, res) => {
  const newAccount = { ...req.body, balance: 0 };
  syscohadaAccounts.push(newAccount);
  res.json(newAccount);
});

app.get('/api/v1/accounting/general-ledger', (req, res) => {
  res.json(journalEntries);
});

app.post('/api/v1/accounting/journal-entries', (req, res) => {
  const newEntry = {
    id: `je-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    reference: `JE-${journalEntries.length + 1}`,
    ...req.body
  };
  journalEntries.push(newEntry);
  
  // Update account balances
  const debitAccount = syscohadaAccounts.find(a => a.code === req.body.debit?.account);
  const creditAccount = syscohadaAccounts.find(a => a.code === req.body.credit?.account);
  if (debitAccount) debitAccount.balance += req.body.debit.amount;
  if (creditAccount) creditAccount.balance -= req.body.credit.amount;
  
  res.json(newEntry);
});

app.get('/api/v1/treasury/forecast', (req, res) => {
  res.json({
    summary: { currentBalance: 15000000 },
    series: [{ date: "2025-01-20", balance: 15500000 }]
  });
});



app.get('/api/v1/inventory', (req, res) => {
  res.json([{ id: "1", name: "Produit Demo", stock: 100 }]);
});

app.get('/api/v1/purchases', (req, res) => {
  res.json([{ id: "1", supplier: "Fournisseur Demo", amount: 50000 }]);
});

app.get('/api/v1/purchases/suppliers', (req, res) => {
  res.json([{ id: "1", name: "Fournisseur Demo", status: "active" }]);
});

app.get('/api/v1/tax', (req, res) => {
  res.json({ vatDue: 80000, nextDue: "2025-02-15" });
});

app.get('/api/v1/accountant', (req, res) => {
  res.json({ message: "Accountant module" });
});

app.get('/api/v1/accountant/assets', (req, res) => {
  res.json([{ id: "1", name: "Ordinateur", value: 50000 }]);
});

app.get('/api/v1/accountant/close', (req, res) => {
  res.json({ lastClosure: "2024-12-31", status: "Closed" });
});

app.get('/api/v1/accountant/validation', (req, res) => {
  res.json({ fecStatus: "Valid", lastCheck: "2025-01-15" });
});

app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Mock server on :${PORT}`));
