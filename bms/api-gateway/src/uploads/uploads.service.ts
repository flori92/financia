import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './entities/upload.entity';
import { StorageProvider } from './providers/storage-provider.interface';

@Injectable()
export class UploadsService {
  constructor(
    @InjectRepository(Upload)
    private readonly uploadsRepo: Repository<Upload>,
    @Inject('STORAGE_PROVIDER')
    private readonly storageProvider: StorageProvider,
  ) {
  }

  async deleteMany(ids: string[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      try {
        await this.deleteUpload(id);
        count++;
      } catch {}
    }
    return count;
  }

  async updateName(id: string, originalName: string): Promise<Upload> {
    const upload = await this.getUpload(id);
    if (!upload) throw new BadRequestException('Upload non trouvé');
    upload.originalName = originalName?.trim() || upload.originalName;
    return this.uploadsRepo.save(upload);
  }

  async saveFile(
    file: Express.Multer.File,
    userId: string,
    entityType?: string,
    entityId?: string,
    companyId?: string,
  ): Promise<Upload> {
    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = await this.storageProvider.saveFile(file.buffer, fileName);

    // Enregistrer en base
    const upload = this.uploadsRepo.create({
      fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath,
      publicUrl: '',
      entityType,
      entityId,
      uploadedBy: userId,
      companyId,
    });

    // Enregistrer pour obtenir l'ID
    const saved = await this.uploadsRepo.save(upload);
    // Mettre à jour l'URL publique accessible via l'API
    saved.publicUrl = `/api/v1/uploads/${saved.id}`;
    return this.uploadsRepo.save(saved);
  }

  async getUpload(id: string): Promise<Upload> {
    return this.uploadsRepo.findOne({ where: { id } });
  }

  async getFileBuffer(filePath: string): Promise<Buffer> {
    return this.storageProvider.getFile(filePath);
  }

  async getUploadsByEntity(entityType: string, entityId: string): Promise<Upload[]> {
    return this.uploadsRepo.find({ where: { entityType, entityId } });
  }

  async deleteUpload(id: string): Promise<void> {
    const upload = await this.getUpload(id);
    if (!upload) {
      throw new BadRequestException('Upload non trouvé');
    }

    // Supprimer le fichier via provider
    await this.storageProvider.deleteFile(upload.filePath);

    // Supprimer en base
    await this.uploadsRepo.delete(id);
  }

  validateFile(file: Express.Multer.File): void {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'image/webp',
    ];

    if (file.size > maxSize) {
      throw new BadRequestException('Fichier trop volumineux (max 10MB)');
    }

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Type de fichier non autorisé (JPG, PNG, PDF uniquement)');
    }
  }
}
