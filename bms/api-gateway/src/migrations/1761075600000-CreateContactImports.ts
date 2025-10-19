import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateContactImports1761075600000 implements MigrationInterface {
    name = 'CreateContactImports1761075600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "crm_contact_imports" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "companyId" uuid NOT NULL,
                "fileName" character varying NOT NULL,
                "status" character varying NOT NULL DEFAULT 'pending',
                "totalRows" integer NOT NULL DEFAULT 0,
                "successCount" integer NOT NULL DEFAULT 0,
                "skippedCount" integer NOT NULL DEFAULT 0,
                "errorCount" integer NOT NULL DEFAULT 0,
                "errors" jsonb,
                "createdBy" uuid,
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
                CONSTRAINT "PK_crm_contact_imports" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_crm_contact_imports_companyId" ON "crm_contact_imports" ("companyId")
        `);

        await queryRunner.query(`
            ALTER TABLE "crm_contact_imports"
            ADD CONSTRAINT "FK_crm_contact_imports_company" FOREIGN KEY ("companyId")
            REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "crm_contact_imports" DROP CONSTRAINT IF EXISTS "FK_crm_contact_imports_company"
        `);

        await queryRunner.query(`
            DROP INDEX IF EXISTS "IDX_crm_contact_imports_companyId"
        `);

        await queryRunner.query(`
            DROP TABLE "crm_contact_imports"
        `);
    }
}
