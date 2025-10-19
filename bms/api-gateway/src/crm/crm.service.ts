import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Contact, ContactType, ContactStatus } from './entities/contact.entity';
import { Tag } from './entities/tag.entity';
import { Activity } from './entities/activity.entity';
import { Opportunity } from './entities/opportunity.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { FilterContactsDto } from './dto/filter-contacts.dto';

@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Opportunity)
    private readonly opportunityRepository: Repository<Opportunity>,
  ) { }

  async createContact(createContactDto: CreateContactDto): Promise<Contact> {
    this.logger.log(`Création contact pour société ${createContactDto.companyId}`);

    // Vérifier si email existe déjà pour cette société
    if (createContactDto.email) {
      const existingContact = await this.contactRepository.findOne({
        where: {
          email: createContactDto.email,
          companyId: createContactDto.companyId,
        },
      });
      if (existingContact) {
        throw new BadRequestException('Un contact avec cet email existe déjà');
      }
    }

    // Créer le contact
    const contact = this.contactRepository.create(createContactDto);
    contact.createdAt = new Date();
    contact.updatedAt = new Date();

    // Associer les tags si fournis
    if (createContactDto.tagIds && createContactDto.tagIds.length > 0) {
      contact.tags = await this.tagRepository.find({
        where: { id: In(createContactDto.tagIds) },
      });
    }

    return this.contactRepository.save(contact);
  }

  async findAllContacts(filterDto: FilterContactsDto): Promise<{
    contacts: Contact[];
    total: number;
    page: number;
    limit: number;
  }> {
    this.logger.log(`Recherche contacts pour société ${filterDto.companyId}`);

    const query = this.contactRepository.createQueryBuilder('contact')
      .leftJoinAndSelect('contact.tags', 'tags')
      .leftJoinAndSelect('contact.assignedTo', 'assignedTo')
      .leftJoinAndSelect('contact.activities', 'activities')
      .where('contact.companyId = :companyId', { companyId: filterDto.companyId });

    // Filtres de recherche
    if (filterDto.search) {
      query.andWhere(
        '(contact.companyName ILIKE :search OR contact.firstName ILIKE :search OR contact.lastName ILIKE :search OR contact.email ILIKE :search)',
        { search: `%${filterDto.search}%` }
      );
    }

    if (filterDto.type) {
      query.andWhere('contact.type = :type', { type: filterDto.type });
    }

    if (filterDto.status) {
      query.andWhere('contact.status = :status', { status: filterDto.status });
    }

    if (filterDto.assignedToId) {
      query.andWhere('contact.assignedToId = :assignedToId', { assignedToId: filterDto.assignedToId });
    }

    if (filterDto.tagIds && filterDto.tagIds.length > 0) {
      query.innerJoin('contact.tags', 'contactTags', 'contactTags.id IN (:...tagIds)', { tagIds: filterDto.tagIds });
    }

    // Tri
    const sortBy = filterDto.sortBy || 'createdAt';
    const sortOrder = filterDto.sortOrder || 'DESC';
    query.orderBy(`contact.${sortBy}`, sortOrder);

    // Pagination
    const page = filterDto.page || 1;
    const limit = filterDto.limit || 20;
    const skip = (page - 1) * limit;

    query.skip(skip).take(limit);

    const [contacts, total] = await query.getManyAndCount();

    return {
      contacts,
      total,
      page,
      limit,
    };
  }

  async findContactById(id: string, companyId: string): Promise<Contact> {
    const contact = await this.contactRepository.findOne({
      where: { id, companyId },
      relations: ['tags', 'assignedTo', 'activities', 'opportunities'],
    });

    if (!contact) {
      throw new NotFoundException('Contact non trouvé');
    }

    return contact;
  }

  async updateContact(id: string, updateContactDto: UpdateContactDto, companyId: string): Promise<Contact> {
    this.logger.log(`Mise à jour contact ${id} pour société ${companyId}`);

    const contact = await this.findContactById(id, companyId);

    // Vérifier unicité email si modifié
    if (updateContactDto.email && updateContactDto.email !== contact.email) {
      const existingContact = await this.contactRepository.findOne({
        where: {
          email: updateContactDto.email,
          companyId,
          id: { $ne: id } as any, // TypeORM syntax for "not equal"
        },
      });
      if (existingContact) {
        throw new BadRequestException('Un contact avec cet email existe déjà');
      }
    }

    // Mettre à jour les champs
    Object.assign(contact, updateContactDto);
    contact.updatedAt = new Date();

    // Mettre à jour les tags
    if (updateContactDto.tagIds) {
      contact.tags = await this.tagRepository.find({
        where: { id: In(updateContactDto.tagIds) },
      });
    }

    return this.contactRepository.save(contact);
  }

  async deleteContact(id: string, companyId: string): Promise<void> {
    this.logger.log(`Suppression contact ${id} pour société ${companyId}`);

    const contact = await this.findContactById(id, companyId);
    await this.contactRepository.remove(contact);
  }

  async archiveContact(id: string, companyId: string): Promise<Contact> {
    this.logger.log(`Archivage contact ${id} pour société ${companyId}`);

    const contact = await this.findContactById(id, companyId);
    contact.status = ContactStatus.ARCHIVED;
    contact.isArchived = true;
    contact.updatedAt = new Date();

    return this.contactRepository.save(contact);
  }

  async mergeContacts(
    primaryContactId: string,
    secondaryContactIds: string[],
    companyId: string
  ): Promise<Contact> {
    this.logger.log(`Fusion contacts pour société ${companyId}`);

    // Récupérer les contacts à fusionner
    const primaryContact = await this.findContactById(primaryContactId, companyId);
    const secondaryContacts = await this.contactRepository.find({
      where: { id: In(secondaryContactIds), companyId },
      relations: ['tags', 'activities', 'opportunities'],
    });

    // Fusionner les données (priorité au contact principal)
    for (const secondary of secondaryContacts) {
      // Fusionner les tags
      if (secondary.tags) {
        const existingTagIds = primaryContact.tags.map(t => t.id);
        const newTags = secondary.tags.filter(t => !existingTagIds.includes(t.id));
        primaryContact.tags.push(...newTags);
      }

      // Transférer les opportunités
      if (secondary.opportunities) {
        for (const opp of secondary.opportunities) {
          opp.contactId = primaryContact.id;
          await this.opportunityRepository.save(opp);
        }
      }

      // Transférer les activités
      if (secondary.activities) {
        for (const activity of secondary.activities) {
          activity.contactId = primaryContact.id;
          await this.activityRepository.save(activity);
        }
      }

      // Supprimer le contact secondaire
      await this.contactRepository.remove(secondary);
    }

    // Recalculer les statistiques du contact principal
    await this.updateContactStats(primaryContact.id, companyId);

    return this.findContactById(primaryContact.id, companyId);
  }

  async updateContactStats(contactId: string, companyId: string): Promise<void> {
    const contact = await this.findContactById(contactId, companyId);

    // Compter les opportunités
    const opportunities = await this.opportunityRepository.find({
      where: { contactId: contact.id, companyId },
    });
    contact.opportunityCount = opportunities.length;

    // Compter les factures (via opportunités gagnées)
    const wonOpportunities = opportunities.filter(opp => opp.status === 'won');
    contact.invoiceCount = wonOpportunities.length;

    // Calculer la valeur vie client
    contact.lifetimeValue = wonOpportunities.reduce((sum, opp) => sum + opp.amount, 0);

    // Mettre à jour la dernière date de contact
    const lastActivity = await this.activityRepository.findOne({
      where: { contactId: contact.id },
      order: { createdAt: 'DESC' },
    });
    if (lastActivity) {
      contact.lastContactDate = lastActivity.createdAt;
    }

    await this.contactRepository.save(contact);
  }

  async getContactStats(companyId: string): Promise<{
    total: number;
    byType: Record<ContactType, number>;
    byStatus: Record<ContactStatus, number>;
    recentActivity: number;
  }> {
    const total = await this.contactRepository.count({ where: { companyId } });

    const byType = await this.contactRepository
      .createQueryBuilder('contact')
      .select('contact.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('contact.companyId = :companyId', { companyId })
      .groupBy('contact.type')
      .getRawMany();

    const byStatus = await this.contactRepository
      .createQueryBuilder('contact')
      .select('contact.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('contact.companyId = :companyId', { companyId })
      .groupBy('contact.status')
      .getRawMany();

    const recentActivity = await this.activityRepository.count({
      where: {
        companyId,
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } as any,
      },
    });

    return {
      total,
      byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: parseInt(item.count) }), {} as Record<ContactType, number>),
      byStatus: byStatus.reduce((acc, item) => ({ ...acc, [item.status]: parseInt(item.count) }), {} as Record<ContactStatus, number>),
      recentActivity,
    };
  }

  // Méthodes pour les tags
  async createTag(name: string, companyId: string, color?: string): Promise<Tag> {
    const tag = this.tagRepository.create({
      name,
      color,
      companyId,
    });

    return this.tagRepository.save(tag);
  }

  async findAllTags(companyId: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { companyId },
      order: { name: 'ASC' },
    });
  }
}
