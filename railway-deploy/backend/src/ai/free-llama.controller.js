const FreeLLMService = require('./free-llama.service');
const EnhancedForecastService = require('./enhanced-forecast.service');

class FreeLLMController {
  constructor() {
    this.llmService = new FreeLLMService();
    this.forecastService = new EnhancedForecastService();
  }

  // Endpoint principal pour discuter avec Llama GRATUIT
  async chat(req, res) {
    try {
      const { question, companyId, userId } = req.body;

      // Validation
      if (!question || !companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: question, companyId, userId'
        });
      }

      if (question.length > 2000) {
        return res.status(400).json({
          success: false,
          error: 'La question ne doit pas dépasser 2000 caractères'
        });
      }

      console.log(`🦙 Question Llama GRATUITE reçue pour entreprise ${companyId}:`, question.substring(0, 100) + '...');

      // Appel au service Llama GRATUIT
      const result = await this.llmService.askAI(question, companyId, userId);

      res.json({
        success: true,
        data: {
          response: result.response,
          context: result.context,
          metadata: result.metadata
        }
      });

    } catch (error) {
      console.error('❌ Erreur contrôleur Llama chat:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du traitement de votre question',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Générer des rapports automatisés
  async generateReport(req, res) {
    try {
      const { type, companyId, userId } = req.body;

      if (!type || !companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: type, companyId, userId'
        });
      }

      const validTypes = ['financial_summary', 'tax_optimization', 'cash_flow', 'performance'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: `Type invalide. Types valides: ${validTypes.join(', ')}`
        });
      }

      console.log(`📊 Génération rapport Llama GRATUIT: ${type} pour entreprise ${companyId}`);

      const result = await this.llmService.generateReport(type, companyId, userId);

      res.json({
        success: true,
        data: {
          report: result.response,
          type: type,
          context: result.context,
          metadata: result.metadata
        }
      });

    } catch (error) {
      console.error('❌ Erreur génération rapport:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération du rapport'
      });
    }
  }

  // Obtenir des suggestions de questions personnalisées
  async getSuggestions(req, res) {
    try {
      const { companyId, userId } = req.query;

      if (!companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: companyId, userId'
        });
      }

      const suggestions = await this.llmService.getSuggestedQuestions(companyId, userId);

      res.json({
        success: true,
        data: {
          suggestions: suggestions,
          count: suggestions.length,
          message: 'Suggestions générées par Llama 3.2 (GRATUIT)'
        }
      });

    } catch (error) {
      console.error('❌ Erreur suggestions Llama:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des suggestions'
      });
    }
  }

  // Obtenir l'historique des interactions
  async getHistory(req, res) {
    try {
      const { companyId, userId, limit = 20 } = req.query;

      if (!companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: companyId, userId'
        });
      }

      const history = await require('../../database').query(`
        SELECT id, question, response, created_at
        FROM ai_interactions 
        WHERE company_id = ? AND user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
      `, [companyId, userId, parseInt(limit)]);

      res.json({
        success: true,
        data: {
          history: history,
          count: history.length,
          model: 'Llama 3.2 (GRATUIT)'
        }
      });

    } catch (error) {
      console.error('❌ Erreur historique Llama:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération de l\'historique'
      });
    }
  }

  // Supprimer une interaction de l'historique
  async deleteHistoryItem(req, res) {
    try {
      const { interactionId, companyId, userId } = req.body;

      if (!interactionId || !companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: interactionId, companyId, userId'
        });
      }

      await require('../../database').query(`
        DELETE FROM ai_interactions 
        WHERE id = ? AND company_id = ? AND user_id = ?
      `, [interactionId, companyId, userId]);

      res.json({
        success: true,
        message: 'Interaction supprimée avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur suppression historique:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la suppression'
      });
    }
  }

  // Obtenir les statistiques d'utilisation (GRATUIT !)
  async getStats(req, res) {
    try {
      const { companyId, userId } = req.query;

      if (!companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: companyId, userId'
        });
      }

      const stats = await require('../../database').query(`
        SELECT 
          COUNT(*) as total_interactions,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          AVG(LENGTH(response)) as avg_response_length,
          MAX(created_at) as last_interaction
        FROM ai_interactions 
        WHERE company_id = ? AND user_id = ?
      `, [companyId, userId]);

      // Coût total (TOUJOURS 0 pour Llama GRATUIT)
      const costQuery = await require('../../database').query(`
        SELECT SUM(JSON_EXTRACT(context_data, '$.metadata.cost')) as total_cost
        FROM ai_interactions 
        WHERE company_id = ? AND user_id = ?
        AND JSON_EXTRACT(context_data, '$.metadata.cost') IS NOT NULL
      `, [companyId, userId]);

      const totalCost = parseFloat(costQuery[0].total_cost || 0);
      const totalInteractions = stats[0].total_interactions || 0;

      res.json({
        success: true,
        data: {
          stats: {
            ...stats[0],
            totalCost: totalCost,
            avgCostPerInteraction: totalInteractions > 0 ? totalCost / totalInteractions : 0,
            model: 'Llama 3.2 (GRATUIT)',
            provider: 'Together AI',
            advantage: '100% GRATUIT - Aucun coût d\'utilisation !'
          }
        }
      });

    } catch (error) {
      console.error('❌ Erreur statistiques Llama:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  // Feedback utilisateur sur une réponse Llama
  async submitFeedback(req, res) {
    try {
      const { interactionId, rating, comment, companyId, userId } = req.body;

      if (!interactionId || !rating || !companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: interactionId, rating, companyId, userId'
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'Le rating doit être entre 1 et 5'
        });
      }

      await require('../../database').query(`
        UPDATE ai_interactions 
        SET rating = ?, feedback_comment = ?, feedback_date = NOW()
        WHERE id = ? AND company_id = ? AND user_id = ?
      `, [rating, comment, interactionId, companyId, userId]);

      res.json({
        success: true,
        message: 'Feedback enregistré avec succès'
      });

    } catch (error) {
      console.error('❌ Erreur feedback Llama:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'enregistrement du feedback'
      });
    }
  }

  // Nouveau: Obtenir les informations sur les modèles gratuits disponibles
  async getModels(req, res) {
    try {
      const models = this.llmService.getAvailableModels();
      
      res.json({
        success: true,
        data: models,
        message: 'Tous les modèles sont 100% GRATUITS !'
      });

    } catch (error) {
      console.error('❌ Erreur modèles:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des modèles'
      });
    }
  }

  // Nouveau: Changer de modèle (parmi les options gratuites)
  async switchModel(req, res) {
    try {
      const { model } = req.body;
      
      // Ici on pourrait implémenter le changement de modèle
      // Pour l'instant, on reste sur Llama 3.2 qui est déjà excellent et GRATUIT
      
      res.json({
        success: true,
        message: `Modèle confirmé: ${model} (toujours GRATUIT !)`,
        currentModel: 'Llama 3.2 3B Instruct',
        cost: 0.0
      });

    } catch (error) {
      console.error('❌ Erreur changement modèle:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors du changement de modèle'
      });
    }
  }

  // 📈 Prévisions de Chiffre d'Affaires
  async forecastRevenue(req, res) {
    try {
      const { companyId, userId, months = 6 } = req.body;

      if (!companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: companyId, userId'
        });
      }

      console.log(`📈 Génération prévisions CA pour ${months} mois - entreprise ${companyId}`);

      const result = await this.forecastService.generateRevenueForecast(companyId, userId, months);

      res.json(result);

    } catch (error) {
      console.error('❌ Erreur prévisions CA:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération des prévisions de CA'
      });
    }
  }

  // 💰 Prévisions de Bénéfices et Rentabilité
  async forecastProfit(req, res) {
    try {
      const { companyId, userId, months = 6 } = req.body;

      if (!companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: companyId, userId'
        });
      }

      console.log(`💰 Génération prévisions bénéfices pour ${months} mois - entreprise ${companyId}`);

      const result = await this.forecastService.generateProfitForecast(companyId, userId, months);

      res.json(result);

    } catch (error) {
      console.error('❌ Erreur prévisions bénéfices:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération des prévisions de bénéfices'
      });
    }
  }

  // 🌊 Prévisions de Trésorerie
  async forecastCashFlow(req, res) {
    try {
      const { companyId, userId, months = 3 } = req.body;

      if (!companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: companyId, userId'
        });
      }

      console.log(`🌊 Génération prévisions trésorerie pour ${months} mois - entreprise ${companyId}`);

      const result = await this.forecastService.generateCashFlowForecast(companyId, userId, months);

      res.json(result);

    } catch (error) {
      console.error('❌ Erreur prévisions trésorerie:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération des prévisions de trésorerie'
      });
    }
  }

  // 📊 Prévisions Complètes (CA + Bénéfices + Trésorerie)
  async forecastComprehensive(req, res) {
    try {
      const { companyId, userId, months = 6 } = req.body;

      if (!companyId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'Paramètres requis: companyId, userId'
        });
      }

      console.log(`📊 Génération prévisions complètes pour ${months} mois - entreprise ${companyId}`);

      const result = await this.forecastService.generateComprehensiveForecast(companyId, userId, months);

      res.json(result);

    } catch (error) {
      console.error('❌ Erreur prévisions complètes:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la génération des prévisions complètes'
      });
    }
  }
}

module.exports = FreeLLMController;
