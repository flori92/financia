import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { BankConnection } from './bank-connection.entity';

@Entity('bank_accounts')
export class BankAccount {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    connectionId: string;

    @ManyToOne(() => BankConnection)
    @JoinColumn({ name: 'connectionId' })
    connection: BankConnection;

    @Column()
    externalId: string;

    @Column()
    name: string;

    @Column()
    type: string;

    @Column()
    currency: string;

    @Column('decimal', { precision: 15, scale: 2 })
    balance: number;

    @Column({ nullable: true })
    iban: string;

    @Column({ nullable: true })
    bic: string;

    @Column()
    status: 'active' | 'closed';

    @Column({ nullable: true })
    lastSyncAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}