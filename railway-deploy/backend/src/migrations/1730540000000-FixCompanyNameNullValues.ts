import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixCompanyNameNullValues1730540000000 implements MigrationInterface {
  name = 'FixCompanyNameNullValues1730540000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update NULL names to a default value based on legal_name or ID
    await queryRunner.query(`
      UPDATE companies 
      SET name = CASE 
        WHEN name IS NULL AND legal_name IS NOT NULL THEN legal_name
        WHEN name IS NULL AND legal_name IS NULL THEN 'Société ' || SUBSTRING(id, 1, 8)
        ELSE name
      END
      WHERE name IS NULL
    `);

    // Log the number of updated records
    const result = await queryRunner.query(`
      SELECT COUNT(*) as count FROM companies WHERE name IS NOT NULL
    `);
    console.log(`Updated companies with non-NULL names: ${result[0].count}`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // In case of rollback, we don't need to do anything as we're just fixing data
    console.log('Rollback: No action needed for FixCompanyNameNullValues migration');
  }
}
