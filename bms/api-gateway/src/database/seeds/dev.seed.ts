import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { seedPermissions } from './permissions.seed';
import { assignRolesToUsers } from './assign-roles.seed';

/**
 * Seed data for development
 * Run with: npm run seed
 */
export async function runDevSeed(dataSource: DataSource) {
  console.log('🌱 Starting development seed...');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Créer des utilisateurs de test
    console.log('Creating test users...');
    
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Admin
    const [admin] = await queryRunner.query(`
      INSERT INTO users (email, password, first_name, last_name, role, phone, email_verified, is_active)
      VALUES ('admin@bms.bj', $1, 'Admin', 'BMS', 'admin', '+22997000001', true, true)
      ON CONFLICT (email) DO UPDATE SET role = 'admin'
      RETURNING id;
    `, [hashedPassword]);
    console.log('✅ Admin created:', admin.id);

    // Tax Admin
    const [taxAdmin] = await queryRunner.query(`
      INSERT INTO users (email, password, first_name, last_name, role, phone, email_verified, is_active)
      VALUES ('taxadmin@dgi.bj', $1, 'Tax', 'Admin', 'tax_admin', '+22997000002', true, true)
      ON CONFLICT (email) DO UPDATE SET role = 'tax_admin'
      RETURNING id;
    `, [hashedPassword]);
    console.log('✅ Tax Admin created:', taxAdmin.id);

    // Accountant
    const [accountant] = await queryRunner.query(`
      INSERT INTO users (email, password, first_name, last_name, role, phone, email_verified, is_active)
      VALUES ('comptable@cabinet.bj', $1, 'Jean', 'Comptable', 'accountant', '+22997000003', true, true)
      ON CONFLICT (email) DO UPDATE SET role = 'accountant'
      RETURNING id;
    `, [hashedPassword]);
    console.log('✅ Accountant created:', accountant.id);

    // Entrepreneur
    const [entrepreneur] = await queryRunner.query(`
      INSERT INTO users (email, password, first_name, last_name, role, phone, email_verified, is_active)
      VALUES ('entrepreneur@test.bj', $1, 'Marie', 'Entrepreneur', 'user', '+22997000004', true, true)
      ON CONFLICT (email) DO UPDATE SET role = 'user'
      RETURNING id;
    `, [hashedPassword]);
    console.log('✅ Entrepreneur created:', entrepreneur.id);

    // 2. Créer des entreprises
    console.log('Creating test companies...');
    
    const [company1] = await queryRunner.query(`
      INSERT INTO companies (
        name, industry, country, city, address_line1, phone, email,
        default_currency, nif_number, registration_number, legal_name
      )
      VALUES (
        'Restaurant Le Béninois', 'restaurant', 'BJ', 'Cotonou',
        'Akpakpa Centre', '+22997111111', 'contact@lebeninois.bj',
        'XOF', 'BJ1234567890', 'RB/COT/2024/B/123', 'Restaurant Le Béninois'
      )
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);
    const company1Id = company1?.id || (await queryRunner.query(`SELECT id FROM companies WHERE name = $1 LIMIT 1;`, ['Restaurant Le Béninois']))?.[0]?.id;
    if (company1Id) {
      console.log('✅ Company 1 created:', company1Id);

      // Associer l'entreprise aux utilisateurs
      await queryRunner.query(`
        INSERT INTO company_users (company_id, user_id, role, is_active)
        VALUES ($1, $2, 'owner', true), ($1, $3, 'accountant', true), ($1, $4, 'admin', true)
        ON CONFLICT (company_id, user_id) DO NOTHING;
      `, [company1Id, entrepreneur.id, accountant.id, admin.id]);
      console.log('✅ Users linked to Company 1');

      // 3. Créer des factures
      console.log('Creating test invoices...');
      
      const [invoice1] = await queryRunner.query(`
        INSERT INTO invoices (
          company_id, invoice_number, invoice_type, invoice_date, due_date,
          party_name, party_phone, party_email,
          subtotal, tax_amount, total_amount, paid_amount, outstanding_amount,
          status, payment_status, currency
        )
        VALUES (
          $1, 'FINV-202410-0001', 'sales', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days',
          'Hôtel Palm Beach', '+22997222222', 'compta@palmbeach.bj',
          50000, 9000, 59000, 0, 59000,
          'submitted', 'unpaid', 'XOF'
        )
        ON CONFLICT (invoice_number) DO NOTHING
        RETURNING id;
      `, [company1Id]);
      const invoice1Id = invoice1?.id || (await queryRunner.query(`SELECT id FROM invoices WHERE invoice_number = $1 LIMIT 1;`, ['FINV-202410-0001']))?.[0]?.id;
      
      if (invoice1Id) {
        console.log('✅ Invoice 1 created:', invoice1Id);

        // Ajouter des items à la facture (idempotent)
        await queryRunner.query(`
          INSERT INTO invoice_items (invoice_id, item_name, description, quantity, unit_price, tax_percent, tax_amount, line_total)
          SELECT $1, 'Menu Buffet x20 personnes', 'Prestation traiteur', 20, 2500, 18, 9000, 59000
          WHERE NOT EXISTS (
            SELECT 1 FROM invoice_items WHERE invoice_id = $1 AND item_name = 'Menu Buffet x20 personnes'
          );
        `, [invoice1Id]);
        console.log('✅ Invoice items created');
      }

      const [invoice2] = await queryRunner.query(`
        INSERT INTO invoices (
          company_id, invoice_number, invoice_type, invoice_date, due_date,
          party_name, party_phone, party_email,
          subtotal, tax_amount, total_amount, paid_amount, outstanding_amount,
          status, payment_status, currency, paid_at
        )
        VALUES (
          $1, 'FINV-202410-0002', 'sales', CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '25 days',
          'Société ABC', '+22997333333', 'abc@test.bj',
          100000, 18000, 118000, 118000, 0,
          'paid', 'paid', 'XOF', CURRENT_TIMESTAMP
        )
        ON CONFLICT (invoice_number) DO NOTHING
        RETURNING id;
      `, [company1Id]);
      const invoice2Id = invoice2?.id || (await queryRunner.query(`SELECT id FROM invoices WHERE invoice_number = $1 LIMIT 1;`, ['FINV-202410-0002']))?.[0]?.id;
      if (invoice2Id) {
        console.log('✅ Invoice 2 (paid) created:', invoice2Id);
      }
    }

    // 3.b. Créer d'autres entreprises (multi-sociétés) avec données
    console.log('Creating additional companies...');

    const [company2] = await queryRunner.query(`
      INSERT INTO companies (
        name, industry, country, city, address_line1, phone, email,
        default_currency, nif_number, registration_number, legal_name
      )
      VALUES (
        'Tech Afrique', 'technology', 'BJ', 'Abomey-Calavi',
        'Zopah', '+22997444444', 'contact@techafrique.bj',
        'XOF', 'BJ9876543210', 'RB/ABC/2024/T/456', 'Tech Afrique'
      )
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);
    const company2Id = company2?.id || (await queryRunner.query(`SELECT id FROM companies WHERE name = $1 LIMIT 1;`, ['Tech Afrique']))?.[0]?.id;
    if (company2Id) {
      console.log('✅ Company 2 created:', company2Id);

      // Associer l'entreprise aux utilisateurs
      await queryRunner.query(`
        INSERT INTO company_users (company_id, user_id, role, is_active)
        VALUES ($1, $2, 'owner', true), ($1, $3, 'accountant', true)
        ON CONFLICT (company_id, user_id) DO NOTHING;
      `, [company2Id, entrepreneur.id, accountant.id]);
      console.log('✅ Users linked to Company 2');
      const [inv2_1] = await queryRunner.query(`
        INSERT INTO invoices (
          company_id, invoice_number, invoice_type, invoice_date, due_date,
          party_name, party_phone, party_email,
          subtotal, tax_amount, total_amount, paid_amount, outstanding_amount,
          status, payment_status, currency
        )
        VALUES (
          $1, 'FINV-202410-1001', 'sales', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '20 days',
          'Global Services', '+22997555555', 'gs@services.bj',
          300000, 54000, 354000, 0, 354000,
          'submitted', 'unpaid', 'XOF'
        )
        ON CONFLICT (invoice_number) DO NOTHING
        RETURNING id;
      `, [company2Id]);

      const inv2_1_Id = inv2_1?.id || (await queryRunner.query(`SELECT id FROM invoices WHERE invoice_number = $1 LIMIT 1;`, ['FINV-202410-1001']))?.[0]?.id;

      if (inv2_1_Id) {
        await queryRunner.query(`
          INSERT INTO invoice_items (invoice_id, item_name, description, quantity, unit_price, tax_percent, tax_amount, line_total)
          SELECT $1, 'Abonnement plateforme SaaS (3 mois)', 'Licence trimestrielle', 1, 300000, 18, 54000, 354000
          WHERE NOT EXISTS (
            SELECT 1 FROM invoice_items WHERE invoice_id = $1 AND item_name = 'Abonnement plateforme SaaS (3 mois)'
          );
        `, [inv2_1_Id]);
      }

      // Paiement soumis pour validation
      await queryRunner.query(`
        INSERT INTO payments (
          payment_number, payment_date, amount, allocated_amount, unallocated_amount, currency,
          payment_method, reference, party_type, party_id, company_id, status, created_by
        )
        VALUES (
          'PAY-DEV-TA-0001', CURRENT_DATE - INTERVAL '1 day', 150000, 0, 150000, 'XOF',
          'bank_transfer', 'VIR-TA-001', 'customer', '00000000-0000-0000-0000-000000000000', $1, 'submitted', $2
        )
        ON CONFLICT (payment_number) DO NOTHING;
      `, [company2Id, accountant.id]);

      // Dépenses (fournisseurs) pour matérialiser des sorties de trésorerie
      await queryRunner.query(`
        INSERT INTO payments (
          payment_number, payment_date, amount, allocated_amount, unallocated_amount, currency,
          payment_method, reference, party_type, party_id, company_id, status, created_by
        )
        VALUES 
          ('SUP-DEV-TA-0001', CURRENT_DATE - INTERVAL '3 days', 85000, 0, 85000, 'XOF',
           'cash', 'F-ACH-TA-001', 'supplier', '00000000-0000-0000-0000-000000000000', $1, 'draft', $2),
          ('SUP-DEV-TA-0002', CURRENT_DATE - INTERVAL '12 days', 120000, 0, 120000, 'XOF',
           'bank_transfer', 'F-ACH-TA-002', 'supplier', '00000000-0000-0000-0000-000000000000', $1, 'draft', $2)
        ON CONFLICT (payment_number) DO NOTHING;
      `, [company2Id, accountant.id]);
    }

    const [company3] = await queryRunner.query(`
      INSERT INTO companies (
        name, industry, country, city, address_line1, phone, email,
        default_currency, nif_number, registration_number, legal_name
      )
      VALUES (
        'Global Services SARL', 'services', 'BJ', 'Porto-Novo',
        'Quartier Administratif', '+22997666666', 'contact@globalsarl.bj',
        'XOF', 'BJ4567890123', 'RB/PN/2024/G/789', 'Global Services SARL'
      )
      ON CONFLICT DO NOTHING
      RETURNING id;
    `);
    const company3Id = company3?.id || (await queryRunner.query(`SELECT id FROM companies WHERE name = $1 LIMIT 1;`, ['Global Services SARL']))?.[0]?.id;
    if (company3Id) {
      console.log('✅ Company 3 created:', company3Id);

      // Associer l'entreprise aux utilisateurs
      await queryRunner.query(`
        INSERT INTO company_users (company_id, user_id, role, is_active)
        VALUES ($1, $2, 'owner', true), ($1, $3, 'accountant', true)
        ON CONFLICT (company_id, user_id) DO NOTHING;
      `, [company3Id, entrepreneur.id, accountant.id]);
      console.log('✅ Users linked to Company 3');
      const [inv3_1] = await queryRunner.query(`
        INSERT INTO invoices (
          company_id, invoice_number, invoice_type, invoice_date, due_date,
          party_name, party_phone, party_email,
          subtotal, tax_amount, total_amount, paid_amount, outstanding_amount,
          status, payment_status, currency
        )
        VALUES (
          $1, 'FINV-202410-2001', 'sales', CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE - INTERVAL '5 days',
          'Société ABC', '+22997333333', 'abc@test.bj',
          190000, 34200, 224200, 0, 224200,
          'overdue', 'unpaid', 'XOF'
        )
        ON CONFLICT (invoice_number) DO NOTHING
        RETURNING id;
      `, [company3Id]);

      const inv3_1_Id = inv3_1?.id || (await queryRunner.query(`SELECT id FROM invoices WHERE invoice_number = $1 LIMIT 1;`, ['FINV-202410-2001']))?.[0]?.id;

      if (inv3_1_Id) {
        await queryRunner.query(`
          INSERT INTO invoice_items (invoice_id, item_name, description, quantity, unit_price, tax_percent, tax_amount, line_total)
          SELECT $1, 'Prestations de conseil', 'Mission conseil', 1, 190000, 18, 34200, 224200
          WHERE NOT EXISTS (
            SELECT 1 FROM invoice_items WHERE invoice_id = $1 AND item_name = 'Prestations de conseil'
          );
        `, [inv3_1_Id]);
      }

      // Paiement payé (pour KPIs encaissements)
      await queryRunner.query(`
        INSERT INTO payments (
          payment_number, payment_date, amount, allocated_amount, unallocated_amount, currency,
          payment_method, reference, party_type, party_id, company_id, status, created_by
        )
        VALUES (
          'PAY-DEV-GS-0001', CURRENT_DATE - INTERVAL '2 days', 118000, 0, 118000, 'XOF',
          'cash', 'CASH-GS-001', 'customer', '00000000-0000-0000-0000-000000000000', $1, 'draft', $2
        )
        ON CONFLICT (payment_number) DO NOTHING;
      `, [company3Id, entrepreneur.id]);

      // Dépenses (fournisseurs) pour matérialiser des sorties de trésorerie
      await queryRunner.query(`
        INSERT INTO payments (
          payment_number, payment_date, amount, allocated_amount, unallocated_amount, currency,
          payment_method, reference, party_type, party_id, company_id, status, created_by
        )
        VALUES 
          ('SUP-DEV-GS-0001', CURRENT_DATE - INTERVAL '6 days', 64000, 0, 64000, 'XOF',
           'cash', 'F-ACH-GS-001', 'supplier', '00000000-0000-0000-0000-000000000000', $1, 'draft', $2),
          ('SUP-DEV-GS-0002', CURRENT_DATE - INTERVAL '20 days', 45000, 0, 45000, 'XOF',
           'mobile_money', 'F-ACH-GS-002', 'supplier', '00000000-0000-0000-0000-000000000000', $1, 'draft', $2)
        ON CONFLICT (payment_number) DO NOTHING;
      `, [company3Id, entrepreneur.id]);
    }

    // 4. Créer des comptes OHADA de test (Plan SYSCOHADA révisé 2017)
    console.log('Creating test OHADA accounts...');
    
    const accounts = [
      // Classe 1: Comptes de ressources durables
      { code: '101', name: 'Capital social', syscohadaClass: 1, accountType: 'equity' },
      { code: '106', name: 'Écarts de réévaluation', syscohadaClass: 1, accountType: 'equity' },
      { code: '11', name: 'Réserves', syscohadaClass: 1, accountType: 'equity' },
      { code: '12', name: 'Report à nouveau', syscohadaClass: 1, accountType: 'equity' },
      { code: '13', name: 'Résultat net de l\'exercice', syscohadaClass: 1, accountType: 'equity' },
      { code: '16', name: 'Emprunts et dettes assimilées', syscohadaClass: 1, accountType: 'liability' },
      
      // Classe 2: Comptes d'actif immobilisé
      { code: '21', name: 'Immobilisations incorporelles', syscohadaClass: 2, accountType: 'asset' },
      { code: '22', name: 'Terrains', syscohadaClass: 2, accountType: 'asset' },
      { code: '23', name: 'Bâtiments, installations techniques et agencements', syscohadaClass: 2, accountType: 'asset' },
      { code: '24', name: 'Matériel', syscohadaClass: 2, accountType: 'asset' },
      { code: '26', name: 'Titres de participation', syscohadaClass: 2, accountType: 'asset' },
      
      // Classe 3: Comptes de stocks
      { code: '31', name: 'Marchandises', syscohadaClass: 3, accountType: 'asset' },
      { code: '32', name: 'Matières premières et fournitures', syscohadaClass: 3, accountType: 'asset' },
      { code: '33', name: 'Autres approvisionnements', syscohadaClass: 3, accountType: 'asset' },
      { code: '36', name: 'Produits finis', syscohadaClass: 3, accountType: 'asset' },
      
      // Classe 4: Comptes de tiers
      { code: '401', name: 'Fournisseurs', syscohadaClass: 4, accountType: 'liability' },
      { code: '411', name: 'Clients', syscohadaClass: 4, accountType: 'asset' },
      { code: '421', name: 'Personnel - Avances et acomptes', syscohadaClass: 4, accountType: 'liability' },
      { code: '422', name: 'Personnel - Rémunérations dues', syscohadaClass: 4, accountType: 'liability' },
      { code: '43', name: 'Organismes sociaux', syscohadaClass: 4, accountType: 'liability' },
      { code: '44', name: 'État et collectivités publiques', syscohadaClass: 4, accountType: 'liability' },
      { code: '46', name: 'Débiteurs et créditeurs divers', syscohadaClass: 4, accountType: 'asset' },
      
      // Classe 5: Comptes de trésorerie
      { code: '512', name: 'Banque', syscohadaClass: 5, accountType: 'asset' },
      { code: '52', name: 'Titres de placement', syscohadaClass: 5, accountType: 'asset' },
      { code: '571', name: 'Caisse', syscohadaClass: 5, accountType: 'asset' },
      { code: '581', name: 'Virements internes', syscohadaClass: 5, accountType: 'asset' },
      
      // Classe 6: Comptes de charges
      { code: '601', name: 'Achats de marchandises', syscohadaClass: 6, accountType: 'expense' },
      { code: '605', name: 'Autres achats', syscohadaClass: 6, accountType: 'expense' },
      { code: '61', name: 'Transports', syscohadaClass: 6, accountType: 'expense' },
      { code: '62', name: 'Services extérieurs', syscohadaClass: 6, accountType: 'expense' },
      { code: '63', name: 'Autres services extérieurs', syscohadaClass: 6, accountType: 'expense' },
      { code: '64', name: 'Impôts et taxes', syscohadaClass: 6, accountType: 'expense' },
      { code: '66', name: 'Charges de personnel', syscohadaClass: 6, accountType: 'expense' },
      { code: '67', name: 'Frais financiers', syscohadaClass: 6, accountType: 'expense' },
      { code: '68', name: 'Dotations aux amortissements', syscohadaClass: 6, accountType: 'expense' },
      
      // Classe 7: Comptes de produits
      { code: '701', name: 'Ventes de marchandises', syscohadaClass: 7, accountType: 'revenue' },
      { code: '702', name: 'Ventes de produits finis', syscohadaClass: 7, accountType: 'revenue' },
      { code: '706', name: 'Services vendus', syscohadaClass: 7, accountType: 'revenue' },
      { code: '707', name: 'Produits accessoires', syscohadaClass: 7, accountType: 'revenue' },
      { code: '71', name: 'Subventions d\'exploitation', syscohadaClass: 7, accountType: 'revenue' },
      { code: '77', name: 'Revenus financiers', syscohadaClass: 7, accountType: 'revenue' },
      { code: '78', name: 'Reprises de charges', syscohadaClass: 7, accountType: 'revenue' },
      
      // Classe 8: Comptes des autres charges et autres produits
      { code: '81', name: 'Valeurs comptables des cessions d\'immobilisations', syscohadaClass: 8, accountType: 'expense' },
      { code: '82', name: 'Produits des cessions d\'immobilisations', syscohadaClass: 8, accountType: 'revenue' },
    ];

    const accountCompanyId = company1Id || company2Id || company3Id;
    if (accountCompanyId) {
      for (const account of accounts) {
        await queryRunner.query(`
          INSERT INTO accounts (
            "accountNumber", "accountName", "syscohadaClass", "accountType", "currency", "companyId"
          )
          VALUES ($1, $2, $3, $4, 'XOF', $5)
          ON CONFLICT ("accountNumber") DO NOTHING;
        `, [account.code, account.name, account.syscohadaClass, account.accountType, accountCompanyId]);
      }
      console.log('✅ OHADA accounts created');
    } else {
      console.log('⚠️ Skipped OHADA accounts creation: no company available');
    }

    // 5. Créer une demande NIF de test
    console.log('Creating test NIF request...');
    
    if (company1Id && entrepreneur.id) {
      await queryRunner.query(`
        INSERT INTO nif_requests (
          user_id, company_id, business_name, business_type,
          address, city, phone, email, status,
          documents
        )
        VALUES (
          $1, $2, 'Restaurant Le Béninois', 'limited_company',
          'Akpakpa Centre', 'Cotonou', '+22997111111', 'contact@lebeninois.bj',
          'pending',
          '{"identityCard": "scan_id.pdf", "proofOfAddress": "proof.pdf"}'::jsonb
        )
        ON CONFLICT DO NOTHING;
      `, [entrepreneur.id, company1Id]);
      console.log('✅ NIF request created');
    }

    await queryRunner.commitTransaction();
    // Seed permissions et rôles RBAC
    await seedPermissions(dataSource);
    
    // Assigner les rôles aux utilisateurs
    await assignRolesToUsers(dataSource);
    
    console.log('✅ Development seed completed successfully!');
    
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@bms.bj / password123');
    console.log('Tax Admin: taxadmin@dgi.bj / password123');
    console.log('Accountant: comptable@cabinet.bj / password123 (avec rôle RBAC)');
    console.log('Entrepreneur: entrepreneur@test.bj / password123');
    
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
