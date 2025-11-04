import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('quotes')
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  quoteNumber: string;

  @Column()
  customerId: string;

  @Column()
  customerName: string;

  @Column({ type: 'date' })
  quoteDate: Date;

  @Column({ type: 'date' })
  validUntil: Date;

  @Column({ default: 'draft' })
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'converted';

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  totalAmount: number;

  @Column({ nullable: true })
  convertedInvoiceId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
