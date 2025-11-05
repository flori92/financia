# BMS Immediate Action Plan
**Date:** November 5, 2025  
**Status:** Post-Analysis - Ready for Implementation

---

## ✅ COMPLETED
- Controller route standardization (removed `api/v1` prefix from decorators)

---

## 🔥 CRITICAL ACTIONS (Next 48 Hours)

### 1. Enable Redis Caching (4 hours)
**Why:** Performance and scalability  
**Impact:** HIGH

```bash
cd bms/api-gateway
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
```

**File:** `bms/api-gateway/src/app.module.ts`
```typescript
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

// Add to imports array:
CacheModule.register({
  isGlobal: true,
  store: redisStore,
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  ttl: 600, // 10 minutes
}),
```

---

### 2. Add Environment Variable Validation (2 hours)
**Why:** Prevent runtime errors  
**Impact:** CRITICAL

**Create:** `bms/api-gateway/src/config/env.validation.ts`
```typescript
import { plainToClass } from 'class-transformer';
import { IsString, IsNumber, IsUrl, validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  DATABASE_HOST: string;

  @IsNumber()
  DATABASE_PORT: number;

  @IsString()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  DATABASE_NAME: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Config validation error: ${errors.toString()}`);
  }
  
  return validatedConfig;
}
```

**Update:** `bms/api-gateway/src/app.module.ts`
```typescript
import { validate } from './config/env.validation';

ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: '.env',
  validate, // Add this
}),
```

---

### 3. Set Up Database Backups (4 hours)
**Why:** Data protection  
**Impact:** CRITICAL

**Create:** `scripts/backup-database.sh`
```bash
#!/bin/bash
set -e

# Configuration
BACKUP_DIR="/var/backups/bms"
DB_NAME="${DATABASE_NAME:-bms}"
DB_USER="${DATABASE_USER:-postgres}"
DB_HOST="${DATABASE_HOST:-localhost}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/bms_backup_${TIMESTAMP}.sql.gz"

# Create backup directory
mkdir -p ${BACKUP_DIR}

# Perform backup
echo "Starting backup of ${DB_NAME}..."
PGPASSWORD="${DATABASE_PASSWORD}" pg_dump \
  -h ${DB_HOST} \
  -U ${DB_USER} \
  -d ${DB_NAME} \
  --format=custom \
  --compress=9 \
  | gzip > ${BACKUP_FILE}

echo "Backup completed: ${BACKUP_FILE}"

# Keep only last 30 days of backups
find ${BACKUP_DIR} -name "bms_backup_*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
if [ ! -z "${AWS_S3_BACKUP_BUCKET}" ]; then
  aws s3 cp ${BACKUP_FILE} s3://${AWS_S3_BACKUP_BUCKET}/backups/
  echo "Backup uploaded to S3"
fi
```

**Create:** `scripts/restore-database.sh`
```bash
#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: ./restore-database.sh <backup_file>"
  exit 1
fi

BACKUP_FILE=$1
DB_NAME="${DATABASE_NAME:-bms}"
DB_USER="${DATABASE_USER:-postgres}"
DB_HOST="${DATABASE_HOST:-localhost}"

echo "Restoring ${DB_NAME} from ${BACKUP_FILE}..."

# Drop existing database (WARNING!)
PGPASSWORD="${DATABASE_PASSWORD}" dropdb -h ${DB_HOST} -U ${DB_USER} ${DB_NAME} || true

# Create new database
PGPASSWORD="${DATABASE_PASSWORD}" createdb -h ${DB_HOST} -U ${DB_USER} ${DB_NAME}

# Restore backup
gunzip -c ${BACKUP_FILE} | PGPASSWORD="${DATABASE_PASSWORD}" pg_restore \
  -h ${DB_HOST} \
  -U ${DB_USER} \
  -d ${DB_NAME} \
  --no-owner \
  --no-acl

echo "Restore completed!"
```

**Set up cron job:**
```bash
# Add to crontab
0 2 * * * /path/to/scripts/backup-database.sh >> /var/log/bms-backup.log 2>&1
```

---

### 4. Add Database Indexes (2 hours)
**Why:** Query performance  
**Impact:** HIGH

**Create:** `bms/api-gateway/src/database/migrations/add-performance-indexes.sql`
```sql
-- Performance indexes for common queries

-- Users
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_company_active ON users(company_id, is_active);

-- Invoices
CREATE INDEX IF NOT EXISTS idx_invoices_company_status ON invoices(company_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date) WHERE status != 'paid';

-- Journal Entries
CREATE INDEX IF NOT EXISTS idx_journal_entries_company_date ON journal_entries(company_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_status ON journal_entries(status);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entry_lines_reconciliation ON journal_entry_lines(reconciliation_key) WHERE reconciliation_key IS NOT NULL;

-- Bank Transactions
CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_date ON bank_transactions(bank_account_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_reconciled ON bank_transactions(is_reconciled) WHERE is_reconciled = false;

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_company ON customers(company_id);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(company_id, is_active);

-- Audit Log
CREATE INDEX IF NOT EXISTS idx_audit_log_company_created ON audit_log(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invoices_company_customer_date ON invoices(company_id, customer_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_company_status_date ON journal_entries(company_id, status, entry_date DESC);
```

**Run migration:**
```bash
psql $DATABASE_URL < bms/api-gateway/src/database/migrations/add-performance-indexes.sql
```

---

## 📋 WEEK 1 PRIORITIES (Next 5 Days)

### Day 1-2: Core Accounting Implementation
**Goal:** Complete journal entry posting

**Create:** `bms/api-gateway/src/accounting/services/journal-entry.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from '../entities/journal-entry.entity';
import { JournalEntryLine } from '../entities/journal-entry-line.entity';

@Injectable()
export class JournalEntryService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntryRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalEntryLineRepo: Repository<JournalEntryLine>,
  ) {}

  async createEntry(companyId: string, dto: CreateJournalEntryDto) {
    // Validate balanced entry (debit = credit)
    const totalDebit = dto.lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = dto.lines.reduce((sum, line) => sum + line.credit, 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new Error('Journal entry must be balanced');
    }

    // Create entry
    const entry = this.journalEntryRepo.create({
      companyId,
      entryDate: dto.entryDate,
      reference: dto.reference,
      description: dto.description,
      journalCode: dto.journalCode,
      status: 'draft',
    });

    await this.journalEntryRepo.save(entry);

    // Create lines
    const lines = dto.lines.map(line => 
      this.journalEntryLineRepo.create({
        entryId: entry.id,
        accountId: line.accountId,
        debit: line.debit,
        credit: line.credit,
        label: line.label,
        analyticalSectionId: line.analyticalSectionId,
      })
    );

    await this.journalEntryLineRepo.save(lines);

    return this.findOne(entry.id);
  }

  async postEntry(entryId: string, userId: string) {
    const entry = await this.journalEntryRepo.findOne({
      where: { id: entryId },
      relations: ['lines'],
    });

    if (entry.status !== 'draft') {
      throw new Error('Only draft entries can be posted');
    }

    entry.status = 'posted';
    entry.postedAt = new Date();
    entry.postedBy = userId;

    await this.journalEntryRepo.save(entry);

    // Update account balances
    await this.updateAccountBalances(entry);

    return entry;
  }

  private async updateAccountBalances(entry: JournalEntry) {
    // Update account balances based on entry lines
    for (const line of entry.lines) {
      // Implementation depends on your account balance tracking strategy
    }
  }

  async getGeneralLedger(companyId: string, accountId: string, dateRange: DateRange) {
    return this.journalEntryLineRepo
      .createQueryBuilder('line')
      .innerJoin('line.entry', 'entry')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('line.accountId = :accountId', { accountId })
      .andWhere('entry.status = :status', { status: 'posted' })
      .andWhere('entry.entryDate BETWEEN :startDate AND :endDate', dateRange)
      .orderBy('entry.entryDate', 'ASC')
      .getMany();
  }
}
```

---

### Day 3-4: Payment Gateway Integration
**Goal:** Stripe integration working

**Create:** `bms/api-gateway/src/payments/providers/stripe.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private config: ConfigService) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(
    amount: number,
    currency: string,
    metadata: Record<string, string>,
  ) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });
  }

  async createCustomer(email: string, name: string, metadata: Record<string, string>) {
    return this.stripe.customers.create({
      email,
      name,
      metadata,
    });
  }

  async createSubscription(customerId: string, priceId: string) {
    return this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
    });
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event.data.object);
          break;
        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event.data.object);
          break;
      }

      return { received: true };
    } catch (err) {
      throw new Error(`Webhook Error: ${err.message}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    // Update invoice status
    // Create accounting entry
    // Send notification
  }

  private async handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
    // Log failure
    // Send notification
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
    // Create recurring invoice
  }
}
```

**Create:** `bms/api-gateway/src/payments/webhooks.controller.ts`
```typescript
import { Controller, Post, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './providers/stripe.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private stripeService: StripeService) {}

  @Post('stripe')
  async handleStripeWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.stripeService.handleWebhook(signature, request.rawBody);
  }
}
```

---

### Day 5: Testing & Documentation
**Goal:** Ensure everything works

1. **Test Redis caching**
```bash
# Connect to Redis
redis-cli
> KEYS *
> GET <key>
```

2. **Test database backups**
```bash
./scripts/backup-database.sh
./scripts/restore-database.sh /var/backups/bms/bms_backup_<timestamp>.sql.gz
```

3. **Test journal entries**
```bash
curl -X POST http://localhost:3001/api/v1/accounting/journal-entries \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "entryDate": "2025-11-05",
    "reference": "JE-001",
    "description": "Test entry",
    "journalCode": "GEN",
    "lines": [
      { "accountId": "...", "debit": 1000, "credit": 0, "label": "Debit" },
      { "accountId": "...", "debit": 0, "credit": 1000, "label": "Credit" }
    ]
  }'
```

4. **Test Stripe payment**
```bash
curl -X POST http://localhost:3001/api/v1/payments/create-intent \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "EUR",
    "invoiceId": "..."
  }'
```

5. **Update documentation**
- Add API examples to Swagger
- Update README with new features
- Document environment variables

---

## 🎯 SUCCESS CRITERIA

### Week 1 Complete When:
- ✅ Redis caching is enabled and working
- ✅ Environment validation prevents startup with missing vars
- ✅ Database backups run automatically daily
- ✅ Performance indexes are added
- ✅ Journal entries can be created and posted
- ✅ Stripe payments work end-to-end
- ✅ All tests pass
- ✅ Documentation is updated

---

## 📊 METRICS TO TRACK

### Performance
- API response time (target: < 200ms p95)
- Database query time (target: < 50ms p95)
- Cache hit rate (target: > 70%)

### Reliability
- Backup success rate (target: 100%)
- API uptime (target: > 99.9%)
- Error rate (target: < 0.1%)

### Business
- Journal entries created per day
- Payments processed successfully
- Invoice processing time

---

## 🚨 BLOCKERS & RISKS

### Potential Issues
1. **Redis connection issues** - Ensure Redis is running
2. **Database migration conflicts** - Test in staging first
3. **Stripe webhook verification** - Need HTTPS in production
4. **Performance degradation** - Monitor query times

### Mitigation
- Set up staging environment
- Add comprehensive error logging
- Implement circuit breakers
- Add health checks for all services

---

## 📞 SUPPORT & RESOURCES

### Documentation
- NestJS: https://docs.nestjs.com
- TypeORM: https://typeorm.io
- Stripe: https://stripe.com/docs/api
- Redis: https://redis.io/docs

### Tools
- Database GUI: pgAdmin or DBeaver
- Redis GUI: RedisInsight
- API Testing: Postman or Insomnia
- Monitoring: Prometheus + Grafana

---

## ✅ CHECKLIST

### Before Starting
- [ ] Review comprehensive analysis document
- [ ] Set up development environment
- [ ] Ensure all dependencies are installed
- [ ] Create feature branch: `feature/week-1-critical-fixes`

### During Implementation
- [ ] Write tests for each feature
- [ ] Update API documentation
- [ ] Add error handling
- [ ] Log important events
- [ ] Test in isolation

### Before Merging
- [ ] All tests pass
- [ ] Code review completed
- [ ] Documentation updated
- [ ] Performance tested
- [ ] Security reviewed

---

**Ready to start? Begin with enabling Redis caching!**
