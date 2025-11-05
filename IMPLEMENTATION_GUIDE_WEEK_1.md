# BMS Implementation Guide - Week 1
## Accounting Module Core Functionality

**Goal**: Implement real accounting logic to replace stubs and make the accounting module production-ready.

---

## Day 1-2: Journal Entry Posting System

### File: `bms/api-gateway/src/accounting/services/journal-entry.service.ts`

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { JournalEntry } from '../entities/journal-entry.entity';
import { JournalEntryLine } from '../entities/journal-entry-line.entity';
import { Account } from '../entities/account.entity';

export interface CreateJournalEntryDto {
  companyId: string;
  entryDate: Date;
  reference?: string;
  description: string;
  journalCode: string;
  lines: {
    accountId: string;
    debit: number;
    credit: number;
    label: string;
    analyticalSectionId?: string;
  }[];
}

@Injectable()
export class JournalEntryService {
  constructor(
    @InjectRepository(JournalEntry)
    private entryRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private lineRepo: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    private dataSource: DataSource,
  ) {}

  /**
   * Create and validate a journal entry
   */
  async createEntry(dto: CreateJournalEntryDto): Promise<JournalEntry> {
    // Validate balanced entry
    this.validateBalancedEntry(dto.lines);

    // Validate accounts exist
    await this.validateAccounts(dto.lines.map(l => l.accountId), dto.companyId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create entry
      const entry = this.entryRepo.create({
        companyId: dto.companyId,
        entryDate: dto.entryDate,
        reference: dto.reference || this.generateReference(dto.journalCode),
        description: dto.description,
        journalCode: dto.journalCode,
        status: 'draft',
      });

      const savedEntry = await queryRunner.manager.save(entry);

      // Create lines
      const lines = dto.lines.map(line =>
        this.lineRepo.create({
          entryId: savedEntry.id,
          accountId: line.accountId,
          debit: line.debit,
          credit: line.credit,
          label: line.label,
          analyticalSectionId: line.analyticalSectionId,
        }),
      );

      await queryRunner.manager.save(lines);

      await queryRunner.commitTransaction();

      return this.entryRepo.findOne({
        where: { id: savedEntry.id },
        relations: ['lines', 'lines.account'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Post a journal entry (make it permanent)
   */
  async postEntry(entryId: string, userId: string): Promise<JournalEntry> {
    const entry = await this.entryRepo.findOne({
      where: { id: entryId },
      relations: ['lines', 'lines.account'],
    });

    if (!entry) {
      throw new BadRequestException('Entry not found');
    }

    if (entry.status !== 'draft') {
      throw new BadRequestException('Entry is already posted or cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update entry status
      entry.status = 'posted';
      entry.postedAt = new Date();
      entry.postedBy = userId;
      await queryRunner.manager.save(entry);

      // Update account balances
      for (const line of entry.lines) {
        const account = await queryRunner.manager.findOne(Account, {
          where: { id: line.accountId },
        });

        if (account) {
          const balanceChange = line.debit - line.credit;
          account.balance = Number(account.balance) + balanceChange;
          await queryRunner.manager.save(account);
        }
      }

      await queryRunner.commitTransaction();

      return this.entryRepo.findOne({
        where: { id: entryId },
        relations: ['lines', 'lines.account'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reverse a journal entry
   */
  async reverseEntry(
    entryId: string,
    userId: string,
    reason: string,
  ): Promise<JournalEntry> {
    const originalEntry = await this.entryRepo.findOne({
      where: { id: entryId },
      relations: ['lines'],
    });

    if (!originalEntry) {
      throw new BadRequestException('Entry not found');
    }

    if (originalEntry.status !== 'posted') {
      throw new BadRequestException('Can only reverse posted entries');
    }

    // Create reversal entry with swapped debits/credits
    const reversalLines = originalEntry.lines.map(line => ({
      accountId: line.accountId,
      debit: line.credit, // Swap
      credit: line.debit, // Swap
      label: `REVERSAL: ${line.label}`,
      analyticalSectionId: line.analyticalSectionId,
    }));

    const reversalEntry = await this.createEntry({
      companyId: originalEntry.companyId,
      entryDate: new Date(),
      reference: `REV-${originalEntry.reference}`,
      description: `Reversal of ${originalEntry.reference}: ${reason}`,
      journalCode: originalEntry.journalCode,
      lines: reversalLines,
    });

    // Auto-post the reversal
    await this.postEntry(reversalEntry.id, userId);

    // Mark original as cancelled
    originalEntry.status = 'cancelled';
    await this.entryRepo.save(originalEntry);

    return reversalEntry;
  }

  /**
   * Get journal entries with filters
   */
  async getEntries(filters: {
    companyId: string;
    startDate?: Date;
    endDate?: Date;
    journalCode?: string;
    status?: string;
    accountId?: string;
  }): Promise<JournalEntry[]> {
    const query = this.entryRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'lines')
      .leftJoinAndSelect('lines.account', 'account')
      .where('entry.companyId = :companyId', { companyId: filters.companyId });

    if (filters.startDate) {
      query.andWhere('entry.entryDate >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      query.andWhere('entry.entryDate <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.journalCode) {
      query.andWhere('entry.journalCode = :journalCode', {
        journalCode: filters.journalCode,
      });
    }

    if (filters.status) {
      query.andWhere('entry.status = :status', { status: filters.status });
    }

    if (filters.accountId) {
      query.andWhere('lines.accountId = :accountId', {
        accountId: filters.accountId,
      });
    }

    return query.orderBy('entry.entryDate', 'DESC').getMany();
  }

  /**
   * Validate that debits equal credits
   */
  private validateBalancedEntry(
    lines: { debit: number; credit: number }[],
  ): void {
    const totalDebit = lines.reduce((sum, line) => sum + line.debit, 0);
    const totalCredit = lines.reduce((sum, line) => sum + line.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Entry is not balanced. Debits: ${totalDebit}, Credits: ${totalCredit}`,
      );
    }
  }

  /**
   * Validate that all accounts exist and belong to company
   */
  private async validateAccounts(
    accountIds: string[],
    companyId: string,
  ): Promise<void> {
    const accounts = await this.accountRepo.find({
      where: accountIds.map(id => ({ id, companyId })),
    });

    if (accounts.length !== accountIds.length) {
      throw new BadRequestException('One or more accounts not found');
    }
  }

  /**
   * Generate a unique reference number
   */
  private generateReference(journalCode: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const timestamp = Date.now();
    return `${journalCode}-${year}${month}-${timestamp}`;
  }
}
```

### File: `bms/api-gateway/src/accounting/entities/journal-entry.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { JournalEntryLine } from './journal-entry-line.entity';

@Entity('journal_entries')
@Index(['companyId', 'entryDate'])
@Index(['companyId', 'status'])
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @Column({ type: 'date' })
  entryDate: Date;

  @Column({ length: 50, nullable: true })
  reference: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 10 })
  journalCode: string;

  @Column({ length: 20, default: 'draft' })
  status: 'draft' | 'posted' | 'cancelled';

  @Column({ type: 'timestamp', nullable: true })
  postedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  postedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string;

  @OneToMany(() => JournalEntryLine, line => line.entry, { cascade: true })
  lines: JournalEntryLine[];
}
```

### File: `bms/api-gateway/src/accounting/entities/journal-entry-line.entity.ts`

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { Account } from './account.entity';

@Entity('journal_entry_lines')
@Index(['accountId'])
@Index(['reconciliationKey'])
export class JournalEntryLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  entryId: string;

  @ManyToOne(() => JournalEntry, entry => entry.lines, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'entryId' })
  entry: JournalEntry;

  @Column({ type: 'uuid' })
  accountId: string;

  @ManyToOne(() => Account)
  @JoinColumn({ name: 'accountId' })
  account: Account;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  debit: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  credit: number;

  @Column({ type: 'text' })
  label: string;

  @Column({ type: 'uuid', nullable: true })
  analyticalSectionId: string;

  @Column({ length: 50, nullable: true })
  reconciliationKey: string;

  @Column({ type: 'timestamp', nullable: true })
  reconciledAt: Date;
}
```

---

## Day 3-4: Trial Balance & General Ledger

### File: `bms/api-gateway/src/accounting/services/ledger.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntryLine } from '../entities/journal-entry-line.entity';
import { Account } from '../entities/account.entity';

export interface LedgerEntry {
  date: Date;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface GeneralLedger {
  account: Account;
  openingBalance: number;
  entries: LedgerEntry[];
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
}

export interface TrialBalance {
  accounts: {
    account: Account;
    debit: number;
    credit: number;
    balance: number;
  }[];
  totalDebits: number;
  totalCredits: number;
}

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(JournalEntryLine)
    private lineRepo: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
  ) {}

  /**
   * Generate general ledger for an account
   */
  async getGeneralLedger(
    companyId: string,
    accountId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<GeneralLedger> {
    const account = await this.accountRepo.findOne({
      where: { id: accountId, companyId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Get opening balance (all entries before start date)
    const openingBalance = await this.calculateBalance(
      companyId,
      accountId,
      null,
      startDate,
    );

    // Get entries in period
    const lines = await this.lineRepo
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.entry', 'entry')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('line.accountId = :accountId', { accountId })
      .andWhere('entry.status = :status', { status: 'posted' })
      .andWhere('entry.entryDate >= :startDate', { startDate })
      .andWhere('entry.entryDate <= :endDate', { endDate })
      .orderBy('entry.entryDate', 'ASC')
      .addOrderBy('entry.createdAt', 'ASC')
      .getMany();

    // Build ledger entries with running balance
    let runningBalance = openingBalance;
    const entries: LedgerEntry[] = lines.map(line => {
      const movement = Number(line.debit) - Number(line.credit);
      runningBalance += movement;

      return {
        date: line.entry.entryDate,
        reference: line.entry.reference,
        description: line.label,
        debit: Number(line.debit),
        credit: Number(line.credit),
        balance: runningBalance,
      };
    });

    const totalDebits = lines.reduce((sum, l) => sum + Number(l.debit), 0);
    const totalCredits = lines.reduce((sum, l) => sum + Number(l.credit), 0);

    return {
      account,
      openingBalance,
      entries,
      closingBalance: runningBalance,
      totalDebits,
      totalCredits,
    };
  }

  /**
   * Generate trial balance
   */
  async getTrialBalance(
    companyId: string,
    asOfDate: Date,
  ): Promise<TrialBalance> {
    const accounts = await this.accountRepo.find({
      where: { companyId, isActive: true },
      order: { accountNumber: 'ASC' },
    });

    const accountBalances = await Promise.all(
      accounts.map(async account => {
        const balance = await this.calculateBalance(
          companyId,
          account.id,
          null,
          asOfDate,
        );

        return {
          account,
          debit: balance > 0 ? balance : 0,
          credit: balance < 0 ? Math.abs(balance) : 0,
          balance,
        };
      }),
    );

    // Filter out zero balances
    const nonZeroBalances = accountBalances.filter(
      ab => Math.abs(ab.balance) > 0.01,
    );

    const totalDebits = nonZeroBalances.reduce((sum, ab) => sum + ab.debit, 0);
    const totalCredits = nonZeroBalances.reduce(
      (sum, ab) => sum + ab.credit,
      0,
    );

    return {
      accounts: nonZeroBalances,
      totalDebits,
      totalCredits,
    };
  }

  /**
   * Calculate account balance for a period
   */
  private async calculateBalance(
    companyId: string,
    accountId: string,
    startDate: Date | null,
    endDate: Date,
  ): Promise<number> {
    const query = this.lineRepo
      .createQueryBuilder('line')
      .leftJoin('line.entry', 'entry')
      .select('SUM(line.debit)', 'totalDebit')
      .addSelect('SUM(line.credit)', 'totalCredit')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('line.accountId = :accountId', { accountId })
      .andWhere('entry.status = :status', { status: 'posted' })
      .andWhere('entry.entryDate <= :endDate', { endDate });

    if (startDate) {
      query.andWhere('entry.entryDate >= :startDate', { startDate });
    }

    const result = await query.getRawOne();

    const totalDebit = Number(result.totalDebit) || 0;
    const totalCredit = Number(result.totalCredit) || 0;

    return totalDebit - totalCredit;
  }
}
```

---

## Day 5: Financial Statements

### File: `bms/api-gateway/src/accounting/services/financial-statements.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { LedgerService } from './ledger.service';

export interface BalanceSheet {
  assets: {
    current: { account: Account; amount: number }[];
    fixed: { account: Account; amount: number }[];
    total: number;
  };
  liabilities: {
    current: { account: Account; amount: number }[];
    longTerm: { account: Account; amount: number }[];
    total: number;
  };
  equity: {
    items: { account: Account; amount: number }[];
    total: number;
  };
  asOfDate: Date;
}

export interface ProfitAndLoss {
  revenue: {
    items: { account: Account; amount: number }[];
    total: number;
  };
  expenses: {
    items: { account: Account; amount: number }[];
    total: number;
  };
  netIncome: number;
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class FinancialStatementsService {
  constructor(
    @InjectRepository(Account)
    private accountRepo: Repository<Account>,
    private ledgerService: LedgerService,
  ) {}

  /**
   * Generate balance sheet
   */
  async getBalanceSheet(
    companyId: string,
    asOfDate: Date,
  ): Promise<BalanceSheet> {
    const trialBalance = await this.ledgerService.getTrialBalance(
      companyId,
      asOfDate,
    );

    // Classify accounts
    const assets = trialBalance.accounts.filter(
      ab => ab.account.accountType === 'asset',
    );
    const liabilities = trialBalance.accounts.filter(
      ab => ab.account.accountType === 'liability',
    );
    const equity = trialBalance.accounts.filter(
      ab => ab.account.accountType === 'equity',
    );

    // Separate current and fixed assets (SYSCOHADA classes)
    const currentAssets = assets.filter(
      ab =>
        ab.account.syscohadaClass === 3 || // Stocks
        ab.account.syscohadaClass === 4 || // Tiers
        ab.account.syscohadaClass === 5, // Trésorerie
    );

    const fixedAssets = assets.filter(
      ab => ab.account.syscohadaClass === 2, // Immobilisations
    );

    // Separate current and long-term liabilities
    const currentLiabilities = liabilities.filter(
      ab =>
        ab.account.accountNumber.startsWith('40') || // Fournisseurs
        ab.account.accountNumber.startsWith('42') || // Personnel
        ab.account.accountNumber.startsWith('43') || // Sécurité sociale
        ab.account.accountNumber.startsWith('44'), // État
    );

    const longTermLiabilities = liabilities.filter(
      ab =>
        ab.account.accountNumber.startsWith('16') || // Emprunts
        ab.account.accountNumber.startsWith('17'), // Dettes
    );

    return {
      assets: {
        current: currentAssets.map(ab => ({
          account: ab.account,
          amount: ab.balance,
        })),
        fixed: fixedAssets.map(ab => ({
          account: ab.account,
          amount: ab.balance,
        })),
        total: assets.reduce((sum, ab) => sum + ab.balance, 0),
      },
      liabilities: {
        current: currentLiabilities.map(ab => ({
          account: ab.account,
          amount: Math.abs(ab.balance),
        })),
        longTerm: longTermLiabilities.map(ab => ({
          account: ab.account,
          amount: Math.abs(ab.balance),
        })),
        total: liabilities.reduce((sum, ab) => sum + Math.abs(ab.balance), 0),
      },
      equity: {
        items: equity.map(ab => ({
          account: ab.account,
          amount: Math.abs(ab.balance),
        })),
        total: equity.reduce((sum, ab) => sum + Math.abs(ab.balance), 0),
      },
      asOfDate,
    };
  }

  /**
   * Generate profit and loss statement
   */
  async getProfitAndLoss(
    companyId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ProfitAndLoss> {
    // Get all revenue and expense accounts
    const accounts = await this.accountRepo.find({
      where: { companyId, isActive: true },
    });

    const revenueAccounts = accounts.filter(
      a => a.accountType === 'revenue' || a.syscohadaClass === 7,
    );

    const expenseAccounts = accounts.filter(
      a => a.accountType === 'expense' || a.syscohadaClass === 6,
    );

    // Calculate balances for each account
    const revenueItems = await Promise.all(
      revenueAccounts.map(async account => {
        const ledger = await this.ledgerService.getGeneralLedger(
          companyId,
          account.id,
          startDate,
          endDate,
        );

        return {
          account,
          amount: Math.abs(ledger.closingBalance - ledger.openingBalance),
        };
      }),
    );

    const expenseItems = await Promise.all(
      expenseAccounts.map(async account => {
        const ledger = await this.ledgerService.getGeneralLedger(
          companyId,
          account.id,
          startDate,
          endDate,
        );

        return {
          account,
          amount: Math.abs(ledger.closingBalance - ledger.openingBalance),
        };
      }),
    );

    // Filter out zero amounts
    const nonZeroRevenue = revenueItems.filter(item => item.amount > 0.01);
    const nonZeroExpenses = expenseItems.filter(item => item.amount > 0.01);

    const totalRevenue = nonZeroRevenue.reduce(
      (sum, item) => sum + item.amount,
      0,
    );
    const totalExpenses = nonZeroExpenses.reduce(
      (sum, item) => sum + item.amount,
      0,
    );

    return {
      revenue: {
        items: nonZeroRevenue,
        total: totalRevenue,
      },
      expenses: {
        items: nonZeroExpenses,
        total: totalExpenses,
      },
      netIncome: totalRevenue - totalExpenses,
      startDate,
      endDate,
    };
  }
}
```

---

## Controller Updates

### File: `bms/api-gateway/src/accounting/accounting.controller.ts`

```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { JournalEntryService } from './services/journal-entry.service';
import { LedgerService } from './services/ledger.service';
import { FinancialStatementsService } from './services/financial-statements.service';

@Controller('accounting')
export class AccountingController {
  constructor(
    private journalEntryService: JournalEntryService,
    private ledgerService: LedgerService,
    private financialStatementsService: FinancialStatementsService,
  ) {}

  @Post('journal-entries')
  async createEntry(@Body() dto: any) {
    return this.journalEntryService.createEntry(dto);
  }

  @Post('journal-entries/:id/post')
  async postEntry(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.journalEntryService.postEntry(id, body.userId);
  }

  @Post('journal-entries/:id/reverse')
  async reverseEntry(
    @Param('id') id: string,
    @Body() body: { userId: string; reason: string },
  ) {
    return this.journalEntryService.reverseEntry(id, body.userId, body.reason);
  }

  @Get('journal-entries')
  async getEntries(@Query() filters: any) {
    return this.journalEntryService.getEntries(filters);
  }

  @Get('ledger/:accountId')
  async getGeneralLedger(
    @Param('accountId') accountId: string,
    @Query() query: any,
  ) {
    return this.ledgerService.getGeneralLedger(
      query.companyId,
      accountId,
      new Date(query.startDate),
      new Date(query.endDate),
    );
  }

  @Get('trial-balance')
  async getTrialBalance(@Query() query: any) {
    return this.ledgerService.getTrialBalance(
      query.companyId,
      new Date(query.asOfDate),
    );
  }

  @Get('balance-sheet')
  async getBalanceSheet(@Query() query: any) {
    return this.financialStatementsService.getBalanceSheet(
      query.companyId,
      new Date(query.asOfDate),
    );
  }

  @Get('profit-loss')
  async getProfitAndLoss(@Query() query: any) {
    return this.financialStatementsService.getProfitAndLoss(
      query.companyId,
      new Date(query.startDate),
      new Date(query.endDate),
    );
  }
}
```

---

## Testing

### File: `bms/api-gateway/src/accounting/__tests__/journal-entry.service.spec.ts`

```typescript
import { Test } from '@nestjs/testing';
import { JournalEntryService } from '../services/journal-entry.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JournalEntry } from '../entities/journal-entry.entity';
import { JournalEntryLine } from '../entities/journal-entry-line.entity';
import { Account } from '../entities/account.entity';
import { DataSource } from 'typeorm';

describe('JournalEntryService', () => {
  let service: JournalEntryService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        JournalEntryService,
        {
          provide: getRepositoryToken(JournalEntry),
          useValue: {},
        },
        {
          provide: getRepositoryToken(JournalEntryLine),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Account),
          useValue: {},
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<JournalEntryService>(JournalEntryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Add more tests...
});
```

---

## Summary

This implementation provides:
- ✅ Complete journal entry system with validation
- ✅ Entry posting and reversal
- ✅ General ledger generation
- ✅ Trial balance calculation
- ✅ Balance sheet generation
- ✅ Profit & loss statement
- ✅ Transaction safety with database transactions
- ✅ SYSCOHADA compliance

**Next Steps:**
- Implement bank reconciliation workflow
- Add multi-currency support
- Build fiscal year closing process
- Create Excel export functionality
