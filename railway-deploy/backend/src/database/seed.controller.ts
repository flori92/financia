import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SimpleTestSeedService } from './seeds/simple-test.seed';

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
      
      // ÉTAPE 2: Mettre à jour les profils selon le rôle
      console.log('🔄 Mise à jour des primaryProfile selon les roles...');
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
      
      // ÉTAPE 3: Vérifier les résultats
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
}
