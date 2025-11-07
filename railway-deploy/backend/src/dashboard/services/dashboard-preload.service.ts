import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UnifiedDashboardService } from './unified-dashboard.service';
import { CacheService } from '../../common/services/cache.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';

/**
 * Service de préchargement intelligent des dashboards
 */
@Injectable()
export class DashboardPreloadService implements OnModuleInit {
  private readonly logger = new Logger(DashboardPreloadService.name);
  private readonly preloadEnabled: boolean;
  private readonly preloadInterval: number;

  constructor(
    private readonly unifiedDashboard: UnifiedDashboardService,
    private readonly cacheService: CacheService,
    private readonly scheduler: SchedulerRegistry,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {
    this.preloadEnabled = process.env.DASHBOARD_PRELOAD_ENABLED === 'true';
    this.preloadInterval = parseInt(process.env.DASHBOARD_PRELOAD_INTERVAL || '300000'); // 5 minutes par défaut
  }

  onModuleInit() {
    if (this.preloadEnabled) {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log('Dashboard preload service initialized');
      }
    } else {
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log('Dashboard preload service disabled');
      }
    }
  }

  /**
   * Précharge les données pour un profil spécifique
   */
  async preloadForProfile(companyId: string, profile: string): Promise<void> {
    try {
      this.logger.debug(`Preloading dashboard for ${companyId}:${profile}`);
      
      // Précharger les données les plus utilisées
      await Promise.all([
        this.unifiedDashboard.getDashboardData(companyId, profile),
        this.preloadKPIs(companyId),
        this.preloadCharts(companyId),
        this.preloadAlerts(companyId),
      ]);

      this.logger.debug(`Preload completed for ${companyId}:${profile}`);
    } catch (error) {
      this.logger.error(`Error preloading for ${companyId}:${profile}:`, error);
    }
  }

  /**
   * Précharge les KPIs pour toutes les entreprises actives
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async preloadActiveCompanies(): Promise<void> {
    if (!this.preloadEnabled) return;

    try {
      this.logger.log('Starting preload for active companies...');
      
      const activeCompanies = await this.getActiveCompanies();
      this.logger.log(`Found ${activeCompanies.length} active companies`);

      // Précharger pour les profils les plus utilisés
      const profiles = ['accountant', 'entrepreneur', 'expert-comptable'];
      
      for (const company of activeCompanies) {
        for (const profile of profiles) {
          await this.preloadForProfile(company.id, profile);
        }
      }

      this.logger.log('Preload completed for all active companies');
    } catch (error) {
      this.logger.error('Error in preloadActiveCompanies:', error);
    }
  }

  /**
   * Précharge les KPIs
   */
  private async preloadKPIs(companyId: string): Promise<void> {
    try {
      await this.unifiedDashboard.getWidget(companyId, 'accountant', 'metrics');
    } catch (error) {
      this.logger.warn(`Error preloading KPIs for ${companyId}:`, error);
    }
  }

  /**
   * Précharge les graphiques
   */
  private async preloadCharts(companyId: string): Promise<void> {
    try {
      await this.unifiedDashboard.getWidget(companyId, 'accountant', 'treasury');
    } catch (error) {
      this.logger.warn(`Error preloading charts for ${companyId}:`, error);
    }
  }

  /**
   * Précharge les alertes
   */
  private async preloadAlerts(companyId: string): Promise<void> {
    try {
      await this.unifiedDashboard.getWidget(companyId, 'accountant', 'alerts');
    } catch (error) {
      this.logger.warn(`Error preloading alerts for ${companyId}:`, error);
    }
  }

  /**
   * Récupère les entreprises actives (avec activité récente)
   */
  private async getActiveCompanies(): Promise<Company[]> {
    try {
      // Récupérer les entreprises avec activité dans les 30 derniers jours
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      return await this.companyRepository
        .createQueryBuilder('company')
        .where('company.updatedAt >= :date', { date: thirtyDaysAgo })
        .orWhere('company.createdAt >= :date', { date: thirtyDaysAgo })
        .getMany();
    } catch (error) {
      this.logger.error('Error getting active companies:', error);
      return [];
    }
  }

  /**
   * Précharge manuel pour une entreprise spécifique
   */
  async preloadCompany(companyId: string): Promise<void> {
    const profiles = ['accountant', 'entrepreneur', 'expert-comptable', 'hr-manager', 'manager'];
    
    for (const profile of profiles) {
      await this.preloadForProfile(companyId, profile);
    }
  }
}

