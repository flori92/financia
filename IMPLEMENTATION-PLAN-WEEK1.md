# 🚀 Week 1 Implementation Plan - Critical Security & Infrastructure

**Goal**: Make BMS production-ready with security hardening and infrastructure setup

---

## Day 1: Redis Cache & Rate Limiting

### Task 1.1: Install Dependencies
```bash
cd bms/api-gateway
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
npm install @nestjs/throttler
npm install @nestjs/crypto
```

### Task 1.2: Enable Redis Cache

**File**: `bms/api-gateway/src/app.module.ts`

Add after ConfigModule:
```typescript
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

// In imports array:
CacheModule.registerAsync({
  isGlobal: true,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    store: redisStore,
    host: config.get('REDIS_HOST', 'localhost'),
    port: config.get('REDIS_PORT', 6379),
    ttl: 300, // 5 minutes default
  }),
}),
```

### Task 1.3: Implement Rate Limiting

**File**: `bms/api-gateway/src/common/guards/throttle.guard.ts` (CREATE NEW)
```typescript
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Use user ID if authenticated, otherwise IP
    return req.user?.userId || req.ip;
  }
}
```

**File**: `bms/api-gateway/src/app.module.ts`

Add ThrottlerModule:
```typescript
import { ThrottlerModule } from '@nestjs/throttler';

ThrottlerModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    ttl: config.get('RATE_LIMIT_TTL', 60),
    limit: config.get('RATE_LIMIT_MAX', 100),
  }),
}),
```

---

## Day 2: Data Encryption & Session Management

### Task 2.1: Create Encryption Service

**File**: `bms/api-gateway/src/common/services/encryption.service.ts` (CREATE NEW)

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(private config: ConfigService) {
    const secret = this.config.get('ENCRYPTION_KEY');
    this.key = crypto.scryptSync(secret, 'salt', 32);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedText: string): string {
    const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

### Task 2.2: Create Session Entity

**File**: `bms/api-gateway/src/auth/entities/session.entity.ts` (CREATE NEW)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('user_sessions')
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @Column({ name: 'token_hash' })
  tokenHash: string;

  @Column({ type: 'jsonb', nullable: true, name: 'device_info' })
  deviceInfo: any;

  @Column({ type: 'inet', nullable: true, name: 'ip_address' })
  ipAddress: string;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

### Task 2.3: Update .env.example

**File**: `bms/api-gateway/.env.example`

Add:
```bash
# Encryption
ENCRYPTION_KEY=your-32-character-encryption-key-change-this

# Session
SESSION_DURATION=7d
MAX_SESSIONS_PER_USER=5
```

---

## Day 3: Database Migrations & Schema Updates

### Task 3.1: Enable Migrations

**File**: `bms/api-gateway/src/app.module.ts`

Change:
```typescript
synchronize: config.get('NODE_ENV') === 'development',
migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
migrationsRun: true,
```

### Task 3.2: Create Missing Tables Migration

**File**: `bms/api-gateway/src/migrations/1730900000000-AddSecurityTables.ts` (CREATE NEW)

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSecurityTables1730900000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // User Sessions
    await queryRunner.query(`
      CREATE TABLE user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash VARCHAR(255) NOT NULL,
        device_info JSONB,
        ip_address INET,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX idx_sessions_user ON user_sessions(user_id);
      CREATE INDEX idx_sessions_expires ON user_sessions(expires_at);
    `);

    // API Keys
    await queryRunner.query(`
      CREATE TABLE api_keys (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        key_hash VARCHAR(255) NOT NULL UNIQUE,
        permissions TEXT[],
        last_used_at TIMESTAMP,
        expires_at TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX idx_api_keys_company ON api_keys(company_id);
    `);

    // Webhooks
    await queryRunner.query(`
      CREATE TABLE webhooks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        events TEXT[] NOT NULL,
        secret VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX idx_webhooks_company ON webhooks(company_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS webhooks CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS api_keys CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS user_sessions CASCADE;`);
  }
}
```

### Task 3.3: Add Performance Indexes

**File**: `bms/api-gateway/src/migrations/1730900100000-AddPerformanceIndexes.ts` (CREATE NEW)

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerformanceIndexes1730900100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Accounting indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_journal_entries_company_date 
      ON journal_entries(company_id, entry_date DESC);
    `);

    // Invoice indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_invoices_customer_date 
      ON invoices(customer_id, invoice_date DESC);
    `);

    // Banking indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_bank_transactions_account_date 
      ON bank_transactions(bank_account_id, transaction_date DESC);
    `);

    // Audit log indexes
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_audit_log_company_created 
      ON audit_log(company_id, created_at DESC);
    `);

    // Full-text search
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_customers_name_search 
      ON customers USING gin(to_tsvector('french', name));
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_journal_entries_company_date;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_invoices_customer_date;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_bank_transactions_account_date;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_audit_log_company_created;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_customers_name_search;`);
  }
}
```

---

## Day 4: Database Replication & Backups

### Task 4.1: Configure Read Replicas

**File**: `bms/api-gateway/src/app.module.ts`

Update TypeORM config:
```typescript
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    replication: {
      master: {
        host: config.get('DB_HOST', 'localhost'),
        port: config.get('DB_PORT', 5432),
        username: config.get('DB_USER', 'bms'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME', 'bms'),
      },
      slaves: [
        {
          host: config.get('DB_REPLICA_HOST', 'localhost'),
          port: config.get('DB_REPLICA_PORT', 5432),
          username: config.get('DB_USER', 'bms'),
          password: config.get('DB_PASSWORD'),
          database: config.get('DB_NAME', 'bms'),
        },
      ],
    },
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: config.get('NODE_ENV') === 'development',
    migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
    migrationsRun: true,
    logging: config.get('NODE_ENV') === 'development',
    extra: {
      max: 20, // Connection pool size
      connectionTimeoutMillis: 5000,
    },
  }),
}),
```

### Task 4.2: Create Backup Script

**File**: `bms/api-gateway/scripts/backup-database.sh` (CREATE NEW)

```bash
#!/bin/bash

# Database backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/bms"
DB_NAME="${DB_NAME:-bms}"
DB_USER="${DB_USER:-bms}"
DB_HOST="${DB_HOST:-localhost}"

mkdir -p $BACKUP_DIR

# Full backup
pg_dump -h $DB_HOST -U $DB_USER -F c -b -v -f "$BACKUP_DIR/bms_$DATE.backup" $DB_NAME

# Compress
gzip "$BACKUP_DIR/bms_$DATE.backup"

# Keep only last 30 days
find $BACKUP_DIR -name "bms_*.backup.gz" -mtime +30 -delete

echo "Backup completed: bms_$DATE.backup.gz"
```

### Task 4.3: Setup Cron Job

**File**: `bms/api-gateway/scripts/setup-cron.sh` (CREATE NEW)

```bash
#!/bin/bash

# Add to crontab
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/bms/api-gateway/scripts/backup-database.sh") | crontab -

echo "Cron job added: Daily backup at 2 AM"
```

---

## Day 5: Testing & Validation

### Task 5.1: Security Tests

**File**: `bms/api-gateway/test/security.e2e-spec.ts` (CREATE NEW)

```typescript
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Security Tests (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should enforce rate limiting', async () => {
    const requests = Array(110).fill(null).map(() =>
      request(app.getHttpServer()).get('/api/v1/health')
    );

    const responses = await Promise.all(requests);
    const tooManyRequests = responses.filter(r => r.status === 429);
    
    expect(tooManyRequests.length).toBeGreaterThan(0);
  });

  it('should require authentication for protected routes', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/invoices')
      .expect(401);
  });

  it('should validate JWT tokens', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/invoices')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Task 5.2: Run Security Audit

```bash
# NPM audit
npm audit

# Check for outdated packages
npm outdated

# Run security tests
npm run test:e2e -- security.e2e-spec.ts
```

### Task 5.3: Validation Checklist

- [ ] Redis cache working
- [ ] Rate limiting active
- [ ] Encryption service functional
- [ ] Database migrations run successfully
- [ ] Indexes created
- [ ] Backup script tested
- [ ] All tests passing
- [ ] No critical vulnerabilities

---

## Success Criteria

✅ Redis cache operational with <10ms latency  
✅ Rate limiting blocks excessive requests  
✅ Data encryption working for sensitive fields  
✅ Database migrations automated  
✅ Performance indexes improve query speed by >50%  
✅ Automated backups running daily  
✅ All security tests passing  
✅ Zero critical vulnerabilities

---

## Next Week Preview

Week 2 will focus on:
- OAuth2/OIDC implementation
- Row-level security
- API key management
- GDPR compliance features
- Session management UI

