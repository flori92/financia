import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ length: 20 })
  accountNumber: string;

  @Column({ length: 255, nullable: true })
  label: string;

  @Column({ length: 50, nullable: true })
  accountType: string;

  @Column({ type: 'int', nullable: true })
  syscohadaClass: number;

  @Column({ type: 'uuid', nullable: true })
  parentAccountId: string;

  @Column({ default: false })
  isAuxiliary: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
