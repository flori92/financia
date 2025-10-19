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
app.get('/api/v1/accounting/aged-balance', (req, res) => res.json({ items: [] }));
app.get('/api/v1/accounting/trial-balance', (req, res) => res.json({ accounts: [] }));
app.get('/api/v1/accounting/profit-loss', (req, res) => res.json({ revenue: 5000000, expenses: 3500000, netProfit: 1500000 }));

app.listen(3001, () => console.log('Mock server on :3001'));
