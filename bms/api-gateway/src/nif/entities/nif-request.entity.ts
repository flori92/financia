import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';

@Entity('nif_requests')
export class NifRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ default: 'pending' })
  status: 'pending' | 'under_review' | 'approved' | 'rejected';

  @Column({ name: 'nif_number', unique: true, nullable: true })
  nifNumber: string;

  // Documents requis
  @Column({ type: 'jsonb' })
  documents: {
    identityCard?: string;          // URL scan CNI
    proofOfAddress?: string;        // Justificatif domicile
    businessLicense?: string;       // Licence commerciale
    statutes?: string;              // Statuts (si société)
    taxCertificate?: string;        // Certificat fiscal
  };

  // Informations entreprise
  @Column({ name: 'business_name' })
  businessName: string;

  @Column({ name: 'business_type' })
  businessType: string; // Commerce, Artisanat, Services, etc.

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  email: string;

  // Validation DGI
  @Column({ name: 'dgi_reference', nullable: true })
  dgiReference: string;

  @Column({ name: 'dgi_status', nullable: true })
  dgiStatus: string;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'submitted_at', nullable: true })
  submittedAt: Date;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy: string; // ID admin fiscal

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
