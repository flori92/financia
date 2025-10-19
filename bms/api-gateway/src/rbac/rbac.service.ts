import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';

@Injectable()
export class RbacService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
  ) {}

  /**
   * Créer une permission
   */
  async createPermission(
    resource: string,
    action: string,
    description?: string,
  ): Promise<Permission> {
    const permission = this.permissionRepo.create({
      resource,
      action,
      description,
    });
    return this.permissionRepo.save(permission);
  }

  /**
   * Créer un rôle avec permissions
   */
  async createRole(
    name: string,
    companyId: string,
    permissionIds: string[],
    description?: string,
  ): Promise<Role> {
    const permissions = await this.permissionRepo.findByIds(permissionIds);
    const role = this.roleRepo.create({
      name,
      companyId,
      description,
      permissions,
    });
    return this.roleRepo.save(role);
  }

  /**
   * Assigner des permissions à un rôle
   */
  async assignPermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<Role> {
    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      relations: ['permissions'],
    });
    const permissions = await this.permissionRepo.findByIds(permissionIds);
    role.permissions = permissions;
    return this.roleRepo.save(role);
  }

  /**
   * Vérifier si un utilisateur a une permission
   */
  async userHasPermission(
    userId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    // Cette méthode sera utilisée par le guard
    // Pour l'instant, on retourne true pour les admins
    return true;
  }

  /**
   * Récupérer toutes les permissions
   */
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepo.find();
  }

  /**
   * Récupérer tous les rôles d'une company
   */
  async getRolesByCompany(companyId: string): Promise<Role[]> {
    return this.roleRepo.find({
      where: { companyId },
      relations: ['permissions'],
    });
  }
}
