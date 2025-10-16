import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { TreasuryService } from './treasury.service';
import { CompaniesService } from '../companies/companies.service';

@Injectable()
export class TreasuryScheduler {
  private readonly logger = new Logger(TreasuryScheduler.name);

  constructor(
    private readonly companiesService: CompaniesService,
    private readonly treasuryService: TreasuryService,
  ) {}

  // Tous les jours à 09:00 (heure du Bénin)
  @Cron('0 9 * * *', { timeZone: 'Africa/Porto-Novo' })
  async dailyTreasuryAlerts() {
    try {
      const companies = await this.companiesService.findAll();
      for (const c of companies) {
        const userEmail = (c as any).email || process.env.ALERT_FALLBACK_EMAIL || 'dev@bms.test';
        const userPhone = (c as any).phone || process.env.ALERT_FALLBACK_PHONE || '+22997000001';
        const name = c.name || 'Société';
        const companyId = c.id;

        const result = await this.treasuryService.checkAndNotifyAlerts({
          companyId,
          userEmail,
          userPhone,
          companyName: name,
          criticalRunwayDays: (c as any).treasuryCriticalThreshold || 7,
          warningRunwayDays: (c as any).treasuryWarningThreshold || 15,
        });

        this.logger.log(`Notifications trésorerie pour ${name}: ${result.notificationsSent}`);
      }
    } catch (e) {
      this.logger.error('Erreur job dailyTreasuryAlerts', e as any);
    }
  }
}
