-- Migration pour optimiser les requêtes de dashboard
-- Création de vues matérialisées et index optimisés

-- ============================================
-- VUE MATÉRIALISÉE POUR LES KPIs MENSUELS
-- ============================================
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_monthly_kpis AS
SELECT
  je.company_id,
  DATE_TRUNC('month', je.entry_date) AS month,
  SUM(CASE WHEN a.account_number LIKE '7%' THEN COALESCE(jel.credit, 0) ELSE 0 END) AS revenue,
  SUM(CASE WHEN a.account_number LIKE '6%' THEN COALESCE(jel.debit, 0) ELSE 0 END) AS expenses,
  SUM(CASE WHEN a.account_number LIKE '7%' THEN COALESCE(jel.credit, 0) ELSE 0 END) - 
  SUM(CASE WHEN a.account_number LIKE '6%' THEN COALESCE(jel.debit, 0) ELSE 0 END) AS net_income
FROM journal_entries je
JOIN journal_entry_lines jel ON je.id = jel.journal_entry_id
JOIN accounts a ON jel.account_id = a.id
WHERE je.status = 'posted'
GROUP BY je.company_id, DATE_TRUNC('month', je.entry_date);

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_mv_monthly_kpis_company_month 
ON mv_monthly_kpis(company_id, month DESC);

-- ============================================
-- INDEX OPTIMISÉS POUR LES REQUÊTES DE DASHBOARD
-- ============================================

-- Index pour les requêtes de journal entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_company_status_date 
ON journal_entries(company_id, status, entry_date DESC);

-- Index pour les requêtes de journal lines
CREATE INDEX IF NOT EXISTS idx_journal_lines_account_entry 
ON journal_entry_lines(account_id, journal_entry_id);

-- Index pour les requêtes de contacts
CREATE INDEX IF NOT EXISTS idx_contacts_company_status 
ON contacts(company_id, status);

-- Index pour les requêtes de transactions
CREATE INDEX IF NOT EXISTS idx_transactions_company_date 
ON bank_transactions(company_id, transaction_date DESC);

-- Index composites pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics 
ON journal_entries(company_id, status, entry_date) 
INCLUDE (total_debit, total_credit);

-- ============================================
-- FONCTION POUR RAFRAÎCHIR LA VUE MATÉRIALISÉE
-- ============================================
CREATE OR REPLACE FUNCTION refresh_monthly_kpis()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_kpis;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER POUR INVALIDATION AUTOMATIQUE
-- ============================================
-- Note: Les triggers d'invalidation de cache sont gérés par l'application
-- Cette fonction peut être utilisée pour rafraîchir les vues matérialisées

-- ============================================
-- COMMENTAIRES
-- ============================================
COMMENT ON MATERIALIZED VIEW mv_monthly_kpis IS 'Vue matérialisée pour les KPIs mensuels - Rafraîchir toutes les heures';
COMMENT ON INDEX idx_mv_monthly_kpis_company_month IS 'Index pour les requêtes de KPIs par entreprise et mois';
COMMENT ON INDEX idx_journal_entries_company_status_date IS 'Index pour les requêtes de journal entries par entreprise, statut et date';
COMMENT ON INDEX idx_journal_lines_account_entry IS 'Index pour les requêtes de journal lines par compte et entrée';
COMMENT ON INDEX idx_contacts_company_status IS 'Index pour les requêtes de contacts par entreprise et statut';
COMMENT ON INDEX idx_transactions_company_date IS 'Index pour les requêtes de transactions par entreprise et date';

