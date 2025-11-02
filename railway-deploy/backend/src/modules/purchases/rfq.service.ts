import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RFQ, RFQStatus } from './entities/rfq.entity';
import { CreateRFQDto } from './dto/create-rfq.dto';
import { UpdateRFQDto } from './dto/update-rfq.dto';

@Injectable()
export class RFQService {
  constructor(
    @InjectRepository(RFQ)
    private readonly rfqRepository: Repository<RFQ>,
  ) {}

  /**
   * Créer un nouvel appel d'offres
   */
  async create(createRFQDto: CreateRFQDto, companyId: string): Promise<RFQ> {
    const rfq = this.rfqRepository.create({
      ...createRFQDto,
      companyId,
      referenceNumber: this.generateReferenceNumber(),
      status: RFQStatus.DRAFT,
    });

    return await this.rfqRepository.save(rfq);
  }

  /**
   * Lister tous les appels d'offres d'une entreprise
   */
  async findAll(companyId: string, status?: RFQStatus): Promise<RFQ[]> {
    const query = this.rfqRepository.createQueryBuilder('rfq')
      .where('rfq.companyId = :companyId', { companyId })
      .leftJoinAndSelect('rfq.responses', 'responses')
      .orderBy('rfq.createdAt', 'DESC');

    if (status) {
      query.andWhere('rfq.status = :status', { status });
    }

    return await query.getMany();
  }

  /**
   * Trouver un appel d'offres par ID
   */
  async findOne(id: string, companyId: string): Promise<RFQ> {
    const rfq = await this.rfqRepository.findOne({
      where: { id, companyId },
      relations: ['responses'],
    });

    if (!rfq) {
      throw new NotFoundException(`Appel d'offres #${id} non trouvé`);
    }

    return rfq;
  }

  /**
   * Mettre à jour un appel d'offres
   */
  async update(id: string, updateRFQDto: UpdateRFQDto, companyId: string): Promise<RFQ> {
    const rfq = await this.findOne(id, companyId);

    Object.assign(rfq, updateRFQDto);
    return await this.rfqRepository.save(rfq);
  }

  /**
   * Publier un appel d'offres
   */
  async publish(id: string, companyId: string): Promise<RFQ> {
    const rfq = await this.findOne(id, companyId);

    if (rfq.status !== RFQStatus.DRAFT) {
      throw new BadRequestException('Seuls les appels d\'offres en brouillon peuvent être publiés');
    }

    if (!rfq.deadline || rfq.deadline <= new Date()) {
      throw new BadRequestException('La date limite doit être dans le futur');
    }

    rfq.status = RFQStatus.PUBLISHED;
    return await this.rfqRepository.save(rfq);
  }

  /**
   * Clôturer un appel d'offres
   */
  async close(id: string, companyId: string): Promise<RFQ> {
    const rfq = await this.findOne(id, companyId);

    if (rfq.status !== RFQStatus.PUBLISHED) {
      throw new BadRequestException('Seuls les appels d\'offres publiés peuvent être clôturés');
    }

    rfq.status = RFQStatus.CLOSED;
    return await this.rfqRepository.save(rfq);
  }

  /**
   * Supprimer un appel d'offres
   */
  async remove(id: string, companyId: string): Promise<void> {
    const rfq = await this.findOne(id, companyId);

    if (rfq.status === RFQStatus.PUBLISHED) {
      throw new BadRequestException('Impossible de supprimer un appel d\'offres publié');
    }

    await this.rfqRepository.remove(rfq);
  }

  /**
   * Obtenir les statistiques des RFQ
   */
  async getStats(companyId: string): Promise<any> {
    const stats = await this.rfqRepository
      .createQueryBuilder('rfq')
      .select('rfq.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('rfq.companyId = :companyId', { companyId })
      .groupBy('rfq.status')
      .getRawMany();

    const total = stats.reduce((sum, stat) => sum + parseInt(stat.count), 0);

    return {
      total,
      draft: stats.find(s => s.status === RFQStatus.DRAFT)?.count || 0,
      published: stats.find(s => s.status === RFQStatus.PUBLISHED)?.count || 0,
      closed: stats.find(s => s.status === RFQStatus.CLOSED)?.count || 0,
    };
  }

  /**
   * Générer un numéro de référence unique
   */
  private generateReferenceNumber(): string {
    const year = new Date().getFullYear();
    const sequence = Math.floor(Math.random() * 9999) + 1;
    return `RFQ-${year}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Vérifier les appels d'offres expirés
   */
  async checkExpiredRFQs(): Promise<void> {
    const expiredRFQs = await this.rfqRepository
      .createQueryBuilder('rfq')
      .where('rfq.status = :status', { status: RFQStatus.PUBLISHED })
      .andWhere('rfq.deadline < :now', { now: new Date() })
      .getMany();

    for (const rfq of expiredRFQs) {
      rfq.status = RFQStatus.CLOSED;
      await this.rfqRepository.save(rfq);
    }
  }
}
