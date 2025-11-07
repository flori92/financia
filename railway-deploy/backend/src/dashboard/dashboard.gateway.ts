import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { UnifiedDashboardService } from './services/unified-dashboard.service';

/**
 * Gateway WebSocket pour les mises à jour en temps réel des dashboards
 */
@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/dashboard',
})
export class DashboardGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DashboardGateway.name);
  private readonly connectedClients = new Map<string, Set<string>>(); // companyId -> Set<socketId>

  constructor(
    private readonly unifiedDashboard: UnifiedDashboardService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  handleConnection(client: Socket) {
    try {
      // Authentifier le client (à améliorer avec JWT)
      const { companyId, profile } = client.handshake.auth || {};
      
      if (!companyId) {
        this.logger.warn(`Client ${client.id} connected without companyId`);
        client.disconnect();
        return;
      }

      // Rejoindre la room pour cette entreprise
      client.join(`company:${companyId}`);
      if (profile) {
        client.join(`profile:${profile}`);
      }

      // Track les clients connectés
      if (!this.connectedClients.has(companyId)) {
        this.connectedClients.set(companyId, new Set());
      }
      this.connectedClients.get(companyId)!.add(client.id);

      this.logger.log(
        `Client ${client.id} connected for company ${companyId}, profile ${profile || 'none'}`,
      );

      // Envoyer les données initiales
      this.sendInitialData(client, companyId, profile);
    } catch (error) {
      this.logger.error(`Error handling connection for ${client.id}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    try {
      const { companyId } = client.handshake.auth || {};
      
      if (companyId && this.connectedClients.has(companyId)) {
        this.connectedClients.get(companyId)!.delete(client.id);
        
        if (this.connectedClients.get(companyId)!.size === 0) {
          this.connectedClients.delete(companyId);
        }
      }

      this.logger.log(`Client ${client.id} disconnected`);
    } catch (error) {
      this.logger.error(`Error handling disconnect for ${client.id}:`, error);
    }
  }

  /**
   * Écoute les événements de mise à jour du dashboard
   */
  @OnEvent('dashboard.updated')
  handleDashboardUpdate(payload: {
    companyId: string;
    profile: string;
    data: any;
  }) {
    try {
      // Envoyer la mise à jour à tous les clients connectés
      this.server
        .to(`company:${payload.companyId}`)
        .to(`profile:${payload.profile}`)
        .emit('dashboard:update', payload.data);

      this.logger.debug(
        `Dashboard update sent for company ${payload.companyId}, profile ${payload.profile}`,
      );
    } catch (error) {
      this.logger.error('Error handling dashboard update:', error);
    }
  }

  /**
   * Écoute les événements d'invalidation de cache
   */
  @OnEvent('cache.invalidated')
  handleCacheInvalidation(payload: {
    companyId: string;
    tags?: string[];
    entity?: string;
  }) {
    try {
      // Notifier les clients pour recharger les données
      this.server
        .to(`company:${payload.companyId}`)
        .emit('cache:invalidated', {
          tags: payload.tags || [],
          entity: payload.entity,
        });

      this.logger.debug(
        `Cache invalidation notification sent for company ${payload.companyId}`,
      );
    } catch (error) {
      this.logger.error('Error handling cache invalidation:', error);
    }
  }

  /**
   * Message pour demander une mise à jour
   */
  @SubscribeMessage('dashboard:refresh')
  async handleRefresh(
    @MessageBody() payload: { companyId: string; profile: string },
    client: Socket,
  ) {
    try {
      const { companyId, profile } = payload;
      
      if (!companyId || !profile) {
        client.emit('error', { message: 'companyId and profile required' });
        return;
      }

      // Forcer le rechargement
      const data = await this.unifiedDashboard.getDashboardData(
        companyId,
        profile,
        { forceRefresh: true },
      );

      client.emit('dashboard:update', data);
    } catch (error) {
      this.logger.error('Error handling refresh request:', error);
      client.emit('error', { message: 'Failed to refresh dashboard' });
    }
  }

  /**
   * Envoie les données initiales au client
   */
  private async sendInitialData(
    client: Socket,
    companyId: string,
    profile?: string,
  ) {
    try {
      if (!profile) return;

      const data = await this.unifiedDashboard.getDashboardData(
        companyId,
        profile,
      );

      client.emit('dashboard:initial', data);
    } catch (error) {
      this.logger.error(
        `Error sending initial data to ${client.id}:`,
        error,
      );
    }
  }

  /**
   * Récupère le nombre de clients connectés pour une entreprise
   */
  getConnectedClientsCount(companyId: string): number {
    return this.connectedClients.get(companyId)?.size || 0;
  }
}

