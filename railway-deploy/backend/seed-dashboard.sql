-- Script SQL pour peupler le dashboard BMS avec données réelles
-- Exécuter directement sur la base Railway PostgreSQL

-- 1. Créer une entreprise de démonstration
INSERT INTO companies (
    id, name, legal_name, registration_number, tax_id, industry, size, 
    address, phone, email, website, vat_rate, fiscal_year_start, currency,
    created_at, updated_at
) VALUES (
    '1805bc61-7cfd-44e9-8a63-17187bf05dc7',
    'BMS Demo SARL',
    'BMS Demo Société à Responsabilité Limitée',
    'BJS123456789',
    'BJS987654321',
    'Services Numériques',
    'small',
    '123 Rue du Commerce, Cotonou, Bénin',
    '+229 12345678',
    'demo@bms.bj',
    'https://bms-demo.bj',
    0.18,
    '01-01',
    'XOF',
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- 2. Créer le plan comptable OHADA simplifié
INSERT INTO accounts (id, code, name, type, company_id, description, created_at, updated_at) VALUES
-- Comptes de capitaux propres
('101000-uuid', '101000', 'Capital social', 'EQUITY', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Capital social', NOW(), NOW()),
('106000-uuid', '106000', 'Réserves', 'EQUITY', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Réserves', NOW(), NOW()),
('120000-uuid', '120000', 'Résultat de l''exercice', 'EQUITY', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Résultat', NOW(), NOW()),

-- Comptes de tiers
('401000-uuid', '401000', 'Fournisseurs', 'LIABILITY', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Fournisseurs', NOW(), NOW()),
('411000-uuid', '411000', 'Clients', 'ASSET', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Clients', NOW(), NOW()),
('445600-uuid', '445600', 'TVA déductible', 'ASSET', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'TVA déductible', NOW(), NOW()),
('445700-uuid', '445700', 'TVA collectée', 'LIABILITY', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'TVA collectée', NOW(), NOW()),

-- Comptes de trésorerie
('512000-uuid', '512000', 'Banque', 'ASSET', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Banque', NOW(), NOW()),
('531000-uuid', '531000', 'Caisse', 'ASSET', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Caisse', NOW(), NOW()),

-- Comptes de charges
('601000-uuid', '601000', 'Achats matières premières', 'EXPENSE', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Achats matières premières', NOW(), NOW()),
('607000-uuid', '607000', 'Achats marchandises', 'EXPENSE', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Achats marchandises', NOW(), NOW()),
('613000-uuid', '613000', 'Locations', 'EXPENSE', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Locations', NOW(), NOW()),
('622000-uuid', '622000', 'Honoraires', 'EXPENSE', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Honoraires', NOW(), NOW()),
('641000-uuid', '641000', 'Salaires', 'EXPENSE', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Salaires', NOW(), NOW()),

-- Comptes de produits
('701000-uuid', '701000', 'Ventes marchandises', 'REVENUE', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Ventes marchandises', NOW(), NOW()),
('706000-uuid', '706000', 'Services vendus', 'REVENUE', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Services vendus', NOW(), NOW()),
('707000-uuid', '707000', 'Produits accessoires', 'REVENUE', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Produits accessoires', NOW(), NOW())
ON CONFLICT (company_id, code) DO NOTHING;

-- 3. Créer les écritures comptables pour 6 mois d'activité

-- Juin 2025 - Capital initial et premières opérations
INSERT INTO journal_entries (id, company_id, description, entry_date, status, created_at, updated_at) VALUES
('entry-jun-001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Apport capital social', '2025-06-01', 'posted', NOW(), NOW()),
('entry-jun-002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Ventes juin 2025', '2025-06-15', 'posted', NOW(), NOW()),
('entry-jun-003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Achats juin 2025', '2025-06-20', 'posted', NOW(), NOW()),
('entry-jun-004', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Frais généraux juin 2025', '2025-06-25', 'posted', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Lignes des écritures juin
INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at) VALUES
-- Capital social
('line-jun-001-1', 'entry-jun-001', '512000-uuid', 10000000, 0, 'Dépôt capital banque', NOW(), NOW()),
('line-jun-001-2', 'entry-jun-001', '101000-uuid', 0, 10000000, 'Capital social apporté', NOW(), NOW()),

-- Ventes juin
('line-jun-002-1', 'entry-jun-002', '411000-uuid', 8000000, 0, 'Clients divers', NOW(), NOW()),
('line-jun-002-2', 'entry-jun-002', '701000-uuid', 0, 5600000, 'Ventes marchandises HT', NOW(), NOW()),
('line-jun-002-3', 'entry-jun-002', '445700-uuid', 0, 2400000, 'TVA collectée', NOW(), NOW()),

-- Achats juin
('line-jun-003-1', 'entry-jun-003', '607000-uuid', 3600000, 0, 'Achats marchandises HT', NOW(), NOW()),
('line-jun-003-2', 'entry-jun-003', '445600-uuid', 648000, 0, 'TVA déductible', NOW(), NOW()),
('line-jun-003-3', 'entry-jun-003', '401000-uuid', 0, 4248000, 'Fournisseurs divers', NOW(), NOW()),

-- Frais généraux juin
('line-jun-004-1', 'entry-jun-004', '613000-uuid', 800000, 0, 'Loyer bureau', NOW(), NOW()),
('line-jun-004-2', 'entry-jun-004', '622000-uuid', 600000, 0, 'Honoraires comptables', NOW(), NOW()),
('line-jun-004-3', 'entry-jun-004', '641000-uuid', 2500000, 0, 'Salaires nets', NOW(), NOW()),
('line-jun-004-4', 'entry-jun-004', '512000-uuid', 0, 3900000, 'Paiement frais généraux', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Juillet 2025 - Opérations mensuelles
INSERT INTO journal_entries (id, company_id, description, entry_date, status, created_at, updated_at) VALUES
('entry-jul-001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Ventes juillet 2025', '2025-07-15', 'posted', NOW(), NOW()),
('entry-jul-002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Achats juillet 2025', '2025-07-20', 'posted', NOW(), NOW()),
('entry-jul-003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Frais généraux juillet 2025', '2025-07-25', 'posted', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Lignes des écritures juillet
INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at) VALUES
-- Ventes juillet (croissance)
('line-jul-001-1', 'entry-jul-001', '411000-uuid', 8500000, 0, 'Clients divers', NOW(), NOW()),
('line-jul-001-2', 'entry-jul-001', '701000-uuid', 0, 5950000, 'Ventes marchandises HT', NOW(), NOW()),
('line-jul-001-3', 'entry-jul-001', '445700-uuid', 0, 2550000, 'TVA collectée', NOW(), NOW()),

-- Achats juillet
('line-jul-002-1', 'entry-jul-002', '607000-uuid', 3800000, 0, 'Achats marchandises HT', NOW(), NOW()),
('line-jul-002-2', 'entry-jul-002', '445600-uuid', 684000, 0, 'TVA déductible', NOW(), NOW()),
('line-jul-002-3', 'entry-jul-002', '401000-uuid', 0, 4484000, 'Fournisseurs divers', NOW(), NOW()),

-- Frais généraux juillet
('line-jul-003-1', 'entry-jul-003', '613000-uuid', 800000, 0, 'Loyer bureau', NOW(), NOW()),
('line-jul-003-2', 'entry-jul-003', '622000-uuid', 600000, 0, 'Honoraires comptables', NOW(), NOW()),
('line-jul-003-3', 'entry-jul-003', '641000-uuid', 2550000, 0, 'Salaires nets', NOW(), NOW()),
('line-jul-003-4', 'entry-jul-003', '512000-uuid', 0, 3950000, 'Paiement frais généraux', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Août 2025
INSERT INTO journal_entries (id, company_id, description, entry_date, status, created_at, updated_at) VALUES
('entry-aug-001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Ventes août 2025', '2025-08-15', 'posted', NOW(), NOW()),
('entry-aug-002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Achats août 2025', '2025-08-20', 'posted', NOW(), NOW()),
('entry-aug-003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Frais généraux août 2025', '2025-08-25', 'posted', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Lignes des écritures août
INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at) VALUES
('line-aug-001-1', 'entry-aug-001', '411000-uuid', 9000000, 0, 'Clients divers', NOW(), NOW()),
('line-aug-001-2', 'entry-aug-001', '701000-uuid', 0, 6300000, 'Ventes marchandises HT', NOW(), NOW()),
('line-aug-001-3', 'entry-aug-001', '445700-uuid', 0, 2700000, 'TVA collectée', NOW(), NOW()),
('line-aug-002-1', 'entry-aug-002', '607000-uuid', 4000000, 0, 'Achats marchandises HT', NOW(), NOW()),
('line-aug-002-2', 'entry-aug-002', '445600-uuid', 720000, 0, 'TVA déductible', NOW(), NOW()),
('line-aug-002-3', 'entry-aug-002', '401000-uuid', 0, 4720000, 'Fournisseurs divers', NOW(), NOW()),
('line-aug-003-1', 'entry-aug-003', '613000-uuid', 800000, 0, 'Loyer bureau', NOW(), NOW()),
('line-aug-003-2', 'entry-aug-003', '622000-uuid', 600000, 0, 'Honoraires comptables', NOW(), NOW()),
('line-aug-003-3', 'entry-aug-003', '641000-uuid', 2600000, 0, 'Salaires nets', NOW(), NOW()),
('line-aug-003-4', 'entry-aug-003', '512000-uuid', 0, 4000000, 'Paiement frais généraux', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Septembre 2025
INSERT INTO journal_entries (id, company_id, description, entry_date, status, created_at, updated_at) VALUES
('entry-sep-001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Ventes septembre 2025', '2025-09-15', 'posted', NOW(), NOW()),
('entry-sep-002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Achats septembre 2025', '2025-09-20', 'posted', NOW(), NOW()),
('entry-sep-003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Frais généraux septembre 2025', '2025-09-25', 'posted', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Lignes des écritures septembre
INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at) VALUES
('line-sep-001-1', 'entry-sep-001', '411000-uuid', 9500000, 0, 'Clients divers', NOW(), NOW()),
('line-sep-001-2', 'entry-sep-001', '701000-uuid', 0, 6650000, 'Ventes marchandises HT', NOW(), NOW()),
('line-sep-001-3', 'entry-sep-001', '445700-uuid', 0, 2850000, 'TVA collectée', NOW(), NOW()),
('line-sep-002-1', 'entry-sep-002', '607000-uuid', 4200000, 0, 'Achats marchandises HT', NOW(), NOW()),
('line-sep-002-2', 'entry-sep-002', '445600-uuid', 756000, 0, 'TVA déductible', NOW(), NOW()),
('line-sep-002-3', 'entry-sep-002', '401000-uuid', 0, 4956000, 'Fournisseurs divers', NOW(), NOW()),
('line-sep-003-1', 'entry-sep-003', '613000-uuid', 800000, 0, 'Loyer bureau', NOW(), NOW()),
('line-sep-003-2', 'entry-sep-003', '622000-uuid', 600000, 0, 'Honoraires comptables', NOW(), NOW()),
('line-sep-003-3', 'entry-sep-003', '641000-uuid', 2650000, 0, 'Salaires nets', NOW(), NOW()),
('line-sep-003-4', 'entry-sep-003', '512000-uuid', 0, 4050000, 'Paiement frais généraux', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Octobre 2025
INSERT INTO journal_entries (id, company_id, description, entry_date, status, created_at, updated_at) VALUES
('entry-oct-001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Ventes octobre 2025', '2025-10-15', 'posted', NOW(), NOW()),
('entry-oct-002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Achats octobre 2025', '2025-10-20', 'posted', NOW(), NOW()),
('entry-oct-003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Frais généraux octobre 2025', '2025-10-25', 'posted', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Lignes des écritures octobre
INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at) VALUES
('line-oct-001-1', 'entry-oct-001', '411000-uuid', 10000000, 0, 'Clients divers', NOW(), NOW()),
('line-oct-001-2', 'entry-oct-001', '701000-uuid', 0, 7000000, 'Ventes marchandises HT', NOW(), NOW()),
('line-oct-001-3', 'entry-oct-001', '445700-uuid', 0, 3000000, 'TVA collectée', NOW(), NOW()),
('line-oct-002-1', 'entry-oct-002', '607000-uuid', 4400000, 0, 'Achats marchandises HT', NOW(), NOW()),
('line-oct-002-2', 'entry-oct-002', '445600-uuid', 792000, 0, 'TVA déductible', NOW(), NOW()),
('line-oct-002-3', 'entry-oct-002', '401000-uuid', 0, 5192000, 'Fournisseurs divers', NOW(), NOW()),
('line-oct-003-1', 'entry-oct-003', '613000-uuid', 800000, 0, 'Loyer bureau', NOW(), NOW()),
('line-oct-003-2', 'entry-oct-003', '622000-uuid', 600000, 0, 'Honoraires comptables', NOW(), NOW()),
('line-oct-003-3', 'entry-oct-003', '641000-uuid', 2700000, 0, 'Salaires nets', NOW(), NOW()),
('line-oct-003-4', 'entry-oct-003', '512000-uuid', 0, 4100000, 'Paiement frais généraux', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Novembre 2025 (mois en cours)
INSERT INTO journal_entries (id, company_id, description, entry_date, status, created_at, updated_at) VALUES
('entry-nov-001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Ventes novembre 2025', '2025-11-01', 'posted', NOW(), NOW()),
('entry-nov-002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Achats novembre 2025', '2025-11-05', 'posted', NOW(), NOW()),
('entry-nov-003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Frais généraux novembre 2025', '2025-11-10', 'posted', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Lignes des écritures novembre
INSERT INTO journal_entry_lines (id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at) VALUES
('line-nov-001-1', 'entry-nov-001', '411000-uuid', 10500000, 0, 'Clients divers', NOW(), NOW()),
('line-nov-001-2', 'entry-nov-001', '701000-uuid', 0, 7350000, 'Ventes marchandises HT', NOW(), NOW()),
('line-nov-001-3', 'entry-nov-001', '445700-uuid', 0, 3150000, 'TVA collectée', NOW(), NOW()),
('line-nov-002-1', 'entry-nov-002', '607000-uuid', 4600000, 0, 'Achats marchandises HT', NOW(), NOW()),
('line-nov-002-2', 'entry-nov-002', '445600-uuid', 828000, 0, 'TVA déductible', NOW(), NOW()),
('line-nov-002-3', 'entry-nov-002', '401000-uuid', 0, 5428000, 'Fournisseurs divers', NOW(), NOW()),
('line-nov-003-1', 'entry-nov-003', '613000-uuid', 800000, 0, 'Loyer bureau', NOW(), NOW()),
('line-nov-003-2', 'entry-nov-003', '622000-uuid', 600000, 0, 'Honoraires comptables', NOW(), NOW()),
('line-nov-003-3', 'entry-nov-003', '641000-uuid', 2750000, 0, 'Salaires nets', NOW(), NOW()),
('line-nov-003-4', 'entry-nov-003', '512000-uuid', 0, 4150000, 'Paiement frais généraux', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Afficher un résumé des données créées
SELECT 
    'Dashboard BMS peuplé avec succès!' as message,
    c.name as entreprise,
    COUNT(DISTINCT je.id) as nb_ecritures,
    COUNT(DISTINCT a.id) as nb_comptes,
    SUM(jel.debit) as total_debit,
    SUM(jel.credit) as total_credit
FROM companies c
LEFT JOIN journal_entries je ON je.company_id = c.id
LEFT JOIN journal_entry_lines jel ON jel.journal_entry_id = je.id
LEFT JOIN accounts a ON a.company_id = c.id
WHERE c.id = '1805bc61-7cfd-44e9-8a63-17187bf05dc7'
GROUP BY c.name, c.id;
