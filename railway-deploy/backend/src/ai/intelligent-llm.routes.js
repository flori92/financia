const express = require('express');
const IntelligentLLMController = require('./intelligent-llm.controller');

const router = express.Router();
const llmController = new IntelligentLLMController();

/**
 * @swagger
 * /api/v1/ai/chat:
 *   post:
 *     summary: Discuter avec l'IA intelligente BMS
 *     tags: [AI - Intelligent LLM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *               - companyId
 *               - userId
 *             properties:
 *               question:
 *                 type: string
 *                 maxLength: 2000
 *                 description: Question pour l'IA
 *               companyId:
 *                 type: string
 *                 description: ID de l'entreprise
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Réponse de l'IA avec contexte BMS
 *       400:
 *         description: Paramètres invalides
 *       500:
 *         description: Erreur serveur
 */
router.post('/chat', async (req, res) => {
  await llmController.chat(req, res);
});

/**
 * @swagger
 * /api/v1/ai/reports:
 *   post:
 *     summary: Générer un rapport automatisé par l'IA
 *     tags: [AI - Intelligent LLM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - companyId
 *               - userId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [financial_summary, tax_optimization, cash_flow, performance]
 *                 description: Type de rapport à générer
 *               companyId:
 *                 type: string
 *                 description: ID de l'entreprise
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Rapport généré par l'IA
 *       400:
 *         description: Type de rapport invalide
 *       500:
 *         description: Erreur lors de la génération
 */
router.post('/reports', async (req, res) => {
  await llmController.generateReport(req, res);
});

/**
 * @swagger
 * /api/v1/ai/suggestions:
 *   get:
 *     summary: Obtenir des suggestions de questions personnalisées
 *     tags: [AI - Intelligent LLM]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Liste de suggestions personnalisées
 *       400:
 *         description: Paramètres manquants
 *       500:
 *         description: Erreur serveur
 */
router.get('/suggestions', async (req, res) => {
  await llmController.getSuggestions(req, res);
});

/**
 * @swagger
 * /api/v1/ai/history:
 *   get:
 *     summary: Obtenir l'historique des interactions IA
 *     tags: [AI - Intelligent LLM]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre maximum d'interactions
 *     responses:
 *       200:
 *         description: Historique des interactions
 *       400:
 *         description: Paramètres manquants
 *       500:
 *         description: Erreur serveur
 */
router.get('/history', async (req, res) => {
  await llmController.getHistory(req, res);
});

/**
 * @swagger
 * /api/v1/ai/history/delete:
 *   delete:
 *     summary: Supprimer une interaction de l'historique
 *     tags: [AI - Intelligent LLM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interactionId
 *               - companyId
 *               - userId
 *             properties:
 *               interactionId:
 *                 type: string
 *                 description: ID de l'interaction à supprimer
 *               companyId:
 *                 type: string
 *                 description: ID de l'entreprise
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Interaction supprimée
 *       400:
 *         description: Paramètres invalides
 *       500:
 *         description: Erreur lors de la suppression
 */
router.delete('/history/delete', async (req, res) => {
  await llmController.deleteHistoryItem(req, res);
});

/**
 * @swagger
 * /api/v1/ai/stats:
 *   get:
 *     summary: Obtenir les statistiques d'utilisation de l'IA
 *     tags: [AI - Intelligent LLM]
 *     parameters:
 *       - in: query
 *         name: companyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'entreprise
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Statistiques d'utilisation
 *       400:
 *         description: Paramètres manquants
 *       500:
 *         description: Erreur serveur
 */
router.get('/stats', async (req, res) => {
  await llmController.getStats(req, res);
});

/**
 * @swagger
 * /api/v1/ai/feedback:
 *   post:
 *     summary: Soumettre un feedback sur une réponse IA
 *     tags: [AI - Intelligent LLM]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - interactionId
 *               - rating
 *               - companyId
 *               - userId
 *             properties:
 *               interactionId:
 *                 type: string
 *                 description: ID de l'interaction
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Note de 1 à 5
 *               comment:
 *                 type: string
 *                 description: Commentaire optionnel
 *               companyId:
 *                 type: string
 *                 description: ID de l'entreprise
 *               userId:
 *                 type: string
 *                 description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Feedback enregistré
 *       400:
 *         description: Paramètres invalides
 *       500:
 *         description: Erreur lors de l'enregistrement
 */
router.post('/feedback', async (req, res) => {
  await llmController.submitFeedback(req, res);
});

module.exports = router;
