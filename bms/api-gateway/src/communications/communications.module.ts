import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';
import { EmailsService } from './services/emails.service';
import { SmsService } from './services/sms.service';
import { WhatsAppService } from './services/whatsapp.service';
import { TemplatesService } from './services/templates.service';
import { Email } from './entities/email.entity';
import { SMS } from './entities/sms.entity';
import { WhatsAppMessage } from './entities/whatsapp.entity';
import { CommunicationTemplate } from './entities/template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Email,
      SMS,
      WhatsAppMessage,
      CommunicationTemplate,
    ]),
  ],
  controllers: [CommunicationsController],
  providers: [
    CommunicationsService,
    EmailsService,
    SmsService,
    WhatsAppService,
    TemplatesService,
  ],
  exports: [
    CommunicationsService,
    EmailsService,
    SmsService,
    WhatsAppService,
    TemplatesService,
  ],
})
export class CommunicationsModule {}