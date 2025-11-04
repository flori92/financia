import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  name: string;

  @Column()
  type: 'email' | 'sms' | 'whatsapp';

  @Column({ default: 'draft' })
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused';

  @Column({ type: 'date', nullable: true })
  scheduledDate: Date;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'simple-array', nullable: true })
  targetContactIds: string[];

  @Column({ default: 0 })
  sentCount: number;

  @Column({ default: 0 })
  openedCount: number;

  @Column({ default: 0 })
  clickedCount: number;

  @CreateDateColumn()
  createdAt: Date;
}
