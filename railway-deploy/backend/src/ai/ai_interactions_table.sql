-- Création de la table pour les interactions IA intelligentes
CREATE TABLE IF NOT EXISTS ai_interactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  company_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  question TEXT NOT NULL,
  response TEXT NOT NULL,
  context_data JSON,
  rating INT NULL COMMENT 'Note de 1 à 5',
  feedback_comment TEXT NULL,
  feedback_date DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_company_user (company_id, user_id),
  INDEX idx_created_at (created_at),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertion de données de test pour démonstration
INSERT INTO ai_interactions (company_id, user_id, question, response, context_data, rating) VALUES 
('demo-company-1', 'demo-user-1', 'Comment vont mes finances ce mois-ci ?', 
'Vos finances ce mois-ci montrent une activité stable avec 15 écritures comptables. 
Total des crédits: 2,500,000 FCFA, Total des débits: 1,800,000 FCFA. 
Cash flow positif de 700,000 FCFA. 
Recommandations: 1) Continuez votre stratégie actuelle, 2) Surveillez les délais de paiement clients.',
'{"hasData": true, "dataDate": "2025-11-03", "entryCount": 15, "kpiAvailable": true}', 5),

('demo-company-1', 'demo-user-1', 'Quelles optimisations fiscales puis-je faire ?',
'Pour votre entreprise au Bénin, voici les optimisations possibles: 
1) TVA: Assurez-vous de récupérer toute la TVA déductible sur vos achats professionnels
2) Impôt sur le revenu: Profitez des déductions pour frais professionnels réels
3) Charges sociales: Optimisez la rémunération dirigeant avec mix salaire/dividendes
4) Investissements: Utilisez les dispositifs d''amortissement accéléré si disponibles',
'{"hasData": true, "dataDate": "2025-11-03", "entryCount": 15, "kpiAvailable": true}', 4),

('demo-company-2', 'demo-user-2', 'Analyse mes risques de trésorerie',
'Analyse des risques de trésorerie: 
- Solde actuel: 1,200,000 FCFA 
- Dépenses mensuelles moyennes: 800,000 FCFA 
- Runway estimé: 1.5 mois (RISQUE ÉLEVÉ)
- Principaux risques: 1) Concentration clients (3 clients = 70% CA), 2) Retards paiement moyen 45 jours
Actions recommandées: 1) Diversifier clientèle, 2) Mettre en place relances systématiques, 3) Négocier délais fournisseurs',
'{"hasData": true, "dataDate": "2025-11-03", "entryCount": 8, "kpiAvailable": true}', 5);
