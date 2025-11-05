-- ==========================================
-- DONNÉES RH - BULLETINS DE PAIE
-- ==========================================

BEGIN;

-- BULLETINS DE PAIE - Janvier 2024
INSERT INTO payslips (company_id, employee_id, period, employee_number, employee_name, position, department, base_salary, worked_days, bonuses, allowances, gross_salary, social_charges, tax, deductions, net_salary, status, generated_at, approved_at, paid_at, pdf_url)
SELECT 
  e.company_id,
  e.id,
  '2024-01',
  e.employee_number,
  e.first_name || ' ' || e.last_name,
  e.position,
  e.department,
  e.base_salary,
  22,
  CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.10 ELSE 0 END,
  50000,
  e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.10 ELSE 0 END + 50000,
  (e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.10 ELSE 0 END + 50000) * 0.18,
  (e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.10 ELSE 0 END + 50000) * 0.12,
  0,
  (e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.10 ELSE 0 END + 50000) * 0.70,
  'paid',
  '2024-01-25 10:00:00',
  '2024-01-28 14:00:00',
  '2024-02-01 09:00:00',
  '/payslips/2024-01/' || e.employee_number || '.pdf'
FROM employees e
WHERE e.company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7'
ON CONFLICT (company_id, employee_id, period) DO NOTHING;

-- BULLETINS DE PAIE - Février 2024
INSERT INTO payslips (company_id, employee_id, period, employee_number, employee_name, position, department, base_salary, worked_days, bonuses, allowances, gross_salary, social_charges, tax, deductions, net_salary, status, generated_at, approved_at, pdf_url)
SELECT 
  e.company_id,
  e.id,
  '2024-02',
  e.employee_number,
  e.first_name || ' ' || e.last_name,
  e.position,
  e.department,
  e.base_salary,
  20,
  CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.15 ELSE 0 END,
  50000,
  e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.15 ELSE 0 END + 50000,
  (e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.15 ELSE 0 END + 50000) * 0.18,
  (e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.15 ELSE 0 END + 50000) * 0.12,
  0,
  (e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.15 ELSE 0 END + 50000) * 0.70,
  'approved',
  '2024-02-25 10:00:00',
  '2024-02-28 14:00:00',
  '/payslips/2024-02/' || e.employee_number || '.pdf'
FROM employees e
WHERE e.company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7'
ON CONFLICT (company_id, employee_id, period) DO NOTHING;

-- BULLETINS DE PAIE - Mars 2024 (en cours)
INSERT INTO payslips (company_id, employee_id, period, employee_number, employee_name, position, department, base_salary, worked_days, bonuses, allowances, gross_salary, social_charges, tax, deductions, net_salary, status, generated_at)
SELECT 
  e.company_id,
  e.id,
  '2024-03',
  e.employee_number,
  e.first_name || ' ' || e.last_name,
  e.position,
  e.department,
  e.base_salary,
  22,
  CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.08 ELSE 0 END,
  50000,
  e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.08 ELSE 0 END + 50000,
  (e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.08 ELSE 0 END + 50000) * 0.18,
  (e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.08 ELSE 0 END + 50000) * 0.12,
  0,
  (e.base_salary + CASE WHEN e.department = 'Commercial' THEN e.base_salary * 0.08 ELSE 0 END + 50000) * 0.70,
  'draft',
  NOW()
FROM employees e
WHERE e.company_id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7'
ON CONFLICT (company_id, employee_id, period) DO NOTHING;

COMMIT;
