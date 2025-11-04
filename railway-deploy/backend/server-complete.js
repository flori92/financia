const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data generators
const generateMonthData = () => Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2025, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
  revenue: Math.floor(Math.random() * 10000000),
  expenses: Math.floor(Math.random() * 7000000)
}));

// ACCOUNTING ENDPOINTS
app.get('/api/v1/accounting/dashboard/metrics', (req, res) => {
  res.json({
    kpiMonth: { revenue: 5000000, expenses: 3500000, netIncome: 1500000, margin: 30 },
    evolutionChart: generateMonthData(),
    topClients: [
      { name: 'Client A', amount: 2000000 },
      { name: 'Client B', amount: 1500000 }
    ],
    topSuppliers: [
      { name: 'Fournisseur A', amount: 1500000 },
      { name: 'Fournisseur B', amount: 1000000 }
    ],
    financialRatios: { liquidityRatio: 1.5, solvencyRatio: 0.6 },
    recentActivity: { entries: [] },
    alerts: []
  });
});

app.get('/api/v1/accounting/accounts', (req, res) => res.json([]));
app.get('/api/v1/accounting/journal-entries', (req, res) => res.json([]));
app.get('/api/v1/accounting/aged-balance', (req, res) => res.json({
  totals: { current: 3000000, days30_60: 1500000, days60_90: 800000, over90: 500000, total: 5800000 },
  items: [
    { party: 'Client A', total: 3000000, current: 2000000, days30_60: 1000000, days60_90: 0, over90: 0, oldestDate: '2025-09-15' },
    { party: 'Client B', total: 2800000, current: 1000000, days30_60: 500000, days60_90: 800000, over90: 500000, oldestDate: '2025-06-10' }
  ]
}));
app.get('/api/v1/accounting/trial-balance', (req, res) => res.json({ accounts: [] }));
app.get('/api/v1/accounting/profit-loss', (req, res) => res.json({ revenue: 5000000, expenses: 3500000, netProfit: 1500000 }));
app.get('/api/v1/accounting/balance-sheet', (req, res) => res.json({ assets: 10000000, liabilities: 6000000, equity: 4000000 }));
app.get('/api/v1/accounting/general-ledger', (req, res) => res.json({ entries: [] }));

// INVOICES
app.get('/api/v1/invoices', (req, res) => res.json([]));
app.post('/api/v1/invoices', (req, res) => res.json({ id: '1', ...req.body }));

// COMPANIES
app.get('/api/v1/companies', (req, res) => res.json([
  { id: '1805bc61-7cfd-44e9-8a63-17187bf05dc7', name: 'Ma Société', nif: '123456789' }
]));

// CRM
app.get('/api/v1/crm/customers', (req, res) => res.json([]));
app.get('/api/v1/crm/leads', (req, res) => res.json([]));

// TREASURY
app.get('/api/v1/treasury/accounts', (req, res) => res.json([]));
app.get('/api/v1/treasury/transactions', (req, res) => res.json([]));

// TAX
app.get('/api/v1/tax/declarations', (req, res) => res.json([]));

// PAYMENTS
app.get('/api/v1/payments', (req, res) => res.json([]));

// AUTH
app.post('/api/v1/auth/login', (req, res) => res.json({ token: 'mock-token', user: { id: '1', email: req.body.email } }));
app.post('/api/v1/auth/register', (req, res) => res.json({ token: 'mock-token', user: { id: '1', email: req.body.email } }));

// CATCH ALL
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.listen(3001, () => console.log('✅ Backend complet sur :3001'));
