import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { Reflector } from '@nestjs/core';

export const AUDIT_LOG_KEY = 'audit_log';

/**
 * Interceptor pour logger automatiquement les actions sensibles
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditConfig = this.reflector.get<{
      entityType: string;
      action: string;
    }>(AUDIT_LOG_KEY, context.getHandler());

    if (!auditConfig) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const { entityType, action } = auditConfig;

    return next.handle().pipe(
      tap((data) => {
        // Extraire l'ID de l'entité depuis la réponse ou les params
        const entityId = data?.id || request.params?.id || 'unknown';
        
        // Logger l'action
        this.auditService
          .log(entityType, entityId, action, user?.id, JSON.stringify({
            method: request.method,
            url: request.url,
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          }))
          .catch((err) => console.error('Audit log failed:', err));
      }),
    );
  }
}
