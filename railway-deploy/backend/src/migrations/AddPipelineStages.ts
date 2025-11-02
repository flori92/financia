import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPipelineStages1730317200000 implements MigrationInterface {
    name = 'AddPipelineStages1730317200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Table crm_pipeline_stages
        await queryRunner.query(`
            CREATE TABLE "crm_pipeline_stages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "description" character varying,
                "type" character varying NOT NULL,
                "order" integer NOT NULL DEFAULT 0,
                "isActive" boolean NOT NULL DEFAULT true,
                "probability" numeric(5,2) NOT NULL DEFAULT 0,
                "companyId" uuid NOT NULL,
                CONSTRAINT "UQ_crm_pipeline_stages_type_company" UNIQUE ("type", "companyId"),
                CONSTRAINT "PK_crm_pipeline_stages" PRIMARY KEY ("id")
            )
        `);

        // Ajouter la colonne pipelineStageId à crm_opportunities si elle n'existe pas déjà
        await queryRunner.query(`
            ALTER TABLE "crm_opportunities" ADD COLUMN IF NOT EXISTS "pipelineStageId" uuid
        `);

        // Index pour les nouvelles colonnes
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_crm_pipeline_stages_companyId" ON "crm_pipeline_stages" ("companyId")
        `);
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS "IDX_crm_opportunities_pipelineStageId" ON "crm_opportunities" ("pipelineStageId")
        `);

        // Foreign Key pour pipelineStageId
        await queryRunner.query(`
            ALTER TABLE "crm_opportunities" ADD CONSTRAINT IF NOT EXISTS "FK_crm_opportunities_pipelineStageId"
            FOREIGN KEY ("pipelineStageId") REFERENCES "crm_pipeline_stages"("id") ON DELETE SET NULL ON UPDATE NO ACTION
        `);

        // Insérer les étapes par défaut pour les sociétés existantes
        await queryRunner.query(`
            INSERT INTO "crm_pipeline_stages" ("name", "type", "order", "probability", "companyId")
            SELECT
                CASE
                    WHEN type = 'lead' THEN 'Lead'
                    WHEN type = 'qualified' THEN 'Qualifié'
                    WHEN type = 'proposal' THEN 'Proposition'
                    WHEN type = 'negotiation' THEN 'Négociation'
                    WHEN type = 'closing' THEN 'Clôture'
                    WHEN type = 'won' THEN 'Gagné'
                    WHEN type = 'lost' THEN 'Perdu'
                END,
                type,
                CASE
                    WHEN type = 'lead' THEN 0
                    WHEN type = 'qualified' THEN 1
                    WHEN type = 'proposal' THEN 2
                    WHEN type = 'negotiation' THEN 3
                    WHEN type = 'closing' THEN 4
                    WHEN type = 'won' THEN 5
                    WHEN type = 'lost' THEN 6
                END,
                CASE
                    WHEN type = 'lead' THEN 10
                    WHEN type = 'qualified' THEN 25
                    WHEN type = 'proposal' THEN 50
                    WHEN type = 'negotiation' THEN 75
                    WHEN type = 'closing' THEN 90
                    WHEN type = 'won' THEN 100
                    WHEN type = 'lost' THEN 0
                END,
                id
            FROM "companies"
            WHERE NOT EXISTS (
                SELECT 1 FROM "crm_pipeline_stages" ps WHERE ps.companyId = "companies".id
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Supprimer les foreign keys
        await queryRunner.query(`ALTER TABLE "crm_opportunities" DROP CONSTRAINT IF EXISTS "FK_crm_opportunities_pipelineStageId"`);

        // Supprimer les indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_crm_opportunities_pipelineStageId"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IDX_crm_pipeline_stages_companyId"`);

        // Supprimer la colonne pipelineStageId
        await queryRunner.query(`ALTER TABLE "crm_opportunities" DROP COLUMN IF EXISTS "pipelineStageId"`);

        // Supprimer la table crm_pipeline_stages
        await queryRunner.query(`DROP TABLE "crm_pipeline_stages"`);
    }
}
