import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';

/**
 * Service de génération de factures électroniques Factur-X
 * Format: PDF/A-3 avec XML embarqué (norme EN 16931)
 */
@Injectable()
export class FacturXService {
  
  /**
   * Génère le XML Factur-X (profil BASIC)
   */
  generateXML(invoice: any): string {
    const xml = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('rsm:CrossIndustryInvoice', {
        'xmlns:rsm': 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
        'xmlns:ram': 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
        'xmlns:udt': 'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100'
      })
        .ele('rsm:ExchangedDocumentContext')
          .ele('ram:GuidelineSpecifiedDocumentContextParameter')
            .ele('ram:ID').txt('urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:basic').up()
          .up()
        .up()
        .ele('rsm:ExchangedDocument')
          .ele('ram:ID').txt(invoice.invoiceNumber).up()
          .ele('ram:TypeCode').txt('380').up() // 380 = Facture commerciale
          .ele('ram:IssueDateTime')
            .ele('udt:DateTimeString', { format: '102' })
              .txt(this.formatDate(invoice.invoiceDate))
            .up()
          .up()
        .up()
        .ele('rsm:SupplyChainTradeTransaction')
          // Vendeur
          .ele('ram:ApplicableHeaderTradeAgreement')
            .ele('ram:SellerTradeParty')
              .ele('ram:Name').txt(invoice.seller.name).up()
              .ele('ram:SpecifiedLegalOrganization')
                .ele('ram:ID').txt(invoice.seller.nif).up()
              .up()
              .ele('ram:PostalTradeAddress')
                .ele('ram:LineOne').txt(invoice.seller.address).up()
                .ele('ram:CountryID').txt(invoice.seller.country).up()
              .up()
            .up()
            // Acheteur
            .ele('ram:BuyerTradeParty')
              .ele('ram:Name').txt(invoice.customer.name).up()
              .ele('ram:PostalTradeAddress')
                .ele('ram:LineOne').txt(invoice.customer.address || '').up()
                .ele('ram:CountryID').txt(invoice.customer.country || 'BJ').up()
              .up()
            .up()
          .up()
          // Livraison
          .ele('ram:ApplicableHeaderTradeDelivery')
            .ele('ram:ActualDeliverySupplyChainEvent')
              .ele('ram:OccurrenceDateTime')
                .ele('udt:DateTimeString', { format: '102' })
                  .txt(this.formatDate(invoice.invoiceDate))
                .up()
              .up()
            .up()
          .up()
          // Règlement
          .ele('ram:ApplicableHeaderTradeSettlement')
            .ele('ram:InvoiceCurrencyCode').txt(invoice.currency || 'XOF').up()
            .ele('ram:SpecifiedTradeSettlementHeaderMonetarySummation')
              .ele('ram:LineTotalAmount').txt(invoice.subtotal.toFixed(2)).up()
              .ele('ram:TaxBasisTotalAmount').txt(invoice.subtotal.toFixed(2)).up()
              .ele('ram:TaxTotalAmount', { currencyID: invoice.currency || 'XOF' })
                .txt(invoice.vatAmount.toFixed(2))
              .up()
              .ele('ram:GrandTotalAmount').txt(invoice.totalAmount.toFixed(2)).up()
              .ele('ram:DuePayableAmount').txt(invoice.totalAmount.toFixed(2)).up()
            .up()
          .up()
        .up()
      .end({ prettyPrint: true });

    return xml;
  }

  /**
   * Génère les métadonnées PDF/A-3
   */
  generatePDFMetadata(invoice: any): any {
    return {
      title: `Facture ${invoice.invoiceNumber}`,
      author: invoice.seller.name,
      subject: `Facture électronique conforme Factur-X`,
      keywords: 'Facture, Factur-X, EN16931',
      creator: 'BMS ERP',
      producer: 'BMS ERP v1.0',
      creationDate: new Date(),
      modificationDate: new Date(),
      pdfaConformance: 'PDF/A-3B',
      attachments: [
        {
          name: 'factur-x.xml',
          description: 'Facture électronique Factur-X',
          mimeType: 'text/xml',
          relationship: 'Data',
          afRelationship: 'Data'
        }
      ]
    };
  }

  /**
   * Valide une facture Factur-X
   */
  validate(xml: string): { valid: boolean; errors: string[] } {
    const errors = [];

    // Vérifications basiques
    if (!xml.includes('CrossIndustryInvoice')) {
      errors.push('Structure XML invalide');
    }

    if (!xml.includes('urn:factur-x.eu:1p0:basic')) {
      errors.push('Profil Factur-X manquant');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Extrait les données d'un XML Factur-X
   */
  parseXML(xml: string): any {
    // Parsing simplifié - utiliser xml2js en production
    const invoiceNumber = this.extractValue(xml, '<ram:ID>', '</ram:ID>');
    const totalAmount = this.extractValue(xml, '<ram:GrandTotalAmount>', '</ram:GrandTotalAmount>');
    
    return {
      invoiceNumber,
      totalAmount: parseFloat(totalAmount || '0'),
      format: 'Factur-X'
    };
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0].replace(/-/g, '');
  }

  private extractValue(xml: string, startTag: string, endTag: string): string {
    const start = xml.indexOf(startTag);
    const end = xml.indexOf(endTag);
    if (start === -1 || end === -1) return '';
    return xml.substring(start + startTag.length, end).trim();
  }
}
