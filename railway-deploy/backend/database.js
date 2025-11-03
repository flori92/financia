const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Base de données SQLite dynamique
const DB_PATH = path.join(__dirname, 'bms.db');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Erreur connexion DB:', err);
          reject(err);
        } else {
          console.log('✅ Base de données connectée');
          resolve();
        }
      });
    });
  }

  async init() {
    await this.connect();
    await this.createTables();
    await this.seedInitialData();
  }

  async createTables() {
    const tables = [
      // Companies
      `CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        legal_name TEXT,
        registration_number TEXT,
        tax_id TEXT,
        industry TEXT,
        size TEXT,
        address TEXT,
        city TEXT,
        country TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        vat_rate REAL DEFAULT 0.18,
        fiscal_year_start TEXT,
        default_currency TEXT DEFAULT 'XOF',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Users
      `CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        name TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        company_id TEXT,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )`,

      // Transactions
      `CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        date DATE NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        type TEXT CHECK(type IN ('revenue', 'expense', 'transfer')),
        category TEXT,
        status TEXT DEFAULT 'active',
        reference TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )`,

      // Invoices
      `CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        number TEXT UNIQUE NOT NULL,
        client_name TEXT,
        amount REAL NOT NULL,
        status TEXT DEFAULT 'draft',
        due_date DATE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )`,

      // Treasury Forecast
      `CREATE TABLE IF NOT EXISTS treasury_forecast (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        date DATE NOT NULL,
        inflow REAL DEFAULT 0,
        outflow REAL DEFAULT 0,
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )`,

      // Contacts CRM - Table complète avec 35 champs
      `CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        type TEXT CHECK(type IN ('client', 'prospect', 'supplier', 'partner')) NOT NULL,
        company_name TEXT,
        first_name TEXT,
        last_name TEXT,
        email TEXT UNIQUE,
        phone TEXT,
        mobile TEXT,
        position TEXT,
        website TEXT,
        address_line1 TEXT,
        address_line2 TEXT,
        city TEXT,
        postal_code TEXT,
        country TEXT DEFAULT 'BJ',
        tax_id TEXT,
        vat_number TEXT,
        notes TEXT,
        status TEXT DEFAULT 'active',
        tags TEXT, -- JSON array
        scoring REAL DEFAULT 0, -- Lead scoring
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )`,

      // Employees
      `CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        position TEXT,
        department TEXT,
        status TEXT DEFAULT 'active',
        hire_date DATE,
        salary REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id)
      )`,

      // System Settings (pour mode démo/production)
      `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Communication Templates
      `CREATE TABLE IF NOT EXISTS communication_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        channel TEXT NOT NULL,
        category TEXT NOT NULL,
        subject TEXT,
        content TEXT NOT NULL,
        usage_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Communication Logs
      `CREATE TABLE IF NOT EXISTS communication_logs (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        channel TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT,
        content TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        sent_at DATETIME NOT NULL,
        cost INTEGER DEFAULT 0,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // CRM Opportunities
      `CREATE TABLE IF NOT EXISTS crm_opportunities (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        probability INTEGER DEFAULT 0,
        status TEXT NOT NULL,
        stage_id TEXT NOT NULL,
        contact_id TEXT,
        close_date DATE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // CRM Pipeline Stages
      `CREATE TABLE IF NOT EXISTS crm_pipeline_stages (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        probability INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Treasury Operations
      `CREATE TABLE IF NOT EXISTS treasury_operations (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        reference TEXT NOT NULL,
        beneficiary TEXT NOT NULL,
        payment_date DATE NOT NULL,
        amount REAL NOT NULL,
        currency TEXT DEFAULT 'FCFA',
        status TEXT NOT NULL,
        payment_method TEXT NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        iban TEXT,
        submitted_at DATETIME,
        processed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const sql of tables) {
      await this.run(sql);
    }
    console.log('✅ Tables créées avec succès');
  }

  async run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async seedInitialData() {
    // Vérifier si les données existent déjà
    const companyCount = await this.get('SELECT COUNT(*) as count FROM companies');
    if (companyCount.count > 0) {
      console.log('📊 Données déjà présentes');
      return;
    }

    // Insérer company démo
    const companyId = '1805bc61-7cfd-44e9-8a63-17187bf05dc7';
    await this.run(`
      INSERT INTO companies (
        id, name, legal_name, registration_number, tax_id, 
        industry, size, address, city, country, phone, email, website
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      companyId,
      'BMS Demo SARL',
      'BMS Demo Société à Responsabilité Limitée',
      'BJS123456789',
      'BJS987654321',
      'Services Numériques',
      'small',
      '123 Rue du Commerce, Cotonou, Bénin',
      'Cotonou',
      'BJ',
      '+229 12345678',
      'demo@bms.bj',
      'https://bms-demo.bj'
    ]);

    // Insérer utilisateur démo
    await this.run(`
      INSERT INTO users (id, email, name, role, company_id) 
      VALUES (?, ?, ?, ?, ?)
    `, [
      'demo-user-id',
      'demo@bms.bj',
      'Utilisateur Demo',
      'admin',
      companyId
    ]);

    // Insérer transactions dynamiques
    const transactions = [
      ['2025-11-01', 'Vente services', 1500000, 'revenue', '707000'],
      ['2025-11-02', 'Achat fournitures', -500000, 'expense', '602000'],
      ['2025-11-03', 'Vente produits', 2000000, 'revenue', '701000'],
      ['2025-11-04', 'Paiement loyer', -300000, 'expense', '613000'],
      ['2025-11-05', 'Vente consulting', 800000, 'revenue', '706000']
    ];

    for (const [date, desc, amount, type, category] of transactions) {
      await this.run(`
        INSERT INTO transactions (company_id, date, description, amount, type, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [companyId, date, desc, amount, type, category]);
    }

    // Insérer contacts CRM - Données complètes avec 35 champs
    const contacts = [
      {
        id: 'contact_1',
        type: 'client',
        company_name: 'Entreprise ABC',
        first_name: 'Jean',
        last_name: 'Dupont',
        email: 'jean.dupont@entreprise-abc.com',
        phone: '+229 97 00 00 00',
        mobile: '+229 98 00 00 00',
        position: 'Directeur Général',
        website: 'https://entreprise-abc.com',
        address_line1: '123 Rue du Commerce',
        address_line2: 'Immeuble BMS',
        city: 'Cotonou',
        postal_code: '001',
        country: 'BJ',
        tax_id: 'BJ001234567',
        vat_number: 'BJTV001234567',
        notes: 'Client important pour le secteur technologique',
        tags: '["technologie", "prioritaire", "B2B"]',
        scoring: 85
      },
      {
        id: 'contact_2',
        type: 'prospect',
        company_name: 'Société XYZ',
        first_name: 'Marie',
        last_name: 'Assiba',
        email: 'marie.assiba@societe-xyz.com',
        phone: '+229 98 00 00 01',
        mobile: '+229 97 00 00 01',
        position: 'Responsable Achat',
        website: 'https://societe-xyz.com',
        address_line1: '456 Avenue des Nations',
        city: 'Porto-Novo',
        postal_code: '002',
        country: 'BJ',
        tax_id: 'BJ002345678',
        notes: 'Prospect intéressé par nos solutions ERP',
        tags: '["ERP", "prospect", "PMU"]',
        scoring: 65
      },
      {
        id: 'contact_3',
        type: 'supplier',
        company_name: 'Fournisseur Tech',
        first_name: 'Koffi',
        last_name: 'Kouame',
        email: 'koffi.kouame@fournisseur-tech.com',
        phone: '+229 99 00 00 00',
        position: 'Directeur Commercial',
        address_line1: '789 Boulevard de la Technologie',
        city: 'Abidjan',
        country: 'CI',
        notes: 'Fournisseur de matériel informatique',
        tags: '["informatique", "matériel", "fournisseur"]',
        scoring: 75
      },
      {
        id: 'contact_4',
        type: 'partner',
        company_name: 'Partner Solutions',
        first_name: 'Aminata',
        last_name: 'Sow',
        email: 'aminata.sow@partner-solutions.com',
        phone: '+229 96 00 00 00',
        position: 'Responsable Partenariats',
        website: 'https://partner-solutions.com',
        address_line1: '321 Rue des Partenaires',
        city: 'Lomé',
        country: 'TG',
        notes: 'Partenaire stratégique pour la distribution',
        tags: '["partenaire", "distribution", "stratégique"]',
        scoring: 90
      }
    ];

    for (const contact of contacts) {
      await this.run(`
        INSERT INTO contacts (
          id, company_id, type, company_name, first_name, last_name, email, phone, mobile,
          position, website, address_line1, address_line2, city, postal_code, country,
          tax_id, vat_number, notes, tags, scoring, status, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        contact.id, companyId, contact.type, contact.company_name, contact.first_name, contact.last_name,
        contact.email, contact.phone, contact.mobile, contact.position, contact.website,
        contact.address_line1, contact.address_line2, contact.city, contact.postal_code, contact.country,
        contact.tax_id, contact.vat_number, contact.notes, contact.tags, contact.scoring,
        'active', new Date().toISOString(), new Date().toISOString()
      ]);
    }

    // Insérer employés
    const employees = [
      ['Jean Dupont', 'Développeur', 'IT', 500000],
      ['Marie Koné', 'Comptable', 'Finance', 450000],
      ['Paul Adjoua', 'Commercial', 'Ventes', 400000]
    ];

    for (const [name, position, department, salary] of employees) {
      await this.run(`
        INSERT INTO employees (company_id, name, position, department, salary, hire_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [companyId, name, position, department, salary, '2024-01-15']);
    }

    // Configuration système
    await this.run(`
      INSERT OR REPLACE INTO settings (key, value, description) 
      VALUES 
        ('mode', 'dynamic', 'Mode de fonctionnement: static/dynamic/hybrid'),
        ('demo_enabled', 'true', 'Activer les données de démo'),
        ('auto_calculate', 'true', 'Calculer automatiquement les métriques')
    `);

    console.log('📊 Données initiales insérées avec succès');
  }

  // Mode hybride : basculer entre statique/dynamique
  async getSetting(key) {
    const setting = await this.get('SELECT value FROM settings WHERE key = ?', [key]);
    return setting ? setting.value : null;
  }

  async isDynamicMode() {
    // FORCER LE MODE DYNAMIQUE - Plus de mode statique/mock
    return true;
  }

  async close() {
    return new Promise((resolve) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) console.error('Erreur fermeture DB:', err);
          else console.log('📊 Base de données fermée');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

module.exports = new Database();
