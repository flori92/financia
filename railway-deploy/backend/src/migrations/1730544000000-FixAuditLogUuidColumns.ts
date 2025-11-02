import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixAuditLogUuidColumns1730544000000 implements MigrationInterface {
  name = 'FixAuditLogUuidColumns1730544000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "audit_logs" 
      ALTER COLUMN "entityId" TYPE text,
      ALTER COLUMN "entityId" DROP NOT NULL,
      ALTER COLUMN "userId" TYPE text,
      ALTER COLUMN "userId" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "audit_logs" 
      ALTER COLUMN "entityId" TYPE uuid USING "entityId"::uuid,
      ALTER COLUMN "entityId" SET NOT NULL,
      ALTER COLUMN "userId" TYPE uuid USING "userId"::uuid,
      ALTER COLUMN "userId" SET NOT NULL;
    `);
  }
}
