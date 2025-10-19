const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
const mockDashboard = {
  kpiMonth: { revenue: 5000000, expenses: 3500000, netIncome: 1500000, margin: 30 },
  evolutionChart: Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2025, i, 1).toLocaleDateString('fr-FR', { month: 'short' }),
    revenue: Math.random() * 10000000,
    expenses: Math.random() * 7000000
  })),
  topClients: [{ name: 'Client A', amount: 2000000 }],
  topSuppliers: [{ name: 'Fournisseur A', amount: 1500000 }],
  financialRatios: { liquidityRatio: 1.5, solvencyRatio: 0.6 },
  recentActivity: { entries: [] },
  alerts: []
};

app.get('/api/v1/accounting/dashboard/metrics', (req, res) => res.json(mockDashboard));
app.get('/api/v1/accounting/accounts', (req, res) => res.json([]));
app.get('/api/v1/accounting/journal-entries', (req, res) => res.json([]));
app.get('/api/v1/accounting/aged-balance', (req, res) => res.json({ 
  items: [],
  totals: { current: 0, days30_60: 0, days60_90: 0, over90: 0, total: 0 }
}));
app.get('/api/v1/accounting/trial-balance', (req, res) => res.json({ accounts: [] }));
app.get('/api/v1/accounting/profit-loss', (req, res) => res.json({ revenue: 5000000, expenses: 3500000, netProfit: 1500000 }));
app.get('/api/v1/invoices', (req, res) => res.json([]));
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
  res.json([{
    id: 'company-1',
    name: 'Société Demo',
    siret: '12345678900001',
    status: 'active'
  }]);
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
  res.json([{
    id: '1',
    name: 'Client Demo',
    email: 'client@demo.com',
    phone: '+229 12345678',
    company: 'Demo Corp',
    status: 'active'
  }]);
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
    confidence: 0.85,
    points: [
      { date: '2025-01-20', projectedBalance: 15500000 },
      { date: '2025-01-27', projectedBalance: 16000000 }
    ],
    recommendations: ['Situation stable', 'Continuer le suivi']
  });
});

app.all('*', (req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Mock server on :${PORT}`));
