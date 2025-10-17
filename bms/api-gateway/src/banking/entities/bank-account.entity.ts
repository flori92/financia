import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('bank_accounts')
export class BankAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 100, unique: true })
  accountNumber: string;

  @Column({ length: 34, nullable: true })
  iban: string;

  @Column({ length: 11, nullable: true })
  bic: string;

  @Column({ length: 255, nullable: true })
  bankName: string;

  @Column({ length: 50, default: 'XOF' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  openingBalance: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
