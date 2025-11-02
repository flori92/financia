import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Account } from './entities/account.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { AccountingClosureService } from './accounting-closure.service';

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
    private closureService: AccountingClosureService,
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
    // Vérifier que la date n'est pas dans une période clôturée
    const entryDate = new Date(createJournalEntryDto.entryDate);
    const isLocked = await this.closureService.isDateLocked(
      createJournalEntryDto.companyId,
      entryDate,
    );
    if (isLocked) {
      throw new BadRequestException(
        `Impossible de créer une écriture à la date ${entryDate.toLocaleDateString('fr-FR')}. Cette période est clôturée.`,
      );
    }

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
   * Générer le Grand Livre (General Ledger) avec détail des mouvements
   * (Version améliorée avec solde progressif)
   */
  async generateGeneralLedger(
    companyId: string,
    accountNumber?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    movements: Array<{
      date: string;
      entryNumber: string;
      description: string;
      reference: string;
      debit: number;
      credit: number;
      balance: number;
    }>;
    account: { number: string; name: string; type: string } | null;
    summary: { totalDebit: number; totalCredit: number; finalBalance: number };
  }> {
    if (!companyId) throw new BadRequestException('companyId requis');

    // Si un compte est spécifié, récupérer ses détails
    let account: Account | null = null;
    if (accountNumber) {
      account = await this.accountsRepository.findOne({
        where: { companyId, accountNumber },
      });
      if (!account) {
        throw new NotFoundException(`Compte ${accountNumber} introuvable`);
      }
    }

    // Construire la requête
    const query = this.journalEntriesRepository
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'line')
      .leftJoinAndSelect('line.account', 'account')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.status = :status', { status: 'posted' });

    if (startDate) {
      query.andWhere('entry.entryDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('entry.entryDate <= :endDate', { endDate });
    }

    if (accountNumber && account) {
      query.andWhere('line.account_id = :accountId', { accountId: account.id });
    }

    const entries = await query
      .orderBy('entry.entryDate', 'ASC')
      .addOrderBy('entry.entryNumber', 'ASC')
      .getMany();

    // Construire les mouvements
    const movements: Array<{
      date: string;
      entryNumber: string;
      description: string;
      reference: string;
      debit: number;
      credit: number;
      balance: number;
    }> = [];

    let runningBalance = 0;
    let totalDebit = 0;
    let totalCredit = 0;

    for (const entry of entries) {
      for (const line of entry.lines) {
        // Filtrer par compte si spécifié
        if (accountNumber && account && line.account.id !== account.id) {
          continue;
        }

        const debit = parseFloat(String(line.debit || 0));
        const credit = parseFloat(String(line.credit || 0));

        totalDebit += debit;
        totalCredit += credit;

        // Calcul du solde progressif (débit - crédit pour simplifier)
        runningBalance += debit - credit;

        const entryDateStr = typeof entry.entryDate === 'string'
          ? (entry.entryDate as string).slice(0, 10)
          : (entry.entryDate as Date).toISOString().slice(0, 10);

        movements.push({
          date: entryDateStr,
          entryNumber: entry.entryNumber,
          description: line.label || entry.description,
          reference: entry.reference || '',
          debit,
          credit,
          balance: runningBalance,
        });
      }
    }

    return {
      movements,
      account: account
        ? {
            number: account.accountNumber,
            name: account.accountName,
            type: account.accountType,
          }
        : null,
      summary: {
        totalDebit,
        totalCredit,
        finalBalance: runningBalance,
      },
    };
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
   * Initialiser le plan comptable SYSCOHADA pour une société
   * Retourne le nombre de comptes créés
   */
  async seedSyscohada(companyId: string): Promise<number> {
    if (!companyId) {
      throw new BadRequestException('companyId est requis');
    }

    try {

    // Comptes de référence (extraits SYSCOHADA, représentatifs des classes 1 à 8)
    const defs: Array<{ n: string; name: string; type: 'asset'|'liability'|'equity'|'revenue'|'expense'; cls: number }>= [
      // Classe 1 — Ressources durables (equity/liability)
      { n:'101', name:'Capital social', type:'equity', cls:1 },
      { n:'106', name:'Réserves', type:'equity', cls:1 },
      { n:'110', name:'Report à nouveau', type:'equity', cls:1 },
      { n:'120', name:'Résultat de l\'exercice', type:'equity', cls:1 },
      { n:'160', name:'Emprunts obligataires', type:'liability', cls:1 },
      { n:'161', name:'Emprunts auprès des établissements de crédit', type:'liability', cls:1 },
      { n:'168', name:'Provisions pour risques et charges', type:'liability', cls:1 },
      { n:'170', name:'Subventions d\'investissement', type:'equity', cls:1 },

      // Classe 2 — Actif immobilisé (asset)
      { n:'201', name:'Immobilisations incorporelles', type:'asset', cls:2 },
      { n:'211', name:'Terrains', type:'asset', cls:2 },
      { n:'212', name:'Constructions', type:'asset', cls:2 },
      { n:'213', name:'Installations techniques', type:'asset', cls:2 },
      { n:'215', name:'Matériel et outillage', type:'asset', cls:2 },
      { n:'218', name:'Matériel de transport', type:'asset', cls:2 },
      { n:'2183', name:'Mobilier et matériel de bureau', type:'asset', cls:2 },

      // Classe 3 — Stocks (asset)
      { n:'31', name:'Matières premières', type:'asset', cls:3 },
      { n:'32', name:'Autres approvisionnements', type:'asset', cls:3 },
      { n:'33', name:'Produits en cours', type:'asset', cls:3 },
      { n:'34', name:'Produits finis', type:'asset', cls:3 },
      { n:'35', name:'Marchandises', type:'asset', cls:3 },

      // Classe 4 — Tiers (asset/liability)
      { n:'401', name:'Fournisseurs', type:'liability', cls:4 },
      { n:'404', name:'Fournisseurs d\'immobilisations', type:'liability', cls:4 },
      { n:'411', name:'Clients', type:'asset', cls:4 },
      { n:'416', name:'Clients douteux', type:'asset', cls:4 },
      { n:'421', name:'Personnel - Rémunérations dues', type:'liability', cls:4 },
      { n:'431', name:'Sécurité sociale', type:'liability', cls:4 },
      { n:'4456', name:'TVA déductible', type:'asset', cls:4 },
      { n:'4457', name:'TVA collectée', type:'liability', cls:4 },

      // Classe 5 — Trésorerie (asset)
      { n:'512', name:'Banque', type:'asset', cls:5 },
      { n:'531', name:'Caisse', type:'asset', cls:5 },

      // Classe 6 — Charges (expense)
      { n:'601', name:'Achats stockés - matières premières', type:'expense', cls:6 },
      { n:'602', name:'Achats stockés - autres approvisionnements', type:'expense', cls:6 },
      { n:'606', name:'Achats non stockés', type:'expense', cls:6 },
      { n:'607', name:'Achats de marchandises', type:'expense', cls:6 },
      { n:'611', name:'Sous-traitance générale', type:'expense', cls:6 },
      { n:'613', name:'Locations', type:'expense', cls:6 },
      { n:'615', name:'Entretien et réparations', type:'expense', cls:6 },
      { n:'618', name:'Divers - services extérieurs', type:'expense', cls:6 },
      { n:'63', name:'Impôts et taxes', type:'expense', cls:6 },
      { n:'64', name:'Charges de personnel', type:'expense', cls:6 },
      { n:'68', name:'Dotations aux amortissements', type:'expense', cls:6 },

      // Classe 7 — Produits (revenue)
      { n:'701', name:'Ventes de produits finis', type:'revenue', cls:7 },
      { n:'706', name:'Prestations de services', type:'revenue', cls:7 },
      { n:'707', name:'Ventes de marchandises', type:'revenue', cls:7 },
      { n:'75', name:'Autres produits de gestion courante', type:'revenue', cls:7 },
      { n:'781', name:'Reprises sur amortissements et provisions', type:'revenue', cls:7 },

      // Classe 8 — Comptes spéciaux (mixte)
      { n:'86', name:'Charges exceptionnelles', type:'expense', cls:8 },
      { n:'87', name:'Produits exceptionnels', type:'revenue', cls:8 },
    ];

    // Récupérer les comptes existants pour éviter les doublons
    const existing = await this.accountsRepository.find({ where: { companyId } });
    const existingNumbers = new Set(existing.map((a) => a.accountNumber));

    let created = 0;
    for (const d of defs) {
      if (existingNumbers.has(d.n)) continue;
      // Valider la combinaison classe/type
      this.validateSyscohadaClass(d.cls, d.type);
      const account = this.accountsRepository.create({
        accountNumber: d.n,
        accountName: d.name,
        accountType: d.type,
        syscohadaClass: d.cls,
        companyId,
        currency: 'XOF',
        isActive: true,
        balance: 0.00,
      });
      await this.accountsRepository.save(account);
      created++;
    }

    return created;
    } catch (error) {
      console.error('Erreur dans seedSyscohada:', error);
      throw new InternalServerErrorException(`Erreur lors de l'initialisation SYSCOHADA: ${error.message}`);
    }
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

  // ============================================
  // ÉTATS COMPTABLES
  // ============================================

  async getTrialBalance(
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    rows: Array<{ number: string; name: string; debit: number; credit: number; balance: number }>;
    totals: { debit: number; credit: number; balance: number };
  }> {
    if (!companyId) throw new BadRequestException('companyId requis');
    const accounts = await this.findAllAccounts(companyId);
    const rows: Array<{ number: string; name: string; debit: number; credit: number; balance: number }> = [];
    let totalDebit = 0;
    let totalCredit = 0;

    for (const acc of accounts) {
      const entries = await this.getAccountEntries(acc.id, startDate, endDate);
      const debit = entries.reduce((s, l) => s + Number(l.debit || 0), 0);
      const credit = entries.reduce((s, l) => s + Number(l.credit || 0), 0);
      const balance = debit - credit;
      if (debit !== 0 || credit !== 0) {
        rows.push({ number: acc.accountNumber, name: acc.accountName, debit, credit, balance });
      }
      totalDebit += debit;
      totalCredit += credit;
    }

    return { rows, totals: { debit: totalDebit, credit: totalCredit, balance: totalDebit - totalCredit } };
  }

  async getProfitLoss(
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    revenues: Array<{ number: string; name: string; amount: number }>;
    expenses: Array<{ number: string; name: string; amount: number }>;
    totals: { revenues: number; expenses: number; result: number };
  }> {
    if (!companyId) throw new BadRequestException('companyId requis');
    const accounts = await this.findAllAccounts(companyId);
    const revRows: Array<{ number: string; name: string; amount: number }> = [];
    const expRows: Array<{ number: string; name: string; amount: number }> = [];
    let totalRev = 0;
    let totalExp = 0;

    for (const acc of accounts) {
      if (acc.accountType !== 'revenue' && acc.accountType !== 'expense') continue;
      const entries = await this.getAccountEntries(acc.id, startDate, endDate);
      const debit = entries.reduce((s, l) => s + Number(l.debit || 0), 0);
      const credit = entries.reduce((s, l) => s + Number(l.credit || 0), 0);
      const movement = acc.accountType === 'expense' ? (debit - credit) : (credit - debit);
      if (movement === 0) continue;
      if (acc.accountType === 'expense') { expRows.push({ number: acc.accountNumber, name: acc.accountName, amount: movement }); totalExp += movement; }
      else { revRows.push({ number: acc.accountNumber, name: acc.accountName, amount: movement }); totalRev += movement; }
    }

    return { revenues: revRows, expenses: expRows, totals: { revenues: totalRev, expenses: totalExp, result: totalRev - totalExp } };
  }

  async getBalanceSheet(
    companyId: string,
    date: string,
  ): Promise<{
    assets: Array<{ number: string; name: string; amount: number }>;
    liabilities: Array<{ number: string; name: string; amount: number }>;
    equity: Array<{ number: string; name: string; amount: number }>;
    totals: { assets: number; liabilitiesEquity: number };
  }> {
    if (!companyId) throw new BadRequestException('companyId requis');
    const accounts = await this.findAllAccounts(companyId);
    const assets: Array<{ number: string; name: string; amount: number }> = [];
    const liabilities: Array<{ number: string; name: string; amount: number }> = [];
    const equity: Array<{ number: string; name: string; amount: number }> = [];
    let totalAssets = 0;
    let totalLE = 0;

    const startEpoch = '1970-01-01';
    for (const acc of accounts) {
      const entries = await this.getAccountEntries(acc.id, startEpoch, date);
      const debit = entries.reduce((s, l) => s + Number(l.debit || 0), 0);
      const credit = entries.reduce((s, l) => s + Number(l.credit || 0), 0);
      const amount = this.computeSignedBalance(acc.accountType, debit, credit);
      if (amount === 0) continue;
      if (acc.accountType === 'asset') { assets.push({ number: acc.accountNumber, name: acc.accountName, amount }); totalAssets += amount; }
      else if (acc.accountType === 'liability') { liabilities.push({ number: acc.accountNumber, name: acc.accountName, amount }); totalLE += amount; }
      else if (acc.accountType === 'equity') { equity.push({ number: acc.accountNumber, name: acc.accountName, amount }); totalLE += amount; }
    }

    return { assets, liabilities, equity, totals: { assets: totalAssets, liabilitiesEquity: totalLE } };
  }

  /**
   * Balance Âgée: Analyse des créances/dettes par ancienneté
   */
  async getAgedBalance(
    companyId: string,
    type: 'receivables' | 'payables',
    asOfDate: string,
  ): Promise<{
    type: string;
    asOfDate: string;
    items: Array<{
      party: string;
      total: number;
      current: number;      // 0-30 jours
      days30_60: number;    // 30-60 jours
      days60_90: number;    // 60-90 jours
      over90: number;       // > 90 jours
      oldestDate: string;
    }>;
    totals: {
      total: number;
      current: number;
      days30_60: number;
      days60_90: number;
      over90: number;
    };
  }> {
    if (!companyId) throw new BadRequestException('companyId requis');

    // Déterminer le compte à analyser
    const accountNumber = type === 'receivables' ? '411' : '401';
    
    // Récupérer le compte
    const account = await this.accountsRepository.findOne({
      where: { companyId, accountNumber },
    });

    if (!account) {
      throw new NotFoundException(`Compte ${accountNumber} introuvable`);
    }

    // Récupérer toutes les lignes d'écriture pour ce compte jusqu'à la date
    const lines = await this.journalEntryLinesRepository
      .createQueryBuilder('line')
      .leftJoinAndSelect('line.journalEntry', 'entry')
      .where('line.account_id = :accountId', { accountId: account.id })
      .andWhere('entry.status = :status', { status: 'posted' })
      .andWhere('entry.entryDate <= :asOfDate', { asOfDate })
      .orderBy('entry.entryDate', 'ASC')
      .getMany();

    // Grouper par tiers (label de la ligne = nom client/fournisseur)
    const byParty = new Map<string, Array<{ date: Date; amount: number }>>();

    for (const line of lines) {
      const party = line.label || 'Non spécifié';
      const debit = parseFloat(String(line.debit || 0));
      const credit = parseFloat(String(line.credit || 0));
      
      // Pour créances (411): débit augmente, crédit diminue
      // Pour dettes (401): crédit augmente, débit diminue
      const amount = type === 'receivables' ? (debit - credit) : (credit - debit);
      
      if (!byParty.has(party)) {
        byParty.set(party, []);
      }
      
      byParty.get(party)!.push({
        date: typeof line.journalEntry.entryDate === 'string' 
          ? new Date(line.journalEntry.entryDate) 
          : line.journalEntry.entryDate,
        amount,
      });
    }

    // Calculer l'ancienneté pour chaque tiers
    const asOf = new Date(asOfDate);
    const items: Array<{
      party: string;
      total: number;
      current: number;
      days30_60: number;
      days60_90: number;
      over90: number;
      oldestDate: string;
    }> = [];

    let totalCurrent = 0;
    let total30_60 = 0;
    let total60_90 = 0;
    let totalOver90 = 0;
    let grandTotal = 0;

    for (const [party, movements] of byParty.entries()) {
      let partyTotal = 0;
      let current = 0;
      let days30_60 = 0;
      let days60_90 = 0;
      let over90 = 0;
      let oldestDate: Date | null = null;

      for (const mvt of movements) {
        partyTotal += mvt.amount;
        
        // Calculer l'âge en jours
        const ageInDays = Math.floor(
          (asOf.getTime() - mvt.date.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (!oldestDate || mvt.date < oldestDate) {
          oldestDate = mvt.date;
        }

        // Répartir par tranche d'âge
        if (ageInDays <= 30) {
          current += mvt.amount;
        } else if (ageInDays <= 60) {
          days30_60 += mvt.amount;
        } else if (ageInDays <= 90) {
          days60_90 += mvt.amount;
        } else {
          over90 += mvt.amount;
        }
      }

      // Ignorer si solde nul
      if (Math.abs(partyTotal) < 0.01) continue;

      items.push({
        party,
        total: partyTotal,
        current,
        days30_60,
        days60_90,
        over90,
        oldestDate: oldestDate ? oldestDate.toISOString().slice(0, 10) : '',
      });

      totalCurrent += current;
      total30_60 += days30_60;
      total60_90 += days60_90;
      totalOver90 += over90;
      grandTotal += partyTotal;
    }

    // Trier par montant total décroissant
    items.sort((a, b) => Math.abs(b.total) - Math.abs(a.total));

    return {
      type,
      asOfDate,
      items,
      totals: {
        total: grandTotal,
        current: totalCurrent,
        days30_60: total30_60,
        days60_90: total60_90,
        over90: totalOver90,
      },
    };
  }

  async getAgedBalance(companyId: string, type: 'receivables' | 'payables', asOfDate: string): Promise<any> {
    try {
      // Définir les comptes à analyser selon le type
      const accountNumbers = type === 'receivables' 
        ? ['411'] // Clients
        : ['401']; // Fournisseurs

      // Récupérer les comptes concernés
      const accounts = await this.accountRepository.find({
        where: {
          companyId,
          number: In(accountNumbers)
        }
      });

      if (accounts.length === 0) {
        return {
          asOfDate,
          type,
          items: [],
          totals: {
            total: 0,
            current: 0,
            days30_60: 0,
            days60_90: 0,
            over90: 0,
          },
        };
      }

      const accountIds = accounts.map(acc => acc.id);
      
      // Calculer la date limite pour chaque tranche
      const asOf = new Date(asOfDate);
      const currentLimit = new Date(asOf);
      currentLimit.setDate(currentLimit.getDate() - 30);
      
      const days30_60Limit = new Date(asOf);
      days30_60Limit.setDate(days30_60Limit.getDate() - 60);
      
      const days60_90Limit = new Date(asOf);
      days60_90Limit.setDate(days60_90Limit.getDate() - 90);

      // Récupérer toutes les lignes d'écritures pour ces comptes
      const lines = await this.journalLineRepository.find({
        where: {
          accountId: In(accountIds),
          entry: {
            companyId,
            status: 'posted'
          }
        },
        relations: ['entry', 'account']
      });

      // Grouper par tiers (client/fournisseur)
      const partyMap = new Map<string, any>();

      lines.forEach(line => {
        const partyName = line.label || 'Inconnu';
        const entryDate = new Date(line.entry.date);
        const daysDiff = Math.floor((asOf.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
        
        // Calculer le solde pour cette ligne
        const balance = this.computeSignedBalance(line.account.type, line.debit, line.credit);
        
        if (!partyMap.has(partyName)) {
          partyMap.set(partyName, {
            partyName,
            accountNumber: line.account.number,
            accountLabel: line.account.label,
            total: 0,
            current: 0,
            days30_60: 0,
            days60_90: 0,
            over90: 0,
          });
        }

        const party = partyMap.get(partyName);
        party.total += Math.abs(balance);

        // Ventiler par tranche d'ancienneté
        if (daysDiff <= 30) {
          party.current += Math.abs(balance);
        } else if (daysDiff <= 60) {
          party.days30_60 += Math.abs(balance);
        } else if (daysDiff <= 90) {
          party.days60_90 += Math.abs(balance);
        } else {
          party.over90 += Math.abs(balance);
        }
      });

      // Convertir en tableau et calculer les totaux
      const items = Array.from(partyMap.values()).filter(item => item.total > 0);
      
      const totals = items.reduce((acc, item) => ({
        total: acc.total + item.total,
        current: acc.current + item.current,
        days30_60: acc.days30_60 + item.days30_60,
        days60_90: acc.days60_90 + item.days60_90,
        over90: acc.over90 + item.over90,
      }), { total: 0, current: 0, days30_60: 0, days60_90: 0, over90: 0 });

      return {
        asOfDate,
        type,
        items: items.sort((a, b) => b.total - a.total), // Trier par montant décroissant
        totals,
      };
    } catch (error) {
      console.error('Error calculating aged balance:', error);
      throw new InternalServerErrorException('Erreur lors du calcul de la balance âgée');
    }
  }

  private computeSignedBalance(accountType: string, debit: number, credit: number): number {
    if (accountType === 'asset' || accountType === 'expense') return debit - credit;
    return credit - debit; // liability, equity, revenue
  }
}
