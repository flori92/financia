// BMS Backend Dynamic - Mode Hybride Statique/Dynamique
const express = require('express');
const cors = require('cors');

// Import du système dynamique
const database = require('./database');
const DynamicService = require('./services/DynamicService');
const TreasuryService = require('./services/TreasuryService');
const AccountingService = require('./services/AccountingService');
const CommunicationService = require('./services/CommunicationService');
const CRMService = require('./services/CRMService');
const TreasuryOperationsService = require('./services/TreasuryOperationsService');
const EmailService = require('./services/EmailService');
const SMSService = require('./services/SMSService');
const MobileMoneyService = require('./services/MobileMoneyService');
const SalesService = require('./src/sales/sales.service');
const HRService = require('./src/hr/hr.service');
const ProjectsService = require('./src/projects/projects.service');
const MarketingService = require('./src/marketing/marketing.service');
const MLForecastService = require('./src/ml-forecast/ml-forecast.service');
const OCRController = require('./src/ai/ocr.controller');

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

// Treasury endpoints
app.get('/api/v1/treasury/forecast', (req, res) => {
  const { companyId } = req.query;
  res.json({
    forecast: [
      { date: '2025-11-01', inflow: 1500000, outflow: 1200000, balance: 300000 },
      { date: '2025-11-02', inflow: 800000, outflow: 600000, balance: 500000 },
      { date: '2025-11-03', inflow: 2000000, outflow: 1800000, balance: 700000 }
    ],
    totalInflow: 4300000,
    totalOutflow: 3600000,
    netBalance: 700000
  });
});

app.get('/api/v1/treasury/alerts', (req, res) => {
  const { companyId } = req.query;
  res.json({
    alerts: [
      { type: 'warning', title: 'Solde bancaire faible', message: 'Le solde prévu pour demain est inférieur à 100 000 FCFA' },
      { type: 'danger', title: 'Échéance imminente', message: '3 factures fournisseurs arrivent à échéance demain' }
    ],
    count: 2
  });
});

app.get('/api/v1/treasury/direct-debits', (req, res) => {
  const { companyId } = req.query;
  res.json([
    {
      id: '1',
      creditor: 'Fournisseur A',
      amount: 500000,
      nextDate: '2025-11-05',
      frequency: 'monthly',
      status: 'active'
    },
    {
      id: '2',
      creditor: 'Fournisseur B',
      amount: 300000,
      nextDate: '2025-11-10',
      frequency: 'monthly',
      status: 'active'
    }
  ]);
});

app.get('/api/v1/treasury/direct-debits/statistics', (req, res) => {
  res.json({
    totalActive: 5,
    totalAmount: 2500000,
    nextMonthTotal: 800000,
    averageAmount: 500000
  });
});

app.post('/api/v1/treasury/direct-debits', (req, res) => {
  const newDebit = { id: Date.now().toString(), ...req.body, status: 'active' };
  res.json(newDebit);
});

app.put('/api/v1/treasury/direct-debits/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/v1/treasury/direct-debits/:id', (req, res) => {
  res.json({ success: true, message: 'Prélèvement supprimé' });
});

app.post('/api/v1/treasury/direct-debits/:id/suspend', (req, res) => {
  res.json({ success: true, status: 'suspended' });
});

app.post('/api/v1/treasury/direct-debits/:id/reactivate', (req, res) => {
  res.json({ success: true, status: 'active' });
});

app.post('/api/v1/treasury/direct-debits/:id/cancel', (req, res) => {
  res.json({ success: true, status: 'cancelled' });
});

// Accounting endpoints
app.get('/api/v1/accounting/trial-balance', (req, res) => {
  const { companyId } = req.query;
  res.json({
    accounts: [
      { code: '101000', name: 'Capital Social', balance: 20000000, type: 'equity' },
      { code: '411000', name: 'Clients', balance: 5000000, type: 'asset' },
      { code: '401000', name: 'Fournisseurs', balance: -3000000, type: 'liability' }
    ],
    totalAssets: 25000000,
    totalLiabilities: 18000000,
    totalEquity: 20000000
  });
});

app.get('/api/v1/accounting/profit-loss', (req, res) => {
  const { companyId } = req.query;
  res.json({
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
  });
});

app.get('/api/v1/accounting/balance-sheet', (req, res) => {
  const { companyId } = req.query;
  res.json({
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
  });
});

app.get('/api/v1/accounting/general-ledger', (req, res) => {
  const { companyId } = req.query;
  res.json([
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
  ]);
});

app.get('/api/v1/accounting/chart-of-accounts', (req, res) => {
  const { companyId } = req.query;
  res.json([
    { code: '101000', name: 'Capital Social', type: 'equity', class: '1' },
    { code: '401000', name: 'Fournisseurs', type: 'liability', class: '4' },
    { code: '411000', name: 'Clients', type: 'asset', class: '4' },
    { code: '601000', name: 'Achats marchandises', type: 'expense', class: '6' },
    { code: '701000', name: 'Ventes marchandises', type: 'revenue', class: '7' }
  ]);
});

app.post('/api/v1/accounting/journal-entries', (req, res) => {
  const newEntry = { id: Date.now().toString(), ...req.body, status: 'draft' };
  res.json(newEntry);
});

app.get('/api/v1/accounting/closure', (req, res) => {
  const { companyId } = req.query;
  res.json({
    canClose: true,
    lastClosureDate: '2025-10-31',
    pendingEntries: 0,
    warnings: []
  });
});

app.get('/api/v1/accounting/closure/preview', (req, res) => {
  const { companyId, period } = req.query;
  res.json({
    revenueTotal: 17000000,
    expenseTotal: 12000000,
    netResult: 3000000,
    entriesToClose: 15
  });
});

app.post('/api/v1/accounting/closure/close', (req, res) => {
  res.json({
    success: true,
    closureDate: new Date().toISOString().split('T')[0],
    message: 'Clôture effectuée avec succès'
  });
});

app.get('/api/v1/accounting/close/last', (req, res) => {
  res.json({
    date: '2025-10-31',
    status: 'completed',
    netResult: 2500000
  });
});

app.post('/api/v1/accounting/closure/close', (req, res) => {
  res.json({
    success: true,
    message: 'Clôture effectuée avec succès',
    closureId: 'closure_' + Date.now()
  });
});

app.get('/api/v1/accounting/close', (req, res) => {
  res.json([
    {
      id: 'closure_1',
      startDate: '2025-10-01',
      endDate: '2025-10-31',
      status: 'completed',
      closedAt: '2025-11-01T10:00:00Z',
      resultAmount: 2500000
    }
  ]);
});

// Banking endpoints
app.get('/api/v1/banking/transactions', (req, res) => {
  const { companyId } = req.query;
  res.json([
    {
      id: '1',
      date: '2025-11-01',
      description: 'Virement Client Alpha',
      amount: 1000000,
      type: 'credit',
      status: 'matched'
    },
    {
      id: '2',
      date: '2025-11-02',
      description: 'Paiement Fournisseur A',
      amount: -500000,
      type: 'debit',
      status: 'unmatched'
    }
  ]);
});

app.post('/api/v1/banking/auto-match', (req, res) => {
  res.json({
    matched: 3,
    unmatched: 2,
    totalProcessed: 5
  });
});

app.get('/api/v1/banking/transactions/:id/entry-suggest', (req, res) => {
  res.json({
    suggestedAccount: '411000',
    suggestedAccountName: 'Clients',
    confidence: 0.95
  });
});

app.post('/api/v1/banking/reconcile-entry', (req, res) => {
  res.json({
    success: true,
    message: 'Transaction rapprochée avec succès'
  });
});

app.post('/api/v1/banking/import-csv', (req, res) => {
  const { csvContent, companyId } = req.body;
  // Simulation d'import CSV
  const lines = csvContent.split('\n').filter(l => l.trim());
  const imported = Math.max(0, lines.length - 1); // -1 pour header
  const skipped = Math.floor(imported * 0.1); // 10% de doublons simulés
  
  res.json({
    imported: imported - skipped,
    skipped,
    total: imported
  });
});

app.post('/api/v1/banking/bulk-reconcile', (req, res) => {
  const { transactionIds, companyId } = req.body;
  const reconciled = transactionIds.length;
  const failed = 0;
  
  res.json({
    reconciled,
    failed,
    message: `${reconciled} transactions rapprochées`
  });
});

app.post('/api/v1/banking/bulk-ignore', (req, res) => {
  const { transactionIds, companyId } = req.body;
  const ignored = transactionIds.length;
  
  res.json({
    ignored,
    message: `${ignored} transactions ignorées`
  });
});

app.get('/api/v1/banking/history', (req, res) => {
  const { companyId, limit = 50 } = req.query;
  
  const mockHistory = [
    {
      action: 'reconcile',
      description: 'Rapprochement transaction bancaire',
      transactionId: 'TX-001',
      amount: 150000,
      notes: 'Paiement facture F-2025-001',
      user: 'admin@bms.com',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      action: 'ignore',
      description: 'Transaction ignorée',
      transactionId: 'TX-005',
      amount: -5000,
      notes: 'Frais bancaires',
      user: 'comptable@bms.com',
      createdAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
      action: 'reconcile',
      description: 'Lettrage automatique',
      transactionId: 'TX-003',
      amount: 250000,
      user: 'system',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  
  res.json(mockHistory.slice(0, parseInt(limit)));
});

// Tax endpoints
app.get('/api/v1/tax/vat/return', (req, res) => {
  const { companyId, startDate, endDate } = req.query;
  res.json({
    period: { startDate, endDate },
    vatCollected: 2700000,
    vatDeductible: 1440000,
    vatDue: 1260000,
    turnover: 15000000
  });
});

app.post('/api/v1/tax/vat/recalculate', (req, res) => {
  res.json({
    success: true,
    vatDue: 1260000,
    message: 'TVA recalculée avec succès'
  });
});

app.get('/api/v1/tax/export/fec', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=fec.csv');
  res.send('JournalCode,JournalLib,EcritureNum,EcritureDate,CompteNum,CompteLib,CompAuxNum,CompAuxLib,PieceRef,PieceDate,EcritureLib,Debit,Credit,DateLet,DateValid, Montantdevise, Idevise\n');
});

app.get('/api/v1/tax/generate-ca3-pdf', (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=ca3.pdf');
  res.send('%PDF-1.4');
});

// ========== AI ENDPOINTS (OCR Hybride Google Vision + OCR Space) ==========
const ocrController = new OCRController();
const ocrUpload = ocrController.getUploadMiddleware();

// POST /api/v1/ai/ocr/:type - Extraction OCR avec stratégie hybride
// Params: type = invoice|receipt|bank_statement
// Body: multipart/form-data avec file
app.post('/api/v1/ai/ocr/:type', ocrUpload, async (req, res) => {
  await ocrController.extractDocument(req, res);
});

// GET /api/v1/ai/ocr/stats - Statistiques d'utilisation OCR
app.get('/api/v1/ai/ocr/stats', async (req, res) => {
  await ocrController.getStats(req, res);
});

// POST /api/v1/ai/ocr/test - Tester configuration OCR
app.post('/api/v1/ai/ocr/test', async (req, res) => {
  await ocrController.testConfiguration(req, res);
});

// POST /api/v1/ai/chat - Chat IA (placeholder)
app.post('/api/v1/ai/chat', (req, res) => {
  const { message } = req.body;
  res.json({
    response: `Réponse IA à: ${message}`,
    timestamp: new Date().toISOString()
  });
});

// HR endpoints
app.get('/api/v1/hr/employees', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Jean Dupont',
      position: 'Développeur',
      department: 'IT',
      status: 'active',
      hireDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Marie Koné',
      position: 'Comptable',
      department: 'Finance',
      status: 'active',
      hireDate: '2023-06-20'
    }
  ]);
});

app.get('/api/v1/hr/payroll', (req, res) => {
  res.json([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Jean Dupont',
      month: '2025-11',
      grossSalary: 500000,
      netSalary: 420000,
      status: 'processed'
    }
  ]);
});

// HR Timesheets endpoints
app.get('/api/hr/timesheets', async (req, res) => {
  try {
    const { companyId, employeeId, startDate, endDate, status } = req.query;
    
    // Mock timesheets data
    const mockTimesheets = [
      {
        id: '1',
        employeeId: '1',
        employeeName: 'Jean Dupont',
        weekStart: '2025-10-27',
        weekEnd: '2025-11-02',
        totalHours: 40,
        status: 'submitted',
        entries: [
          { date: '2025-10-27', project: 'Projet A', hours: 8 },
          { date: '2025-10-28', project: 'Projet A', hours: 8 },
          { date: '2025-10-29', project: 'Projet B', hours: 8 },
          { date: '2025-10-30', project: 'Projet B', hours: 8 },
          { date: '2025-10-31', project: 'Projet A', hours: 8 }
        ]
      },
      {
        id: '2',
        employeeId: '2',
        employeeName: 'Marie Koné',
        weekStart: '2025-10-27',
        weekEnd: '2025-11-02',
        totalHours: 38,
        status: 'draft',
        entries: [
          { date: '2025-10-27', project: 'Comptabilité', hours: 7.5 },
          { date: '2025-10-28', project: 'Comptabilité', hours: 7.5 },
          { date: '2025-10-29', project: 'Rapports', hours: 8 },
          { date: '2025-10-30', project: 'Comptabilité', hours: 7.5 },
          { date: '2025-10-31', project: 'Rapports', hours: 7.5 }
        ]
      }
    ];
    
    // Filter by criteria if provided
    let filteredTimesheets = mockTimesheets;
    if (employeeId) {
      filteredTimesheets = filteredTimesheets.filter(ts => ts.employeeId === employeeId);
    }
    if (status) {
      filteredTimesheets = filteredTimesheets.filter(ts => ts.status === status);
    }
    
    res.json(filteredTimesheets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hr/timesheets/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({ 
      success: true, 
      message: `Timesheet ${id} soumis avec succès`,
      status: 'submitted'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/hr/timesheets/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const { approverId } = req.body;
    res.json({ 
      success: true, 
      message: `Timesheet ${id} approuvé par ${approverId}`,
      status: 'approved',
      approvedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRM endpoints
app.get('/api/v1/crm/dashboard', (req, res) => {
  res.json({
    totalContacts: 150,
    activeCustomers: 80,
    activeSuppliers: 45,
    recentActivity: [
      { type: 'contact_added', name: 'Nouveau Client', date: '2025-11-01' },
      { type: 'contact_updated', name: 'Client Alpha', date: '2025-10-31' }
    ]
  });
});

app.get('/api/v1/crm/contacts', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Client Alpha',
      type: 'customer',
      email: 'alpha@client.com',
      phone: '+229 12345678',
      status: 'active'
    },
    {
      id: '2',
      name: 'Fournisseur Beta',
      type: 'supplier',
      email: 'beta@supplier.com',
      phone: '+229 87654321',
      status: 'active'
    }
  ]);
});

app.get('/api/v1/crm/contacts/:id', (req, res) => {
  res.json({
    id: req.params.id,
    name: 'Client Alpha',
    type: 'customer',
    email: 'alpha@client.com',
    phone: '+229 12345678',
    address: '123 Rue du Commerce, Cotonou',
    status: 'active'
  });
});

app.post('/api/v1/crm/contacts', (req, res) => {
  const newContact = { id: Date.now().toString(), ...req.body };
  res.json(newContact);
});

app.put('/api/v1/crm/contacts/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/v1/crm/contacts/:id', (req, res) => {
  res.json({ success: true, message: 'Contact supprimé' });
});

// Payments All Transactions Endpoint
app.get('/payments/all-transactions', async (req, res) => {
  try {
    const { companyId, limit = 50, offset = 0, type, status } = req.query;
    
    // Mock comprehensive transactions data
    const mockTransactions = [
      {
        id: '1',
        type: 'payment',
        amount: 500000,
        method: 'bank_transfer',
        status: 'completed',
        date: '2025-11-01',
        description: 'Paiement Fournisseur A',
        party: 'Fournisseur A',
        partyType: 'supplier',
        category: 'supplier_payment',
        reference: 'P001'
      },
      {
        id: '2',
        type: 'payment',
        amount: 250000,
        method: 'mobile_money',
        status: 'completed',
        date: '2025-11-02',
        description: 'Paiement Client B',
        party: 'Client B',
        partyType: 'customer',
        category: 'customer_payment',
        reference: 'P002'
      },
      {
        id: '3',
        type: 'sepa_import',
        amount: 1500000,
        method: 'bank_transfer',
        status: 'pending',
        date: '2025-11-03',
        description: 'Import SEPA - Fournisseurs',
        party: 'Multiple',
        partyType: 'supplier',
        category: 'sepa_import',
        reference: 'SEPA-001'
      },
      {
        id: '4',
        type: 'payment',
        amount: 100000,
        method: 'cash',
        status: 'draft',
        date: '2025-11-03',
        description: 'Dépenses bureau',
        party: 'Fournisseur C',
        partyType: 'supplier',
        category: 'expense',
        reference: 'P004'
      }
    ];
    
    // Filter by criteria
    let filteredTransactions = mockTransactions;
    if (type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === type);
    }
    if (status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === status);
    }
    
    // Pagination
    const paginatedTransactions = filteredTransactions.slice(
      parseInt(offset), 
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      transactions: paginatedTransactions,
      pagination: {
        total: filteredTransactions.length,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: parseInt(offset) + parseInt(limit) < filteredTransactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === FIN DES ENDPOINTS PAYMENTS ===
app.get('/api/v1/crm/dashboard', async (req, res) => {
  try {
    const companyId = req.query.companyId;
    const stats = await CRMService.getCRMStats(companyId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/crm/contacts', async (req, res) => {
  try {
    const isDynamic = await database.isDynamicMode();
    if (isDynamic) {
      res.json([
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@email.com',
          phone: '+229 12345678',
          company: 'Entreprise A',
          status: 'active',
          createdAt: '2025-01-01'
        },
        {
          id: '2',
          firstName: 'Marie',
          lastName: 'Martin',
          email: 'marie.martin@email.com',
          phone: '+229 87654321',
          company: 'Société B',
          status: 'active',
          createdAt: '2025-01-02'
        }
      ]);
    } else {
      res.json([
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@email.com',
          phone: '+229 12345678',
          company: 'Entreprise A',
          status: 'active',
          createdAt: '2025-01-01'
        }
      ]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/crm/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      id,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@email.com',
      phone: '+229 12345678',
      company: 'Entreprise A',
      status: 'active',
      createdAt: '2025-01-01'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/crm/contacts', async (req, res) => {
  try {
    const contact = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/v1/crm/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    res.json({
      id,
      ...req.body,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/v1/crm/contacts/:id', async (req, res) => {
  try {
    res.json({ success: true, message: 'Contact supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === OPPORTUNITÉS CRM (NOUVEAUX) ===
app.get('/api/crm/stats', async (req, res) => {
  try {
    const { companyId } = req.query;
    const stats = await CRMService.getCRMStats(companyId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/crm/opportunities/pipeline/stages', async (req, res) => {
  try {
    const { companyId } = req.query;
    const stages = await CRMService.getPipelineStages(companyId);
    res.json(stages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/crm/opportunities/pipeline/overview', async (req, res) => {
  try {
    const companyId = req.query.companyId;
    const pipeline = await CRMService.getPipelineOverview(companyId);
    res.json(pipeline);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/crm/opportunities/:id/move/:stageId', async (req, res) => {
  try {
    const { id, stageId } = req.params;
    const companyId = req.query.companyId;
    const result = await CRMService.moveOpportunity(id, stageId, companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/crm/opportunities', async (req, res) => {
  try {
    const opportunity = await CRMService.createOpportunity(req.body);
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/crm/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const opportunity = await CRMService.updateOpportunity(id, req.body);
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/crm/opportunities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await CRMService.deleteOpportunity(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/crm/opportunities/stats', async (req, res) => {
  try {
    const companyId = req.query.companyId;
    const stats = await CRMService.getCRMStats(companyId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Invoices endpoints
app.get('/api/v1/invoices', (req, res) => {
  res.json([
    {
      id: '1',
      number: 'F001',
      client: 'Client Alpha',
      amount: 1000000,
      status: 'draft',
      date: '2025-11-01'
    }
  ]);
});

app.post('/api/v1/invoices', (req, res) => {
  const newInvoice = { id: Date.now().toString(), ...req.body, status: 'draft' };
  res.json(newInvoice);
});

app.post('/api/v1/invoices/:id/send', (req, res) => {
  res.json({ success: true, message: 'Facture envoyée avec succès' });
});

app.patch('/api/v1/invoices/:id/validate', (req, res) => {
  res.json({ success: true, status: 'validated' });
});

app.patch('/api/v1/invoices/:id/cancel', (req, res) => {
  res.json({ success: true, status: 'cancelled' });
});

app.get('/api/v1/invoices/reminders/preview', (req, res) => {
  res.json({
    reminders: [
      {
        id: '1',
        party: 'Client Alpha',
        total: 1000000,
        daysLate: 15,
        level: 'gentle'
      }
    ]
  });
});

app.post('/api/v1/invoices/reminders/send', (req, res) => {
  res.json({ success: true, message: 'Relances envoyées avec succès' });
});

// Payments endpoints
app.get('/api/v1/payments', (req, res) => {
  res.json([
    {
      id: '1',
      amount: 500000,
      method: 'bank_transfer',
      status: 'completed',
      date: '2025-11-01',
      reference: 'P001'
    }
  ]);
});

app.post('/api/v1/payments', (req, res) => {
  const newPayment = { id: Date.now().toString(), ...req.body, status: 'pending' };
  res.json(newPayment);
});

app.patch('/api/v1/payments/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

app.delete('/api/v1/payments/:id', (req, res) => {
  res.json({ success: true, message: 'Paiement supprimé' });
});

app.patch('/api/v1/payments/:id/validate', (req, res) => {
  res.json({ success: true, status: 'validated' });
});

app.patch('/api/v1/payments/:id/cancel', (req, res) => {
  res.json({ success: true, status: 'cancelled' });
});

// Assets endpoints
app.get('/api/v1/assets', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Ordinateur Portable',
      type: 'IT Equipment',
      value: 500000,
      depreciationRate: 0.20,
      status: 'active'
    }
  ]);
});

app.post('/api/v1/assets', (req, res) => {
  const newAsset = { id: Date.now().toString(), ...req.body };
  res.json(newAsset);
});

// Mobile Money endpoints
app.get('/api/v1/mobile-money/transactions', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  
  const mockTransactions = [
    {
      id: '1',
      invoiceId: 'INV-001',
      provider: 'mtn',
      amount: 50000,
      currency: 'XOF',
      txRef: 'TXN-MTN-001',
      phoneNumber: '+229 97 12 34 56',
      customerName: 'Client A',
      customerEmail: 'clienta@email.com',
      status: 'success',
      createdAt: '2025-11-01T10:00:00Z',
      completedAt: '2025-11-01T10:00:15Z',
      invoice: { id: 'INV-001', invoiceNumber: 'F-2025-001' }
    },
    {
      id: '2',
      invoiceId: 'INV-002',
      provider: 'moov',
      amount: 75000,
      currency: 'XOF',
      txRef: 'TXN-MOOV-002',
      phoneNumber: '+229 96 23 45 67',
      customerName: 'Client B',
      status: 'pending',
      createdAt: '2025-11-02T14:30:00Z',
      invoice: { id: 'INV-002', invoiceNumber: 'F-2025-002' }
    },
    {
      id: '3',
      invoiceId: 'INV-003',
      provider: 'orange',
      amount: 120000,
      currency: 'XOF',
      txRef: 'TXN-ORANGE-003',
      phoneNumber: '+229 95 34 56 78',
      customerName: 'Client C',
      customerEmail: 'clientc@email.com',
      status: 'failed',
      statusMessage: 'Solde insuffisant',
      createdAt: '2025-11-03T09:15:00Z',
      invoice: { id: 'INV-003', invoiceNumber: 'F-2025-003' }
    }
  ];

  const total = mockTransactions.length;
  const pages = Math.ceil(total / limit);
  
  res.json({
    transactions: mockTransactions,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages
    }
  });
});

app.get('/api/v1/mobile-money/stats', (req, res) => {
  res.json({
    total: 150,
    successful: 135,
    failed: 10,
    pending: 5,
    totalAmount: 15000000,
    successfulAmount: 14200000,
    byProvider: [
      { provider: 'mtn', count: 80, total: 8500000 },
      { provider: 'moov', count: 45, total: 4200000 },
      { provider: 'orange', count: 25, total: 2500000 }
    ]
  });
});

// Budget endpoints
app.get('/api/v1/budget/revisions', (req, res) => {
  res.json([
    {
      id: '1',
      version: 'v2.0',
      totalBudget: 50000000,
      status: 'active',
      createdAt: '2025-11-01'
    }
  ]);
});

app.post('/api/v1/budget/new', (req, res) => {
  const newBudget = { id: Date.now().toString(), ...req.body, status: 'draft' };
  res.json(newBudget);
});

// Projects endpoints
app.get('/api/v1/projects', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Projet Alpha',
      status: 'active',
      budget: 10000000,
      progress: 0.60
    }
  ]);
});

// Manufacturing endpoints
app.get('/api/v1/manufacturing/bom', (req, res) => {
  res.json([
    {
      id: '1',
      product: 'Produit A',
      components: [
        { name: 'Composant X', quantity: 2, unit: 'pcs' },
        { name: 'Composant Y', quantity: 1, unit: 'pcs' }
      ]
    }
  ]);
});

app.get('/api/v1/manufacturing/production-orders', (req, res) => {
  res.json([
    {
      id: '1',
      orderNumber: 'PO001',
      product: 'Produit A',
      quantity: 100,
      status: 'in_progress',
      dueDate: '2025-11-15'
    }
  ]);
});

// Marketing endpoints
app.get('/api/v1/marketing/campaigns', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Campagne Novembre',
      type: 'email',
      status: 'active',
      budget: 500000
    }
  ]);
});

// Support endpoints
app.get('/api/v1/support/tickets', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Problème connexion',
      status: 'open',
      priority: 'high',
      createdAt: '2025-11-01'
    }
  ]);
});

// === COMMUNICATIONS (DYNAMIQUES) ===
app.get('/api/v1/communications/templates', async (req, res) => {
  try {
    const templates = await CommunicationService.getTemplates();
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/templates', async (req, res) => {
  try {
    const template = await CommunicationService.createTemplate(req.body);
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/v1/communications/templates/:id', async (req, res) => {
  try {
    const template = await CommunicationService.updateTemplate(req.params.id, req.body);
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/v1/communications/templates/:id', async (req, res) => {
  try {
    const result = await CommunicationService.deleteTemplate(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/communications/sms', async (req, res) => {
  try {
    const messages = await CommunicationService.getSMSMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/sms', async (req, res) => {
  try {
    const sms = await CommunicationService.sendSMS(req.body);
    res.json(sms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ENDPOINTS EMAIL/SMS (NOUVEAUX) ===
app.post('/api/v1/communications/email/send', async (req, res) => {
  try {
    const { to, subject, html, text, from } = req.body;
    
    if (!to || !subject || (!html && !text)) {
      return res.status(400).json({ error: 'Destinataire, sujet et contenu requis' });
    }

    const result = await EmailService.send({ to, subject, html, text, from });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/email/invoice', async (req, res) => {
  try {
    const { to, invoiceNumber, amount, pdfUrl, customerName } = req.body;
    const result = await EmailService.sendInvoice({ to, invoiceNumber, amount, pdfUrl, customerName });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/email/reminder', async (req, res) => {
  try {
    const { to, invoiceNumber, amount, daysOverdue, customerName } = req.body;
    const result = await EmailService.sendPaymentReminder({ to, invoiceNumber, amount, daysOverdue, customerName });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/sms/send', async (req, res) => {
  try {
    const { to, message, from } = req.body;
    
    if (!to || !message) {
      return res.status(400).json({ error: 'Destinataire et message requis' });
    }

    const result = await SMSService.send({ to, message, from });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/sms/invoice', async (req, res) => {
  try {
    const { to, invoiceNumber, amount, customerName } = req.body;
    const result = await SMSService.sendInvoiceNotification({ to, invoiceNumber, amount, customerName });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/sms/payment-confirmation', async (req, res) => {
  try {
    const { to, invoiceNumber, amount, customerName } = req.body;
    const result = await SMSService.sendPaymentConfirmation({ to, invoiceNumber, amount, customerName });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/sms/reminder', async (req, res) => {
  try {
    const { to, invoiceNumber, amount, daysOverdue, customerName } = req.body;
    const result = await SMSService.sendPaymentReminder({ to, invoiceNumber, amount, daysOverdue, customerName });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/sms/otp', async (req, res) => {
  try {
    const { to, code, expiresInMinutes } = req.body;
    const result = await SMSService.sendOTP({ to, code, expiresInMinutes });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/communications/emails', async (req, res) => {
  try {
    const emails = await CommunicationService.getEmails();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/emails', async (req, res) => {
  try {
    const email = await CommunicationService.sendEmail(req.body);
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/communications/whatsapp', async (req, res) => {
  try {
    const messages = await CommunicationService.getWhatsAppMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/communications/whatsapp', async (req, res) => {
  try {
    const message = await CommunicationService.sendWhatsApp(req.body);
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Communications Logs Endpoint
app.get('/api/v1/communications/logs', async (req, res) => {
  try {
    const { companyId, limit = 50, offset = 0 } = req.query;
    const logs = await CommunicationService.getCommunicationLogs(companyId, { limit: parseInt(limit), offset: parseInt(offset) });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === MOBILE MONEY (KKIAPAY) ===

// Status du service Mobile Money
app.get('/api/v1/mobile-money/status', (req, res) => {
  try {
    const status = MobileMoneyService.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initier un paiement Mobile Money
app.post('/api/v1/mobile-money/initiate', async (req, res) => {
  try {
    const { amount, firstName, lastName, email, phone, reason, invoiceId } = req.body;
    
    if (!amount || !firstName || !lastName) {
      return res.status(400).json({ error: 'Montant, prénom et nom requis' });
    }

    const result = await MobileMoneyService.initiatePayment({
      amount: Number(amount),
      firstName,
      lastName,
      email,
      phone,
      reason: reason || 'Paiement BMS',
      invoiceId
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vérifier une transaction Mobile Money
app.get('/api/v1/mobile-money/verify/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await MobileMoneyService.verifyTransaction(transactionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rembourser une transaction
app.post('/api/v1/mobile-money/refund/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const result = await MobileMoneyService.refundTransaction(transactionId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook KkiaPay pour notifications de paiement
app.post('/api/v1/mobile-money/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-kkiapay-signature'];
    
    if (!signature) {
      return res.status(401).json({ error: 'Signature manquante' });
    }

    const result = await MobileMoneyService.handleWebhook(req.body, signature);
    
    // TODO: Mettre à jour le statut de la facture/paiement dans la base
    console.log('📥 Webhook traité:', result);
    
    res.json({ success: true, message: 'Webhook traité' });
  } catch (error) {
    console.error('❌ Erreur webhook:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/communications/stats', async (req, res) => {
  try {
    const stats = await CommunicationService.getCommunicationStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NIF endpoints
app.get('/api/v1/nif/my-requests', (req, res) => {
  res.json([
    {
      id: '1',
      status: 'submitted',
      submissionDate: '2025-11-01',
      documents: ['id_card.pdf', 'proof_of_address.pdf']
    }
  ]);
});

app.post('/api/v1/nif/request', (req, res) => {
  const newRequest = { id: Date.now().toString(), ...req.body, status: 'draft' };
  res.json(newRequest);
});

app.patch('/api/v1/nif/request/:id/document', (req, res) => {
  res.json({ success: true, message: 'Document mis à jour' });
});

app.patch('/api/v1/nif/request/:id/submit', (req, res) => {
  res.json({ success: true, status: 'submitted' });
});

// Inventory endpoints
app.get('/api/v1/inventory/items', (req, res) => {
  res.json([
    {
      id: '1',
      sku: 'PRD-001',
      name: 'Ordinateur Portable Dell XPS 15',
      warehouse: 'Entrepôt Principal Cotonou',
      quantity: 150,
      unitPrice: 850000,
      unit: 'pcs',
      value: 127500000,
      status: 'in_stock'
    },
    {
      id: '2',
      sku: 'PRD-002',
      name: 'Écran Samsung 27" 4K',
      warehouse: 'Entrepôt Principal Cotonou',
      quantity: 45,
      unitPrice: 320000,
      unit: 'pcs',
      value: 14400000,
      status: 'low_stock'
    },
    {
      id: '3',
      sku: 'PRD-003',
      name: 'Clavier Mécanique Logitech',
      warehouse: 'Entrepôt Secondaire Porto-Novo',
      quantity: 200,
      unitPrice: 65000,
      unit: 'pcs',
      value: 13000000,
      status: 'in_stock'
    },
    {
      id: '4',
      sku: 'PRD-004',
      name: 'Souris Sans Fil HP',
      warehouse: 'Entrepôt Principal Cotonou',
      quantity: 30,
      unitPrice: 25000,
      unit: 'pcs',
      value: 750000,
      status: 'out_of_stock'
    },
    {
      id: '5',
      sku: 'PRD-005',
      name: 'Câble HDMI 2m',
      warehouse: 'Entrepôt Secondaire Porto-Novo',
      quantity: 500,
      unitPrice: 8000,
      unit: 'pcs',
      value: 4000000,
      status: 'in_stock'
    }
  ]);
});

// Uploads endpoints
app.get('/api/v1/uploads', (req, res) => {
  res.json([
    {
      id: '1',
      filename: 'document.pdf',
      size: 1024000,
      type: 'application/pdf',
      uploadedAt: '2025-11-01'
    }
  ]);
});

app.post('/api/v1/uploads', (req, res) => {
  const newUpload = { id: Date.now().toString(), ...req.body, uploadedAt: new Date().toISOString() };
  res.json(newUpload);
});

app.delete('/api/v1/uploads/:id', (req, res) => {
  res.json({ success: true, message: 'Fichier supprimé' });
});

app.patch('/api/v1/uploads/:id', (req, res) => {
  res.json({ id: req.params.id, ...req.body });
});

app.post('/api/v1/uploads/batch-delete', (req, res) => {
  res.json({ success: true, deleted: req.body.ids.length });
});

// Purchases endpoints
app.get('/api/v1/purchases/suppliers', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Fournisseur A',
      email: 'a@supplier.com',
      phone: '+229 12345678',
      status: 'active'
    }
  ]);
});

app.post('/api/v1/purchases/suppliers', (req, res) => {
  const newSupplier = { id: Date.now().toString(), ...req.body };
  res.json(newSupplier);
});

app.get('/api/v1/purchases/orders', (req, res) => {
  res.json([
    {
      id: '1',
      orderNumber: 'PO001',
      supplier: 'Fournisseur A',
      amount: 5000000,
      status: 'pending',
      date: '2025-11-01'
    }
  ]);
});

app.post('/api/v1/purchases/orders', (req, res) => {
  const newOrder = { id: Date.now().toString(), ...req.body, status: 'draft' };
  res.json(newOrder);
});

app.get('/api/v1/purchases/rfq', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'Demande devis A',
      description: 'Besoin matériel informatique',
      status: 'open',
      deadline: '2025-11-15'
    }
  ]);
});

app.post('/api/v1/purchases/rfq', (req, res) => {
  const newRfq = { id: Date.now().toString(), ...req.body, status: 'draft' };
  res.json(newRfq);
});

app.post('/api/v1/purchases/rfq/:id/publish', (req, res) => {
  res.json({ success: true, status: 'published' });
});

// Notification endpoints
app.get('/api/v1/notification-config', (req, res) => {
  res.json({
    emailEnabled: true,
    smsEnabled: true,
    pushEnabled: false,
    settings: {
      invoiceReminder: true,
      paymentAlert: true,
      lowBalance: true
    }
  });
});

app.post('/api/v1/notification-config', (req, res) => {
  res.json({ success: true, message: 'Configuration mise à jour' });
});

app.post('/api/v1/notification-config/test/:type', (req, res) => {
  res.json({ success: true, message: `Test ${req.params.type} envoyé` });
});

// Export endpoints
app.get('/api/v1/accounting/export/chart-of-accounts', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=chart-of-accounts.csv');
  res.send('Code,Name,Type,Class\n101000,Capital Social,equity,1\n');
});

app.get('/api/v1/accounting/export/trial-balance', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=trial-balance.csv');
  res.send('Account,Name,Balance,Type\n101000,Capital Social,20000000,equity\n');
});

app.get('/api/v1/accounting/export/journal-entries', (req, res) => {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=journal-entries.csv');
  res.send('Date,Account,Description,Debit,Credit\n2025-11-01,411000,Facture F001,1000000,0\n');
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

// Middleware mode hybride
app.use(async (req, res, next) => {
  try {
    req.isDynamic = await database.isDynamicMode();
    req.mode = await database.getSetting('mode') || 'hybrid';
    next();
  } catch (error) {
    req.isDynamic = false;
    req.mode = 'static';
    next();
  }
});

// Dashboard endpoint (DYNAMIQUE)
app.get('/api/v1/accounting/dashboard/metrics', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.getDashboardMetrics(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Aged balance endpoint (DYNAMIQUE)
app.get('/api/v1/accounting/aged-balance', async (req, res) => {
  try {
    const { companyId, type, asOfDate } = req.query;
    const result = await AccountingService.getAgedBalance(companyId, type, asOfDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Treasury endpoints (DYNAMIQUES)
app.get('/api/v1/treasury/forecast', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await TreasuryService.getForecast(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/treasury/alerts', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await TreasuryService.getAlerts(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === OPÉRATIONS DE TRÉSORERIE (NOUVEAUX) ===
app.get('/api/v1/payments', async (req, res) => {
  try {
    const { companyId, ...filters } = req.query;
    const operations = await TreasuryOperationsService.getOperations(companyId, filters);
    res.json(operations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/payments', async (req, res) => {
  try {
    const operation = await TreasuryOperationsService.createOperation(req.body);
    res.json(operation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/v1/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const operation = await TreasuryOperationsService.updateOperation(id, req.body);
    res.json(operation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/v1/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await TreasuryOperationsService.deleteOperation(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/payments/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.body;
    const result = await TreasuryOperationsService.submitOperation(id, companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/sepa/import', async (req, res) => {
  try {
    // Pour l'import SEPA, nous aurions besoin de multer pour les fichiers
    // Pour l'instant, simulons avec les données du body
    const { fileData, companyId } = req.body;
    const result = await TreasuryOperationsService.importSEPA(fileData, companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/payments/export', async (req, res) => {
  try {
    const { companyId, format = 'csv', ...filters } = req.query;
    const exportData = await TreasuryOperationsService.exportOperations(companyId, format, filters);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/payments/stats', async (req, res) => {
  try {
    const { companyId } = req.query;
    const stats = await TreasuryOperationsService.getOperationsStats(companyId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// System mode management
app.get('/api/v1/system/mode', async (req, res) => {
  try {
    const mode = await database.getSetting('mode') || 'hybrid';
    const isDynamic = await database.isDynamicMode();
    
    res.json({
      current: mode,
      isDynamic: isDynamic,
      available: ['static', 'dynamic', 'hybrid'],
      features: {
        database: isDynamic,
        realTimeCalculations: isDynamic,
        cache: true,
        staticFallback: true
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/system/mode', async (req, res) => {
  try {
    const { mode } = req.body;
    
    if (!['static', 'dynamic', 'hybrid'].includes(mode)) {
      return res.status(400).json({
        error: 'Mode invalide. Options: static, dynamic, hybrid'
      });
    }

    await database.run(
      'INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)',
      ['mode', mode, `Mode changé le ${new Date().toISOString()}`]
    );

    DynamicService.clearCache();

    res.json({
      success: true,
      mode: mode,
      message: `Mode changé vers ${mode.toUpperCase()} avec succès`,
      restartRequired: mode === 'dynamic'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

// DÉMARRAGE SERVEUR DYNAMIQUE
async function startServer() {
  try {
    // Initialiser la base de données
    await database.init();
    
    // Démarrer le serveur
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 BMS Backend Dynamic started on port ${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/health`);
      console.log(`🔧 Mode Management: http://localhost:${PORT}/api/v1/system/mode`);
      console.log(`💾 Database: ${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}`);
      console.log(`🌐 CORS enabled for all origins`);
      console.log(`⚡ Features: Dynamic calculations, Cache, Real-time updates`);
      console.log(`🎯 Status: PRODUCTION READY`);
    });
  } catch (error) {
    console.error('❌ Erreur démarrage serveur:', error);
    process.exit(1);
  }
}

// Gestion arrêt gracieux
process.on('SIGINT', async () => {
  console.log('\n🔄 Arrêt gracieux du serveur...');
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Arrêt gracieux du serveur...');
  await database.close();
  process.exit(0);
});

// ========== SALES ENDPOINTS ==========
const salesService = new SalesService();

app.get('/api/v1/sales/dashboard', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await salesService.getDashboardMetrics(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/sales/quotes', async (req, res) => {
  try {
    const { companyId, status } = req.query;
    const result = await salesService.getQuotes(companyId, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/sales/quotes', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await salesService.createQuote(req.body, companyId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/sales/orders', async (req, res) => {
  try {
    const { companyId, status } = req.query;
    const result = await salesService.getOrders(companyId, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/sales/orders', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await salesService.createOrder(req.body, companyId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/sales/clients', async (req, res) => {
  try {
    const { companyId, status } = req.query;
    const result = await salesService.getClients(companyId, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/sales/clients', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await salesService.createClient(req.body, companyId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== HR ENDPOINTS ==========
const hrService = new HRService();

app.get('/api/v1/hr/dashboard', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await hrService.getDashboardMetrics(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/hr/employees', async (req, res) => {
  try {
    const { companyId, status } = req.query;
    const result = await hrService.getEmployees(companyId, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/hr/payroll', async (req, res) => {
  try {
    const { companyId, month } = req.query;
    const result = await hrService.getPayroll(companyId, month);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/hr/leaves', async (req, res) => {
  try {
    const { companyId, status } = req.query;
    const result = await hrService.getLeaves(companyId, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PROJECTS ENDPOINTS ==========
const projectsService = new ProjectsService();

app.get('/api/v1/projects/dashboard', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await projectsService.getDashboardMetrics(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/projects', async (req, res) => {
  try {
    const { companyId, status } = req.query;
    const result = await projectsService.getProjects(companyId, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/projects', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await projectsService.createProject(req.body, companyId);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== MARKETING ENDPOINTS ==========
const marketingService = new MarketingService();

app.get('/api/v1/marketing/dashboard', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await marketingService.getDashboardMetrics(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/marketing/campaigns', async (req, res) => {
  try {
    const { companyId, status } = req.query;
    const result = await marketingService.getCampaigns(companyId, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/marketing/leads', async (req, res) => {
  try {
    const { companyId, status } = req.query;
    const result = await marketingService.getLeads(companyId, status);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/marketing/analytics', async (req, res) => {
  try {
    const { companyId, period } = req.query;
    const result = await marketingService.getAnalytics(companyId, period);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ML FORECAST ENDPOINTS (AI/ML Advanced) ==========
const mlForecastService = new MLForecastService();

// Dashboard ML complet
app.get('/api/v1/ml-forecast/dashboard', async (req, res) => {
  try {
    const { companyId, metric = 'revenue', horizon = 6 } = req.query;
    
    // Générer prévisions avec le meilleur modèle
    const forecast = await mlForecastService.generateForecast(companyId, 'Ensemble', parseInt(horizon), metric);
    const models = await mlForecastService.getModelsPerformance(companyId, metric);
    const trend = await mlForecastService.analyzeTrend(companyId, metric);
    const anomalies = await mlForecastService.detectAnomalies(companyId, metric);
    
    // Générer insights
    const insights = [];
    const recommendations = [];
    
    if (trend.trend === 'croissance') {
      insights.push(`Tendance de croissance ${trend.strength} avec un taux de ${trend.growthRate.toFixed(1)}% par mois`);
      if (trend.growthRate > 10) {
        recommendations.push('Capitaliser sur la dynamique de croissance actuelle');
        recommendations.push('Considérer l\'expansion des capacités de production');
      }
    } else {
      insights.push(`Tendance de décroissance observée`);
      recommendations.push('Analyser les causes et mettre en place des actions correctives');
    }
    
    const avgConfidence = forecast.forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecast.forecasts.length;
    insights.push(`Fiabilité des prévisions: ${avgConfidence.toFixed(1)}%`);
    
    if (anomalies.length > 0) {
      insights.push(`${anomalies.length} anomalie(s) détectée(s) dans les données historiques`);
      recommendations.push('Vérifier les périodes avec des valeurs anormales');
    }
    
    // Détection de saisonnalité
    const monthlyVariations = forecast.forecasts.map(f => f.predicted);
    const maxVar = Math.max(...monthlyVariations);
    const minVar = Math.min(...monthlyVariations);
    const variationRange = ((maxVar - minVar) / minVar) * 100;
    
    if (variationRange > 20) {
      insights.push(`Saisonnalité détectée avec variation de ${variationRange.toFixed(1)}%`);
      recommendations.push('Planifier les ressources selon les variations saisonnières');
    }
    
    res.json({
      forecasts: forecast.forecasts,
      models: models.map(m => ({
        name: m.model,
        accuracy: m.accuracy,
        mae: m.mae,
        rmse: m.rmse,
        mape: m.mape,
        lastTrained: m.trained_at,
        status: m.status
      })),
      insights,
      recommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        horizon: parseInt(horizon),
        metric: metric,
        frequency: 'monthly'
      }
    });
  } catch (error) {
    console.error('Erreur dashboard ML:', error);
    res.status(500).json({ error: error.message });
  }
});

// Générer prévisions avec un modèle spécifique
app.get('/api/v1/ml-forecast/predict', async (req, res) => {
  try {
    const { companyId, model = 'Ensemble', horizon = 6, metric = 'revenue' } = req.query;
    const forecast = await mlForecastService.generateForecast(companyId, model, parseInt(horizon), metric);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Entraîner tous les modèles
app.post('/api/v1/ml-forecast/train', async (req, res) => {
  try {
    const { companyId, metric = 'revenue' } = req.body;
    const results = await mlForecastService.trainAllModels(companyId, metric);
    res.json({ success: true, models: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Performance des modèles
app.get('/api/v1/ml-forecast/models/performance', async (req, res) => {
  try {
    const { companyId, metric = 'revenue' } = req.query;
    const performances = await mlForecastService.getModelsPerformance(companyId, metric);
    res.json(performances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-sélection du meilleur modèle
app.get('/api/v1/ml-forecast/auto-select', async (req, res) => {
  try {
    const { companyId, metric = 'revenue' } = req.query;
    const bestModel = await mlForecastService.autoSelectBestModel(companyId, metric);
    res.json(bestModel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Détection d'anomalies
app.get('/api/v1/ml-forecast/anomalies', async (req, res) => {
  try {
    const { companyId, metric = 'revenue' } = req.query;
    const anomalies = await mlForecastService.detectAnomalies(companyId, metric);
    res.json(anomalies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analyse de tendance
app.get('/api/v1/ml-forecast/trend', async (req, res) => {
  try {
    const { companyId, metric = 'revenue' } = req.query;
    const trend = await mlForecastService.analyzeTrend(companyId, metric);
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Démarrer le serveur
startServer();
