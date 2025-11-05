import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  ACCOUNTANT = 'accountant',
  TAX_ADMIN = 'tax_admin',
  HR_MANAGER = 'hr_manager',
  MANAGER = 'manager',
  EMPLOYEE = 'employee',
  EXPERT_COMPTABLE = 'expert_comptable',  // ✅ AJOUTER
  BANQUE = 'banque',                      // ✅ AJOUTER
}

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      // Pas de rôles requis, accès autorisé
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Utilisateur non authentifié');
    }

    // Vérifier si l'utilisateur a un des rôles requis
    console.log(`[RolesGuard] Vérification rôle - user:`, user);
    console.log(`[RolesGuard] Rôles requis:`, requiredRoles);
    console.log(`[RolesGuard] Rôle utilisateur:`, user.role);
    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      console.log(`[RolesGuard] Accès refusé - rôles requis: ${requiredRoles.join(', ')}, rôle utilisateur: ${user.role || 'aucun'}`);
      throw new ForbiddenException(
        `Accès refusé. Rôles requis: ${requiredRoles.join(', ')}. Votre rôle: ${user.role || 'aucun'}`,
      );
    }

    return true;
  }
}
