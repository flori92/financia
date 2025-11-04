#!/usr/bin/env node

/**
 * Script pour exécuter les migrations SQL manuelles
 * Usage: node scripts/run-migration.js <migration-file>
 * Example: node scripts/run-migration.js src/migrations/add_user_profiles_columns.sql
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Configuration de la base de données depuis DATABASE_URL
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

// Récupérer le fichier de migration depuis les arguments
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ ERROR: Migration file path is required');
  console.log('Usage: node scripts/run-migration.js <migration-file>');
  console.log('Example: node scripts/run-migration.js src/migrations/add_user_profiles_columns.sql');
  process.exit(1);
}

// Résoudre le chemin complet du fichier
const migrationPath = path.resolve(__dirname, '..', migrationFile);

if (!fs.existsSync(migrationPath)) {
  console.error(`❌ ERROR: Migration file not found: ${migrationPath}`);
  process.exit(1);
}

async function runMigration() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    // Lire le fichier SQL
    console.log(`📄 Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🚀 Executing migration...\n');
    console.log('--- SQL ---');
    console.log(sql);
    console.log('--- END SQL ---\n');

    // Exécuter la migration
    const result = await client.query(sql);
    
    console.log('✅ Migration executed successfully!');
    
    // Afficher les résultats si disponibles
    if (result.rows && result.rows.length > 0) {
      console.log('\n📊 Results:');
      console.table(result.rows);
    }

  } catch (error) {
    console.error('❌ Migration failed:');
    console.error(error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n🔌 Database connection closed');
  }
}

// Exécuter la migration
runMigration();
