// Extension du service Llama pour prévisions avancées

class EnhancedForecastService {
  constructor() {
    this.llmService = require('./free-llama.service.js');
  }

  // Prévisions CA avec analyse intelligente
  async generateRevenueForecast(companyId, userId, months = 6) {
    try {
      // Récupérer les données historiques détaillées
      const historicalData = await this.getHistoricalRevenueData(companyId, months * 2);
      
      if (!historicalData || historicalData.length < 3) {
        throw new Error('Données historiques insuffisantes pour les prévisions');
      }

      // Analyser les tendances avec Llama
      const trendAnalysis = await this.analyzeTrends(historicalData, companyId, userId);
      
      // Générer prévisions détaillées
      const forecastPrompt = `
Basé sur ces données historiques de chiffre d'affaires:

${historicalData.map(d => `- ${d.month}: ${this.formatCurrency(d.revenue)} FCFA`).join('\n')}

Génère des prévisions de CA pour les ${months} prochains mois avec:
1. **Prévisions mensuelles** réalistes
2. **Tendance de croissance** (%)
3. **Facteurs d'influence** identifiés
4. **Intervalles de confiance** (optimiste/pessimiste)
5. **Recommandations** pour atteindre les objectifs

Sois précis et base tes prévisions sur les tendances observées.
`;

      const result = await this.llmService.askAI(forecastPrompt, companyId, userId);
      
      return {
        success: true,
        data: {
          forecast: result.response,
          historicalData: historicalData,
          trendAnalysis: trendAnalysis,
          metadata: result.metadata
        }
      };

    } catch (error) {
      console.error('❌ Erreur prévisions CA:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Prévisions bénéfices et rentabilité
  async generateProfitForecast(companyId, userId, months = 6) {
    try {
      // Récupérer données revenus/dépenses
      const profitData = await this.getHistoricalProfitData(companyId, months * 2);
      
      if (!profitData || profitData.length < 3) {
        throw new Error('Données profit insuffisantes');
      }

      const profitPrompt = `
Basé sur ces données historiques de rentabilité:

${profitData.map(d => `- ${d.month}: Revenus ${this.formatCurrency(d.revenue)} FCFA, Dépenses ${this.formatCurrency(d.expenses)} FCFA, Bénéfice ${this.formatCurrency(d.profit)} FCFA (${d.margin}% marge)`).join('\n')}

Analyse et prévois pour les ${months} prochains mois:
1. **Prévisions de bénéfices** mensuels
2. **Évolution de la marge** nette
3. **Optimisation des coûts** suggérée
4. **Seuil de rentabilité** analysé
5. **Alertes** si tendance négative

Donne des recommandations actionnables pour améliorer la rentabilité.
`;

      const result = await this.llmService.askAI(profitPrompt, companyId, userId);
      
      return {
        success: true,
        data: {
          profitForecast: result.response,
          profitData: profitData,
          metadata: result.metadata
        }
      };

    } catch (error) {
      console.error('❌ Erreur prévisions bénéfices:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Prévisions trésorerie avancées
  async generateCashFlowForecast(companyId, userId, months = 3) {
    try {
      const cashFlowData = await this.getHistoricalCashFlowData(companyId, months * 2);
      
      if (!cashFlowData || cashFlowData.length < 2) {
        throw new Error('Données trésorerie insuffisantes');
      }

      const cashFlowPrompt = `
Basé sur ces données de flux de trésorerie:

${cashFlowData.map(d => `- ${d.month}: Entrées ${this.formatCurrency(d.inflows)} FCFA, Sorties ${this.formatCurrency(d.outflows)} FCFA, Net ${this.formatCurrency(d.netFlow)} FCFA`).join('\n')}

Génère des prévisions de trésorerie détaillées pour les ${months} prochains mois:
1. **Flux prévisionnels** entrées/sorties
2. **Position de trésorerie** mensuelle
3. **Risques de tension** identifiés
4. **Recommandations** optimisation
5. **Scénarios** (optimiste/réaliste/pessimiste)

Focus sur les risques et opportunités de liquidités.
`;

      const result = await this.llmService.askAI(cashFlowPrompt, companyId, userId);
      
      return {
        success: true,
        data: {
          cashFlowForecast: result.response,
          cashFlowData: cashFlowData,
          metadata: result.metadata
        }
      };

    } catch (error) {
      console.error('❌ Erreur prévisions trésorerie:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Prévisions complètes multi-indicateurs
  async generateComprehensiveForecast(companyId, userId, months = 6) {
    try {
      // Récupérer toutes les données
      const [revenueData, profitData, cashFlowData] = await Promise.all([
        this.getHistoricalRevenueData(companyId, months * 2),
        this.getHistoricalProfitData(companyId, months * 2),
        this.getHistoricalCashFlowData(companyId, months * 2)
      ]);

      const comprehensivePrompt = `
En tant qu'expert financier, analyse ces données complètes et génère des prévisions intégrées pour les ${months} prochains mois:

DONNÉES HISTORIQUES:
**Chiffre d'affaires:**
${revenueData.map(d => `- ${d.month}: ${this.formatCurrency(d.revenue)} FCFA`).join('\n')}

**Rentabilité:**
${profitData.map(d => `- ${d.month}: Bénéfice ${this.formatCurrency(d.profit)} FCFA (${d.margin}% marge)`).join('\n')}

**Trésorerie:**
${cashFlowData.map(d => `- ${d.month}: Net ${this.formatCurrency(d.netFlow)} FCFA`).join('\n')}

Génère un plan prévisionnel COMPLET avec:
1. **Prévisions CA** mensuelles avec croissance
2. **Prévisions bénéfices** et marges attendues  
3. **Prévisions trésorerie** et besoins en financement
4. **Indicateurs clés** (ROI, ROE, liquidité)
5. **Recommandations stratégiques** pour atteindre objectifs
6. **Alertes** et points de vigilance
7. **Scénarios** selon hypothèses (conservateur/réaliste/optimiste)

Sois précis, actionnable et base-toi sur les tendances réelles observées.
`;

      const result = await this.llmService.askAI(comprehensivePrompt, companyId, userId);
      
      return {
        success: true,
        data: {
          comprehensiveForecast: result.response,
          allData: {
            revenue: revenueData,
            profit: profitData,
            cashFlow: cashFlowData
          },
          metadata: result.metadata
        }
      };

    } catch (error) {
      console.error('❌ Erreur prévisions complètes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Méthodes utilitaires pour récupérer les données historiques
  async getHistoricalRevenueData(companyId, months) {
    const database = require('../../database');
    
    try {
      const data = await database.query(`
        SELECT 
          DATE_FORMAT(entry_date, '%Y-%m') as month,
          SUM(CASE WHEN credit > 0 THEN credit ELSE 0 END) as revenue
        FROM journal_entries e
        JOIN journal_entry_lines l ON e.id = l.entry_id
        WHERE e.company_id = ? 
        AND e.status = 'posted'
        AND e.entry_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        AND l.account_number LIKE '7%' -- Comptes de produits
        GROUP BY DATE_FORMAT(entry_date, '%Y-%m')
        ORDER BY month ASC
      `, [companyId, months]);

      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération données CA:', error);
      return [];
    }
  }

  async getHistoricalProfitData(companyId, months) {
    const database = require('../../database');
    
    try {
      const data = await database.query(`
        SELECT 
          DATE_FORMAT(entry_date, '%Y-%m') as month,
          SUM(CASE WHEN l.account_number LIKE '7%' THEN credit ELSE 0 END) as revenue,
          SUM(CASE WHEN l.account_number LIKE '6%' THEN debit ELSE 0 END) as expenses,
          SUM(CASE WHEN l.account_number LIKE '7%' THEN credit ELSE 0 END) - 
          SUM(CASE WHEN l.account_number LIKE '6%' THEN debit ELSE 0 END) as profit
        FROM journal_entries e
        JOIN journal_entry_lines l ON e.id = l.entry_id
        WHERE e.company_id = ? 
        AND e.status = 'posted'
        AND e.entry_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        AND (l.account_number LIKE '6%' OR l.account_number LIKE '7%')
        GROUP BY DATE_FORMAT(entry_date, '%Y-%m')
        ORDER BY month ASC
      `, [companyId, months]);

      // Calculer les marges
      return data.map(d => ({
        ...d,
        margin: d.revenue > 0 ? ((d.profit / d.revenue) * 100).toFixed(1) : 0
      }));
    } catch (error) {
      console.error('❌ Erreur récupération données profit:', error);
      return [];
    }
  }

  async getHistoricalCashFlowData(companyId, months) {
    const database = require('../../database');
    
    try {
      const data = await database.query(`
        SELECT 
          DATE_FORMAT(entry_date, '%Y-%m') as month,
          SUM(CASE WHEN l.account_number LIKE '5%' AND credit > 0 THEN credit ELSE 0 END) as inflows,
          SUM(CASE WHEN l.account_number LIKE '5%' AND debit > 0 THEN debit ELSE 0 END) as outflows,
          SUM(CASE WHEN l.account_number LIKE '5%' AND credit > 0 THEN credit ELSE 0 END) - 
          SUM(CASE WHEN l.account_number LIKE '5%' AND debit > 0 THEN debit ELSE 0 END) as netFlow
        FROM journal_entries e
        JOIN journal_entry_lines l ON e.id = l.entry_id
        WHERE e.company_id = ? 
        AND e.status = 'posted'
        AND e.entry_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        AND l.account_number LIKE '5%' -- Comptes de trésorerie
        GROUP BY DATE_FORMAT(entry_date, '%Y-%m')
        ORDER BY month ASC
      `, [companyId, months]);

      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération données trésorerie:', error);
      return [];
    }
  }

  // Analyser les tendances
  async analyzeTrends(data, companyId, userId) {
    if (data.length < 2) return 'Insuffisant pour analyse';
    
    const trendPrompt = `
Analyse ces tendances et identifie les patterns:

${data.map(d => `- ${d.month}: ${this.formatCurrency(d.revenue || 0)} FCFA`).join('\n')}

Identifie:
1. Tendance générale (croissance/décroissance/stable)
2. Saisonalité si présente
3. Points d'inflexion
4. Facteurs potentiels d'influence
Sois concis et factuel.
`;

    const result = await this.llmService.askAI(trendPrompt, companyId, userId);
    return result.response;
  }

  // Formater les montants
  formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0));
  }
}

module.exports = EnhancedForecastService;
