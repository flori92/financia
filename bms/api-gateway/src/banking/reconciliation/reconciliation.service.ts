import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import Fuse from 'fuse.js';
import { BankTransaction } from '../entities/bank-transaction.entity';
import { AccountingEntry } from '../../accounting/entities/accounting-entry.entity';
import { ReconciliationMatch } from '../entities/reconciliation-match.entity';

@Injectable()
export class ReconciliationService {
    private readonly logger = new Logger(ReconciliationService.name);
    private readonly fuseOptions = {
        includeScore: true,
        keys: ['description', 'amount'],
        threshold: 0.4
    };

    constructor(
        @InjectRepository(BankTransaction)
        private bankTransactionRepo: Repository<BankTransaction>,
        @InjectRepository(AccountingEntry)
        private accountingEntryRepo: Repository<AccountingEntry>,
        @InjectRepository(ReconciliationMatch)
        private reconciliationMatchRepo: Repository<ReconciliationMatch>,
        @InjectQueue('reconciliation')
        private reconciliationQueue: Queue
    ) {}

    async reconcileTransactions(companyId: string, accountId: string, dateRange?: { start: Date; end: Date }) {
        this.logger.log(`Starting reconciliation for company ${companyId}, account ${accountId}`);

        // Récupérer les transactions non rapprochées
        const unreconciled = await this.bankTransactionRepo.find({
            where: {
                companyId,
                accountId,
                status: 'pending'
            },
            order: { date: 'ASC' }
        });

        // Récupérer les écritures comptables non rapprochées
        const accountingEntries = await this.accountingEntryRepo.find({
            where: {
                companyId,
                bankAccountId: accountId,
                status: 'pending'
            },
            order: { date: 'ASC' }
        });

        // Initialiser Fuse pour la recherche floue
        const fuse = new Fuse(accountingEntries, this.fuseOptions);

        const matches = [];
        const potentialMatches = [];

        // Analyser chaque transaction
        for (const transaction of unreconciled) {
            // Recherche exacte par montant et date proche
            const exactMatches = accountingEntries.filter(entry => 
                Math.abs(entry.amount - transaction.amount) < 0.01 &&
                Math.abs(entry.date.getTime() - transaction.date.getTime()) <= 3 * 24 * 60 * 60 * 1000 // 3 jours
            );

            if (exactMatches.length === 1) {
                matches.push({
                    transaction,
                    entry: exactMatches[0],
                    confidence: 1
                });
                continue;
            }

            // Recherche floue si pas de correspondance exacte
            const searchResult = fuse.search(transaction.description);
            const bestMatches = searchResult
                .filter(result => Math.abs(result.item.amount - transaction.amount) < 1)
                .slice(0, 3);

            if (bestMatches.length > 0) {
                potentialMatches.push({
                    transaction,
                    matches: bestMatches.map(match => ({
                        entry: match.item,
                        confidence: 1 - match.score
                    }))
                });
            }
        }

        // Traiter les correspondances sûres
        for (const match of matches) {
            await this.createReconciliationMatch(
                match.transaction,
                match.entry,
                match.confidence,
                'automatic'
            );
        }

        // Envoyer les correspondances potentielles pour validation
        if (potentialMatches.length > 0) {
            await this.reconciliationQueue.add('validate-matches', {
                companyId,
                accountId,
                matches: potentialMatches
            });
        }

        return {
            total: unreconciled.length,
            matched: matches.length,
            pending: potentialMatches.length,
            unmatched: unreconciled.length - matches.length - potentialMatches.length
        };
    }

    private async createReconciliationMatch(
        transaction: BankTransaction,
        entry: AccountingEntry,
        confidence: number,
        type: 'automatic' | 'manual' | 'ai'
    ) {
        const match = this.reconciliationMatchRepo.create({
            companyId: transaction.companyId,
            bankAccountId: transaction.accountId,
            bankTransactionId: transaction.id,
            accountingEntryId: entry.id,
            confidence,
            matchType: type,
            matchDate: new Date()
        });

        await this.reconciliationMatchRepo.save(match);

        // Mettre à jour les statuts
        await this.bankTransactionRepo.update(transaction.id, { 
            status: 'reconciled',
            reconciledAt: new Date(),
        });
        await this.accountingEntryRepo.update(entry.id, { 
            status: 'reconciled',
            reconciledAt: new Date()
        });
    }

    async validateMatch(matchId: string, approved: boolean) {
        const match = await this.reconciliationMatchRepo.findOne({
            where: { id: matchId },
            relations: ['bankTransaction', 'accountingEntry']
        });

        if (!match) {
            throw new Error('Match not found');
        }

        if (approved) {
            await this.bankTransactionRepo.update(match.bankTransactionId, { 
                status: 'reconciled',
                reconciledAt: new Date(),
            });
            await this.accountingEntryRepo.update(match.accountingEntryId, { 
                status: 'reconciled',
                reconciledAt: new Date()
            });
            match.status = 'validated';
        } else {
            match.status = 'rejected';
        }

        await this.reconciliationMatchRepo.save(match);
    }

    async getUnmatchedTransactions(companyId: string, accountId: string) {
        return this.bankTransactionRepo.find({
            where: {
                companyId,
                accountId,
                status: 'pending'
            },
            order: { date: 'DESC' }
        });
    }

    async getMatchSuggestions(transactionId: string) {
        const transaction = await this.bankTransactionRepo.findOne({
            where: { id: transactionId }
        });

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        const entries = await this.accountingEntryRepo.find({
            where: {
                companyId: transaction.companyId,
                bankAccountId: transaction.accountId,
                status: 'pending'
            }
        });

        const fuse = new Fuse(entries, this.fuseOptions);
        const suggestions = fuse.search(transaction.description)
            .filter(result => Math.abs(result.item.amount - transaction.amount) < 1)
            .slice(0, 5)
            .map(match => ({
                entry: match.item,
                confidence: 1 - match.score
            }));

        return suggestions;
    }
}