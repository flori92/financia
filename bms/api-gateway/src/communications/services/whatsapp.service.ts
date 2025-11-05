import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhatsAppMessage } from '../entities/whatsapp.entity';
import { SendWhatsAppDto } from '../dto/send-whatsapp.dto';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    @InjectRepository(WhatsAppMessage)
    private whatsAppRepository: Repository<WhatsAppMessage>,
  ) {}

  async findAll(companyId: string): Promise<any[]> {
    const messages = await this.whatsAppRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });

    // Group by conversation
    const conversations = this.groupByConversation(messages);
    return conversations;
  }

  async findOne(companyId: string, id: string): Promise<WhatsAppMessage> {
    return this.whatsAppRepository.findOne({
      where: { id, companyId },
    });
  }

  async sendMessage(companyId: string, userId: string, whatsAppData: SendWhatsAppDto): Promise<WhatsAppMessage> {
    const message = this.whatsAppRepository.create({
      companyId,
      conversationId: whatsAppData.conversationId || this.generateConversationId(whatsAppData.to),
      to: whatsAppData.to,
      from: whatsAppData.from || process.env.WHATSAPP_FROM || 'BMS',
      message: whatsAppData.message,
      type: whatsAppData.type || 'text',
      direction: 'outbound',
      status: 'pending',
      mediaUrl: whatsAppData.mediaUrl,
      createdBy: userId,
    });

    const savedMessage = await this.whatsAppRepository.save(message);
    
    // TODO: Implement actual WhatsApp sending with configured provider (Twilio, Meta, etc.)
    // For now, just log and mark as sent
    this.logger.log(`WhatsApp message queued to ${whatsAppData.to}`);
    
    // Update status to sent (in production, this would be done by the WhatsApp provider callback)
    savedMessage.status = 'sent';
    savedMessage.sentAt = new Date();
    await this.whatsAppRepository.save(savedMessage);
    
    return savedMessage;
  }

  private generateConversationId(phoneNumber: string): string {
    return `conv_${phoneNumber.replace(/[^0-9]/g, '')}`;
  }

  private groupByConversation(messages: WhatsAppMessage[]): any[] {
    const grouped = new Map();

    messages.forEach(msg => {
      if (!grouped.has(msg.conversationId)) {
        grouped.set(msg.conversationId, {
          id: msg.conversationId,
          contact: msg.to,
          lastMessage: msg.message,
          lastMessageTime: msg.createdAt,
          unreadCount: msg.direction === 'inbound' && !msg.readAt ? 1 : 0,
          messages: [],
        });
      }
      const conv = grouped.get(msg.conversationId);
      conv.messages.push(msg);
      
      // Update last message if this one is newer
      if (new Date(msg.createdAt) > new Date(conv.lastMessageTime)) {
        conv.lastMessage = msg.message;
        conv.lastMessageTime = msg.createdAt;
      }
      
      // Count unread messages
      if (msg.direction === 'inbound' && !msg.readAt) {
        conv.unreadCount++;
      }
    });

    return Array.from(grouped.values());
  }
}
