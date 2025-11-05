# 🚀 BMS Immediate Action Plan

## Week 1: Security & Infrastructure (Nov 5-12, 2025)

### Day 1-2: Multi-Factor Authentication

**Files to Create:**

1. **`bms/api-gateway/src/auth/services/two-factor.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class TwoFactorService {
  async generateSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `BMS (${email})`,
      length: 32,
    });
    
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);
    
    return {
      secret: secret.base32,
      qrCode,
    };
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  generateBackupCodes(): string[] {
    return Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );
  }
}
```

2. **`bms/api-gateway/src/auth/guards/two-factor.guard.ts`**
```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class TwoFactorGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (user.twoFactorEnabled && !user.twoFactorVerified) {
      throw new UnauthorizedException('2FA verification required');
    }
    
    return true;
  }
}
```

3. **Update `bms/api-gateway/src/auth/auth.controller.ts`**
```typescript
@Post('2fa/enable')
@UseGuards(JwtAuthGuard)
async enableTwoFactor(@Request() req) {
  return this.twoFactorService.generateSecret(req.user.email);
}

@Post('2fa/verify')
@UseGuards(JwtAuthGuard)
async verifyTwoFactor(@Request() req, @Body() dto: { token: string; secret: string }) {
  const isValid = this.twoFactorService.verifyToken(dto.secret, dto.token);
  if (!isValid) {
    throw new UnauthorizedException('Invalid 2FA token');
  }
  
  // Save secret to user
  await this.usersService.enableTwoFactor(req.user.userId, dto.secret);
  
  // Generate backup codes
  const backupCodes = this.twoFactorService.generateBackupCodes();
  await this.usersService.saveBackupCodes(req.user.userId, backupCodes);
  
  return { success: true, backupCodes };
}

@Post('2fa/validate')
async validateTwoFactor(@Body() dto: { email: string; password: string; token: string }) {
  const user = await this.authService.validateUser(dto.email, dto.password);
  if (!user) {
    throw new UnauthorizedException('Invalid credentials');
  }
  
  const isValid = this.twoFactorService.verifyToken(user.twoFactorSecret, dto.token);
  if (!isValid) {
    throw new UnauthorizedException('Invalid 2FA token');
  }
  
  return this.authService.login(user, true);
}
```

**Commands:**
```bash
cd bms/api-gateway
npm install speakeasy qrcode @types/qrcode
```


### Day 3: Rate Limiting & Security Headers

**Files to Create:**

1. **Update `bms/api-gateway/src/app.module.ts`**
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // Add throttler
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 100, // 100 requests per minute
    }),
    // ... other imports
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // ... other providers
  ],
})
```

2. **Create `bms/api-gateway/src/common/guards/tenant-throttler.guard.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: Record<string, any>): string {
    // Rate limit per tenant instead of per IP
    return req.user?.companyId || req.ip;
  }
}
```

**Commands:**
```bash
npm install @nestjs/throttler
```

### Day 4-5: Redis Cache Integration

**Files to Create:**

1. **`bms/api-gateway/src/cache/cache.module.ts`**
```typescript
import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        ttl: 300, // 5 minutes default
      }),
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule {}
```

2. **Update `bms/api-gateway/src/accounting/accounting.service.ts`**
```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class AccountingService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    // ... other dependencies
  ) {}

  async getTrialBalance(companyId: string, startDate: string, endDate: string) {
    const cacheKey = `trial-balance:${companyId}:${startDate}:${endDate}`;
    
    // Try cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Calculate if not cached
    const result = await this.calculateTrialBalance(companyId, startDate, endDate);
    
    // Cache for 1 hour
    await this.cacheManager.set(cacheKey, result, 3600);
    
    return result;
  }

  async invalidateCache(companyId: string) {
    // Invalidate all accounting caches for this company
    const keys = await this.cacheManager.store.keys(`*:${companyId}:*`);
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }
}
```

**Commands:**
```bash
npm install cache-manager cache-manager-redis-store
npm install --save-dev @types/cache-manager
```

**Update `.env`:**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## Week 2: Database Optimization & Core Features

### Day 1: Database Indexes

**Create `bms/api-gateway/migrations/002-add-performance-indexes.sql`**
```sql
-- Journal entries indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_company_date 
ON journal_entries(company_id, entry_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_status 
ON journal_entries(company_id, status) WHERE status = 'posted';

-- Invoice indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_customer_status 
ON invoices(customer_id, status) WHERE status != 'cancelled';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_date 
ON invoices(company_id, invoice_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_due_date 
ON invoices(company_id, due_date) WHERE status != 'paid';

-- Bank transactions indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bank_transactions_account_date 
ON bank_transactions(bank_account_id, transaction_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bank_transactions_reconciled 
ON bank_transactions(bank_account_id, is_reconciled) WHERE is_reconciled = false;

-- CRM indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_company 
ON contacts(company_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_search 
ON contacts USING gin(to_tsvector('french', name || ' ' || COALESCE(email, '')));

-- Audit log indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_company_date 
ON audit_log(company_id, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_entity 
ON audit_log(entity_type, entity_id);

-- Analyze tables
ANALYZE journal_entries;
ANALYZE invoices;
ANALYZE bank_transactions;
ANALYZE contacts;
```

**Run migration:**
```bash
cd bms/api-gateway
psql $DATABASE_URL < migrations/002-add-performance-indexes.sql
```

