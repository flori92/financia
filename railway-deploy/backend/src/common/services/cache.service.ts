import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Service de cache wrapper avec gestion d'erreurs et fallback
 */
@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Récupère une valeur du cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      // Logs de debug uniquement en développement
      if (process.env.NODE_ENV !== 'production') {
        if (value) {
          this.logger.debug(`Cache HIT: ${key}`);
        } else {
          this.logger.debug(`Cache MISS: ${key}`);
        }
      }
      return value || null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null; // Fallback: retourner null en cas d'erreur
    }
  }

  /**
   * Définit une valeur dans le cache avec TTL optionnel
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      // Logs de debug uniquement en développement
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Cache SET: ${key} (TTL: ${ttl || 'default'})`);
      }
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
      // Ne pas bloquer si le cache échoue
    }
  }

  /**
   * Supprime une clé du cache
   */
  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      // Logs de debug uniquement en développement
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Cache DEL: ${key}`);
      }
    } catch (error) {
      this.logger.error(`Cache del error for key ${key}:`, error);
    }
  }

  /**
   * Supprime plusieurs clés correspondant à un pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length === 0) return 0;

      await Promise.all(keys.map(key => this.del(key)));
      // Logs de debug uniquement en développement
      if (process.env.NODE_ENV !== 'production') {
        this.logger.debug(`Cache DEL PATTERN: ${pattern} (${keys.length} keys)`);
      }
      return keys.length;
    } catch (error) {
      this.logger.error(`Cache delPattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Récupère toutes les clés correspondant à un pattern
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      const store = this.cacheManager.store as any;
      if (store && typeof store.keys === 'function') {
        return await store.keys(pattern);
      }
      // Fallback: si la méthode keys n'est pas disponible
      this.logger.warn(`Cache keys method not available for pattern: ${pattern}`);
      return [];
    } catch (error) {
      this.logger.error(`Cache keys error for pattern ${pattern}:`, error);
      return [];
    }
  }

  /**
   * Vérifie si une clé existe dans le cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== null;
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Incrémente une valeur numérique dans le cache
   */
  async increment(key: string, by: number = 1): Promise<number> {
    try {
      const current = await this.get<number>(key) || 0;
      const newValue = current + by;
      await this.set(key, newValue);
      return newValue;
    } catch (error) {
      this.logger.error(`Cache increment error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Définir une valeur seulement si elle n'existe pas (SETNX)
   */
  async setIfNotExists(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      const exists = await this.exists(key);
      if (!exists) {
        await this.set(key, value, ttl);
        return true;
      }
      return false;
    } catch (error) {
      this.logger.error(`Cache setIfNotExists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Récupère plusieurs valeurs en une seule opération
   */
  async mget(keys: string[]): Promise<Array<any | null>> {
    try {
      return await Promise.all(keys.map(key => this.get(key)));
    } catch (error) {
      this.logger.error(`Cache mget error:`, error);
      return keys.map(() => null);
    }
  }

  /**
   * Définit plusieurs valeurs en une seule opération
   */
  async mset(keyValuePairs: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    try {
      await Promise.all(
        keyValuePairs.map(({ key, value, ttl }) => this.set(key, value, ttl))
      );
    } catch (error) {
      this.logger.error(`Cache mset error:`, error);
    }
  }
}

