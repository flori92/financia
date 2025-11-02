const moment = require('moment');
const database = require('../database');
const DynamicService = require('./DynamicService');

class TreasuryService {
  // Prévisions dynamiques
  async getForecast(companyId, days = 30) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Mode dynamique : calcul basé sur transactions réelles + projections
      const forecast = DynamicService.generateForecastData(companyId, days);
      
      // Persister les prévisions pour analyse
      for (const day of forecast) {
        await database.run(`
          INSERT OR REPLACE INTO treasury_forecast 
          (company_id, date, inflow, outflow, balance)
          VALUES (?, ?, ?, ?, ?)
        `, [companyId, day.date, day.inflow, day.outflow, day.balance]);
      }
      
      const totals = {
        totalInflow: forecast.reduce((sum, d) => sum + d.inflow, 0),
        totalOutflow: forecast.reduce((sum, d) => sum + d.outflow, 0),
        netBalance: forecast[forecast.length - 1]?.balance || 0
      };
      
      return { forecast, ...totals };
    } else {
      // Mode statique : données prédéfinies
      return {
        forecast: [
          { date: '2025-11-01', inflow: 1500000, outflow: 1200000, balance: 300000 },
          { date: '2025-11-02', inflow: 800000, outflow: 600000, balance: 500000 },
          { date: '2025-11-03', inflow: 2000000, outflow: 1800000, balance: 700000 }
        ],
        totalInflow: 4300000,
        totalOutflow: 3600000,
        netBalance: 700000
      };
    }
  }

  // Alertes trésorerie intelligentes
  async getAlerts(companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      const forecast = await this.getForecast(companyId, 7); // 7 jours
      const alerts = [];
      
      // Calculer runway (jours de trésorerie restants)
      const currentBalance = forecast.forecast[0]?.balance || 0;
      const dailyBurnRate = forecast.forecast.reduce((sum, d) => sum + (d.outflow - d.inflow), 0) / 7;
      const runway = dailyBurnRate > 0 ? Math.floor(currentBalance / dailyBurnRate) : 999;
      
      // Alertes basées sur runway
      if (runway < 7) {
        alerts.push({
          type: 'danger',
          title: 'Trésorerie critique',
          message: `Runway de ${runway} jours. Risque de liquidation dans moins d'une semaine.`
        });
      } else if (runway < 15) {
        alerts.push({
          type: 'warning',
          title: 'Trésorerie faible',
          message: `Runway de ${runway} jours. Surveillez les encaissements.`
        });
      }
      
      // Alertes sur tendances
      const last3Days = forecast.forecast.slice(-3);
      const trend = last3Days.reduce((sum, d) => sum + d.balance, 0) / 3 - 
                   (forecast.forecast[0]?.balance || 0);
      
      if (trend < -500000) {
        alerts.push({
          type: 'warning',
          title: 'Tendance négative',
          message: 'Baisse significative de la trésorerie sur les 3 derniers jours.'
        });
      }
      
      // Alertes sur grosses sorties
      const largeOutflows = forecast.forecast.filter(d => d.outflow > 1000000);
      if (largeOutflows.length > 0) {
        alerts.push({
          type: 'info',
          title: 'Grosses dépenses prévues',
          message: `${largeOutflows.length} dépenses importantes prévues cette semaine.`
        });
      }
      
      return { alerts, count: alerts.length, runway };
    } else {
      // Mode statique
      return {
        alerts: [
          { type: 'warning', title: 'Solde bancaire faible', message: 'Le solde prévu pour demain est inférieur à 100 000 FCFA' },
          { type: 'danger', title: 'Échéance imminente', message: '3 factures fournisseurs arrivent à échéance demain' }
        ],
        count: 2
      };
    }
  }

  // Prélèvements automatiques
  async getDirectDebits(companyId) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      // Simuler prélèvements avec montants variables
      const debits = [];
      const baseDate = moment();
      
      for (let i = 0; i < 5; i++) {
        const nextDate = baseDate.clone().add(Math.floor(Math.random() * 30) + 1, 'days');
        debits.push({
          id: `debit_${i + 1}`,
          creditor: `Fournisseur ${String.fromCharCode(65 + i)}`,
          amount: Math.round(300000 + Math.random() * 700000),
          nextDate: nextDate.format('YYYY-MM-DD'),
          frequency: ['monthly', 'weekly', 'biweekly'][Math.floor(Math.random() * 3)],
          status: ['active', 'paused'][Math.floor(Math.random() * 2)]
        });
      }
      
      return debits;
    } else {
      // Mode statique
      return [
        {
          id: '1',
          creditor: 'Fournisseur A',
          amount: 500000,
          nextDate: '2025-11-05',
          frequency: 'monthly',
          status: 'active'
        },
        {
          id: '2',
          creditor: 'Fournisseur B',
          amount: 300000,
          nextDate: '2025-11-10',
          frequency: 'monthly',
          status: 'active'
        }
      ];
    }
  }

  async getDirectDebitStatistics(companyId) {
    const debits = await this.getDirectDebits(companyId);
    const active = debits.filter(d => d.status === 'active');
    
    return {
      totalActive: active.length,
      totalAmount: active.reduce((sum, d) => sum + d.amount, 0),
      nextMonthTotal: active.reduce((sum, d) => sum + d.amount, 0) * 0.8, // Estimation
      averageAmount: active.length > 0 ? Math.round(active.reduce((sum, d) => sum + d.amount, 0) / active.length) : 0
    };
  }

  // CRUD prélèvements
  async createDirectDebit(companyId, debitData) {
    const newDebit = {
      id: `debit_${Date.now()}`,
      company_id: companyId,
      ...debitData,
      status: 'active',
      created_at: new Date().toISOString()
    };

    // En mode dynamique, on pourrait sauvegarder en DB
    // await database.run('INSERT INTO direct_debits ...', newDebit);
    
    return newDebit;
  }

  async updateDirectDebit(companyId, debitId, updateData) {
    return {
      id: debitId,
      company_id: companyId,
      ...updateData,
      updated_at: new Date().toISOString()
    };
  }

  async deleteDirectDebit(companyId, debitId) {
    return { success: true, message: 'Prélèvement supprimé' };
  }

  async suspendDirectDebit(companyId, debitId) {
    return { success: true, status: 'suspended' };
  }

  async reactivateDirectDebit(companyId, debitId) {
    return { success: true, status: 'active' };
  }

  async cancelDirectDebit(companyId, debitId) {
    return { success: true, status: 'cancelled' };
  }
}

module.exports = new TreasuryService();
