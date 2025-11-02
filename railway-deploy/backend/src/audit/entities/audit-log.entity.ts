import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  entityType: string; // 'invoice' | 'payment' | ...

  @Column({ type: 'text', nullable: true })
  entityId: string;

  @Column({ length: 50 })
  action: string; // 'validate' | 'certify' | ...

  @Column({ type: 'text', nullable: true })
  userId: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;
}
