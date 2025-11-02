#!/usr/bin/env node

const database = require('../database');
const moment = require('moment');

async function seed() {
  console.log('🌱 Démarrage seed BMS...');
  
  try {
    await database.init();
    
    const companyId = '1805bc61-7cfd-44e9-8a63-17187bf05dc7';
    
    // Insérer données de test enrichies
    console.log('📊 Insertion données de test...');
    
    // Transactions variées sur 90 jours
    const transactions = [];
    for (let i = 0; i < 90; i++) {
      const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
      const isWeekend = moment(date).day() === 0 || moment(date).day() === 6;
      
      if (!isWeekend && Math.random() > 0.2) { // 80% de chances de transaction en semaine
        const type = Math.random() > 0.6 ? 'revenue' : 'expense';
        const amount = Math.round(100000 + Math.random() * 2000000);
        
        transactions.push([
          companyId,
          date,
          type === 'revenue' ? `Vente ${Math.floor(Math.random() * 1000)}` : `Achat ${Math.floor(Math.random() * 1000)}`,
          type === 'revenue' ? amount : -amount,
          type,
          type === 'revenue' ? '707000' : '601000'
        ]);
      }
    }

    // Insérer les transactions
    for (const transaction of transactions) {
      await database.run(`
        INSERT INTO transactions (company_id, date, description, amount, type, category)
        VALUES (?, ?, ?, ?, ?, ?)
      `, transaction);
    }

    // Factures avec statuts variés
    const invoices = [];
    for (let i = 0; i < 20; i++) {
      const dueDate = moment().subtract(Math.floor(Math.random() * 60), 'days').format('YYYY-MM-DD');
      const statuses = ['draft', 'sent', 'paid', 'overdue'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      invoices.push([
        companyId,
        `F${String(i + 1).padStart(4, '0')}`,
        `Client ${String.fromCharCode(65 + i)}`,
        Math.round(500000 + Math.random() * 2000000),
        status,
        dueDate
      ]);
    }

    for (const invoice of invoices) {
      await database.run(`
        INSERT INTO invoices (company_id, number, client_name, amount, status, due_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, invoice);
    }

    // Contacts CRM enrichis
    const contacts = [
      ['Client Mega Corp', 'customer', 'contact@megacorp.com', '+229 97000000', '123 Avenue, Cotonou'],
      ['Client Tech Solutions', 'customer', 'info@techsolutions.com', '+229 97000001', '456 Rue, Porto-Novo'],
      ['Client Global Trade', 'customer', 'sales@globaltrade.com', '+229 97000002', '789 Boulevard, Cotonou'],
      ['Fournisseur Office Plus', 'supplier', 'commande@officeplus.com', '+229 97000003', '321 Zone, Cotonou'],
      ['Fournisseur IT Hardware', 'supplier', 'sales@ithardware.com', '+229 97000004', '654 Tech Park, Cotonou'],
      ['Fournisseur Logistik Pro', 'supplier', 'info@logistikpro.com', '+229 97000005', '987 Industrial, Cotonou'],
      ['Client StartUp Hub', 'customer', 'hello@startuphub.com', '+229 97000006', '147 Innovation, Cotonou'],
      ['Client Consulting Group', 'customer', 'contact@consulting.com', '+229 97000007', '258 Business, Cotonou']
    ];

    for (const contact of contacts) {
      await database.run(`
        INSERT INTO contacts (company_id, name, type, email, phone, address)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [companyId, ...contact]);
    }

    // Employés avec départements variés
    const employees = [
      ['Alice Bako', 'Directrice Générale', 'Direction', 1500000],
      ['Bob Tchan', 'Directeur Financier', 'Finance', 1200000],
      ['Claire Adjo', 'Comptable Senior', 'Finance', 600000],
      ['David Sossou', 'Développeur Lead', 'IT', 800000],
      ['Eva Gnassingbe', 'Chef de Projet', 'IT', 700000],
      ['Franck Kodjo', 'Commercial Senior', 'Ventes', 550000],
      ['Grace Mensah', 'Responsable RH', 'RH', 650000],
      ['Henri Koffi', 'Technicien Support', 'IT', 400000],
      ['Isabelle Aho', 'Marketing Manager', 'Marketing', 600000],
      ['Jean-Baptiste Touré', 'Logisticien', 'Opérations', 450000]
    ];

    for (const [name, position, department, salary] of employees) {
      const hireDate = moment().subtract(Math.floor(Math.random() * 365 * 3), 'days').format('YYYY-MM-DD');
      await database.run(`
        INSERT INTO employees (company_id, name, position, department, salary, hire_date)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [companyId, name, position, department, salary, hireDate]);
    }

    // Configuration système avancée
    await database.run(`
      INSERT OR REPLACE INTO settings (key, value, description) 
      VALUES 
        ('mode', 'hybrid', 'Mode hybride: dynamique avec fallback statique'),
        ('demo_enabled', 'true', 'Données de démo activées'),
        ('auto_calculate', 'true', 'Calculs automatiques activés'),
        ('cache_enabled', 'true', 'Cache des performances activé'),
        ('real_time_updates', 'true', 'Mises à jour en temps réel'),
        ('advanced_analytics', 'true', 'Analytics avancés activés'),
        ('multi_currency', 'false', 'Support multi-monnaies (bientôt)'),
        ('api_rate_limit', '1000', 'Limite API par heure'),
        ('backup_frequency', 'daily', 'Fréquence de backup automatique'),
        ('notification_email', 'admin@bms.bj', 'Email pour notifications système')
    `);

    // Statistiques du seed
    const stats = {
      transactions: transactions.length,
      invoices: invoices.length,
      contacts: contacts.length,
      employees: employees.length,
      settings: 10
    };

    console.log('📊 Données de seed insérées:');
    Object.entries(stats).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    console.log('✅ Seed terminé avec succès');
    await database.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur seed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
