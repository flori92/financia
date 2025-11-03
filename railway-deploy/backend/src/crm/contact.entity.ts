import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Company } from '../companies/company.entity';

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: string; // client, prospect, supplier, partner

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ default: 'BJ' })
  country: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  vatNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: 'active' })
  status: string; // active, inactive, archived

  @Column({ nullable: true })
  tags: string; // JSON array of tags

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  scoring: number; // Lead scoring

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Company, company => company.contacts)
  company: Company;

  @Column()
  companyId: string;
}
