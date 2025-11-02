import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// import { Queue } from 'bull'; // Désactivé pour éviter erreurs Redis
// import { InjectQueue } from '@nestjs/bull';
import { BankTransaction } from '../entities/bank-transaction.entity';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';
import { ReconciliationMatch } from './entities/reconciliation-match.entity';

/**
 * Service de rapprochement bancaire (DÉSACTIVÉ)
 * 
 * TODO: Ce service nécessite une refonte complète pour être compatible avec JournalEntry (OHADA)
 * L'ancienne structure AccountingEntry avait des propriétés directes (amount, date, bankAccountId)
 * JournalEntry utilise une structure différente avec des lignes (debit/credit)
 * 
 * Le module BankingModule est désactivé dans app.module.ts
 * Voir session précédente pour l'ancienne implémentation fonctionnelle
 */
@Injectable()
export class ReconciliationService {
    private readonly logger = new Logger(ReconciliationService.name);

    constructor(
        @InjectRepository(BankTransaction)
        private bankTransactionRepo: Repository<BankTransaction>,
        @InjectRepository(JournalEntry)
        private accountingEntryRepo: Repository<JournalEntry>,
        @InjectRepository(ReconciliationMatch)
        private reconciliationMatchRepo: Repository<ReconciliationMatch>,
        // @InjectQueue('reconciliation') // Désactivé pour éviter erreurs Redis
        // private reconciliationQueue: Queue
    ) {}

    /**
     * TODO: Réimplémenter avec compatibilité JournalEntry
     * Nécessite adaptation pour structure OHADA (lignes avec debit/credit)
     */
    async reconcileTransactions(companyId: string, accountId: string, dateRange?: { start: Date; end: Date }) {
        this.logger.warn('ReconciliationService.reconcileTransactions() - NOT IMPLEMENTED (module désactivé)');
        throw new Error('Module Banking désactivé - Nécessite refonte pour OHADA/JournalEntry');
    }

    /**
     * TODO: Réimplémenter validation des correspondances
     */
    async validateMatch(matchId: string, approved: boolean) {
        this.logger.warn('ReconciliationService.validateMatch() - NOT IMPLEMENTED (module désactivé)');
        throw new Error('Module Banking désactivé - Nécessite refonte pour OHADA/JournalEntry');
    }

    /**
     * TODO: Réimplémenter récupération transactions non rapprochées
     */
    async getUnmatchedTransactions(companyId: string, accountId: string) {
        this.logger.warn('ReconciliationService.getUnmatchedTransactions() - NOT IMPLEMENTED (module désactivé)');
        return [];
    }

    /**
     * TODO: Réimplémenter suggestions de correspondances
     */
    async getMatchSuggestions(transactionId: string) {
        this.logger.warn('ReconciliationService.getMatchSuggestions() - NOT IMPLEMENTED (module désactivé)');
        return [];
    }
}