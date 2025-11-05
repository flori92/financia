-- Script SQL pour diagnostiquer et corriger les problèmes de companyId

-- 1. Vérifier les sociétés existantes
SELECT id, name, created_at 
FROM companies 
ORDER BY created_at DESC;

-- 2. Vérifier les utilisateurs et leurs companyId
SELECT 
  id, 
  email, 
  role, 
  company_id,
  primary_profile
FROM users;

-- 3. Trouver les utilisateurs SANS companyId
SELECT id, email, role 
FROM users 
WHERE company_id IS NULL;

-- 4. Assigner un companyId à un utilisateur spécifique
-- REMPLACER 'email@example.com' et 'COMPANY_UUID' par les vraies valeurs
/*
UPDATE users 
SET company_id = 'COMPANY_UUID' 
WHERE email = 'email@example.com';
*/

-- 5. Assigner TOUS les utilisateurs à la première société (si une seule société)
/*
UPDATE users 
SET company_id = (SELECT id FROM companies LIMIT 1)
WHERE company_id IS NULL;
*/

-- 6. Vérifier qu'il y a des données comptables pour une société
/*
SELECT 
  COUNT(*) as total_entries,
  SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) as posted_entries
FROM journal_entries 
WHERE company_id = 'COMPANY_UUID';
*/

-- 7. Vérifier les comptes comptables d'une société
/*
SELECT 
  account_number,
  account_name,
  account_type
FROM accounts
WHERE company_id = 'COMPANY_UUID'
ORDER BY account_number;
*/

-- 8. Créer une société de test si nécessaire
/*
INSERT INTO companies (id, name, registration_number, country, industry, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'Société Test',
  'REG123456',
  'CI',
  'Services',
  NOW(),
  NOW()
)
RETURNING id, name;
*/
