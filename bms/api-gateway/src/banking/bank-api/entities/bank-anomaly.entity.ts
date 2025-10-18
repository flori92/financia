import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BankTransaction } from './bank-transaction.entity';
import { BankAccount } from './bank-account.entity';

@Entity('bank_anomalies')
export class BankAnomaly {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    transactionId: string;

    @ManyToOne(() => BankTransaction)
    @JoinColumn({ name: 'transactionId' })
    transaction: BankTransaction;

    @Column()
    accountId: string;

    @ManyToOne(() => BankAccount)
    @JoinColumn({ name: 'accountId' })
    account: BankAccount;

    @Column()
    type: 'unusual_transaction' | 'fraud_suspected' | 'pattern_anomaly';

    @Column('decimal', { precision: 5, scale: 4 })
    score: number;

    @Column()
    status: 'pending' | 'reviewed' | 'resolved' | 'false_positive';

    @Column({ type: 'json' })
    metadata: Record<string, any>;

    @Column({ nullable: true })
    reviewedBy: string;

    @Column({ nullable: true })
    reviewedAt: Date;

    @Column({ type: 'text', nullable: true })
    resolution: string;

    @CreateDateColumn()
    createdAt: Date;
}