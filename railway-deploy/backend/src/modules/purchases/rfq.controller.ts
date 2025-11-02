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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { RFQService } from './rfq.service';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { UpdateRFQDto } from './dto/update-rfq.dto';
import { RFQStatus } from './entities/rfq.entity';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('RFQ - Appels d\'Offres')
@UseGuards(JwtAuthGuard)
@Controller('purchases/rfq')
export class RFQController {
  constructor(private readonly rfqService: RFQService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel appel d\'offres' })
  @ApiResponse({ status: 201, description: 'Appel d\'offres créé avec succès' })
  create(@Body() createRFQDto: CreateRFQDto, @Request() req) {
    return this.rfqService.create(createRFQDto, req.user.companyId);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les appels d\'offres' })
  @ApiQuery({ name: 'status', required: false, enum: RFQStatus })
  @ApiResponse({ status: 200, description: 'Liste des appels d\'offres' })
  findAll(@Request() req, @Query('status') status?: RFQStatus) {
    return this.rfqService.findAll(req.user.companyId, status);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obtenir les statistiques des appels d\'offres' })
  @ApiResponse({ status: 200, description: 'Statistiques RFQ' })
  getStats(@Request() req) {
    return this.rfqService.getStats(req.user.companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Trouver un appel d\'offres par ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres trouvé' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.rfqService.findOne(id, req.user.companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour un appel d\'offres' })
  @ApiParam({ name: 'id', description: 'ID de l\'appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres mis à jour' })
  update(@Param('id') id: string, @Body() updateRFQDto: UpdateRFQDto, @Request() req) {
    return this.rfqService.update(id, updateRFQDto, req.user.companyId);
  }

  @Patch(':id/publish')
  @ApiOperation({ summary: 'Publier un appel d\'offres' })
  @ApiParam({ name: 'id', description: 'ID de l\'appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres publié' })
  publish(@Param('id') id: string, @Request() req) {
    return this.rfqService.publish(id, req.user.companyId);
  }

  @Patch(':id/close')
  @ApiOperation({ summary: 'Clôturer un appel d\'offres' })
  @ApiParam({ name: 'id', description: 'ID de l\'appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres clôturé' })
  close(@Param('id') id: string, @Request() req) {
    return this.rfqService.close(id, req.user.companyId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un appel d\'offres' })
  @ApiParam({ name: 'id', description: 'ID de l\'appel d\'offres' })
  @ApiResponse({ status: 200, description: 'Appel d\'offres supprimé' })
  remove(@Param('id') id: string, @Request() req) {
    return this.rfqService.remove(id, req.user.companyId);
  }
}
