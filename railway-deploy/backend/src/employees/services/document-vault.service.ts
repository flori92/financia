import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like } from 'typeorm';
import { DocumentVault, DocumentType, DocumentStatus, AccessLevel } from '../entities/document-vault.entity';
import { Employee, EmployeeStatus } from '../entities/employee.entity';
import { User } from '../../auth/entities/user.entity';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

interface CreateDocumentDto {
  employeeId: string;
  documentType: DocumentType;
  originalFilename: string;
  fileBuffer: Buffer;
  mimeType: string;
  description?: string;
  notes?: string;
  keywords?: string;
  documentNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  category?: string;
  subcategory?: string;
  tags?: string[];
  isConfidential?: boolean;
  isLegalDocument?: boolean;
  requiresSignature?: boolean;
  accessLevel?: AccessLevel;
  notifyEmployee?: boolean;
  notifyManager?: boolean;
}

interface UpdateDocumentDto {
  description?: string;
  notes?: string;
  keywords?: string;
  documentNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  category?: string;
  subcategory?: string;
  tags?: string[];
  isConfidential?: boolean;
  isLegalDocument?: boolean;
  requiresSignature?: boolean;
  accessLevel?: AccessLevel;
}

@Injectable()
export class DocumentVaultService {
  private readonly uploadPath = './uploads/documents';
  private readonly allowedMimeTypes = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ];

  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor(
    @InjectRepository(DocumentVault)
    private documentVaultRepository: Repository<DocumentVault>,
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    this.ensureUploadDirectory();
  }

  /**
   * Créer un nouveau document dans le coffre fort
   */
  async create(
    createDocumentDto: CreateDocumentDto,
    uploadedBy: User,
    companyId: string
  ): Promise<DocumentVault> {
    // Vérifier que l'employé existe et appartient à l'entreprise
    const employee = await this.employeesRepository.findOne({
      where: { id: createDocumentDto.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    // Valider le fichier
    this.validateFile(createDocumentDto.fileBuffer, createDocumentDto.mimeType);

    // Générer les métadonnées du fichier
    const fileMetadata = this.generateFileMetadata(createDocumentDto.originalFilename, createDocumentDto.mimeType);

    // Sauvegarder le fichier physiquement
    const filePath = await this.saveFile(fileMetadata.storedFilename, createDocumentDto.fileBuffer);

    // Calculer le hash du fichier
    const fileHash = this.calculateFileHash(createDocumentDto.fileBuffer);

    // Générer une référence unique
    const documentReference = this.generateDocumentReference(createDocumentDto.documentType);

    const document = this.documentVaultRepository.create({
      ...createDocumentDto,
      documentReference,
      ...fileMetadata,
      filePath,
      fileHash,
      fileSize: createDocumentDto.fileBuffer.length,
      uploadedById: uploadedBy.id,
      ipAddress: '127.0.0.1', // TODO: Get from request
      userAgent: 'BMS Backend', // TODO: Get from request
      status: createDocumentDto.isLegalDocument ? DocumentStatus.PENDING_VERIFICATION : DocumentStatus.VERIFIED,
    });

    const savedDocument = await this.documentVaultRepository.save(document);

    // Envoyer les notifications si nécessaire
    if (createDocumentDto.notifyEmployee || createDocumentDto.notifyManager) {
      await this.sendNotifications(savedDocument, createDocumentDto.notifyEmployee, createDocumentDto.notifyManager);
    }

    return savedDocument;
  }

  /**
   * Lister les documents
   */
  async findAll(
    companyId: string,
    options: {
      employeeId?: string;
      documentType?: DocumentType;
      status?: DocumentStatus;
      accessLevel?: AccessLevel;
      category?: string;
      keywords?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    } = {},
    requestingUser?: User
  ): Promise<{ documents: DocumentVault[]; total: number }> {
    const {
      employeeId,
      documentType,
      status,
      accessLevel,
      category,
      keywords,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = options;

    const queryBuilder = this.documentVaultRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.employee', 'employee')
      .leftJoinAndSelect('document.uploadedBy', 'uploadedBy')
      .innerJoin('document.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId })
      .andWhere('document.status != :deletedStatus', { deletedStatus: DocumentStatus.DELETED });

    // Filtrer selon les permissions de l'utilisateur
    if (requestingUser) {
      const accessFilter = this.getAccessFilter(requestingUser);
      if (accessFilter) {
        queryBuilder.andWhere(accessFilter);
      }
    }

    if (employeeId) {
      queryBuilder.andWhere('document.employeeId = :employeeId', { employeeId });
    }

    if (documentType) {
      queryBuilder.andWhere('document.documentType = :documentType', { documentType });
    }

    if (status) {
      queryBuilder.andWhere('document.status = :status', { status });
    }

    if (accessLevel) {
      queryBuilder.andWhere('document.accessLevel = :accessLevel', { accessLevel });
    }

    if (category) {
      queryBuilder.andWhere('document.category = :category', { category });
    }

    if (keywords) {
      queryBuilder.andWhere('document.keywords ILIKE :keywords', { keywords: `%${keywords}%` });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('document.createdAt >= :startDate AND document.createdAt <= :endDate', {
        startDate,
        endDate,
      });
    }

    const [documents, total] = await queryBuilder
      .orderBy('document.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { documents, total };
  }

  /**
   * Trouver un document par son ID
   */
  async findOne(id: string, companyId: string, requestingUser?: User): Promise<DocumentVault> {
    const document = await this.documentVaultRepository.findOne({
      where: { id },
      relations: [
        'employee',
        'uploadedBy',
      ],
    });

    if (!document || document.status === DocumentStatus.DELETED) {
      throw new NotFoundException('Document non trouvé');
    }

    // Vérifier que l'employé appartient à l'entreprise
    const employee = await this.employeesRepository.findOne({
      where: { id: document.employeeId, companyId },
    });
    if (!employee) {
      throw new NotFoundException('Employé non trouvé dans cette entreprise');
    }

    // Vérifier les permissions d'accès
    if (requestingUser && !this.canAccessDocument(document, requestingUser)) {
      throw new ForbiddenException('Accès non autorisé à ce document');
    }

    return document;
  }

  /**
   * Télécharger un document
   */
  async download(id: string, companyId: string, requestingUser: User): Promise<{
    filePath: string;
    filename: string;
    mimeType: string;
  }> {
    const document = await this.findOne(id, companyId, requestingUser);

    if (!document.canBeDownloaded) {
      throw new BadRequestException('Ce document ne peut pas être téléchargé');
    }

    // Vérifier que le fichier existe physiquement
    if (!fs.existsSync(document.filePath)) {
      throw new NotFoundException('Fichier non trouvé sur le serveur');
    }

    // Mettre à jour les statistiques de téléchargement
    document.downloadCount += 1;
    document.lastDownloadedAt = new Date();
    document.lastDownloadedBy = requestingUser.id;
    await this.documentVaultRepository.save(document);

    return {
      filePath: document.filePath,
      filename: document.originalFilename,
      mimeType: document.mimeType,
    };
  }

  /**
   * Mettre à jour un document
   */
  async update(
    id: string,
    updateDocumentDto: UpdateDocumentDto,
    companyId: string,
    requestingUser: User
  ): Promise<DocumentVault> {
    const document = await this.findOne(id, companyId, requestingUser);

    if (!document.canBeEdited) {
      throw new BadRequestException('Ce document ne peut plus être modifié');
    }

    // Vérifier les permissions
    if (!this.canEditDocument(document, requestingUser)) {
      throw new ForbiddenException('Vous n\'avez pas les droits de modifier ce document');
    }

    Object.assign(document, updateDocumentDto);

    // Si le document devient un document légal, le passer en attente de vérification
    if (updateDocumentDto.isLegalDocument && document.status === DocumentStatus.VERIFIED) {
      document.status = DocumentStatus.PENDING_VERIFICATION;
    }

    return await this.documentVaultRepository.save(document);
  }

  /**
   * Approuver un document
   */
  async approve(id: string, userId: string, companyId: string, comments?: string): Promise<DocumentVault> {
    const document = await this.findOne(id, companyId);

    if (!document.isPendingVerification) {
      throw new BadRequestException('Ce document n\'est pas en attente de vérification');
    }

    document.status = DocumentStatus.VERIFIED;
    document.approvedBy = userId;
    document.approvedAt = new Date();
    document.approvalComments = comments || '';

    return await this.documentVaultRepository.save(document);
  }

  /**
   * Archiver un document
   */
  async archive(id: string, userId: string, companyId: string): Promise<DocumentVault> {
    const document = await this.findOne(id, companyId);

    if (!document.canBeEdited) {
      throw new BadRequestException('Ce document ne peut pas être archivé');
    }

    document.status = DocumentStatus.ARCHIVED;
    document.updatedBy = userId;

    return await this.documentVaultRepository.save(document);
  }

  /**
   * Supprimer un document
   */
  async remove(id: string, userId: string, companyId: string): Promise<void> {
    const document = await this.findOne(id, companyId);

    if (!document.canBeDeleted) {
      throw new BadRequestException('Ce document ne peut pas être supprimé');
    }

    // Supprimer le fichier physique
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Marquer comme supprimé en base
    document.status = DocumentStatus.DELETED;
    document.updatedBy = userId;
    await this.documentVaultRepository.save(document);
  }

  /**
   * Obtenir les statistiques des documents
   */
  async getStats(companyId: string, period?: { startDate: Date; endDate: Date }): Promise<{
    total: number;
    draft: number;
    pending: number;
    verified: number;
    archived: number;
    expired: number;
    totalSize: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    expiringSoon: number;
  }> {
    const queryBuilder = this.documentVaultRepository
      .createQueryBuilder('document')
      .innerJoin('document.employee', 'emp')
      .where('emp.companyId = :companyId', { companyId })
      .andWhere('document.status != :deletedStatus', { deletedStatus: DocumentStatus.DELETED });

    if (period) {
      queryBuilder.andWhere('document.createdAt >= :startDate AND document.createdAt <= :endDate', {
        startDate: period.startDate,
        endDate: period.endDate,
      });
    }

    const documents = await queryBuilder.getMany();

    const stats = {
      total: documents.length,
      draft: documents.filter(d => d.status === DocumentStatus.DRAFT).length,
      pending: documents.filter(d => d.status === DocumentStatus.PENDING_VERIFICATION).length,
      verified: documents.filter(d => d.status === DocumentStatus.VERIFIED).length,
      archived: documents.filter(d => d.status === DocumentStatus.ARCHIVED).length,
      expired: documents.filter(d => d.isExpired).length,
      totalSize: documents.reduce((sum, d) => sum + Number(d.fileSize), 0),
      byType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
      expiringSoon: documents.filter(d => d.isExpiringSoon).length,
    };

    // Statistiques par type
    documents.forEach(document => {
      stats.byType[document.documentType] = (stats.byType[document.documentType] || 0) + 1;
      stats.byStatus[document.status] = (stats.byStatus[document.status] || 0) + 1;
    });

    return stats;
  }

  /**
   * Vérifier les permissions d'accès
   */
  private canAccessDocument(document: DocumentVault, user: User): boolean {
    // Admin peut tout voir
    if (user.role === 'admin') return true;

    // RH peut voir les documents RH et publics
    if (user.role === 'hr_manager' && [AccessLevel.HR, AccessLevel.PUBLIC, AccessLevel.MANAGER, AccessLevel.EMPLOYEE].includes(document.accessLevel)) {
      return true;
    }

    // Manager peut voir les documents de son équipe
    if (user.role === 'manager' && [AccessLevel.MANAGER, AccessLevel.EMPLOYEE, AccessLevel.PUBLIC].includes(document.accessLevel)) {
      // TODO: Vérifier que l'employé est dans l'équipe du manager
      return true;
    }

    // Employé peut voir ses propres documents
    if (user.role === 'employee' && user.employeeId === document.employeeId && document.employeeCanView) {
      return [AccessLevel.EMPLOYEE, AccessLevel.PUBLIC].includes(document.accessLevel);
    }

    return false;
  }

  /**
   * Vérifier les permissions de modification
   */
  private canEditDocument(document: DocumentVault, user: User): boolean {
    // Admin et RH peuvent tout modifier
    if (['admin', 'hr_manager'].includes(user.role)) return true;

    // L'employé ne peut modifier que ses propres documents non confidentiels
    if (user.role === 'employee' && user.employeeId === document.employeeId && !document.isConfidential) {
      return true;
    }

    return false;
  }

  /**
   * Obtenir le filtre d'accès selon le rôle utilisateur
   */
  private getAccessFilter(user: User): string | null {
    switch (user.role) {
      case 'admin':
        return null; // Admin peut tout voir
      
      case 'hr_manager':
        return 'document.accessLevel IN (:...accessLevels)';
      
      case 'manager':
        return 'document.accessLevel IN (:...accessLevels)';
      
      case 'employee':
        return 'document.employeeId = :employeeId AND document.employeeCanView = true';
      
      default:
        return '1 = 0'; // Pas d'accès
    }
  }

  /**
   * Valider le fichier uploadé
   */
  private validateFile(fileBuffer: Buffer, mimeType: string): void {
    if (fileBuffer.length > this.maxFileSize) {
      throw new BadRequestException('Le fichier est trop volumineux (max 10MB)');
    }

    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new BadRequestException('Type de fichier non autorisé');
    }
  }

  /**
   * Générer les métadonnées du fichier
   */
  private generateFileMetadata(originalFilename: string, mimeType: string): {
    storedFilename: string;
    fileExtension: string;
  } {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const fileExtension = path.extname(originalFilename);
    const storedFilename = `${timestamp}_${random}${fileExtension}`;

    return {
      storedFilename,
      fileExtension: fileExtension.substring(1),
    };
  }

  /**
   * Sauvegarder le fichier physiquement
   */
  private async saveFile(storedFilename: string, fileBuffer: Buffer): Promise<string> {
    const filePath = path.join(this.uploadPath, storedFilename);
    
    try {
      await fs.promises.writeFile(filePath, fileBuffer);
      return filePath;
    } catch (error) {
      throw new BadRequestException('Erreur lors de la sauvegarde du fichier');
    }
  }

  /**
   * Calculer le hash du fichier
   */
  private calculateFileHash(fileBuffer: Buffer): string {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Générer une référence unique
   */
  private generateDocumentReference(documentType: DocumentType): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const prefix = documentType.substring(0, 3).toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * S'assurer que le répertoire d'upload existe
   */
  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Envoyer les notifications
   */
  private async sendNotifications(
    document: DocumentVault,
    notifyEmployee: boolean,
    notifyManager: boolean
  ): Promise<void> {
    // TODO: Implémenter l'envoi de notifications
    console.log(`Notifications envoyées pour le document ${document.documentReference}`);
  }
}
