import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';

/**
 * Service de gestion des permissions
 */
@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
  ) {}

  async findAll(): Promise<Permission[]> {
    return this.permissionRepo.find({ where: { isActive: true } });
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    return this.permissionRepo.findByIds(ids);
  }

  async create(data: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepo.create(data);
    return this.permissionRepo.save(permission);
  }

  async seedDefaultPermissions(): Promise<void> {
    const permissions = [
      // Invoices
      { name: 'invoices:create', resource: 'invoices', action: 'create', description: 'Créer des factures' },
      { name: 'invoices:read', resource: 'invoices', action: 'read', description: 'Voir les factures' },
      { name: 'invoices:update', resource: 'invoices', action: 'update', description: 'Modifier les factures' },
      { name: 'invoices:delete', resource: 'invoices', action: 'delete', description: 'Supprimer les factures' },
      { name: 'invoices:validate', resource: 'invoices', action: 'validate', description: 'Valider les factures' },
      
      // Accounts
      { name: 'accounts:create', resource: 'accounts', action: 'create', description: 'Créer des comptes' },
      { name: 'accounts:read', resource: 'accounts', action: 'read', description: 'Voir les comptes' },
      { name: 'accounts:update', resource: 'accounts', action: 'update', description: 'Modifier les comptes' },
      { name: 'accounts:delete', resource: 'accounts', action: 'delete', description: 'Supprimer les comptes' },
      
      // Payments
      { name: 'payments:create', resource: 'payments', action: 'create', description: 'Créer des paiements' },
      { name: 'payments:read', resource: 'payments', action: 'read', description: 'Voir les paiements' },
      { name: 'payments:approve', resource: 'payments', action: 'approve', description: 'Approuver les paiements' },
      
      // Contacts (CRM)
      { name: 'contacts:create', resource: 'contacts', action: 'create', description: 'Créer des contacts' },
      { name: 'contacts:read', resource: 'contacts', action: 'read', description: 'Voir les contacts' },
      { name: 'contacts:update', resource: 'contacts', action: 'update', description: 'Modifier les contacts' },
      { name: 'contacts:delete', resource: 'contacts', action: 'delete', description: 'Supprimer les contacts' },
      
      // Opportunities
      { name: 'opportunities:create', resource: 'opportunities', action: 'create', description: 'Créer des opportunités' },
      { name: 'opportunities:read', resource: 'opportunities', action: 'read', description: 'Voir les opportunités' },
      { name: 'opportunities:update', resource: 'opportunities', action: 'update', description: 'Modifier les opportunités' },
      { name: 'opportunities:delete', resource: 'opportunities', action: 'delete', description: 'Supprimer les opportunités' },
      
      // Reports
      { name: 'reports:view', resource: 'reports', action: 'view', description: 'Voir les rapports' },
      { name: 'reports:export', resource: 'reports', action: 'export', description: 'Exporter les rapports' },
      
      // Settings
      { name: 'settings:manage', resource: 'settings', action: 'manage', description: 'Gérer les paramètres' },
      { name: 'users:manage', resource: 'users', action: 'manage', description: 'Gérer les utilisateurs' },
      { name: 'roles:manage', resource: 'roles', action: 'manage', description: 'Gérer les rôles' },
      
      // Banking
      { name: 'banking:read', resource: 'banking', action: 'read', description: 'Voir les comptes bancaires' },
      { name: 'banking:reconcile', resource: 'banking', action: 'reconcile', description: 'Rapprocher les comptes' },
      
      // Tax
      { name: 'tax:read', resource: 'tax', action: 'read', description: 'Voir les déclarations fiscales' },
      { name: 'tax:submit', resource: 'tax', action: 'submit', description: 'Soumettre les déclarations' },
    ];

    for (const perm of permissions) {
      const exists = await this.permissionRepo.findOne({ where: { name: perm.name } });
      if (!exists) {
        await this.permissionRepo.save(this.permissionRepo.create(perm));
      }
    }
  }
}
