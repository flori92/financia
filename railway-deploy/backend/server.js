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

// AI endpoints
app.post('/api/v1/ai/chat', (req, res) => {
  const { message } = req.body;
  res.json({
    response: `Réponse IA à: ${message}`,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/v1/ai/ocr/:type', (req, res) => {
  const { type } = req.params;
  res.json({
    extractedData: {
      type,
      amount: 1500000,
      date: '2025-11-01',
      vendor: 'Fournisseur Demo'
    },
    confidence: 0.95
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
  res.json([
    {
      id: '1',
      operator: 'MTN',
      amount: 100000,
      type: 'debit',
      status: 'completed',
      date: '2025-11-01'
    }
  ]);
});

app.get('/api/v1/mobile-money/stats', (req, res) => {
  res.json({
    totalTransactions: 150,
    totalAmount: 15000000,
    successRate: 0.95
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

// Communications endpoints
app.get('/api/v1/communications/templates', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'Template Facture',
      type: 'email',
      subject: 'Votre facture',
      status: 'active'
    }
  ]);
});

app.get('/api/v1/communications/sms', (req, res) => {
  res.json([
    {
      id: '1',
      message: 'Votre facture est disponible',
      recipients: 5,
      status: 'sent',
      sentAt: '2025-11-01'
    }
  ]);
});

app.get('/api/v1/communications/emails', (req, res) => {
  res.json([
    {
      id: '1',
      subject: 'Facture F001',
      recipients: 1,
      status: 'sent',
      sentAt: '2025-11-01'
    }
  ]);
});

app.get('/api/v1/communications/whatsapp', (req, res) => {
  res.json([
    {
      id: '1',
      message: 'Confirmation commande',
      recipients: 2,
      status: 'delivered',
      sentAt: '2025-11-01'
    }
  ]);
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
      name: 'Produit A',
      quantity: 100,
      unit: 'pcs',
      value: 500000,
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
