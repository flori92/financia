-- ==========================================
-- ÉCRITURES COMPTABLES
-- ==========================================

BEGIN;

-- ÉCRITURES COMPTABLES
INSERT INTO journal_entries (id, company_id, entry_date, reference, description, journal_code, status, posted_at, created_at)
VALUES 
  ('je-0001-0000-0000-000000000001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-02-01', 'VTE-2024-001', 'Vente prestation FAC-2024-001', 'VTE', 'posted', NOW(), NOW()),
  ('je-0002-0000-0000-000000000002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-02-01', 'ENC-2024-001', 'Encaissement FAC-2024-001', 'BQ', 'posted', NOW(), NOW()),
  ('je-0003-0000-0000-000000000003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-02-05', 'VTE-2024-002', 'Vente audit FAC-2024-002', 'VTE', 'posted', NOW(), NOW()),
  ('je-0004-0000-0000-000000000004', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-02-05', 'ENC-2024-002', 'Encaissement FAC-2024-002', 'BQ', 'posted', NOW(), NOW()),
  ('je-0005-0000-0000-000000000005', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-02-03', 'ACH-2024-001', 'Achat fournitures bureau', 'ACH', 'posted', NOW(), NOW()),
  ('je-0006-0000-0000-000000000006', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-02-03', 'PAI-2024-001', 'Paiement fournitures', 'BQ', 'posted', NOW(), NOW()),
  ('je-0007-0000-0000-000000000007', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-02-01', 'SAL-2024-001', 'Salaires janvier 2024', 'OD', 'posted', NOW(), NOW()),
  ('je-0008-0000-0000-000000000008', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-02-10', 'SOC-2024-001', 'Cotisations sociales janvier', 'OD', 'posted', NOW(), NOW()),
  ('je-0009-0000-0000-000000000009', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', '2024-02-15', 'TVA-2024-001', 'TVA janvier 2024', 'OD', 'posted', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- LIGNES D'ÉCRITURES (récupérer les IDs des comptes)
DO $$
DECLARE
    acc_clients UUID;
    acc_ventes UUID;
    acc_tva UUID;
    acc_banque UUID;
    acc_achats UUID;
    acc_fournisseurs UUID;
    acc_salaires UUID;
    acc_personnel UUID;
    acc_charges_sociales UUID;
    acc_org_sociaux UUID;
BEGIN
    -- Récupérer les IDs des comptes
    SELECT id INTO acc_clients FROM accounts WHERE account_number = '411' AND company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7' LIMIT 1;
    SELECT id INTO acc_ventes FROM accounts WHERE account_number = '706' AND company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7' LIMIT 1;
    SELECT id INTO acc_tva FROM accounts WHERE account_number = '445' AND company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7' LIMIT 1;
    SELECT id INTO acc_banque FROM accounts WHERE account_number = '512' AND company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7' LIMIT 1;
    SELECT id INTO acc_achats FROM accounts WHERE account_number = '605' AND company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7' LIMIT 1;
    SELECT id INTO acc_fournisseurs FROM accounts WHERE account_number = '401' AND company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7' LIMIT 1;
    SELECT id INTO acc_salaires FROM accounts WHERE account_number = '66' AND company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7' LIMIT 1;
    SELECT id INTO acc_personnel FROM accounts WHERE account_number = '421' AND company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7' LIMIT 1;
    SELECT id INTO acc_charges_sociales FROM accounts WHERE account_number = '66' AND company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7' LIMIT 1;
    SELECT id INTO acc_org_sociaux FROM accounts WHERE account_number = '43' AND company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7' LIMIT 1;

    -- Vente FAC-2024-001
    INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, label)
    VALUES 
        ('je-0001-0000-0000-000000000001', acc_clients, 1003000, 0, 'Client Hôtel Palm Beach'),
        ('je-0001-0000-0000-000000000001', acc_ventes, 0, 850000, 'Prestation comptable'),
        ('je-0001-0000-0000-000000000001', acc_tva, 0, 153000, 'TVA collectée 18%')
    ON CONFLICT DO NOTHING;

    -- Encaissement FAC-2024-001
    INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, label, reconciliation_key, reconciled_at)
    VALUES 
        ('je-0002-0000-0000-000000000002', acc_banque, 1003000, 0, 'Virement reçu', 'REC-001', NOW()),
        ('je-0002-0000-0000-000000000002', acc_clients, 0, 1003000, 'Client Hôtel Palm Beach', 'REC-001', NOW())
    ON CONFLICT DO NOTHING;

    -- Vente FAC-2024-002
    INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, label)
    VALUES 
        ('je-0003-0000-0000-000000000003', acc_clients, 1416000, 0, 'Client ABC Trading'),
        ('je-0003-0000-0000-000000000003', acc_ventes, 0, 1200000, 'Audit comptable'),
        ('je-0003-0000-0000-000000000003', acc_tva, 0, 216000, 'TVA collectée 18%')
    ON CONFLICT DO NOTHING;

    -- Encaissement FAC-2024-002
    INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, label, reconciliation_key, reconciled_at)
    VALUES 
        ('je-0004-0000-0000-000000000004', acc_banque, 1416000, 0, 'Virement reçu', 'REC-002', NOW()),
        ('je-0004-0000-0000-000000000004', acc_clients, 0, 1416000, 'Client ABC Trading', 'REC-002', NOW())
    ON CONFLICT DO NOTHING;

    -- Achat fournitures
    INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, label)
    VALUES 
        ('je-0005-0000-0000-000000000005', acc_achats, 381356, 0, 'Fournitures bureau'),
        ('je-0005-0000-0000-000000000005', acc_tva, 68644, 0, 'TVA déductible 18%'),
        ('je-0005-0000-0000-000000000005', acc_fournisseurs, 0, 450000, 'Bureau Plus SARL')
    ON CONFLICT DO NOTHING;

    -- Paiement fournitures
    INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, label, reconciliation_key, reconciled_at)
    VALUES 
        ('je-0006-0000-0000-000000000006', acc_fournisseurs, 450000, 0, 'Bureau Plus SARL', 'REC-003', NOW()),
        ('je-0006-0000-0000-000000000006', acc_banque, 0, 450000, 'Virement émis', 'REC-003', NOW())
    ON CONFLICT DO NOTHING;

    -- Salaires
    INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, label)
    VALUES 
        ('je-0007-0000-0000-000000000007', acc_salaires, 2500000, 0, 'Salaires bruts janvier'),
        ('je-0007-0000-0000-000000000007', acc_personnel, 0, 2500000, 'Salaires nets à payer')
    ON CONFLICT DO NOTHING;

    -- Cotisations sociales
    INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, label)
    VALUES 
        ('je-0008-0000-0000-000000000008', acc_charges_sociales, 850000, 0, 'Charges sociales patronales'),
        ('je-0008-0000-0000-000000000008', acc_org_sociaux, 0, 850000, 'CNSS à payer')
    ON CONFLICT DO NOTHING;

    -- TVA
    INSERT INTO journal_entry_lines (entry_id, account_id, debit, credit, label)
    VALUES 
        ('je-0009-0000-0000-000000000009', acc_tva, 420000, 0, 'TVA à décaisser'),
        ('je-0009-0000-0000-000000000009', acc_banque, 0, 420000, 'Paiement TVA')
    ON CONFLICT DO NOTHING;
END $$;

COMMIT;
