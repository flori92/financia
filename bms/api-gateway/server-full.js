const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const generateMonthData = () => Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
  revenue: Math.floor(Math.random() * 10000000),
  expenses: Math.floor(Math.random() * 7000000)
}));

// ACCOUNTING
app.get('/api/v1/accounting/dashboard/metrics', (req, res) => res.json({
  kpiMonth: { revenue: 5000000, expenses: 3500000, netIncome: 1500000, margin: 30 },
  evolutionChart: generateMonthData(),
  topClients: [{ name: 'Client A', amount: 2000000 }, { name: 'Client B', amount: 1500000 }],
  topSuppliers: [{ name: 'Fournisseur A', amount: 1500000 }, { name: 'Fournisseur B', amount: 1000000 }],
  financialRatios: { liquidityRatio: 1.5, solvencyRatio: 0.6 },
  recentActivity: { entries: [] },
  alerts: []
}));

app.get('/api/v1/accounting/accounts', (req, res) => res.json([
  { id: '1', accountNumber: '411000', label: 'Clients', syscohadaClass: 4, balance: 5000000 },
  { id: '2', accountNumber: '401000', label: 'Fournisseurs', syscohadaClass: 4, balance: -3000000 }
]));

app.get('/api/v1/accounting/journal-entries', (req, res) => res.json([
  { id: '1', date: '2025-10-15', description: 'Vente', reference: 'VT001', amount: 1000000, status: 'posted' }
]));

app.get('/api/v1/accounting/aged-balance', (req, res) => res.json({
  totals: { current: 3000000, days30_60: 1500000, days60_90: 800000, over90: 500000, total: 5800000 },
  items: [
    { party: 'Client A', total: 3000000, current: 2000000, days30_60: 1000000, days60_90: 0, over90: 0, oldestDate: '2025-09-15' },
    { party: 'Client B', total: 2800000, current: 1000000, days30_60: 500000, days60_90: 800000, over90: 500000, oldestDate: '2025-06-10' }
  ]
}));

app.get('/api/v1/accounting/trial-balance', (req, res) => res.json({
  rows: [
    { number: '411000', name: 'Clients', debit: 5000000, credit: 0, balance: 5000000 },
    { number: '401000', name: 'Fournisseurs', debit: 0, credit: 3000000, balance: -3000000 },
    { number: '701000', name: 'Ventes', debit: 0, credit: 8000000, balance: -8000000 }
  ],
  totals: { debit: 5000000, credit: 11000000, balance: -6000000 }
}));

app.get('/api/v1/accounting/profit-loss', (req, res) => res.json({
  revenues: [
    { number: '701000', name: 'Ventes de marchandises', amount: 5000000 },
    { number: '706000', name: 'Prestations de services', amount: 3000000 }
  ],
  expenses: [
    { number: '601000', name: 'Achats de marchandises', amount: 3000000 },
    { number: '604000', name: 'Achats de matières', amount: 1500000 },
    { number: '661000', name: 'Salaires', amount: 1000000 }
  ],
  totals: { revenues: 8000000, expenses: 5500000, result: 2500000 }
}));

app.get('/api/v1/accounting/balance-sheet', (req, res) => res.json({
  assets: [
    { number: '411000', name: 'Clients', amount: 5000000 },
    { number: '512000', name: 'Banque', amount: 3000000 },
    { number: '211000', name: 'Immobilisations', amount: 5000000 }
  ],
  liabilities: [
    { number: '401000', name: 'Fournisseurs', amount: 3000000 },
    { number: '164000', name: 'Emprunts', amount: 2000000 }
  ],
  equity: [
    { number: '101000', name: 'Capital', amount: 5000000 },
    { number: '120000', name: 'Résultat', amount: 3000000 }
  ],
  totals: { assets: 13000000, liabilitiesEquity: 13000000 }
}));

app.get('/api/v1/accounting/general-ledger', (req, res) => res.json({
  entries: [
    { date: '2025-10-15', reference: 'VT001', description: 'Vente', debit: 1000000, credit: 0, balance: 1000000 }
  ]
}));

app.get('/api/v1/accounting/closure', (req, res) => res.json([
  { id: '1', period: '2025-09', status: 'closed', closedAt: '2025-10-01', closedBy: 'Admin' },
  { id: '2', period: '2025-08', status: 'closed', closedAt: '2025-09-01', closedBy: 'Admin' }
]));
app.post('/api/v1/accounting/closure', (req, res) => res.json({ id: Date.now().toString(), ...req.body, status: 'closed' }));

// INVOICES
app.get('/api/v1/invoices', (req, res) => res.json([
  { id: '1', number: 'INV-001', date: '2025-10-15', customer: 'Client A', amount: 1000000, status: 'paid' }
]));
app.post('/api/v1/invoices', (req, res) => res.json({ id: Date.now().toString(), ...req.body }));

// COMPANIES
app.get('/api/v1/companies', (req, res) => res.json([
  { id: '1805bc61-7cfd-44e9-8a63-17187bf05dc7', name: 'Ma Société', nif: '123456789', country: 'Bénin' }
]));

// CRM
app.get('/api/v1/crm/customers', (req, res) => res.json([
  { id: '1', name: 'Client A', email: 'clienta@example.com', phone: '+229 12345678', balance: 2000000 }
]));
app.get('/api/v1/crm/leads', (req, res) => res.json([
  { id: '1', name: 'Prospect A', status: 'new', value: 500000 }
]));
app.get('/api/v1/crm/opportunities', (req, res) => res.json([
  { id: '1', title: 'Opportunité A', customer: 'Client A', value: 1000000, stage: 'proposal' }
]));
app.get('/api/v1/crm/contacts', (req, res) => res.json([
  { id: '1', name: 'Contact A', company: 'Client A', email: 'contact@example.com' }
]));

// TREASURY
app.get('/api/v1/treasury/accounts', (req, res) => res.json([
  { id: '1', name: 'Compte Principal', bank: 'BCEAO', balance: 5000000, currency: 'XOF' }
]));
app.get('/api/v1/treasury/transactions', (req, res) => res.json([
  { id: '1', date: '2025-10-15', description: 'Virement', amount: 500000, type: 'credit' }
]));

// BANKING
app.get('/api/v1/banking/transactions', (req, res) => res.json([
  { id: '1', date: '2025-10-15', description: 'Virement entrant', amount: 500000, type: 'credit', status: 'completed' },
  { id: '2', date: '2025-10-14', description: 'Paiement fournisseur', amount: -300000, type: 'debit', status: 'completed' }
]));
app.get('/api/v1/banking/accounts', (req, res) => res.json([
  { id: '1', name: 'Compte Courant', bank: 'BCEAO', accountNumber: '123456789', balance: 5000000 }
]));

// TAX
app.get('/api/v1/tax/declarations', (req, res) => res.json([
  { id: '1', period: '2025-09', type: 'VAT', status: 'submitted', amount: 180000 }
]));
app.get('/api/v1/tax/vat', (req, res) => res.json({
  collected: 900000,
  paid: 600000,
  due: 300000,
  details: [
    { month: 'Sept 2025', collected: 300000, paid: 200000, due: 100000 }
  ]
}));

// PAYMENTS
app.get('/api/v1/payments', (req, res) => res.json([
  { id: '1', date: '2025-10-15', customer: 'Client A', amount: 1000000, method: 'bank' }
]));

// TRANSACTIONS
app.get('/api/v1/transactions', (req, res) => res.json([
  { id: '1', date: '2025-10-15', description: 'Vente', amount: 1000000, type: 'income' }
]));

// FINANCIAL ANALYSIS
app.get('/api/v1/financial-analysis/metrics', (req, res) => res.json({
  profitability: { margin: 30, roe: 25, roa: 20 },
  liquidity: { current: 1.5, quick: 1.2 },
  solvency: { debtToEquity: 0.8, equityRatio: 0.6 }
}));

// NIF
app.get('/api/v1/nif/verify', (req, res) => res.json({
  valid: true,
  company: { name: 'Société Test', nif: req.query.nif }
}));

// AUTH
app.post('/api/v1/auth/login', (req, res) => res.json({ 
  token: 'mock-token', 
  user: { id: '1', email: req.body.email, name: 'Utilisateur Test' } 
}));
app.post('/api/v1/auth/register', (req, res) => res.json({ 
  token: 'mock-token', 
  user: { id: '1', email: req.body.email } 
}));

// CATCH ALL
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.listen(3001, () => console.log('✅ Backend complet sur :3001'));
