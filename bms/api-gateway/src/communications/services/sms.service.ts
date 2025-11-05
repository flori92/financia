import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SMS } from '../entities/sms.entity';
import { SendSmsDto } from '../dto/send-sms.dto';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @InjectRepository(SMS)
    private smsRepository: Repository<SMS>,
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
      from: smsData.from || process.env.SMS_FROM || 'BMS',
      message: smsData.message,
      status: 'pending',
      createdBy: userId,
    });

    const savedSms = await this.smsRepository.save(sms);
    
    // TODO: Implement actual SMS sending with configured provider (Twilio, etc.)
    // For now, just log and mark as sent
    this.logger.log(`SMS queued to ${smsData.to}`);
    
    // Update status to sent (in production, this would be done by the SMS provider callback)
    savedSms.status = 'sent';
    savedSms.sentAt = new Date();
    await this.smsRepository.save(savedSms);
    
    return savedSms;
  }
}
