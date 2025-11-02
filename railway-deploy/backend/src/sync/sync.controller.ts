import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sync')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  @ApiOperation({ summary: 'Pousser les changements du client vers le serveur' })
  @ApiResponse({ status: 200, description: 'Changements synchronisés' })
  async push(
    @Body()
    body: {
      client_id: string;
      last_sync: string;
      changes: any[];
    },
    @Request() req,
  ) {
    return this.syncService.pushChanges(body, req.user.userId);
  }

  @Post('pull')
  @ApiOperation({ summary: 'Récupérer les changements du serveur' })
  @ApiResponse({ status: 200, description: 'Changements récupérés' })
  async pull(
    @Body()
    body: {
      client_id: string;
      last_sync: string;
    },
    @Request() req,
  ): Promise<any> {
    return this.syncService.pullChanges(body.client_id, body.last_sync, req.user.userId);
  }

  @Post('bidirectional')
  @ApiOperation({ summary: 'Synchronisation bidirectionnelle (push + pull)' })
  @ApiResponse({ status: 200, description: 'Synchronisation complète' })
  async bidirectional(
    @Body()
    body: {
      client_id: string;
      last_sync: string;
      changes: any[];
    },
    @Request() req,
  ): Promise<any> {
    return this.syncService.syncBidirectional(body, req.user.userId);
  }

  @Post('resolve-conflict')
  @ApiOperation({ summary: 'Résoudre un conflit de synchronisation' })
  @ApiResponse({ status: 200, description: 'Conflit résolu' })
  async resolveConflict(
    @Body()
    body: {
      entity_type: string;
      entity_id: string;
      resolution: 'server' | 'client';
    },
  ) {
    return this.syncService.resolveConflict(body.entity_type, body.entity_id, body.resolution);
  }
}
