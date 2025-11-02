-- Script SQL simple pour données de test BMS
-- Insère des écritures comptables de base

-- Nettoyer les anciennes données
DELETE FROM journal_entry_lines WHERE journal_entry_id IN (
    SELECT id FROM journal_entries WHERE company_id = 'test-company'
);
DELETE FROM journal_entries WHERE company_id = 'test-company';

-- Créer quelques écritures de test
INSERT INTO journal_entries (
    id, company_id, entry_number, entryDate, description, status, totalDebit, totalCredit, createdAt, updatedAt
) VALUES 
-- Vente récente
(gen_random_uuid(), 'test-company', 'V202411001', '2024-11-01', 'Vente marchandises', 'posted', 1180000, 1180000, NOW(), NOW()),
-- Vente octobre
(gen_random_uuid(), 'test-company', 'V202410001', '2024-10-15', 'Vente services', 'posted', 2360000, 2360000, NOW(), NOW()),
-- Vente septembre
(gen_random_uuid(), 'test-company', 'V202409001', '2024-09-20', 'Vente produits', 'posted', 1770000, 1770000, NOW(), NOW()),
-- Achat octobre
(gen_random_uuid(), 'test-company', 'A202410001', '2024-10-10', 'Achat matières', 'posted', 590000, 590000, NOW(), NOW()),
-- Achat septembre
(gen_random_uuid(), 'test-company', 'A202409001', '2024-09-05', 'Achat fournitures', 'posted', 826000, 826000, NOW(), NOW());

-- Lignes d'écriture pour les ventes
INSERT INTO journal_entry_lines (
    id, journal_entry_id, account_id, debit, credit, label, createdAt, updatedAt
) 
-- Lignes pour la vente de novembre
SELECT 
    gen_random_uuid(), 
    je.id, 
    a.id, 
    CASE WHEN a.accountNumber = '411' THEN 1180000 ELSE 0 END,
    CASE WHEN a.accountNumber IN ('707', '4457') THEN 
        CASE WHEN a.accountNumber = '707' THEN 1000000 ELSE 180000 END 
    ELSE 0 END,
    CASE WHEN a.accountNumber = '411' THEN 'CLIENT NOV' 
         WHEN a.accountNumber = '707' THEN 'VENTE MARCH' 
         ELSE 'TVA COLLECTEE' END,
    NOW(), NOW()
FROM journal_entries je, accounts a 
WHERE je.company_id = 'test-company' 
AND je.entryNumber = 'V202411001'
AND a.company_id = 'test-company'
AND a.accountNumber IN ('411', '707', '4457')

UNION ALL

-- Lignes pour la vente d'octobre
SELECT 
    gen_random_uuid(), 
    je.id, 
    a.id, 
    CASE WHEN a.accountNumber = '411' THEN 2360000 ELSE 0 END,
    CASE WHEN a.accountNumber IN ('706', '4457') THEN 
        CASE WHEN a.accountNumber = '706' THEN 2000000 ELSE 360000 END 
    ELSE 0 END,
    CASE WHEN a.accountNumber = '411' THEN 'CLIENT OCT' 
         WHEN a.accountNumber = '706' THEN 'VENTE SERVICES' 
         ELSE 'TVA COLLECTEE' END,
    NOW(), NOW()
FROM journal_entries je, accounts a 
WHERE je.company_id = 'test-company' 
AND je.entryNumber = 'V202410001'
AND a.company_id = 'test-company'
AND a.accountNumber IN ('411', '706', '4457')

UNION ALL

-- Lignes pour la vente de septembre
SELECT 
    gen_random_uuid(), 
    je.id, 
    a.id, 
    CASE WHEN a.accountNumber = '411' THEN 1770000 ELSE 0 END,
    CASE WHEN a.accountNumber IN ('707', '4457') THEN 
        CASE WHEN a.accountNumber = '707' THEN 1500000 ELSE 270000 END 
    ELSE 0 END,
    CASE WHEN a.accountNumber = '411' THEN 'CLIENT SEPT' 
         WHEN a.accountNumber = '707' THEN 'VENTE PRODUITS' 
         ELSE 'TVA COLLECTEE' END,
    NOW(), NOW()
FROM journal_entries je, accounts a 
WHERE je.company_id = 'test-company' 
AND je.entryNumber = 'V202409001'
AND a.company_id = 'test-company'
AND a.accountNumber IN ('411', '707', '4457')

UNION ALL

-- Lignes pour l'achat d'octobre
SELECT 
    gen_random_uuid(), 
    je.id, 
    a.id, 
    CASE WHEN a.accountNumber IN ('607', '4456') THEN 
        CASE WHEN a.accountNumber = '607' THEN 500000 ELSE 90000 END 
    ELSE 0 END,
    CASE WHEN a.accountNumber = '401' THEN 590000 ELSE 0 END,
    CASE WHEN a.accountNumber = '607' THEN 'ACHAT MATIERES' 
         WHEN a.accountNumber = '4456' THEN 'TVA DEDUCTIBLE'
         ELSE 'FOURNISSEUR OCT' END,
    NOW(), NOW()
FROM journal_entries je, accounts a 
WHERE je.company_id = 'test-company' 
AND je.entryNumber = 'A202410001'
AND a.company_id = 'test-company'
AND a.accountNumber IN ('607', '4456', '401')

UNION ALL

-- Lignes pour l'achat de septembre
SELECT 
    gen_random_uuid(), 
    je.id, 
    a.id, 
    CASE WHEN a.accountNumber IN ('606', '4456') THEN 
        CASE WHEN a.accountNumber = '606' THEN 700000 ELSE 126000 END 
    ELSE 0 END,
    CASE WHEN a.accountNumber = '401' THEN 826000 ELSE 0 END,
    CASE WHEN a.accountNumber = '606' THEN 'ACHAT FOURNITURES' 
         WHEN a.accountNumber = '4456' THEN 'TVA DEDUCTIBLE'
         ELSE 'FOURNISSEUR SEPT' END,
    NOW(), NOW()
FROM journal_entries je, accounts a 
WHERE je.company_id = 'test-company' 
AND je.entryNumber = 'A202409001'
AND a.company_id = 'test-company'
AND a.accountNumber IN ('606', '4456', '401');

-- Afficher le résumé
SELECT 'Données créées' as status, COUNT(*) as entries 
FROM journal_entries 
WHERE company_id = 'test-company'

UNION ALL

SELECT 'Lignes créées' as status, COUNT(*) as lines 
FROM journal_entry_lines 
WHERE journal_entry_id IN (
    SELECT id FROM journal_entries WHERE company_id = 'test-company'
);
