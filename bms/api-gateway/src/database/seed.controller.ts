import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SimpleTestSeedService } from './seeds/simple-test.seed';
import { runDevSeed } from './seeds/dev.seed';

@ApiTags('Database Seeds')
@Controller('database')
export class SeedController {
  constructor(
    private readonly simpleTestSeedService: SimpleTestSeedService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

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
}
