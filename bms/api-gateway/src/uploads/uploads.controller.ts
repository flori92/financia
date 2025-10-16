import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as fs from 'fs';

@ApiTags('uploads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload un fichier' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        entityType: { type: 'string', example: 'invoice' },
        entityId: { type: 'string' },
        companyId: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Fichier uploadé avec succès' })
  @ApiResponse({ status: 400, description: 'Fichier invalide' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('companyId') companyId?: string,
  ) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    this.uploadsService.validateFile(file);

    const upload = await this.uploadsService.saveFile(
      file,
      req.user.userId,
      entityType,
      entityId,
      companyId,
    );

    return {
      id: upload.id,
      fileName: upload.fileName,
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      size: upload.size,
      publicUrl: upload.publicUrl,
      createdAt: upload.createdAt,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Télécharger un fichier' })
  @ApiResponse({ status: 200, description: 'Fichier récupéré' })
  @ApiResponse({ status: 404, description: 'Fichier non trouvé' })
  async getFile(@Param('id') id: string, @Res() res: Response) {
    const upload = await this.uploadsService.getUpload(id);
    if (!upload) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    try {
      const buffer = await this.uploadsService.getFileBuffer(upload.filePath);
      res.setHeader('Content-Type', upload.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${upload.originalName}"`);
      res.send(buffer);
    } catch (e) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Lister les uploads d\'une entité' })
  @ApiResponse({ status: 200, description: 'Liste des uploads' })
  async getEntityUploads(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.uploadsService.getUploadsByEntity(entityType, entityId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Renommer un fichier (originalName)' })
  @ApiResponse({ status: 200, description: 'Nom mis à jour' })
  async rename(
    @Param('id') id: string,
    @Body() body: { originalName: string },
  ) {
    return this.uploadsService.updateName(id, body?.originalName || '');
  }

  @Post('batch-delete')
  @ApiOperation({ summary: 'Supprimer plusieurs fichiers' })
  @ApiResponse({ status: 200, description: 'Fichiers supprimés' })
  async batchDelete(@Body() body: { ids: string[] }) {
    const count = await this.uploadsService.deleteMany(Array.isArray(body?.ids) ? body.ids : []);
    return { deleted: count };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un fichier' })
  @ApiResponse({ status: 200, description: 'Fichier supprimé' })
  async deleteFile(@Param('id') id: string) {
    await this.uploadsService.deleteUpload(id);
    return { message: 'Fichier supprimé avec succès' };
  }
}
