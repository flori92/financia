import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankConnection } from '../entities/bank-connection.entity';
import { BankAccount } from '../entities/bank-account.entity';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class BankConnectionService {
  private readonly logger = new Logger(BankConnectionService.name);

  constructor(
    @InjectRepository(BankConnection)
    private readonly bankConnectionRepo: Repository<BankConnection>,
    @InjectRepository(BankAccount)
    private readonly bankAccountRepo: Repository<BankAccount>,
    private readonly notificationsService: NotificationsService
  ) {}

  async testConnection(connectionId: string): Promise<boolean> {
    try {
      const connection = await this.bankConnectionRepo.findOne({
        where: { id: connectionId }
      });

      if (!connection) {
        throw new Error('Connexion non trouvée');
      }

      // Simuler un test de connexion API
      this.logger.log(`Test de connexion pour ${connection.bankCode}: ${connection.status}`);
      
      return connection.status === 'active';
    } catch (error) {
      this.logger.error(`Erreur test connexion: ${error.message}`);
      return false;
    }
  }

  async refreshConnection(connectionId: string): Promise<BankConnection> {
    const connection = await this.bankConnectionRepo.findOne({
      where: { id: connectionId }
    });

    if (!connection) {
      throw new Error('Connexion non trouvée');
    }

    // Simuler un rafraîchissement de token
    connection.status = 'active';
    connection.metadata = { ...connection.metadata, lastRefresh: new Date() };
    
    return this.bankConnectionRepo.save(connection);
  }

  async getActiveConnections(userId: string): Promise<BankConnection[]> {
    return this.bankConnectionRepo.find({
      where: { userId, status: 'active' },
      relations: ['accounts']
    });
  }

  async revokeConnection(connectionId: string, userId: string): Promise<void> {
    const connection = await this.bankConnectionRepo.findOne({
      where: { id: connectionId, userId }
    });

    if (!connection) {
      throw new Error('Connexion non trouvée');
    }

    connection.status = 'revoked';
    await this.bankConnectionRepo.save(connection);

    // Notifier l'utilisateur
    await this.notificationsService.sendBankConnectionNotification({
      userId,
      type: 'bank_connection_revoked',
      data: { bankCode: connection.bankCode }
    });
  }

  async getConnectionHealth(connectionId: string): Promise<{
    status: 'healthy' | 'warning' | 'error';
    lastSync?: Date;
    errorCount: number;
  }> {
    try {
      const connection = await this.bankConnectionRepo.findOne({
        where: { id: connectionId }
      });

      if (!connection) {
        return { status: 'error', errorCount: 1 };
      }

      const lastSync = connection.metadata?.lastSync;
      const errorCount = connection.metadata?.errorCount || 0;

      let status: 'healthy' | 'warning' | 'error' = 'healthy';
      
      if (errorCount > 5) {
        status = 'error';
      } else if (errorCount > 0 || !lastSync) {
        status = 'warning';
      }

      return { status, lastSync, errorCount };
    } catch (error) {
      return { status: 'error', errorCount: 1 };
    }
  }
}
