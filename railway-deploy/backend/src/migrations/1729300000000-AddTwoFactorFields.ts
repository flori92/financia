import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTwoFactorFields1729300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'two_factor_secret',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'two_factor_enabled',
        type: 'boolean',
        default: false,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'two_factor_temp_secret',
        type: 'varchar',
        isNullable: true,
      }),
    );

    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'two_factor_backup_codes',
        type: 'jsonb',
        isNullable: true,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'two_factor_backup_codes');
    await queryRunner.dropColumn('users', 'two_factor_temp_secret');
    await queryRunner.dropColumn('users', 'two_factor_enabled');
    await queryRunner.dropColumn('users', 'two_factor_secret');
  }
}
