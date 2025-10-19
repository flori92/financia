import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Budget } from './budget.entity';

@Entity('budget_lines')
export class BudgetLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Budget, budget => budget.lines)
  @JoinColumn({ name: 'budget_id' })
  budget: Budget;

  @Column()
  accountNumber: string;

  @Column()
  accountName: string;

  @Column()
  month: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  plannedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  actualAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  variance: number;

  @Column({ nullable: true })
  analyticAxis: string;
}
