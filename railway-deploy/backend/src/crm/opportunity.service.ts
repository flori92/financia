import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Opportunity, OpportunityStatus } from './entities/opportunity.entity';
import { PipelineStage, PipelineStageType } from './entities/pipeline-stage.entity';
import { Contact } from './entities/contact.entity';
import { Tag } from './entities/tag.entity';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Injectable()
export class OpportunityService {
  private readonly logger = new Logger(OpportunityService.name);

  constructor(
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
    @InjectRepository(PipelineStage)
    private readonly pipelineStageRepository: Repository<PipelineStage>,
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async createOpportunity(createOpportunityDto: CreateOpportunityDto): Promise<Opportunity> {
    this.logger.log(`Création opportunité pour société ${createOpportunityDto.contactId ? 'avec contact' : 'sans contact'}`);

    // Vérifier que le contact existe
    if (createOpportunityDto.contactId) {
      const contact = await this.contactRepository.findOne({
        where: { id: createOpportunityDto.contactId },
      });
      if (!contact) {
        throw new BadRequestException('Contact non trouvé');
      }
    }

    // Vérifier l'étape du pipeline si fournie
    if (createOpportunityDto.pipelineStageId) {
      const stage = await this.pipelineStageRepository.findOne({
        where: { id: createOpportunityDto.pipelineStageId },
      });
      if (!stage) {
        throw new BadRequestException('Étape du pipeline non trouvée');
      }
    }

    // Créer l'opportunité
    const opportunity = this.opportunityRepository.create(createOpportunityDto);
    opportunity.createdAt = new Date();
    opportunity.updatedAt = new Date();

    // Associer les tags si fournis
    if (createOpportunityDto.tagIds && createOpportunityDto.tagIds.length > 0) {
      opportunity.tags = await this.tagRepository.find({
        where: { id: In(createOpportunityDto.tagIds) },
      });
    }

    const savedOpportunity = await this.opportunityRepository.save(opportunity);

    // Mettre à jour les statistiques du contact
    if (createOpportunityDto.contactId) {
      await this.updateContactStats(createOpportunityDto.contactId);
    }

    return savedOpportunity;
  }

  async findAllOpportunities(companyId: string): Promise<Opportunity[]> {
    return this.opportunityRepository.find({
      where: { companyId },
      relations: ['contact', 'stage', 'tags', 'company'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOpportunityById(id: string, companyId: string): Promise<Opportunity> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { id, companyId },
      relations: ['contact', 'stage', 'tags', 'company'],
    });

    if (!opportunity) {
      throw new NotFoundException('Opportunité non trouvée');
    }

    return opportunity;
  }

  async updateOpportunity(
    id: string,
    updateOpportunityDto: UpdateOpportunityDto,
    companyId: string,
  ): Promise<Opportunity> {
    this.logger.log(`Mise à jour opportunité ${id} pour société ${companyId}`);

    const opportunity = await this.findOpportunityById(id, companyId);

    // Vérifier l'étape du pipeline si modifiée
    if (updateOpportunityDto.pipelineStageId && updateOpportunityDto.pipelineStageId !== opportunity.pipelineStageId) {
      const stage = await this.pipelineStageRepository.findOne({
        where: { id: updateOpportunityDto.pipelineStageId },
      });
      if (!stage) {
        throw new BadRequestException('Étape du pipeline non trouvée');
      }
    }

    // Mettre à jour les champs
    Object.assign(opportunity, updateOpportunityDto);
    opportunity.updatedAt = new Date();

    // Mettre à jour les tags
    if (updateOpportunityDto.tagIds) {
      opportunity.tags = await this.tagRepository.find({
        where: { id: In(updateOpportunityDto.tagIds) },
      });
    }

    return this.opportunityRepository.save(opportunity);
  }

  async deleteOpportunity(id: string, companyId: string): Promise<void> {
    this.logger.log(`Suppression opportunité ${id} pour société ${companyId}`);

    const opportunity = await this.findOpportunityById(id, companyId);
    await this.opportunityRepository.remove(opportunity);

    // Mettre à jour les statistiques du contact
    if (opportunity.contactId) {
      await this.updateContactStats(opportunity.contactId);
    }
  }

  async moveOpportunityToStage(
    opportunityId: string,
    newStageId: string,
    companyId: string,
  ): Promise<Opportunity> {
    this.logger.log(`Déplacement opportunité ${opportunityId} vers étape ${newStageId}`);

    const opportunity = await this.findOpportunityById(opportunityId, companyId);

    const newStage = await this.pipelineStageRepository.findOne({
      where: { id: newStageId, companyId },
    });

    if (!newStage) {
      throw new BadRequestException('Étape du pipeline non trouvée');
    }

    opportunity.pipelineStageId = newStageId;
    opportunity.probability = newStage.probability;
    opportunity.updatedAt = new Date();

    return this.opportunityRepository.save(opportunity);
  }

  async updateOpportunityStatus(
    opportunityId: string,
    status: OpportunityStatus,
    companyId: string,
  ): Promise<Opportunity> {
    this.logger.log(`Changement statut opportunité ${opportunityId} vers ${status}`);

    const opportunity = await this.findOpportunityById(opportunityId, companyId);

    opportunity.status = status;
    opportunity.updatedAt = new Date();

    // Si gagnée ou perdue, définir la date de clôture
    if (status === OpportunityStatus.WON || status === OpportunityStatus.LOST) {
      opportunity.closeDate = new Date();
    }

    return this.opportunityRepository.save(opportunity);
  }

  async getPipelineOverview(companyId: string): Promise<{
    stages: PipelineStage[];
    opportunitiesByStage: Record<string, Opportunity[]>;
    totalValue: number;
    averageDealSize: number;
    conversionRate: number;
  }> {
    // Récupérer toutes les étapes du pipeline
    const stages = await this.pipelineStageRepository.find({
      where: { companyId, isActive: true },
      order: { order: 'ASC' },
    });

    // Récupérer toutes les opportunités
    const opportunities = await this.opportunityRepository.find({
      where: { companyId },
      relations: ['stage', 'contact'],
    });

    // Grouper les opportunités par étape
    const opportunitiesByStage: Record<string, Opportunity[]> = {};
    stages.forEach(stage => {
      opportunitiesByStage[stage.id] = opportunities.filter(opp => opp.pipelineStageId === stage.id);
    });

    // Calculer les métriques
    const totalValue = opportunities
      .filter(opp => opp.status === OpportunityStatus.OPEN)
      .reduce((sum, opp) => sum + opp.amount, 0);

    const averageDealSize = opportunities.length > 0
      ? totalValue / opportunities.length
      : 0;

    const wonOpportunities = opportunities.filter(opp => opp.status === OpportunityStatus.WON);
    const conversionRate = opportunities.length > 0
      ? (wonOpportunities.length / opportunities.length) * 100
      : 0;

    return {
      stages,
      opportunitiesByStage,
      totalValue,
      averageDealSize,
      conversionRate,
    };
  }

  async getDefaultPipelineStages(companyId: string): Promise<PipelineStage[]> {
    const defaultStages = [
      { name: 'Lead', type: PipelineStageType.LEAD, order: 0, probability: 10 },
      { name: 'Qualifié', type: PipelineStageType.QUALIFIED, order: 1, probability: 25 },
      { name: 'Proposition', type: PipelineStageType.PROPOSAL, order: 2, probability: 50 },
      { name: 'Négociation', type: PipelineStageType.NEGOTIATION, order: 3, probability: 75 },
      { name: 'Clôture', type: PipelineStageType.CLOSING, order: 4, probability: 90 },
      { name: 'Gagné', type: PipelineStageType.WON, order: 5, probability: 100 },
      { name: 'Perdu', type: PipelineStageType.LOST, order: 6, probability: 0 },
    ];

    // Créer les étapes par défaut si elles n'existent pas
    for (const stageData of defaultStages) {
      const existingStage = await this.pipelineStageRepository.findOne({
        where: { companyId, type: stageData.type },
      });

      if (!existingStage) {
        const stage = this.pipelineStageRepository.create({
          ...stageData,
          companyId,
          isActive: stageData.type !== PipelineStageType.WON && stageData.type !== PipelineStageType.LOST,
        });
        await this.pipelineStageRepository.save(stage);
      }
    }

    return this.pipelineStageRepository.find({
      where: { companyId },
      order: { order: 'ASC' },
    });
  }

  async createPipelineStage(
    name: string,
    type: PipelineStageType,
    order: number,
    probability: number,
    companyId: string,
  ): Promise<PipelineStage> {
    const stage = this.pipelineStageRepository.create({
      name,
      type,
      order,
      probability,
      companyId,
    });

    return this.pipelineStageRepository.save(stage);
  }

  async updatePipelineStage(
    stageId: string,
    updates: Partial<PipelineStage>,
    companyId: string,
  ): Promise<PipelineStage> {
    const stage = await this.pipelineStageRepository.findOne({
      where: { id: stageId, companyId },
    });

    if (!stage) {
      throw new NotFoundException('Étape du pipeline non trouvée');
    }

    Object.assign(stage, updates);
    return this.pipelineStageRepository.save(stage);
  }

  async deletePipelineStage(stageId: string, companyId: string): Promise<void> {
    const stage = await this.pipelineStageRepository.findOne({
      where: { id: stageId, companyId },
      relations: ['opportunities'],
    });

    if (!stage) {
      throw new NotFoundException('Étape du pipeline non trouvée');
    }

    // Vérifier s'il y a des opportunités dans cette étape
    if (stage.opportunities && stage.opportunities.length > 0) {
      throw new BadRequestException('Impossible de supprimer une étape contenant des opportunités');
    }

    await this.pipelineStageRepository.remove(stage);
  }

  private async updateContactStats(contactId: string): Promise<void> {
    const opportunities = await this.opportunityRepository.find({
      where: { contactId },
    });

    const contact = await this.contactRepository.findOne({
      where: { id: contactId },
    });

    if (contact) {
      contact.opportunityCount = opportunities.length;
      contact.lifetimeValue = opportunities
        .filter(opp => opp.status === OpportunityStatus.WON)
        .reduce((sum, opp) => sum + opp.amount, 0);

      await this.contactRepository.save(contact);
    }
  }

  async getOpportunityStats(companyId: string): Promise<{
    total: number;
    byStatus: Record<OpportunityStatus, number>;
    totalValue: number;
    averageDealSize: number;
    conversionRate: number;
  }> {
    const opportunities = await this.opportunityRepository.find({
      where: { companyId },
    });

    const total = opportunities.length;

    const byStatus = opportunities.reduce((acc, opp) => {
      acc[opp.status] = (acc[opp.status] || 0) + 1;
      return acc;
    }, {} as Record<OpportunityStatus, number>);

    const totalValue = opportunities
      .filter(opp => opp.status === OpportunityStatus.OPEN)
      .reduce((sum, opp) => sum + opp.amount, 0);

    const averageDealSize = total > 0 ? totalValue / total : 0;

    const wonOpportunities = opportunities.filter(opp => opp.status === OpportunityStatus.WON);
    const conversionRate = total > 0 ? (wonOpportunities.length / total) * 100 : 0;

    return {
      total,
      byStatus,
      totalValue,
      averageDealSize,
      conversionRate,
    };
  }
}
