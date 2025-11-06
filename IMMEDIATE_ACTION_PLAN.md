# ⚡ Immediate Action Plan - Next 7 Days

**Goal:** Fix critical issues and implement high-priority features

---

## Day 1: Fix Hardcoded URLs & Security

### Morning: Frontend API Client
**Files to modify:**
```
bms-web/src/hooks/useLeaves.ts
bms-web/src/hooks/useLeaveBalance.ts
bms-web/src/hooks/useLeaveApproval.ts
```

**Changes:**
```typescript
// Replace hardcoded URLs with API client
import { apiGet, apiPost } from '@/lib/api';

// Before:
const response = await fetch('https://bms-production-d9e9.up.railway.app/api/v1/hr/leaves?...');

// After:
const response = await apiGet('/hr/leaves', { companyId, status });
```

### Afternoon: Rate Limiting
**File to create:** `bms/api-gateway/src/common/guards/rate-limit.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = `rate_limit:${request.user?.companyId}:${request.user?.id}:${Date.now() / 60000 | 0}`;
    
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, 60);
    }
    
    if (count > 100) {
      throw new HttpException('Too many requests', 429);
    }
    
    return true;
  }
}
```

---

## Day 2: Database Optimization

### Morning: Add Indexes
**File to create:** `bms/api-gateway/migrations/add-performance-indexes.sql`

```sql
-- Journal entries optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entries_company_date 
  ON journal_entries(company_id, entry_date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_journal_entry_lines_account 
  ON journal_entry_lines(account_id, entry_id);

-- Invoices optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_customer_status 
  ON invoices(customer_id, status) 
  WHERE status != 'cancelled';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_invoices_company_date 
  ON invoices(company_id, invoice_date DESC);

-- Bank transactions
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bank_transactions_reconciled 
  ON bank_transactions(bank_account_id, is_reconciled, transaction_date DESC);

-- CRM
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_opportunities_company_stage 
  ON opportunities(company_id, stage);
```

### Afternoon: Connection Pooling
**File to modify:** `bms/api-gateway/src/app.module.ts`

```typescript
TypeOrmModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get('DB_HOST'),
    port: config.get('DB_PORT', 5432),
    username: config.get('DB_USER'),
    password: config.get('DB_PASSWORD'),
    database: config.get('DB_NAME'),
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: config.get('NODE_ENV') === 'development',
    // Connection pooling
    extra: {
      max: 20,
      min: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
  }),
}),
```

---

## Day 3: Balance Sheet Implementation

### File to create: `bms/api-gateway/src/accounting/services/balance-sheet.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { JournalEntryLine } from '../entities/journal-entry-line.entity';

interface BalanceSheetSection {
  accounts: Array<{
    accountNumber: string;
    label: string;
    balance: number;
  }>;
  total: number;
}

interface BalanceSheet {
  assets: BalanceSheetSection;
  liabilities: BalanceSheetSection;
  equity: BalanceSheetSection;
  balanced: boolean;
  date: Date;
}

@Injectable()
export class BalanceSheetService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    @InjectRepository(JournalEntryLine)
    private lineRepo: Repository<JournalEntryLine>
  ) {}

  async generate(companyId: string, asOfDate: Date): Promise<BalanceSheet> {
    // Get all accounts
    const accounts = await this.accountRepo.find({
      where: { companyId, isActive: true }
    });

    // Calculate balances
    const balances = await this.calculateBalances(companyId, asOfDate);

    // Classify accounts
    const assets = this.filterAccounts(accounts, balances, ['1', '2', '3']);
    const liabilities = this.filterAccounts(accounts, balances, ['4']);
    const equity = this.filterAccounts(accounts, balances, ['5']);

    const assetsTotal = this.sumBalances(assets);
    const liabilitiesTotal = this.sumBalances(liabilities);
    const equityTotal = this.sumBalances(equity);

    return {
      assets: { accounts: assets, total: assetsTotal },
      liabilities: { accounts: liabilities, total: liabilitiesTotal },
      equity: { accounts: equity, total: equityTotal },
      balanced: Math.abs(assetsTotal - (liabilitiesTotal + equityTotal)) < 0.01,
      date: asOfDate
    };
  }

  private async calculateBalances(
    companyId: string,
    asOfDate: Date
  ): Promise<Map<string, number>> {
    const lines = await this.lineRepo
      .createQueryBuilder('line')
      .innerJoin('line.entry', 'entry')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.entryDate <= :asOfDate', { asOfDate })
      .andWhere('entry.status = :status', { status: 'posted' })
      .select('line.accountId', 'accountId')
      .addSelect('SUM(line.debit - line.credit)', 'balance')
      .groupBy('line.accountId')
      .getRawMany();

    const balances = new Map<string, number>();
    lines.forEach(line => {
      balances.set(line.accountId, parseFloat(line.balance));
    });

    return balances;
  }

  private filterAccounts(
    accounts: Account[],
    balances: Map<string, number>,
    classes: string[]
  ) {
    return accounts
      .filter(acc => classes.some(c => acc.accountNumber.startsWith(c)))
      .map(acc => ({
        accountNumber: acc.accountNumber,
        label: acc.label,
        balance: balances.get(acc.id) || 0
      }))
      .filter(acc => Math.abs(acc.balance) > 0.01);
  }

  private sumBalances(accounts: Array<{ balance: number }>): number {
    return accounts.reduce((sum, acc) => sum + acc.balance, 0);
  }
}
```

### Add to controller: `bms/api-gateway/src/accounting/accounting.controller.ts`

```typescript
@Get('balance-sheet')
@ApiOperation({ summary: 'Generate balance sheet' })
async getBalanceSheet(
  @Query('companyId') companyId: string,
  @Query('date') date: string
): Promise<BalanceSheet> {
  const asOfDate = date ? new Date(date) : new Date();
  return this.balanceSheetService.generate(companyId, asOfDate);
}
```

---

## Day 4: Profit & Loss Statement

### File to create: `bms/api-gateway/src/accounting/services/profit-loss.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Account } from '../entities/account.entity';
import { JournalEntryLine } from '../entities/journal-entry-line.entity';

interface ProfitLossSection {
  accounts: Array<{
    accountNumber: string;
    label: string;
    amount: number;
  }>;
  total: number;
}

interface ProfitLoss {
  revenue: ProfitLossSection;
  expenses: ProfitLossSection;
  netProfit: number;
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class ProfitLossService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    @InjectRepository(JournalEntryLine)
    private lineRepo: Repository<JournalEntryLine>
  ) {}

  async generate(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<ProfitLoss> {
    const accounts = await this.accountRepo.find({
      where: { companyId, isActive: true }
    });

    const amounts = await this.calculateAmounts(companyId, startDate, endDate);

    // Class 7: Revenue, Class 6: Expenses
    const revenue = this.filterAccounts(accounts, amounts, ['7']);
    const expenses = this.filterAccounts(accounts, amounts, ['6']);

    const revenueTotal = this.sumAmounts(revenue);
    const expensesTotal = this.sumAmounts(expenses);

    return {
      revenue: { accounts: revenue, total: revenueTotal },
      expenses: { accounts: expenses, total: expensesTotal },
      netProfit: revenueTotal - expensesTotal,
      startDate,
      endDate
    };
  }

  private async calculateAmounts(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Map<string, number>> {
    const lines = await this.lineRepo
      .createQueryBuilder('line')
      .innerJoin('line.entry', 'entry')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.entryDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      })
      .andWhere('entry.status = :status', { status: 'posted' })
      .select('line.accountId', 'accountId')
      .addSelect('SUM(line.credit - line.debit)', 'amount')
      .groupBy('line.accountId')
      .getRawMany();

    const amounts = new Map<string, number>();
    lines.forEach(line => {
      amounts.set(line.accountId, parseFloat(line.amount));
    });

    return amounts;
  }

  private filterAccounts(
    accounts: Account[],
    amounts: Map<string, number>,
    classes: string[]
  ) {
    return accounts
      .filter(acc => classes.some(c => acc.accountNumber.startsWith(c)))
      .map(acc => ({
        accountNumber: acc.accountNumber,
        label: acc.label,
        amount: amounts.get(acc.id) || 0
      }))
      .filter(acc => Math.abs(acc.amount) > 0.01);
  }

  private sumAmounts(accounts: Array<{ amount: number }>): number {
    return accounts.reduce((sum, acc) => sum + acc.amount, 0);
  }
}
```

---

## Day 5: Recurring Billing

### File to create: `bms/api-gateway/src/invoices/services/recurring-billing.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecurringInvoice } from '../entities/recurring-invoice.entity';
import { InvoicesService } from './invoices.service';

@Injectable()
export class RecurringBillingService {
  constructor(
    @InjectRepository(RecurringInvoice)
    private recurringRepo: Repository<RecurringInvoice>,
    private invoicesService: InvoicesService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processRecurringInvoices(): Promise<void> {
    const today = new Date();
    
    const dueInvoices = await this.recurringRepo.find({
      where: { active: true },
      relations: ['customer', 'lines']
    });

    for (const recurring of dueInvoices) {
      if (this.isDue(recurring, today)) {
        await this.generateInvoice(recurring);
        await this.updateNextDate(recurring);
      }
    }
  }

  private isDue(recurring: RecurringInvoice, date: Date): boolean {
    return recurring.nextInvoiceDate <= date;
  }

  private async generateInvoice(recurring: RecurringInvoice): Promise<void> {
    await this.invoicesService.create({
      companyId: recurring.companyId,
      customerId: recurring.customerId,
      invoiceDate: new Date(),
      dueDate: this.calculateDueDate(recurring),
      lines: recurring.lines.map(line => ({
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        vatRate: line.vatRate
      })),
      notes: `Generated from recurring invoice ${recurring.id}`
    });
  }

  private async updateNextDate(recurring: RecurringInvoice): Promise<void> {
    const nextDate = this.calculateNextDate(
      recurring.nextInvoiceDate,
      recurring.frequency
    );
    
    await this.recurringRepo.update(recurring.id, {
      nextInvoiceDate: nextDate,
      lastInvoiceDate: new Date()
    });
  }

  private calculateNextDate(current: Date, frequency: string): Date {
    const next = new Date(current);
    
    switch (frequency) {
      case 'weekly':
        next.setDate(next.getDate() + 7);
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'quarterly':
        next.setMonth(next.getMonth() + 3);
        break;
      case 'yearly':
        next.setFullYear(next.getFullYear() + 1);
        break;
    }
    
    return next;
  }

  private calculateDueDate(recurring: RecurringInvoice): Date {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + (recurring.paymentTerms || 30));
    return dueDate;
  }
}
```

---

## Day 6-7: Testing & Documentation

### Create Tests
```typescript
// bms/api-gateway/src/accounting/services/balance-sheet.service.spec.ts
describe('BalanceSheetService', () => {
  it('should generate balanced balance sheet', async () => {
    const result = await service.generate(companyId, new Date());
    expect(result.balanced).toBe(true);
  });
  
  it('should classify accounts correctly', async () => {
    const result = await service.generate(companyId, new Date());
    expect(result.assets.accounts.length).toBeGreaterThan(0);
  });
});
```

### Update Documentation
```markdown
# API Documentation

## Balance Sheet
GET /api/v1/accounting/balance-sheet?companyId={id}&date={date}

Returns the balance sheet as of the specified date.

## Profit & Loss
GET /api/v1/accounting/profit-loss?companyId={id}&startDate={date}&endDate={date}

Returns the profit and loss statement for the period.
```

---

## ✅ Success Criteria

By end of week, you should have:
- [ ] All hardcoded URLs removed
- [ ] Rate limiting implemented
- [ ] Database indexes added
- [ ] Balance sheet generation working
- [ ] P&L statement generation working
- [ ] Recurring billing scheduled
- [ ] Tests passing
- [ ] Documentation updated

---

**Start Date:** Today  
**Target Completion:** 7 days
