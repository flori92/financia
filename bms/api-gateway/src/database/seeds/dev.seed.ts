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
        name, business_type, industry, country, city, address, phone, email,
        currency, nif_number, rccm_number, created_by
      )
      VALUES (
        'Restaurant Le Béninois', 'limited_company', 'restaurant', 'BJ', 'Cotonou',
        'Akpakpa Centre', '+22997111111', 'contact@lebeninois.bj',
        'XOF', 'BJ1234567890', 'RB/COT/2024/B/123', $1
      )
      ON CONFLICT DO NOTHING
      RETURNING id;
    `, [entrepreneur.id]);
    
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
          INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate, amount)
          VALUES 
            ($1, 'Menu Buffet x20 personnes', 20, 2500, 18, 50000);
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

    // 4. Créer des comptes OHADA de test
    console.log('Creating test OHADA accounts...');
    
    const accounts = [
      { code: '101', name: 'Capital social', syscohada_class: 1, account_type: 'equity', is_group: false },
      { code: '411', name: 'Clients', syscohada_class: 4, account_type: 'receivable', is_group: false },
      { code: '401', name: 'Fournisseurs', syscohada_class: 4, account_type: 'payable', is_group: false },
      { code: '512', name: 'Banque', syscohada_class: 5, account_type: 'bank', is_group: false },
      { code: '571', name: 'Caisse', syscohada_class: 5, account_type: 'cash', is_group: false },
      { code: '701', name: 'Ventes de marchandises', syscohada_class: 7, account_type: 'income', is_group: false },
      { code: '601', name: 'Achats de marchandises', syscohada_class: 6, account_type: 'expense', is_group: false },
    ];

    for (const account of accounts) {
      await queryRunner.query(`
        INSERT INTO accounts (
          account_number, account_name, syscohada_class, account_type, is_group, currency
        )
        VALUES ($1, $2, $3, $4, $5, 'XOF')
        ON CONFLICT (account_number) DO NOTHING;
      `, [account.code, account.name, account.syscohada_class, account.account_type, account.is_group]);
    }
    console.log('✅ OHADA accounts created');

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
