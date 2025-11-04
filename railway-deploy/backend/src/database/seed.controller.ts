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
    summary: '🔧 FIX: Mettre à jour les primaryProfile des utilisateurs existants',
    description: 'Corrige les utilisateurs qui ont NULL dans primaryProfile en le définissant selon leur role'
  })
  @ApiResponse({ status: 200, description: 'primaryProfile mis à jour avec succès' })
  async fixUserProfiles() {
    try {
      console.log('🔄 Début mise à jour des primaryProfile...');
      
      // Récupérer les utilisateurs avec primaryProfile NULL
      const usersWithoutProfile = await this.dataSource.query(`
        SELECT id, email, role FROM users WHERE primary_profile IS NULL;
      `);
      
      console.log(`📊 ${usersWithoutProfile.length} utilisateur(s) sans primaryProfile trouvé(s)`);
      
      if (usersWithoutProfile.length === 0) {
        return {
          success: true,
          message: '✅ Tous les utilisateurs ont déjà un primaryProfile !',
          details: {
            updatedUsers: 0,
            alreadySet: true
          }
        };
      }
      
      // Mettre à jour les profils selon le rôle
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
        WHERE primary_profile IS NULL;
      `);
      
      console.log('✅ primaryProfile mis à jour pour tous les utilisateurs');
      
      return {
        success: true,
        message: `✅ ${usersWithoutProfile.length} utilisateur(s) mis à jour avec succès !`,
        details: {
          updatedUsers: usersWithoutProfile.length,
          users: usersWithoutProfile.map(u => ({ email: u.email, role: u.role })),
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
      console.error('❌ Erreur lors de la mise à jour des primaryProfile:', error);
      return {
        success: false,
        message: '❌ Erreur lors de la mise à jour',
        error: error.message
      };
    }
  }
}
