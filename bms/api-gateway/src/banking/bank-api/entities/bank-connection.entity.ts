import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bank_connections')
export class BankConnection {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @Column()
    bankCode: string;

    @Column()
    status: 'pending_auth' | 'active' | 'error' | 'revoked';

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column({ nullable: true })
    accessToken: string;

    @Column({ nullable: true })
    refreshToken: string;

    @Column({ nullable: true })
    tokenExpiresAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}