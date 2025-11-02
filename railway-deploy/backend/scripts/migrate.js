#!/usr/bin/env node

const database = require('../database');
const fs = require('fs');
const path = require('path');

async function migrate() {
  console.log('🔄 Démarrage migration BMS...');
  
  try {
    // Créer le répertoire de backup
    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Backup de la base actuelle si elle existe
    const dbPath = path.join(__dirname, '../bms.db');
    if (fs.existsSync(dbPath)) {
      const backupPath = path.join(backupDir, `bms_backup_${Date.now()}.db`);
      fs.copyFileSync(dbPath, backupPath);
      console.log(`💾 Backup créé: ${backupPath}`);
    }

    // Connexion et initialisation
    await database.connect();
    await database.createTables();
    
    console.log('✅ Migration terminée avec succès');
    console.log(`📊 Base de données: ${dbPath}`);
    
    await database.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur migration:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  migrate();
}

module.exports = migrate;
