import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';

interface SepaMandate {
  mandateId: string;
  creditorId: string;
  debtorName: string;
  debtorIban: string;
  debtorBic?: string;
  signatureDate: Date;
}

interface SepaPayment {
  mandateId: string;
  amount: number;
  currency: string;
  debtorName: string;
  debtorIban: string;
  debtorBic?: string;
  remittanceInfo: string;
  executionDate: Date;
}

@Injectable()
export class SepaService {
  generateDirectDebitXml(
    creditorName: string,
    creditorIban: string,
    creditorBic: string,
    creditorId: string,
    payments: SepaPayment[],
  ): string {
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const msgId = `MSG-${Date.now()}`;
    const pmtInfId = `PMT-${Date.now()}`;
    const executionDate = payments[0]?.executionDate || new Date();

    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Document', {
        xmlns: 'urn:iso:std:iso:20022:tech:xsd:pain.008.001.02',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      })
      .ele('CstmrDrctDbtInitn')
        .ele('GrpHdr')
          .ele('MsgId').txt(msgId).up()
          .ele('CreDtTm').txt(new Date().toISOString()).up()
          .ele('NbOfTxs').txt(payments.length.toString()).up()
          .ele('CtrlSum').txt(totalAmount.toFixed(2)).up()
          .ele('InitgPty')
            .ele('Nm').txt(creditorName).up()
          .up()
        .up()
        .ele('PmtInf')
          .ele('PmtInfId').txt(pmtInfId).up()
          .ele('PmtMtd').txt('DD').up()
          .ele('NbOfTxs').txt(payments.length.toString()).up()
          .ele('CtrlSum').txt(totalAmount.toFixed(2)).up()
          .ele('PmtTpInf')
            .ele('SvcLvl')
              .ele('Cd').txt('SEPA').up()
            .up()
            .ele('LclInstrm')
              .ele('Cd').txt('CORE').up()
            .up()
            .ele('SeqTp').txt('RCUR').up()
          .up()
          .ele('ReqdColltnDt').txt(executionDate.toISOString().split('T')[0]).up()
          .ele('Cdtr')
            .ele('Nm').txt(creditorName).up()
          .up()
          .ele('CdtrAcct')
            .ele('Id')
              .ele('IBAN').txt(creditorIban).up()
            .up()
          .up()
          .ele('CdtrAgt')
            .ele('FinInstnId')
              .ele('BIC').txt(creditorBic).up()
            .up()
          .up()
          .ele('CdtrSchmeId')
            .ele('Id')
              .ele('PrvtId')
                .ele('Othr')
                  .ele('Id').txt(creditorId).up()
                  .ele('SchmeNm')
                    .ele('Prtry').txt('SEPA').up()
                  .up()
                .up()
              .up()
            .up()
          .up();

    const pmtInf = doc.first();

    payments.forEach((payment, index) => {
      pmtInf
        .ele('DrctDbtTxInf')
          .ele('PmtId')
            .ele('EndToEndId').txt(`E2E-${index + 1}`).up()
          .up()
          .ele('InstdAmt', { Ccy: payment.currency }).txt(payment.amount.toFixed(2)).up()
          .ele('DrctDbtTx')
            .ele('MndtRltdInf')
              .ele('MndtId').txt(payment.mandateId).up()
              .ele('DtOfSgntr').txt(new Date().toISOString().split('T')[0]).up()
            .up()
          .up()
          .ele('DbtrAgt')
            .ele('FinInstnId')
              .ele('BIC').txt(payment.debtorBic || 'NOTPROVIDED').up()
            .up()
          .up()
          .ele('Dbtr')
            .ele('Nm').txt(payment.debtorName).up()
          .up()
          .ele('DbtrAcct')
            .ele('Id')
              .ele('IBAN').txt(payment.debtorIban).up()
            .up()
          .up()
          .ele('RmtInf')
            .ele('Ustrd').txt(payment.remittanceInfo).up()
          .up()
        .up();
    });

    return doc.end({ prettyPrint: true });
  }

  validateIban(iban: string): boolean {
    const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/;
    if (!ibanRegex.test(iban)) return false;

    const rearranged = iban.slice(4) + iban.slice(0, 4);
    const numeric = rearranged.replace(/[A-Z]/g, (char) => (char.charCodeAt(0) - 55).toString());
    
    let remainder = numeric;
    while (remainder.length > 2) {
      const block = remainder.slice(0, 9);
      remainder = (parseInt(block, 10) % 97).toString() + remainder.slice(9);
    }
    
    return parseInt(remainder, 10) % 97 === 1;
  }

  validateBic(bic: string): boolean {
    const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return bicRegex.test(bic);
  }

  createMandate(mandate: SepaMandate): any {
    return {
      mandateId: mandate.mandateId,
      creditorId: mandate.creditorId,
      debtorName: mandate.debtorName,
      debtorIban: mandate.debtorIban,
      debtorBic: mandate.debtorBic,
      signatureDate: mandate.signatureDate,
      status: 'active',
      type: 'CORE',
      sequenceType: 'RCUR',
    };
  }
}
