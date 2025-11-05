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


### Day 2-3: Complete Invoicing Module

**Files to Create:**

1. **`bms/api-gateway/src/invoices/services/pdf-generator.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class PdfGeneratorService {
  async generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('FACTURE', { align: 'center' });
      doc.moveDown();

      // Company info
      doc.fontSize(12).text(`Facture N°: ${invoice.invoiceNumber}`);
      doc.text(`Date: ${invoice.invoiceDate}`);
      doc.text(`Échéance: ${invoice.dueDate}`);
      doc.moveDown();

      // Customer info
      doc.text(`Client: ${invoice.customer.name}`);
      if (invoice.customer.address) {
        doc.text(invoice.customer.address);
      }
      doc.moveDown();

      // Line items table
      const tableTop = doc.y;
      doc.fontSize(10);
      
      // Table headers
      doc.text('Description', 50, tableTop);
      doc.text('Qté', 300, tableTop);
      doc.text('Prix Unit.', 350, tableTop);
      doc.text('Montant', 450, tableTop);
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      let y = tableTop + 25;
      invoice.lines.forEach((line) => {
        doc.text(line.description, 50, y);
        doc.text(line.quantity.toString(), 300, y);
        doc.text(line.unitPrice.toFixed(2), 350, y);
        doc.text(line.amount.toFixed(2), 450, y);
        y += 20;
      });

      // Totals
      doc.moveDown();
      doc.text(`Sous-total: ${invoice.subtotal.toFixed(2)} ${invoice.currency}`, 350);
      doc.text(`TVA: ${invoice.vatAmount.toFixed(2)} ${invoice.currency}`, 350);
      doc.fontSize(12).text(`Total: ${invoice.totalAmount.toFixed(2)} ${invoice.currency}`, 350);

      doc.end();
    });
  }
}
```

2. **`bms/api-gateway/src/invoices/services/recurring-invoices.service.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringInvoice } from '../entities/recurring-invoice.entity';
import { InvoicesService } from '../invoices.service';

@Injectable()
export class RecurringInvoicesService {
  constructor(
    @InjectRepository(RecurringInvoice)
    private recurringRepo: Repository<RecurringInvoice>,
    private invoicesService: InvoicesService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringInvoices() {
    const today = new Date();
    
    const dueRecurring = await this.recurringRepo.find({
      where: { isActive: true },
      relations: ['template', 'customer'],
    });

    for (const recurring of dueRecurring) {
      if (this.shouldGenerateInvoice(recurring, today)) {
        await this.generateInvoice(recurring);
        await this.updateNextDate(recurring);
      }
    }
  }

  private shouldGenerateInvoice(recurring: RecurringInvoice, today: Date): boolean {
    return recurring.nextInvoiceDate <= today;
  }

  private async generateInvoice(recurring: RecurringInvoice) {
    const invoiceNumber = await this.generateInvoiceNumber(recurring.companyId);
    
    await this.invoicesService.create({
      companyId: recurring.companyId,
      customerId: recurring.customerId,
      invoiceNumber,
      invoiceDate: new Date(),
      dueDate: this.calculateDueDate(recurring.paymentTerms),
      subtotal: recurring.amount,
      vatAmount: recurring.amount * 0.18, // 18% VAT
      totalAmount: recurring.amount * 1.18,
      lines: recurring.template.lines,
      notes: `Facture récurrente - ${recurring.description}`,
    });
  }

  private async updateNextDate(recurring: RecurringInvoice) {
    const nextDate = new Date(recurring.nextInvoiceDate);
    
    switch (recurring.frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    recurring.nextInvoiceDate = nextDate;
    recurring.lastInvoiceDate = new Date();
    await this.recurringRepo.save(recurring);
  }
}
```

3. **Create entity `bms/api-gateway/src/invoices/entities/recurring-invoice.entity.ts`**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Customer } from '../../crm/entities/customer.entity';

@Entity('recurring_invoices')
export class RecurringInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company)
  company: Company;

  @Column()
  customerId: string;

  @ManyToOne(() => Customer)
  customer: Customer;

  @Column()
  description: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column()
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date' })
  nextInvoiceDate: Date;

  @Column({ type: 'date', nullable: true })
  lastInvoiceDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'jsonb' })
  template: any;

  @Column({ default: 30 })
  paymentTerms: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### Day 4-5: Payment Gateway Integration

**Files to Create:**

1. **`bms/api-gateway/src/payments/providers/stripe.provider.ts`**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeProvider {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      configService.get('STRIPE_SECRET_KEY'),
      { apiVersion: '2023-10-16' }
    );
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, any>,
  ) {
    return await this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: { enabled: true },
    });
  }

  async confirmPayment(paymentIntentId: string) {
    return await this.stripe.paymentIntents.confirm(paymentIntentId);
  }

  async refundPayment(paymentIntentId: string, amount?: number) {
    return await this.stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );

    return event;
  }
}
```

2. **Update `bms/api-gateway/src/payments/payments.controller.ts`**
```typescript
@Post('stripe/create-intent')
@UseGuards(JwtAuthGuard)
async createStripeIntent(
  @Body() dto: { invoiceId: string; amount: number; currency: string },
  @CompanyId() companyId: string,
) {
  const paymentIntent = await this.stripeProvider.createPaymentIntent(
    dto.amount,
    dto.currency,
    {
      companyId,
      invoiceId: dto.invoiceId,
    },
  );

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
}

@Post('stripe/webhook')
@HttpCode(200)
async handleStripeWebhook(
  @Headers('stripe-signature') signature: string,
  @Req() req: Request,
) {
  const event = await this.stripeProvider.handleWebhook(
    signature,
    req.body,
  );

  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.paymentsService.handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await this.paymentsService.handlePaymentFailure(event.data.object);
      break;
  }

  return { received: true };
}
```

**Commands:**
```bash
npm install stripe
npm install --save-dev @types/stripe
```

**Update `.env`:**
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```


---

## Testing Commands

### Run All Tests
```bash
# Backend tests
cd bms/api-gateway
npm run test

# Frontend tests
cd bms-web
npm run test

# E2E tests
cd bms-web
npm run test:e2e
```

### Manual Testing Checklist

**2FA Testing:**
1. Enable 2FA for a user
2. Scan QR code with authenticator app
3. Verify token works
4. Test backup codes
5. Test login with 2FA

**Cache Testing:**
```bash
# Start Redis
docker-compose up -d redis

# Check Redis is working
redis-cli ping

# Monitor cache hits
redis-cli monitor
```

**Performance Testing:**
```bash
# Install Apache Bench
brew install apache2

# Test API endpoint
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/v1/accounting/trial-balance?companyId=xxx&startDate=2025-01-01&endDate=2025-12-31
```

---

## Deployment Steps

### 1. Update Railway Environment Variables

```bash
# Add new variables
railway variables set REDIS_HOST=redis.railway.internal
railway variables set REDIS_PORT=6379
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Deploy Backend

```bash
cd bms/api-gateway

# Run migrations
railway run npm run migration:run

# Deploy
git add .
git commit -m "feat: add 2FA, Redis cache, and payment integration"
git push origin main

# Railway will auto-deploy
```

### 3. Deploy Frontend

```bash
cd bms-web

# Build
npm run build

# Deploy
git push origin main
```

### 4. Verify Deployment

```bash
# Check health
curl https://your-api.railway.app/api/v1/health

# Check Redis connection
railway run node -e "const redis = require('redis'); const client = redis.createClient({ host: process.env.REDIS_HOST }); client.ping((err, res) => console.log(res));"

# Check database
railway run npm run migration:show
```

---

## Monitoring Setup

### 1. Add Health Checks

**Update `bms/api-gateway/src/health/health.controller.ts`**
```typescript
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
```

### 2. Set Up Logging

**Create `bms/api-gateway/src/common/logger/logger.service.ts`**
```typescript
import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLogger implements LoggerService {
  log(message: string, context?: string) {
    console.log(JSON.stringify({
      level: 'info',
      message,
      context,
      timestamp: new Date().toISOString(),
    }));
  }

  error(message: string, trace?: string, context?: string) {
    console.error(JSON.stringify({
      level: 'error',
      message,
      trace,
      context,
      timestamp: new Date().toISOString(),
    }));
  }

  warn(message: string, context?: string) {
    console.warn(JSON.stringify({
      level: 'warn',
      message,
      context,
      timestamp: new Date().toISOString(),
    }));
  }
}
```

### 3. Add Metrics Endpoint

**Create `bms/api-gateway/src/metrics/metrics.controller.ts`**
```typescript
import { Controller, Get } from '@nestjs/common';
import { register } from 'prom-client';

@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics() {
    return register.metrics();
  }
}
```

---

## Documentation Updates

### 1. Update README.md

Add sections for:
- 2FA setup instructions
- Redis configuration
- Payment gateway setup
- Environment variables reference

### 2. Create API Documentation

```bash
# Generate Swagger docs
cd bms/api-gateway
npm run build
npm run start

# Access at http://localhost:3001/api/docs
```

### 3. Create User Guides

Create in `docs/` folder:
- `docs/user-guide/2fa-setup.md`
- `docs/user-guide/recurring-invoices.md`
- `docs/admin-guide/redis-setup.md`
- `docs/developer-guide/payment-integration.md`

---

## Success Criteria

### Week 1 Completion Checklist
- [ ] 2FA fully implemented and tested
- [ ] Rate limiting active on all endpoints
- [ ] Redis cache integrated and working
- [ ] Database indexes created and verified
- [ ] All tests passing
- [ ] Documentation updated

### Week 2 Completion Checklist
- [ ] PDF invoice generation working
- [ ] Recurring invoices processing daily
- [ ] Stripe payment integration complete
- [ ] Webhook handlers tested
- [ ] Performance improved (< 200ms p95)
- [ ] Deployed to production

### Key Performance Indicators
- API response time: < 200ms (p95)
- Cache hit rate: > 80%
- Database query time: < 50ms (p95)
- Error rate: < 0.1%
- Uptime: > 99.9%

---

## Rollback Plan

If issues occur:

1. **Revert code:**
```bash
git revert HEAD
git push origin main
```

2. **Rollback database:**
```bash
railway run npm run migration:revert
```

3. **Clear Redis cache:**
```bash
railway run redis-cli FLUSHALL
```

4. **Restore from backup:**
```bash
# Contact Railway support for database restore
```

---

## Next Steps (Week 3+)

1. **Document Management**
   - MinIO/S3 integration
   - OCR for invoices
   - Document versioning

2. **Mobile App**
   - React Native setup
   - Offline mode
   - Biometric auth

3. **Banking Integration**
   - Bridge API OAuth
   - Transaction sync
   - Auto-categorization

4. **E-commerce**
   - WooCommerce connector
   - Shopify connector
   - Order sync

---

**Start Date**: November 5, 2025  
**Target Completion**: November 19, 2025  
**Team**: 2-3 developers  
**Status**: 🟢 Ready to start

