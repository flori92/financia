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

// ==================== ACCOUNTING ====================
app.get('/api/v1/accounting/dashboard/metrics', (req, res) => res.json({
  kpiMonth: { revenue: 5000000, expenses: 3500000, netIncome: 1500000, margin: 30 },
  evolutionChart: generateMonthData(),
  topClients: [{ name: 'Client A', amount: 2000000 }, { name: 'Client B', amount: 1500000 }],
  topSuppliers: [{ name: 'Fournisseur A', amount: 1500000 }],
  financialRatios: { liquidityRatio: 1.5, solvencyRatio: 0.6 },
  recentActivity: { entries: [] },
  alerts: []
}));

app.get('/api/v1/accounting/accounts', (req, res) => res.json([
  { id: '1', accountNumber: '411000', label: 'Clients', syscohadaClass: 4, balance: 5000000 }
]));

app.get('/api/v1/accounting/journal-entries', (req, res) => res.json([
  { id: '1', date: '2025-10-15', description: 'Vente', reference: 'VT001', amount: 1000000, status: 'posted' }
]));

app.get('/api/v1/accounting/aged-balance', (req, res) => res.json({
  totals: { current: 3000000, days30_60: 1500000, days60_90: 800000, over90: 500000, total: 5800000 },
  items: [
    { party: 'Client A', total: 3000000, current: 2000000, days30_60: 1000000, days60_90: 0, over90: 0, oldestDate: '2025-09-15' }
  ]
}));

app.get('/api/v1/accounting/trial-balance', (req, res) => res.json({
  rows: [
    { number: '411000', name: 'Clients', debit: 5000000, credit: 0, balance: 5000000 },
    { number: '701000', name: 'Ventes', debit: 0, credit: 8000000, balance: -8000000 }
  ],
  totals: { debit: 5000000, credit: 8000000, balance: -3000000 }
}));

app.get('/api/v1/accounting/profit-loss', (req, res) => res.json({
  revenues: [
    { number: '701000', name: 'Ventes de marchandises', amount: 5000000 },
    { number: '706000', name: 'Prestations de services', amount: 3000000 }
  ],
  expenses: [
    { number: '601000', name: 'Achats de marchandises', amount: 3000000 },
    { number: '661000', name: 'Salaires', amount: 1000000 }
  ],
  totals: { revenues: 8000000, expenses: 4000000, result: 4000000 }
}));

app.get('/api/v1/accounting/balance-sheet', (req, res) => res.json({
  assets: [
    { number: '411000', name: 'Clients', amount: 5000000 },
    { number: '512000', name: 'Banque', amount: 3000000 }
  ],
  liabilities: [{ number: '401000', name: 'Fournisseurs', amount: 3000000 }],
  equity: [{ number: '101000', name: 'Capital', amount: 5000000 }],
  totals: { assets: 8000000, liabilitiesEquity: 8000000 }
}));

app.get('/api/v1/accounting/general-ledger', (req, res) => res.json({
  entries: [{ date: '2025-10-15', reference: 'VT001', description: 'Vente', debit: 1000000, credit: 0, balance: 1000000 }]
}));

app.get('/api/v1/accounting/closure', (req, res) => res.json([
  { id: '1', period: '2025-09', status: 'closed', closedAt: '2025-10-01', closedBy: 'Admin' }
]));
app.post('/api/v1/accounting/closure', (req, res) => res.json({ id: Date.now().toString(), ...req.body, status: 'closed' }));

// ==================== CRM ====================
app.get('/api/v1/crm/dashboard', (req, res) => res.json({
  stats: { totalContacts: 150, activeOpportunities: 25, wonDeals: 12, revenue: 15000000 },
  pipeline: [
    { stage: 'Prospect', count: 10, value: 5000000 },
    { stage: 'Qualification', count: 8, value: 4000000 },
    { stage: 'Proposition', count: 5, value: 3500000 },
    { stage: 'Négociation', count: 2, value: 2500000 }
  ],
  recentActivities: [
    { id: '1', type: 'call', contact: 'Jean Dupont', date: '2025-10-19', description: 'Appel de suivi' }
  ]
}));

app.get('/api/v1/crm/contacts', (req, res) => res.json([
  { id: '1', name: 'Jean Dupont', company: 'Entreprise A', email: 'jean@example.com', phone: '+229 12345678', status: 'active', value: 2000000 },
  { id: '2', name: 'Marie Martin', company: 'Société B', email: 'marie@example.com', phone: '+229 87654321', status: 'active', value: 1500000 }
]));

app.get('/api/v1/crm/contacts/:id', (req, res) => res.json({
  id: req.params.id,
  name: 'Jean Dupont',
  company: 'Entreprise A',
  email: 'jean@example.com',
  phone: '+229 12345678',
  address: 'Cotonou, Bénin',
  status: 'active',
  totalValue: 2000000,
  opportunities: [
    { id: '1', title: 'Projet ERP', stage: 'Proposition', value: 1500000, probability: 70 }
  ],
  activities: [
    { id: '1', type: 'call', date: '2025-10-19', description: 'Appel de suivi', user: 'Admin' }
  ],
  invoices: [
    { id: '1', number: 'INV-001', date: '2025-10-01', amount: 500000, status: 'paid' }
  ]
}));

app.post('/api/v1/crm/contacts', (req, res) => res.json({ id: Date.now().toString(), ...req.body }));
app.put('/api/v1/crm/contacts/:id', (req, res) => res.json({ id: req.params.id, ...req.body }));

app.get('/api/v1/crm/opportunities', (req, res) => res.json([
  { id: '1', title: 'Projet ERP', contact: 'Jean Dupont', stage: 'Proposition', value: 1500000, probability: 70, closeDate: '2025-11-30' },
  { id: '2', title: 'Formation', contact: 'Marie Martin', stage: 'Qualification', value: 500000, probability: 50, closeDate: '2025-12-15' }
]));

app.post('/api/v1/crm/opportunities', (req, res) => res.json({ id: Date.now().toString(), ...req.body }));

// ==================== ERP - INVENTORY ====================
app.get('/api/v1/inventory/products', (req, res) => res.json([
  { id: '1', sku: 'PROD-001', name: 'Ordinateur portable', category: 'Informatique', stock: 25, minStock: 10, price: 500000, cost: 350000 },
  { id: '2', sku: 'PROD-002', name: 'Imprimante', category: 'Bureautique', stock: 15, minStock: 5, price: 150000, cost: 100000 },
  { id: '3', sku: 'PROD-003', name: 'Souris', category: 'Accessoires', stock: 5, minStock: 10, price: 5000, cost: 3000, alert: true }
]));

app.get('/api/v1/inventory/products/:id', (req, res) => res.json({
  id: req.params.id,
  sku: 'PROD-001',
  name: 'Ordinateur portable',
  category: 'Informatique',
  stock: 25,
  minStock: 10,
  price: 500000,
  cost: 350000,
  movements: [
    { date: '2025-10-15', type: 'in', quantity: 10, reference: 'PO-001' },
    { date: '2025-10-18', type: 'out', quantity: 5, reference: 'SO-001' }
  ]
}));

app.post('/api/v1/inventory/products', (req, res) => res.json({ id: Date.now().toString(), ...req.body }));

app.get('/api/v1/inventory/movements', (req, res) => res.json([
  { id: '1', date: '2025-10-15', product: 'Ordinateur portable', type: 'in', quantity: 10, reference: 'PO-001' },
  { id: '2', date: '2025-10-18', product: 'Ordinateur portable', type: 'out', quantity: 5, reference: 'SO-001' }
]));

// ==================== ERP - PURCHASES ====================
app.get('/api/v1/purchases/orders', (req, res) => res.json([
  { id: '1', number: 'PO-001', date: '2025-10-10', supplier: 'Fournisseur A', amount: 3500000, status: 'received' },
  { id: '2', number: 'PO-002', date: '2025-10-15', supplier: 'Fournisseur B', amount: 1500000, status: 'pending' }
]));

app.post('/api/v1/purchases/orders', (req, res) => res.json({ id: Date.now().toString(), ...req.body }));

// ==================== INVOICES ====================
app.get('/api/v1/invoices', (req, res) => res.json([
  { id: '1', number: 'INV-001', date: '2025-10-15', customer: 'Client A', amount: 1000000, status: 'paid' },
  { id: '2', number: 'INV-002', date: '2025-10-18', customer: 'Client B', amount: 500000, status: 'pending' }
]));

app.post('/api/v1/invoices', (req, res) => res.json({ id: Date.now().toString(), ...req.body }));

// ==================== COMPANIES ====================
app.get('/api/v1/companies', (req, res) => res.json([
  { id: '1805bc61-7cfd-44e9-8a63-17187bf05dc7', name: 'Ma Société', nif: '123456789', country: 'Bénin' }
]));

// ==================== TREASURY ====================
app.get('/api/v1/treasury/accounts', (req, res) => res.json([
  { id: '1', name: 'Compte Principal', bank: 'BCEAO', balance: 5000000, currency: 'XOF' }
]));

app.get('/api/v1/treasury/transactions', (req, res) => res.json([
  { id: '1', date: '2025-10-15', description: 'Virement', amount: 500000, type: 'credit' }
]));

// ==================== BANKING ====================
app.get('/api/v1/banking/transactions', (req, res) => res.json([
  { id: '1', date: '2025-10-15', description: 'Virement entrant', amount: 500000, type: 'credit', status: 'completed' }
]));

app.get('/api/v1/banking/accounts', (req, res) => res.json([
  { id: '1', name: 'Compte Courant', bank: 'BCEAO', accountNumber: '123456789', balance: 5000000 }
]));

// ==================== TAX ====================
app.get('/api/v1/tax/declarations', (req, res) => res.json([
  { id: '1', period: '2025-09', type: 'VAT', status: 'submitted', amount: 180000 }
]));

app.get('/api/v1/tax/vat', (req, res) => res.json({
  collected: 900000,
  paid: 600000,
  due: 300000,
  details: [{ month: 'Sept 2025', collected: 300000, paid: 200000, due: 100000 }]
}));

// ==================== AUTH ====================
app.post('/api/v1/auth/login', (req, res) => res.json({ 
  token: 'mock-token', 
  user: { id: '1', email: req.body.email, name: 'Utilisateur Test' } 
}));

// ==================== CATCH ALL ====================
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.path}`);
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.listen(3001, () => console.log('✅ BMS Backend intégré sur :3001'));
