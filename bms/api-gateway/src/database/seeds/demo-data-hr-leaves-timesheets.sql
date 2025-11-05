-- ==========================================
-- DONNÉES RH - CONGÉS ET CRA
-- ==========================================

BEGIN;

-- CONGÉS APPROUVÉS
INSERT INTO leaves (company_id, employee_id, employee_name, leave_type, start_date, end_date, days_count, reason, status, requested_at, approved_at, approved_by)
VALUES 
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0002-0000-0000-000000000002', 'Aïcha Koffi', 'annual', '2024-01-15', '2024-01-19', 5, 'Vacances familiales', 'approved', '2024-01-05 10:00:00', '2024-01-06 14:00:00', 'emp-0001-0000-0000-000000000001'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0003-0000-0000-000000000003', 'Serge Mensah', 'annual', '2024-02-05', '2024-02-09', 5, 'Congés annuels', 'approved', '2024-01-20 09:00:00', '2024-01-22 11:00:00', 'emp-0001-0000-0000-000000000001'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0007-0000-0000-000000000007', 'David Assogba', 'sick', '2024-02-12', '2024-02-14', 3, 'Maladie', 'approved', '2024-02-12 08:00:00', '2024-02-12 10:00:00', 'emp-0005-0000-0000-000000000005'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0009-0000-0000-000000000009', 'Élise Dossou', 'annual', '2024-03-01', '2024-03-08', 6, 'Vacances', 'approved', '2024-02-15 10:00:00', '2024-02-16 15:00:00', 'emp-0001-0000-0000-000000000001'),
  
  -- CONGÉS EN ATTENTE
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0004-0000-0000-000000000004', 'Fatou Diallo', 'annual', '2024-03-20', '2024-03-27', 6, 'Congés annuels', 'pending', '2024-03-05 09:00:00', NULL, NULL),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0008-0000-0000-000000000008', 'Rachid Touré', 'annual', '2024-04-01', '2024-04-05', 5, 'Vacances', 'pending', '2024-03-10 14:00:00', NULL, NULL),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0010-0000-0000-000000000010', 'Ibrahim Sow', 'sick', '2024-03-15', '2024-03-15', 1, 'Consultation médicale', 'pending', '2024-03-14 16:00:00', NULL, NULL),
  
  -- CONGÉS REJETÉS
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0011-0000-0000-000000000011', 'Nathalie Gbaguidi', 'annual', '2024-02-20', '2024-02-23', 4, 'Congés', 'rejected', '2024-02-10 10:00:00', NULL, NULL)
ON CONFLICT DO NOTHING;

-- CRA (TIMESHEETS) - Semaine 1 Février 2024
INSERT INTO timesheets (company_id, employee_id, employee_name, period, week_number, date, project, task, hours, description, status, submitted_at, approved_at, approved_by)
VALUES 
  -- Développeur
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0008-0000-0000-000000000008', 'Rachid Touré', '2024-02', 5, '2024-02-05', 'BMS - Module RH', 'Développement interface', 8, 'Création des écrans de gestion RH', 'approved', '2024-02-09 17:00:00', '2024-02-10 10:00:00', 'emp-0007-0000-0000-000000000007'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0008-0000-0000-000000000008', 'Rachid Touré', '2024-02', 5, '2024-02-06', 'BMS - Module RH', 'Développement backend', 8, 'API de gestion des employés', 'approved', '2024-02-09 17:00:00', '2024-02-10 10:00:00', 'emp-0007-0000-0000-000000000007'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0008-0000-0000-000000000008', 'Rachid Touré', '2024-02', 5, '2024-02-07', 'BMS - Module RH', 'Tests unitaires', 7, 'Tests des fonctionnalités RH', 'approved', '2024-02-09 17:00:00', '2024-02-10 10:00:00', 'emp-0007-0000-0000-000000000007'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0008-0000-0000-000000000008', 'Rachid Touré', '2024-02', 5, '2024-02-08', 'BMS - Module Comptabilité', 'Corrections bugs', 8, 'Résolution bugs comptabilité', 'approved', '2024-02-09 17:00:00', '2024-02-10 10:00:00', 'emp-0007-0000-0000-000000000007'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0008-0000-0000-000000000008', 'Rachid Touré', '2024-02', 5, '2024-02-09', 'BMS - Documentation', 'Documentation technique', 8, 'Rédaction documentation API', 'approved', '2024-02-09 17:00:00', '2024-02-10 10:00:00', 'emp-0007-0000-0000-000000000007'),
  
  -- Responsable IT
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0007-0000-0000-000000000007', 'David Assogba', '2024-02', 5, '2024-02-05', 'Infrastructure', 'Maintenance serveurs', 6, 'Mise à jour serveurs', 'approved', '2024-02-09 17:00:00', '2024-02-10 10:00:00', 'emp-0001-0000-0000-000000000001'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0007-0000-0000-000000000007', 'David Assogba', '2024-02', 5, '2024-02-05', 'BMS - Architecture', 'Revue architecture', 2, 'Revue architecture système', 'approved', '2024-02-09 17:00:00', '2024-02-10 10:00:00', 'emp-0001-0000-0000-000000000001'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0007-0000-0000-000000000007', 'David Assogba', '2024-02', 5, '2024-02-06', 'BMS - Sécurité', 'Audit sécurité', 8, 'Audit de sécurité application', 'approved', '2024-02-09 17:00:00', '2024-02-10 10:00:00', 'emp-0001-0000-0000-000000000001'),
  
  -- Commercial
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0010-0000-0000-000000000010', 'Ibrahim Sow', '2024-02', 5, '2024-02-05', 'Prospection', 'Visites clients', 8, 'Visite 5 prospects', 'approved', '2024-02-09 17:00:00', '2024-02-10 10:00:00', 'emp-0009-0000-0000-000000000009'),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0010-0000-0000-000000000010', 'Ibrahim Sow', '2024-02', 5, '2024-02-06', 'Prospection', 'Appels téléphoniques', 7, '15 appels de prospection', 'approved', '2024-02-09 17:00:00', '2024-02-10 10:00:00', 'emp-0009-0000-0000-000000000009'),
  
  -- CRA en attente
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0008-0000-0000-000000000008', 'Rachid Touré', '2024-03', 10, '2024-03-04', 'BMS - Module Trésorerie', 'Développement', 8, 'Développement prévisions trésorerie', 'submitted', '2024-03-08 17:00:00', NULL, NULL),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0008-0000-0000-000000000008', 'Rachid Touré', '2024-03', 10, '2024-03-05', 'BMS - Module Trésorerie', 'Développement', 8, 'Intégration bancaire', 'submitted', '2024-03-08 17:00:00', NULL, NULL),
  
  -- CRA brouillon
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0007-0000-0000-000000000007', 'David Assogba', '2024-03', 10, '2024-03-04', 'Infrastructure', 'Monitoring', 6, 'Surveillance infrastructure', 'draft', NULL, NULL, NULL),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'emp-0010-0000-0000-000000000010', 'Ibrahim Sow', '2024-03', 10, '2024-03-04', 'Prospection', 'Rendez-vous clients', 8, 'Visite 3 clients', 'draft', NULL, NULL, NULL)
ON CONFLICT DO NOTHING;

COMMIT;
