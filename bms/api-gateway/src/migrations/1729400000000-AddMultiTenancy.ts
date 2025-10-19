import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMultiTenancy1729400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add company_id to users table
    await queryRunner.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)
    `);

    // Add company_id to accounts table
    await queryRunner.query(`
      ALTER TABLE accounts 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)
    `);

    // Add company_id to journal_entries table
    await queryRunner.query(`
      ALTER TABLE journal_entries 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)
    `);

    // Add company_id to invoices table
    await queryRunner.query(`
      ALTER TABLE invoices 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)
    `);

    // Add company_id to payments table
    await queryRunner.query(`
      ALTER TABLE payments 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)
    `);

    // Add company_id to contacts table
    await queryRunner.query(`
      ALTER TABLE contacts 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)
    `);

    // Add company_id to opportunities table
    await queryRunner.query(`
      ALTER TABLE opportunities 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)
    `);

    // Add company_id to activities table
    await queryRunner.query(`
      ALTER TABLE activities 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)
    `);

    // Add company_id to bank_accounts table
    await queryRunner.query(`
      ALTER TABLE bank_accounts 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)
    `);

    // Add company_id to transactions table
    await queryRunner.query(`
      ALTER TABLE transactions 
      ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id)
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_accounts_company_id ON accounts(company_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_journal_entries_company_id ON journal_entries(company_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_contacts_company_id ON contacts(company_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON opportunities(company_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_activities_company_id ON activities(company_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_bank_accounts_company_id ON bank_accounts(company_id)`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON transactions(company_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_company_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_accounts_company_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_journal_entries_company_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_company_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_payments_company_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_contacts_company_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_opportunities_company_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_activities_company_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_bank_accounts_company_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_transactions_company_id`);

    // Drop columns
    await queryRunner.query(`ALTER TABLE users DROP COLUMN IF EXISTS company_id`);
    await queryRunner.query(`ALTER TABLE accounts DROP COLUMN IF EXISTS company_id`);
    await queryRunner.query(`ALTER TABLE journal_entries DROP COLUMN IF EXISTS company_id`);
    await queryRunner.query(`ALTER TABLE invoices DROP COLUMN IF EXISTS company_id`);
    await queryRunner.query(`ALTER TABLE payments DROP COLUMN IF EXISTS company_id`);
    await queryRunner.query(`ALTER TABLE contacts DROP COLUMN IF EXISTS company_id`);
    await queryRunner.query(`ALTER TABLE opportunities DROP COLUMN IF EXISTS company_id`);
    await queryRunner.query(`ALTER TABLE activities DROP COLUMN IF EXISTS company_id`);
    await queryRunner.query(`ALTER TABLE bank_accounts DROP COLUMN IF EXISTS company_id`);
    await queryRunner.query(`ALTER TABLE transactions DROP COLUMN IF EXISTS company_id`);
  }
}
