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

      // Contacts CRM
      `CREATE TABLE IF NOT EXISTS contacts (
        id TEXT PRIMARY KEY,
        company_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('customer', 'supplier')),
        email TEXT,
        phone TEXT,
        address TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

    // Insérer contacts CRM
    const contacts = [
      ['Client Alpha', 'customer', 'alpha@client.com', '+229 12345678'],
      ['Client Beta', 'customer', 'beta@client.com', '+229 23456789'],
      ['Fournisseur A', 'supplier', 'a@supplier.com', '+229 34567890'],
      ['Fournisseur B', 'supplier', 'b@supplier.com', '+229 45678901']
    ];

    for (const [name, type, email, phone] of contacts) {
      await this.run(`
        INSERT INTO contacts (company_id, name, type, email, phone)
        VALUES (?, ?, ?, ?, ?)
      `, [companyId, name, type, email, phone]);
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
    const mode = await this.getSetting('mode');
    return mode === 'dynamic' || mode === 'hybrid';
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
