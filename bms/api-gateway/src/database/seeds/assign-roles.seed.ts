import { DataSource } from 'typeorm';

/**
 * Assigner les rôles RBAC aux utilisateurs
 */
export async function assignRolesToUsers(dataSource: DataSource) {
  console.log('🌱 Assigning RBAC roles to users...');

  try {
    // Récupérer le rôle accountant
    const [accountantRole] = await dataSource.query(`
      SELECT id FROM roles WHERE name = 'accountant' AND is_system_role = true LIMIT 1
    `);

    if (!accountantRole) {
      console.log('⚠️  Accountant role not found, skipping role assignment');
      return;
    }

    // Récupérer l'utilisateur comptable
    const [accountantUser] = await dataSource.query(`
      SELECT id FROM users WHERE email = 'comptable@cabinet.bj' LIMIT 1
    `);

    if (!accountantUser) {
      console.log('⚠️  Accountant user not found, skipping role assignment');
      return;
    }

    // Assigner le rôle à l'utilisateur
    await dataSource.query(`
      INSERT INTO user_roles (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, role_id) DO NOTHING
    `, [accountantUser.id, accountantRole.id]);

    console.log(`✅ Assigned 'accountant' role to comptable@cabinet.bj`);

    // Récupérer le rôle admin
    const [adminRole] = await dataSource.query(`
      SELECT id FROM roles WHERE name = 'admin' AND is_system_role = true LIMIT 1
    `);

    if (adminRole) {
      // Récupérer l'utilisateur admin
      const [adminUser] = await dataSource.query(`
        SELECT id FROM users WHERE email = 'admin@bms.bj' LIMIT 1
      `);

      if (adminUser) {
        await dataSource.query(`
          INSERT INTO user_roles (user_id, role_id)
          VALUES ($1, $2)
          ON CONFLICT (user_id, role_id) DO NOTHING
        `, [adminUser.id, adminRole.id]);

        console.log(`✅ Assigned 'admin' role to admin@bms.bj`);
      }
    }

    console.log('✅ Role assignment completed');
  } catch (error) {
    console.error('❌ Error assigning roles:', error);
  }
}
