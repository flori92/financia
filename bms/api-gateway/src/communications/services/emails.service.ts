import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Email } from '../entities/email.entity';
import { SendEmailDto } from '../dto/send-email.dto';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);

  constructor(
    @InjectRepository(Email)
    private emailRepository: Repository<Email>,
    private readonly notificationsService: NotificationsService,
    private readonly configService: ConfigService,
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
      from: emailData.from || this.configService.get<string>('RESEND_FROM_EMAIL') || 'noreply@bms.erp',
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

    const sent = await this.notificationsService.sendEmail({
      to: emailData.to,
      subject: emailData.subject,
      message: emailData.body,
      data: {
        cc: emailData.cc,
        bcc: emailData.bcc,
        from: emailData.from,
      },
    });

    if (sent) {
      savedEmail.status = 'sent';
      savedEmail.sentAt = new Date();
      await this.emailRepository.save(savedEmail);
    } else {
      savedEmail.status = 'failed';
      await this.emailRepository.save(savedEmail);
    }

    return savedEmail;
  }
}