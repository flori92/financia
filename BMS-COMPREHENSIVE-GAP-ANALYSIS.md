# 🔍 BMS Comprehensive Gap Analysis & Recommendations

**Date**: November 5, 2025  
**Version**: 1.0  
**Status**: Complete Analysis

---

## 📋 Executive Summary

The BMS project has a **solid foundation** with extensive module scaffolding but requires significant implementation work to meet enterprise-grade requirements. Current state: **~40% complete**.

### Key Findings
- ✅ **Strong Architecture**: NestJS backend, Next.js frontend, proper module structure
- ⚠️ **Mock Data Dependency**: Most modules return mock data instead of real database operations
- ❌ **Missing Critical Features**: Multi-tenancy isolation, proper RBAC, encryption, backups
- ⚠️ **Security Gaps**: Basic auth implemented, but missing 2FA enforcement, encryption at rest
- ❌ **Integration Gaps**: Banking, e-commerce, payment gateways not fully implemented
- ⚠️ **Mobile Apps**: Structure exists but incomplete

---

## 🎯 Current Implementation Status

### ✅ IMPLEMENTED (40%)

#### Backend Architecture
- NestJS framework with TypeORM
- Module structure (35+ modules)
- Basic JWT authentication
- Swagger API documentation
- Health checks
- Audit logging structure

#### Core Modules (Partial)
- **Accounting**: Controllers, services, entities defined
- **Invoicing**: Basic CRUD operations
- **CRM**: Contacts, opportunities, pipeline
- **Banking**: Transaction structure, reconciliation logic
- **Treasury**: Cash flow forecasting
- **Tax**: VAT calculation framework
- **Communications**: Email/SMS/WhatsApp structure
- **Users**: Basic user management
- **RBAC**: Roles and permissions entities

#### Frontend
- 69 pages implemented
- Modern UI with Tailwind CSS
- Responsive design
- Dashboard with KPIs
- Centralized API client (`lib/api.ts`)

### ⚠️ PARTIALLY IMPLEMENTED (30%)

#### Database
- Schema defined in SQL
- TypeORM entities created
- **Missing**: Migrations not applied, synchronize disabled
- **Missing**: Data seeding incomplete
- **Missing**: Indexes optimization

#### Multi-Tenancy
- TenantMiddleware exists
- Company entity defined
- **Missing**: Row-level security enforcement
- **Missing**: Data isolation validation
- **Missing**: Tenant context propagation to all queries

#### Authentication & Security
- JWT tokens implemented
- Password hashing with bcrypt
- 2FA structure exists (TwoFactorService)
- **Missing**: 2FA enforcement
- **Missing**: Session management
- **Missing**: Password policies
- **Missing**: Account lockout
- **Missing**: Encryption at rest

#### RBAC (Role-Based Access Control)
- Permission and Role entities defined
- PermissionsGuard created
- **Missing**: Permission seeding
- **Missing**: Role assignment UI
- **Missing**: Granular permission checks in services
- **Issue**: Frontend bypasses RBAC (see bank/page.tsx TODO)

### ❌ NOT IMPLEMENTED (30%)

#### Critical Missing Features

**1. Data Persistence**
- Most services return mock data
- Database queries not fully implemented
- No real CRUD operations in many modules

**2. Banking Integrations**
- Budget Insight: Not implemented
- Bridge API: Not implemented
- EBICS: Not implemented
- Open Banking: Not implemented
- SEPA import: Structure exists, needs implementation

**3. E-commerce Integrations**
- WooCommerce: Not implemented
- Shopify: Not implemented
- PrestaShop: Not implemented

**4. Payment Gateways**
- Stripe: Structure exists, needs API integration
- PayPal: Structure exists, needs API integration
- SEPA: Partial implementation

**5. Mobile Apps**
- iOS/Android structure exists
- Offline mode: Not implemented
- Sync mechanism: Partial (BullQueue setup exists)

**6. Advanced Features**
- Document OCR: Tesseract.js imported but not integrated
- Workflow automation: Structure exists, needs rules engine
- Multi-language: Not implemented
- Dark mode: Not implemented
- GraphQL API: Not implemented

**7. Infrastructure**
- Redis caching: Disabled in app.module.ts
- Message queues: BullMQ setup but not used
- Backups: Not configured
- Monitoring: Prometheus service exists but not integrated
- Logging: Basic console logging only

---

## 🚨 Critical Issues Identified

### 1. **RBAC Not Enforced** (CRITICAL)
**File**: `bms-web/src/app/accountant/bank/page.tsx`
```typescript
// TODO: Réactiver après configuration RBAC backend
// if (err?.message === 'PERMISSION_DENIED') {
//   setPermissionDenied(true);
// }
```
**Impact**: Users can access features they shouldn't
**Priority**: P0 - Must fix immediately

### 2. **Mock Data in Production** (CRITICAL)
**Evidence**: `server-mock.js` used instead of real database
**Impact**: No data persistence, not production-ready
**Priority**: P0 - Blocks production deployment

### 3. **Database Synchronize Disabled** (HIGH)
**File**: `bms/api-gateway/src/app.module.ts`
```typescript
synchronize: false, // Désactivé temporairement pour éviter erreurs de migration
```
**Impact**: Schema changes not applied, entities not created
**Priority**: P1 - Blocks development

### 4. **Redis Cache Disabled** (MEDIUM)
**Evidence**: Commented out in app.module.ts
**Impact**: Poor performance, no caching layer
**Priority**: P2 - Performance issue

### 5. **No Data Encryption** (HIGH)
**Impact**: Sensitive data stored in plaintext
**Priority**: P1 - Security risk

---

## 📊 Feature Completeness Matrix

| Feature Category | Required | Implemented | Complete % | Priority |
|-----------------|----------|-------------|------------|----------|
| **Core Accounting** | ✓ | Partial | 60% | P0 |
| **Invoicing** | ✓ | Partial | 50% | P0 |
| **CRM** | ✓ | Partial | 55% | P0 |
| **Multi-Tenancy** | ✓ | Partial | 40% | P0 |
| **RBAC** | ✓ | Partial | 30% | P0 |
| **Authentication** | ✓ | Yes | 70% | P1 |
| **2FA/MFA** | ✓ | Structure | 20% | P1 |
| **Encryption** | ✓ | No | 0% | P0 |
| **Audit Logging** | ✓ | Structure | 40% | P1 |
| **Banking Integration** | ✓ | No | 0% | P2 |
| **Payment Gateways** | ✓ | Structure | 10% | P1 |
| **E-commerce Integration** | ✓ | No | 0% | P3 |
| **Mobile Apps** | ✓ | Structure | 20% | P2 |
| **Document OCR** | ✓ | No | 0% | P2 |
| **Workflow Automation** | ✓ | Structure | 15% | P2 |
| **Analytics/Reporting** | ✓ | Partial | 45% | P1 |
| **Tax/Fiscal** | ✓ | Partial | 50% | P0 |
| **Treasury** | ✓ | Partial | 55% | P1 |
| **Purchases** | ✓ | Partial | 40% | P1 |
| **Inventory** | ✓ | Structure | 30% | P2 |
| **HR Module** | ✓ | Structure | 25% | P2 |
| **Redis Cache** | ✓ | Disabled | 0% | P1 |
| **Message Queues** | ✓ | Setup | 20% | P2 |
| **Backups** | ✓ | No | 0% | P1 |
| **Monitoring** | ✓ | Structure | 15% | P2 |
| **GraphQL API** | Optional | No | 0% | P3 |
| **Multi-language** | ✓ | No | 0% | P2 |
| **Dark Mode** | Optional | No | 0% | P3 |

**Overall Completion**: ~35-40%

---

## 🎯 Prioritized Recommendations

### 🔴 PHASE 1: Critical Foundation (Weeks 1-4)

#### 1.1 Database & Persistence (Week 1)
**Priority**: P0 - CRITICAL

**Actions**:
```bash
# Enable database synchronization
# File: bms/api-gateway/src/app.module.ts
synchronize: config.get('NODE_ENV') === 'development',

# Run migrations
npm run typeorm migration:run

# Seed initial data
npm run seed
```

**Files to modify**:
- `bms/api-gateway/src/app.module.ts` - Enable synchronize
- `bms/api-gateway/src/database/seeds/*.ts` - Complete seed data
- Create migration files for all entities

**Implementation**:
1. Create proper TypeORM migrations
2. Implement repository pattern in all services
3. Replace mock data with real database queries
4. Add transaction support for complex operations

#### 1.2 Multi-Tenancy Enforcement (Week 1-2)
**Priority**: P0 - CRITICAL

**Files to create/modify**:
```typescript
// bms/api-gateway/src/common/decorators/tenant.decorator.ts
export const TenantScope = () => SetMetadata('tenantScope', true);

// bms/api-gateway/src/common/interceptors/tenant.interceptor.ts
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const companyId = request.user?.companyId;
    
    // Inject companyId into all queries
    return next.handle();
  }
}
```

**Implementation**:
1. Add `@TenantScope()` decorator to all controllers
2. Create base repository with tenant filtering
3. Add database-level row security (PostgreSQL RLS)
4. Validate tenant isolation in tests

#### 1.3 RBAC Implementation (Week 2)
**Priority**: P0 - CRITICAL

**Files to create**:
```typescript
// bms/api-gateway/src/rbac/seeds/permissions.seed.ts
export const PERMISSIONS = {
  // Accounting
  'accounting:read': 'View accounting data',
  'accounting:write': 'Create/edit accounting entries',
  'accounting:delete': 'Delete accounting entries',
  'accounting:close': 'Close accounting periods',
  
  // Banking
  'banking:read': 'View bank transactions',
  'banking:reconcile': 'Reconcile bank transactions',
  'banking:import': 'Import bank statements',
  
  // Invoices
  'invoices:read': 'View invoices',
  'invoices:write': 'Create/edit invoices',
  'invoices:send': 'Send invoices to customers',
  
  // ... more permissions
};

// bms/api-gateway/src/rbac/seeds/roles.seed.ts
export const ROLES = {
  ADMIN: {
    name: 'Administrator',
    permissions: ['*'], // All permissions
  },
  ACCOUNTANT: {
    name: 'Expert Comptable',
    permissions: [
      'accounting:*',
      'banking:*',
      'invoices:read',
      'tax:*',
    ],
  },
  ENTREPRENEUR: {
    name: 'Entrepreneur',
    permissions: [
      'invoices:*',
      'crm:*',
      'accounting:read',
    ],
  },
};
```

**Implementation**:
1. Seed permissions and roles
2. Enforce PermissionsGuard on all routes
3. Add `@RequirePermissions()` decorator
4. Update frontend to respect permissions
5. Remove RBAC bypass in `bank/page.tsx`

#### 1.4 Security Hardening (Week 3)
**Priority**: P0 - CRITICAL

**Encryption at Rest**:
```typescript
// bms/api-gateway/src/common/services/encryption.service.ts
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key: Buffer;

  constructor(private config: ConfigService) {
    this.key = Buffer.from(config.get('ENCRYPTION_KEY'), 'hex');
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encrypted: string): string {
    const [ivHex, authTagHex, encryptedText] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

**2FA Enforcement**:
```typescript
// bms/api-gateway/src/auth/guards/2fa.guard.ts
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

**Implementation**:
1. Encrypt sensitive fields (bank accounts, passwords, API keys)
2. Enforce 2FA for admin and accountant roles
3. Add password policies (complexity, expiration)
4. Implement account lockout after failed attempts
5. Add session management with Redis
6. Enable HTTPS in production
7. Add rate limiting per user/IP

#### 1.5 Core Module Implementation (Week 3-4)
**Priority**: P0 - CRITICAL

**Accounting Module**:
```typescript
// bms/api-gateway/src/accounting/accounting.service.ts
@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(JournalEntry) private entryRepo: Repository<JournalEntry>,
    @InjectRepository(Account) private accountRepo: Repository<Account>,
    private tenantService: TenantService,
  ) {}

  async createJournalEntry(dto: CreateJournalEntryDto): Promise<JournalEntry> {
    const companyId = this.tenantService.getCurrentTenantId();
    
    // Validate balanced entry
    const totalDebit = dto.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = dto.lines.reduce((sum, l) => sum + l.credit, 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException('Entry must be balanced');
    }
    
    // Create entry with lines
    const entry = this.entryRepo.create({
      ...dto,
      companyId,
      status: 'draft',
    });
    
    return this.entryRepo.save(entry);
  }

  async getGeneralLedger(companyId: string, filters: any): Promise<any> {
    // Real database query
    return this.entryRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'lines')
      .leftJoinAndSelect('lines.account', 'account')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.status = :status', { status: 'posted' })
      .orderBy('entry.entryDate', 'DESC')
      .getMany();
  }
}
```

**Files to implement**:
- `accounting.service.ts` - Real CRUD operations
- `invoices.service.ts` - Invoice generation, PDF export
- `crm.service.ts` - Contact management, pipeline
- `banking.service.ts` - Transaction import, reconciliation
- `tax.service.ts` - VAT calculation, declarations
- `treasury.service.ts` - Cash flow forecasting

---

### 🟡 PHASE 2: Essential Features (Weeks 5-8)

#### 2.1 Redis Caching (Week 5)
**Priority**: P1 - HIGH

**Implementation**:
```typescript
// bms/api-gateway/src/app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

CacheModule.registerAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    store: redisStore,
    host: config.get('REDIS_HOST'),
    port: config.get('REDIS_PORT'),
    ttl: 300, // 5 minutes default
  }),
}),

// Usage in services
@Injectable()
export class AccountingService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getChartOfAccounts(companyId: string) {
    const cacheKey = `chart_of_accounts:${companyId}`;
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;

    const accounts = await this.accountRepo.find({ where: { companyId } });
    await this.cache.set(cacheKey, accounts, 3600); // 1 hour
    return accounts;
  }
}
```

**Cache Strategy**:
- Chart of accounts: 1 hour
- User permissions: 15 minutes
- Dashboard KPIs: 5 minutes
- Reports: 10 minutes
- Invalidate on data changes

#### 2.2 Payment Gateway Integration (Week 5-6)
**Priority**: P1 - HIGH

**Stripe Integration**:
```typescript
// bms/api-gateway/src/payments/providers/stripe.provider.ts
import Stripe from 'stripe';

@Injectable()
export class StripeProvider {
  private stripe: Stripe;

  constructor(private config: ConfigService) {
    this.stripe = new Stripe(config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(amount: number, currency: string, metadata: any) {
    return this.stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
    });
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      this.config.get('STRIPE_WEBHOOK_SECRET'),
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
    }
  }
}
```

**Files to create**:
- `payments/providers/stripe.provider.ts`
- `payments/providers/paypal.provider.ts`
- `payments/providers/sepa.provider.ts`
- `payments/webhooks.controller.ts`

#### 2.3 Document OCR (Week 6)
**Priority**: P2 - MEDIUM

**Implementation**:
```typescript
// bms/api-gateway/src/ai/services/ocr.service.ts
import Tesseract from 'tesseract.js';

@Injectable()
export class OCRService {
  async extractInvoiceData(imageBuffer: Buffer): Promise<InvoiceData> {
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'fra');
    
    // Parse invoice fields using regex and AI
    const invoiceNumber = this.extractInvoiceNumber(text);
    const date = this.extractDate(text);
    const amount = this.extractAmount(text);
    const supplier = this.extractSupplier(text);
    
    return {
      invoiceNumber,
      date,
      amount,
      supplier,
      rawText: text,
      confidence: 0.85,
    };
  }

  private extractInvoiceNumber(text: string): string {
    const patterns = [
      /facture\s*n[°o]?\s*:?\s*([A-Z0-9-]+)/i,
      /invoice\s*#?\s*:?\s*([A-Z0-9-]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  }
}
```

**Integration with AI**:
```typescript
// Use Ollama for intelligent field extraction
async enhanceOCRWithAI(rawText: string): Promise<InvoiceData> {
  const prompt = `Extract invoice data from this text:
${rawText}

Return JSON with: invoiceNumber, date, amount, supplier, items[]`;

  const response = await this.aiService.chat(prompt);
  return JSON.parse(response);
}
```

#### 2.4 Audit Logging Enhancement (Week 7)
**Priority**: P1 - HIGH

**Complete Implementation**:
```typescript
// bms/api-gateway/src/audit/audit.service.ts
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) {}

  async log(entry: AuditLogEntry): Promise<void> {
    await this.auditRepo.save({
      ...entry,
      timestamp: new Date(),
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    });
  }

  async getAuditTrail(filters: AuditFilters): Promise<AuditLog[]> {
    const query = this.auditRepo.createQueryBuilder('audit');
    
    if (filters.entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
    }
    
    if (filters.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }
    
    if (filters.startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate: filters.startDate });
    }
    
    return query.orderBy('audit.timestamp', 'DESC').getMany();
  }
}
```

**Track All Changes**:
- User actions (login, logout, password change)
- Data modifications (create, update, delete)
- Permission changes
- Configuration changes
- Failed access attempts
- Export operations

#### 2.5 Backup & Recovery (Week 7-8)
**Priority**: P1 - HIGH

**Automated Backups**:
```bash
# scripts/backup-database.sh
#!/bin/bash

BACKUP_DIR="/var/backups/bms"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DB_NAME="bms"

# Create backup
pg_dump -U bms -h localhost $DB_NAME | gzip > "$BACKUP_DIR/bms_$TIMESTAMP.sql.gz"

# Upload to S3/MinIO
aws s3 cp "$BACKUP_DIR/bms_$TIMESTAMP.sql.gz" s3://bms-backups/

# Keep only last 30 days locally
find $BACKUP_DIR -name "bms_*.sql.gz" -mtime +30 -delete

# Verify backup integrity
gunzip -t "$BACKUP_DIR/bms_$TIMESTAMP.sql.gz"
```

**Cron Schedule**:
```cron
# Daily backup at 2 AM
0 2 * * * /app/scripts/backup-database.sh

# Weekly full backup on Sunday
0 3 * * 0 /app/scripts/backup-full.sh
```

**Recovery Procedure**:
```bash
# scripts/restore-database.sh
#!/bin/bash

BACKUP_FILE=$1

# Stop application
docker-compose stop api-gateway

# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS bms;"
psql -U postgres -c "CREATE DATABASE bms;"

# Restore backup
gunzip -c $BACKUP_FILE | psql -U bms bms

# Restart application
docker-compose start api-gateway
```

---

### 🟢 PHASE 3: Integrations (Weeks 9-12)

#### 3.1 Banking Integration (Week 9-10)
**Priority**: P2 - MEDIUM

**Budget Insight Integration**:
```typescript
// bms/api-gateway/src/integrations/banking/budget-insight.service.ts
import axios from 'axios';

@Injectable()
export class BudgetInsightService {
  private apiUrl = 'https://api.budgetinsight.com/2.0';
  private clientId: string;
  private clientSecret: string;

  async connectBank(userId: string, bankId: string): Promise<Connection> {
    const token = await this.getAccessToken();
    
    const response = await axios.post(
      `${this.apiUrl}/users/${userId}/connections`,
      { id_connector: bankId },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return response.data;
  }

  async syncTransactions(connectionId: string): Promise<Transaction[]> {
    const token = await this.getAccessToken();
    
    const response = await axios.get(
      `${this.apiUrl}/users/${userId}/connections/${connectionId}/transactions`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    return response.data.transactions.map(this.mapTransaction);
  }

  private mapTransaction(tx: any): Transaction {
    return {
      id: tx.id,
      date: new Date(tx.date),
      amount: tx.value,
      label: tx.original_wording,
      category: tx.category?.name,
      type: tx.type,
    };
  }
}
```

**Files to create**:
- `integrations/banking/budget-insight.service.ts`
- `integrations/banking/bridge-api.service.ts`
- `integrations/banking/ebics.service.ts`
- `integrations/banking/open-banking.service.ts`

#### 3.2 E-commerce Integration (Week 10-11)
**Priority**: P3 - LOW

**WooCommerce Integration**:
```typescript
// bms/api-gateway/src/integrations/ecommerce/woocommerce.service.ts
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

@Injectable()
export class WooCommerceService {
  private api: WooCommerceRestApi;

  constructor(private config: ConfigService) {
    this.api = new WooCommerceRestApi({
      url: config.get('WOOCOMMERCE_URL'),
      consumerKey: config.get('WOOCOMMERCE_KEY'),
      consumerSecret: config.get('WOOCOMMERCE_SECRET'),
      version: 'wc/v3',
    });
  }

  async syncOrders(companyId: string): Promise<void> {
    const { data: orders } = await this.api.get('orders', {
      per_page: 100,
      status: 'processing',
    });

    for (const order of orders) {
      await this.createInvoiceFromOrder(companyId, order);
    }
  }

  private async createInvoiceFromOrder(companyId: string, order: any) {
    // Map WooCommerce order to BMS invoice
    const invoice = {
      companyId,
      customerName: `${order.billing.first_name} ${order.billing.last_name}`,
      customerEmail: order.billing.email,
      invoiceNumber: `WC-${order.number}`,
      date: new Date(order.date_created),
      items: order.line_items.map(item => ({
        description: item.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.price),
        amount: parseFloat(item.total),
      })),
      total: parseFloat(order.total),
      status: 'paid',
    };

    await this.invoicesService.create(invoice);
  }
}
```

**Similar implementations for**:
- Shopify
- PrestaShop
- Magento

#### 3.3 Workflow Automation (Week 11-12)
**Priority**: P2 - MEDIUM

**Workflow Engine**:
```typescript
// bms/api-gateway/src/automation/workflow-engine.service.ts
@Injectable()
export class WorkflowEngineService {
  async executeWorkflow(workflowId: string, context: any): Promise<void> {
    const workflow = await this.getWorkflow(workflowId);
    
    for (const step of workflow.steps) {
      const result = await this.executeStep(step, context);
      
      if (step.condition && !this.evaluateCondition(step.condition, result)) {
        break;
      }
      
      context = { ...context, ...result };
    }
  }

  private async executeStep(step: WorkflowStep, context: any): Promise<any> {
    switch (step.type) {
      case 'send_email':
        return this.sendEmail(step.config, context);
      case 'create_invoice':
        return this.createInvoice(step.config, context);
      case 'update_status':
        return this.updateStatus(step.config, context);
      case 'call_webhook':
        return this.callWebhook(step.config, context);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }
}
```

**Example Workflows**:
1. **Invoice Overdue Reminder**:
   - Trigger: Daily cron
   - Condition: Invoice due date > 7 days ago
   - Action: Send email reminder

2. **New Customer Welcome**:
   - Trigger: Customer created
   - Action: Send welcome email
   - Action: Create first invoice

3. **Low Stock Alert**:
   - Trigger: Stock level < minimum
   - Action: Send notification
   - Action: Create purchase order

---

### 🔵 PHASE 4: Advanced Features (Weeks 13-16)

#### 4.1 Mobile App Completion (Week 13-14)
**Priority**: P2 - MEDIUM

**Offline Mode**:
```typescript
// bms/mobile/src/services/offline-sync.service.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export class OfflineSyncService {
  private queue: SyncOperation[] = [];

  async saveOffline(operation: SyncOperation): Promise<void> {
    this.queue.push(operation);
    await AsyncStorage.setItem('sync_queue', JSON.stringify(this.queue));
  }

  async syncWhenOnline(): Promise<void> {
    const isConnected = await NetInfo.fetch().then(state => state.isConnected);
    
    if (!isConnected) return;

    const queue = await this.loadQueue();
    
    for (const operation of queue) {
      try {
        await this.executeOperation(operation);
        this.removeFromQueue(operation.id);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }

  private async executeOperation(op: SyncOperation): Promise<void> {
    switch (op.type) {
      case 'CREATE':
        await api.post(op.endpoint, op.data);
        break;
      case 'UPDATE':
        await api.put(op.endpoint, op.data);
        break;
      case 'DELETE':
        await api.delete(op.endpoint);
        break;
    }
  }
}
```

**Local Database**:
```typescript
// Use SQLite for offline storage
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'bms.db' });

// Cache frequently accessed data
await db.executeSql(`
  CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    data TEXT,
    synced INTEGER DEFAULT 0,
    updated_at INTEGER
  )
`);
```

#### 4.2 Multi-language Support (Week 14)
**Priority**: P2 - MEDIUM

**i18n Setup**:
```typescript
// bms-web/src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: require('./locales/fr.json') },
      en: { translation: require('./locales/en.json') },
      pt: { translation: require('./locales/pt.json') }, // Portuguese for Angola
    },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
  });

// Usage
import { useTranslation } from 'react-i18next';

function Component() {
  const { t } = useTranslation();
  return <h1>{t('dashboard.title')}</h1>;
}
```

**Translation Files**:
```json
// bms-web/src/i18n/locales/fr.json
{
  "dashboard": {
    "title": "Tableau de bord",
    "revenue": "Chiffre d'affaires",
    "expenses": "Dépenses"
  },
  "invoices": {
    "title": "Factures",
    "create": "Créer une facture",
    "status": {
      "draft": "Brouillon",
      "sent": "Envoyée",
      "paid": "Payée"
    }
  }
}
```

#### 4.3 GraphQL API (Week 15)
**Priority**: P3 - LOW

**Setup**:
```typescript
// bms/api-gateway/src/graphql/schema.graphql
type Invoice {
  id: ID!
  invoiceNumber: String!
  customer: Customer!
  date: DateTime!
  dueDate: DateTime
  status: InvoiceStatus!
  items: [InvoiceItem!]!
  subtotal: Float!
  vatAmount: Float!
  totalAmount: Float!
}

type Query {
  invoices(companyId: ID!, filters: InvoiceFilters): [Invoice!]!
  invoice(id: ID!): Invoice
}

type Mutation {
  createInvoice(input: CreateInvoiceInput!): Invoice!
  updateInvoice(id: ID!, input: UpdateInvoiceInput!): Invoice!
  deleteInvoice(id: ID!): Boolean!
}
```

**Resolver**:
```typescript
// bms/api-gateway/src/graphql/resolvers/invoice.resolver.ts
@Resolver(() => Invoice)
export class InvoiceResolver {
  constructor(private invoicesService: InvoicesService) {}

  @Query(() => [Invoice])
  async invoices(
    @Args('companyId') companyId: string,
    @Args('filters', { nullable: true }) filters?: InvoiceFilters,
  ): Promise<Invoice[]> {
    return this.invoicesService.findAll(companyId, filters);
  }

  @Mutation(() => Invoice)
  async createInvoice(
    @Args('input') input: CreateInvoiceInput,
  ): Promise<Invoice> {
    return this.invoicesService.create(input);
  }
}
```

#### 4.4 Advanced Analytics (Week 15-16)
**Priority**: P2 - MEDIUM

**Business Intelligence**:
```typescript
// bms/api-gateway/src/reporting/services/analytics.service.ts
@Injectable()
export class AnalyticsService {
  async getRevenueAnalysis(companyId: string, period: Period): Promise<RevenueAnalysis> {
    const invoices = await this.getInvoicesForPeriod(companyId, period);
    
    return {
      totalRevenue: this.sum(invoices, 'totalAmount'),
      revenueByMonth: this.groupByMonth(invoices),
      revenueByCustomer: this.groupByCustomer(invoices),
      revenueByProduct: this.groupByProduct(invoices),
      growthRate: this.calculateGrowthRate(invoices),
      forecast: await this.forecastRevenue(invoices),
    };
  }

  async getCashFlowAnalysis(companyId: string): Promise<CashFlowAnalysis> {
    const transactions = await this.getBankTransactions(companyId);
    
    return {
      currentBalance: this.getCurrentBalance(transactions),
      inflows: this.getInflows(transactions),
      outflows: this.getOutflows(transactions),
      netCashFlow: this.calculateNetCashFlow(transactions),
      forecast: await this.forecastCashFlow(transactions),
      burnRate: this.calculateBurnRate(transactions),
      runway: this.calculateRunway(transactions),
    };
  }

  private async forecastRevenue(historicalData: Invoice[]): Promise<Forecast> {
    // Use TensorFlow.js for ML-based forecasting
    const model = await this.trainForecastModel(historicalData);
    return model.predict(/* next 12 months */);
  }
}
```

**Dashboard Widgets**:
- Revenue trends with ML forecasting
- Cash flow runway calculator
- Customer lifetime value (CLV)
- Churn prediction
- Inventory optimization
- Profitability by product/service

---

## 🏗️ Infrastructure Improvements

### Database Optimization

**Indexes**:
```sql
-- Add performance indexes
CREATE INDEX CONCURRENTLY idx_journal_entries_company_date 
  ON journal_entries(company_id, entry_date DESC);

CREATE INDEX CONCURRENTLY idx_invoices_customer_status 
  ON invoices(customer_id, status) WHERE status != 'cancelled';

CREATE INDEX CONCURRENTLY idx_bank_transactions_reconciled 
  ON bank_transactions(bank_account_id, is_reconciled, transaction_date DESC);

CREATE INDEX CONCURRENTLY idx_audit_log_entity 
  ON audit_log(entity_type, entity_id, created_at DESC);

-- Partial indexes for common queries
CREATE INDEX CONCURRENTLY idx_invoices_unpaid 
  ON invoices(company_id, due_date) WHERE status IN ('sent', 'overdue');
```

**Partitioning**:
```sql
-- Partition audit_log by month
CREATE TABLE audit_log_2025_01 PARTITION OF audit_log
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit_log_2025_02 PARTITION OF audit_log
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
```

**Row-Level Security**:
```sql
-- Enable RLS for multi-tenancy
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON invoices
  USING (company_id = current_setting('app.current_tenant')::uuid);

-- Set tenant context in application
SET app.current_tenant = 'company-uuid-here';
```

### Monitoring & Observability

**Prometheus Metrics**:
```typescript
// bms/api-gateway/src/monitoring/prometheus.service.ts
import { Counter, Histogram, Gauge } from 'prom-client';

@Injectable()
export class PrometheusService {
  private httpRequestDuration: Histogram;
  private httpRequestTotal: Counter;
  private activeUsers: Gauge;

  constructor() {
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
    });

    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
    });

    this.activeUsers = new Gauge({
      name: 'active_users',
      help: 'Number of active users',
    });
  }

  recordRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequestDuration.labels(method, route, status.toString()).observe(duration);
    this.httpRequestTotal.labels(method, route, status.toString()).inc();
  }
}
```

**Logging with Winston**:
```typescript
// bms/api-gateway/src/common/services/logger.service.ts
import * as winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}
```

### Docker Production Setup

**Optimized Dockerfile**:
```dockerfile
# bms/api-gateway/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

USER node
EXPOSE 3001

CMD ["node", "dist/main.js"]
```

**Docker Compose Production**:
```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    restart: always
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  api-gateway:
    build: ./api-gateway
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
      REDIS_URL: redis://redis:6379
    ports:
      - "3001:3001"
```
