import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Email } from '../entities/email.entity';
import { SendEmailDto } from '../dto/send-email.dto';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);

  constructor(
    @InjectRepository(Email)
    private emailRepository: Repository<Email>,
  ) {}

  async findAll(companyId: string, folder?: string): Promise<Email[]> {
    const query = this.emailRepository
      .createQueryBuilder('email')
      .where('email.companyId = :companyId', { companyId })
      .orderBy('email.createdAt', 'DESC');

    if (folder) {
      query.andWhere('email.folder = :folder', { folder });
    }

    return query.getMany();
  }

  async findOne(companyId: string, id: string): Promise<Email> {
    return this.emailRepository.findOne({
      where: { id, companyId },
    });
  }

  async sendEmail(companyId: string, userId: string, emailData: SendEmailDto): Promise<Email> {
    const email = this.emailRepository.create({
      companyId,
      from: emailData.from || process.env.SMTP_FROM || 'noreply@bms.com',
      to: emailData.to,
      cc: emailData.cc,
      bcc: emailData.bcc,
      subject: emailData.subject,
      body: emailData.body,
      folder: 'sent',
      status: 'pending',
      createdBy: userId,
    });

    const savedEmail = await this.emailRepository.save(email);
    
    // TODO: Implement actual email sending with configured provider
    // For now, just log and mark as sent
    this.logger.log(`Email queued: ${emailData.subject} to ${emailData.to}`);
    
    // Update status to sent (in production, this would be done by the email provider callback)
    savedEmail.status = 'sent';
    savedEmail.sentAt = new Date();
    await this.emailRepository.save(savedEmail);
    
    return savedEmail;
  }
}