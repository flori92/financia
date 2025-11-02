import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvoiceFields1732000001000 implements MigrationInterface {
  name = 'AddInvoiceFields1732000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "invoices" 
      ADD COLUMN "party_whatsapp" character varying,
      ADD COLUMN "url" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "invoices" 
      DROP COLUMN "party_whatsapp",
      DROP COLUMN "url"
    `);
  }
}
