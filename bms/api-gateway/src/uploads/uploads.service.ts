import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upload } from './entities/upload.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadsService {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

  constructor(
    @InjectRepository(Upload)
    private readonly uploadsRepo: Repository<Upload>,
  ) {
    // Créer le répertoire uploads s'il n'existe pas
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(
    file: Express.Multer.File,
    userId: string,
    entityType?: string,
    entityId?: string,
    companyId?: string,
  ): Promise<Upload> {
    const fileName = `${Date.now()}_${file.originalname}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Écrire le fichier
    fs.writeFileSync(filePath, file.buffer);

    // Enregistrer en base
    const upload = this.uploadsRepo.create({
      fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      filePath,
      publicUrl: `/uploads/${fileName}`,
      entityType,
      entityId,
      uploadedBy: userId,
      companyId,
    });

    return this.uploadsRepo.save(upload);
  }

  async getUpload(id: string): Promise<Upload> {
    return this.uploadsRepo.findOne({ where: { id } });
  }

  async getUploadsByEntity(entityType: string, entityId: string): Promise<Upload[]> {
    return this.uploadsRepo.find({ where: { entityType, entityId } });
  }

  async deleteUpload(id: string): Promise<void> {
    const upload = await this.getUpload(id);
    if (!upload) {
      throw new BadRequestException('Upload non trouvé');
    }

    // Supprimer le fichier physique
    if (fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }

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
