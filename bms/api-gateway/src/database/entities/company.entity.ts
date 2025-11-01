import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, nullable: true })
  name: string;

  @Column({ length: 50, nullable: true })
  legalForm: string;

  @Column({ length: 50, unique: true, nullable: true })
  nif: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 2, default: 'BJ' })
  country: string;

  @Column({ length: 3, default: 'XOF' })
  currency: string;

  @Column({ type: 'date', nullable: true })
  fiscalYearEnd: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
