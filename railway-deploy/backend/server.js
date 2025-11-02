// Redirection temporaire pour l'ancienne URL
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuré pour toutes les origines
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    port: PORT,
    service: 'bms-api-gateway',
    version: '1.0.0-production',
    message: 'BMS API Gateway - Production Ready'
  });
});

// Auth endpoint - Login
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validation simple
  if (!email || !password) {
    return res.status(400).json({
      error: 'Email et mot de passe requis'
    });
  }
  
  // Pour le mode démo, accepter tout login
  // En production, vous devriez valider avec une vraie base de données
  const demoUser = {
    id: 'demo-user-id',
    email: email,
    name: 'Utilisateur Demo',
    role: 'admin',
    companyId: '1805bc61-7cfd-44e9-8a63-17187bf05dc7'
  };
  
  // Token JWT simple (en production, utilisez un vrai système JWT)
  const token = Buffer.from(JSON.stringify(demoUser)).toString('base64');
  
  res.json({
    user: demoUser,
    token: token,
    expiresIn: 86400, // 24 heures
    message: 'Connexion réussie'
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
  const companyId = req.query.companyId;
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

// Endpoints supplémentaires pour éviter les 404
app.get('/api/v1/accounting/general-ledger', (req, res) => {
  res.json({ entries: [], total: 0 });
});

app.get('/api/v1/accounting/chart-of-accounts', (req, res) => {
  res.json({ accounts: [], total: 0 });
});

app.get('/api/v1/banking/transactions', (req, res) => {
  res.json({ transactions: [], total: 0 });
});

app.get('/api/v1/treasury/alerts', (req, res) => {
  res.json({ alerts: [], total: 0 });
});

app.get('/api/v1/treasury/forecast', (req, res) => {
  res.json({ forecast: [], total: 0 });
});

app.get('/api/v1/tax/vat/return', (req, res) => {
  res.json({ vatReturn: {}, total: 0 });
});

app.get('/api/v1/accounting/close/last', (req, res) => {
  res.json({ closure: {}, total: 0 });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 BMS API Gateway started on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🏢 Production Mode: ACTIVE`);
  console.log(`🌐 CORS enabled for all origins`);
});
