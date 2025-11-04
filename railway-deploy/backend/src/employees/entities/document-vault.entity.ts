import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './employee.entity';
import { User } from '../../auth/entities/user.entity';

export enum DocumentType {
  PAYSHEET = 'paysheet',
  CONTRACT = 'contract',
  ID_CARD = 'id_card',
  PASSPORT = 'passport',
  CV = 'cv',
  DIPLOMA = 'diploma',
  CERTIFICATE = 'certificate',
  MEDICAL_CERTIFICATE = 'medical_certificate',
  RESIDENCE_PROOF = 'residence_proof',
  TAX_DOCUMENT = 'tax_document',
  BANK_DOCUMENT = 'bank_document',
  FAMILY_DOCUMENT = 'family_document',
  TRAINING_DOCUMENT = 'training_document',
  PERFORMANCE_REVIEW = 'performance_review',
  WARNING_LETTER = 'warning_letter',
  RESIGNATION = 'resignation',
  TERMINATION = 'termination',
  OTHER = 'other',
}

export enum DocumentStatus {
  DRAFT = 'draft',
  PENDING_VERIFICATION = 'pending_verification',
  VERIFIED = 'verified',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

export enum AccessLevel {
  PUBLIC = 'public',
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  HR = 'hr',
  ADMIN = 'admin',
  CONFIDENTIAL = 'confidential',
}

@Entity('hr_document_vault')
export class DocumentVault {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Informations de base
  @Column({ name: 'document_reference', unique: true, length: 50 })
  documentReference: string;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  documentType: DocumentType;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.DRAFT,
  })
  status: DocumentStatus;

  @Column({
    type: 'enum',
    enum: AccessLevel,
    default: AccessLevel.HR,
  })
  accessLevel: AccessLevel;

  // Métadonnées document
  @Column({ name: 'original_filename', length: 255 })
  originalFilename: string;

  @Column({ name: 'stored_filename', length: 255 })
  storedFilename: string;

  @Column({ name: 'file_path', length: 500 })
  filePath: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({ name: 'file_hash', length: 64, nullable: true })
  fileHash: string;

  @Column({ name: 'file_extension', length: 10 })
  fileExtension: string;

  // Informations sur le contenu
  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'keywords', type: 'text', nullable: true })
  keywords: string;

  @Column({ name: 'document_number', nullable: true, length: 50 })
  documentNumber: string;

  @Column({ name: 'issue_date', type: 'date', nullable: true })
  issueDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'effective_date', type: 'date', nullable: true })
  effectiveDate: Date;

  // Classification et tags
  @Column({ name: 'category', nullable: true, length: 50 })
  category: string;

  @Column({ name: 'subcategory', nullable: true, length: 50 })
  subcategory: string;

  @Column({ name: 'tags', type: 'jsonb', nullable: true })
  tags: string[] | null;

  @Column({ name: 'is_confidential', default: false })
  isConfidential: boolean;

  @Column({ name: 'is_legal_document', default: false })
  isLegalDocument: boolean;

  @Column({ name: 'requires_signature', default: false })
  requiresSignature: boolean;

  @Column({ name: 'signature_required_by', nullable: true })
  signatureRequiredBy: string;

  @Column({ name: 'is_signed', default: false })
  isSigned: boolean;

  @Column({ name: 'signed_by', nullable: true })
  signedBy: string;

  @Column({ name: 'signed_at', nullable: true })
  signedAt: Date;

  // Contrôle d'accès
  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'employee_can_view', default: true })
  employeeCanView: boolean;

  @Column({ name: 'manager_can_view', default: false })
  managerCanView: boolean;

  @Column({ name: 'requires_approval', default: false })
  requiresApproval: boolean;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approval_comments', type: 'text', nullable: true })
  approvalComments: string;

  // Notifications et rappels
  @Column({ name: 'notify_employee', default: false })
  notifyEmployee: boolean;

  @Column({ name: 'notify_manager', default: false })
  notifyManager: boolean;

  @Column({ name: 'notification_sent', default: false })
  notificationSent: boolean;

  @Column({ name: 'notification_sent_at', nullable: true })
  notificationSentAt: Date;

  @Column({ name: 'expiry_notification_sent', default: false })
  expiryNotificationSent: boolean;

  @Column({ name: 'expiry_notification_sent_at', nullable: true })
  expiryNotificationSentAt: Date;

  // Versionnement
  @Column({ name: 'version', type: 'int', default: 1 })
  version: number;

  @Column({ name: 'parent_document_id', nullable: true })
  parentDocumentId: string;

  @Column({ name: 'is_current_version', default: true })
  isCurrentVersion: boolean;

  // Audit et tracking
  @Column({ name: 'upload_source', nullable: true, length: 50 })
  uploadSource: string;

  @Column({ name: 'ip_address', nullable: true, length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @Column({ name: 'last_downloaded_at', nullable: true })
  lastDownloadedAt: Date;

  @Column({ name: 'last_downloaded_by', nullable: true })
  lastDownloadedBy: string;

  // Relations
  @Column()
  employeeId: string;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: Employee;

  @Column({ nullable: true })
  uploadedById: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  @Column({ nullable: true })
  updatedBy: string;

  // Métadonnées
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Champs calculés
  get isExpired(): boolean {
    if (!this.expiryDate) return false;
    return new Date() > this.expiryDate;
  }

  get isExpiringSoon(): boolean {
    if (!this.expiryDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.expiryDate <= thirtyDaysFromNow && !this.isExpired;
  }

  get isDraft(): boolean {
    return this.status === DocumentStatus.DRAFT;
  }

  get isPendingVerification(): boolean {
    return this.status === DocumentStatus.PENDING_VERIFICATION;
  }

  get isVerified(): boolean {
    return this.status === DocumentStatus.VERIFIED;
  }

  get isArchived(): boolean {
    return this.status === DocumentStatus.ARCHIVED;
  }

  get canBeDownloaded(): boolean {
    return [DocumentStatus.VERIFIED, DocumentStatus.DRAFT].includes(this.status);
  }

  get canBeEdited(): boolean {
    return [DocumentStatus.DRAFT, DocumentStatus.PENDING_VERIFICATION].includes(this.status);
  }

  get canBeDeleted(): boolean {
    return [DocumentStatus.DRAFT, DocumentStatus.PENDING_VERIFICATION, DocumentStatus.ARCHIVED].includes(this.status);
  }

  get requiresVerification(): boolean {
    return this.isLegalDocument || this.requiresSignature || this.isConfidential;
  }

  get statusLabel(): string {
    const labels = {
      [DocumentStatus.DRAFT]: 'Brouillon',
      [DocumentStatus.PENDING_VERIFICATION]: 'En attente de vérification',
      [DocumentStatus.VERIFIED]: 'Vérifié',
      [DocumentStatus.EXPIRED]: 'Expiré',
      [DocumentStatus.ARCHIVED]: 'Archivé',
      [DocumentStatus.DELETED]: 'Supprimé',
    };
    return labels[this.status];
  }

  get typeLabel(): string {
    const labels = {
      [DocumentType.PAYSHEET]: 'Bulletin de paie',
      [DocumentType.CONTRACT]: 'Contrat de travail',
      [DocumentType.ID_CARD]: 'Carte d\'identité',
      [DocumentType.PASSPORT]: 'Passeport',
      [DocumentType.CV]: 'CV',
      [DocumentType.DIPLOMA]: 'Diplôme',
      [DocumentType.CERTIFICATE]: 'Certificat',
      [DocumentType.MEDICAL_CERTIFICATE]: 'Certificat médical',
      [DocumentType.RESIDENCE_PROOF]: 'Justificatif de domicile',
      [DocumentType.TAX_DOCUMENT]: 'Document fiscal',
      [DocumentType.BANK_DOCUMENT]: 'Document bancaire',
      [DocumentType.FAMILY_DOCUMENT]: 'Document familial',
      [DocumentType.TRAINING_DOCUMENT]: 'Document de formation',
      [DocumentType.PERFORMANCE_REVIEW]: 'Évaluation de performance',
      [DocumentType.WARNING_LETTER]: 'Lettre d\'avertissement',
      [DocumentType.RESIGNATION]: 'Démission',
      [DocumentType.TERMINATION]: 'Fin de contrat',
      [DocumentType.OTHER]: 'Autre',
    };
    return labels[this.documentType];
  }

  get accessLevelLabel(): string {
    const labels = {
      [AccessLevel.PUBLIC]: 'Public',
      [AccessLevel.EMPLOYEE]: 'Employé',
      [AccessLevel.MANAGER]: 'Manager',
      [AccessLevel.HR]: 'RH',
      [AccessLevel.ADMIN]: 'Admin',
      [AccessLevel.CONFIDENTIAL]: 'Confidentiel',
    };
    return labels[this.accessLevel];
  }

  get formattedFileSize(): string {
    const bytes = Number(this.fileSize);
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  get isImage(): boolean {
    return ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(this.mimeType);
  }

  get isPdf(): boolean {
    return this.mimeType === 'application/pdf';
  }

  get isWordDocument(): boolean {
    return [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ].includes(this.mimeType);
  }

  get isExcelDocument(): boolean {
    return [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ].includes(this.mimeType);
  }
}
