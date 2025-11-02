import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder';

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
    
    const root = create('Document')
      .att('xmlns', 'urn:iso:std:iso:20022:tech:xsd:pain.001.001.03')
      .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
    
    const cstmrCdtTrfInitn = root.ele('CstmrCdtTrfInitn');
    
    // Group Header
    const grpHdr = cstmrCdtTrfInitn.ele('GrpHdr');
    grpHdr.ele('MsgId').txt(msgId);
    grpHdr.ele('CreDtTm').txt(new Date().toISOString());
    grpHdr.ele('NbOfTxs').txt(payments.length.toString());
    grpHdr.ele('CtrlSum').txt(totalAmount.toFixed(2));
    
    const initgPty = grpHdr.ele('InitgPty');
    initgPty.ele('Nm').txt(creditor.name);
    
    // Payment Information
    const pmtInf = cstmrCdtTrfInitn.ele('PmtInf');
    pmtInf.ele('PmtInfId').txt(pmtInfId);
    pmtInf.ele('PmtMtd').txt('TRF');
    pmtInf.ele('BtchBookg').txt('true');
    pmtInf.ele('NbOfTxs').txt(payments.length.toString());
    pmtInf.ele('CtrlSum').txt(totalAmount.toFixed(2));
    
    const pmtTpInf = pmtInf.ele('PmtTpInf');
    const svcLvl = pmtTpInf.ele('SvcLvl');
    svcLvl.ele('Cd').txt('SEPA');
    
    const reqdExctnDt = pmtInf.ele('ReqdExctnDt');
    reqdExctnDt.txt(new Date().toISOString().split('T')[0]);
    
    // Debtor
    const dbtr = pmtInf.ele('Dbtr');
    dbtr.ele('Nm').txt(creditor.name);
    
    const dbtrAcct = pmtInf.ele('DbtrAcct');
    const id = dbtrAcct.ele('Id');
    const iban = id.ele('IBAN');
    iban.txt(creditor.iban || 'FR7630006000011234567890189');
    
    const dbtrAgt = pmtInf.ele('DbtrAgt');
    const finInstnId = dbtrAgt.ele('FinInstnId');
    const bic = finInstnId.ele('BIC');
    bic.txt(creditor.bic || 'BNPAFRPP');
    
    // Add payments
    payments.forEach((payment, index) => {
      const cdtTrfTxInf = pmtInf.ele('CdtTrfTxInf');
      
      const pmtId = cdtTrfTxInf.ele('PmtId');
      pmtId.ele('InstrId').txt(`INST-${Date.now()}-${index}`);
      pmtId.ele('EndToEndId').txt(payment.id || `E2E-${Date.now()}-${index}`);
      
      const amt = cdtTrfTxInf.ele('Amt');
      const instdAmt = amt.ele('InstdAmt').att('Ccy', payment.currency || 'EUR');
      instdAmt.txt(payment.amount.toFixed(2));
      
      const cdtrAgt = cdtTrfTxInf.ele('CdtrAgt');
      const cdtrFinInstnId = cdtrAgt.ele('FinInstnId');
      cdtrFinInstnId.ele('BIC').txt(payment.bic || 'BNPAFRPP');
      
      const cdtr = cdtTrfTxInf.ele('Cdtr');
      cdtr.ele('Nm').txt(payment.creditor || 'Bénéficiaire');
      
      const cdtrAcct = cdtTrfTxInf.ele('CdtrAcct');
      const cdtrId = cdtrAcct.ele('Id');
      cdtrId.ele('IBAN').txt(payment.iban || 'FR7630006000011234567890189');
      
      const rmtInf = cdtTrfTxInf.ele('RmtInf');
      rmtInf.ele('Ustrd').txt(payment.reference || 'Virement SEPA');
    });
    
    return root.end({ pretty: true });
  }

  /**
   * Génère fichier prélèvement SEPA (pain.008)
   */
  generateSEPADirectDebit(debits: any[], creditor: any): string {
    // Implémentation simplifiée pour prélèvement SEPA
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>DD-${Date.now()}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>${debits.length}</NbOfTxs>
      <CtrlSum>${debits.reduce((sum, d) => sum + d.amount, 0).toFixed(2)}</CtrlSum>
      <InitgPty>
        <Nm>${creditor.name}</Nm>
      </InitgPty>
    </GrpHdr>
  </CstmrDrctDbtInitn>
</Document>`;
  }

  /**
   * Validation fichier SEPA
   */
  validateSEPA(xml: string, type: 'pain.001' | 'pain.008'): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!xml.includes('<Document')) {
      errors.push('Balise Document manquante');
    }
    
    if (type === 'pain.001' && !xml.includes('CstmrCdtTrfInitn')) {
      errors.push('Balise CstmrCdtTrfInitn manquante pour virement SEPA');
    }
    
    if (type === 'pain.008' && !xml.includes('CstmrDrctDbtInitn')) {
      errors.push('Balise CstmrDrctDbtInitn manquante pour prélèvement SEPA');
    }
    
    if (!xml.includes('SEPA')) {
      errors.push('Référence SEPA manquante');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
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
