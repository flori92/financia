import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BankAccount } from './bank-account.entity';

@Entity('bank_transactions')
export class BankTransaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    accountId: string;

    @Column({ nullable: true })
    connectionId: string;

    @ManyToOne(() => BankAccount)
    @JoinColumn({ name: 'accountId' })
    account: BankAccount;

    @Column()
    externalId: string;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column('decimal', { precision: 15, scale: 2 })
    amount: number;

    @Column()
    currency: string;

    @Column()
    description: string;

    @Column()
    type: 'credit' | 'debit';

    @Column({ nullable: true })
    category: string;

    @Column()
    status: 'pending' | 'posted' | 'cancelled';

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;
}