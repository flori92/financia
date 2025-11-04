import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('uploads')
export class Upload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'original_name' })
  originalName: string;

  @Column({ name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ name: 'file_path' })
  filePath: string;

  @Column({ name: 'public_url', nullable: true })
  publicUrl: string;

  @Column({ name: 'entity_type', nullable: true })
  entityType: string; // 'invoice', 'nif_request', 'payment', etc.

  @Column({ name: 'entity_id', nullable: true })
  entityId: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @Column({ name: 'company_id', nullable: true })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
