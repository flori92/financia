-- ==========================================
-- BMS - DONNÉES DE DÉMONSTRATION COMPLÈTES
-- ==========================================
-- Ce script crée des données réalistes et modulables
-- pour tous les modules BMS
-- ==========================================

BEGIN;

-- ==========================================
-- 1. ENTREPRISES (Companies)
-- ==========================================

INSERT INTO companies (id, name, legal_form, nif, address, country, currency, fiscal_year_end, created_at)
VALUES 
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Cabinet Comptable Excellence', 'SARL', 'BJ2024001234', 'Akpakpa, Cotonou', 'BJ', 'XOF', '2024-12-31', NOW()),
  ('2805bc61-7cfd-44e9-8a63-17187bf05dc8', 'Restaurant Le Palmier', 'SARL', 'BJ2024005678', 'Fidjrossè, Cotonou', 'BJ', 'XOF', '2024-12-31', NOW()),
  ('3805bc61-7cfd-44e9-8a63-17187bf05dc9', 'Tech Solutions Afrique', 'SA', 'BJ2024009012', 'Cadjehoun, Cotonou', 'BJ', 'XOF', '2024-12-31', NOW())
ON CONFLICT (id) DO NOTHING;

-- ==========================================
-- 2. UTILISATEURS (Users)
-- ==========================================

INSERT INTO users (id, company_id, email, password, first_name, last_name, phone, role, is_active, email_verified, created_at)
VALUES 
  ('u1-admin-000-0000-000000000001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'admin@bms.bj', '$2b$10$rKvVPZH8qXqJ5vZ5Z5Z5ZeX5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Admin', 'BMS', '+22997000001', 'admin', true, true, NOW()),
  ('u2-comptable-0-0000-000000000002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'comptable@cabinet.bj', '$2b$10$rKvVPZH8qXqJ5vZ5Z5Z5ZeX5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Jean', 'Dupont', '+22997000002', 'accountant', true, true, NOW()),
  ('u3-entrepreneur-0000-000000000003', '2805bc61-7cfd-44e9-8a63-17187bf05dc8', 'entrepreneur@test.bj', '$2b$10$rKvVPZH8qXqJ5vZ5Z5Z5ZeX5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Marie', 'Koffi', '+22997000003', 'user', true, true, NOW()),
  ('u4-taxadmin-00-0000-000000000004', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'taxadmin@dgi.bj', '$2b$10$rKvVPZH8qXqJ5vZ5Z5Z5ZeX5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z', 'Tax', 'Admin', '+22997000004', 'tax_admin', true, true, NOW())
ON CONFLICT (email) DO NOTHING;

-- ==========================================
-- 3. PLAN COMPTABLE SYSCOHADA
-- ==========================================

INSERT INTO accounts (company_id, account_number, label, account_type, syscohada_class, is_active)
VALUES 
  -- Classe 1: Capitaux
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '101', 'Capital social', 'equity', 1, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '106', 'Réserves', 'equity', 1, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '12', 'Report à nouveau', 'equity', 1, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '13', 'Résultat net', 'equity', 1, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '16', 'Emprunts', 'liability', 1, true),
  
  -- Classe 2: Immobilisations
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '21', 'Immobilisations incorporelles', 'asset', 2, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '22', 'Terrains', 'asset', 2, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '23', 'Bâtiments', 'asset', 2, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '24', 'Matériel', 'asset', 2, true),
  
  -- Classe 3: Stocks
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '31', 'Marchandises', 'asset', 3, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '32', 'Matières premières', 'asset', 3, true),
  
  -- Classe 4: Tiers
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '401', 'Fournisseurs', 'liability', 4, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '411', 'Clients', 'asset', 4, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '421', 'Personnel - Rémunérations dues', 'liability', 4, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '43', 'Organismes sociaux', 'liability', 4, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '445', 'État - TVA', 'liability', 4, true),
  
  -- Classe 5: Trésorerie
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '512', 'Banques', 'asset', 5, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '571', 'Caisse', 'asset', 5, true),
  
  -- Classe 6: Charges
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '601', 'Achats de marchandises', 'expense', 6, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '605', 'Autres achats', 'expense', 6, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '61', 'Transports', 'expense', 6, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '62', 'Services extérieurs', 'expense', 6, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '63', 'Autres services', 'expense', 6, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '64', 'Impôts et taxes', 'expense', 6, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '66', 'Charges de personnel', 'expense', 6, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '67', 'Frais financiers', 'expense', 6, true),
  
  -- Classe 7: Produits
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '701', 'Ventes de marchandises', 'revenue', 7, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '706', 'Services vendus', 'revenue', 7, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '707', 'Produits accessoires', 'revenue', 7, true),
  ('1805bc61-7cfd-44e9-8a63-17187bf05dc7', '77', 'Revenus financiers', 'revenue', 7, true)
ON CONFLICT (company_id, account_number) DO NOTHING;

COMMIT;
