import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CacheService } from './cache.service';
import { INVALIDATION_TAGS, CACHE_KEYS } from '../constants/cache.constants';

/**
 * Service pour l'invalidation intelligente du cache
 */
@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(
    private readonly cacheService: CacheService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Invalide le cache lors d'une modification
   */
  async invalidateOnChange(
    companyId: string,
    entity: string,
    action: 'create' | 'update' | 'delete',
  ): Promise<void> {
    try {
      // Déterminer les tags à invalider
      const tags = this.getInvalidationTags(companyId, entity, action);
      
      // Invalider les clés correspondantes
      let totalDeleted = 0;
      for (const tag of tags) {
        const deleted = await this.cacheService.delPattern(tag);
        totalDeleted += deleted;
      }

      this.logger.log(
        `Cache invalidated for company ${companyId}, entity ${entity}, action ${action}. Deleted ${totalDeleted} keys.`
      );

      // Émettre un événement pour notifier les clients
      this.eventEmitter.emit('cache.invalidated', {
        companyId,
        entity,
        action,
        tags,
        deletedCount: totalDeleted,
      });
    } catch (error) {
      this.logger.error(
        `Error invalidating cache for company ${companyId}, entity ${entity}:`,
        error,
      );
    }
  }

  /**
   * Invalide le cache pour un module spécifique
   */
  async invalidateModule(companyId: string, module: string): Promise<void> {
    const tag = CACHE_KEYS.TAG_MODULE(companyId, module);
    const deleted = await this.cacheService.delPattern(tag);
    
    this.logger.log(
      `Cache invalidated for module ${module}, company ${companyId}. Deleted ${deleted} keys.`
    );

    this.eventEmitter.emit('cache.invalidated', {
      companyId,
      module,
      deletedCount: deleted,
    });
  }

  /**
   * Invalide tout le cache pour une entreprise
   */
  async invalidateCompany(companyId: string): Promise<void> {
    const tag = CACHE_KEYS.TAG_COMPANY(companyId);
    const deleted = await this.cacheService.delPattern(tag);
    
    this.logger.log(
      `Cache invalidated for company ${companyId}. Deleted ${deleted} keys.`
    );

    this.eventEmitter.emit('cache.invalidated', {
      companyId,
      deletedCount: deleted,
    });
  }

  /**
   * Détermine les tags à invalider selon l'entité
   */
  private getInvalidationTags(
    companyId: string,
    entity: string,
    action: string,
  ): string[] {
    const tags: string[] = [CACHE_KEYS.TAG_COMPANY(companyId)];

    // Mapping entité -> tags
    const entityTags = INVALIDATION_TAGS[entity as keyof typeof INVALIDATION_TAGS];
    
    if (entityTags) {
      for (const module of entityTags) {
        tags.push(CACHE_KEYS.TAG_MODULE(companyId, module));
      }
    }

    // Toujours invalider le dashboard
    tags.push(`dashboard:${companyId}:*`);

    return tags;
  }
}

