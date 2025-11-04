import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { VatReturnDto } from '../dto/vat-return.dto';

/**
 * Service de génération de documents PDF
 */
@Injectable()
export class PdfGeneratorService {
  /**
   * Générer le formulaire CA3 en PDF
   */
  async generateCA3Pdf(vatReturn: VatReturnDto, companyName: string = 'Entreprise'): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        // Collecter les chunks du PDF
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // En-tête
        doc
          .fontSize(20)
          .font('Helvetica-Bold')
          .text('DÉCLARATION DE TVA - CA3', { align: 'center' })
          .moveDown();

        doc
          .fontSize(12)
          .font('Helvetica')
          .text(`Entreprise: ${companyName}`, { align: 'center' })
          .text(`Période: ${vatReturn.startDate} au ${vatReturn.endDate}`, { align: 'center' })
          .moveDown(2);

        // Section 1: Chiffre d'affaires
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#0D9488')
          .text('I. CHIFFRE D\'AFFAIRES ET OPÉRATIONS IMPOSABLES')
          .moveDown(0.5);

        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#000000');

        this.addTableRow(doc, 'Ventes et prestations de services HT', this.formatAmount(vatReturn.revenueHT));
        this.addTableRow(doc, 'TVA collectée (Taux 18%)', this.formatAmount(vatReturn.vatCollected), true);
        
        doc.moveDown();

        // Section 2: Achats et charges
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor('#F59E0B')
          .text('II. ACHATS ET CHARGES DÉDUCTIBLES')
          .moveDown(0.5);

        doc
          .fontSize(11)
          .font('Helvetica')
          .fillColor('#000000');

        this.addTableRow(doc, 'Achats et charges HT', this.formatAmount(vatReturn.purchasesHT));
        this.addTableRow(doc, 'TVA déductible', this.formatAmount(vatReturn.vatDeductible), true);

        doc.moveDown();

        // Section 3: TVA nette
        doc
          .fontSize(14)
          .font('Helvetica-Bold')
          .fillColor(vatReturn.vatNet >= 0 ? '#10B981' : '#EF4444')
          .text('III. TVA NETTE À PAYER')
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .fillColor('#000000');

        const vatNetLabel = vatReturn.vatNet >= 0 ? 'TVA à payer' : 'Crédit de TVA';
        this.addTableRow(doc, vatNetLabel, this.formatAmount(Math.abs(vatReturn.vatNet)), true, true);

        doc.moveDown(2);

        // Détails par compte (si disponibles)
        if (vatReturn.details?.revenues?.length > 0) {
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('DÉTAIL DES PRODUITS (Classe 7)')
            .moveDown(0.5);

          doc.fontSize(9).font('Helvetica');
          
          for (const item of vatReturn.details.revenues.slice(0, 10)) {
            doc.text(
              `${item.accountNumber} - ${item.accountName}: ${this.formatAmount(item.amountHT)} FCFA`,
              { indent: 20 }
            );
          }
          doc.moveDown();
        }

        if (vatReturn.details?.purchases?.length > 0) {
          doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('DÉTAIL DES CHARGES (Classe 6)')
            .moveDown(0.5);

          doc.fontSize(9).font('Helvetica');
          
          for (const item of vatReturn.details.purchases.slice(0, 10)) {
            doc.text(
              `${item.accountNumber} - ${item.accountName}: ${this.formatAmount(item.amountHT)} FCFA`,
              { indent: 20 }
            );
          }
          doc.moveDown();
        }

        // Pied de page
        doc
          .fontSize(8)
          .fillColor('#666666')
          .text(
            '────────────────────────────────────────────────────────────────',
            { align: 'center' }
          )
          .moveDown(0.3)
          .text('Document généré automatiquement par BMS', { align: 'center' })
          .text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' })
          .moveDown(0.3)
          .text(
            'Pour une déclaration officielle, veuillez utiliser le portail de la DGI',
            { align: 'center' }
          );

        // Finaliser le PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Ajouter une ligne de tableau
   */
  private addTableRow(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string,
    bold: boolean = false,
    highlight: boolean = false,
  ): void {
    const y = doc.y;
    const leftX = 50;
    const rightX = 450;

    if (highlight) {
      doc
        .rect(leftX - 10, y - 5, 500, 20)
        .fillAndStroke('#F3F4F6', '#D1D5DB')
        .fillColor('#000000');
    }

    doc
      .font(bold ? 'Helvetica-Bold' : 'Helvetica')
      .fontSize(11)
      .text(label, leftX, y, { width: 300 })
      .text(value, rightX, y, { width: 100, align: 'right' });

    doc.moveDown(0.8);
  }

  /**
   * Formater un montant
   */
  private formatAmount(amount: number): string {
    return amount.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' FCFA';
  }
}
