import { Injectable } from '@nestjs/common';
import { Invoice } from '../entities/invoice.entity';

@Injectable()
export class FacturXService {
  async generateFacturX(invoice: Invoice): Promise<{ pdf: Buffer; xml: string }> {
    const xml = this.generateXML(invoice);
    const pdf = await this.generatePDFA3(invoice, xml);
    return { pdf, xml };
  }

  private generateXML(invoice: Invoice): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100">
  <rsm:ExchangedDocumentContext>
    <ram:GuidelineSpecifiedDocumentContextParameter>
      <ram:ID>urn:cen.eu:en16931:2017</ram:ID>
    </ram:GuidelineSpecifiedDocumentContextParameter>
  </rsm:ExchangedDocumentContext>
  <rsm:ExchangedDocument>
    <ram:ID>${invoice.invoiceNumber}</ram:ID>
    <ram:TypeCode>380</ram:TypeCode>
    <ram:IssueDateTime>
      <udt:DateTimeString format="102">${this.formatDate(invoice.invoiceDate)}</udt:DateTimeString>
    </ram:IssueDateTime>
  </rsm:ExchangedDocument>
  <rsm:SupplyChainTradeTransaction>
    <ram:ApplicableHeaderTradeSettlement>
      <ram:InvoiceCurrencyCode>XOF</ram:InvoiceCurrencyCode>
      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>
        <ram:TaxBasisTotalAmount>${invoice.subtotal}</ram:TaxBasisTotalAmount>
        <ram:TaxTotalAmount>${invoice.taxAmount}</ram:TaxTotalAmount>
        <ram:GrandTotalAmount>${invoice.totalAmount}</ram:GrandTotalAmount>
      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>
    </ram:ApplicableHeaderTradeSettlement>
  </rsm:SupplyChainTradeTransaction>
</rsm:CrossIndustryInvoice>`;
  }

  private async generatePDFA3(invoice: Invoice, xml: string): Promise<Buffer> {
    // Génération PDF/A-3 avec XML embarqué
    return Buffer.from('PDF placeholder');
  }

  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().slice(0, 10).replace(/-/g, '');
  }
}
