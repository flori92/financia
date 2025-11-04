import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { BankConnectionStatus } from '../interfaces/bank.interface';

@Entity('bank_connections')
export class BankConnection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    bankId: string;

    @Column()
    userId: string;

    @Column({
        type: 'enum',
        enum: BankConnectionStatus,
        default: BankConnectionStatus.INITIALIZING
    })
    status: BankConnectionStatus;

    @Column({ nullable: true })
    authUrl: string;

    @Column({ nullable: true })
    accessToken: string;

    @Column({ nullable: true })
    refreshToken: string;

    @Column({ type: 'json', nullable: true })
    bankInfo: any;

    @Column({ nullable: true })
    lastSync: Date;

    @Column({ nullable: true })
    error: string;

    @Column({ type: 'json', nullable: true })
    metadata: any;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}