import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Intégration Chorus Pro pour facturation B2G (secteur public)
 */
@Injectable()
export class ChorusProService {
  private readonly baseUrl = 'https://chorus-pro.gouv.fr/api/v1';
  private accessToken: string;

  constructor(private configService: ConfigService) {}

  /**
   * Authentification OAuth2
   */
  async authenticate(): Promise<void> {
    const clientId = this.configService.get('CHORUS_PRO_CLIENT_ID');
    const clientSecret = this.configService.get('CHORUS_PRO_CLIENT_SECRET');

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'invoice:write'
      })
    });

    if (!response.ok) {
      throw new HttpException('Chorus Pro auth failed', 401);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  /**
   * Soumettre une facture
   */
  async submitInvoice(invoice: any, facturxXml: string): Promise<string> {
    await this.ensureAuthenticated();

    const payload = {
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        totalAmount: invoice.totalAmount,
        currency: invoice.currency || 'EUR',
        supplier: {
          siret: invoice.seller.siret,
          name: invoice.seller.name,
          address: invoice.seller.address
        },
        customer: {
          siret: invoice.customer.siret,
          serviceCode: invoice.customer.serviceCode // Code service destinataire
        }
      },
      attachments: [
        {
          name: 'facture.xml',
          content: Buffer.from(facturxXml).toString('base64'),
          mimeType: 'text/xml'
        }
      ]
    };

    const response = await fetch(`${this.baseUrl}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new HttpException(
        `Chorus Pro submission failed: ${error.message}`,
        response.status
      );
    }

    const data = await response.json();
    return data.invoiceId; // ID Chorus Pro
  }

  /**
   * Vérifier le statut d'une facture
   */
  async getInvoiceStatus(chorusInvoiceId: string): Promise<any> {
    await this.ensureAuthenticated();

    const response = await fetch(`${this.baseUrl}/invoices/${chorusInvoiceId}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });

    if (!response.ok) {
      throw new HttpException('Failed to get invoice status', response.status);
    }

    const data = await response.json();
    return {
      status: data.status, // DEPOSITED, VALIDATED, REJECTED, PAID
      statusDate: data.statusDate,
      rejectionReason: data.rejectionReason,
      paymentDate: data.paymentDate
    };
  }

  /**
   * Récupérer les rejets
   */
  async getRejections(): Promise<any[]> {
    await this.ensureAuthenticated();

    const response = await fetch(`${this.baseUrl}/invoices?status=REJECTED`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });

    if (!response.ok) {
      throw new HttpException('Failed to get rejections', response.status);
    }

    const data = await response.json();
    return data.invoices || [];
  }

  /**
   * Valider qu'un SIRET est éligible Chorus Pro
   */
  async validateSiret(siret: string): Promise<boolean> {
    await this.ensureAuthenticated();

    const response = await fetch(`${this.baseUrl}/recipients/${siret}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` }
    });

    return response.ok;
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken) {
      await this.authenticate();
    }
  }
}
