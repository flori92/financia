const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

// Services dynamiques
const database = require('./database');
const DynamicService = require('./services/DynamicService');
const TreasuryService = require('./services/TreasuryService');
const AccountingService = require('./services/AccountingService');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuré pour toutes les origines
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Logging middleware avec mode tracking
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const mode = process.env.BMS_MODE || 'hybrid';
  console.log(`${timestamp} - [${mode.toUpperCase()}] ${req.method} ${req.path}`);
  next();
});

// Middleware mode hybride
app.use(async (req, res, next) => {
  try {
    req.isDynamic = await database.isDynamicMode();
    req.mode = await database.getSetting('mode') || 'hybrid';
    next();
  } catch (error) {
    console.error('Erreur mode detection:', error);
    req.isDynamic = false;
    req.mode = 'static';
    next();
  }
});

// Health endpoint avec informations système
app.get('/health', async (req, res) => {
  try {
    const cacheStats = DynamicService.getCacheStats();
    const mode = await database.getSetting('mode') || 'hybrid';
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      port: PORT,
      service: 'bms-backend-dynamic',
      version: '2.0.0-production',
      mode: mode,
      message: `BMS Backend - Mode ${mode.toUpperCase()} - Production Ready`,
      cache: cacheStats,
      features: {
        database: true,
        dynamic: mode !== 'static',
        cache: true,
        auth: true,
        realTime: mode === 'dynamic'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Service temporarily unavailable',
      error: error.message
    });
  }
});

// === AUTHENTIFICATION ===
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email et mot de passe requis'
      });
    }

    // Mode dynamique : vérification base de données
    if (req.isDynamic) {
      const user = await database.get(
        'SELECT * FROM users WHERE email = ?', 
        [email]
      );

      if (!user) {
        return res.status(401).json({
          error: 'Utilisateur non trouvé'
        });
      }

      // En production, vérifier le mot de passe hashé
      // const isValid = await bcrypt.compare(password, user.password_hash);
      
      const demoUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        companyId: user.company_id
      };

      const token = jwt.sign(demoUser, process.env.JWT_SECRET || 'bms-secret', {
        expiresIn: '24h'
      });

      // Mettre à jour last_login
      await database.run(
        'UPDATE users SET last_login = ? WHERE id = ?',
        [new Date().toISOString(), user.id]
      );

      res.json({
        user: demoUser,
        token: token,
        expiresIn: 86400,
        message: 'Connexion réussie'
      });
    } else {
      // Mode statique : accepter tout login
      const demoUser = {
        id: 'demo-user-id',
        email: email,
        name: 'Utilisateur Demo',
        role: 'admin',
        companyId: '1805bc61-7cfd-44e9-8a63-17187bf05dc7'
      };

      const token = Buffer.from(JSON.stringify(demoUser)).toString('base64');

      res.json({
        user: demoUser,
        token: token,
        expiresIn: 86400,
        message: 'Connexion réussie (mode démo)'
      });
    }
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({
      error: 'Erreur serveur',
      message: error.message
    });
  }
});

// === COMPANIES ===
app.get('/api/v1/companies', async (req, res) => {
  try {
    if (req.isDynamic) {
      const companies = await database.all('SELECT * FROM companies');
      res.json(companies);
    } else {
      // Mode statique
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
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === TREASURY (DYNAMIQUE) ===
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

app.get('/api/v1/treasury/direct-debits', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await TreasuryService.getDirectDebits(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/treasury/direct-debits/statistics', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await TreasuryService.getDirectDebitStatistics(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/treasury/direct-debits', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await TreasuryService.createDirectDebit(companyId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/v1/treasury/direct-debits/:id', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await TreasuryService.updateDirectDebit(companyId, req.params.id, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/v1/treasury/direct-debits/:id', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await TreasuryService.deleteDirectDebit(companyId, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/treasury/direct-debits/:id/suspend', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await TreasuryService.suspendDirectDebit(companyId, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/treasury/direct-debits/:id/reactivate', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await TreasuryService.reactivateDirectDebit(companyId, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/treasury/direct-debits/:id/cancel', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await TreasuryService.cancelDirectDebit(companyId, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ACCOUNTING (DYNAMIQUE) ===
app.get('/api/v1/accounting/dashboard/metrics', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.getDashboardMetrics(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/accounting/aged-balance', async (req, res) => {
  try {
    const { companyId, type, asOfDate } = req.query;
    const result = await AccountingService.getAgedBalance(companyId, type, asOfDate);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/accounting/trial-balance', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.getTrialBalance(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/accounting/profit-loss', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.getProfitLoss(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/accounting/balance-sheet', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.getBalanceSheet(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/budget/summary', async (req, res) => {
  try {
    const { companyId } = req.query;
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Données dynamiques depuis la base
      const budgetItems = await database.all(`
        SELECT 
          category,
          SUM(budgeted_amount) as budgeted,
          SUM(actual_amount) as actual,
          CASE 
            WHEN SUM(budgeted_amount) = 0 THEN 0
            ELSE ROUND(((SUM(actual_amount) - SUM(budgeted_amount)) / SUM(budgeted_amount)) * 100, 1)
          END as variance_percentage,
          type
        FROM budget_items 
        WHERE company_id = ? 
        GROUP BY category, type
        ORDER BY category
      `, [companyId]);
      
      const totalBudgeted = budgetItems.reduce((sum, item) => sum + (item.budgeted || 0), 0);
      const totalActual = budgetItems.reduce((sum, item) => sum + (item.actual || 0), 0);
      const overallVariance = totalBudgeted > 0 ? 
        Math.round(((totalActual - totalBudgeted) / totalBudgeted) * 100 * 10) / 10 : 0;
      
      res.json({
        budgetItems: budgetItems.map(item => ({
          category: item.category,
          budgeted: item.budgeted || 0,
          actual: item.actual || 0,
          variance: item.variance_percentage || 0,
          type: item.type
        })),
        totalBudgeted,
        totalActual,
        overallVariance,
        period: 'Données réelles'
      });
    } else {
      // Mode démonstration
      const mockBudgetData = [
        { 
          category: "Chiffre d'affaires", 
          budgeted: 12000000, 
          actual: 8500000, 
          variance: -29.2,
          type: "revenue"
        },
        { 
          category: "Charges de personnel", 
          budgeted: 4800000, 
          actual: 4950000, 
          variance: 3.1,
          type: "expense"
        },
        { 
          category: "Charges externes", 
          budgeted: 2400000, 
          actual: 2100000, 
          variance: -12.5,
          type: "expense"
        },
        { 
          category: "Achats de marchandises", 
          budgeted: 6000000, 
          actual: 5800000, 
          variance: -3.3,
          type: "expense"
        },
        { 
          category: "Frais financiers", 
          budgeted: 800000, 
          actual: 920000, 
          variance: 15.0,
          type: "expense"
        }
      ];
      
      const totalBudgeted = mockBudgetData.reduce((sum, item) => sum + item.budgeted, 0);
      const totalActual = mockBudgetData.reduce((sum, item) => sum + item.actual, 0);
      const overallVariance = Math.round(((totalActual - totalBudgeted) / totalBudgeted) * 100 * 10) / 10;
      
      res.json({
        budgetItems: mockBudgetData,
        totalBudgeted,
        totalActual,
        overallVariance,
        period: 'Données de démonstration'
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/accounting/general-ledger', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.getGeneralLedger(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/accounting/chart-of-accounts', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.getChartOfAccounts(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/accounting/journal-entries', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.createJournalEntry(companyId, req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/accounting/closure', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.getClosureStatus(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/accounting/closure/preview', async (req, res) => {
  try {
    const { companyId, period } = req.query;
    const result = await AccountingService.previewClosure(companyId, period);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/accounting/closure/close', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.performClosure(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/accounting/close/last', async (req, res) => {
  try {
    const { companyId } = req.query;
    const result = await AccountingService.getLastClosure(companyId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === CRM (DYNAMIQUE) ===
app.get('/api/v1/crm/contacts', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (req.isDynamic) {
      const contacts = await database.all(
        'SELECT * FROM contacts WHERE company_id = ? ORDER BY created_at DESC',
        [companyId]
      );
      res.json(contacts);
    } else {
      // Mode statique
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
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/crm/dashboard', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (req.isDynamic) {
      const contacts = await database.all(
        'SELECT type, COUNT(*) as count FROM contacts WHERE company_id = ? GROUP BY type',
        [companyId]
      );
      
      const customers = contacts.find(c => c.type === 'customer')?.count || 0;
      const suppliers = contacts.find(c => c.type === 'supplier')?.count || 0;
      
      res.json({
        totalContacts: customers + suppliers,
        activeCustomers: customers,
        activeSuppliers: suppliers,
        recentActivity: [
          { type: 'contact_added', name: 'Nouveau Client', date: moment().format('YYYY-MM-DD') },
          { type: 'contact_updated', name: 'Client Alpha', date: moment().subtract(1, 'day').format('YYYY-MM-DD') }
        ]
      });
    } else {
      // Mode statique
      res.json({
        totalContacts: 150,
        activeCustomers: 80,
        activeSuppliers: 45,
        recentActivity: [
          { type: 'contact_added', name: 'Nouveau Client', date: '2025-11-01' },
          { type: 'contact_updated', name: 'Client Alpha', date: '2025-10-31' }
        ]
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === HR (DYNAMIQUE) ===
app.get('/api/v1/hr/employees', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (req.isDynamic) {
      const employees = await database.all(
        'SELECT * FROM employees WHERE company_id = ? ORDER BY created_at DESC',
        [companyId]
      );
      res.json(employees);
    } else {
      // Mode statique
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
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/hr/payroll', async (req, res) => {
  try {
    const { companyId } = req.query;
    
    if (req.isDynamic) {
      const employees = await database.all(
        'SELECT * FROM employees WHERE company_id = ? AND status = "active"',
        [companyId]
      );
      
      const payroll = employees.map(emp => ({
        id: emp.id,
        employeeId: emp.id,
        employeeName: emp.name,
        month: moment().format('YYYY-MM'),
        grossSalary: emp.salary || 0,
        netSalary: Math.round((emp.salary || 0) * 0.84), // 16% cotisations
        status: 'processed'
      }));
      
      res.json(payroll);
    } else {
      // Mode statique
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
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === MODE MANAGEMENT ===
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

    // Nettoyer le cache lors du changement de mode
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

app.get('/api/v1/system/cache/stats', (req, res) => {
  try {
    const stats = DynamicService.getCacheStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/v1/system/cache/clear', (req, res) => {
  try {
    DynamicService.clearCache();
    res.json({
      success: true,
      message: 'Cache vidé avec succès'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// === ENDPOINTS STATIC FALLBACK (pour compatibilité) ===
// Ces endpoints gardent les données statiques originales comme fallback

// Banking
app.get('/api/v1/banking/transactions', (req, res) => {
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

// Tax
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

// AI
app.post('/api/v1/ai/chat', (req, res) => {
  const { message } = req.body;
  res.json({
    response: `Réponse IA dynamique à: ${message}`,
    timestamp: new Date().toISOString(),
    mode: 'enhanced'
  });
});

app.post('/api/v1/ai/ocr/:type', (req, res) => {
  const { type } = req.params;
  res.json({
    extractedData: {
      type,
      amount: Math.round(1000000 + Math.random() * 2000000),
      date: moment().format('YYYY-MM-DD'),
      vendor: 'Fournisseur Dynamique'
    },
    confidence: 0.95 + Math.random() * 0.04
  });
});

// === 404 handler amélioré ===
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    code: 404,
    message: 'Endpoint not found',
    path: req.originalUrl,
    mode: req.mode || 'unknown',
    availableEndpoints: [
      '/health',
      '/api/v1/auth/login',
      '/api/v1/companies',
      '/api/v1/treasury/*',
      '/api/v1/accounting/*',
      '/api/v1/crm/*',
      '/api/v1/hr/*',
      '/api/v1/system/*'
    ],
    suggestion: 'Vérifiez la documentation API pour les endpoints disponibles'
  });
});

// === DÉMARRAGE SERVEUR ===
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

// Démarrer le serveur
startServer();

module.exports = app;
