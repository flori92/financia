const axios = require('axios');
const database = require('../../database');

class FreeLLMService {
  constructor() {
    // Configuration pour Llama GRATUIT sur Railway
    this.togetherApiKey = process.env.TOGETHER_API_KEY || '';
    this.baseURL = 'https://api.together.xyz/v1';
    this.model = 'meta-llama/Llama-3.2-3B-Instruct-Turbo'; // GRATUIT !
    this.maxTokens = 2000;
    this.temperature = 0.3;
    
    // Coût : 0 FCFA - 100% GRATUIT !
    this.costPerToken = 0.0;
    
    console.log('🦙 FreeLLMService initialisé avec Llama 3.2 (GRATUIT)');
  }

  // Récupérer les données BMS pour le contexte
  async getBMSContext(companyId, userId) {
    try {
      const context = {};
      
      // Données comptables récentes
      const recentEntries = await database.query(`
        SELECT e.*, l.account_name, l.debit, l.credit, l.label
        FROM journal_entries e
        JOIN journal_entry_lines l ON e.id = l.entry_id
        WHERE e.company_id = ? AND e.status = 'posted'
        ORDER BY e.entry_date DESC
        LIMIT 20
      `, [companyId]);

      // KPIs financiers du mois
      const monthlyKPIs = await database.query(`
        SELECT 
          SUM(CASE WHEN l.debit > 0 THEN l.debit ELSE 0 END) as total_debit,
          SUM(CASE WHEN l.credit > 0 THEN l.credit ELSE 0 END) as total_credit,
          COUNT(DISTINCT e.id) as entry_count,
          MAX(e.entry_date) as last_entry_date
        FROM journal_entries e
        JOIN journal_entry_lines l ON e.id = l.entry_id
        WHERE e.company_id = ? 
        AND e.status = 'posted'
        AND e.entry_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `, [companyId]);

      // Informations entreprise
      const companyInfo = await database.query(`
        SELECT name, industry, created_at, country
        FROM companies 
        WHERE id = ?
      `, [companyId]);

      // Clients et fournisseurs récents
      const recentParties = await database.query(`
        SELECT DISTINCT l.label as party_name, 
               SUM(l.debit - l.credit) as balance,
               COUNT(*) as transaction_count
        FROM journal_entry_lines l
        JOIN journal_entries e ON l.entry_id = e.id
        WHERE e.company_id = ? 
        AND e.status = 'posted'
        AND e.entry_date >= DATE_SUB(NOW(), INTERVAL 60 DAY)
        GROUP BY l.label
        ORDER BY transaction_count DESC
        LIMIT 10
      `, [companyId]);

      context.recentEntries = recentEntries;
      context.monthlyKPIs = monthlyKPIs[0] || {};
      context.companyInfo = companyInfo[0] || {};
      context.recentParties = recentParties;
      context.dataDate = new Date().toISOString();
      
      return context;
    } catch (error) {
      console.error('❌ Erreur récupération contexte BMS:', error);
      return null;
    }
  }

  // Construire le prompt système avec contexte BMS
  buildSystemPrompt(bmsContext, userId) {
    return `Tu es un assistant IA expert pour BMS (Business Management System), un logiciel de gestion d'entreprise pour les PME en Afrique.

CONTEXTE ENTREPRISE:
- Nom: ${bmsContext.companyInfo.name || 'Non spécifié'}
- Secteur: ${bmsContext.companyInfo.industry || 'Non spécifié'}
- Pays: ${bmsContext.companyInfo.country || 'Afrique'}
- Date des données: ${bmsContext.dataDate}

INDICATEURS FINANCIERS RECENTS (30 derniers jours):
- Total débits: ${this.formatCurrency(bmsContext.monthlyKPIs.total_debit || 0)} FCFA
- Total crédits: ${this.formatCurrency(bmsContext.monthlyKPIs.total_credit || 0)} FCFA
- Nombre d'écritures: ${bmsContext.monthlyKPIs.entry_count || 0}
- Dernière écriture: ${bmsContext.monthlyKPIs.last_entry_date || 'N/A'}

PRINCIPAUX TIERS (clients/fournisseurs):
${bmsContext.recentParties.map(p => 
  `- ${p.party_name}: ${this.formatCurrency(p.balance)} FCFA (${p.transaction_count} transactions)`
).join('\n') || 'Aucun tiers récent'}

DERNIÈRES ÉCRITURES COMPTABLES:
${bmsContext.recentEntries.slice(0, 5).map(e => 
  `- ${e.entry_date}: ${e.label || 'Sans libellé'} (${e.debit ? this.formatCurrency(e.debit) + ' FCFA' : ''}${e.credit ? this.formatCurrency(e.credit) + ' FCFA' : ''})`
).join('\n') || 'Aucune écriture récente'}

RÈGLES IMPORTANTES:
1. Réponds en français professionnel et accessible
2. Base tes analyses sur les données réelles fournies
3. Donne des recommandations actionnables et concrètes
4. Mentionne les limites des données si nécessaire
5. Structure tes réponses avec des sections claires
6. Pour les conseils fiscaux, précise que ce sont des suggestions générales
7. Sois précis avec les chiffres et calculs

COMPÉTENCES SPÉCIALISÉES:
- Comptabilité OHADA et normes africaines
- Analyse financière PME
- Optimisation fiscale (TVA, IS, impôts locaux)
- Gestion de trésorerie
- Conseils business pour marché africain
- Détection anomalies et risques

AVANTAGE: Ce service utilise Llama 3.2, un modèle open-source GRATUIT et performant !

OBJECTIF: Aider l'entrepreneur à prendre de meilleures décisions grâce à une analyse intelligente de ses données réelles.`;
  }

  // Formater les montants en FCFA
  formatCurrency(amount) {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount || 0));
  }

  // Appel principal à Llama GRATUIT
  async askAI(question, companyId, userId, options = {}) {
    try {
      // Récupérer le contexte BMS
      const bmsContext = await this.getBMSContext(companyId, userId);
      
      if (!bmsContext) {
        throw new Error('Impossible de récupérer les données BMS');
      }

      // Construire les messages pour Llama
      const messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt(bmsContext, userId)
        },
        {
          role: 'user',
          content: question
        }
      ];

      // Appel à Together API (Llama GRATUIT)
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: this.model,
        messages: messages,
        max_tokens: options.maxTokens || this.maxTokens,
        temperature: options.temperature || this.temperature,
        top_p: 0.7,
        top_k: 50
      }, {
        headers: {
          'Authorization': `Bearer ${this.togetherApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      const aiResponse = response.data.choices[0].message.content;

      // Logger pour analytics
      await this.logInteraction(companyId, userId, question, aiResponse, bmsContext);

      return {
        success: true,
        response: aiResponse,
        context: {
          hasData: true,
          dataDate: bmsContext.dataDate,
          entryCount: bmsContext.recentEntries.length,
          kpiAvailable: Object.keys(bmsContext.monthlyKPIs).length > 0,
          model: 'Llama 3.2 (GRATUIT)',
          provider: 'Together AI'
        },
        metadata: {
          model: this.model,
          tokensUsed: response.data.usage?.total_tokens || 0,
          cost: 0.0, // 100% GRATUIT !
          provider: 'Together AI - Llama Open Source'
        }
      };

    } catch (error) {
      console.error('❌ Erreur appel Llama:', error.message);
      
      // Fallback vers réponses basiques si Llama indisponible
      return this.getFallbackResponse(question, bmsContext);
    }
  }

  // Calculer le coût (TOUJOURS 0 pour Llama GRATUIT)
  calculateCost(tokens) {
    return 0.0; // Llama sur Together API est GRATUIT !
  }

  // Logger les interactions pour analytics
  async logInteraction(companyId, userId, question, response, context) {
    try {
      await database.query(`
        INSERT INTO ai_interactions (company_id, user_id, question, response, context_data, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [companyId, userId, question, response, JSON.stringify(context)]);
    } catch (error) {
      console.error('❌ Erreur log interaction:', error);
    }
  }

  // Réponses de fallback si Llama indisponible
  async getFallbackResponse(question, bmsContext) {
    const fallbackResponses = {
      'finance': `D'après vos données récentes, votre entreprise a généré ${this.formatCurrency(bmsContext?.monthlyKPIs?.total_credit || 0)} FCFA de crédits ce mois-ci. Pour une analyse plus détaillée, veuillez réessayer dans quelques instants.`,
      'comptabilité': `J'ai accès à ${bmsContext?.recentEntries?.length || 0} écritures comptables récentes. Le service Llama GRATUIT est temporairement indisponible, mais vos données sont bien présentes dans le système.`,
      'conseil': `Basé sur vos ${bmsContext?.monthlyKPIs?.entry_count || 0} transactions ce mois-ci, je vous recommande de surveiller attentivement votre trésorerie. Le service IA expert GRATUIT sera bientôt de retour.`
    };

    const category = this.detectQuestionCategory(question);
    const fallback = fallbackResponses[category] || fallbackResponses['conseil'];

    return {
      success: true,
      response: fallback,
      context: {
        hasData: !!bmsContext,
        isFallback: true,
        model: 'Fallback (GRATUIT)'
      },
      metadata: {
        model: 'fallback',
        tokensUsed: 0,
        cost: 0.0,
        provider: 'Local Fallback'
      }
    };
  }

  // Détecter la catégorie de la question
  detectQuestionCategory(question) {
    const lower = question.toLowerCase();
    
    if (lower.includes('finance') || lower.includes('argent') || lower.includes('budget')) {
      return 'finance';
    }
    if (lower.includes('compt') || lower.includes('écriture') || lower.includes('débit') || lower.includes('crédit')) {
      return 'comptabilité';
    }
    
    return 'conseil';
  }

  // Générer des rapports automatisés
  async generateReport(type, companyId, userId) {
    const reportPrompts = {
      'financial_summary': 'Génère un résumé financier complet de mon entreprise basé sur les données récentes. Inclus analyse de la trésorerie, des revenus, des dépenses et donne 3 recommandations prioritaires.',
      'tax_optimization': 'Analyse ma situation fiscale actuelle et propose des optimisations légales pour réduire ma charge fiscale. Considère les impôts locaux africains.',
      'cash_flow': 'Fais une analyse détaillée de ma trésorerie. Identifie les risques, les opportunités et propose un plan d\'action pour les 3 prochains mois.',
      'performance': 'Évalue la performance globale de mon entreprise ce mois-ci. Compare avec les indicateurs standards du secteur et donne des conseils d\'amélioration.'
    };

    const prompt = reportPrompts[type] || reportPrompts['financial_summary'];
    
    return await this.askAI(prompt, companyId, userId, {
      maxTokens: 3000,
      temperature: 0.2
    });
  }

  // Obtenir des suggestions de questions intelligentes
  async getSuggestedQuestions(companyId, userId) {
    const bmsContext = await this.getBMSContext(companyId, userId);
    
    const baseSuggestions = [
      {
        icon: '📊',
        title: 'Analyse financière',
        question: 'Analyse la santé financière de mon entreprise ce mois-ci et identifie les points d\'attention.'
      },
      {
        icon: '💰',
        title: 'Optimisation fiscale',
        question: 'Quelles stratégies fiscales puis-je utiliser pour optimiser ma charge fiscale légalement ?'
      },
      {
        icon: '📈',
        title: 'Prévisions trésorerie',
        question: 'Based on mes transactions récentes, quelles sont tes prévisions de trésorerie pour les 3 prochains mois ?'
      },
      {
        icon: '⚠️',
        title: 'Risques et alertes',
        question: 'Identifie les risques financiers ou opérationnels dans mon entreprise et propose des solutions.'
      }
    ];

    // Ajouter suggestions personnalisées selon les données
    const personalizedSuggestions = [];

    if (bmsContext?.monthlyKPIs?.entry_count > 50) {
      personalizedSuggestions.push({
        icon: '🔍',
        title: 'Analyse approfondie',
        question: 'J\'ai beaucoup d\'écritures ce mois-ci. Peux-tu analyser les tendances et anomalies ?'
      });
    }

    if ((bmsContext?.monthlyKPIs?.total_debit || 0) > (bmsContext?.monthlyKPIs?.total_credit || 0)) {
      personalizedSuggestions.push({
        icon: '🚨',
        title: 'Alerte débits',
        question: 'Mes débits sont supérieurs à mes crédits. Est-ce préoccupant et que devrais-je faire ?'
      });
    }

    return [...baseSuggestions, ...personalizedSuggestions].slice(0, 6);
  }

  // Obtenir les informations sur les modèles gratuits disponibles
  getAvailableModels() {
    return {
      current: 'Llama 3.2 3B (GRATUIT)',
      available: [
        {
          name: 'Llama 3.2 3B Instruct',
          model: 'meta-llama/Llama-3.2-3B-Instruct-Turbo',
          cost: 'GRATUIT',
          provider: 'Together AI',
          performance: 'Excellent pour conversations'
        },
        {
          name: 'Llama 3.1 8B Instruct', 
          model: 'meta-llama/Llama-3.1-8B-Instruct-Turbo',
          cost: 'GRATUIT',
          provider: 'Together AI',
          performance: 'Très performant pour analyses'
        },
        {
          name: 'Mixtral 8x7B Instruct',
          model: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
          cost: 'GRATUIT', 
          provider: 'Together AI',
          performance: 'Top pour raisonnement complexe'
        }
      ],
      total_cost: 0.0,
      advantage: '100% GRATUIT avec performances équivalentes GPT-4 !'
    };
  }
}

module.exports = FreeLLMService;
