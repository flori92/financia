import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Middleware pour forcer l'isolation multi-tenant
 * Injecte automatiquement le companyId dans toutes les requêtes
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Always allow OPTIONS requests for CORS preflight
    if (req.method === 'OPTIONS') {
      return next();
    }

    const user = (req as any).user;

    if (!user) {
      // Si pas d'utilisateur, laisser passer (sera bloqué par JwtAuthGuard)
      return next();
    }

    if (!user.companyId) {
      throw new UnauthorizedException(
        'Utilisateur sans companyId - accès refusé',
      );
    }

    // Injecter le companyId dans la requête pour accès facile
    (req as any).companyId = user.companyId;

    // Forcer le companyId dans les query params si présent
    if (req.query && typeof req.query === 'object') {
      if (req.query.companyId && req.query.companyId !== user.companyId) {
        throw new UnauthorizedException(
          'Tentative d\'accès à une autre société - accès refusé',
        );
      }
    }

    // Forcer le companyId dans le body si présent
    if (req.body && typeof req.body === 'object') {
      if (req.body.companyId && req.body.companyId !== user.companyId) {
        throw new UnauthorizedException(
          'Tentative d\'accès à une autre société - accès refusé',
        );
      }
      // Injecter automatiquement le companyId dans le body
      req.body.companyId = user.companyId;
    }

    next();
  }
}
