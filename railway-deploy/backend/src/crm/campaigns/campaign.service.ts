import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign } from './campaign.entity';
import { Contact } from '../entities/contact.entity';

@Injectable()
export class CampaignService {
  constructor(
    @InjectRepository(Campaign) private campaignRepo: Repository<Campaign>,
    @InjectRepository(Contact) private contactRepo: Repository<Contact>,
  ) {}

  async create(data: any) {
    const campaign = this.campaignRepo.create(data);
    return this.campaignRepo.save(campaign);
  }

  async execute(campaignId: string) {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    if (!campaign) throw new Error('Campagne introuvable');

    campaign.status = 'running';
    await this.campaignRepo.save(campaign);

    const contacts = await this.contactRepo.findByIds(campaign.targetContactIds);
    
    for (const contact of contacts) {
      await this.sendMessage(contact, campaign);
      campaign.sentCount++;
    }

    campaign.status = 'completed';
    return this.campaignRepo.save(campaign);
  }

  private async sendMessage(contact: Contact, campaign: Campaign) {
    // Simulation envoi
    console.log(`Envoi ${campaign.type} à ${contact.email}: ${campaign.content}`);
  }

  async getStats(campaignId: string) {
    const campaign = await this.campaignRepo.findOne({ where: { id: campaignId } });
    return {
      sent: campaign.sentCount,
      opened: campaign.openedCount,
      clicked: campaign.clickedCount,
      openRate: campaign.sentCount > 0 ? (campaign.openedCount / campaign.sentCount) * 100 : 0,
      clickRate: campaign.sentCount > 0 ? (campaign.clickedCount / campaign.sentCount) * 100 : 0,
    };
  }
}
