import { SetMetadata } from '@nestjs/common';

export const AUDIT_LOG_KEY = 'audit_log';

/**
 * Décorateur pour activer l'audit logging sur une route
 * @param entityType Type d'entité (invoice, contact, payment, etc.)
 * @param action Action effectuée (create, update, delete, validate, etc.)
 * @example @AuditLog('invoice', 'validate')
 */
export const AuditLog = (entityType: string, action: string) =>
  SetMetadata(AUDIT_LOG_KEY, { entityType, action });
