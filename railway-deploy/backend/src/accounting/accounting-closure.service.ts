import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { PeriodClosure } from './entities/period-closure.entity';
import { JournalEntry } from './entities/journal-entry.entity';
import { JournalEntryLine } from './entities/journal-entry-line.entity';
import { Account } from './entities/account.entity';

/**
 * Service de clôture de période comptable
 */
@Injectable()
export class AccountingClosureService {
  constructor(
    @InjectRepository(PeriodClosure)
    private closuresRepo: Repository<PeriodClosure>,
    @InjectRepository(JournalEntry)
    private journalEntriesRepo: Repository<JournalEntry>,
    @InjectRepository(JournalEntryLine)
    private journalLinesRepo: Repository<JournalEntryLine>,
    @InjectRepository(Account)
    private accountsRepo: Repository<Account>,
  ) {}

  /**
   * Récupérer toutes les clôtures d'une société
   */
  async findAll(companyId: string): Promise<PeriodClosure[]> {
    return this.closuresRepo.find({
      where: { companyId },
      order: { endDate: 'DESC' },
    });
  }

  /**
   * Calculer le résultat de la période (pour preview)
   */
  async previewClosure(
    companyId: string,
    startDate: string,
    endDate: string,
  ): Promise<{
    totalRevenues: number;
    totalExpenses: number;
    result: number;
    canClose: boolean;
    reason?: string;
  }> {
    // Vérifier qu'il n'existe pas déjà une clôture active pour cette période
    const existing = await this.closuresRepo.findOne({
      where: {
        companyId,
        status: 'closed',
      },
    });

    if (existing && new Date(existing.endDate) >= new Date(endDate)) {
      return {
        totalRevenues: 0,
        totalExpenses: 0,
        result: 0,
        canClose: false,
        reason: `Une clôture existe déjà jusqu'au ${new Date(existing.endDate).toLocaleDateString('fr-FR')}`,
      };
    }

    // Récupérer les comptes
    const accounts = await this.accountsRepo.find({ where: { companyId } });
    const revenueAccounts = accounts.filter((a) => a.accountNumber.startsWith('7'));
    const expenseAccounts = accounts.filter((a) => a.accountNumber.startsWith('6'));

    // Récupérer les écritures de la période
    const entries = await this.journalEntriesRepo
      .createQueryBuilder('entry')
      .leftJoinAndSelect('entry.lines', 'line')
      .leftJoinAndSelect('line.account', 'account')
      .where('entry.companyId = :companyId', { companyId })
      .andWhere('entry.entryDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('entry.status = :status', { status: 'posted' })
      .getMany();

    let totalRevenues = 0;
    let totalExpenses = 0;

    for (const entry of entries) {
      for (const line of entry.lines) {
        if (!line.account) continue;
        
        // Produits (crédit en classe 7)
        if (revenueAccounts.some((a) => a.id === line.account.id)) {
          totalRevenues += parseFloat(String(line.credit || 0));
        }

        // Charges (débit en classe 6)
        if (expenseAccounts.some((a) => a.id === line.account.id)) {
          totalExpenses += parseFloat(String(line.debit || 0));
        }
      }
    }

    const result = totalRevenues - totalExpenses;

    return {
      totalRevenues,
      totalExpenses,
      result,
      canClose: true,
    };
  }

  /**
   * Clôturer une période
   */
  async closePeriod(
    companyId: string,
    startDate: string,
    endDate: string,
    userId: string,
  ): Promise<PeriodClosure> {
    // Preview d'abord
    const preview = await this.previewClosure(companyId, startDate, endDate);
    if (!preview.canClose) {
      throw new BadRequestException(preview.reason);
    }

    // Créer la clôture
    const closure = this.closuresRepo.create({
      companyId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'draft',
      resultAmount: preview.result,
    });

    const savedClosure = await this.closuresRepo.save(closure);

    // Générer l'OD de clôture (transfert du résultat vers compte 120)
    const accounts = await this.accountsRepo.find({ where: { companyId } });
    const resultAccount = accounts.find((a) => a.accountNumber === '120'); // Résultat de l'exercice
    const revenueAccounts = accounts.filter((a) => a.accountNumber.startsWith('7'));
    const expenseAccounts = accounts.filter((a) => a.accountNumber.startsWith('6'));

    if (!resultAccount) {
      throw new BadRequestException('Compte 120 (Résultat) introuvable. Initialisez le plan comptable.');
    }

    // Créer l'écriture de clôture
    const closingEntry = this.journalEntriesRepo.create({
      companyId,
      entryDate: new Date(endDate),
      journalType: 'general',
      reference: `CLOTURE-${endDate}`,
      description: `Clôture de la période ${startDate} au ${endDate}`,
      status: 'posted',
      createdBy: userId,
    });

    const savedEntry = await this.journalEntriesRepo.save(closingEntry);

    // Lignes: solder les comptes de charges et produits vers résultat
    const lines: Partial<JournalEntryLine>[] = [];
    let lineNumber = 1;

    // Débiter les comptes de produits (classe 7)
    for (const acc of revenueAccounts) {
      lines.push({
        journalEntry: savedEntry,
        account: acc,
        lineNumber: lineNumber++,
        label: `Clôture ${acc.accountName}`,
        debit: preview.totalRevenues / revenueAccounts.length, // Simplifié
        credit: 0,
        currency: 'XOF',
      });
    }

    // Créditer les comptes de charges (classe 6)
    for (const acc of expenseAccounts) {
      lines.push({
        journalEntry: savedEntry,
        account: acc,
        lineNumber: lineNumber++,
        label: `Clôture ${acc.accountName}`,
        debit: 0,
        credit: preview.totalExpenses / expenseAccounts.length, // Simplifié
        currency: 'XOF',
      });
    }

    // Ligne de résultat
    if (preview.result >= 0) {
      // Bénéfice: Créditer le compte résultat
      lines.push({
        journalEntry: savedEntry,
        account: resultAccount,
        lineNumber: lineNumber++,
        label: 'Résultat bénéficiaire de l\'exercice',
        debit: 0,
        credit: preview.result,
        currency: 'XOF',
      });
    } else {
      // Perte: Débiter le compte résultat
      lines.push({
        journalEntry: savedEntry,
        account: resultAccount,
        lineNumber: lineNumber++,
        label: 'Résultat déficitaire de l\'exercice',
        debit: Math.abs(preview.result),
        credit: 0,
        currency: 'XOF',
      });
    }

    await this.journalLinesRepo.save(lines as JournalEntryLine[]);

    // Finaliser la clôture
    closure.status = 'closed';
    closure.closingJournalEntryId = savedEntry.id;
    closure.closedBy = userId;
    closure.closedAt = new Date();

    return this.closuresRepo.save(closure);
  }

  /**
   * Vérifier si une date est dans une période clôturée
   */
  async isDateLocked(companyId: string, date: Date): Promise<boolean> {
    const closure = await this.closuresRepo.findOne({
      where: {
        companyId,
        status: 'closed',
      },
      order: { endDate: 'DESC' },
    });

    if (!closure) return false;

    return date <= new Date(closure.endDate);
  }

  /**
   * Récupérer la dernière clôture
   */
  async getLastClosure(companyId: string): Promise<PeriodClosure | null> {
    return this.closuresRepo.findOne({
      where: { companyId, status: 'closed' },
      order: { endDate: 'DESC' },
    });
  }
}
