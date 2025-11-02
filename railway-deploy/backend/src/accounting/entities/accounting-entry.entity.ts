import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('accounting_entries')
export class AccountingEntry {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    companyId: string;

    @Column({ type: 'uuid' })
    bankAccountId: string;

    @Column({ type: 'decimal', precision: 15, scale: 2 })
    amount: number;

    @Column({ type: 'timestamp' })
    date: Date;

    @Column({ type: 'varchar', length: 255 })
    description: string;

    @Column({ type: 'varchar', length: 50 })
    accountNumber: string;

    @Column({ 
        type: 'enum',
        enum: ['pending', 'reconciled', 'ignored'],
        default: 'pending'
    })
    status: 'pending' | 'reconciled' | 'ignored';

    @Column({ type: 'timestamp', nullable: true })
    reconciledAt: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    reference: string;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}