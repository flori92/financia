import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../auth/entities/role.entity';
import { PermissionsService } from './permissions.service';

/**
 * Service de gestion des rôles
 */
@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    private permissionsService: PermissionsService,
  ) {}

  async findByCompany(companyId: string): Promise<Role[]> {
    return this.roleRepo.find({
      where: { companyId },
      relations: ['permissions'],
    });
  }

  async findById(id: string): Promise<Role> {
    return this.roleRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });
  }

  async create(companyId: string, name: string, permissionIds: string[]): Promise<Role> {
    const permissions = await this.permissionsService.findByIds(permissionIds);
    const role = this.roleRepo.create({
      name,
      companyId,
      permissions,
    });
    return this.roleRepo.save(role);
  }

  async update(id: string, name: string, permissionIds: string[]): Promise<Role> {
    const role = await this.findById(id);
    const permissions = await this.permissionsService.findByIds(permissionIds);
    role.name = name;
    role.permissions = permissions;
    return this.roleRepo.save(role);
  }

  async seedDefaultRoles(companyId: string): Promise<void> {
    const allPermissions = await this.permissionsService.findAll();
    
    // Admin - toutes les permissions
    const adminExists = await this.roleRepo.findOne({
      where: { companyId, name: 'Admin', isSystemRole: true },
    });
    if (!adminExists) {
      await this.roleRepo.save(
        this.roleRepo.create({
          name: 'Admin',
          description: 'Administrateur avec tous les droits',
          companyId,
          isSystemRole: true,
          permissions: allPermissions,
        }),
      );
    }

    // Comptable
    const accountantPerms = allPermissions.filter((p) =>
      ['invoices', 'accounts', 'payments', 'banking', 'tax', 'reports'].includes(p.resource),
    );
    const accountantExists = await this.roleRepo.findOne({
      where: { companyId, name: 'Comptable', isSystemRole: true },
    });
    if (!accountantExists) {
      await this.roleRepo.save(
        this.roleRepo.create({
          name: 'Comptable',
          description: 'Comptable avec accès comptabilité et facturation',
          companyId,
          isSystemRole: true,
          permissions: accountantPerms,
        }),
      );
    }

    // Commercial
    const salesPerms = allPermissions.filter((p) =>
      ['contacts', 'opportunities', 'invoices'].includes(p.resource) &&
      p.action !== 'delete',
    );
    const salesExists = await this.roleRepo.findOne({
      where: { companyId, name: 'Commercial', isSystemRole: true },
    });
    if (!salesExists) {
      await this.roleRepo.save(
        this.roleRepo.create({
          name: 'Commercial',
          description: 'Commercial avec accès CRM et facturation',
          companyId,
          isSystemRole: true,
          permissions: salesPerms,
        }),
      );
    }

    // Viewer
    const viewerPerms = allPermissions.filter((p) => p.action === 'read' || p.action === 'view');
    const viewerExists = await this.roleRepo.findOne({
      where: { companyId, name: 'Viewer', isSystemRole: true },
    });
    if (!viewerExists) {
      await this.roleRepo.save(
        this.roleRepo.create({
          name: 'Viewer',
          description: 'Consultation uniquement',
          companyId,
          isSystemRole: true,
          permissions: viewerPerms,
        }),
      );
    }
  }
}
