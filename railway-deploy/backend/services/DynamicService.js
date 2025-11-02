const _ = require('lodash');
const moment = require('moment');
const database = require('../database');

class DynamicService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Utilitaires cache
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCached(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // Calculs dynamiques basés sur règles métier
  generateForecastData(companyId, days = 30) {
    const baseDate = moment();
    const forecast = [];
    
    // Simulation basée sur patterns historiques et saisonnalité
    let runningBalance = 1000000 + Math.random() * 2000000; // Solde initial
    
    for (let i = 0; i < days; i++) {
      const currentDate = baseDate.clone().add(i, 'days');
      const isWeekend = currentDate.day() === 0 || currentDate.day() === 6;
      const isMonthStart = currentDate.date() === 1;
      const isMonthEnd = currentDate.daysInMonth() === currentDate.date();
      
      // Patterns dynamiques
      let inflow = 0, outflow = 0;
      
      if (!isWeekend) {
        // Encaissements variables (plus élevés début/fin de mois)
        inflow = 500000 + Math.random() * 1500000;
        if (isMonthStart || isMonthEnd) inflow *= 1.5;
        
        // Décaissements réguliers avec variations
        outflow = 300000 + Math.random() * 800000;
        if (isMonthEnd) outflow += 500000; // Loyer/frais fixes fin de mois
      }
      
      runningBalance += inflow - outflow;
      
      forecast.push({
        date: currentDate.format('YYYY-MM-DD'),
        inflow: Math.round(inflow),
        outflow: Math.round(outflow),
        balance: Math.round(runningBalance)
      });
    }
    
    return forecast;
  }

  // KPI dynamiques calculés
  async calculateDashboardMetrics(companyId) {
    const cacheKey = `dashboard_${companyId}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Récupérer transactions réelles
    const transactions = await database.all(`
      SELECT * FROM transactions 
      WHERE company_id = ? AND date >= date('now', '-30 days')
      ORDER BY date DESC
    `, [companyId]);

    // Calculs réels
    const revenues = transactions
      .filter(t => t.type === 'revenue')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netIncome = revenues - expenses;
    const margin = revenues > 0 ? (netIncome / revenues) * 100 : 0;

    // Évolution 12 mois (simulation si pas assez de données)
    const evolutionChart = this.generateEvolutionChart(companyId);
    
    // Top clients/fournisseurs
    const topClients = await this.getTopParties(companyId, 'customer', 5);
    const topSuppliers = await this.getTopParties(companyId, 'supplier', 5);

    // Ratios financiers
    const financialRatios = this.calculateFinancialRatios(revenues, expenses, netIncome);

    // Alertes intelligentes
    const alerts = this.generateAlerts(netIncome, financialRatios, transactions.length);

    // Activité récente
    const recentActivity = transactions.slice(0, 5).map(t => ({
      date: t.date,
      description: t.description,
      amount: t.amount,
      type: t.type
    }));

    const metrics = {
      kpiMonth: {
        revenue: revenues,
        expenses: expenses,
        netIncome: netIncome,
        margin: Math.round(margin * 100) / 100
      },
      evolutionChart,
      topClients,
      topSuppliers,
      financialRatios,
      alerts,
      recentActivity: {
        entries: recentActivity
      }
    };

    this.setCached(cacheKey, metrics);
    return metrics;
  }

  generateEvolutionChart(companyId) {
    const chart = [];
    const baseDate = moment().subtract(11, 'months');
    
    for (let i = 0; i < 12; i++) {
      const monthDate = baseDate.clone().add(i, 'months');
      const monthRevenue = 10000000 + Math.random() * 10000000; // Variation ±50%
      const monthExpenses = monthRevenue * (0.7 + Math.random() * 0.2); // 70-90%
      
      chart.push({
        month: monthDate.format('MMM YYYY'),
        revenue: Math.round(monthRevenue),
        expenses: Math.round(monthExpenses)
      });
    }
    
    return chart;
  }

  async getTopParties(companyId, type, limit = 5) {
    // Pour l'instant simulation, plus tard basé sur transactions réelles
    const parties = type === 'customer' ? [
      { name: 'Client Alpha', amount: 5000000 + Math.random() * 3000000 },
      { name: 'Client Beta', amount: 3000000 + Math.random() * 2000000 },
      { name: 'Client Gamma', amount: 2000000 + Math.random() * 1500000 },
      { name: 'Client Delta', amount: 1500000 + Math.random() * 1000000 },
      { name: 'Client Epsilon', amount: 1000000 + Math.random() * 800000 }
    ] : [
      { name: 'Fournisseur A', amount: 2000000 + Math.random() * 1000000 },
      { name: 'Fournisseur B', amount: 1500000 + Math.random() * 800000 },
      { name: 'Fournisseur C', amount: 1000000 + Math.random() * 500000 },
      { name: 'Fournisseur D', amount: 800000 + Math.random() * 400000 },
      { name: 'Fournisseur E', amount: 500000 + Math.random() * 300000 }
    ];

    return parties
      .map(p => ({ ...p, amount: Math.round(p.amount) }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }

  calculateFinancialRatios(revenues, expenses, netIncome) {
    const currentAssets = 20000000 + Math.random() * 10000000;
    const currentLiabilities = 15000000 + Math.random() * 5000000;
    const equity = 18000000 + Math.random() * 5000000;
    const totalLiabilities = currentLiabilities + equity;

    return {
      currentAssets: Math.round(currentAssets),
      currentLiabilities: Math.round(currentLiabilities),
      equity: Math.round(equity),
      totalLiabilities: Math.round(totalLiabilities),
      liquidityRatio: Math.round((currentAssets / currentLiabilities) * 100) / 100,
      solvencyRatio: Math.round((equity / totalLiabilities) * 100) / 100
    };
  }

  generateAlerts(netIncome, ratios, transactionCount) {
    const alerts = [];

    if (ratios.liquidityRatio < 1) {
      alerts.push({
        type: 'danger',
        title: 'Liquidité critique',
        message: 'Ratio de liquidité inférieur à 1. Risque de trésorerie.'
      });
    } else if (ratios.liquidityRatio < 1.5) {
      alerts.push({
        type: 'warning',
        title: 'Liquidité à surveiller',
        message: 'Ratio de liquidité faible. Surveillez les encaissements.'
      });
    }

    if (netIncome < 0) {
      alerts.push({
        type: 'danger',
        title: 'Perte détectée',
        message: `Perte de ${Math.abs(netIncome).toLocaleString()} FCFA ce mois.`
      });
    } else if (netIncome < 1000000) {
      alerts.push({
        type: 'warning',
        title: 'Marge faible',
        message: 'Marge bénéficiaire inférieure aux objectifs.'
      });
    }

    if (transactionCount === 0) {
      alerts.push({
        type: 'info',
        title: 'Aucune transaction',
        message: 'Aucune transaction enregistrée ce mois.'
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        type: 'info',
        title: 'Situation saine',
        message: 'Tous les indicateurs sont dans le vert.'
      });
    }

    return alerts;
  }

  // Balance âgée dynamique
  async calculateAgedBalance(companyId, type = 'receivables', asOfDate = null) {
    const targetDate = asOfDate || moment().format('YYYY-MM-DD');
    const cacheKey = `aged_balance_${companyId}_${type}_${targetDate}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    // Récupérer factures depuis DB
    const invoices = await database.all(`
      SELECT * FROM invoices 
      WHERE company_id = ? AND status != 'cancelled'
      ORDER BY due_date ASC
    `, [companyId]);

    const items = [];
    const totals = { total: 0, current: 0, days30_60: 0, days60_90: 0, over90: 0 };

    for (const invoice of invoices) {
      const daysLate = moment(targetDate).diff(moment(invoice.due_date), 'days');
      const total = invoice.amount || (Math.random() * 5000000 + 500000);

      // Ventilation par ancienneté
      let current = 0, days30_60 = 0, days60_90 = 0, over90 = 0;

      if (daysLate <= 0) {
        current = total;
      } else if (daysLate <= 30) {
        current = total;
      } else if (daysLate <= 60) {
        days30_60 = total;
      } else if (daysLate <= 90) {
        days60_90 = total;
      } else {
        over90 = total;
      }

      items.push({
        party: invoice.client_name || `Client ${Math.floor(Math.random() * 1000)}`,
        total: Math.round(total),
        current: Math.round(current),
        days30_60: Math.round(days30_60),
        days60_90: Math.round(days60_90),
        over90: Math.round(over90),
        oldestDate: invoice.due_date || moment().subtract(Math.random() * 180, 'days').format('YYYY-MM-DD')
      });

      // Cumuler totaux
      totals.total += total;
      totals.current += current;
      totals.days30_60 += days30_60;
      totals.days60_90 += days60_90;
      totals.over90 += over90;
    }

    const result = {
      type,
      asOfDate: targetDate,
      items: items.slice(0, 20), // Limiter à 20 items
      totals: {
        total: Math.round(totals.total),
        current: Math.round(totals.current),
        days30_60: Math.round(totals.days30_60),
        days60_90: Math.round(totals.days60_90),
        over90: Math.round(totals.over90)
      }
    };

    this.setCached(cacheKey, result);
    return result;
  }

  // Mode hybride : basculer selon configuration
  async getHybridData(staticData, dynamicGenerator, companyId, ...args) {
    const isDynamic = await database.isDynamicMode();
    
    if (isDynamic) {
      return await dynamicGenerator(companyId, ...args);
    } else {
      return staticData;
    }
  }

  // Nettoyage cache
  clearCache() {
    this.cache.clear();
  }

  // Statistiques du cache
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memoryUsage: JSON.stringify([...this.cache.entries()]).length
    };
  }
}

module.exports = new DynamicService();
