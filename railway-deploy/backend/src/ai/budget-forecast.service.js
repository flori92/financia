// Service Complet de Prévisions Budgétaires et Comptables avec Llama GRATUIT

class BudgetForecastService {
  constructor() {
    this.llmService = require('./free-llama.service.js');
  }

  // 📊 Prévisions Budgétaires Complètes
  async generateBudgetForecast(companyId, userId, months = 12) {
    try {
      // Récupérer toutes les données budgétaires historiques
      const budgetData = await this.getHistoricalBudgetData(companyId, months * 2);
      
      if (!budgetData || budgetData.length < 3) {
        throw new Error('Données budgétaires insuffisantes pour les prévisions');
      }

      const budgetPrompt = `
En tant qu'expert budgétaire, analyse ces données historiques complètes et génère un budget prévisionnel détaillé:

DONNÉES HISTORIQUES BUDGÉTAIRES:
${budgetData.map(d => `
**${d.month}:**
- Revenus: ${this.formatCurrency(d.revenue)} FCFA
- Dépenses opérationnelles: ${this.formatCurrency(d.operational_expenses)} FCFA
- Dépenses marketing: ${this.formatCurrency(d.marketing_expenses)} FCFA
- Dépenses RH: ${this.formatCurrency(d.hr_expenses)} FCFA
- Dépenses investissement: ${this.formatCurrency(d.investment_expenses)} FCFA
- Total dépenses: ${this.formatCurrency(d.total_expenses)} FCFA
- Résultat net: ${this.formatCurrency(d.net_result)} FCFA
- Marge nette: ${d.net_margin}%
`).join('\n')}

Génère un BUDGET PRÉVISIONNEL DÉTAILLÉ pour les ${months} prochains mois avec:

1. **BUDGET MENSUEL DÉTAILLÉ** par catégorie:
   - Revenus prévisionnels par mois
   - Dépenses opérationnelles (charges fixes/variables)
   - Budget marketing et commercial
   - Budget RH et salariale
   - Investissements planifiés
   - Autres dépenses par nature

2. **ANALYSE DES TENDANCES**:
   - Évolution des coûts par catégorie
   - Saisonalité budgétaire identifiée
   - Points d'inflexion et anomalies

3. **OPTIMISATION BUDGÉTAIRE**:
   - Recommandations réduction coûts
   - Opportunités d'investissement
   - Réallocation possible des ressources

4. **SCÉNARIOS BUDGÉTAIRES**:
   - Scénario optimiste (croissance +15%)
   - Scénario réaliste (croissance tendancielle)
   - Scénario conservateur (stabilité)

5. **ALERTES ET VIGILANCES**:
   - Risques de dépassement budgétaire
   - Besoins de financement identifiés
   - Points de contrôle mensuels

Sois extrêmement détaillé et actionnable. Base tes prévisions sur les tendances réelles observées.
`;

      const result = await this.llmService.askAI(budgetPrompt, companyId, userId);
      
      return {
        success: true,
        data: {
          budgetForecast: result.response,
          historicalData: budgetData,
          metadata: result.metadata
        }
      };

    } catch (error) {
      console.error('❌ Erreur prévisions budgétaires:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 💰 Prévisions Détaillées des Dépenses
  async generateExpenseForecast(companyId, userId, months = 6) {
    try {
      const expenseData = await this.getHistoricalExpenseData(companyId, months * 2);
      
      if (!expenseData || expenseData.length < 2) {
        throw new Error('Données dépenses insuffisantes');
      }

      const expensePrompt = `
Analyse ces données historiques de dépenses et génère des prévisions détaillées:

HISTORIQUE DÉPENSES PAR CATÉGORIE:
${expenseData.map(d => `
**${d.month}:**
- Charges fixes: ${this.formatCurrency(d.fixed_costs)} FCFA (loyer, assurances, etc.)
- Charges variables: ${this.formatCurrency(d.variable_costs)} FCFA (matières premières, énergie)
- Salaires et charges sociales: ${this.formatCurrency(d.payroll_costs)} FCFA
- Marketing et communication: ${this.formatCurrency(d.marketing_costs)} FCFA
- Frais de déplacement: ${this.formatCurrency(d.travel_costs)} FCFA
- Services externes: ${this.formatCurrency(d.external_services)} FCFA
- Autres dépenses: ${this.formatCurrency(d.other_costs)} FCFA
- Total dépenses: ${this.formatCurrency(d.total_costs)} FCFA
`).join('\n')}

Génère des PRÉVISIONS DÉPENSES DÉTAILLÉES pour les ${months} prochains mois:

1. **PRÉVISIONS PAR CATÉGORIE**:
   - Évolution charges fixes vs variables
   - Budget salarial prévisionnel
   - Plan marketing et commercial
   - Anticipation frais externes

2. **ANALYSE DES COÛTS**:
   - Structure des coûts optimisée
   - Identification gaspillages
   - Opportunités réduction

3. **OPTIMISATION SPÉCIFIQUE**:
   - Négociation fournisseurs
   - Automatisation possible
   - Externalisation avantageuse

4. **ALERTES COÛTS**:
   - Dépassements potentiels
   - Inflation impact
   - Saisonalité dépenses

Donne des recommandations concrètes pour maîtriser les coûts.
`;

      const result = await this.llmService.askAI(expensePrompt, companyId, userId);
      
      return {
        success: true,
        data: {
          expenseForecast: result.response,
          expenseData: expenseData,
          metadata: result.metadata
        }
      };

    } catch (error) {
      console.error('❌ Erreur prévisions dépenses:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🏦 Prévisions Trésorerie Avancées
  async generateAdvancedCashFlowForecast(companyId, userId, months = 6) {
    try {
      const cashFlowData = await this.getDetailedCashFlowData(companyId, months * 2);
      
      if (!cashFlowData || cashFlowData.length < 2) {
        throw new Error('Données trésorerie insuffisantes');
      }

      const cashFlowPrompt = `
Expert en trésorerie, analyse ces flux détaillés et génère des prévisions avancées:

FLUX DE TRÉSORERIE DÉTAILLÉS:
${cashFlowData.map(d => `
**${d.month}:**
- Encaissements clients: ${this.formatCurrency(d.customer_inflows)} FCFA
- Autres encaissements: ${this.formatCurrency(d.other_inflows)} FCFA
- Total entrées: ${this.formatCurrency(d.total_inflows)} FCFA
- Paiements fournisseurs: ${this.formatCurrency(d.supplier_outflows)} FCFA
- Salaires et charges: ${this.formatCurrency(d.payroll_outflows)} FCFA
- Paiements fiscaux: ${this.formatCurrency(d.tax_outflows)} FCFA
- Investissements: ${this.formatCurrency(d.investment_outflows)} FCFA
- Autres sorties: ${this.formatCurrency(d.other_outflows)} FCFA
- Total sorties: ${this.formatCurrency(d.total_outflows)} FCFA
- Flux net mensuel: ${this.formatCurrency(d.net_flow)} FCFA
- Trésorerie fin de mois: ${this.formatCurrency(d.closing_balance)} FCFA
`).join('\n')}

Génère des PRÉVISIONS TRÉSORERIE AVANCÉES pour les ${months} prochains mois:

1. **FLUX PRÉVISIONNELS DÉTAILLÉS**:
   - Encaissements par type (clients, autres)
   - Décaissements par catégorie (fournisseurs, fiscaux, etc.)
   - Calendrier prévisionnel des flux

2. **ANALYSE DE LIQUIDITÉ**:
   - Besoins en fonds de roulement
   - Point mort de trésorerie
   - Couverture des dépenses

3. **SCÉNARIOS TRÉSORERIE**:
   - Scénario optimiste (paiements rapides)
   - Scénario pessimiste (retards paiements)
   - Scénario critique (créances impayées)

4. **RECOMMANDATIONS STRATÉGIQUES**:
   - Optimisation BFR
   - Négociation délais paiement
   - Lignes de crédit nécessaires
   - Investissements trésorerie

5. **ALERTES ET PLANS D'ACTION**:
   - Risques de tension identifiés
   - Plans d'urgence trésorerie
   - Indicateurs de surveillance

Focus sur la gestion pratique et les solutions concrètes.
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
      console.error('❌ Erreur prévisions trésorerie avancées:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 📋 Plans Comptables Prévisionnels
  async generateChartOfAccountsForecast(companyId, userId) {
    try {
      const accountsData = await this.getAccountsUsageData(companyId);
      const transactionsData = await this.getRecentTransactionsAnalysis(companyId);
      
      const chartPrompt = `
Expert-comptable OHADA, analyse cette structure comptable et propose des optimisations:

STRUCTURE COMPTABLE ACTUELLE:
${accountsData.map(a => `
**Compte ${a.account_number} - ${a.account_name}:**
- Classe: ${a.account_class}
- Solde actuel: ${this.formatCurrency(a.balance)} FCFA
- Nombre d'écritures: ${a.transaction_count}
- Dernier mouvement: ${a.last_transaction_date}
- Utilisation: ${a.usage_frequency} (fréquente/occasionnelle/rare)
`).join('\n')}

ANALYSE TRANSACTIONS RÉCENTES:
${transactionsData.map(t => `
- ${t.transaction_date}: ${t.description} (${t.account_number}) - ${this.formatCurrency(t.amount)} FCFA
`).join('\n')}

Génère un PLAN COMPTABLE OPTIMISÉ avec:

1. **ANALYSE STRUCTURE ACTUELLE**:
   - Comptes bien utilisés vs sous-utilisés
   - Redondances ou chevauchements
   - Comptes manquants pour activité

2. **RECOMMANDATIONS OPTIMISATION**:
   - Fusion/éclatement de comptes suggérés
   - Nouveaux comptes à créer
   - Réorganisation hiérarchique

3. **PLAN COMPTABLE PRÉVISIONNEL**:
   - Structure adaptée à croissance prévue
   - Comptes spécifiques secteur d'activité
   - Alignement normes OHADA optimisé

4. **AUTOMATISATION COMPTABLE**:
   - Comptes à automatiser
   - Règles d'écritures suggérées
   - Optimisation processus

5. **CONFORMITÉ ET CONTRÔLE**:
   - Points de vigilance comptables
   - Contrôles internes renforcés
   - Préparation audits fiscaux

Base tes recommandations sur l'activité réelle et les normes OHADA.
`;

      const result = await this.llmService.askAI(chartPrompt, companyId, userId);
      
      return {
        success: true,
        data: {
          chartForecast: result.response,
          accountsData: accountsData,
          transactionsData: transactionsData,
          metadata: result.metadata
        }
      };

    } catch (error) {
      console.error('❌ Erreur plan comptable prévisionnel:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🎯 Plan Budgétaire Global Intégré
  async generateIntegratedBusinessPlan(companyId, userId, years = 3) {
    try {
      // Récupérer toutes les données pour plan global
      const [budgetData, expenseData, cashFlowData, accountsData] = await Promise.all([
        this.getHistoricalBudgetData(companyId, 24),
        this.getHistoricalExpenseData(companyId, 24),
        this.getDetailedCashFlowData(companyId, 24),
        this.getAccountsUsageData(companyId)
      ]);

      const businessPlanPrompt = `
CONSEILLER STRATÉGIQUE, génère un PLAN D'AFFAIRES INTÉGRÉ sur ${years} ans basé sur ces données complètes:

DONNÉES COMPLÈTES ANALYSÉES:
**Budget et performance:**
${budgetData.slice(-6).map(d => `- ${d.month}: CA ${this.formatCurrency(d.revenue)} FCFA, Résultat ${this.formatCurrency(d.net_result)} FCFA (${d.net_margin}%)`).join('\n')}

**Structure des coûts:**
${expenseData.slice(-3).map(d => `- ${d.month}: Fixes ${this.formatCurrency(d.fixed_costs)} FCFA, Variables ${this.formatCurrency(d.variable_costs)} FCFA`).join('\n')}

**Trésorerie:**
${cashFlowData.slice(-3).map(d => `- ${d.month}: Flux net ${this.formatCurrency(d.net_flow)} FCFA, Solde ${this.formatCurrency(d.closing_balance)} FCFA`).join('\n')}

**Structure comptable:** ${accountsData.length} comptes actifs

Génère un PLAN D'AFFAIRES STRATÉGIQUE COMPLET:

1. **VISION STRATÉGIQUE ${years} ANS**:
   - Objectifs de croissance annuels
   - Positionnement marché cible
   - Avantages compétitifs développés

2. **PLAN FINANCIER DÉTAILLÉ**:
   - Prévisions CA annuelles par secteur
   - Structure budgétaire optimisée
   - Rentabilité et marges cibles
   - Besoins investissements planifiés

3. **PLAN OPÉRATIONNEL**:
   - Effectifs et compétences nécessaires
   - Infrastructure et équipements
   - Processus et automatisation
   - Partenaires stratégiques

4. **PLAN TRÉSORERIE ${years} ANS**:
   - Flux prévisionnels détaillés
   - Besoins financement identifiés
   - Stratégie levée de fonds
   - Gestion BFR optimisée

5. **PLAN COMPTABLE ET CONTRÔLE**:
   - Structure comptable adaptée croissance
   - Tableaux de bord et KPIs
   - Contrôles internes renforcés
   - Préparation audits et due diligence

6. **ANALYSE DE RISQUES**:
   - Risques marché et concurrentiels
   - Risques financiers et opérationnels
   - Plans mitigation et contingence
   - Scénarios alternatifs

7. **CALENDRIER DE MISE EN ŒUVRE**:
   - Jalons trimestriels ${years} ans
   - Responsables et ressources
   - Indicateurs de suivi
   - Points de décision critiques

Sois ambitieux mais réaliste. Base ton plan sur les tendances observées et les meilleures pratiques.
`;

      const result = await this.llmService.askAI(businessPlanPrompt, companyId, userId);
      
      return {
        success: true,
        data: {
          businessPlan: result.response,
          allData: {
            budget: budgetData,
            expenses: expenseData,
            cashFlow: cashFlowData,
            accounts: accountsData
          },
          metadata: result.metadata
        }
      };

    } catch (error) {
      console.error('❌ Erreur plan d'affaires intégré:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Méthodes utilitaires pour récupérer les données
  async getHistoricalBudgetData(companyId, months) {
    const database = require('../../database');
    
    try {
      const data = await database.query(`
        SELECT 
          DATE_FORMAT(entry_date, '%Y-%m') as month,
          SUM(CASE WHEN l.account_number LIKE '7%' THEN credit ELSE 0 END) as revenue,
          SUM(CASE WHEN l.account_number LIKE '6%' AND l.account_number NOT LIKE '60%' THEN debit ELSE 0 END) as operational_expenses,
          SUM(CASE WHEN l.account_number LIKE '603%' THEN debit ELSE 0 END) as marketing_expenses,
          SUM(CASE WHEN l.account_number LIKE '66%' THEN debit ELSE 0 END) as hr_expenses,
          SUM(CASE WHEN l.account_number LIKE '2%' THEN debit ELSE 0 END) as investment_expenses,
          SUM(CASE WHEN l.account_number LIKE '6%' THEN debit ELSE 0 END) as total_expenses,
          (SUM(CASE WHEN l.account_number LIKE '7%' THEN credit ELSE 0 END) - 
           SUM(CASE WHEN l.account_number LIKE '6%' THEN debit ELSE 0 END)) as net_result
        FROM journal_entries e
        JOIN journal_entry_lines l ON e.id = l.entry_id
        WHERE e.company_id = ? 
        AND e.status = 'posted'
        AND e.entry_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY DATE_FORMAT(entry_date, '%Y-%m')
        ORDER BY month ASC
      `, [companyId, months]);

      return data.map(d => ({
        ...d,
        net_margin: d.revenue > 0 ? ((d.net_result / d.revenue) * 100).toFixed(1) : 0
      }));
    } catch (error) {
      console.error('❌ Erreur récupération données budget:', error);
      return [];
    }
  }

  async getHistoricalExpenseData(companyId, months) {
    const database = require('../../database');
    
    try {
      const data = await database.query(`
        SELECT 
          DATE_FORMAT(entry_date, '%Y-%m') as month,
          SUM(CASE WHEN l.account_number LIKE '61%' THEN debit ELSE 0 END) as fixed_costs,
          SUM(CASE WHEN l.account_number LIKE '62%' THEN debit ELSE 0 END) as variable_costs,
          SUM(CASE WHEN l.account_number LIKE '66%' THEN debit ELSE 0 END) as payroll_costs,
          SUM(CASE WHEN l.account_number LIKE '603%' THEN debit ELSE 0 END) as marketing_costs,
          SUM(CASE WHEN l.account_number LIKE '625%' THEN debit ELSE 0 END) as travel_costs,
          SUM(CASE WHEN l.account_number LIKE '63%' THEN debit ELSE 0 END) as external_services,
          SUM(CASE WHEN l.account_number LIKE '6%' THEN debit ELSE 0 END) as total_costs
        FROM journal_entries e
        JOIN journal_entry_lines l ON e.id = l.entry_id
        WHERE e.company_id = ? 
        AND e.status = 'posted'
        AND e.entry_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY DATE_FORMAT(entry_date, '%Y-%m')
        ORDER BY month ASC
      `, [companyId, months]);

      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération données dépenses:', error);
      return [];
    }
  }

  async getDetailedCashFlowData(companyId, months) {
    const database = require('../../database');
    
    try {
      const data = await database.query(`
        SELECT 
          DATE_FORMAT(entry_date, '%Y-%m') as month,
          SUM(CASE WHEN l.account_number LIKE '411%' AND credit > 0 THEN credit ELSE 0 END) as customer_inflows,
          SUM(CASE WHEN l.account_number LIKE '5%' AND credit > 0 AND l.account_number NOT LIKE '411%' THEN credit ELSE 0 END) as other_inflows,
          SUM(CASE WHEN l.account_number LIKE '401%' AND debit > 0 THEN debit ELSE 0 END) as supplier_outflows,
          SUM(CASE WHEN l.account_number LIKE '66%' AND debit > 0 THEN debit ELSE 0 END) as payroll_outflows,
          SUM(CASE WHEN l.account_number LIKE '44%' AND debit > 0 THEN debit ELSE 0 END) as tax_outflows,
          SUM(CASE WHEN l.account_number LIKE '2%' AND debit > 0 THEN debit ELSE 0 END) as investment_outflows,
          SUM(CASE WHEN l.account_number LIKE '5%' AND credit > 0 THEN credit ELSE 0 END) as total_inflows,
          SUM(CASE WHEN l.account_number LIKE '5%' AND debit > 0 THEN debit ELSE 0 END) as total_outflows,
          (SUM(CASE WHEN l.account_number LIKE '5%' AND credit > 0 THEN credit ELSE 0 END) - 
           SUM(CASE WHEN l.account_number LIKE '5%' AND debit > 0 THEN debit ELSE 0 END)) as net_flow
        FROM journal_entries e
        JOIN journal_entry_lines l ON e.id = l.entry_id
        WHERE e.company_id = ? 
        AND e.status = 'posted'
        AND e.entry_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
        GROUP BY DATE_FORMAT(entry_date, '%Y-%m')
        ORDER BY month ASC
      `, [companyId, months]);

      // Calculer le solde cumulé
      let cumulativeBalance = 0;
      return data.map(d => {
        cumulativeBalance += d.net_flow;
        return {
          ...d,
          closing_balance: cumulativeBalance
        };
      });
    } catch (error) {
      console.error('❌ Erreur récupération données trésorerie:', error);
      return [];
    }
  }

  async getAccountsUsageData(companyId) {
    const database = require('../../database');
    
    try {
      const data = await database.query(`
        SELECT 
          l.account_number,
          l.account_name,
          CASE 
            WHEN l.account_number LIKE '1%' THEN 'Classe 1 - Capitaux'
            WHEN l.account_number LIKE '2%' THEN 'Classe 2 - Immobilisations'
            WHEN l.account_number LIKE '3%' THEN 'Classe 3 - Stocks'
            WHEN l.account_number LIKE '4%' THEN 'Classe 4 - Tiers'
            WHEN l.account_number LIKE '5%' THEN 'Classe 5 - Trésorerie'
            WHEN l.account_number LIKE '6%' THEN 'Classe 6 - Charges'
            WHEN l.account_number LIKE '7%' THEN 'Classe 7 - Produits'
            WHEN l.account_number LIKE '8%' THEN 'Classe 8 - Hors bilan'
          END as account_class,
          SUM(CASE WHEN debit > 0 THEN debit ELSE -credit END) as balance,
          COUNT(*) as transaction_count,
          MAX(e.entry_date) as last_transaction_date,
          CASE 
            WHEN COUNT(*) > 50 THEN 'fréquente'
            WHEN COUNT(*) > 10 THEN 'occasionnelle'
            ELSE 'rare'
          END as usage_frequency
        FROM journal_entry_lines l
        JOIN journal_entries e ON l.entry_id = e.id
        WHERE e.company_id = ? AND e.status = 'posted'
        GROUP BY l.account_number, l.account_name
        ORDER BY transaction_count DESC
        LIMIT 50
      `, [companyId]);

      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération données comptes:', error);
      return [];
    }
  }

  async getRecentTransactionsAnalysis(companyId) {
    const database = require('../../database');
    
    try {
      const data = await database.query(`
        SELECT 
          DATE_FORMAT(e.entry_date, '%Y-%m-%d') as transaction_date,
          l.account_number,
          l.account_name,
          l.label as description,
          CASE WHEN debit > 0 THEN debit ELSE credit END as amount,
          CASE WHEN debit > 0 THEN 'Débit' ELSE 'Crédit' END as type
        FROM journal_entries e
        JOIN journal_entry_lines l ON e.id = l.entry_id
        WHERE e.company_id = ? AND e.status = 'posted'
        ORDER BY e.entry_date DESC
        LIMIT 20
      `, [companyId]);

      return data || [];
    } catch (error) {
      console.error('❌ Erreur récupération transactions récentes:', error);
      return [];
    }
  }

  // Formater les montants
  formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0));
  }
}

module.exports = BudgetForecastService;
