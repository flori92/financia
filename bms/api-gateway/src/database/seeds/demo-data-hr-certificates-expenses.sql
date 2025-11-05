-- ==========================================
-- DONNÉES RH - ATTESTATIONS ET NOTES DE FRAIS
-- ==========================================

BEGIN;

-- ATTESTATIONS EMPLOYEUR
INSERT INTO certificates (company_id, employee_id, employee_name, certificate_type, certificate_number, issue_date, purpose, status, pdf_url, issued_by)
VALUES 
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0002-0000-0000-000000000002', 'Aïcha Koffi', 'employment', 'ATT-2024-001', '2024-01-15', 'Demande de visa', 'issued', '/certificates/ATT-2024-001.pdf', 'emp-0005-0000-0000-000000000005'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0003-0000-0000-000000000003', 'Serge Mensah', 'employment', 'ATT-2024-002', '2024-01-20', 'Dossier bancaire', 'issued', '/certificates/ATT-2024-002.pdf', 'emp-0005-0000-0000-000000000005'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0007-0000-0000-000000000007', 'David Assogba', 'salary', 'ATT-2024-003', '2024-02-05', 'Demande de prêt', 'issued', '/certificates/ATT-2024-003.pdf', 'emp-0005-0000-0000-000000000005'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0009-0000-0000-000000000009', 'Élise Dossou', 'employment', 'ATT-2024-004', '2024-02-10', 'Dossier administratif', 'issued', '/certificates/ATT-2024-004.pdf', 'emp-0005-0000-0000-000000000005'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0010-0000-0000-000000000010', 'Ibrahim Sow', 'salary', 'ATT-2024-005', '2024-02-15', 'Location appartement', 'issued', '/certificates/ATT-2024-005.pdf', 'emp-0005-0000-0000-000000000005'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0004-0000-0000-000000000004', 'Fatou Diallo', 'employment', 'ATT-2024-006', '2024-03-01', 'Demande de visa', 'issued', '/certificates/ATT-2024-006.pdf', 'emp-0005-0000-0000-000000000005')
ON CONFLICT (certificate_number) DO NOTHING;

-- NOTES DE FRAIS APPROUVÉES
INSERT INTO expenses (company_id, employee_id, employee_name, expense_date, category, amount, currency, description, receipt_url, status, submitted_at, approved_at, approved_by, paid_at)
VALUES 
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0009-0000-0000-000000000009', 'Élise Dossou', '2024-01-10', 'transport', 45000, 'XOF', 'Déplacement client Abomey-Calavi', '/receipts/EXP-2024-001.pdf', 'paid', '2024-01-11 09:00:00', '2024-01-12 14:00:00', 'emp-0001-0000-0000-000000000001', '2024-01-20 10:00:00'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0010-0000-0000-000000000010', 'Ibrahim Sow', '2024-01-15', 'meals', 25000, 'XOF', 'Déjeuner client', '/receipts/EXP-2024-002.pdf', 'paid', '2024-01-16 10:00:00', '2024-01-17 11:00:00', 'emp-0009-0000-0000-000000000009', '2024-01-20 10:00:00'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0007-0000-0000-000000000007', 'David Assogba', '2024-01-20', 'equipment', 85000, 'XOF', 'Achat câbles réseau', '/receipts/EXP-2024-003.pdf', 'paid', '2024-01-21 14:00:00', '2024-01-22 09:00:00', 'emp-0001-0000-0000-000000000001', '2024-02-01 10:00:00'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0009-0000-0000-000000000009', 'Élise Dossou', '2024-02-05', 'transport', 65000, 'XOF', 'Déplacement Porto-Novo', '/receipts/EXP-2024-004.pdf', 'paid', '2024-02-06 09:00:00', '2024-02-07 10:00:00', 'emp-0001-0000-0000-000000000001', '2024-02-15 10:00:00'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0002-0000-0000-000000000002', 'Aïcha Koffi', '2024-02-10', 'office', 35000, 'XOF', 'Fournitures bureau', '/receipts/EXP-2024-005.pdf', 'paid', '2024-02-11 11:00:00', '2024-02-12 14:00:00', 'emp-0001-0000-0000-000000000001', '2024-02-20 10:00:00'),
  
  -- NOTES DE FRAIS EN ATTENTE D'APPROBATION
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0010-0000-0000-000000000010', 'Ibrahim Sow', '2024-03-01', 'transport', 55000, 'XOF', 'Déplacement Parakou', '/receipts/EXP-2024-006.pdf', 'pending', '2024-03-02 09:00:00', NULL, NULL, NULL),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0008-0000-0000-000000000008', 'Rachid Touré', '2024-03-05', 'training', 120000, 'XOF', 'Formation développement web', '/receipts/EXP-2024-007.pdf', 'pending', '2024-03-06 10:00:00', NULL, NULL, NULL),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0009-0000-0000-000000000009', 'Élise Dossou', '2024-03-08', 'meals', 30000, 'XOF', 'Déjeuner prospect', '/receipts/EXP-2024-008.pdf', 'pending', '2024-03-09 14:00:00', NULL, NULL, NULL),
  
  -- NOTES DE FRAIS REJETÉES
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0011-0000-0000-000000000011', 'Nathalie Gbaguidi', '2024-02-20', 'other', 15000, 'XOF', 'Frais divers', '/receipts/EXP-2024-009.pdf', 'rejected', '2024-02-21 10:00:00', NULL, 'emp-0001-0000-0000-000000000001', NULL)
ON CONFLICT DO NOTHING;

-- PRÉSENCES (Février 2024 - Semaine 1)
INSERT INTO attendances (company_id, employee_id, date, check_in, check_out, hours_worked, status)
SELECT 
  e.company_id,
  e.id,
  d.date,
  '08:00:00',
  '17:00:00',
  8.0,
  'present'
FROM employees e
CROSS JOIN (
  SELECT '2024-02-05'::DATE as date UNION ALL
  SELECT '2024-02-06'::DATE UNION ALL
  SELECT '2024-02-07'::DATE UNION ALL
  SELECT '2024-02-08'::DATE UNION ALL
  SELECT '2024-02-09'::DATE
) d
WHERE e.company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7'
  AND e.status = 'active'
ON CONFLICT (company_id, employee_id, date) DO NOTHING;

-- Quelques absences
UPDATE attendances 
SET status = 'absent', check_in = NULL, check_out = NULL, hours_worked = 0
WHERE employee_id = 'emp-0007-0000-0000-000000000007' 
  AND date BETWEEN '2024-02-12' AND '2024-02-14';

COMMIT;
