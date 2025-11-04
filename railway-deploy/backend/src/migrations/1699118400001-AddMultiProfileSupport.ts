import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddMultiProfileSupport1699118400001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ajouter la colonne profiles (tableau de profils)
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'profiles',
        type: 'text',
        isArray: true,
        isNullable: true,
        default: "'{entrepreneur}'",
      }),
    );

    // Ajouter la colonne primary_profile
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'primary_profile',
        type: 'varchar',
        length: '50',
        isNullable: true,
        default: "'entrepreneur'",
      }),
    );

    // Mettre à jour les utilisateurs existants
    await queryRunner.query(`
      UPDATE users 
      SET profiles = ARRAY[profile], 
          primary_profile = profile 
      WHERE profile IS NOT NULL
    `);

    // Pour les utilisateurs sans profil, mettre entrepreneur par défaut
    await queryRunner.query(`
      UPDATE users 
      SET profiles = '{entrepreneur}', 
          primary_profile = 'entrepreneur' 
      WHERE profile IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer les colonnes dans l'ordre inverse
    await queryRunner.dropColumn('users', 'primary_profile');
    await queryRunner.dropColumn('users', 'profiles');
  }
}
