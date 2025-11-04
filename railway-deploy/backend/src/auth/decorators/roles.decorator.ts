import { SetMetadata } from '@nestjs/common';
import { UserRole, ROLES_KEY } from '../guards/roles.guard';

/**
 * Décorateur pour spécifier les rôles requis pour accéder à une route
 * 
 * @example
 * @Roles(UserRole.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * async adminOnlyRoute() { ... }
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
