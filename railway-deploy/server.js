const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      frontend: 'running',
      backend: 'running'
    }
  });
});

// API Routes - Proxy vers le backend
app.use('/api', (req, res, next) => {
  // Pour le déploiement Railway, le backend tourne sur le même serveur
  // Nous allons créer les routes API directement ici
  next();
});

// Routes API de démonstration (à remplacer par les vraies routes backend)
app.get('/api/v1/accounting/profit-loss', (req, res) => {
  res.json({
    period: '2025-Q1',
    revenue: 5000000,
    expenses: 3200000,
    netIncome: 1800000,
    margin: 36
  });
});

app.get('/api/v1/accounting/trial-balance', (req, res) => {
  res.json({
    accounts: [
      { accountNumber: '101', accountName: 'Capital', debit: 0, credit: 10000000 },
      { accountNumber: '512', accountName: 'Banque', debit: 8500000, credit: 0 }
    ],
    totalDebit: 8500000,
    totalCredit: 8500000,
    isBalanced: true
  });
});

app.get('/api/v1/accounting/balance-sheet', (req, res) => {
  res.json({
    assets: { total: 15000000 },
    liabilities: { total: 5000000 },
    equity: { total: 10000000 },
    period: '2025-Q1'
  });
});

app.get('/api/v1/accounting/general-ledger', (req, res) => {
  res.json({
    entries: [
      {
        id: '1',
        entryNumber: 'JOU001',
        entryDate: '2025-01-15',
        accountNumber: '512',
        accountName: 'Banque',
        description: 'Vente client',
        debit: 1000000,
        credit: 0,
        balance: 8500000
      }
    ],
    totalDebit: 1000000,
    totalCredit: 1000000,
    period: '2025-Q1'
  });
});

app.get('/api/v1/budget/summary', (req, res) => {
  res.json({
    totalBudget: 10000000,
    totalSpent: 6500000,
    totalRemaining: 3500000,
    variancePercentage: 65,
    period: '2025-Q1'
  });
});

app.get('/api/v1/treasury/summary', (req, res) => {
  res.json({
    accounts: [
      { id: '1', name: 'Compte BNI', bank: 'BNI', balance: 15000000, currency: 'FCFA', status: 'Connecté', lastUpdated: '2025-01-19' }
    ],
    forecast: [
      { date: '2025-01-20', inflow: 2000000, outflow: 1500000, balance: 15500000 }
    ],
    totalBalance: 15000000,
    totalInflow: 2000000,
    totalOutflow: 1500000,
    period: 'Trésorerie actuelle'
  });
});

app.get('/api/v1/accounting/cash-flow-coherence', (req, res) => {
  res.json({
    cashFlowData: [
      {
        period: '2025-10',
        revenue: 3200000,
        cashInflow: 2800000,
        cashOutflow: 2100000,
        netCashFlow: 700000,
        conversionRate: 87.5,
        daysSalesOutstanding: 35,
        collectionRate: 85.2,
        status: 'warning'
      }
    ],
    metrics: {
      revenueCashGap: 400000,
      cashConversionEfficiency: 85.2,
      liquidityRatio: 1.8,
      workingCapital: 1200000,
      operatingCashFlow: 700000,
      freeCashFlow: 450000
    },
    alerts: [
      {
        type: 'warning',
        title: 'Taux de conversion en baisse',
        description: 'Le taux de conversion revenu/encaissement est de 87.5%',
        impact: 'Impact modéré sur la trésorerie',
        recommendation: 'Renforcer le suivi des créances clients'
      }
    ]
  });
});

app.get('/api/v1/settings/users', (req, res) => {
  res.json({
    users: [
      { id: '1', name: 'Admin BMS', email: 'admin@bms.bj', role: 'admin', status: 'active', createdAt: '2025-01-01', lastLogin: '2025-01-19' }
    ],
    totalUsers: 1,
    activeUsers: 1,
    period: 'Utilisateurs actuels'
  });
});

// Servir le frontend statique (build Next.js)
app.use(express.static(path.join(__dirname, 'frontend', '.next')));

// Toutes les autres routes vers le frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', '.next', 'server', 'app.html'));
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 BMS Full Stack Server running on port ${PORT}`);
  console.log(`📊 Frontend: http://localhost:${PORT}`);
  console.log(`🔧 Backend API: http://localhost:${PORT}/api`);
});

module.exports = app;
