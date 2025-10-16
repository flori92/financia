import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NifService } from './nif.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, UserRole } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('nif')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nif')
export class NifController {
  constructor(private readonly nifService: NifService) {}

  @Post('request')
  @ApiOperation({ summary: 'Créer une demande de NIF' })
  @ApiResponse({ status: 201, description: 'Demande créée' })
  async createRequest(@Request() req, @Body() body: any) {
    return this.nifService.createRequest(req.user.userId, body);
  }

  @Get('my-requests')
  @ApiOperation({ summary: 'Mes demandes de NIF' })
  @ApiResponse({ status: 200, description: 'Liste des demandes' })
  async getMyRequests(@Request() req) {
    return this.nifService.getUserRequests(req.user.userId);
  }

  @Get('request/:id')
  @ApiOperation({ summary: 'Détail d\'une demande' })
  @ApiResponse({ status: 200, description: 'Demande trouvée' })
  async getRequest(@Param('id') id: string, @Request() req) {
    return this.nifService.getRequest(id, req.user.userId);
  }

  @Patch('request/:id/submit')
  @ApiOperation({ summary: 'Soumettre une demande à la DGI' })
  @ApiResponse({ status: 200, description: 'Demande soumise' })
  async submitRequest(@Param('id') id: string, @Request() req) {
    return this.nifService.submitRequest(id, req.user.userId);
  }

  @Patch('request/:id/document')
  @ApiOperation({ summary: 'Mettre à jour un document de la demande NIF' })
  @ApiResponse({ status: 200, description: 'Document mis à jour' })
  async updateDocument(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { key: string; url: string },
  ) {
    return this.nifService.updateDocument(id, req.user.userId, body.key, body.url);
  }

  @Get('verify/:nifNumber')
  @ApiOperation({ summary: 'Vérifier la validité d\'un NIF' })
  @ApiResponse({ status: 200, description: 'Résultat vérification' })
  async verifyNIF(@Param('nifNumber') nifNumber: string) {
    return this.nifService.verifyNIF(nifNumber);
  }

  // Admin/Tax Admin only
  @Get('admin/requests')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TAX_ADMIN)
  @ApiOperation({ summary: '[Admin] Lister toutes les demandes' })
  @ApiResponse({ status: 200, description: 'Liste des demandes' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async getAllRequests(@Query() filters: any) {
    return this.nifService.getAllRequests(filters);
  }

  @Patch('admin/request/:id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TAX_ADMIN)
  @ApiOperation({ summary: '[Admin] Approuver une demande NIF' })
  @ApiResponse({ status: 200, description: 'Demande approuvée' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async approveRequest(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { nifNumber?: string },
  ) {
    return this.nifService.approveRequest(id, req.user.userId, body.nifNumber);
  }

  @Patch('admin/request/:id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.TAX_ADMIN)
  @ApiOperation({ summary: '[Admin] Rejeter une demande NIF' })
  @ApiResponse({ status: 200, description: 'Demande rejetée' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async rejectRequest(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { reason: string },
  ) {
    return this.nifService.rejectRequest(id, req.user.userId, body.reason);
  }
}
