import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../../audit/audit.service';

/**
 * Interceptor pour logger automatiquement les actions sensibles
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, params } = request;

    // Skip OPTIONS requests (CORS preflight)
    if (method === 'OPTIONS') {
      return next.handle();
    }

    // Déterminer l'action basée sur la méthode HTTP
    const actionMap = {
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };

    const action = actionMap[method] || 'read';

    // Extraire le type d'entité de l'URL
    const urlParts = url.split('/');
    const entityType = urlParts[3] || 'unknown'; // /api/v1/[entityType]

    // Extraire l'ID de l'entité
    const entityId = params?.id || body?.id || 'bulk';

    return next.handle().pipe(
      tap({
        next: (data) => {
          // Logger uniquement les actions sensibles
          if (this.shouldAudit(method, url)) {
            this.auditService
              .log(
                entityType,
                entityId,
                action,
                user?.id || 'anonymous',
                `${method} ${url}`,
              )
              .catch((err) => console.error('Audit log failed:', err));
          }
        },
        error: (error) => {
          // Logger aussi les erreurs sur actions sensibles
          if (this.shouldAudit(method, url)) {
            this.auditService
              .log(
                entityType,
                entityId,
                `${action}_failed`,
                user?.id || 'anonymous',
                `${method} ${url} - Error: ${error.message}`,
              )
              .catch((err) => console.error('Audit log failed:', err));
          }
        },
      }),
    );
  }

  /**
   * Déterminer si l'action doit être auditée
   */
  private shouldAudit(method: string, url: string): boolean {
    // Ne pas auditer les GET (trop verbeux)
    if (method === 'GET') return false;

    // Auditer toutes les modifications sur ces endpoints
    const sensitiveEndpoints = [
      '/invoices',
      '/payments',
      '/accounting',
      '/tax',
      '/users',
      '/roles',
      '/settings',
    ];

    return sensitiveEndpoints.some((endpoint) => url.includes(endpoint));
  }
}
