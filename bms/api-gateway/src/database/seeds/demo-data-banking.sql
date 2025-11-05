-- ==========================================
-- COMPTES BANCAIRES ET TRANSACTIONS
-- ==========================================

BEGIN;

-- COMPTES BANCAIRES
INSERT INTO bank_accounts (id, company_id, name, bank_name, account_number, iban, currency, balance, is_active, created_at)
VALUES 
  ('ba-001-0000-0000-000000000001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Compte Principal', 'Bank of Africa', '00123456789', 'BJ06BJ0610123456789012345678', 'XOF', 15750000, true, NOW()),
  ('ba-002-0000-0000-000000000002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Compte Épargne', 'Ecobank Bénin', '00987654321', 'BJ06EB0610987654321098765432', 'XOF', 8500000, true, NOW()),
  ('ba-003-0000-0000-000000000003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Compte Devises', 'SGBB', '00555666777', 'BJ06SG0610555666777055566677', 'EUR', 12500, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- TRANSACTIONS BANCAIRES
INSERT INTO bank_transactions (id, bank_account_id, transaction_date, value_date, amount, label, reference, counterparty_name, is_reconciled, created_at)
VALUES 
  -- Encaissements clients
  ('bt-0001-0000-0000-000000000001', 'ba-001-0000-0000-000000000001', '2024-02-01', '2024-02-01', 1003000, 'Paiement FAC-2024-001', 'VIR-20240201-001', 'Hôtel Palm Beach', true, NOW()),
  ('bt-0002-0000-0000-000000000002', 'ba-001-0000-0000-000000000001', '2024-02-05', '2024-02-05', 1416000, 'Paiement FAC-2024-002', 'VIR-20240205-002', 'Société ABC Trading', true, NOW()),
  ('bt-0003-0000-0000-000000000003', 'ba-001-0000-0000-000000000001', '2024-02-10', '2024-02-10', 531000, 'Paiement FAC-2024-003', 'VIR-20240210-003', 'Restaurant Le Béninois', true, NOW()),
  ('bt-0004-0000-0000-000000000004', 'ba-001-0000-0000-000000000001', '2024-02-12', '2024-02-12', 1500000, 'Acompte FAC-2024-007', 'VIR-20240212-004', 'Société ABC Trading', true, NOW()),
  
  -- Paiements fournisseurs
  ('bt-0005-0000-0000-000000000005', 'ba-001-0000-0000-000000000001', '2024-02-03', '2024-02-03', -450000, 'Fournitures bureau', 'PRLV-20240203-001', 'Bureau Plus SARL', true, NOW()),
  ('bt-0006-0000-0000-000000000006', 'ba-001-0000-0000-000000000001', '2024-02-08', '2024-02-08', -280000, 'Électricité janvier', 'PRLV-20240208-002', 'Électricité Services', true, NOW()),
  ('bt-0007-0000-0000-000000000007', 'ba-001-0000-0000-000000000001', '2024-02-15', '2024-02-15', -125000, 'Impression documents', 'VIR-20240215-005', 'Imprimerie Moderne', true, NOW()),
  
  -- Salaires
  ('bt-0008-0000-0000-000000000008', 'ba-001-0000-0000-000000000001', '2024-02-01', '2024-02-01', -2500000, 'Salaires janvier 2024', 'VIR-MULT-20240201', 'Personnel', true, NOW()),
  
  -- Charges sociales
  ('bt-0009-0000-0000-000000000009', 'ba-001-0000-0000-000000000001', '2024-02-10', '2024-02-10', -850000, 'Cotisations sociales janvier', 'VIR-20240210-006', 'CNSS', true, NOW()),
  
  -- TVA
  ('bt-0010-0000-0000-000000000010', 'ba-001-0000-0000-000000000001', '2024-02-15', '2024-02-15', -420000, 'TVA janvier 2024', 'VIR-20240215-007', 'DGI', true, NOW()),
  
  -- Transactions non rapprochées
  ('bt-0011-0000-0000-000000000011', 'ba-001-0000-0000-000000000001', '2024-02-20', '2024-02-20', 750000, 'Virement reçu', 'VIR-20240220-008', 'Client inconnu', false, NOW()),
  ('bt-0012-0000-0000-000000000012', 'ba-001-0000-0000-000000000001', '2024-02-22', '2024-02-22', -95000, 'Frais bancaires', 'FRAIS-20240222', 'Bank of Africa', false, NOW())
ON CONFLICT (id) DO NOTHING;

-- PRÉVISIONS DE TRÉSORERIE
INSERT INTO cash_flow_forecast (company_id, forecast_date, type, category, amount, description, is_realized)
VALUES 
  -- Mars 2024 - Entrées
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-03-05', 'inflow', 'sales', 802400, 'Encaissement FAC-2024-004', false),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-03-10', 'inflow', 'sales', 1085600, 'Encaissement FAC-2024-005', false),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-03-15', 'inflow', 'sales', 1357000, 'Encaissement FAC-2024-006', false),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-03-20', 'inflow', 'sales', 1450000, 'Solde FAC-2024-007', false),
  
  -- Mars 2024 - Sorties
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-03-01', 'outflow', 'salaries', 2500000, 'Salaires février', false),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-03-10', 'outflow', 'social', 850000, 'Cotisations sociales février', false),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-03-15', 'outflow', 'tax', 450000, 'TVA février', false),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-03-20', 'outflow', 'suppliers', 600000, 'Fournisseurs divers', false),
  
  -- Avril 2024
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-04-01', 'outflow', 'salaries', 2500000, 'Salaires mars', false),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-04-10', 'inflow', 'sales', 2000000, 'Nouvelles factures', false)
ON CONFLICT (company_id, forecast_date, type, category) DO NOTHING;

COMMIT;
