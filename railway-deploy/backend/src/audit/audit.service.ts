import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  async log(
    entityType: string,
    entityId: string,
    action: string,
    userId: string,
    notes?: string,
  ) {
    const entry = this.repo.create({ entityType, entityId, action, userId, notes });
    return this.repo.save(entry);
  }
}
