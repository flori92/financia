import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { JournalEntry } from './entities/journal-entry.entity';
import { Account } from './entities/account.entity';
import { Company } from '../companies/entities/company.entity';
import { TaxDeclaration } from '../tax/entities/tax-declaration.entity';
import * as moment from 'moment';

/**
 * Service pour les métriques avancées du dashboard expert-comptable
 */
@Injectable()
export class AccountingAnalyticsService {
    constructor(
        @InjectRepository(JournalEntry)
        private journalEntriesRepo: Repository<JournalEntry>,
        @InjectRepository(Account)
        private accountsRepo: Repository<Account>,
        @InjectRepository(Company)
        private companiesRepo: Repository<Company>,
        @InjectRepository(TaxDeclaration)
        private taxDeclarationsRepo: Repository<TaxDeclaration>,
    ) {}

    /**
     * Obtient les métriques avancées pour le dashboard expert-comptable
     */
    async getAdvancedMetrics(expertId: string) {
        const companies = await this.companiesRepo.find({
            where: { expertId },
            relations: ['subscriptions']
        });

        const companyIds = companies.map(c => c.id);
        
        const now = moment();
        const startOfYear = moment().startOf('year');
        const endOfYear = moment().endOf('year');

        // Récupérer les données pour toutes les sociétés
        const [entries, accounts, declarations] = await Promise.all([
            this.journalEntriesRepo.find({
                where: {
                    companyId: In(companyIds),
                    date: Between(startOfYear.toDate(), endOfYear.toDate())
                },
                relations: ['lines']
            }),
            this.accountsRepo.find({
                where: { companyId: In(companyIds) }
            }),
            this.taxDeclarationsRepo.find({
                where: {
                    companyId: In(companyIds),
                    dueDate: Between(startOfYear.toDate(), endOfYear.toDate())
                }
            })
        ]);

        // Métriques globales du cabinet
        const cabinetMetrics = {
            totalClients: companies.length,
            clientsActifs: companies.filter(c => c.subscriptions.some(s => s.isActive)).length,
            declarationsEnAttente: declarations.filter(d => d.status === 'pending').length,
            declarationsProches: declarations.filter(d => {
                const dueDate = moment(d.dueDate);
                return d.status === 'pending' && dueDate.diff(now, 'days') <= 7;
            }).length
        };

        // Métriques par client
        const clientsMetrics = companies.map(company => {
            const companyEntries = entries.filter(e => e.companyId === company.id);
            const companyAccounts = accounts.filter(a => a.companyId === company.id);
            const companyDeclarations = declarations.filter(d => d.companyId === company.id);

            return {
                id: company.id,
                name: company.name,
                status: this.calculateClientStatus(companyEntries, companyAccounts),
                lastActivity: this.getLastActivity(companyEntries),
                completionRate: this.calculateCompletionRate(companyEntries, companyAccounts),
                declarations: companyDeclarations.length,
                declarationsPending: companyDeclarations.filter(d => d.status === 'pending').length
            };
        });

        // Top clients par activité
        const topActiveClients = [...clientsMetrics]
            .sort((a, b) => b.completionRate - a.completionRate)
            .slice(0, 5);

        // Clients nécessitant attention
        const clientsNeedingAttention = clientsMetrics
            .filter(c => c.completionRate < 80 || c.declarationsPending > 0)
            .sort((a, b) => a.completionRate - b.completionRate);

        return {
            cabinet: cabinetMetrics,
            clientsMetrics: clientsMetrics,
            topActiveClients,
            clientsNeedingAttention,
            revenueByMonth: this.calculateMonthlyRevenue(companies, entries),
            upcomingDeadlines: this.getUpcomingDeadlines(declarations)
        };
    }

    private calculateClientStatus(entries: JournalEntry[], accounts: Account[]): 'green' | 'orange' | 'red' {
        const hasRecentEntries = entries.some(e => 
            moment(e.date).isAfter(moment().subtract(1, 'month'))
        );
        const hasMinimalAccounts = accounts.length >= 10;
        
        if (hasRecentEntries && hasMinimalAccounts) return 'green';
        if (hasMinimalAccounts || hasRecentEntries) return 'orange';
        return 'red';
    }

    private getLastActivity(entries: JournalEntry[]): string | null {
        if (entries.length === 0) return null;
        
        const lastEntry = entries.reduce((latest, current) => 
            moment(current.date).isAfter(moment(latest.date)) ? current : latest
        );
        
        return lastEntry.date.toISOString();
    }

    private calculateCompletionRate(entries: JournalEntry[], accounts: Account[]): number {
        const weights = {
            hasEntries: 0.4,
            hasAccounts: 0.3,
            recentActivity: 0.3
        };

        let score = 0;

        // Vérifier la présence d'écritures
        if (entries.length > 0) score += weights.hasEntries;

        // Vérifier la présence de comptes
        if (accounts.length >= 10) score += weights.hasAccounts;

        // Vérifier l'activité récente
        if (entries.some(e => moment(e.date).isAfter(moment().subtract(1, 'month')))) {
            score += weights.recentActivity;
        }

        return Math.round(score * 100);
    }

    private calculateMonthlyRevenue(
        companies: Company[],
        entries: JournalEntry[]
    ): Array<{ month: string; revenue: number }> {
        const monthlyRevenue = new Map<string, number>();

        for (let i = 0; i < 12; i++) {
            const month = moment().subtract(i, 'months').format('YYYY-MM');
            monthlyRevenue.set(month, 0);
        }

        companies.forEach(company => {
            const companyEntries = entries.filter(e => e.companyId === company.id);
            
            companyEntries.forEach(entry => {
                const month = moment(entry.date).format('YYYY-MM');
                if (monthlyRevenue.has(month)) {
                    monthlyRevenue.set(
                        month,
                        monthlyRevenue.get(month)! + this.calculateEntryRevenue(entry)
                    );
                }
            });
        });

        return Array.from(monthlyRevenue.entries())
            .map(([month, revenue]) => ({ month, revenue }))
            .reverse();
    }

    private calculateEntryRevenue(entry: JournalEntry): number {
        // Logique pour calculer le revenu à partir d'une écriture
        return entry.lines
            .filter(line => line.account.startsWith('7')) // Comptes de produits
            .reduce((sum, line) => sum + (line.credit - line.debit), 0);
    }

    private getUpcomingDeadlines(declarations: TaxDeclaration[]): Array<{
        dueDate: string;
        type: string;
        company: string;
        status: string;
    }> {
        return declarations
            .filter(d => moment(d.dueDate).isAfter(moment()))
            .sort((a, b) => moment(a.dueDate).diff(moment(b.dueDate)))
            .slice(0, 10)
            .map(d => ({
                dueDate: d.dueDate.toISOString(),
                type: d.type,
                company: d.companyName,
                status: d.status
            }));
    }
}