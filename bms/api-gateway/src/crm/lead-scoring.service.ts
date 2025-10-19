import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';
import { Activity } from './entities/activity.entity';
import { Opportunity } from './entities/opportunity.entity';

/**
 * Service de scoring des leads adapté au contexte béninois
 * Critères : engagement, formalisation, activité commerciale
 */
@Injectable()
export class LeadScoringService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
    @InjectRepository(Activity)
    private activityRepo: Repository<Activity>,
    @InjectRepository(Opportunity)
    private opportunityRepo: Repository<Opportunity>,
  ) {}

  async calculateScore(contactId: string, companyId: string): Promise<number> {
    const contact = await this.contactRepo.findOne({
      where: { id: contactId, companyId },
      relations: ['activities', 'opportunities'],
    });

    if (!contact) return 0;

    let score = 0;

    // 1. Informations de base (20 points max)
    if (contact.email) score += 5;
    if (contact.phone || contact.mobile) score += 5;
    if (contact.companyName) score += 5;
    if (contact.taxId) score += 5; // NIF au Bénin

    // 2. Formalisation (25 points max) - IMPORTANT pour le Bénin
    if (contact.taxId) score += 15; // A un NIF
    if (contact.vatNumber) score += 10; // Enregistré à la TVA

    // 3. Engagement récent (25 points max)
    const recentActivities = await this.activityRepo.count({
      where: {
        contactId: contact.id,
        companyId,
      },
    });
    score += Math.min(recentActivities * 2, 25);

    // 4. Opportunités (20 points max)
    const opportunities = await this.opportunityRepo.find({
      where: { contactId: contact.id, companyId },
    });
    score += Math.min(opportunities.length * 5, 20);

    // 5. Valeur commerciale (10 points max)
    if (contact.lifetimeValue > 0) {
      if (contact.lifetimeValue > 1000000) score += 10; // > 1M FCFA
      else if (contact.lifetimeValue > 500000) score += 7;
      else if (contact.lifetimeValue > 100000) score += 5;
      else score += 3;
    }

    // Score final sur 100
    const finalScore = Math.min(Math.round(score), 100);

    // Mettre à jour le contact
    contact.leadScore = finalScore;
    await this.contactRepo.save(contact);

    return finalScore;
  }

  async calculateAllScores(companyId: string): Promise<void> {
    const contacts = await this.contactRepo.find({
      where: { companyId },
    });

    for (const contact of contacts) {
      await this.calculateScore(contact.id, companyId);
    }
  }

  async getHotLeads(companyId: string, minScore: number = 70): Promise<Contact[]> {
    return this.contactRepo
      .createQueryBuilder('contact')
      .where('contact.companyId = :companyId', { companyId })
      .andWhere('contact.leadScore >= :minScore', { minScore })
      .orderBy('contact.leadScore', 'DESC')
      .getMany();
  }

  getScoreCategory(score: number): string {
    if (score >= 80) return 'Très chaud';
    if (score >= 60) return 'Chaud';
    if (score >= 40) return 'Tiède';
    if (score >= 20) return 'Froid';
    return 'Très froid';
  }
}
