import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly repo: Repository<Company>,
  ) {}

  async findAll(): Promise<Company[]> {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Company> {
    const company = await this.repo.findOne({ where: { id } });
    if (!company) {
      throw new NotFoundException(`Société ${id} non trouvée`);
    }
    return company;
  }

  async updateTreasurySettings(
    id: string,
    settings: { treasuryCriticalThreshold: number; treasuryWarningThreshold: number },
  ): Promise<Company> {
    const company = await this.findOne(id);
    company.treasuryCriticalThreshold = settings.treasuryCriticalThreshold;
    company.treasuryWarningThreshold = settings.treasuryWarningThreshold;
    return this.repo.save(company);
  }
}
