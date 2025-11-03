const IntelligentLLMService = require('./intelligent-llm.service');

class IntelligentLLMController {
  constructor() {
    this.llmService = new IntelligentLLMService();
  }

  // Endpoint principal pour discuter avec l'IA
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

      console.log(`🤖 Question IA reçue pour entreprise ${companyId}:`, question.substring(0, 100) + '...');

      // Appel au service IA
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
      console.error('❌ Erreur contrôleur IA chat:', error);
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

      console.log(`📊 Génération rapport IA: ${type} pour entreprise ${companyId}`);

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
          count: suggestions.length
        }
      });

    } catch (error) {
      console.error('❌ Erreur suggestions IA:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des suggestions'
      });
    }
  }

  // Obtenir l'historique des interactions IA
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
          count: history.length
        }
      });

    } catch (error) {
      console.error('❌ Erreur historique IA:', error);
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

  // Obtenir les statistiques d'utilisation de l'IA
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

      // Coût total estimé
      const costQuery = await require('../../database').query(`
        SELECT SUM(JSON_EXTRACT(context_data, '$.metadata.cost')) as total_cost
        FROM ai_interactions 
        WHERE company_id = ? AND user_id = ?
        AND JSON_EXTRACT(context_data, '$.metadata.cost') IS NOT NULL
      `, [companyId, userId]);

      res.json({
        success: true,
        data: {
          stats: {
            ...stats[0],
            totalCost: parseFloat(costQuery[0].total_cost || 0),
            avgCostPerInteraction: stats[0].total_interactions > 0 ? 
              parseFloat(costQuery[0].total_cost || 0) / stats[0].total_interactions : 0
          }
        }
      });

    } catch (error) {
      console.error('❌ Erreur statistiques IA:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de la récupération des statistiques'
      });
    }
  }

  // Feedback utilisateur sur une réponse IA
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
      console.error('❌ Erreur feedback IA:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur lors de l\'enregistrement du feedback'
      });
    }
  }
}

module.exports = IntelligentLLMController;
