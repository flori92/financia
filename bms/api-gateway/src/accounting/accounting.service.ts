import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

/**
 * Service de gestion comptable conforme OHADA
 */
@Injectable()
export class AccountingService {
  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalEntryLinesRepository: Repository<JournalEntryLine>,
  ) {}

  // ============================================
  // GESTION DES COMPTES
  // ============================================

  /**
   * Créer un nouveau compte
   */
  async createAccount(createAccountDto: CreateAccountDto): Promise<Account> {
    // Vérifier que le numéro de compte n'existe pas déjà
    const existing = await this.accountsRepository.findOne({
      where: {
        accountNumber: createAccountDto.accountNumber,
        companyId: createAccountDto.companyId,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Le compte ${createAccountDto.accountNumber} existe déjà`,
      );
    }

    // Vérifier la cohérence de la classe SYSCOHADA avec le type de compte
    this.validateSyscohadaClass(
      createAccountDto.syscohadaClass,
      createAccountDto.accountType,
    );

    const account = this.accountsRepository.create(createAccountDto);
    return this.accountsRepository.save(account);
  }

  /**
   * Récupérer tous les comptes d'une société
   */
  async findAllAccounts(companyId: string): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { companyId },
      order: { accountNumber: 'ASC' },
      relations: ['parent', 'children'],
    });
  }

  /**
   * Récupérer un compte par ID
   */
  async findAccountById(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!account) {
      throw new NotFoundException(`Compte ${id} non trouvé`);
    }

    return account;
  }

  /**
   * Récupérer les comptes par classe SYSCOHADA
   */
  async findAccountsByClass(
    companyId: string,
    syscohadaClass: number,
  ): Promise<Account[]> {
    return this.accountsRepository.find({
      where: { companyId, syscohadaClass },
      order: { accountNumber: 'ASC' },
    });
  }

  /**
   * Mettre à jour un compte
   */
  async updateAccount(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account> {
    const account = await this.findAccountById(id);

    if (
      updateAccountDto.syscohadaClass &&
      updateAccountDto.accountType
    ) {
      this.validateSyscohadaClass(
        updateAccountDto.syscohadaClass,
        updateAccountDto.accountType,
      );
    }

    Object.assign(account, updateAccountDto);
    account.version++;

    return this.accountsRepository.save(account);
  }

  /**
   * Supprimer un compte
   */
  async deleteAccount(id: string): Promise<void> {
    const account = await this.findAccountById(id);

    if (account.balance !== 0) {
      throw new BadRequestException(
        'Impossible de supprimer un compte avec un solde non nul',
      );
    }

    await this.accountsRepository.remove(account);
  }

  // ============================================
  // GESTION DES ÉCRITURES COMPTABLES
  // ============================================

  /**
   * Créer une nouvelle écriture comptable
   */
  async createJournalEntry(
    createJournalEntryDto: CreateJournalEntryDto,
  ): Promise<JournalEntry> {
    // Valider que les débits = crédits
    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of createJournalEntryDto.lines) {
      totalDebit += line.debit || 0;
      totalCredit += line.credit || 0;

      // Vérifier qu'une ligne n'a pas à la fois débit et crédit
      if (line.debit && line.credit) {
        throw new BadRequestException(
          'Une ligne ne peut pas avoir à la fois un débit et un crédit',
        );
      }
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(
        `Déséquilibre comptable: Débit=${totalDebit}, Crédit=${totalCredit}`,
      );
    }

    // Générer le numéro d'écriture
    const entryNumber = await this.generateEntryNumber(
      createJournalEntryDto.companyId,
      createJournalEntryDto.journalType,
    );

    // Créer l'écriture
    const journalEntry = this.journalEntriesRepository.create({
      entryNumber,
      entryDate: new Date(createJournalEntryDto.entryDate),
      reference: createJournalEntryDto.reference,
      description: createJournalEntryDto.description,
      journalType: createJournalEntryDto.journalType,
      companyId: createJournalEntryDto.companyId,
      createdBy: createJournalEntryDto.createdBy,
      totalDebit,
      totalCredit,
      status: 'draft',
    });

    const savedEntry = await this.journalEntriesRepository.save(journalEntry);

    // Créer les lignes
    const lines = [];
    for (let i = 0; i < createJournalEntryDto.lines.length; i++) {
      const lineDto = createJournalEntryDto.lines[i];
      const account = await this.findAccountById(lineDto.accountId);

      const line = this.journalEntryLinesRepository.create({
        journalEntry: savedEntry,
        account,
        lineNumber: i + 1,
        label: lineDto.label,
        debit: lineDto.debit || 0,
        credit: lineDto.credit || 0,
        analyticReference: lineDto.analyticReference,
      });

      lines.push(line);
    }

    await this.journalEntryLinesRepository.save(lines);

    return this.findJournalEntryById(savedEntry.id);
  }

  /**
   * Récupérer toutes les écritures d'une société
   */
  async findAllJournalEntries(
    companyId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<JournalEntry[]> {
    const where: any = { companyId };

    if (startDate && endDate) {
      where.entryDate = Between(new Date(startDate), new Date(endDate));
    }

    return this.journalEntriesRepository.find({
      where,
      order: { entryDate: 'DESC', entryNumber: 'DESC' },
      relations: ['lines', 'lines.account'],
    });
  }

  /**
   * Récupérer une écriture par ID
   */
  async findJournalEntryById(id: string): Promise<JournalEntry> {
    const entry = await this.journalEntriesRepository.findOne({
      where: { id },
      relations: ['lines', 'lines.account'],
    });

    if (!entry) {
      throw new NotFoundException(`Écriture ${id} non trouvée`);
    }

    return entry;
  }

  /**
   * Valider (poster) une écriture
   */
  async postJournalEntry(id: string, userId: string): Promise<JournalEntry> {
    const entry = await this.findJournalEntryById(id);

    if (entry.status !== 'draft') {
      throw new BadRequestException('Cette écriture est déjà validée');
    }

    entry.status = 'posted';
    entry.postedAt = new Date();
    entry.postedBy = userId;
    entry.version++;

    // Mettre à jour les soldes des comptes
    for (const line of entry.lines) {
      await this.updateAccountBalance(line.account.id, line.debit, line.credit);
    }

    return this.journalEntriesRepository.save(entry);
  }

  /**
   * Annuler une écriture
   */
  async cancelJournalEntry(id: string): Promise<JournalEntry> {
    const entry = await this.findJournalEntryById(id);

    if (entry.status === 'cancelled') {
      throw new BadRequestException('Cette écriture est déjà annulée');
    }

    entry.status = 'cancelled';
    entry.version++;

    // Si l'écriture était validée, inverser les soldes
    if (entry.status === 'posted') {
      for (const line of entry.lines) {
        await this.updateAccountBalance(
          line.account.id,
          -line.debit,
          -line.credit,
        );
      }
    }

    return this.journalEntriesRepository.save(entry);
  }

  // ============================================
  // RAPPORTS OHADA
  // ============================================

  /**
   * Générer le Bilan (Balance Sheet) OHADA
   */
  async generateBalanceSheet(
    companyId: string,
    date: string,
  ): Promise<any> {
    const accounts = await this.findAllAccounts(companyId);

    // Actif (Classes 2, 3, 4, 5)
    const assets = {
      immobilisations: this.filterAccountsByClass(accounts, 2), // Classe 2
      stocks: this.filterAccountsByClass(accounts, 3), // Classe 3
      creances: this.filterAccountsByClass(accounts, 4).filter(
        (a) => a.balance > 0,
      ), // Classe 4 (débiteur)
      tresorerie: this.filterAccountsByClass(accounts, 5), // Classe 5
    };

    // Passif (Classes 1, 4)
    const liabilities = {
      capitaux: this.filterAccountsByClass(accounts, 1), // Classe 1
      dettes: this.filterAccountsByClass(accounts, 4).filter(
        (a) => a.balance < 0,
      ), // Classe 4 (créditeur)
    };

    const totalAssets = this.calculateTotalBalance(
      Object.values(assets).flat(),
    );
    const totalLiabilities = this.calculateTotalBalance(
      Object.values(liabilities).flat(),
    );

    return {
      date,
      actif: {
        immobilisations: this.summarizeAccounts(assets.immobilisations),
        stocks: this.summarizeAccounts(assets.stocks),
        creances: this.summarizeAccounts(assets.creances),
        tresorerie: this.summarizeAccounts(assets.tresorerie),
        total: totalAssets,
      },
      passif: {
        capitaux: this.summarizeAccounts(liabilities.capitaux),
        dettes: this.summarizeAccounts(liabilities.dettes),
        total: totalLiabilities,
      },
      equilibre: Math.abs(totalAssets - totalLiabilities) < 0.01,
    };
  }

  /**
   * Générer le Compte de Résultat (Income Statement) OHADA
   */
  async generateIncomeStatement(
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<any> {
    const accounts = await this.findAllAccounts(companyId);

    // Produits (Classe 7)
    const revenues = this.filterAccountsByClass(accounts, 7);

    // Charges (Classe 6)
    const expenses = this.filterAccountsByClass(accounts, 6);

    const totalRevenues = this.calculateTotalBalance(revenues);
    const totalExpenses = this.calculateTotalBalance(expenses);
    const netIncome = totalRevenues - totalExpenses;

    return {
      period: { startDate, endDate },
      produits: {
        detail: this.summarizeAccounts(revenues),
        total: totalRevenues,
      },
      charges: {
        detail: this.summarizeAccounts(expenses),
        total: totalExpenses,
      },
      resultat: {
        net: netIncome,
        type: netIncome >= 0 ? 'Bénéfice' : 'Perte',
      },
    };
  }

  /**
   * Générer le Grand Livre (General Ledger)
   */
  async generateGeneralLedger(
    companyId: string,
    accountNumber?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    let accounts: Account[];

    if (accountNumber) {
      const account = await this.accountsRepository.findOne({
        where: { accountNumber, companyId },
      });
      if (!account) {
        throw new NotFoundException(`Compte ${accountNumber} non trouvé`);
      }
      accounts = [account];
    } else {
      accounts = await this.findAllAccounts(companyId);
    }

    const ledger = [];

    for (const account of accounts) {
      const entries = await this.getAccountEntries(
        account.id,
        startDate,
        endDate,
      );

      ledger.push({
        account: {
          number: account.accountNumber,
          name: account.accountName,
          balance: account.balance,
        },
        entries: entries.map((line) => ({
          date: line.journalEntry.entryDate,
          reference: line.journalEntry.entryNumber,
          description: line.label,
          debit: line.debit,
          credit: line.credit,
        })),
      });
    }

    return ledger;
  }

  // ============================================
  // MÉTHODES UTILITAIRES
  // ============================================

  /**
   * Mettre à jour le solde d'un compte
   */
  private async updateAccountBalance(
    accountId: string,
    debit: number,
    credit: number,
  ): Promise<void> {
    const account = await this.findAccountById(accountId);

    // Pour les comptes d'actif et de charges: Débit augmente, Crédit diminue
    // Pour les comptes de passif, capitaux et produits: Crédit augmente, Débit diminue
    if (['asset', 'expense'].includes(account.accountType)) {
      account.balance = Number(account.balance) + debit - credit;
    } else {
      account.balance = Number(account.balance) + credit - debit;
    }

    await this.accountsRepository.save(account);
  }

  /**
   * Générer un numéro d'écriture unique
   */
  private async generateEntryNumber(
    companyId: string,
    journalType: string,
  ): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const prefix = {
      sales: 'VTE',
      purchase: 'ACH',
      bank: 'BNQ',
      general: 'OD',
    }[journalType];

    const count = await this.journalEntriesRepository.count({
      where: { companyId, journalType },
    });

    return `${prefix}-${year}${month}-${String(count + 1).padStart(4, '0')}`;
  }

  /**
   * Valider la cohérence classe SYSCOHADA / type de compte
   */
  private validateSyscohadaClass(
    syscohadaClass: number,
    accountType: string,
  ): void {
    const validCombinations = {
      1: ['equity', 'liability'], // Ressources durables
      2: ['asset'], // Actif immobilisé
      3: ['asset'], // Stocks
      4: ['asset', 'liability'], // Comptes de tiers
      5: ['asset'], // Trésorerie
      6: ['expense'], // Charges
      7: ['revenue'], // Produits
      8: ['asset', 'liability', 'expense', 'revenue'], // Comptes spéciaux
    };

    if (!validCombinations[syscohadaClass]?.includes(accountType)) {
      throw new BadRequestException(
        `Incompatibilité: Classe ${syscohadaClass} et type ${accountType}`,
      );
    }
  }

  /**
   * Filtrer les comptes par classe
   */
  private filterAccountsByClass(
    accounts: Account[],
    syscohadaClass: number,
  ): Account[] {
    return accounts.filter((a) => a.syscohadaClass === syscohadaClass);
  }

  /**
   * Calculer le total des soldes
   */
  private calculateTotalBalance(accounts: Account[]): number {
    return accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
  }

  /**
   * Résumer les comptes pour les rapports
   */
  private summarizeAccounts(
    accounts: Account[],
  ): Array<{ number: string; name: string; balance: number }> {
    return accounts.map((a) => ({
      number: a.accountNumber,
      name: a.accountName,
      balance: Number(a.balance),
    }));
  }

  /**
   * Récupérer les écritures d'un compte
   */
  private async getAccountEntries(
    accountId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<JournalEntryLine[]> {
    const query = this.journalEntryLinesRepository
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.journalEntry', 'entry')
      .where('line.account.id = :accountId', { accountId })
      .andWhere('entry.status = :status', { status: 'posted' });

    if (startDate && endDate) {
      query.andWhere('entry.entryDate BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    return query.orderBy('entry.entryDate', 'ASC').getMany();
  }
}
