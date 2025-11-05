-- ==========================================
-- CLIENTS ET FOURNISSEURS
-- ==========================================

BEGIN;

-- CLIENTS
INSERT INTO customers (id, company_id, name, legal_name, nif, email, phone, address, payment_terms, credit_limit, is_active, created_at)
VALUES 
  ('c1-000000-0000-0000-000000000001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Hôtel Palm Beach', 'Palm Beach SARL', 'BJ2023001111', 'compta@palmbeach.bj', '+22997111111', 'Boulevard de la Marina, Cotonou', 30, 5000000, true, NOW()),
  ('c2-000000-0000-0000-000000000002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Société ABC Trading', 'ABC Trading SA', 'BJ2023002222', 'contact@abctrading.bj', '+22997222222', 'Akpakpa, Cotonou', 45, 10000000, true, NOW()),
  ('c3-000000-0000-0000-000000000003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Restaurant Le Béninois', 'Le Béninois SARL', 'BJ2023003333', 'resto@beninois.bj', '+22997333333', 'Fidjrossè, Cotonou', 30, 2000000, true, NOW()),
  ('c4-000000-0000-0000-000000000004', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Pharmacie Centrale', 'Pharmacie Centrale', 'BJ2023004444', 'pharma@centrale.bj', '+22997444444', 'Centre-ville, Cotonou', 15, 3000000, true, NOW()),
  ('c5-000000-0000-0000-000000000005', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Supermarché Erevan', 'Erevan SARL', 'BJ2023005555', 'erevan@shop.bj', '+22997555555', 'Cadjehoun, Cotonou', 30, 8000000, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- FOURNISSEURS
INSERT INTO suppliers (id, company_id, name, legal_name, nif, email, phone, address, payment_terms, is_active, created_at)
VALUES 
  ('s1-000000-0000-0000-000000000001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Distributeur Alimentaire BJ', 'Distrib Alim SA', 'BJ2022001111', 'ventes@distribalim.bj', '+22996111111', 'Zone Industrielle, Cotonou', 30, true, NOW()),
  ('s2-000000-0000-0000-000000000002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Fournitures Bureau Plus', 'Bureau Plus SARL', 'BJ2022002222', 'contact@bureauplus.bj', '+22996222222', 'Akpakpa, Cotonou', 45, true, NOW()),
  ('s3-000000-0000-0000-000000000003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Électricité Services', 'Elec Services', 'BJ2022003333', 'elec@services.bj', '+22996333333', 'Godomey, Cotonou', 30, true, NOW()),
  ('s4-000000-0000-0000-000000000004', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Imprimerie Moderne', 'Imprim Moderne SA', 'BJ2022004444', 'print@moderne.bj', '+22996444444', 'Centre-ville, Cotonou', 30, true, NOW()),
  ('s5-000000-0000-0000-000000000005', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'Transport Express', 'Express Transport', 'BJ2022005555', 'express@transport.bj', '+22996555555', 'Cadjehoun, Cotonou', 15, true, NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;
