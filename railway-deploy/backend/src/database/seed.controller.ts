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

  @Post('fix-user-profiles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🔧 FIX: Créer colonne primaryProfile et mettre à jour les utilisateurs',
    description: 'Ajoute la colonne primary_profile si manquante puis définit les profils selon les roles'
  })
  @ApiResponse({ status: 200, description: 'primaryProfile créé et mis à jour avec succès' })
  async fixUserProfiles() {
    try {
      console.log('🔄 Début migration primaryProfile...');
      
      // ÉTAPE 1: Créer la colonne si elle n'existe pas
      console.log('📦 Création de la colonne primary_profile si nécessaire...');
      await this.dataSource.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS primary_profile VARCHAR(50);
      `);
      console.log('✅ Colonne primary_profile créée ou déjà existante');
      
      // ÉTAPE 2: Récupérer tous les utilisateurs
      const allUsers = await this.dataSource.query(`
        SELECT id, email, role, primary_profile FROM users;
      `);
      console.log(`📊 ${allUsers.length} utilisateur(s) total trouvé(s)`);
      
      // ÉTAPE 3: Mettre à jour les profils selon le rôle
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
      const updatedUsers = await this.dataSource.query(`
        SELECT email, role, primary_profile FROM users;
      `);
      
      return {
        success: true,
        message: `✅ Migration réussie ! ${allUsers.length} utilisateur(s) traité(s)`,
        details: {
          totalUsers: allUsers.length,
          users: updatedUsers.map(u => ({ 
            email: u.email, 
            role: u.role, 
            primaryProfile: u.primary_profile 
          })),
          mapping: {
            admin: 'admin',
            tax_admin: 'tax_admin',
            accountant: 'accountant',
            expert_comptable: 'expert_comptable',
            bank_admin: 'bank_admin',
            hr_manager: 'hr_manager',
            user: 'entrepreneur'
          }
        }
      };
    } catch (error) {
      console.error('❌ Erreur lors de la migration primaryProfile:', error);
      return {
        success: false,
        message: '❌ Erreur lors de la migration',
        error: error.message,
        stack: error.stack
      };
    }
  }
}
