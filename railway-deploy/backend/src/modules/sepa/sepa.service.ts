import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';

/**
 * Service SEPA - Virements et Prélèvements
 */
@Injectable()
export class SEPAService {
  
  /**
   * Génère fichier virement SEPA (pain.001)
   */
  generateSEPATransfer(payments: any[], creditor: any): string {
    const msgId = `MSG-${Date.now()}`;
    const pmtInfId = `PMT-${Date.now()}`;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    
    const xml = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Document', {
        'xmlns': 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
      })
        .ele('CstmrCdtTrfInitn')
          .ele('GrpHdr')
            .ele('MsgId').txt(msgId).up()
            .ele('CreDtTm').txt(new Date().toISOString()).up()
            .ele('NbOfTxs').txt(payments.length.toString()).up()
            .ele('CtrlSum').txt(totalAmount.toFixed(2)).up()
            .ele('InitgPty')
              .ele('Nm').txt(creditor.name).up()
            .up()
          .up()
          .ele('PmtInf')
            .ele('PmtInfId').txt(pmtInfId).up()
            .ele('PmtMtd').txt('TRF').up()
            .ele('BtchBookg').txt('true').up()
            .ele('NbOfTxs').txt(payments.length.toString()).up()
            .ele('CtrlSum').txt(totalAmount.toFixed(2)).up()
            .ele('PmtTpInf')
              .ele('SvcLvl')
                .ele('Cd').txt('SEPA').up()
              .up()
            .up()
            .ele('ReqdExctnDt').txt(new Date().toISOString().split('T')[0]).up()
            .ele('Dbtr')
              .ele('Nm').txt(creditor.name).up()
            .up()
            .ele('DbtrAcct')
              .ele('Id')
                .ele('IBAN').txt(creditor.iban).up()
              .up()
            .up()
            .ele('DbtrAgt')
              .ele('FinInstnId')
                .ele('BIC').txt(creditor.bic).up()
              .up()
            .up();

    // Ajouter chaque paiement
    const pmtInf = xml.first().first().last();
    payments.forEach(payment => {
      pmtInf
        .ele('CdtTrfTxInf')
          .ele('PmtId')
            .ele('EndToEndId').txt(payment.reference || `E2E-${payment.id}`).up()
          .up()
          .ele('Amt')
            .ele('InstdAmt', { Ccy: 'EUR' }).txt(payment.amount.toFixed(2)).up()
          .up()
          .ele('CdtrAgt')
            .ele('FinInstnId')
              .ele('BIC').txt(payment.creditorBic).up()
            .up()
          .up()
          .ele('Cdtr')
            .ele('Nm').txt(payment.creditorName).up()
          .up()
          .ele('CdtrAcct')
            .ele('Id')
              .ele('IBAN').txt(payment.creditorIban).up()
            .up()
          .up()
          .ele('RmtInf')
            .ele('Ustrd').txt(payment.description || '').up()
          .up()
        .up();
    });

    return xml.end({ prettyPrint: true });
  }

  /**
   * Génère fichier prélèvement SEPA (pain.008)
   */
  generateSEPADirectDebit(debits: any[], creditor: any): string {
    const msgId = `MSG-${Date.now()}`;
    const pmtInfId = `PMT-${Date.now()}`;
    const totalAmount = debits.reduce((sum, d) => sum + d.amount, 0);
    
    const xml = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Document', {
        'xmlns': 'urn:iso:std:iso:20022:tech:xsd:pain.008.001.02'
      })
        .ele('CstmrDrctDbtInitn')
          .ele('GrpHdr')
            .ele('MsgId').txt(msgId).up()
            .ele('CreDtTm').txt(new Date().toISOString()).up()
            .ele('NbOfTxs').txt(debits.length.toString()).up()
            .ele('CtrlSum').txt(totalAmount.toFixed(2)).up()
            .ele('InitgPty')
              .ele('Nm').txt(creditor.name).up()
            .up()
          .up()
          .ele('PmtInf')
            .ele('PmtInfId').txt(pmtInfId).up()
            .ele('PmtMtd').txt('DD').up()
            .ele('NbOfTxs').txt(debits.length.toString()).up()
            .ele('CtrlSum').txt(totalAmount.toFixed(2)).up()
            .ele('PmtTpInf')
              .ele('SvcLvl')
                .ele('Cd').txt('SEPA').up()
              .up()
              .ele('LclInstrm')
                .ele('Cd').txt('CORE').up()
              .up()
              .ele('SeqTp').txt('RCUR').up() // FRST, RCUR, OOFF, FNAL
            .up()
            .ele('ReqdColltnDt').txt(new Date().toISOString().split('T')[0]).up()
            .ele('Cdtr')
              .ele('Nm').txt(creditor.name).up()
            .up()
            .ele('CdtrAcct')
              .ele('Id')
                .ele('IBAN').txt(creditor.iban).up()
              .up()
            .up()
            .ele('CdtrAgt')
              .ele('FinInstnId')
                .ele('BIC').txt(creditor.bic).up()
              .up()
            .up()
            .ele('CdtrSchmeId')
              .ele('Id')
                .ele('PrvtId')
                  .ele('Othr')
                    .ele('Id').txt(creditor.creditorId).up() // ICS
                    .ele('SchmeNm')
                      .ele('Prtry').txt('SEPA').up()
                    .up()
                  .up()
                .up()
              .up()
            .up();

    const pmtInf = xml.first().first().last();
    debits.forEach(debit => {
      pmtInf
        .ele('DrctDbtTxInf')
          .ele('PmtId')
            .ele('EndToEndId').txt(debit.reference || `E2E-${debit.id}`).up()
          .up()
          .ele('InstdAmt', { Ccy: 'EUR' }).txt(debit.amount.toFixed(2)).up()
          .ele('DrctDbtTx')
            .ele('MndtRltdInf')
              .ele('MndtId').txt(debit.mandateId).up()
              .ele('DtOfSgntr').txt(debit.mandateSignDate).up()
            .up()
          .up()
          .ele('DbtrAgt')
            .ele('FinInstnId')
              .ele('BIC').txt(debit.debtorBic).up()
            .up()
          .up()
          .ele('Dbtr')
            .ele('Nm').txt(debit.debtorName).up()
          .up()
          .ele('DbtrAcct')
            .ele('Id')
              .ele('IBAN').txt(debit.debtorIban).up()
            .up()
          .up()
          .ele('RmtInf')
            .ele('Ustrd').txt(debit.description || '').up()
          .up()
        .up();
    });

    return xml.end({ prettyPrint: true });
  }

  /**
   * Validation fichier SEPA
   */
  validateSEPA(xml: string, type: 'pain.001' | 'pain.008'): { valid: boolean; errors: string[] } {
    const errors = [];
    
    if (!xml.includes('Document')) {
      errors.push('Structure XML invalide');
    }
    
    if (type === 'pain.001' && !xml.includes('CstmrCdtTrfInitn')) {
      errors.push('Format pain.001 invalide');
    }
    
    if (type === 'pain.008' && !xml.includes('CstmrDrctDbtInitn')) {
      errors.push('Format pain.008 invalide');
    }
    
    // Validation IBAN
    const ibans = this.extractIBANs(xml);
    for (const iban of ibans) {
      if (!this.validateIBAN(iban)) {
        errors.push(`IBAN invalide: ${iban}`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  /**
   * Validation IBAN
   */
  private validateIBAN(iban: string): boolean {
    const cleaned = iban.replace(/\s/g, '').toUpperCase();
    if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(cleaned)) return false;
    
    const rearranged = cleaned.slice(4) + cleaned.slice(0, 4);
    const numeric = rearranged.replace(/[A-Z]/g, c => (c.charCodeAt(0) - 55).toString());
    
    let remainder = numeric;
    while (remainder.length > 2) {
      const block = remainder.slice(0, 9);
      remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(9);
    }
    
    return parseInt(remainder, 10) % 97 === 1;
  }

  private extractIBANs(xml: string): string[] {
    const regex = /<IBAN>([^<]+)<\/IBAN>/g;
    const matches = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      matches.push(match[1]);
    }
    return matches;
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

  private async sendToDGFIP(xml: string): Promise<any> {
    return { reference: 'DGFIP-123', status: 'accepted', acknowledgment: 'OK' };
  }

  /**
   * Importer et parser un fichier SEPA
   */
  async importSEPAFile(buffer: Buffer, companyId: string): Promise<any> {
    try {
      const xmlContent = buffer.toString('utf-8');
      
      // Validation basique du XML
      if (!xmlContent.includes('<Document') || !xmlContent.includes('SEPA')) {
        throw new Error('Format de fichier SEPA invalide');
      }

      // Parser le XML (implémentation simplifiée)
      const transactions = this.parseSEPAFile(xmlContent);
      
      return {
        companyId,
        filename: `sepa-import-${Date.now()}.xml`,
        transactionsCount: transactions.length,
        totalAmount: transactions.reduce((sum, tx) => sum + tx.amount, 0),
        transactions,
        importedAt: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'import SEPA: ${error.message}`);
    }
  }

  /**
   * Parser le contenu d'un fichier SEPA
   */
  private parseSEPAFile(xmlContent: string): any[] {
    // Implémentation simplifiée - dans un vrai projet, utiliser un parser XML robuste
    const transactions: any[] = [];
    
    // Simulation de parsing - extraire les informations du virement
    const amountMatch = xmlContent.match(/<InstdAmt[^>]*>([\d.]+)<\/InstdAmt>/g);
    const creditorMatch = xmlContent.match(/<Nm[^>]*>([^<]+)<\/Nm>/g);
    const ibanMatch = xmlContent.match(/<IBAN[^>]*>([^<]+)<\/IBAN>/g);
    
    const count = Math.min(amountMatch?.length || 0, creditorMatch?.length || 0, ibanMatch?.length || 0);
    
    for (let i = 0; i < count; i++) {
      const amount = parseFloat(amountMatch[i].replace(/<[^>]*>/g, ''));
      const creditor = creditorMatch[i].replace(/<[^>]*>/g, '');
      const iban = ibanMatch[i].replace(/<[^>]*>/g, '');
      
      transactions.push({
        id: `SEPA-${Date.now()}-${i}`,
        amount,
        creditor,
        iban,
        currency: 'EUR',
        executionDate: new Date().toISOString().split('T')[0],
        status: 'pending',
      });
    }
    
    return transactions;
  }
}
