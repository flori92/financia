import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiConsumes } from '@nestjs/swagger';
import { DocumentVaultService } from './services/document-vault.service';
import { DocumentVault, DocumentType, DocumentStatus, AccessLevel } from './entities/document-vault.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/guards/roles.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Document Vault / Coffret Fort')
@Controller('document-vault')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentVaultController {
  constructor(private readonly documentVaultService: DocumentVaultService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/temp',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    })
  )
  @ApiOperation({ summary: 'Uploader un document dans le coffre fort' })
  @ApiResponse({ status: 201, description: 'Document uploadé avec succès', type: DocumentVault })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou trop volumineux' })
  @ApiConsumes('multipart/form-data')
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: {
      employeeId: string;
      documentType: DocumentType;
      description?: string;
      notes?: string;
      keywords?: string;
      documentNumber?: string;
      issueDate?: Date;
      expiryDate?: Date;
      category?: string;
      subcategory?: string;
      tags?: string;
      isConfidential?: boolean;
      isLegalDocument?: boolean;
      requiresSignature?: boolean;
      accessLevel?: AccessLevel;
      notifyEmployee?: boolean;
      notifyManager?: boolean;
    },
    @Request() req: any
  ): Promise<DocumentVault> {
    if (!file) {
      throw new BadRequestException('Fichier requis');
    }

    // Employé ne peut uploader que pour lui-même (sauf RH/Admin)
    if (req.user.role === UserRole.EMPLOYEE) {
      body.employeeId = req.user.employeeId;
    }

    const fs = require('fs');
    const fileBuffer = fs.readFileSync(file.path);

    try {
      const document = await this.documentVaultService.create(
        {
          ...body,
          originalFilename: file.originalname,
          fileBuffer,
          mimeType: file.mimetype,
          tags: body.tags ? JSON.parse(body.tags) : undefined,
        },
        req.user,
        req.user.companyId
      );

      // Nettoyer le fichier temporaire
      fs.unlinkSync(file.path);

      return document;
    } catch (error) {
      // Nettoyer le fichier temporaire en cas d'erreur
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      throw error;
    }
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Lister les documents du coffre fort' })
  @ApiResponse({ status: 200, description: 'Liste des documents' })
  @ApiQuery({ name: 'employeeId', required: false })
  @ApiQuery({ name: 'documentType', required: false, enum: DocumentType })
  @ApiQuery({ name: 'status', required: false, enum: DocumentStatus })
  @ApiQuery({ name: 'accessLevel', required: false, enum: AccessLevel })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'keywords', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Request() req: any,
    @Query('employeeId') employeeId?: string,
    @Query('documentType') documentType?: DocumentType,
    @Query('status') status?: DocumentStatus,
    @Query('accessLevel') accessLevel?: AccessLevel,
    @Query('category') category?: string,
    @Query('keywords') keywords?: string,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<{ documents: DocumentVault[]; total: number }> {
    // Employé ne peut voir que ses propres documents
    if (req.user.role === UserRole.EMPLOYEE) {
      employeeId = req.user.employeeId;
    }

    return await this.documentVaultService.findAll(req.user.companyId, {
      employeeId,
      documentType,
      status,
      accessLevel,
      category,
      keywords,
      startDate,
      endDate,
      page,
      limit,
    }, req.user);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Obtenir les statistiques des documents' })
  @ApiResponse({ status: 200, description: 'Statistiques des documents' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getStats(
    @Request() req: any,
    @Query('startDate') startDate?: Date,
    @Query('endDate') endDate?: Date
  ) {
    const period = startDate && endDate ? { startDate, endDate } : undefined;
    return await this.documentVaultService.getStats(req.user.companyId, period);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Obtenir les détails d\'un document' })
  @ApiResponse({ status: 200, description: 'Détails du document', type: DocumentVault })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async findOne(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<DocumentVault> {
    return await this.documentVaultService.findOne(id, req.user.companyId, req.user);
  }

  @Get(':id/download')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Télécharger un document' })
  @ApiResponse({ status: 200, description: 'Fichier du document' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès non autorisé' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async download(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<{ filePath: string; filename: string; mimeType: string }> {
    return await this.documentVaultService.download(id, req.user.companyId, req.user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Mettre à jour les métadonnées d\'un document' })
  @ApiResponse({ status: 200, description: 'Document mis à jour', type: DocumentVault })
  @ApiResponse({ status: 400, description: 'Document ne peut plus être modifié' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: {
      description?: string;
      notes?: string;
      keywords?: string;
      documentNumber?: string;
      issueDate?: Date;
      expiryDate?: Date;
      category?: string;
      subcategory?: string;
      tags?: string;
      isConfidential?: boolean;
      isLegalDocument?: boolean;
      requiresSignature?: boolean;
      accessLevel?: AccessLevel;
    },
    @Request() req: any
  ): Promise<DocumentVault> {
    const parsedDto = {
      ...updateDocumentDto,
      tags: updateDocumentDto.tags ? JSON.parse(updateDocumentDto.tags) : undefined,
    };

    return await this.documentVaultService.update(id, parsedDto, req.user.companyId, req.user);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Approuver un document en attente de vérification' })
  @ApiResponse({ status: 200, description: 'Document approuvé avec succès' })
  @ApiResponse({ status: 400, description: 'Document ne peut pas être approuvé' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async approve(
    @Param('id') id: string,
    @Body() body: { comments?: string },
    @Request() req: any
  ): Promise<DocumentVault> {
    return await this.documentVaultService.approve(id, req.user.id, req.user.companyId, body.comments);
  }

  @Patch(':id/archive')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER)
  @ApiOperation({ summary: 'Archiver un document' })
  @ApiResponse({ status: 200, description: 'Document archivé avec succès' })
  @ApiResponse({ status: 400, description: 'Document ne peut pas être archivé' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async archive(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<DocumentVault> {
    return await this.documentVaultService.archive(id, req.user.id, req.user.companyId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.HR_MANAGER, UserRole.MANAGER, UserRole.EMPLOYEE)
  @ApiOperation({ summary: 'Supprimer un document' })
  @ApiResponse({ status: 200, description: 'Document supprimé avec succès' })
  @ApiResponse({ status: 400, description: 'Document ne peut plus être supprimé' })
  @ApiResponse({ status: 404, description: 'Document non trouvé' })
  @ApiParam({ name: 'id', description: 'ID du document' })
  async remove(
    @Param('id') id: string,
    @Request() req: any
  ): Promise<void> {
    return await this.documentVaultService.remove(id, req.user.id, req.user.companyId);
  }
}
