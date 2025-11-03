import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Contact)
    private contactRepository: Repository<Contact>,
  ) {}

  async createContact(createContactDto: CreateContactDto, companyId: string): Promise<Contact> {
    const contact = this.contactRepository.create({
      ...createContactDto,
      companyId,
    });
    return await this.contactRepository.save(contact);
  }

  async findAllContacts(companyId: string, options: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
    status?: string;
  } = {}): Promise<{ contacts: Contact[]; total: number }> {
    const { page = 1, limit = 20, search, type, status } = options;
    
    const queryBuilder = this.contactRepository
      .createQueryBuilder('contact')
      .where('contact.companyId = :companyId', { companyId });

    if (search) {
      queryBuilder.andWhere(
        '(contact.firstName ILIKE :search OR contact.lastName ILIKE :search OR contact.companyName ILIKE :search OR contact.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (type) {
      queryBuilder.andWhere('contact.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('contact.status = :status', { status });
    }

    const [contacts, total] = await queryBuilder
      .orderBy('contact.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { contacts, total };
  }

  async findContactById(id: string, companyId: string): Promise<Contact> {
    return await this.contactRepository.findOne({
      where: { id, companyId },
    });
  }

  async updateContact(id: string, updateData: Partial<Contact>, companyId: string): Promise<Contact> {
    await this.contactRepository.update({ id, companyId }, updateData);
    return await this.findContactById(id, companyId);
  }

  async deleteContact(id: string, companyId: string): Promise<void> {
    await this.contactRepository.update({ id, companyId }, { status: 'archived' });
  }

  async getContactsStats(companyId: string): Promise<{
    total: number;
    clients: number;
    prospects: number;
    suppliers: number;
    partners: number;
  }> {
    const stats = await this.contactRepository
      .createQueryBuilder('contact')
      .select('contact.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('contact.companyId = :companyId', { companyId })
      .andWhere('contact.status != :status', { status: 'archived' })
      .groupBy('contact.type')
      .getRawMany();

    const result = {
      total: 0,
      clients: 0,
      prospects: 0,
      suppliers: 0,
      partners: 0,
    };

    stats.forEach(stat => {
      result[stat.type] = parseInt(stat.count);
      result.total += parseInt(stat.count);
    });

    return result;
  }
}
