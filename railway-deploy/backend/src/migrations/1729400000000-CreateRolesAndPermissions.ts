import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateRolesAndPermissions1729400000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Table permissions
    await queryRunner.createTable(
      new Table({
        name: 'permissions',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'resource',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Index unique sur resource + action
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_permission_resource_action" ON "permissions" ("resource", "action")`,
    );

    // Table roles
    await queryRunner.createTable(
      new Table({
        name: 'roles',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'company_id',
            type: 'uuid',
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );

    // Index unique sur name + company_id
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_role_name_company" ON "roles" ("name", "company_id")`,
    );

    // Table de liaison role_permissions
    await queryRunner.createTable(
      new Table({
        name: 'role_permissions',
        columns: [
          {
            name: 'role_id',
            type: 'uuid',
          },
          {
            name: 'permission_id',
            type: 'uuid',
          },
        ],
      }),
      true,
    );

    // Primary key composite
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id")`,
    );

    // Foreign keys
    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'role_permissions',
      new TableForeignKey({
        columnNames: ['permission_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'permissions',
        onDelete: 'CASCADE',
      }),
    );

    // Ajouter colonne role_id à users
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "role_id" uuid`,
    );

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['role_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'roles',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la foreign key de users
    const userTable = await queryRunner.getTable('users');
    const roleForeignKey = userTable.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('role_id') !== -1,
    );
    if (roleForeignKey) {
      await queryRunner.dropForeignKey('users', roleForeignKey);
    }
    await queryRunner.dropColumn('users', 'role_id');

    // Supprimer les foreign keys de role_permissions
    const rolePermissionsTable = await queryRunner.getTable('role_permissions');
    const foreignKeys = rolePermissionsTable.foreignKeys;
    for (const fk of foreignKeys) {
      await queryRunner.dropForeignKey('role_permissions', fk);
    }

    // Supprimer les tables
    await queryRunner.dropTable('role_permissions');
    await queryRunner.dropTable('roles');
    await queryRunner.dropTable('permissions');
  }
}
