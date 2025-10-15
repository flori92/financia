import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

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
    
    if (company1) {
      console.log('✅ Company 1 created:', company1.id);

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
        RETURNING id;
      `, [company1.id]);
      
      if (invoice1) {
        console.log('✅ Invoice 1 created:', invoice1.id);

        // Ajouter des items à la facture
        await queryRunner.query(`
          INSERT INTO invoice_items (invoice_id, item_name, description, quantity, unit_price, tax_percent, tax_amount, line_total)
          VALUES 
            ($1, 'Menu Buffet x20 personnes', 'Prestation traiteur', 20, 2500, 18, 9000, 59000);
        `, [invoice1.id]);
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
        RETURNING id;
      `, [company1.id]);
      
      if (invoice2) {
        console.log('✅ Invoice 2 (paid) created:', invoice2.id);
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

    if (company2) {
      console.log('✅ Company 2 created:', company2.id);
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
        RETURNING id;
      `, [company2.id]);

      if (inv2_1) {
        await queryRunner.query(`
          INSERT INTO invoice_items (invoice_id, item_name, description, quantity, unit_price, tax_percent, tax_amount, line_total)
          VALUES ($1, 'Abonnement plateforme SaaS (3 mois)', 'Licence trimestrielle', 1, 300000, 18, 54000, 354000);
        `, [inv2_1.id]);
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
      `, [company2.id, accountant.id]);

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
      `, [company2.id, accountant.id]);
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

    if (company3) {
      console.log('✅ Company 3 created:', company3.id);
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
        RETURNING id;
      `, [company3.id]);

      if (inv3_1) {
        await queryRunner.query(`
          INSERT INTO invoice_items (invoice_id, item_name, description, quantity, unit_price, tax_percent, tax_amount, line_total)
          VALUES ($1, 'Prestations de conseil', 'Mission conseil', 1, 190000, 18, 34200, 224200);
        `, [inv3_1.id]);
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
      `, [company3.id, entrepreneur.id]);

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
      `, [company3.id, entrepreneur.id]);
    }

    // 4. Créer des comptes OHADA de test
    console.log('Creating test OHADA accounts...');
    
    const accounts = [
      { code: '101', name: 'Capital social', syscohadaClass: 1, accountType: 'equity' },
      { code: '411', name: 'Clients', syscohadaClass: 4, accountType: 'asset' },
      { code: '401', name: 'Fournisseurs', syscohadaClass: 4, accountType: 'liability' },
      { code: '512', name: 'Banque', syscohadaClass: 5, accountType: 'asset' },
      { code: '571', name: 'Caisse', syscohadaClass: 5, accountType: 'asset' },
      { code: '701', name: 'Ventes de marchandises', syscohadaClass: 7, accountType: 'revenue' },
      { code: '601', name: 'Achats de marchandises', syscohadaClass: 6, accountType: 'expense' },
    ];

    const accountCompanyId = (company1 && company1.id) || (company2 && company2.id) || (company3 && company3.id);
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
    
    if (company1 && entrepreneur.id) {
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
      `, [entrepreneur.id, company1.id]);
      console.log('✅ NIF request created');
    }

    await queryRunner.commitTransaction();
    console.log('✅ Development seed completed successfully!');
    
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@bms.bj / password123');
    console.log('Tax Admin: taxadmin@dgi.bj / password123');
    console.log('Accountant: comptable@cabinet.bj / password123');
    console.log('Entrepreneur: entrepreneur@test.bj / password123');
    
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('❌ Seed failed:', error.message);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
