import { Injectable } from '@nestjs/common';

@Injectable()
export class SepaService {
  async generateSepaTransfer(payments: any[]): Promise<string> {
    const msgId = `MSG-${Date.now()}`;
    const total = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${msgId}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>${payments.length}</NbOfTxs>
      <CtrlSum>${total.toFixed(2)}</CtrlSum>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>PMT-${Date.now()}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>`;
    
    for (const payment of payments) {
      xml += `
      <CdtTrfTxInf>
        <PmtId><EndToEndId>${payment.reference}</EndToEndId></PmtId>
        <Amt><InstdAmt Ccy="EUR">${payment.amount}</InstdAmt></Amt>
        <CdtrAcct><Id><IBAN>${payment.iban}</IBAN></Id></CdtrAcct>
      </CdtTrfTxInf>`;
    }
    
    xml += `
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
    return xml;
  }

  async generateSepaDirectDebit(mandates: any[]): Promise<string> {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.008.001.02">
  <CstmrDrctDbtInitn>
    <GrpHdr>
      <MsgId>DD-${Date.now()}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>${mandates.length}</NbOfTxs>
    </GrpHdr>
  </CstmrDrctDbtInitn>
</Document>`;
  }
}
