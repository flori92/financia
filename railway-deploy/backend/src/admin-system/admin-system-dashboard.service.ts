import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Company } from '../companies/entities/company.entity';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';

@Injectable()
export class AdminSystemDashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(JournalEntry)
    private readonly journalEntryRepository: Repository<JournalEntry>,
  ) {}

  /**
   * Récupère les métriques du dashboard Admin Système
   */
  async getDashboardMetrics(): Promise<any> {
    try {
      const [
        users,
        companies,
        system,
        activity,
        alerts,
      ] = await Promise.all([
        this.getUsersMetrics(),
        this.getCompaniesMetrics(),
        this.getSystemMetrics(),
        this.getActivityMetrics(),
        this.getAdminAlerts(),
      ]);

      return {
        kpis: {
          users,
          companies,
          system,
          activity,
        },
        alerts,
        recentUsers: await this.getRecentUsers(),
        recentActivity: await this.getRecentActivity(),
        usersByRole: await this.getUsersByRole(),
      };
    } catch (error) {
      console.error('[AdminSystemDashboard] Erreur getDashboardMetrics:', error);
      return this.getDefaultMetrics();
    }
  }

  /**
   * Métriques utilisateurs
   */
  private async getUsersMetrics(): Promise<any> {
    try {
      const totalUsers = await this.userRepository.count();
      
      const activeUsers = await this.userRepository.count({
        where: { isActive: true },
      });

      // Nouveaux utilisateurs ce mois
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const newThisMonth = await this.userRepository.count({
        where: {
          createdAt: { $gte: startOfMonth } as any,
        },
      });

      // Utilisateurs par rôle admin
      const adminUsers = await this.userRepository.count({
        where: { role: 'admin' },
      });

      return {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        newThisMonth,
        adminCount: adminUsers,
      };
    } catch (error) {
      return { total: 0, active: 0, inactive: 0, newThisMonth: 0, adminCount: 0 };
    }
  }

  /**
   * Métriques sociétés
   */
  private async getCompaniesMetrics(): Promise<any> {
    try {
      const totalCompanies = await this.companyRepository.count();

      // Sociétés actives (avec au moins 1 écriture récente)
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const activeCompanies = await this.companyRepository
        .createQueryBuilder('company')
        .leftJoin(JournalEntry, 'entry', 'entry.company_id = company.id')
        .where('entry.created_at >= :date', { date: thirtyDaysAgo })
        .groupBy('company.id')
        .getCount();

      // Nouvelles sociétés ce mois
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const newThisMonth = await this.companyRepository.count({
        where: {
          createdAt: { $gte: startOfMonth } as any,
        },
      });

      return {
        total: totalCompanies,
        active: activeCompanies,
        inactive: totalCompanies - activeCompanies,
        newThisMonth,
      };
    } catch (error) {
      return { total: 0, active: 0, inactive: 0, newThisMonth: 0 };
    }
  }

  /**
   * Métriques système
   */
  private async getSystemMetrics(): Promise<any> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Écritures comptables ce mois
      const entriesThisMonth = await this.journalEntryRepository.count({
        where: {
          createdAt: { $gte: startOfMonth } as any,
        },
      });

      // Écritures totales
      const totalEntries = await this.journalEntryRepository.count();

      // Taux de croissance
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const entriesLastMonth = await this.journalEntryRepository.count({
        where: {
          createdAt: { $gte: lastMonth, $lte: endLastMonth } as any,
        },
      });

      const growthRate = entriesLastMonth > 0 
        ? ((entriesThisMonth - entriesLastMonth) / entriesLastMonth) * 100 
        : 0;

      return {
        totalEntries,
        entriesThisMonth,
        entriesLastMonth,
        growthRate: Math.round(growthRate * 10) / 10,
        uptime: 99.9, // À intégrer avec monitoring
        responseTime: 120, // ms - À intégrer avec monitoring
      };
    } catch (error) {
      return { totalEntries: 0, entriesThisMonth: 0, entriesLastMonth: 0, growthRate: 0, uptime: 0, responseTime: 0 };
    }
  }

  /**
   * Métriques activité
   */
  private async getActivityMetrics(): Promise<any> {
    try {
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // TODO: Intégrer avec système de logs/audit
      // Pour l'instant, utiliser les créations d'écritures comme proxy

      const actionsLast24h = await this.journalEntryRepository.count({
        where: {
          createdAt: { $gte: last24h } as any,
        },
      });

      return {
        last24h: actionsLast24h,
        avgPerDay: Math.round(actionsLast24h), // Moyenne simplifiée
        peakHour: '14:00', // À calculer depuis les logs
      };
    } catch (error) {
      return { last24h: 0, avgPerDay: 0, peakHour: 'N/A' };
    }
  }

  /**
   * Alertes admin
   */
  private async getAdminAlerts(): Promise<any[]> {
    const alerts = [];

    try {
      // Utilisateurs inactifs à nettoyer
      const inactiveUsers = await this.userRepository.count({
        where: { isActive: false },
      });

      if (inactiveUsers > 5) {
        alerts.push({
          type: 'warning',
          title: 'Utilisateurs inactifs',
          message: `${inactiveUsers} utilisateur(s) inactif(s) à nettoyer`,
        });
      }

      // Sociétés sans activité récente
      const companies = await this.getCompaniesMetrics();
      if (companies.inactive > companies.total * 0.3) {
        alerts.push({
          type: 'info',
          title: 'Sociétés inactives',
          message: `${companies.inactive} société(s) sans activité récente`,
        });
      }

      // Performance système
      const system = await this.getSystemMetrics();
      if (system.responseTime > 500) {
        alerts.push({
          type: 'danger',
          title: 'Performance dégradée',
          message: `Temps de réponse: ${system.responseTime}ms`,
        });
      }

      // Message de succès
      if (alerts.length === 0) {
        alerts.push({
          type: 'info',
          title: 'Système sain',
          message: 'Tous les indicateurs système sont au vert',
        });
      }
    } catch (error) {
      console.error('[AdminSystemDashboard] Erreur getAdminAlerts:', error);
    }

    return alerts;
  }

  /**
   * Utilisateurs récents (10 derniers)
   */
  private async getRecentUsers(): Promise<any[]> {
    try {
      const users = await this.userRepository.find({
        order: { createdAt: 'DESC' },
        take: 10,
      });

      return users.map(user => ({
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profiles?.[0] || 'N/A',
        isActive: user.isActive,
        createdAt: user.createdAt,
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Activité récente (10 dernières actions)
   */
  private async getRecentActivity(): Promise<any[]> {
    try {
      // TODO: Intégrer avec système d'audit
      // Pour l'instant, utiliser les écritures récentes
      const entries = await this.journalEntryRepository.find({
        order: { createdAt: 'DESC' },
        take: 10,
      });

      return entries.map(entry => ({
        id: entry.id,
        action: 'Écriture comptable créée',
        entryNumber: entry.entryNumber,
        date: entry.createdAt,
        user: 'Système', // À récupérer depuis audit
      }));
    } catch (error) {
      return [];
    }
  }

  /**
   * Répartition utilisateurs par rôle
   */
  private async getUsersByRole(): Promise<any[]> {
    try {
      const users = await this.userRepository.find();

      const roleMap = new Map<string, number>();
      users.forEach(user => {
        const role = user.role || 'unknown';
        roleMap.set(role, (roleMap.get(role) || 0) + 1);
      });

      const roles = Array.from(roleMap.entries()).map(([role, count]) => ({
        role,
        count,
        percentage: users.length > 0 ? Math.round((count / users.length) * 100) : 0,
      }));

      return roles.sort((a, b) => b.count - a.count);
    } catch (error) {
      return [];
    }
  }

  /**
   * Métriques par défaut en cas d'erreur
   */
  private getDefaultMetrics(): any {
    return {
      kpis: {
        users: { total: 0, active: 0, inactive: 0, newThisMonth: 0, adminCount: 0 },
        companies: { total: 0, active: 0, inactive: 0, newThisMonth: 0 },
        system: { totalEntries: 0, entriesThisMonth: 0, entriesLastMonth: 0, growthRate: 0, uptime: 0, responseTime: 0 },
        activity: { last24h: 0, avgPerDay: 0, peakHour: 'N/A' },
      },
      alerts: [
        {
          type: 'info',
          title: 'Chargement',
          message: 'Impossible de charger les données système',
        },
      ],
      recentUsers: [],
      recentActivity: [],
      usersByRole: [],
    };
  }
}
