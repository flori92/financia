import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProfileToUsers1699118400000 implements MigrationInterface {
  name = 'AddProfileToUsers1699118400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      ADD COLUMN "profile" VARCHAR(50) NULL;
    `);

    // Mettre à jour les utilisateurs existants avec des profils par défaut
    await queryRunner.query(`
      UPDATE "users" 
      SET "profile" = CASE 
        WHEN "role" = 'admin' THEN 'admin'
        WHEN "role" = 'tax_admin' THEN 'administration_fiscal'
        WHEN "role" = 'hr_manager' THEN 'hr_manager'
        WHEN "role" = 'accountant' THEN 'accountant'
        WHEN "role" = 'manager' THEN 'manager'
        WHEN "role" = 'employee' THEN 'employee'
        WHEN "role" = 'user' THEN 'entrepreneur'
        ELSE 'entrepreneur'
      END
      WHERE "profile" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" 
      DROP COLUMN "profile";
    `);
  }
}
