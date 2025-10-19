import { Injectable } from '@nestjs/common';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class ChorusProService {
  private readonly apiUrl = 'https://chorus-pro.gouv.fr/api';

  async sendToChorusPro(invoice: Invoice): Promise<{ status: string; trackingId: string }> {
    const payload = this.buildPayload(invoice);
    
    // Simulation envoi API Chorus Pro
    const response = {
      status: 'sent',
      trackingId: `CPF-${Date.now()}`,
      message: 'Facture transmise à Chorus Pro',
    };
    
    return response;
  }

  async getStatus(trackingId: string): Promise<{ status: string; details: string }> {
    // Simulation récupération statut
    return {
      status: 'accepted',
      details: 'Facture acceptée par Chorus Pro',
    };
  }

  private buildPayload(invoice: Invoice) {
    return {
      invoiceNumber: invoice.invoiceNumber,
      issueDate: invoice.invoiceDate,
      totalAmount: invoice.totalAmount,
      supplier: { name: invoice.partyName },
      buyer: { siret: 'SIRET_PUBLIC' },
    };
  }
}
