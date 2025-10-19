import { Controller, Get, Post, Delete, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GdprService } from './gdpr.service';

@ApiTags('gdpr')
@ApiBearerAuth()
@Controller('gdpr')
@UseGuards(JwtAuthGuard)
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Get('export')
  async exportData(@Request() req) {
    return this.gdprService.exportUserData(req.user.id);
  }

  @Delete('delete')
  async deleteData(@Request() req) {
    await this.gdprService.deleteUserData(req.user.id);
    return { message: 'Data deletion initiated' };
  }

  @Get('consent')
  async getConsent(@Request() req) {
    return this.gdprService.getConsent(req.user.id);
  }
}
