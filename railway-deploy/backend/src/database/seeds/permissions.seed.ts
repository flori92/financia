import { DataSource } from 'typeorm';
import { Permission } from '../../rbac/entities/permission.entity';
import { Role } from '../../rbac/entities/role.entity';

/**
 * Seed des permissions par défaut pour BMS
 */
export async function seedPermissions(dataSource: DataSource) {
  const permissionRepo = dataSource.getRepository(Permission);
  const roleRepo = dataSource.getRepository(Role);

  console.log(' Seeding permissions...');

  // Définir toutes les permissions
  const permissionsData = [
    // Invoices
    { resource: 'invoices', action: 'create', description: 'Créer des factures' },
    { resource: 'invoices', action: 'read', description: 'Voir les factures' },
    { resource: 'invoices', action: 'update', description: 'Modifier les factures' },
    { resource: 'invoices', action: 'delete', description: 'Supprimer les factures' },
    { resource: 'invoices', action: 'validate', description: 'Valider les factures' },
    { resource: 'invoices', action: 'send', description: 'Envoyer les factures' },

    // Payments
    { resource: 'payments', action: 'create', description: 'Créer des paiements' },
    { resource: 'payments', action: 'read', description: 'Voir les paiements' },
    { resource: 'payments', action: 'update', description: 'Modifier les paiements' },
    { resource: 'payments', action: 'delete', description: 'Supprimer les paiements' },
    { resource: 'payments', action: 'approve', description: 'Approuver les paiements' },

    // Accounts (Accounting)
    { resource: 'accounts', action: 'create', description: 'Créer des comptes' },
    { resource: 'accounts', action: 'read', description: 'Voir les comptes' },
    { resource: 'accounts', action: 'update', description: 'Modifier les comptes' },
    { resource: 'accounts', action: 'delete', description: 'Supprimer les comptes' },

    // Journal Entries
    { resource: 'journal-entries', action: 'create', description: 'Créer des écritures' },
    { resource: 'journal-entries', action: 'read', description: 'Voir les écritures' },
    { resource: 'journal-entries', action: 'update', description: 'Modifier les écritures' },
    { resource: 'journal-entries', action: 'delete', description: 'Supprimer les écritures' },
    { resource: 'journal-entries', action: 'post', description: 'Valider les écritures' },

    // CRM - Contacts
    { resource: 'contacts', action: 'create', description: 'Créer des contacts' },
    { resource: 'contacts', action: 'read', description: 'Voir les contacts' },
    { resource: 'contacts', action: 'update', description: 'Modifier les contacts' },
    { resource: 'contacts', action: 'delete', description: 'Supprimer les contacts' },
    { resource: 'contacts', action: 'export', description: 'Exporter les contacts' },
    { resource: 'contacts', action: 'import', description: 'Importer les contacts' },

    // CRM - Opportunities
    { resource: 'opportunities', action: 'create', description: 'Créer des opportunités' },
    { resource: 'opportunities', action: 'read', description: 'Voir les opportunités' },
    { resource: 'opportunities', action: 'update', description: 'Modifier les opportunités' },
    { resource: 'opportunities', action: 'delete', description: 'Supprimer les opportunités' },

    // CRM - Activities
    { resource: 'activities', action: 'create', description: 'Créer des activités' },
    { resource: 'activities', action: 'read', description: 'Voir les activités' },
    { resource: 'activities', action: 'update', description: 'Modifier les activités' },
    { resource: 'activities', action: 'delete', description: 'Supprimer les activités' },

    // Reports
    { resource: 'reports', action: 'view', description: 'Voir les rapports' },
    { resource: 'reports', action: 'export', description: 'Exporter les rapports' },
    { resource: 'reports', action: 'create', description: 'Créer des rapports personnalisés' },

    // Banking
    { resource: 'bank-accounts', action: 'create', description: 'Créer des comptes bancaires' },
    { resource: 'bank-accounts', action: 'read', description: 'Voir les comptes bancaires' },
    { resource: 'bank-accounts', action: 'update', description: 'Modifier les comptes bancaires' },
    { resource: 'bank-accounts', action: 'delete', description: 'Supprimer les comptes bancaires' },
    { resource: 'bank-accounts', action: 'reconcile', description: 'Rapprocher les comptes' },

    // Treasury
    { resource: 'treasury', action: 'read', description: 'Voir la trésorerie' },
    { resource: 'treasury', action: 'forecast', description: 'Prévoir la trésorerie' },

    // Tax
    { resource: 'tax', action: 'read', description: 'Voir les taxes' },
    { resource: 'tax', action: 'declare', description: 'Déclarer les taxes' },
    { resource: 'tax', action: 'calculate', description: 'Calculer les taxes' },

    // Settings
    { resource: 'settings', action: 'read', description: 'Voir les paramètres' },
    { resource: 'settings', action: 'update', description: 'Modifier les paramètres' },

    // Users & Roles
    { resource: 'users', action: 'create', description: 'Créer des utilisateurs' },
    { resource: 'users', action: 'read', description: 'Voir les utilisateurs' },
    { resource: 'users', action: 'update', description: 'Modifier les utilisateurs' },
    { resource: 'users', action: 'delete', description: 'Supprimer les utilisateurs' },
    { resource: 'roles', action: 'create', description: 'Créer des rôles' },
    { resource: 'roles', action: 'read', description: 'Voir les rôles' },
    { resource: 'roles', action: 'update', description: 'Modifier les rôles' },
    { resource: 'roles', action: 'delete', description: 'Supprimer les rôles' },

    // Integrations
    { resource: 'integrations', action: 'read', description: 'Voir les intégrations' },
    { resource: 'integrations', action: 'configure', description: 'Configurer les intégrations' },
    { resource: 'integrations', action: 'sync', description: 'Synchroniser les intégrations' },

    // Audit
    { resource: 'audit', action: 'read', description: 'Voir les logs d\'audit' },
  ];

  // Créer les permissions
  const permissions: Permission[] = [];
  for (const permData of permissionsData) {
    let permission = await permissionRepo.findOne({
      where: { resource: permData.resource, action: permData.action },
    });

    if (!permission) {
      permission = permissionRepo.create({
        name: `${permData.resource}:${permData.action}`,
        ...permData,
      });
      permission = await permissionRepo.save(permission);
      console.log(`   Created permission: ${permission.name}`);
    }

    permissions.push(permission);
  }

  console.log(` ${permissions.length} permissions seeded`);

  // Créer les rôles par défaut avec leurs permissions
  const roleDefinitions = [
    {
      name: 'admin',
      description: 'Administrateur - Accès complet',
      permissions: permissions, // Toutes les permissions
    },
    {
      name: 'accountant',
      description: 'Comptable - Gestion comptable et financière',
      permissions: permissions.filter((p) =>
        [
          'invoices',
          'payments',
          'accounts',
          'journal-entries',
          'reports',
          'bank-accounts',
          'treasury',
          'tax',
        ].includes(p.resource),
      ),
    },
    {
      name: 'sales',
      description: 'Commercial - Gestion CRM et ventes',
      permissions: permissions.filter((p) =>
        [
          'contacts',
          'opportunities',
          'activities',
          'invoices:create',
          'invoices:read',
          'reports:view',
        ].some((pattern) => {
          if (pattern.includes(':')) {
            return p.name === pattern;
          }
          return p.resource === pattern;
        }),
      ),
    },
    {
      name: 'user',
      description: 'Utilisateur - Accès limité',
      permissions: permissions.filter((p) =>
        [
          'invoices:read',
          'contacts:read',
          'contacts:create',
          'contacts:update',
          'activities:create',
          'activities:read',
          'reports:view',
        ].includes(p.name),
      ),
    },
    {
      name: 'viewer',
      description: 'Lecteur - Consultation uniquement',
      permissions: permissions.filter((p) => p.action === 'read' || p.action === 'view'),
    },
  ];

  console.log('\n Seeding default roles...');

  for (const roleDef of roleDefinitions) {
    let role = await roleRepo.findOne({
      where: { name: roleDef.name, companyId: null as any }, // Rôles globaux
    });

    if (!role) {
      role = roleRepo.create({
        name: roleDef.name,
        description: roleDef.description,
        companyId: null as any, // Rôles globaux (templates)
        permissions: roleDef.permissions,
      });
      role = await roleRepo.save(role);
      console.log(`   Created role: ${role.name} with ${roleDef.permissions.length} permissions`);
    }
  }

  console.log(' Permissions and roles seeded successfully!\n');
}
