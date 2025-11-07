import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheInvalidationService } from '../services/cache-invalidation.service';

/**
 * Intercepteur pour invalider automatiquement le cache lors des modifications
 */
@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheInvalidation: CacheInvalidationService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, params, body, url } = request;

    // Détecter les modifications
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle().pipe(
        tap(async (result) => {
          try {
            // Extraire companyId et entity
            const companyId = params.companyId || body.companyId || result?.companyId;
            const entity = this.extractEntity(url);
            const action = this.getAction(method);

            if (companyId && entity) {
              await this.cacheInvalidation.invalidateOnChange(
                companyId,
                entity,
                action,
              );
            }
          } catch (error) {
            // Ne pas bloquer la requête si l'invalidation échoue
            console.error('Cache invalidation error:', error);
          }
        }),
      );
    }

    return next.handle();
  }

  /**
   * Extrait l'entité depuis l'URL
   */
  private extractEntity(url: string): string {
    // Mapping URL -> entité
    const patterns = [
      { pattern: /\/journal-entries/, entity: 'journal-entry' },
      { pattern: /\/journal-entry/, entity: 'journal-entry' },
      { pattern: /\/contacts/, entity: 'contact' },
      { pattern: /\/contact/, entity: 'contact' },
      { pattern: /\/transactions/, entity: 'transaction' },
      { pattern: /\/transaction/, entity: 'transaction' },
      { pattern: /\/invoices/, entity: 'invoice' },
      { pattern: /\/invoice/, entity: 'invoice' },
      { pattern: /\/payments/, entity: 'payment' },
      { pattern: /\/payment/, entity: 'payment' },
      { pattern: /\/opportunities/, entity: 'opportunity' },
      { pattern: /\/opportunity/, entity: 'opportunity' },
      { pattern: /\/employees/, entity: 'employee' },
      { pattern: /\/employee/, entity: 'employee' },
      { pattern: /\/leave-requests/, entity: 'leave-request' },
      { pattern: /\/leave-request/, entity: 'leave-request' },
      { pattern: /\/purchases/, entity: 'purchase' },
      { pattern: /\/purchase/, entity: 'purchase' },
      { pattern: /\/sales/, entity: 'sale' },
      { pattern: /\/sale/, entity: 'sale' },
    ];

    for (const { pattern, entity } of patterns) {
      if (pattern.test(url)) return entity;
    }

    return 'unknown';
  }

  /**
   * Détermine l'action depuis la méthode HTTP
   */
  private getAction(method: string): 'create' | 'update' | 'delete' {
    if (method === 'POST') return 'create';
    if (method === 'DELETE') return 'delete';
    return 'update';
  }
}

