import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  employee: string;

  @Column()
  type: 'transport' | 'repas' | 'hebergement' | 'mission' | 'divers';

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  date: Date;

  @Column()
  status: 'draft' | 'submitted' | 'approved' | 'rejected';

  @Column({ nullable: true })
  receiptUrl: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  project: string;

  @Column({ nullable: true })
  submittedAt: Date;

  @Column({ nullable: true })
  approvedAt: Date;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ nullable: true })
  comments: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
