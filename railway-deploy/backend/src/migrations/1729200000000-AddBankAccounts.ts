import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class AddBankAccounts1729200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Créer la table bank_accounts
    await queryRunner.createTable(
      new Table({
        name: 'bank_accounts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'company_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'account_number',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'iban',
            type: 'varchar',
            length: '34',
            isNullable: true,
          },
          {
            name: 'bic',
            type: 'varchar',
            length: '11',
            isNullable: true,
          },
          {
            name: 'bankName',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'currency',
            type: 'varchar',
            length: '50',
            default: "'XOF'",
          },
          {
            name: 'openingBalance',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Ajouter la colonne account_id à bank_transactions
    await queryRunner.addColumn(
      'bank_transactions',
      new TableColumn({
        name: 'account_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    // Créer l'index sur company_id pour optimiser les requêtes
    await queryRunner.query(
      `CREATE INDEX idx_bank_accounts_company_id ON bank_accounts(company_id)`,
    );

    // Créer l'index sur account_id dans bank_transactions
    await queryRunner.query(
      `CREATE INDEX idx_bank_transactions_account_id ON bank_transactions(account_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les index
    await queryRunner.query(`DROP INDEX IF EXISTS idx_bank_transactions_account_id`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_bank_accounts_company_id`);

    // Supprimer la colonne account_id de bank_transactions
    await queryRunner.dropColumn('bank_transactions', 'account_id');

    // Supprimer la table bank_accounts
    await queryRunner.dropTable('bank_accounts');
  }
}
