import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
  async getDashboardData(companyId: string) {
    // TODO: Implement dashboard data aggregation
    return {
      revenue: 0,
      expenses: 0,
      profit: 0,
      cashFlow: 0,
    };
  }

  async getKPIs(companyId: string) {
    // TODO: Implement KPIs calculation
    return [];
  }
}
