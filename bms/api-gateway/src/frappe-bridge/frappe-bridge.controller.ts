import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { FrappeApiService } from './services/frappe-api.service';
import { FrappeSyncService } from './services/frappe-sync.service';

@ApiTags('Frappe Bridge')
@Controller('api/v1/frappe')
export class FrappeBridgeController {
  constructor(
    private frappeApi: FrappeApiService,
    private frappeSync: FrappeSyncService,
  ) {}

  @Get('status')
  @ApiOperation({ summary: 'Vérifier le statut Frappe' })
  async getStatus() {
    const available = await this.frappeApi.checkAvailability();
    return { available, message: available ? 'Connected' : 'Disconnected' };
  }

  @Post('sync')
  @ApiOperation({ summary: 'Synchroniser manuellement' })
  async triggerSync() {
    return this.frappeSync.fullSync();
  }
}
