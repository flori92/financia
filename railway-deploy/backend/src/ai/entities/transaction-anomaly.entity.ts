import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BankTransaction } from '../../banking/entities/bank-transaction.entity';

@Entity('transaction_anomalies')
export class TransactionAnomaly {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    companyId: string;

    @Column({ type: 'uuid' })
    accountId: string;

    @Column({ type: 'uuid' })
    transactionId: string;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    score: number;

    @Column({ 
        type: 'enum',
        enum: ['critical', 'suspicious', 'unusual'],
        default: 'suspicious'
    })
    type: 'critical' | 'suspicious' | 'unusual';

    @Column({ 
        type: 'enum',
        enum: ['pending', 'reviewed', 'false_positive'],
        default: 'pending'
    })
    status: 'pending' | 'reviewed' | 'false_positive';

    @Column({ type: 'timestamp' })
    detectedAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    reviewedAt: Date;

    @Column({ type: 'text', nullable: true })
    reviewNotes: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => BankTransaction)
    @JoinColumn({ name: 'transactionId' })
    transaction: BankTransaction;
}