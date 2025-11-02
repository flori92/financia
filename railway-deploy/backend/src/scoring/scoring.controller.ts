import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('scoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post('calculate/:companyId')
  @ApiOperation({ summary: 'Calculer le score de crédit d\'une entreprise' })
  @ApiResponse({ status: 200, description: 'Score calculé' })
  async calculateScore(@Param('companyId') companyId: string) {
    return this.scoringService.calculateScore(companyId);
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Obtenir le score d\'une entreprise' })
  @ApiResponse({ status: 200, description: 'Score trouvé' })
  async getCompanyScore(@Param('companyId') companyId: string) {
    return this.scoringService.getCompanyScore(companyId);
  }

  @Post('certify/:scoreId')
  @ApiOperation({ summary: '[Comptable] Certifier un score' })
  @ApiResponse({ status: 200, description: 'Score certifié' })
  async certifyScore(
    @Param('scoreId') scoreId: string,
    @Request() req,
    @Body() body: { signature: string },
  ) {
    return this.scoringService.certifyScore(scoreId, req.user.userId, body.signature);
  }
}
