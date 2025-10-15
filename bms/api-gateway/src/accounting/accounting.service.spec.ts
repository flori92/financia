import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountingService } from './accounting.service';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';

describe('AccountingService', () => {
  let service: AccountingService;
  let accountsRepository: Repository<Account>;
  let journalEntriesRepository: Repository<JournalEntry>;
  let journalEntryLinesRepository: Repository<JournalEntryLine>;

  const mockAccountsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  const mockJournalEntriesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockJournalEntryLinesRepository = {
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountingService,
        {
          provide: getRepositoryToken(Account),
          useValue: mockAccountsRepository,
        },
        {
          provide: getRepositoryToken(JournalEntry),
          useValue: mockJournalEntriesRepository,
        },
        {
          provide: getRepositoryToken(JournalEntryLine),
          useValue: mockJournalEntryLinesRepository,
        },
      ],
    }).compile();

    service = module.get<AccountingService>(AccountingService);
    accountsRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
    journalEntriesRepository = module.get<Repository<JournalEntry>>(
      getRepositoryToken(JournalEntry),
    );
    journalEntryLinesRepository = module.get<Repository<JournalEntryLine>>(
      getRepositoryToken(JournalEntryLine),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAccount', () => {
    it('devrait créer un compte avec succès', async () => {
      const createAccountDto = {
        accountNumber: '411',
        accountName: 'Clients',
        accountType: 'asset',
        syscohadaClass: 4,
        companyId: 'company-123',
      };

      const account = { id: 'account-123', ...createAccountDto };

      mockAccountsRepository.findOne.mockResolvedValue(null);
      mockAccountsRepository.create.mockReturnValue(account);
      mockAccountsRepository.save.mockResolvedValue(account);

      const result = await service.createAccount(createAccountDto as any);

      expect(result).toEqual(account);
      expect(mockAccountsRepository.findOne).toHaveBeenCalledWith({
        where: {
          accountNumber: createAccountDto.accountNumber,
          companyId: createAccountDto.companyId,
        },
      });
      expect(mockAccountsRepository.create).toHaveBeenCalledWith(
        createAccountDto,
      );
      expect(mockAccountsRepository.save).toHaveBeenCalledWith(account);
    });

    it('devrait échouer si le compte existe déjà', async () => {
      const createAccountDto = {
        accountNumber: '411',
        accountName: 'Clients',
        accountType: 'asset',
        syscohadaClass: 4,
        companyId: 'company-123',
      };

      mockAccountsRepository.findOne.mockResolvedValue({ id: 'existing' });

      await expect(
        service.createAccount(createAccountDto as any),
      ).rejects.toThrow(ConflictException);
    });

    it('devrait valider la cohérence classe SYSCOHADA / type', async () => {
      const createAccountDto = {
        accountNumber: '411',
        accountName: 'Clients',
        accountType: 'expense', // Incompatible avec classe 4
        syscohadaClass: 4,
        companyId: 'company-123',
      };

      mockAccountsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createAccount(createAccountDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAccountById', () => {
    it('devrait retourner un compte existant', async () => {
      const account = {
        id: 'account-123',
        accountNumber: '411',
        accountName: 'Clients',
      };

      mockAccountsRepository.findOne.mockResolvedValue(account);

      const result = await service.findAccountById('account-123');

      expect(result).toEqual(account);
      expect(mockAccountsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'account-123' },
        relations: ['parent', 'children'],
      });
    });

    it('devrait lever une exception si le compte n\'existe pas', async () => {
      mockAccountsRepository.findOne.mockResolvedValue(null);

      await expect(service.findAccountById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createJournalEntry', () => {
    it('devrait créer une écriture équilibrée', async () => {
      const createDto = {
        entryDate: '2025-10-15',
        description: 'Vente client',
        journalType: 'sales',
        companyId: 'company-123',
        createdBy: 'user-123',
        lines: [
          {
            accountId: 'account-1',
            label: 'Clients',
            debit: 100000,
            credit: 0,
          },
          {
            accountId: 'account-2',
            label: 'Ventes',
            debit: 0,
            credit: 100000,
          },
        ],
      };

      const account1 = { id: 'account-1', accountNumber: '411' };
      const account2 = { id: 'account-2', accountNumber: '701' };
      const entry = { id: 'entry-123', entryNumber: 'VTE-202510-0001' };

      mockJournalEntriesRepository.count.mockResolvedValue(0);
      mockJournalEntriesRepository.create.mockReturnValue(entry);
      mockJournalEntriesRepository.save.mockResolvedValue(entry);
      mockAccountsRepository.findOne
        .mockResolvedValueOnce(account1)
        .mockResolvedValueOnce(account2);
      mockJournalEntryLinesRepository.create
        .mockReturnValueOnce({ id: 'line-1' })
        .mockReturnValueOnce({ id: 'line-2' });
      mockJournalEntryLinesRepository.save.mockResolvedValue([]);
      mockJournalEntriesRepository.findOne.mockResolvedValue({
        ...entry,
        lines: [],
      });

      const result = await service.createJournalEntry(createDto as any);

      expect(result).toBeDefined();
      expect(mockJournalEntriesRepository.save).toHaveBeenCalled();
    });

    it('devrait échouer si Débit ≠ Crédit', async () => {
      const createDto = {
        entryDate: '2025-10-15',
        description: 'Test',
        journalType: 'general',
        companyId: 'company-123',
        createdBy: 'user-123',
        lines: [
          {
            accountId: 'account-1',
            label: 'Test',
            debit: 100000,
            credit: 0,
          },
          {
            accountId: 'account-2',
            label: 'Test',
            debit: 0,
            credit: 50000, // Déséquilibré
          },
        ],
      };

      await expect(
        service.createJournalEntry(createDto as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('devrait échouer si une ligne a débit ET crédit', async () => {
      const createDto = {
        entryDate: '2025-10-15',
        description: 'Test',
        journalType: 'general',
        companyId: 'company-123',
        createdBy: 'user-123',
        lines: [
          {
            accountId: 'account-1',
            label: 'Test',
            debit: 50000,
            credit: 50000, // Invalide
          },
        ],
      };

      await expect(
        service.createJournalEntry(createDto as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateBalanceSheet', () => {
    it('devrait générer un bilan OHADA', async () => {
      const accounts = [
        {
          id: '1',
          accountNumber: '211',
          accountName: 'Terrains',
          syscohadaClass: 2,
          balance: 5000000,
        },
        {
          id: '2',
          accountNumber: '512',
          accountName: 'Banque',
          syscohadaClass: 5,
          balance: 1000000,
        },
        {
          id: '3',
          accountNumber: '101',
          accountName: 'Capital',
          syscohadaClass: 1,
          balance: 6000000,
        },
      ];

      mockAccountsRepository.find.mockResolvedValue(accounts as any);

      const result = await service.generateBalanceSheet(
        'company-123',
        '2025-10-15',
      );

      expect(result).toBeDefined();
      expect(result.actif).toBeDefined();
      expect(result.passif).toBeDefined();
      expect(result.equilibre).toBe(true);
    });
  });

  describe('generateIncomeStatement', () => {
    it('devrait générer un compte de résultat OHADA', async () => {
      const accounts = [
        {
          id: '1',
          accountNumber: '601',
          accountName: 'Achats',
          syscohadaClass: 6,
          balance: 3000000,
        },
        {
          id: '2',
          accountNumber: '701',
          accountName: 'Ventes',
          syscohadaClass: 7,
          balance: 5000000,
        },
      ];

      mockAccountsRepository.find.mockResolvedValue(accounts as any);

      const result = await service.generateIncomeStatement(
        'company-123',
        '2025-01-01',
        '2025-12-31',
      );

      expect(result).toBeDefined();
      expect(result.produits).toBeDefined();
      expect(result.charges).toBeDefined();
      expect(result.resultat).toBeDefined();
      expect(result.resultat.type).toBe('Bénéfice');
    });
  });
});
