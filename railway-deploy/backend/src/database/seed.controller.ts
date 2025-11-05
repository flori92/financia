import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SimpleTestSeedService } from './seeds/simple-test.seed';
import { runDevSeed } from './seeds/dev.seed';
import * as bcrypt from 'bcrypt';

@ApiTags('Database Seeds')
@Controller('database')
export class SeedController {
  constructor(
    private readonly simpleTestSeedService: SimpleTestSeedService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  @Post('seed-test-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Générer des données de test pour BMS',
    description: 'Crée des écritures comptables variées sur 6 mois pour visualiser les graphiques'
  })
  @ApiResponse({ status: 200, description: 'Données de test créées avec succès' })
  async seedTestData(@Body() body: { companyId: string }) {
    if (!body.companyId) {
      throw new Error('companyId requis');
    }

    await this.simpleTestSeedService.seedSimpleData(body.companyId);
    
    return {
      success: true,
      message: 'Données de test créées avec succès !',
      data: {
        journalEntries: 60, // 10 écritures/mois × 6 mois
        period: '6 derniers mois',
        types: 'Ventes (70%) + Achats (30%)',
        purpose: 'Visualisation graphiques et KPI'
      }
    };
  }

  @Post('sync-database-schema')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🔧 SYNC: Synchroniser TOUTES les colonnes manquantes de la table users',
    description: 'Crée toutes les colonnes manquantes dans la table users selon l\'entité TypeORM'
  })
  @ApiResponse({ status: 200, description: 'Schéma de base de données synchronisé avec succès' })
  async syncDatabaseSchema() {
    try {
      console.log('🔄 Début synchronisation complète du schéma...');
      const columnsCreated = [];
      
      // ÉTAPE 1: Créer TOUTES les colonnes manquantes pour la table users
      console.log('📦 Création de toutes les colonnes manquantes...');
      
      // Colonne profiles (tableau de profils multiples)
      try {
        await this.dataSource.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS profiles TEXT;
        `);
        columnsCreated.push('profiles');
      } catch (e) { console.log('profiles déjà existe'); }
      
      // Colonne primary_profile
      try {
        await this.dataSource.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS primary_profile VARCHAR(50) DEFAULT 'entrepreneur';
        `);
        columnsCreated.push('primary_profile');
      } catch (e) { console.log('primary_profile déjà existe'); }
      
      // Colonne employee_id
      try {
        await this.dataSource.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS employee_id UUID;
        `);
        columnsCreated.push('employee_id');
      } catch (e) { console.log('employee_id déjà existe'); }
      
      // Colonne ux_level
      try {
        await this.dataSource.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS ux_level VARCHAR(20) DEFAULT 'simple';
        `);
        columnsCreated.push('ux_level');
      } catch (e) { console.log('ux_level déjà existe'); }
      
      // Colonne language
      try {
        await this.dataSource.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'fr';
        `);
        columnsCreated.push('language');
      } catch (e) { console.log('language déjà existe'); }
      
      // Colonne country_code
      try {
        await this.dataSource.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS country_code VARCHAR(5) DEFAULT 'BJ';
        `);
        columnsCreated.push('country_code');
      } catch (e) { console.log('country_code déjà existe'); }
      
      // Colonne two_factor_secret
      try {
        await this.dataSource.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
        `);
        columnsCreated.push('two_factor_secret');
      } catch (e) { console.log('two_factor_secret déjà existe'); }
      
      // Colonne two_factor_enabled
      try {
        await this.dataSource.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false;
        `);
        columnsCreated.push('two_factor_enabled');
      } catch (e) { console.log('two_factor_enabled déjà existe'); }
      
      // Colonne two_factor_temp_secret
      try {
        await this.dataSource.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS two_factor_temp_secret VARCHAR(255);
        `);
        columnsCreated.push('two_factor_temp_secret');
      } catch (e) { console.log('two_factor_temp_secret déjà existe'); }
      
      // Colonne two_factor_backup_codes
      try {
        await this.dataSource.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSONB;
        `);
        columnsCreated.push('two_factor_backup_codes');
      } catch (e) { console.log('two_factor_backup_codes déjà existe'); }
      
      console.log(`✅ ${columnsCreated.length} colonne(s) créée(s): ${columnsCreated.join(', ')}`);
      
      // ÉTAPE 2: Corriger les rôles des utilisateurs seed
      console.log('🔄 Correction des roles utilisateurs seed...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await this.dataSource.query(`
        UPDATE users SET role = 'admin', primary_profile = 'admin', password = $1 
        WHERE email = 'admin@bms.bj';
      `, [hashedPassword]);
      
      await this.dataSource.query(`
        UPDATE users SET role = 'tax_admin', primary_profile = 'tax_admin', password = $1 
        WHERE email = 'taxadmin@dgi.bj';
      `, [hashedPassword]);
      
      await this.dataSource.query(`
        UPDATE users SET role = 'accountant', primary_profile = 'accountant', password = $1 
        WHERE email = 'comptable@cabinet.bj';
      `, [hashedPassword]);
      
      await this.dataSource.query(`
        UPDATE users SET role = 'user', primary_profile = 'entrepreneur', password = $1 
        WHERE email = 'entrepreneur@test.bj';
      `, [hashedPassword]);
      
      console.log('✅ Roles et primaryProfile corrigés pour les utilisateurs seed');
      
      // ÉTAPE 3: Mettre à jour les autres profils selon le rôle
      console.log('🔄 Mise à jour des autres primaryProfile selon les roles...');
      await this.dataSource.query(`
        UPDATE users 
        SET primary_profile = CASE 
          WHEN role = 'admin' THEN 'admin'
          WHEN role = 'tax_admin' THEN 'tax_admin'
          WHEN role = 'accountant' THEN 'accountant'
          WHEN role = 'expert_comptable' THEN 'expert_comptable'
          WHEN role = 'bank_admin' THEN 'bank_admin'
          WHEN role = 'hr_manager' THEN 'hr_manager'
          WHEN role = 'user' THEN 'entrepreneur'
          ELSE 'entrepreneur'
        END
        WHERE primary_profile IS NULL OR primary_profile = '';
      `);
      
      console.log('✅ primaryProfile mis à jour pour tous les utilisateurs');
      
      // ÉTAPE 4: Vérifier les résultats
      const users = await this.dataSource.query(`
        SELECT email, role, primary_profile, profiles FROM users;
      `);
      
      return {
        success: true,
        message: `✅ Synchronisation complète réussie ! ${columnsCreated.length} colonne(s) créée(s)`,
        details: {
          columnsCreated,
          totalUsers: users.length,
          users: users.map(u => ({ 
            email: u.email, 
            role: u.role, 
            primaryProfile: u.primary_profile,
            profiles: u.profiles
          }))
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
      return {
        success: false,
        message: '❌ Erreur lors de la synchronisation',
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Post('seed-users')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🌱 SEED: Créer/Mettre à jour les utilisateurs de développement',
    description: 'Exécute le seed dev.seed.ts avec les utilisateurs ayant les bons rôles (admin, tax_admin, accountant, entrepreneur)'
  })
  @ApiResponse({ status: 200, description: 'Utilisateurs seed créés/mis à jour avec succès' })
  async seedUsers() {
    try {
      console.log('🌱 Début seed des utilisateurs...');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      // Admin
      await this.dataSource.query(`
        INSERT INTO users (email, password, first_name, last_name, role, primary_profile, phone, email_verified, is_active)
        VALUES ('admin@bms.bj', $1, 'Admin', 'BMS', 'admin', 'admin', '+22997000001', true, true)
        ON CONFLICT (email) DO UPDATE 
        SET role = 'admin', primary_profile = 'admin', password = $1;
      `, [hashedPassword]);
      
      // Tax Admin
      await this.dataSource.query(`
        INSERT INTO users (email, password, first_name, last_name, role, primary_profile, phone, email_verified, is_active)
        VALUES ('taxadmin@dgi.bj', $1, 'Tax', 'Admin', 'tax_admin', 'tax_admin', '+22997000002', true, true)
        ON CONFLICT (email) DO UPDATE 
        SET role = 'tax_admin', primary_profile = 'tax_admin', password = $1;
      `, [hashedPassword]);
      
      // Accountant (Expert-Comptable)
      await this.dataSource.query(`
        INSERT INTO users (email, password, first_name, last_name, role, primary_profile, phone, email_verified, is_active)
        VALUES ('comptable@cabinet.bj', $1, 'Jean', 'Comptable', 'accountant', 'accountant', '+22997000003', true, true)
        ON CONFLICT (email) DO UPDATE 
        SET role = 'accountant', primary_profile = 'accountant', password = $1;
      `, [hashedPassword]);
      
      // Entrepreneur
      await this.dataSource.query(`
        INSERT INTO users (email, password, first_name, last_name, role, primary_profile, phone, email_verified, is_active)
        VALUES ('entrepreneur@test.bj', $1, 'Marie', 'Entrepreneur', 'user', 'entrepreneur', '+22997000004', true, true)
        ON CONFLICT (email) DO UPDATE 
        SET role = 'user', primary_profile = 'entrepreneur', password = $1;
      `, [hashedPassword]);
      
      // Vérifier les utilisateurs créés
      const users = await this.dataSource.query(`
        SELECT id, email, role, primary_profile, first_name, last_name FROM users 
        WHERE email IN ('admin@bms.bj', 'taxadmin@dgi.bj', 'comptable@cabinet.bj', 'entrepreneur@test.bj')
        ORDER BY email;
      `);
      
      console.log('✅ Seed des utilisateurs terminé');
      
      return {
        success: true,
        message: '✅ 4 utilisateurs seed créés/mis à jour avec succès !',
        details: {
          totalUsers: users.length,
          users: users.map(u => ({
            id: u.id,
            email: u.email,
            firstName: u.first_name,
            lastName: u.last_name,
            role: u.role,
            primaryProfile: u.primary_profile
          })),
          credentials: {
            password: 'password123',
            note: 'Tous les utilisateurs seed utilisent ce mot de passe'
          }
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors du seed des utilisateurs:', error);
      return {
        success: false,
        message: '❌ Erreur lors du seed',
        error: error.message,
        stack: error.stack
      };
    }
  }

  @Post('seed-demo-data')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Initialiser toutes les données de démonstration',
    description: 'Crée des utilisateurs, entreprises, factures, paiements et plan comptable OHADA complet'
  })
  @ApiResponse({ status: 200, description: 'Données de démonstration créées avec succès' })
  async seedDemoData() {
    await runDevSeed(this.dataSource);

    return {
      success: true,
      message: 'Données de démonstration créées avec succès !',
      data: {
        users: 4,
        companies: 3,
        invoices: 'Multiple',
        accounts: '40+ comptes OHADA',
        credentials: [
          { email: 'admin@bms.bj', password: 'password123', role: 'Admin' },
          { email: 'comptable@cabinet.bj', password: 'password123', role: 'Comptable' },
          { email: 'entrepreneur@test.bj', password: 'password123', role: 'Entrepreneur' },
          { email: 'taxadmin@dgi.bj', password: 'password123', role: 'Administration Fiscale' },
        ]
      }
    };
  }

  @Post('seed-companies')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Créer les entreprises et lier les utilisateurs existants',
    description: 'Crée 3 entreprises et lie les utilisateurs seed existants via company_users'
  })
  @ApiResponse({ status: 200, description: 'Entreprises créées et utilisateurs liés avec succès' })
  async seedCompanies() {
    try {
      // Récupérer les IDs des utilisateurs
      const users = await this.dataSource.query(`
        SELECT id, email FROM users WHERE email IN (
          'admin@bms.bj', 'comptable@cabinet.bj', 'entrepreneur@test.bj', 'taxadmin@dgi.bj'
        );
      `);

      const admin = users.find(u => u.email === 'admin@bms.bj');
      const accountant = users.find(u => u.email === 'comptable@cabinet.bj');
      const entrepreneur = users.find(u => u.email === 'entrepreneur@test.bj');

      // Créer les entreprises
      const company1Result = await this.dataSource.query(`
        INSERT INTO companies (
          name, nif, legal_form, address, city, country_code, phone, email, is_active
        )
        VALUES (
          'Restaurant Le Béninois', '1234567890', 'SARL', '123 Rue de la Paix', 'Cotonou', 'BJ',
          '+22997000010', 'contact@restaurant-beninois.bj', true
        )
        ON CONFLICT (nif) DO UPDATE SET name = EXCLUDED.name
        RETURNING id;
      `);
      const company1Id = company1Result[0]?.id;

      await this.dataSource.query(`
        INSERT INTO companies (
          name, nif, legal_form, address, city, country_code, phone, email, is_active
        )
        VALUES (
          'Tech Afrique SARL', '0987654321', 'SARL', '456 Boulevard des Affaires', 'Porto-Novo', 'BJ',
          '+22997000020', 'info@tech-afrique.bj', true
        )
        ON CONFLICT (nif) DO NOTHING;
      `);

      await this.dataSource.query(`
        INSERT INTO companies (
          name, nif, legal_form, address, city, country_code, phone, email, is_active
        )
        VALUES (
          'Global Services SARL', '1122334455', 'SARL', '789 Avenue du Commerce', 'Parakou', 'BJ',
          '+22997000030', 'contact@global-services.bj', true
        )
        ON CONFLICT (nif) DO NOTHING;
      `);

      // Lier les utilisateurs à la première entreprise
      if (company1Id && admin && accountant && entrepreneur) {
        await this.dataSource.query(`
          INSERT INTO company_users (company_id, user_id, role, is_active)
          VALUES
            ($1, $2, 'owner', true),
            ($1, $3, 'accountant', true),
            ($1, $4, 'admin', true)
          ON CONFLICT (company_id, user_id) DO NOTHING;
        `, [company1Id, entrepreneur.id, accountant.id, admin.id]);
      }

      const companies = await this.dataSource.query(`SELECT id, name, nif FROM companies;`);

      return {
        success: true,
        message: 'Entreprises créées et utilisateurs liés avec succès !',
        data: {
          companiesCount: companies.length,
          linkedUsers: 3,
          companyList: companies.map(c => ({ id: c.id, name: c.name, nif: c.nif }))
        }
      };
    } catch (error) {
      console.error('Erreur lors du seed des entreprises:', error);
      return {
        success: false,
        message: 'Erreur lors du seed des entreprises',
        error: error.message
      };
    }
  }
}
