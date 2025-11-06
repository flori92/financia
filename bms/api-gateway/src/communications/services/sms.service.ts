import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SMS } from '../entities/sms.entity';
import { SendSmsDto } from '../dto/send-sms.dto';
import { NotificationsService } from '../../notifications/notifications.service';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @InjectRepository(SMS)
    private smsRepository: Repository<SMS>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(companyId: string): Promise<SMS[]> {
    return this.smsRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<SMS> {
    return this.smsRepository.findOne({
      where: { id, companyId },
    });
  }

  async sendSms(companyId: string, userId: string, smsData: SendSmsDto): Promise<SMS> {
    const sms = this.smsRepository.create({
      companyId,
      to: smsData.to,
      from: smsData.from,
      message: smsData.message,
      status: 'pending',
      createdBy: userId,
    });

    const savedSms = await this.smsRepository.save(sms);

    const sent = await this.notificationsService.sendSMS({
      to: smsData.to,
      message: smsData.message,
      data: {
        from: smsData.from,
      },
    });

    if (sent) {
      savedSms.status = 'sent';
      savedSms.providerName = 'africastalking';
      savedSms.sentAt = new Date();
    } else {
      savedSms.status = 'failed';
      savedSms.providerName = 'africastalking';
      savedSms.errorMessage = 'Africa\'s Talking sending failed';
    }

    await this.smsRepository.save(savedSms);

    return savedSms;
  }
}
