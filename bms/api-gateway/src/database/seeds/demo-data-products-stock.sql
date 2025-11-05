-- ==========================================
-- PRODUITS ET MOUVEMENTS DE STOCK
-- ==========================================

BEGIN;

-- PRODUITS
INSERT INTO products (id, company_id, sku, name, category, unit_price, cost_price, stock_quantity, min_stock, is_active, created_at)
VALUES 
  ('p-0001-0000-0000-000000000001', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'SERV-COMPTA-001', 'Prestation comptable mensuelle', 'Services', 500000, 0, 0, 0, true, NOW()),
  ('p-0002-0000-0000-000000000002', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'SERV-AUDIT-001', 'Audit comptable', 'Services', 1200000, 0, 0, 0, true, NOW()),
  ('p-0003-0000-0000-0000-000003', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'SERV-FISC-001', 'Conseil fiscal', 'Services', 150000, 0, 0, 0, true, NOW()),
  ('p-0004-0000-0000-0000-000004', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'FORM-COMPTA-001', 'Formation comptabilité', 'Formation', 170000, 0, 0, 0, true, NOW()),
  ('p-0005-0000-0000-0000-000005', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'FOUR-BUR-001', 'Ramette papier A4', 'Fournitures', 3500, 2800, 150, 50, true, NOW()),
  ('p-0006-0000-0000-0000-000006', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'FOUR-BUR-002', 'Stylos (boîte de 50)', 'Fournitures', 8500, 6500, 80, 20, true, NOW()),
  ('p-0007-0000-0000-0000-000007', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'FOUR-BUR-003', 'Classeurs', 'Fournitures', 1200, 900, 200, 50, true, NOW()),
  ('p-0008-0000-0000-0000-000008', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'INFO-001', 'Ordinateur portable', 'Informatique', 450000, 380000, 12, 5, true, NOW()),
  ('p-0009-0000-0000-0000-000009', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'INFO-002', 'Imprimante laser', 'Informatique', 180000, 150000, 8, 3, true, NOW()),
  ('p-0010-0000-0000-0000-000010', '1805bc61-7cfd-44e9-8a63-17187bf05dc7', 'INFO-003', 'Souris sans fil', 'Informatique', 12000, 9000, 45, 15, true, NOW())
ON CONFLICT (company_id, sku) DO NOTHING;

-- MOUVEMENTS DE STOCK
INSERT INTO stock_movements (product_id, movement_date, type, quantity, reference, notes, created_at)
VALUES 
  -- Entrées de stock
  ('p-0005-0000-0000-0000-000005', '2024-01-10', 'in', 200, 'BON-ENT-001', 'Réception commande fournisseur', NOW()),
  ('p-0006-0000-0000-0000-000006', '2024-01-10', 'in', 100, 'BON-ENT-001', 'Réception commande fournisseur', NOW()),
  ('p-0007-0000-0000-0000-000007', '2024-01-10', 'in', 250, 'BON-ENT-001', 'Réception commande fournisseur', NOW()),
  ('p-0008-0000-0000-0000-000008', '2024-01-15', 'in', 15, 'BON-ENT-002', 'Achat matériel informatique', NOW()),
  ('p-0009-0000-0000-0000-000009', '2024-01-15', 'in', 10, 'BON-ENT-002', 'Achat matériel informatique', NOW()),
  ('p-0010-0000-0000-0000-000010', '2024-01-15', 'in', 50, 'BON-ENT-002', 'Achat matériel informatique', NOW()),
  
  -- Sorties de stock
  ('p-0005-0000-0000-0000-000005', '2024-01-20', 'out', -30, 'BON-SORT-001', 'Consommation interne', NOW()),
  ('p-0006-0000-0000-0000-000006', '2024-01-22', 'out', -15, 'BON-SORT-002', 'Consommation interne', NOW()),
  ('p-0007-0000-0000-0000-000007', '2024-01-25', 'out', -40, 'BON-SORT-003', 'Consommation interne', NOW()),
  ('p-0008-0000-0000-0000-000008', '2024-02-01', 'out', -3, 'BON-SORT-004', 'Affectation employés', NOW()),
  ('p-0009-0000-0000-0000-000009', '2024-02-01', 'out', -2, 'BON-SORT-004', 'Affectation employés', NOW()),
  ('p-0010-0000-0000-0000-000010', '2024-02-01', 'out', -5, 'BON-SORT-004', 'Affectation employés', NOW()),
  
  -- Ajustements
  ('p-0005-0000-0000-0000-000005', '2024-02-10', 'adjustment', -20, 'ADJ-001', 'Inventaire - correction', NOW()),
  ('p-0007-0000-0000-0000-000007', '2024-02-10', 'adjustment', -10, 'ADJ-001', 'Inventaire - correction', NOW())
ON CONFLICT DO NOTHING;

COMMIT;
