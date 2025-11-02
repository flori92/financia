-- Script SQL pour insérer des données de test BMS
-- Usage: psql -h localhost -U bms -d bms -f scripts/insert-test-data.sql

-- Données de test pour la société test-company
DO $$
DECLARE
    company_id TEXT := 'test-company';
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Supprimer les anciennes données de test
    DELETE FROM journal_entry_lines WHERE journal_entry_id IN (
        SELECT id FROM journal_entries WHERE company_id = company_id
    );
    DELETE FROM journal_entries WHERE company_id = company_id;
    
    RAISE NOTICE '🌱 Création des données de test BMS...';
    
    -- Créer des écritures comptables sur 6 mois pour avoir des graphiques
    FOR month_offset IN 0..5 LOOP
        FOR entry_num IN 1..10 LOOP
            DECLARE
                entry_date DATE := current_date - (month_offset * INTERVAL '1 month') - (entry_num * INTERVAL '1 day');
                entry_id UUID;
                amount NUMERIC := 500000 + (random() * 2000000)::NUMERIC;
                vat NUMERIC := amount * 0.18;
            BEGIN
                -- Créer l'écriture (vente ou achat)
                INSERT INTO journal_entries (
                    id, company_id, entry_number, entry_date, description, 
                    status, total_debit, total_credit, created_at, updated_at
                ) VALUES (
                    gen_random_uuid(),
                    company_id,
                    'E' || to_char(entry_date, 'YYMM') || LPAD(entry_num::TEXT, 4, '0'),
                    entry_date,
                    CASE WHEN random() > 0.3 THEN 'Vente marchandises' ELSE 'Achat marchandises' END,
                    'posted',
                    amount + vat,
                    amount + vat,
                    NOW(),
                    NOW()
                ) RETURNING id INTO entry_id;
                
                -- Lignes d'écriture pour une vente
                IF random() > 0.3 THEN
                    -- Débit client
                    INSERT INTO journal_entry_lines (
                        id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), entry_id, 
                        (SELECT id FROM accounts WHERE company_id = company_id AND account_number = '411'),
                        amount + vat, 0, 'CLIENT VENTE', NOW(), NOW()
                    );
                    
                    -- Crédit vente
                    INSERT INTO journal_entry_lines (
                        id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), entry_id,
                        (SELECT id FROM accounts WHERE company_id = company_id AND account_number = '707'),
                        0, amount, 'VENTE MARCHANDISES', NOW(), NOW()
                    );
                    
                    -- TVA collectée
                    INSERT INTO journal_entry_lines (
                        id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), entry_id,
                        (SELECT id FROM accounts WHERE company_id = company_id AND account_number = '4457'),
                        0, vat, 'TVA COLLECTEE', NOW(), NOW()
                    );
                ELSE
                    -- Achat
                    INSERT INTO journal_entry_lines (
                        id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), entry_id,
                        (SELECT id FROM accounts WHERE company_id = company_id AND account_number = '607'),
                        amount, 0, 'ACHAT MARCHANDISES', NOW(), NOW()
                    );
                    
                    INSERT INTO journal_entry_lines (
                        id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), entry_id,
                        (SELECT id FROM accounts WHERE company_id = company_id AND account_number = '4456'),
                        vat, 0, 'TVA DEDUCTIBLE', NOW(), NOW()
                    );
                    
                    INSERT INTO journal_entry_lines (
                        id, journal_entry_id, account_id, debit, credit, label, created_at, updated_at
                    ) VALUES (
                        gen_random_uuid(), entry_id,
                        (SELECT id FROM accounts WHERE company_id = company_id AND account_number = '401'),
                        0, amount + vat, 'FOURNISSEUR', NOW(), NOW()
                    );
                END IF;
            END LOOP;
        END LOOP;
        
        RAISE NOTICE '✅ Données de test créées avec succès !';
        RAISE NOTICE '📊 ~60 écritures comptables sur 6 mois';
        RAISE NOTICE '🌐 Actualisez http://localhost:3000/accountant pour voir les graphiques';
END $$;

-- Afficher un résumé
SELECT 
    'journal_entries' as table_name,
    COUNT(*) as count,
    MIN(entryDate) as oldest_date,
    MAX(entryDate) as newest_date
FROM journal_entries 
WHERE company_id = 'test-company'

UNION ALL

SELECT 
    'journal_entry_lines' as table_name,
    COUNT(*) as count,
    NULL as oldest_date,
    NULL as newest_date
FROM journal_entry_lines 
WHERE journal_entry_id IN (
    SELECT id FROM journal_entries WHERE company_id = 'test-company'
);
