import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { QualityControlService } from './qc.service';

@ApiTags('Quality')
@Controller('quality')
export class QualityController {
  constructor(private readonly qcService: QualityControlService) {}

  @Post('inspections')
  @ApiOperation({ summary: 'Effectuer une inspection' })
  async performInspection(@Body() data: any) {
    return this.qcService.performInspection(data.planId, data.itemId);
  }

  @Post('non-conformities')
  @ApiOperation({ summary: 'Créer une non-conformité' })
  async createNC(@Body() data: any) {
    return this.qcService.createNonConformity(data);
  }

  @Post('corrective-actions')
  @ApiOperation({ summary: 'Créer une action corrective' })
  async createCA(@Body() data: any) {
    return this.qcService.createCorrectiveAction(data.ncId, data);
  }
}
