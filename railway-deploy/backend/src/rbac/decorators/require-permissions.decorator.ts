import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Décorateur pour exiger des permissions spécifiques
 * Usage: @RequirePermissions('invoices:create', 'invoices:update')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
