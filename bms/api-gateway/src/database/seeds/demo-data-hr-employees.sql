-- ==========================================
-- DONNÉES RH - EMPLOYÉS
-- ==========================================

BEGIN;

-- EMPLOYÉS
INSERT INTO employees (id, company_id, employee_number, first_name, last_name, email, phone, date_of_birth, hire_date, position, department, base_salary, contract_type, status, bank_account, address, emergency_contact, emergency_phone)
VALUES 
  -- Direction
  ('emp-0001-0000-0000-000000000001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-001', 'Jean', 'Dupont', 'j.dupont@cabinet.bj', '+22997100001', '1980-05-15', '2020-01-15', 'Directeur Général', 'Direction', 2500000, 'CDI', 'active', 'BJ06BJ0610100001', 'Akpakpa, Cotonou', 'Marie Dupont', '+22997100002'),
  
  -- Comptabilité
  ('emp-0002-0000-0000-000000000002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-002', 'Aïcha', 'Koffi', 'a.koffi@cabinet.bj', '+22997100003', '1985-08-22', '2020-03-01', 'Chef Comptable', 'Comptabilité', 1200000, 'CDI', 'active', 'BJ06BJ0610100002', 'Fidjrossè, Cotonou', 'Yves Koffi', '+22997100004'),
  ('emp-0003-0000-0000-000000000003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-003', 'Serge', 'Mensah', 's.mensah@cabinet.bj', '+22997100005', '1990-03-10', '2021-06-15', 'Comptable', 'Comptabilité', 800000, 'CDI', 'active', 'BJ06BJ0610100003', 'Cadjehoun, Cotonou', 'Lucie Mensah', '+22997100006'),
  ('emp-0004-0000-0000-000000000004', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-004', 'Fatou', 'Diallo', 'f.diallo@cabinet.bj', '+22997100007', '1992-11-05', '2022-01-10', 'Assistant Comptable', 'Comptabilité', 600000, 'CDI', 'active', 'BJ06BJ0610100004', 'Godomey, Cotonou', 'Amadou Diallo', '+22997100008'),
  
  -- RH
  ('emp-0005-0000-0000-000000000005', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-005', 'Sophie', 'Agbodjan', 's.agbodjan@cabinet.bj', '+22997100009', '1988-07-18', '2020-09-01', 'Responsable RH', 'Ressources Humaines', 1000000, 'CDI', 'active', 'BJ06BJ0610100005', 'Akpakpa, Cotonou', 'Paul Agbodjan', '+22997100010'),
  ('emp-0006-0000-0000-000000000006', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-006', 'Marc', 'Houngbo', 'm.houngbo@cabinet.bj', '+22997100011', '1993-02-28', '2022-05-01', 'Assistant RH', 'Ressources Humaines', 650000, 'CDI', 'active', 'BJ06BJ0610100006', 'Fidjrossè, Cotonou', 'Claire Houngbo', '+22997100012'),
  
  -- IT
  ('emp-0007-0000-0000-000000000007', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-007', 'David', 'Assogba', 'd.assogba@cabinet.bj', '+22997100013', '1987-09-12', '2021-02-01', 'Responsable IT', 'Informatique', 1100000, 'CDI', 'active', 'BJ06BJ0610100007', 'Cadjehoun, Cotonou', 'Nadège Assogba', '+22997100014'),
  ('emp-0008-0000-0000-000000000008', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-008', 'Rachid', 'Touré', 'r.toure@cabinet.bj', '+22997100015', '1995-04-20', '2023-01-15', 'Développeur', 'Informatique', 750000, 'CDI', 'active', 'BJ06BJ0610100008', 'Akpakpa, Cotonou', 'Aminata Touré', '+22997100016'),
  
  -- Commercial
  ('emp-0009-0000-0000-000000000009', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-009', 'Élise', 'Dossou', 'e.dossou@cabinet.bj', '+22997100017', '1989-12-08', '2021-08-01', 'Responsable Commercial', 'Commercial', 950000, 'CDI', 'active', 'BJ06BJ0610100009', 'Fidjrossè, Cotonou', 'Gilles Dossou', '+22997100018'),
  ('emp-0010-0000-0000-000000000010', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-010', 'Ibrahim', 'Sow', 'i.sow@cabinet.bj', '+22997100019', '1991-06-25', '2022-03-15', 'Commercial', 'Commercial', 700000, 'CDI', 'active', 'BJ06BJ0610100010', 'Godomey, Cotonou', 'Fatoumata Sow', '+22997100020'),
  
  -- Support
  ('emp-0011-0000-0000-000000000011', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-011', 'Nathalie', 'Gbaguidi', 'n.gbaguidi@cabinet.bj', '+22997100021', '1994-01-30', '2022-09-01', 'Secrétaire', 'Administration', 550000, 'CDI', 'active', 'BJ06BJ0610100011', 'Cadjehoun, Cotonou', 'Julien Gbaguidi', '+22997100022'),
  ('emp-0012-0000-0000-000000000012', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'EMP-012', 'Yves', 'Akakpo', 'y.akakpo@cabinet.bj', '+22997100023', '1996-10-14', '2023-06-01', 'Stagiaire Comptable', 'Comptabilité', 350000, 'Stage', 'active', 'BJ06BJ0610100012', 'Akpakpa, Cotonou', 'Rosine Akakpo', '+22997100024')
ON CONFLICT (employee_number) DO NOTHING;

-- SOLDES DE CONGÉS 2024
INSERT INTO leave_balances (company_id, employee_id, year, annual_leave_total, annual_leave_taken, annual_leave_remaining, sick_leave_total, sick_leave_taken, sick_leave_remaining)
SELECT 
  company_id,
  id,
  2024,
  30,
  FLOOR(RANDOM() * 10),
  30 - FLOOR(RANDOM() * 10),
  15,
  FLOOR(RANDOM() * 3),
  15 - FLOOR(RANDOM() * 3)
FROM employees
WHERE company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7'
ON CONFLICT (company_id, employee_id, year) DO NOTHING;

COMMIT;
