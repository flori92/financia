import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

/**
 * Guard pour vérifier les permissions RBAC
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Pas de permissions requises
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Super admin bypass
    if (user.role === 'admin') {
      return true;
    }

    // Vérifier si l'utilisateur a les rôles avec les permissions requises
    if (!user.roles || user.roles.length === 0) {
      return false;
    }

    const userPermissions = new Set<string>();
    for (const role of user.roles) {
      if (role.permissions) {
        for (const permission of role.permissions) {
          userPermissions.add(`${permission.resource}:${permission.action}`);
        }
      }
    }

    // Vérifier si l'utilisateur a au moins une des permissions requises
    return requiredPermissions.some((permission) =>
      userPermissions.has(permission),
    );
  }
}
