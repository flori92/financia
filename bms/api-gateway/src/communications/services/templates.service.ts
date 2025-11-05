import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunicationTemplate } from '../entities/template.entity';
import { CreateTemplateDto, UpdateTemplateDto } from '../dto/create-template.dto';

@Injectable()
export class TemplatesService {
  private readonly logger = new Logger(TemplatesService.name);

  constructor(
    @InjectRepository(CommunicationTemplate)
    private templateRepository: Repository<CommunicationTemplate>,
  ) {}

  async findAll(companyId: string, type?: string): Promise<CommunicationTemplate[]> {
    const query = this.templateRepository
      .createQueryBuilder('template')
      .where('template.companyId = :companyId', { companyId })
      .andWhere('template.isActive = :isActive', { isActive: true })
      .orderBy('template.name', 'ASC');

    if (type) {
      query.andWhere('template.type = :type', { type });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<CommunicationTemplate> {
    return this.templateRepository.findOne({
      where: { id, companyId },
    });
  }

  async create(companyId: string, userId: string, templateData: CreateTemplateDto): Promise<CommunicationTemplate> {
    // Auto-extract variables from body if not provided
    const variables = templateData.variables || this.extractVariables(templateData.body);
    
    const template = this.templateRepository.create({
      companyId,
      name: templateData.name,
      type: templateData.type,
      category: templateData.category,
      subject: templateData.subject,
      body: templateData.body,
      variables,
      isActive: templateData.isActive !== undefined ? templateData.isActive : true,
      createdBy: userId,
    });

    const savedTemplate = await this.templateRepository.save(template);
    
    this.logger.log(`Template created: ${templateData.name}`);
    
    return savedTemplate;
  }

  async update(companyId: string, id: string, templateData: UpdateTemplateDto): Promise<CommunicationTemplate> {
    const updateData: any = {};
    
    if (templateData.name !== undefined) updateData.name = templateData.name;
    if (templateData.subject !== undefined) updateData.subject = templateData.subject;
    if (templateData.body !== undefined) {
      updateData.body = templateData.body;
      // Auto-extract variables if body is updated
      updateData.variables = templateData.variables || this.extractVariables(templateData.body);
    }
    if (templateData.variables !== undefined) updateData.variables = templateData.variables;
    if (templateData.isActive !== undefined) updateData.isActive = templateData.isActive;

    await this.templateRepository.update({ id, companyId }, updateData);

    return this.findOne(companyId, id);
  }

  async delete(companyId: string, id: string): Promise<void> {
    await this.templateRepository.update(
      { id, companyId },
      { isActive: false }
    );
  }

  /**
   * Remplacer les variables dans un template
   */
  replaceVariables(template: string, variables: Record<string, any>): string {
    let result = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, String(value));
    });
    
    return result;
  }

  /**
   * Extraire les variables d'un template
   */
  extractVariables(template: string): string[] {
    const regex = /{{([^}]+)}}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = regex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  }
}
