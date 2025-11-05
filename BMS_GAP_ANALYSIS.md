# BMS Comprehensive Gap Analysis & Recommendations

## Executive Summary

The BMS project has a **solid foundation** with many core modules implemented, but requires significant enhancements to become a complete, professional, and competitive accounting and CRM platform. This analysis identifies gaps and provides actionable recommendations.

### Current Status: ~60% Complete

**Strengths:**
- Multi-tenant architecture with tenant middleware ✅
- Comprehensive module structure (35+ modules)
- RBAC with permissions system ✅
- 2FA authentication ✅
- Audit logging ✅
- Banking reconciliation with OHADA compliance ✅
- API Gateway with NestJS + TypeORM ✅
- Modern frontend with Next.js 14 ✅

**Critical Gaps:**
- Missing GraphQL API layer
- Incomplete microservices architecture
- No Redis caching implementation
- Missing async queue processing
- No cloud storage integration
- Limited banking integrations
- No e-commerce integrations
- Missing mobile apps
- Incomplete OCR automation
- No workflow engine
- Limited multi-language support

---

## 1. ARCHITECTURE & INFRASTRUCTURE

### 1.1 Current State ✅ Partial

**Implemented:**
- PostgreSQL with TypeORM
- Bull queue configured (but not actively used)
- Docker Compose setup
- Multi-tenant middleware
- Health checks endpoint

**Missing:**
- ❌ GraphQL API layer (only REST exists)
- ❌ True microservices (everything in monolith)
- ❌ Redis caching (configured but not implemented)
- ❌ PostgreSQL replication
- ❌ Automatic backups
- ❌ Message queue processing
- ❌ Cloud storage (MinIO configured but not used)

### 1.2 Recommendations - Priority: HIGH

**Action 1: Implement Redis Caching**
```typescript
// File: bms/api-gateway/src/common/cache/cache.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  
  async get<T>(key: string): Promise<T | undefined> {
    return await this.cacheManager.get<T>(key);
  }
  
  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }
}
```

**Action 2: Add GraphQL Layer**
```bash
cd bms/api-gateway
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
```


```typescript
// File: bms/api-gateway/src/graphql/graphql.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: true,
      context: ({ req }) => ({ req }),
    }),
  ],
})
export class GraphqlModule {}
```

**Action 3: Implement Async Queue Processing**
```typescript
// File: bms/api-gateway/src/queues/email.processor.ts
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('email')
export class EmailProcessor {
  @Process('send')
  async handleSendEmail(job: Job) {
    const { to, subject, body } = job.data;
    // Send email logic
    return { sent: true };
  }
}
```

---

## 2. SECURITY & COMPLIANCE

### 2.1 Current State ✅ Good Foundation

**Implemented:**
- JWT authentication ✅
- 2FA with TOTP ✅
- RBAC with permissions ✅
- Tenant isolation middleware ✅
- Audit logging ✅
- Helmet security headers ✅
- Password hashing (bcrypt) ✅

**Missing:**
- ❌ Data encryption at rest
- ❌ Field-level encryption for sensitive data
- ❌ GDPR data export/deletion automation
- ❌ Session management
- ❌ IP whitelisting
- ❌ Rate limiting per user
- ❌ Security audit logs export


### 2.2 Recommendations - Priority: CRITICAL

**Action 1: Implement Data Encryption**
```typescript
// File: bms/api-gateway/src/common/encryption/encryption.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private algorithm = 'aes-256-gcm';
  private key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  
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

**Action 2: Enhanced GDPR Compliance**
```typescript
// File: bms/api-gateway/src/gdpr/gdpr.service.ts
async exportUserData(userId: string): Promise<any> {
  // Collect all user data from all tables
  const userData = {
    profile: await this.userRepo.findOne({ where: { id: userId } }),
    invoices: await this.invoicesRepo.find({ where: { createdBy: userId } }),
    payments: await this.paymentsRepo.find({ where: { createdBy: userId } }),
    // ... all other entities
  };
  return userData;
}

async deleteUserData(userId: string): Promise<void> {
  // Anonymize or delete user data per GDPR
  await this.userRepo.update(userId, {
    email: `deleted_${userId}@gdpr.local`,
    firstName: 'Deleted',
    lastName: 'User',
    phone: null,
  });
}
```


**Action 3: Rate Limiting**
```typescript
// File: bms/api-gateway/src/common/guards/rate-limit.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomRateLimitGuard extends ThrottlerGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    
    // Different limits per user role
    const limit = this.getUserLimit(request.user?.role);
    
    return super.canActivate(context);
  }
  
  private getUserLimit(role: string): number {
    const limits = {
      admin: 1000,
      manager: 500,
      user: 100,
    };
    return limits[role] || 50;
  }
}
```

---

## 3. CORE MODULES STATUS

### 3.1 Accounting Module ✅ 85% Complete

**Implemented:**
- Chart of accounts (SYSCOHADA) ✅
- Journal entries ✅
- Bank reconciliation ✅
- Aged balance ✅
- Trial balance ✅
- Accounting automation ✅
- Fiscal year closure ✅

**Missing:**
- ❌ General ledger report
- ❌ Balance sheet generation
- ❌ Income statement
- ❌ Cash flow statement
- ❌ Multi-currency revaluation
- ❌ Analytical accounting reports
- ❌ Budget vs actual comparison

**Priority Actions:**
1. Implement financial statements generator
2. Add analytical accounting reports
3. Create budget variance analysis


### 3.2 Invoicing Module ✅ 70% Complete

**Implemented:**
- Invoice creation ✅
- Invoice lines ✅
- Payment tracking ✅
- Invoice status workflow ✅

**Missing:**
- ❌ Quotes/Proforma invoices
- ❌ Recurring invoices
- ❌ Multi-currency invoicing
- ❌ Invoice templates customization
- ❌ Credit notes
- ❌ Dunning (payment reminders)
- ❌ Invoice PDF generation
- ❌ E-invoicing compliance

**Priority Actions:**
```typescript
// File: bms/api-gateway/src/invoices/services/recurring-invoices.service.ts
@Injectable()
export class RecurringInvoicesService {
  @Cron('0 0 * * *') // Daily at midnight
  async processRecurringInvoices() {
    const dueInvoices = await this.findDueRecurringInvoices();
    
    for (const template of dueInvoices) {
      await this.generateInvoiceFromTemplate(template);
    }
  }
}
```

### 3.3 CRM Module ✅ 65% Complete

**Implemented:**
- Contacts management ✅
- Opportunities ✅
- Activities ✅
- Lead scoring ✅
- Pipeline stages ✅
- Email integration ✅

**Missing:**
- ❌ Deal/opportunity workflow automation
- ❌ Email campaigns
- ❌ Contact segmentation
- ❌ Sales forecasting
- ❌ Territory management
- ❌ Quote generation from opportunities
- ❌ Customer portal
- ❌ Social media integration


### 3.4 Treasury Module ✅ 75% Complete

**Implemented:**
- Cash flow forecast ✅
- Direct debits ✅
- Bank accounts ✅
- Treasury alerts ✅

**Missing:**
- ❌ Cash pooling
- ❌ Foreign exchange management
- ❌ Investment tracking
- ❌ Loan management
- ❌ Treasury dashboard with real-time data

### 3.5 Tax Module ✅ 60% Complete

**Implemented:**
- VAT calculations ✅
- Tax declarations ✅
- FEC export ✅

**Missing:**
- ❌ Automated tax filing
- ❌ Tax compliance calendar
- ❌ Multi-country tax rules
- ❌ Transfer pricing
- ❌ Withholding tax
- ❌ Tax audit trail

---

## 4. INTEGRATIONS

### 4.1 Banking Integrations ❌ 10% Complete

**Current State:**
- Basic structure exists
- No actual API connections

**Required Integrations:**
1. **Budget Insight** - Bank aggregation
2. **Bridge API** - Open Banking
3. **EBICS** - Corporate banking
4. **SEPA** - Direct debits/credits

**Implementation Plan:**
```typescript
// File: bms/api-gateway/src/integrations/banking/budget-insight.service.ts
@Injectable()
export class BudgetInsightService {
  private client: BudgetInsightClient;
  
  async connectBank(userId: string, bankId: string) {
    const webviewUrl = await this.client.getWebviewUrl(userId, bankId);
    return { webviewUrl };
  }
  
  async syncTransactions(userId: string) {
    const accounts = await this.client.getAccounts(userId);
    
    for (const account of accounts) {
      const transactions = await this.client.getTransactions(account.id);
      await this.saveBankTransactions(transactions);
    }
  }
}
```


### 4.2 E-commerce Integrations ❌ 0% Complete

**Required:**
1. **WooCommerce** - WordPress e-commerce
2. **Shopify** - Cloud e-commerce
3. **PrestaShop** - Open source e-commerce

**Implementation:**
```typescript
// File: bms/api-gateway/src/integrations/ecommerce/shopify.service.ts
@Injectable()
export class ShopifyService {
  async syncOrders(shopDomain: string, accessToken: string) {
    const orders = await this.fetchShopifyOrders(shopDomain, accessToken);
    
    for (const order of orders) {
      // Create invoice in BMS
      await this.invoicesService.create({
        customerName: order.customer.name,
        items: order.line_items,
        total: order.total_price,
        externalId: order.id,
        source: 'shopify',
      });
    }
  }
  
  async syncProducts(shopDomain: string, accessToken: string) {
    // Sync products to inventory
  }
}
```

### 4.3 Payment Gateways ❌ 20% Complete

**Current State:**
- Basic payment entity exists
- No actual gateway integrations

**Required:**
1. **Stripe** - Card payments
2. **PayPal** - Online payments
3. **SEPA Direct Debit**
4. **Mobile Money** (MTN, Moov, Orange)

**Implementation:**
```typescript
// File: bms/api-gateway/src/payments/providers/stripe.provider.ts
import Stripe from 'stripe';

@Injectable()
export class StripeProvider {
  private stripe: Stripe;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  
  async createPaymentIntent(amount: number, currency: string) {
    return await this.stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency,
      automatic_payment_methods: { enabled: true },
    });
  }
  
  async handleWebhook(signature: string, payload: any) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // Handle payment events
  }
}
```


---

## 5. MOBILE APPLICATIONS ❌ 5% Complete

**Current State:**
- Basic mobile folder structure exists
- No functional mobile app

**Required:**
1. **iOS App** - Native or React Native
2. **Android App** - Native or React Native
3. **Offline Mode** - Local database sync
4. **Push Notifications**
5. **Biometric Authentication**

**Recommended Approach: React Native + Expo**

```bash
# Create new mobile app
cd bms
npx create-expo-app mobile-app --template
cd mobile-app
npm install @react-navigation/native @react-navigation/stack
npm install react-native-sqlite-storage
npm install @react-native-async-storage/async-storage
```

```typescript
// File: bms/mobile-app/src/services/sync.service.ts
export class SyncService {
  async syncOfflineData() {
    const offlineInvoices = await this.localDB.getUnsyncedInvoices();
    
    for (const invoice of offlineInvoices) {
      try {
        await api.post('/api/v1/invoices', invoice);
        await this.localDB.markAsSynced(invoice.id);
      } catch (error) {
        // Keep in offline queue
      }
    }
  }
  
  async downloadData() {
    const invoices = await api.get('/api/v1/invoices');
    await this.localDB.saveInvoices(invoices);
  }
}
```

---

## 6. AUTOMATION & AI

### 6.1 Document OCR ✅ 40% Complete

**Implemented:**
- Tesseract.js integration ✅
- Basic OCR endpoint ✅

**Missing:**
- ❌ Invoice data extraction
- ❌ Receipt processing
- ❌ Bank statement parsing
- ❌ Contract analysis
- ❌ ML model training

**Enhancement:**
```typescript
// File: bms/api-gateway/src/ai/services/invoice-ocr.service.ts
@Injectable()
export class InvoiceOCRService {
  async extractInvoiceData(imageBuffer: Buffer): Promise<InvoiceData> {
    // Use Tesseract + ML model
    const text = await this.ocr.recognize(imageBuffer);
    
    // Extract structured data
    const invoiceNumber = this.extractInvoiceNumber(text);
    const date = this.extractDate(text);
    const amount = this.extractAmount(text);
    const supplier = this.extractSupplier(text);
    const lineItems = this.extractLineItems(text);
    
    return {
      invoiceNumber,
      date,
      amount,
      supplier,
      lineItems,
      confidence: this.calculateConfidence(),
    };
  }
}
```


### 6.2 Workflow Automation ✅ 30% Complete

**Implemented:**
- Basic workflow engine structure ✅
- Accounting automation ✅

**Missing:**
- ❌ Visual workflow builder
- ❌ Conditional logic
- ❌ Multi-step approvals
- ❌ Scheduled workflows
- ❌ Webhook triggers

**Implementation:**
```typescript
// File: bms/api-gateway/src/automation/workflow-engine.service.ts
interface WorkflowDefinition {
  id: string;
  name: string;
  trigger: 'manual' | 'scheduled' | 'event' | 'webhook';
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'approval';
  config: any;
  nextSteps: string[];
}

@Injectable()
export class WorkflowEngineService {
  async executeWorkflow(workflowId: string, context: any) {
    const workflow = await this.getWorkflow(workflowId);
    let currentStep = workflow.steps[0];
    
    while (currentStep) {
      const result = await this.executeStep(currentStep, context);
      
      if (currentStep.type === 'condition') {
        currentStep = this.getNextStep(currentStep, result);
      } else {
        currentStep = workflow.steps.find(s => s.id === currentStep.nextSteps[0]);
      }
    }
  }
  
  private async executeStep(step: WorkflowStep, context: any) {
    switch (step.type) {
      case 'action':
        return await this.executeAction(step.config, context);
      case 'condition':
        return await this.evaluateCondition(step.config, context);
      case 'approval':
        return await this.requestApproval(step.config, context);
    }
  }
}
```

---

## 7. REPORTING & ANALYTICS

### 7.1 Current State ✅ 50% Complete

**Implemented:**
- Basic dashboard metrics ✅
- Treasury reports ✅
- Accounting reports ✅

**Missing:**
- ❌ Custom report builder
- ❌ Scheduled reports
- ❌ Report templates
- ❌ Data visualization library
- ❌ Export to Excel/PDF
- ❌ Real-time dashboards
- ❌ Predictive analytics


**Implementation:**
```typescript
// File: bms/api-gateway/src/reporting/services/report-builder.service.ts
@Injectable()
export class ReportBuilderService {
  async buildCustomReport(definition: ReportDefinition) {
    const query = this.buildQuery(definition);
    const data = await this.executeQuery(query);
    const formatted = this.formatData(data, definition.format);
    
    if (definition.export === 'pdf') {
      return await this.generatePDF(formatted);
    } else if (definition.export === 'excel') {
      return await this.generateExcel(formatted);
    }
    
    return formatted;
  }
  
  private buildQuery(definition: ReportDefinition): string {
    // Build SQL query from definition
    const { tables, fields, filters, groupBy, orderBy } = definition;
    
    let query = `SELECT ${fields.join(', ')} FROM ${tables.join(' JOIN ')}`;
    
    if (filters.length > 0) {
      query += ` WHERE ${this.buildFilters(filters)}`;
    }
    
    if (groupBy.length > 0) {
      query += ` GROUP BY ${groupBy.join(', ')}`;
    }
    
    if (orderBy.length > 0) {
      query += ` ORDER BY ${orderBy.join(', ')}`;
    }
    
    return query;
  }
}
```

---

## 8. USER EXPERIENCE & FRONTEND

### 8.1 Current State ✅ 70% Complete

**Implemented:**
- Modern UI with Tailwind CSS ✅
- Responsive design ✅
- Multiple user profiles ✅
- Permission-based UI ✅
- API client centralization ✅

**Missing:**
- ❌ Dark mode (mentioned but not implemented)
- ❌ Multi-language support
- ❌ Accessibility (WCAG compliance)
- ❌ Progressive Web App (PWA)
- ❌ Keyboard shortcuts
- ❌ Advanced search
- ❌ Bulk operations UI


**Implementation:**
```typescript
// File: bms-web/src/contexts/theme-context.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: 'light', setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

```typescript
// File: bms-web/src/i18n/translations.ts
export const translations = {
  en: {
    dashboard: 'Dashboard',
    invoices: 'Invoices',
    customers: 'Customers',
    // ...
  },
  fr: {
    dashboard: 'Tableau de bord',
    invoices: 'Factures',
    customers: 'Clients',
    // ...
  },
};
```

---

## 9. DATABASE SCHEMA ENHANCEMENTS

### 9.1 Missing Tables

**Required Tables:**
```sql
-- Recurring Invoices
CREATE TABLE recurring_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    customer_id UUID REFERENCES customers(id),
    template_name VARCHAR(255),
    frequency VARCHAR(20), -- daily, weekly, monthly, yearly
    start_date DATE NOT NULL,
    end_date DATE,
    next_invoice_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Workflow Definitions
CREATE TABLE workflow_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255) NOT NULL,
    trigger_type VARCHAR(50),
    trigger_config JSONB,
    steps JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Workflow Executions
CREATE TABLE workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES workflow_definitions(id),
    status VARCHAR(50),
    context JSONB,
    started_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    error_message TEXT
);


-- Integration Connections
CREATE TABLE integration_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    provider VARCHAR(50), -- shopify, woocommerce, stripe, etc.
    credentials JSONB, -- encrypted
    config JSONB,
    status VARCHAR(20),
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Report Definitions
CREATE TABLE report_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255),
    type VARCHAR(50),
    query_config JSONB,
    schedule VARCHAR(50), -- cron expression
    recipients TEXT[],
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Sessions (for better security)
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    token_hash VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- API Keys (for integrations)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id),
    name VARCHAR(255),
    key_hash VARCHAR(255),
    permissions TEXT[],
    expires_at TIMESTAMP,
    last_used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 10. PRIORITY ROADMAP

### Phase 1: Critical Security & Infrastructure (2-3 weeks)

1. **Implement Redis Caching** ⚡
   - Cache frequently accessed data
   - Session storage
   - Rate limiting storage

2. **Data Encryption** 🔒
   - Encrypt sensitive fields
   - Implement encryption service
   - Key rotation mechanism

3. **Enhanced GDPR Compliance** 📋
   - Data export automation
   - Data deletion automation
   - Consent management

4. **Rate Limiting** 🚦
   - Per-user rate limits
   - API endpoint throttling
   - DDoS protection


### Phase 2: Core Features Completion (4-6 weeks)

1. **Invoicing Enhancements** 📄
   - Recurring invoices
   - Credit notes
   - PDF generation
   - Multi-currency

2. **Financial Statements** 📊
   - Balance sheet
   - Income statement
   - Cash flow statement
   - Automated generation

3. **CRM Enhancements** 👥
   - Email campaigns
   - Sales forecasting
   - Customer portal
   - Quote generation

4. **Reporting System** 📈
   - Custom report builder
   - Scheduled reports
   - Excel/PDF export
   - Real-time dashboards

### Phase 3: Integrations (6-8 weeks)

1. **Banking Integrations** 🏦
   - Budget Insight API
   - Bridge API
   - EBICS protocol
   - SEPA payments

2. **Payment Gateways** 💳
   - Stripe integration
   - PayPal integration
   - Mobile Money APIs
   - Webhook handling

3. **E-commerce Integrations** 🛒
   - Shopify connector
   - WooCommerce plugin
   - PrestaShop module
   - Order sync automation

### Phase 4: Advanced Features (8-10 weeks)

1. **Mobile Applications** 📱
   - React Native app
   - Offline mode
   - Push notifications
   - Biometric auth

2. **Workflow Automation** ⚙️
   - Visual workflow builder
   - Approval workflows
   - Scheduled tasks
   - Webhook triggers

3. **AI & ML Features** 🤖
   - Invoice OCR
   - Expense categorization
   - Fraud detection
   - Predictive analytics

4. **GraphQL API** 🔌
   - Schema definition
   - Resolvers
   - Subscriptions
   - API documentation


### Phase 5: Polish & Scale (4-6 weeks)

1. **Performance Optimization** ⚡
   - Database query optimization
   - Caching strategy
   - CDN integration
   - Load balancing

2. **User Experience** 🎨
   - Dark mode
   - Multi-language
   - Accessibility
   - PWA features

3. **DevOps & Monitoring** 🔧
   - CI/CD pipeline
   - Automated testing
   - Performance monitoring
   - Error tracking

4. **Documentation** 📚
   - API documentation
   - User guides
   - Developer docs
   - Video tutorials

---

## 11. IMMEDIATE NEXT STEPS

### Week 1: Quick Wins

**Day 1-2: Fix usePermissions Hook**
The newly created `usePermissions` hook is good but needs backend integration:

```typescript
// File: bms-web/src/hooks/usePermissions.ts
export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  
  useEffect(() => {
    // Fetch from backend instead of localStorage
    const fetchPermissions = async () => {
      try {
        const user = await apiClient.get('/api/v1/auth/me');
        setPermissions(user.permissions || []);
      } catch (error) {
        console.error('Failed to fetch permissions', error);
      }
    };
    
    fetchPermissions();
  }, []);
  
  // ... rest of the hook
}
```

**Day 3-4: Implement Redis Caching**
```bash
cd bms/api-gateway
npm install @nestjs/cache-manager cache-manager cache-manager-redis-store
```

**Day 5: Add Rate Limiting**
```bash
npm install @nestjs/throttler
```


### Week 2: Core Enhancements

**Recurring Invoices Implementation**
```typescript
// File: bms/api-gateway/src/invoices/entities/recurring-invoice.entity.ts
@Entity('recurring_invoices')
export class RecurringInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  companyId: string;
  
  @Column()
  customerId: string;
  
  @Column()
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  
  @Column()
  startDate: Date;
  
  @Column({ nullable: true })
  endDate: Date;
  
  @Column()
  nextInvoiceDate: Date;
  
  @Column('jsonb')
  template: any;
  
  @Column({ default: true })
  isActive: boolean;
}
```

**Financial Statements Service**
```typescript
// File: bms/api-gateway/src/accounting/services/financial-statements.service.ts
@Injectable()
export class FinancialStatementsService {
  async generateBalanceSheet(companyId: string, asOfDate: Date) {
    // Assets
    const assets = await this.getAccountBalances(companyId, ['1', '2', '3'], asOfDate);
    
    // Liabilities
    const liabilities = await this.getAccountBalances(companyId, ['4'], asOfDate);
    
    // Equity
    const equity = await this.getAccountBalances(companyId, ['5'], asOfDate);
    
    return {
      assets: this.groupByClass(assets),
      liabilities: this.groupByClass(liabilities),
      equity: this.groupByClass(equity),
      totalAssets: this.sum(assets),
      totalLiabilities: this.sum(liabilities),
      totalEquity: this.sum(equity),
    };
  }
  
  async generateIncomeStatement(companyId: string, startDate: Date, endDate: Date) {
    // Revenue (class 7)
    const revenue = await this.getAccountBalances(companyId, ['7'], endDate, startDate);
    
    // Expenses (class 6)
    const expenses = await this.getAccountBalances(companyId, ['6'], endDate, startDate);
    
    return {
      revenue: this.groupByClass(revenue),
      expenses: this.groupByClass(expenses),
      totalRevenue: this.sum(revenue),
      totalExpenses: this.sum(expenses),
      netIncome: this.sum(revenue) - this.sum(expenses),
    };
  }
}
```


### Week 3-4: Integration Foundation

**Stripe Integration**
```typescript
// File: bms/api-gateway/src/payments/providers/stripe.provider.ts
import Stripe from 'stripe';

@Injectable()
export class StripeProvider implements PaymentProvider {
  private stripe: Stripe;
  
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }
  
  async createPaymentIntent(params: CreatePaymentParams) {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100),
      currency: params.currency.toLowerCase(),
      customer: params.customerId,
      metadata: {
        invoiceId: params.invoiceId,
        companyId: params.companyId,
      },
    });
    
    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
    };
  }
  
  async handleWebhook(signature: string, payload: Buffer) {
    const event = this.stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
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

**Budget Insight Integration**
```typescript
// File: bms/api-gateway/src/integrations/banking/budget-insight.service.ts
@Injectable()
export class BudgetInsightService {
  private apiUrl = 'https://api.biapi.pro/2.0';
  
  async getWebviewUrl(userId: string): Promise<string> {
    const response = await axios.post(`${this.apiUrl}/auth/webview`, {
      client_id: process.env.BUDGET_INSIGHT_CLIENT_ID,
      client_secret: process.env.BUDGET_INSIGHT_CLIENT_SECRET,
      user_id: userId,
    });
    
    return response.data.webview_url;
  }
  
  async syncAccounts(userId: string) {
    const accounts = await this.getAccounts(userId);
    
    for (const account of accounts) {
      await this.bankAccountsService.upsert({
        externalId: account.id,
        name: account.name,
        iban: account.iban,
        balance: account.balance,
        provider: 'budget_insight',
      });
    }
  }
  
  async syncTransactions(userId: string, accountId: string) {
    const transactions = await this.getTransactions(userId, accountId);
    
    for (const tx of transactions) {
      await this.bankTransactionsService.create({
        externalId: tx.id,
        accountId: accountId,
        date: tx.date,
        amount: tx.value,
        label: tx.wording,
        category: tx.category,
      });
    }
  }
}
```


---

## 12. TECHNICAL DEBT & CODE QUALITY

### 12.1 Current Issues

**Backend:**
- ❌ Some modules commented out in AppModule
- ❌ TypeORM synchronize disabled (migrations needed)
- ❌ Inconsistent error handling
- ❌ Missing unit tests
- ❌ No integration tests
- ❌ Incomplete API documentation

**Frontend:**
- ❌ Hardcoded API URLs in some files
- ❌ Inconsistent state management
- ❌ Missing error boundaries
- ❌ No loading states in some components
- ❌ Accessibility issues

### 12.2 Code Quality Improvements

**Add Testing Infrastructure**
```bash
# Backend
cd bms/api-gateway
npm install --save-dev @nestjs/testing jest ts-jest

# Frontend
cd bms-web
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

**Example Test**
```typescript
// File: bms/api-gateway/src/invoices/invoices.service.spec.ts
describe('InvoicesService', () => {
  let service: InvoicesService;
  let repository: Repository<Invoice>;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useClass: Repository,
        },
      ],
    }).compile();
    
    service = module.get<InvoicesService>(InvoicesService);
    repository = module.get<Repository<Invoice>>(getRepositoryToken(Invoice));
  });
  
  it('should create an invoice', async () => {
    const dto = { /* ... */ };
    const result = await service.create(dto);
    expect(result).toBeDefined();
    expect(result.invoiceNumber).toMatch(/INV-/);
  });
});
```

**Add API Documentation**
```typescript
// File: bms/api-gateway/src/invoices/invoices.controller.ts
@ApiTags('invoices')
@Controller('invoices')
export class InvoicesController {
  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiResponse({ status: 200, description: 'List of invoices' })
  async findAll(@Query('companyId') companyId: string) {
    return this.invoicesService.findAll(companyId);
  }
}
```


---

## 13. PERFORMANCE OPTIMIZATION

### 13.1 Database Optimization

**Add Missing Indexes**
```sql
-- Performance indexes
CREATE INDEX idx_invoices_company_date ON invoices(company_id, invoice_date DESC);
CREATE INDEX idx_payments_company_date ON payments(company_id, payment_date DESC);
CREATE INDEX idx_journal_entries_company_date ON journal_entries(company_id, entry_date DESC);
CREATE INDEX idx_bank_transactions_company_date ON bank_transactions(company_id, transaction_date DESC);

-- Full-text search indexes
CREATE INDEX idx_customers_search ON customers USING gin(to_tsvector('english', name || ' ' || COALESCE(email, '')));
CREATE INDEX idx_suppliers_search ON suppliers USING gin(to_tsvector('english', name || ' ' || COALESCE(email, '')));

-- Partial indexes for common queries
CREATE INDEX idx_invoices_unpaid ON invoices(company_id, due_date) WHERE status = 'sent';
CREATE INDEX idx_payments_unallocated ON payments(company_id) WHERE unallocated_amount > 0;
```

**Query Optimization**
```typescript
// File: bms/api-gateway/src/invoices/invoices.service.ts
async findAll(companyId: string, options?: FindOptions) {
  // Use query builder for complex queries
  const qb = this.invoicesRepo
    .createQueryBuilder('invoice')
    .leftJoinAndSelect('invoice.customer', 'customer')
    .leftJoinAndSelect('invoice.lines', 'lines')
    .where('invoice.companyId = :companyId', { companyId })
    .orderBy('invoice.invoiceDate', 'DESC')
    .take(options?.limit || 50)
    .skip(options?.offset || 0);
  
  // Add filters
  if (options?.status) {
    qb.andWhere('invoice.status = :status', { status: options.status });
  }
  
  // Use pagination
  return await qb.getManyAndCount();
}
```

### 13.2 Caching Strategy

**Implement Multi-Level Caching**
```typescript
// File: bms/api-gateway/src/common/cache/cache.decorator.ts
export function Cacheable(ttl: number = 300) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${target.constructor.name}:${propertyKey}:${JSON.stringify(args)}`;
      const cached = await this.cacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const result = await originalMethod.apply(this, args);
      await this.cacheService.set(cacheKey, result, ttl);
      
      return result;
    };
    
    return descriptor;
  };
}

// Usage
@Injectable()
export class CompaniesService {
  @Cacheable(600) // Cache for 10 minutes
  async findOne(id: string) {
    return this.companiesRepo.findOne({ where: { id } });
  }
}
```


---

## 14. DEPLOYMENT & DEVOPS

### 14.1 Current State

**Implemented:**
- Docker Compose setup ✅
- Railway deployment configs ✅
- Environment variables ✅

**Missing:**
- ❌ CI/CD pipeline
- ❌ Automated testing in pipeline
- ❌ Database migrations automation
- ❌ Blue-green deployment
- ❌ Monitoring & alerting
- ❌ Log aggregation
- ❌ Performance monitoring

### 14.2 CI/CD Pipeline

**GitHub Actions Workflow**
```yaml
# File: .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd bms/api-gateway && npm ci
      - name: Run tests
        run: cd bms/api-gateway && npm test
      - name: Run linter
        run: cd bms/api-gateway && npm run lint
  
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd bms-web && npm ci
      - name: Run tests
        run: cd bms-web && npm test
      - name: Build
        run: cd bms-web && npm run build
  
  deploy-staging:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          # Deploy to Railway staging
          railway up --service api-gateway --environment staging
          railway up --service web --environment staging
  
  deploy-production:
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy to Railway production
          railway up --service api-gateway --environment production
          railway up --service web --environment production
```


### 14.3 Monitoring Setup

**Prometheus + Grafana**
```typescript
// File: bms/api-gateway/src/monitoring/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private registry: Registry;
  private httpRequestDuration: Histogram;
  private httpRequestTotal: Counter;
  
  constructor() {
    this.registry = new Registry();
    
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });
    
    this.httpRequestTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });
  }
  
  recordRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequestDuration.observe({ method, route, status }, duration);
    this.httpRequestTotal.inc({ method, route, status });
  }
  
  getMetrics() {
    return this.registry.metrics();
  }
}
```

**Error Tracking with Sentry**
```typescript
// File: bms/api-gateway/src/main.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Add Sentry error handler
app.use(Sentry.Handlers.errorHandler());
```

---

## 15. SECURITY CHECKLIST

### 15.1 Critical Security Items

- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] 2FA/TOTP
- [x] RBAC permissions
- [x] Tenant isolation
- [x] CORS configuration
- [x] Helmet security headers
- [ ] Data encryption at rest
- [ ] Field-level encryption
- [ ] API rate limiting
- [ ] IP whitelisting
- [ ] Session management
- [ ] SQL injection prevention (using ORM)
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Security headers (CSP, HSTS)
- [ ] Dependency vulnerability scanning
- [ ] Secrets management (Vault)
- [ ] Audit logging
- [ ] Penetration testing


### 15.2 Security Enhancements

**CSRF Protection**
```typescript
// File: bms/api-gateway/src/main.ts
import * as csurf from 'csurf';

app.use(csurf({ cookie: true }));
```

**Content Security Policy**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.API_URL],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

**Secrets Management**
```bash
# Use environment-specific secrets
# .env.production (never commit)
DATABASE_URL=postgresql://...
JWT_SECRET=<generated-secret>
ENCRYPTION_KEY=<generated-key>
STRIPE_SECRET_KEY=<stripe-secret>

# Use secrets manager in production
# AWS Secrets Manager, HashiCorp Vault, etc.
```

---

## 16. COMPETITIVE ANALYSIS

### 16.1 Comparison with Competitors

**vs. Odoo:**
- ✅ BMS: Lighter, faster, modern tech stack
- ❌ BMS: Missing modules (HR, Manufacturing, etc.)
- ❌ BMS: No app marketplace
- ✅ BMS: Better UX for African market

**vs. Sage:**
- ✅ BMS: More affordable
- ✅ BMS: Cloud-native
- ❌ BMS: Less mature
- ❌ BMS: Fewer integrations

**vs. QuickBooks:**
- ✅ BMS: Multi-tenant
- ✅ BMS: OHADA compliance
- ❌ BMS: No mobile apps yet
- ❌ BMS: Smaller ecosystem

### 16.2 Unique Selling Points

1. **OHADA Compliance** - Built for African accounting standards
2. **Mobile Money Integration** - Native support for MTN, Moov, Orange
3. **Multi-tenant SaaS** - One instance, multiple companies
4. **Modern Tech Stack** - NestJS, Next.js, TypeScript
5. **Affordable Pricing** - Competitive for SMEs
6. **Local Support** - French language, local currency


---

## 17. COST ESTIMATION

### 17.1 Development Costs (Team of 3-4 developers)

**Phase 1 (2-3 weeks): $15,000 - $20,000**
- Security enhancements
- Infrastructure setup
- Redis caching
- Rate limiting

**Phase 2 (4-6 weeks): $30,000 - $40,000**
- Core features completion
- Financial statements
- Recurring invoices
- Reporting system

**Phase 3 (6-8 weeks): $45,000 - $60,000**
- Banking integrations
- Payment gateways
- E-commerce connectors

**Phase 4 (8-10 weeks): $60,000 - $80,000**
- Mobile applications
- Workflow automation
- AI/ML features
- GraphQL API

**Phase 5 (4-6 weeks): $30,000 - $40,000**
- Performance optimization
- UX polish
- DevOps setup
- Documentation

**Total Estimated Cost: $180,000 - $240,000**

### 17.2 Infrastructure Costs (Monthly)

- **Database (PostgreSQL)**: $50 - $200
- **Redis Cache**: $20 - $100
- **Application Hosting**: $100 - $500
- **CDN**: $20 - $100
- **Storage (S3/MinIO)**: $10 - $50
- **Monitoring (Sentry, Datadog)**: $50 - $200
- **Email Service (SendGrid)**: $20 - $100
- **SMS Service (Twilio)**: $50 - $200
- **Banking APIs**: $100 - $500
- **Payment Gateway Fees**: Variable (2-3% of transactions)

**Total Monthly Infrastructure: $420 - $1,950**

---

## 18. SUCCESS METRICS

### 18.1 Technical Metrics

- **API Response Time**: < 200ms (p95)
- **Database Query Time**: < 50ms (p95)
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%
- **Test Coverage**: > 80%
- **Security Score**: A+ (Mozilla Observatory)

### 18.2 Business Metrics

- **User Onboarding Time**: < 10 minutes
- **Invoice Creation Time**: < 2 minutes
- **Bank Reconciliation Time**: 50% reduction
- **Report Generation Time**: < 5 seconds
- **Customer Satisfaction**: > 4.5/5
- **Monthly Active Users**: Growth target
- **Churn Rate**: < 5%


---

## 19. CONCLUSION & RECOMMENDATIONS

### 19.1 Current Assessment

BMS has a **strong foundation** with approximately **60% of required features** implemented. The architecture is sound, security basics are in place, and core modules are functional. However, significant work remains to make it a complete, competitive product.

### 19.2 Critical Path Forward

**Immediate Priorities (Next 30 Days):**

1. **Security Hardening** 🔒
   - Implement data encryption
   - Add rate limiting
   - Enhance GDPR compliance
   - Set up security monitoring

2. **Core Feature Completion** 📊
   - Financial statements generation
   - Recurring invoices
   - Credit notes
   - PDF generation

3. **Performance Optimization** ⚡
   - Redis caching implementation
   - Database query optimization
   - Add missing indexes
   - Implement caching decorator

4. **Code Quality** ✅
   - Add unit tests (target 60% coverage)
   - Fix TypeScript warnings
   - Complete API documentation
   - Remove commented code

**Medium-Term Goals (60-90 Days):**

1. **Integrations** 🔌
   - Stripe payment gateway
   - Budget Insight banking
   - Shopify e-commerce
   - Email service (SendGrid)

2. **Advanced Features** 🚀
   - Workflow automation
   - Custom report builder
   - Invoice OCR
   - Multi-language support

3. **Mobile Apps** 📱
   - React Native app
   - Offline mode
   - Push notifications

**Long-Term Vision (6-12 Months):**

1. **Scale & Performance** 📈
   - Microservices architecture
   - GraphQL API
   - CDN integration
   - Load balancing

2. **AI & Automation** 🤖
   - Predictive analytics
   - Fraud detection
   - Smart categorization
   - Chatbot support

3. **Ecosystem** 🌐
   - API marketplace
   - Third-party integrations
   - Developer portal
   - Plugin system


### 19.3 Risk Mitigation

**Technical Risks:**
- **Database Performance**: Implement caching early, monitor query performance
- **Security Breaches**: Regular security audits, penetration testing
- **Scalability Issues**: Plan for horizontal scaling from the start
- **Integration Failures**: Build robust error handling and fallbacks

**Business Risks:**
- **Competition**: Focus on unique features (OHADA, Mobile Money)
- **User Adoption**: Invest in UX, onboarding, and support
- **Regulatory Compliance**: Stay updated with tax laws and regulations
- **Cost Overruns**: Prioritize features, use agile methodology

### 19.4 Final Recommendations

**DO:**
✅ Focus on core accounting and invoicing features first
✅ Implement security best practices from the start
✅ Build a solid API foundation for future integrations
✅ Invest in automated testing and CI/CD
✅ Prioritize user experience and performance
✅ Document everything (code, API, user guides)

**DON'T:**
❌ Try to build everything at once
❌ Compromise on security for speed
❌ Ignore technical debt
❌ Skip testing and code reviews
❌ Neglect performance optimization
❌ Forget about scalability

### 19.5 Next Action Items

**This Week:**
1. Review and approve this gap analysis
2. Set up Redis caching
3. Implement rate limiting
4. Fix usePermissions hook to fetch from backend
5. Add missing database indexes

**Next Week:**
1. Implement recurring invoices
2. Build financial statements service
3. Add unit tests for critical services
4. Set up CI/CD pipeline
5. Configure monitoring (Sentry)

**This Month:**
1. Complete Stripe integration
2. Implement data encryption
3. Build custom report builder
4. Add PDF generation for invoices
5. Launch beta testing program

---

## 20. APPENDIX

### 20.1 Useful Commands

```bash
# Start development environment
docker-compose up -d

# Run migrations
cd bms/api-gateway
npm run migration:run

# Start backend
npm run start:dev

# Start frontend
cd bms-web
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Deploy to Railway
railway up
```

### 20.2 Environment Variables Checklist

**Backend (.env):**
- DATABASE_URL
- REDIS_URL
- JWT_SECRET
- ENCRYPTION_KEY
- STRIPE_SECRET_KEY
- SENDGRID_API_KEY
- TWILIO_AUTH_TOKEN
- BUDGET_INSIGHT_CLIENT_ID
- SENTRY_DSN

**Frontend (.env.local):**
- NEXT_PUBLIC_API_URL
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
- NEXTAUTH_SECRET

### 20.3 Key Files to Review

**Backend:**
- `bms/api-gateway/src/app.module.ts` - Main module configuration
- `bms/api-gateway/src/main.ts` - Application bootstrap
- `bms/api-gateway/src/database/schema.sql` - Database schema
- `bms/api-gateway/src/common/middleware/tenant.middleware.ts` - Multi-tenancy

**Frontend:**
- `bms-web/src/lib/api-client.ts` - API client
- `bms-web/src/hooks/usePermissions.ts` - Permissions hook
- `bms-web/src/app/layout.tsx` - Root layout
- `bms-web/src/lib/api.ts` - Legacy API functions

---

**Document Version:** 1.0  
**Last Updated:** 2025-11-05  
**Author:** Kiro AI Assistant  
**Status:** Draft for Review

