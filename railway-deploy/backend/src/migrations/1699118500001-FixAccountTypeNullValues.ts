import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAccountTypeNullValues1699118500001 implements MigrationInterface {
    name = 'FixAccountTypeNullValues1699118500001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Mettre à jour les valeurs NULL de accountType selon la classe SYSCOHADA
        // Classe 1: Ressources durables -> liability
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "accountType" = 'liability' 
            WHERE "accountType" IS NULL AND "syscohadaClass" = 1
        `);

        // Classe 2: Actif immobilisé -> asset
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "accountType" = 'asset' 
            WHERE "accountType" IS NULL AND "syscohadaClass" = 2
        `);

        // Classe 3: Stocks -> asset
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "accountType" = 'asset' 
            WHERE "accountType" IS NULL AND "syscohadaClass" = 3
        `);

        // Classe 4: Tiers -> mixte (asset/liability selon le numéro de compte)
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "accountType" = CASE 
                WHEN "accountNumber" LIKE '4%' THEN 'asset'
                WHEN "accountNumber" LIKE '5%' THEN 'asset'
                ELSE 'liability'
            END
            WHERE "accountType" IS NULL AND "syscohadaClass" = 4
        `);

        // Classe 5: Trésorerie -> asset
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "accountType" = 'asset' 
            WHERE "accountType" IS NULL AND "syscohadaClass" = 5
        `);

        // Classe 6: Charges -> expense
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "accountType" = 'expense' 
            WHERE "accountType" IS NULL AND "syscohadaClass" = 6
        `);

        // Classe 7: Produits -> revenue
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "accountType" = 'revenue' 
            WHERE "accountType" IS NULL AND "syscohadaClass" = 7
        `);

        // Classe 8: Comptes spéciaux -> equity par défaut
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "accountType" = 'equity' 
            WHERE "accountType" IS NULL AND "syscohadaClass" = 8
        `);

        // Pour tous les autres cas restants, utiliser 'asset' comme valeur par défaut
        await queryRunner.query(`
            UPDATE "accounts" 
            SET "accountType" = 'asset' 
            WHERE "accountType" IS NULL
        `);

        // Maintenant rendre la colonne NOT NULL si elle ne l'est pas déjà
        await queryRunner.query(`
            ALTER TABLE "accounts" 
            ALTER COLUMN "accountType" SET NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Pour le rollback, on peut rendre la colonne nullable à nouveau
        await queryRunner.query(`
            ALTER TABLE "accounts" 
            ALTER COLUMN "accountType" DROP NOT NULL
        `);
    }
}
