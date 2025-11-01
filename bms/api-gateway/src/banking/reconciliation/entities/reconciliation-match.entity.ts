import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BankTransaction } from '../../entities/bank-transaction.entity';
import { JournalEntry } from '../../accounting/entities/journal-entry.entity';

@Entity('reconciliation_matches')
export class ReconciliationMatch {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    companyId: string;

    @Column({ type: 'uuid' })
    bankAccountId: string;

    @Column({ type: 'uuid' })
    bankTransactionId: string;

    @Column({ type: 'uuid' })
    accountingEntryId: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    confidence: number;

    @Column({ 
        type: 'enum',
        enum: ['automatic', 'manual', 'ai'],
        default: 'automatic'
    })
    matchType: 'automatic' | 'manual' | 'ai';

    @Column({ 
        type: 'enum',
        enum: ['pending', 'validated', 'rejected'],
        default: 'pending'
    })
    status: 'pending' | 'validated' | 'rejected';

    @Column({ type: 'timestamp' })
    matchDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => BankTransaction)
    @JoinColumn({ name: 'bankTransactionId' })
    bankTransaction: BankTransaction;

    @ManyToOne(() => JournalEntry)
    @JoinColumn({ name: 'accountingEntryId' })
    accountingEntry: JournalEntry;
}