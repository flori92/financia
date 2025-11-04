import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';

/**
 * Service d'accompagnement à la formalisation des entrepreneurs
 * Spécifique au contexte béninois (NIF, IFU, RCCM)
 */
@Injectable()
export class FormalizationService {
  private readonly logger = new Logger(FormalizationService.name);

  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
  ) {}

  /**
   * Vérifier le statut de formalisation d'un contact
   */
  async checkFormalizationStatus(contactId: string, companyId: string): Promise<{
    isFormal: boolean;
    hasNIF: boolean;
    hasRCCM: boolean;
    hasVAT: boolean;
    completionRate: number;
    missingSteps: string[];
  }> {
    const contact = await this.contactRepo.findOne({
      where: { id: contactId, companyId },
    });

    if (!contact) {
      throw new Error('Contact non trouvé');
    }

    const hasNIF = !!contact.taxId;
    const hasRCCM = !!contact.customFields?.rccm;
    const hasVAT = !!contact.vatNumber;

    const steps = [
      { key: 'companyName', label: 'Nom de l\'entreprise', done: !!contact.companyName },
      { key: 'address', label: 'Adresse complète', done: !!contact.addressLine1 && !!contact.city },
      { key: 'phone', label: 'Téléphone', done: !!contact.phone || !!contact.mobile },
      { key: 'nif', label: 'NIF (Numéro d\'Identification Fiscale)', done: hasNIF },
      { key: 'rccm', label: 'RCCM (Registre du Commerce)', done: hasRCCM },
      { key: 'vat', label: 'TVA (si applicable)', done: hasVAT },
    ];

    const completedSteps = steps.filter(s => s.done).length;
    const completionRate = Math.round((completedSteps / steps.length) * 100);
    const missingSteps = steps.filter(s => !s.done).map(s => s.label);

    const isFormal = hasNIF && hasRCCM;

    return {
      isFormal,
      hasNIF,
      hasRCCM,
      hasVAT,
      completionRate,
      missingSteps,
    };
  }

  /**
   * Valider un NIF béninois
   * Format: 9 chiffres (exemple: 123456789)
   */
  validateNIF(nif: string): boolean {
    if (!nif) return false;
    const nifPattern = /^\d{9}$/;
    return nifPattern.test(nif.replace(/\s/g, ''));
  }

  /**
   * Enregistrer le NIF d'un contact
   */
  async registerNIF(contactId: string, companyId: string, nif: string): Promise<Contact> {
    if (!this.validateNIF(nif)) {
      throw new Error('Format NIF invalide. Le NIF doit contenir 9 chiffres.');
    }

    const contact = await this.contactRepo.findOne({
      where: { id: contactId, companyId },
    });

    if (!contact) {
      throw new Error('Contact non trouvé');
    }

    contact.taxId = nif;
    contact.updatedAt = new Date();

    this.logger.log(`NIF ${nif} enregistré pour le contact ${contactId}`);

    return this.contactRepo.save(contact);
  }

  /**
   * Enregistrer le RCCM d'un contact
   */
  async registerRCCM(contactId: string, companyId: string, rccm: string): Promise<Contact> {
    const contact = await this.contactRepo.findOne({
      where: { id: contactId, companyId },
    });

    if (!contact) {
      throw new Error('Contact non trouvé');
    }

    if (!contact.customFields) {
      contact.customFields = {};
    }

    contact.customFields.rccm = rccm;
    contact.customFields.rccmDate = new Date().toISOString();
    contact.updatedAt = new Date();

    this.logger.log(`RCCM ${rccm} enregistré pour le contact ${contactId}`);

    return this.contactRepo.save(contact);
  }

  /**
   * Obtenir les contacts non formalisés
   */
  async getInformalContacts(companyId: string): Promise<Contact[]> {
    const contacts = await this.contactRepo.find({
      where: { companyId },
    });

    return contacts.filter(contact => !contact.taxId);
  }

  /**
   * Générer un rapport de formalisation
   */
  async getFormalizationReport(companyId: string): Promise<{
    total: number;
    formal: number;
    informal: number;
    withNIF: number;
    withRCCM: number;
    withVAT: number;
    formalizationRate: number;
  }> {
    const contacts = await this.contactRepo.find({
      where: { companyId },
    });

    const total = contacts.length;
    const withNIF = contacts.filter(c => !!c.taxId).length;
    const withRCCM = contacts.filter(c => !!c.customFields?.rccm).length;
    const withVAT = contacts.filter(c => !!c.vatNumber).length;
    const formal = contacts.filter(c => c.taxId && c.customFields?.rccm).length;
    const informal = total - formal;
    const formalizationRate = total > 0 ? Math.round((formal / total) * 100) : 0;

    return {
      total,
      formal,
      informal,
      withNIF,
      withRCCM,
      withVAT,
      formalizationRate,
    };
  }
}
