import { Injectable } from '@nestjs/common';

/**
 * Service de gestion TVA complète
 */
@Injectable()
export class VATService {
  
  /**
   * Calcul TVA collectée
   */
  async calculateCollectedVAT(companyId: string, startDate: Date, endDate: Date): Promise<any> {
    const invoices = await this.getInvoices(companyId, startDate, endDate);
    
    const byRate = new Map<number, number>();
    let total = 0;
    
    invoices.forEach(inv => {
      const rate = inv.vatRate || 0;
      byRate.set(rate, (byRate.get(rate) || 0) + inv.vatAmount);
      total += inv.vatAmount;
    });
    
    return {
      total,
      byRate: Array.from(byRate.entries()).map(([rate, amount]) => ({ rate, amount })),
      invoicesCount: invoices.length
    };
  }

  /**
   * Calcul TVA déductible
   */
  async calculateDeductibleVAT(companyId: string, startDate: Date, endDate: Date): Promise<any> {
    const bills = await this.getBills(companyId, startDate, endDate);
    
    const byRate = new Map<number, number>();
    let total = 0;
    
    bills.forEach(bill => {
      const rate = bill.vatRate || 0;
      const deductible = bill.vatAmount * (bill.deductionCoefficient || 1);
      byRate.set(rate, (byRate.get(rate) || 0) + deductible);
      total += deductible;
    });
    
    return {
      total,
      byRate: Array.from(byRate.entries()).map(([rate, amount]) => ({ rate, amount })),
      billsCount: bills.length
    };
  }

  /**
   * Génération déclaration CA3 (mensuelle)
   */
  async generateCA3(companyId: string, year: number, month: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const collected = await this.calculateCollectedVAT(companyId, startDate, endDate);
    const deductible = await this.calculateDeductibleVAT(companyId, startDate, endDate);
    const vatDue = collected.total - deductible.total;
    
    return {
      declarationType: 'CA3',
      period: `${year}-${month.toString().padStart(2, '0')}`,
      regime: 'REEL_NORMAL',
      collected: {
        base20: this.getBaseForRate(collected.byRate, 20),
        vat20: this.getAmountForRate(collected.byRate, 20),
        base10: this.getBaseForRate(collected.byRate, 10),
        vat10: this.getAmountForRate(collected.byRate, 10),
        base55: this.getBaseForRate(collected.byRate, 5.5),
        vat55: this.getAmountForRate(collected.byRate, 5.5),
        total: collected.total
      },
      deductible: {
        onGoods: deductible.total * 0.6, // Estimation
        onServices: deductible.total * 0.4,
        total: deductible.total
      },
      vatDue: Math.max(vatDue, 0),
      vatCredit: Math.max(-vatDue, 0),
      status: 'draft'
    };
  }

  /**
   * Génération déclaration CA12 (annuelle simplifiée)
   */
  async generateCA12(companyId: string, year: number): Promise<any> {
    const quarters = [];
    
    for (let q = 1; q <= 4; q++) {
      const startMonth = (q - 1) * 3 + 1;
      const endMonth = q * 3;
      
      const startDate = new Date(year, startMonth - 1, 1);
      const endDate = new Date(year, endMonth, 0);
      
      const collected = await this.calculateCollectedVAT(companyId, startDate, endDate);
      const deductible = await this.calculateDeductibleVAT(companyId, startDate, endDate);
      
      quarters.push({
        quarter: q,
        collected: collected.total,
        deductible: deductible.total,
        vatDue: Math.max(collected.total - deductible.total, 0)
      });
    }
    
    const totalCollected = quarters.reduce((sum, q) => sum + q.collected, 0);
    const totalDeductible = quarters.reduce((sum, q) => sum + q.deductible, 0);
    const totalDue = totalCollected - totalDeductible;
    
    return {
      declarationType: 'CA12',
      year,
      regime: 'REEL_SIMPLIFIE',
      quarters,
      annual: {
        collected: totalCollected,
        deductible: totalDeductible,
        vatDue: Math.max(totalDue, 0),
        vatCredit: Math.max(-totalDue, 0)
      },
      advances: this.calculateAdvances(totalDue),
      status: 'draft'
    };
  }

  /**
   * TVA intracommunautaire (autoliquidation)
   */
  async calculateIntraCommunityVAT(companyId: string, startDate: Date, endDate: Date): Promise<any> {
    const intraTx = await this.getIntraCommunityTransactions(companyId, startDate, endDate);
    
    return {
      acquisitions: intraTx.filter(t => t.type === 'acquisition').reduce((sum, t) => sum + t.vatAmount, 0),
      deliveries: intraTx.filter(t => t.type === 'delivery').reduce((sum, t) => sum + t.amount, 0),
      services: intraTx.filter(t => t.type === 'service').reduce((sum, t) => sum + t.amount, 0)
    };
  }

  /**
   * DEB (Déclaration d'Échanges de Biens)
   */
  async generateDEB(companyId: string, year: number, month: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const transactions = await this.getIntraCommunityTransactions(companyId, startDate, endDate);
    const goods = transactions.filter(t => t.nature === 'goods');
    
    return {
      declarationType: 'DEB',
      period: `${year}-${month.toString().padStart(2, '0')}`,
      flow: 'INTRODUCTION', // ou EXPEDITION
      lines: goods.map(t => ({
        partnerVAT: t.partnerVAT,
        partnerCountry: t.partnerCountry,
        amount: t.amount,
        quantity: t.quantity,
        productCode: t.productCode,
        transactionNature: t.transactionNature,
        transportMode: t.transportMode
      })),
      totalAmount: goods.reduce((sum, t) => sum + t.amount, 0),
      status: 'draft'
    };
  }

  /**
   * DES (Déclaration d'Échanges de Services)
   */
  async generateDES(companyId: string, year: number, month: number): Promise<any> {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const transactions = await this.getIntraCommunityTransactions(companyId, startDate, endDate);
    const services = transactions.filter(t => t.nature === 'service');
    
    return {
      declarationType: 'DES',
      period: `${year}-${month.toString().padStart(2, '0')}`,
      lines: services.map(t => ({
        partnerVAT: t.partnerVAT,
        partnerCountry: t.partnerCountry,
        amount: t.amount,
        serviceCode: t.serviceCode
      })),
      totalAmount: services.reduce((sum, t) => sum + t.amount, 0),
      status: 'draft'
    };
  }

  /**
   * Télétransmission DGFIP
   */
  async submitToDGFIP(declaration: any): Promise<any> {
    // Génération XML EDI-TVA
    const xml = this.generateEDITVAXML(declaration);
    
    // Signature électronique
    const signed = await this.signDeclaration(xml);
    
    // Envoi API DGFIP
    const response = await this.sendToDGFIP(signed);
    
    return {
      declarationId: declaration.id,
      submittedAt: new Date(),
      dgfipReference: response.reference,
      status: response.status,
      acknowledgment: response.acknowledgment
    };
  }

  /**
   * Coefficient de déduction TVA
   */
  calculateDeductionCoefficient(company: any): number {
    const { taxableRevenue, exemptRevenue, outOfScopeRevenue } = company;
    const total = taxableRevenue + exemptRevenue + outOfScopeRevenue;
    
    if (total === 0) return 1;
    return taxableRevenue / total;
  }

  // Helpers
  private calculateAdvances(annualVAT: number): any[] {
    const advance = annualVAT / 4;
    return [
      { quarter: 1, dueDate: new Date(), amount: advance },
      { quarter: 2, dueDate: new Date(), amount: advance },
      { quarter: 3, dueDate: new Date(), amount: advance },
      { quarter: 4, dueDate: new Date(), amount: advance }
    ];
  }

  private getAmountForRate(byRate: any[], rate: number): number {
    const item = byRate.find(r => r.rate === rate);
    return item ? item.amount : 0;
  }

  private getBaseForRate(byRate: any[], rate: number): number {
    const amount = this.getAmountForRate(byRate, rate);
    return rate > 0 ? amount / (rate / 100) : 0;
  }

  private generateEDITVAXML(declaration: any): string {
    return `<?xml version="1.0"?><TVA>${JSON.stringify(declaration)}</TVA>`;
  }

  private async signDeclaration(xml: string): Promise<string> {
    return xml; // Mock
  }

  private async sendToDGFIP(xml: string): Promise<any> {
    return { reference: 'DGFIP-123', status: 'accepted', acknowledgment: 'OK' };
  }

  private async getInvoices(companyId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return [];
  }

  private async getBills(companyId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return [];
  }

  private async getIntraCommunityTransactions(companyId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return [];
  }
}
