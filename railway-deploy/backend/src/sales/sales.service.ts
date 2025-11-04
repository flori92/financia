import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesClient } from './entities/sales-client.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(SalesClient)
    private readonly salesClientRepository: Repository<SalesClient>,
  ) {}

  async findAll(companyId: string): Promise<SalesClient[]> {
    return this.salesClientRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, companyId: string): Promise<SalesClient> {
    return this.salesClientRepository.findOne({
      where: { id, companyId },
    });
  }

  async create(clientData: Partial<SalesClient>, companyId: string): Promise<SalesClient> {
    const client = this.salesClientRepository.create({
      ...clientData,
      companyId,
      id: undefined, // Laisser la base générer l'ID
      totalOrders: 0,
      totalRevenue: 0,
      createdAt: new Date(),
      lastOrderDate: null,
    });
    return this.salesClientRepository.save(client);
  }

  async update(id: string, clientData: Partial<SalesClient>, companyId: string): Promise<SalesClient> {
    await this.salesClientRepository.update({ id, companyId }, clientData);
    return this.findOne(id, companyId);
  }

  async remove(id: string, companyId: string): Promise<void> {
    await this.salesClientRepository.delete({ id, companyId });
  }

  async getClientStats(companyId: string) {
    const clients = await this.findAll(companyId);
    return {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      totalRevenue: clients.reduce((sum, c) => sum + (c.totalRevenue || 0), 0),
      topClients: clients
        .sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0))
        .slice(0, 5),
    };
  }
}
