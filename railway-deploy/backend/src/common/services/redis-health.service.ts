import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Service pour vérifier la santé de Redis
 */
@Injectable()
export class RedisHealthService implements OnModuleInit {
  private readonly logger = new Logger(RedisHealthService.name);
  private isConnected = false;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await this.checkConnection();
  }

  /**
   * Vérifie la connexion Redis
   */
  async checkConnection(): Promise<boolean> {
    try {
      // Test simple de connexion
      const testKey = 'health:check';
      const testValue = Date.now().toString();
      
      await this.cacheManager.set(testKey, testValue, 10);
      const retrieved = await this.cacheManager.get<string>(testKey);
      
      if (retrieved === testValue) {
        this.isConnected = true;
        if (process.env.NODE_ENV !== 'production') {
          this.logger.log('✅ Redis connection successful');
        }
        return true;
      } else {
        this.isConnected = false;
        this.logger.warn('⚠️ Redis connection test failed - value mismatch');
        return false;
      }
    } catch (error) {
      this.isConnected = false;
      this.logger.error('❌ Redis connection failed:', error);
      if (process.env.NODE_ENV === 'production') {
        this.logger.warn('⚠️ Application running in degraded mode (cache disabled)');
      } else {
        this.logger.warn('⚠️ Application will continue without cache (degraded mode)');
      }
      return false;
    }
  }

  /**
   * Vérifie si Redis est connecté
   */
  isRedisConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Récupère les statistiques Redis
   */
  async getStats(): Promise<{
    connected: boolean;
    status: string;
    message: string;
  }> {
    const connected = await this.checkConnection();
    
    return {
      connected,
      status: connected ? 'healthy' : 'unhealthy',
      message: connected
        ? 'Redis is connected and operational'
        : 'Redis is not connected - running in degraded mode',
    };
  }
}

