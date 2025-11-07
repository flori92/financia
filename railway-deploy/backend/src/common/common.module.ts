import { Module, Global } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { CacheService } from './services/cache.service';
import { CacheInvalidationService } from './services/cache-invalidation.service';
import { CacheInvalidationInterceptor } from './interceptors/cache-invalidation.interceptor';
import { RedisHealthService } from './services/redis-health.service';
import { AuditModule } from '../audit/audit.module';

@Global()
@Module({
  imports: [AuditModule],
  providers: [
    EncryptionService,
    AuditInterceptor,
    CacheService,
    CacheInvalidationService,
    CacheInvalidationInterceptor,
    RedisHealthService,
  ],
  exports: [
    EncryptionService,
    AuditInterceptor,
    CacheService,
    CacheInvalidationService,
    CacheInvalidationInterceptor,
    RedisHealthService,
  ],
})
export class CommonModule {}
