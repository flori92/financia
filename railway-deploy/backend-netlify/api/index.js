const express = require('express');
const serverless = require('serverless-http');

const app = express();

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'bms-api-gateway-netlify',
    version: '1.0.0-netlify'
  });
});

// Companies endpoint
app.get('/api/v1/companies', (req, res) => {
  res.json([
    {
      id: '1805bc61-7cfd-44e9-8a63-17187bf05dc7',
      name: 'BMS Demo SARL',
      legalName: 'BMS Demo Société à Responsabilité Limitée',
      registrationNumber: 'BJS123456789',
      taxId: 'BJS987654321',
      industry: 'Services Numériques',
      size: 'small',
      addressLine1: '123 Rue du Commerce, Cotonou, Bénin',
      city: 'Cotonou',
      country: 'BJ',
      phone: '+229 12345678',
      email: 'demo@bms.bj',
      website: 'https://bms-demo.bj',
      vatRate: 0.18,
      fiscalYearStart: '2025-01-01',
      defaultCurrency: 'XOF',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);
});

// Dashboard endpoint
app.get('/api/v1/accounting/dashboard/metrics', (req, res) => {
  res.json({
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
  });
});

// Aged balance endpoint
app.get('/api/v1/accounting/aged-balance', (req, res) => {
  const { type, asOfDate } = req.query;
  res.json({
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
  });
});

module.exports.handler = serverless(app);
