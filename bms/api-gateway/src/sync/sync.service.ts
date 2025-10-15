import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from '../invoices/entities/invoice.entity';

interface SyncChange {
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

interface SyncRequest {
  client_id: string;
  last_sync: string;
  changes: SyncChange[];
}

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
  ) {}

  async pushChanges(syncRequest: SyncRequest, userId: string) {
    const results = {
      synced: 0,
      conflicts: 0,
      errors: [],
    };

    for (const change of syncRequest.changes) {
      try {
        await this.applyChange(change, userId);
        results.synced++;
      } catch (error) {
        results.errors.push({
          entity_id: change.entity_id,
          error: error.message,
        });
      }
    }

    return results;
  }

  async pullChanges(clientId: string, lastSync: string, userId: string) {
    const lastSyncDate = new Date(lastSync);

    // Récupérer tous les changements depuis la dernière sync
    const invoices = await this.invoiceRepository
      .createQueryBuilder('invoice')
      .where('invoice.updated_at > :lastSync', { lastSync: lastSyncDate })
      .andWhere('invoice.created_by = :userId', { userId })
      .getMany();

    const changes: SyncChange[] = invoices.map((invoice) => ({
      entity_type: 'invoice',
      entity_id: invoice.id,
      action: 'update',
      data: invoice,
      timestamp: invoice.updatedAt.toISOString(),
    }));

    return {
      changes,
      server_timestamp: new Date().toISOString(),
    };
  }

  async syncBidirectional(syncRequest: SyncRequest, userId: string) {
    // 1. Push les changements du client
    const pushResults = await this.pushChanges(syncRequest, userId);

    // 2. Pull les changements du serveur
    const pullResults = await this.pullChanges(
      syncRequest.client_id,
      syncRequest.last_sync,
      userId,
    );

    return {
      push: pushResults,
      pull: pullResults,
    };
  }

  private async applyChange(change: SyncChange, userId: string) {
    switch (change.entity_type) {
      case 'invoice':
        return this.applyInvoiceChange(change, userId);

      // Ajouter d'autres types d'entités ici
      default:
        throw new Error(`Type d'entité non supporté: ${change.entity_type}`);
    }
  }

  private async applyInvoiceChange(change: SyncChange, userId: string) {
    const { action, entity_id, data } = change;

    switch (action) {
      case 'create':
        const invoice = this.invoiceRepository.create({
          ...data,
          id: entity_id,
          createdBy: userId,
          synced: true,
        });
        return this.invoiceRepository.save(invoice);

      case 'update':
        const existing = await this.invoiceRepository.findOne({
          where: { id: entity_id },
        });

        if (!existing) {
          throw new Error(`Facture ${entity_id} non trouvée`);
        }

        // Vérifier les conflits (si le serveur a une version plus récente)
        if (existing.updatedAt > new Date(change.timestamp)) {
          throw new Error('Conflit de synchronisation détecté');
        }

        return this.invoiceRepository.save({
          ...existing,
          ...data,
          synced: true,
        });

      case 'delete':
        return this.invoiceRepository.delete(entity_id);

      default:
        throw new Error(`Action non supportée: ${action}`);
    }
  }

  async resolveConflict(entityType: string, entityId: string, resolution: 'server' | 'client') {
    // TODO: Implémenter la résolution de conflits
    // Pour l'instant, on utilise la stratégie Last-Write-Wins

    if (resolution === 'server') {
      // Le serveur gagne, ne rien faire
      return { resolved: true, strategy: 'server-wins' };
    } else {
      // Le client gagne, mettre à jour avec les données client
      return { resolved: true, strategy: 'client-wins' };
    }
  }
}
