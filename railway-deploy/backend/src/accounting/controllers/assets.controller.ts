import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetsService } from '../services/assets.service';
import { CreateAssetDto } from '../dto/create-asset.dto';

@ApiTags('assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les immobilisations' })
  @ApiResponse({ status: 200, description: 'Liste des immobilisations' })
  async findAll(@Query('companyId') companyId: string) {
    try {
      return await this.assetsService.findAll(companyId);
    } catch (e) {
      console.error('AssetsController.findAll error:', e);
      return [];
    }
  }

  @Post()
  @ApiOperation({ summary: 'Créer une immobilisation' })
  @ApiResponse({ status: 201, description: 'Immobilisation créée' })
  async create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une immobilisation' })
  @ApiResponse({ status: 200, description: 'Immobilisation trouvée' })
  async findOne(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.assetsService.findOne(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Mettre à jour une immobilisation' })
  @ApiResponse({ status: 200, description: 'Immobilisation mise à jour' })
  async update(
    @Param('id') id: string,
    @Query('companyId') companyId: string,
    @Body() updateAssetDto: Partial<CreateAssetDto>,
  ) {
    return this.assetsService.update(id, companyId, updateAssetDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une immobilisation' })
  @ApiResponse({ status: 200, description: 'Immobilisation supprimée' })
  async remove(@Param('id') id: string, @Query('companyId') companyId: string) {
    return this.assetsService.remove(id, companyId);
  }
}
