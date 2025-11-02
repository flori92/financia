import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder';

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
    const root = create('rsm:CrossIndustryInvoice', {
      'xmlns:rsm': 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
      'xmlns:ram': 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
      'xmlns:udt': 'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100'
    });
    
    const exchangedDocumentContext = root.ele('rsm:ExchangedDocumentContext');
    const businessProcessSpecifiedDocumentContextParameter = exchangedDocumentContext.ele('ram:BusinessProcessSpecifiedDocumentContextParameter');
    businessProcessSpecifiedDocumentContextParameter.ele('ram:ID').txt('urn:fdc:peppol.europa.eu:2017:factur-x:1.0::2.1');
    
    const guidelineSpecifiedDocumentContextParameter = exchangedDocumentContext.ele('ram:GuidelineSpecifiedDocumentContextParameter');
    guidelineSpecifiedDocumentContextParameter.ele('ram:ID').txt('urn:cen.europa.eu:en16931:2017#compliant#urn:factur-x.europa.eu:1.0:1.0');
    
    const exchangedDocument = root.ele('rsm:ExchangedDocument');
    exchangedDocument.ele('ram:ID').txt(invoice.invoiceNumber || `INV-${Date.now()}`);
    exchangedDocument.ele('ram:TypeCode').txt('380');
    exchangedDocument.ele('ram:IssueDateTime').ele('udt:DateTimeString', { format: '102' }).txt(new Date().toISOString().split('T')[0]);
    exchangedDocument.ele('ram:IncludedNote').ele('ram:Content').txt(invoice.note || 'Facture BMS');
    
    const supplyChainTradeTransaction = root.ele('rsm:SupplyChainTradeTransaction');
    
    const applicableHeaderTradeAgreement = supplyChainTradeTransaction.ele('ram:ApplicableHeaderTradeAgreement');
    applicableHeaderTradeAgreement.ele('ram:BuyerReference').txt(invoice.buyerReference || '');
    
    const sellerTradeParty = applicableHeaderTradeAgreement.ele('ram:SellerTradeParty');
    sellerTradeParty.ele('ram:Name').txt(invoice.sellerName || 'BMS Entreprise');
    
    const buyerTradeParty = applicableHeaderTradeAgreement.ele('ram:BuyerTradeParty');
    buyerTradeParty.ele('ram:Name').txt(invoice.buyerName || 'Client');
    
    return root.end({ pretty: true });
  }

  /**
   * Formate une date au format YYYYMMDD
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0].replace(/-/g, '');
  }

  /**
   * Génère une facture Factur-X complète
   */
  generateFacturX(invoice: any): { xml: string; metadata: any } {
    const xml = this.generateXML(invoice);
    
    return {
      xml,
      metadata: {
        invoiceNumber: invoice.invoiceNumber || `INV-${Date.now()}`,
        issueDate: new Date().toISOString().split('T')[0],
        seller: invoice.sellerName || 'BMS Entreprise',
        buyer: invoice.buyerName || 'Client',
        format: 'Factur-X BASIC',
        profile: 'urn:cen.europa.eu:en16931:2017#compliant#urn:factur-x.europa.eu:1.0:1.0'
      }
    };
  }
}
