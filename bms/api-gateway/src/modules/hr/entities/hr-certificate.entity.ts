import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';

export type HrCertificateType =
  | 'attestation_emploi'
  | 'attestation_salaire'
  | 'certificat_travail'
  | 'autre';
export type HrCertificateStatus = 'pending' | 'generated' | 'delivered';

@Entity('hr_certificates')
export class HrCertificate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string;

  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ type: 'varchar', length: 40 })
  type: HrCertificateType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  purpose?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: HrCertificateStatus;

  @Column({ type: 'timestamp', nullable: true })
  requestDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  generatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pdfFileName?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pdfMimeType?: string;

  @Column({ type: 'int', nullable: true })
  pdfFileSize?: number;

  @Column({ type: 'bytea', nullable: true })
  pdfFile?: Buffer;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
