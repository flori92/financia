import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from './entities/payroll.entity';
import { Employee } from './entities/employee.entity';
import { Company } from '../../companies/entities/company.entity';
import PDFDocument from 'pdfkit';

interface PayslipOptions {
  issuedBy?: string;
}

type PdfDoc = InstanceType<typeof PDFDocument>;

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private payrollRepo: Repository<Payroll>,
    @InjectRepository(Employee)
    private employeeRepo: Repository<Employee>,
    @InjectRepository(Company)
    private companyRepo: Repository<Company>,
  ) {}

  async getPayrolls(companyId: string) {
    return this.payrollRepo.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPayroll(id: string) {
    return this.payrollRepo.findOne({ where: { id } });
  }

  async calculatePayroll(
    companyId: string,
    employeeId: string,
    period: string,
    workedDays: number = 22,
    bonuses: number = 0,
    deductions: number = 0,
  ): Promise<Payroll> {
    const employee = await this.employeeRepo.findOne({ where: { id: employeeId, companyId } });

    if (!employee) {
      throw new NotFoundException('Employé non trouvé');
    }

    const baseSalary = Number(employee.baseSalary ?? 0);
    const dailyRate = baseSalary / 22;
    const grossSalary = dailyRate * workedDays + bonuses - deductions;
    const socialCharges = grossSalary * 0.22;
    const tax = this.calculateTax(grossSalary);
    const netSalary = grossSalary - socialCharges - tax;

    const payroll = this.payrollRepo.create({
      companyId,
      employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      period,
      baseSalary,
      workedDays,
      grossSalary,
      bonuses,
      deductions,
      socialCharges,
      tax,
      netSalary,
      status: 'calculated',
    });

    return this.payrollRepo.save(payroll);
  }

  async updatePayroll(id: string, data: Partial<Payroll>) {
    await this.payrollRepo.update(id, data);
    return this.payrollRepo.findOne({ where: { id } });
  }

  async deletePayroll(id: string) {
    await this.payrollRepo.delete(id);
    return { success: true, message: 'Paie supprimée' };
  }

  async generatePayslip(payrollId: string, companyId: string, options: PayslipOptions = {}) {
    const payroll = await this.payrollRepo.findOne({
      where: { id: payrollId, companyId },
      relations: ['employee'],
    });

    if (!payroll) {
      throw new NotFoundException('Paie non trouvée');
    }

    const employee = payroll.employee || (await this.employeeRepo.findOne({ where: { id: payroll.employeeId, companyId } }));

    if (!employee) {
      throw new NotFoundException('Employé non trouvé pour cette paie');
    }

    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Société introuvable');
    }

    const buffer = await this.buildPayslipPdf(payroll, employee, company, options);
    const fileName = this.buildPayslipFileName(payroll, employee);

    payroll.payslipFile = buffer;
    payroll.payslipFileSize = buffer.length;
    payroll.payslipMimeType = 'application/pdf';
    payroll.payslipFileName = fileName;
    payroll.payslipGeneratedAt = new Date();
    payroll.status = payroll.status === 'calculated' ? 'approved' : payroll.status;

    await this.payrollRepo.save(payroll);

    return {
      id: payroll.id,
      fileName,
      mimeType: payroll.payslipMimeType,
      size: payroll.payslipFileSize,
      generatedAt: payroll.payslipGeneratedAt,
    };
  }

  async getPayslipFile(payrollId: string, companyId: string) {
    const payroll = await this.payrollRepo
      .createQueryBuilder('payroll')
      .where('payroll.id = :id', { id: payrollId })
      .andWhere('payroll.companyId = :companyId', { companyId })
      .addSelect(['payroll.payslipFile'])
      .getOne();

    if (!payroll || !payroll.payslipFile) {
      throw new BadRequestException('Aucun bulletin généré pour cette paie');
    }

    return {
      buffer: payroll.payslipFile,
      fileName: payroll.payslipFileName ?? 'payslip.pdf',
      mimeType: payroll.payslipMimeType ?? 'application/pdf',
    };
  }

  async exportDSN(companyId: string, period: string): Promise<string> {
    const payrolls = await this.payrollRepo.find({
      where: { companyId, period },
    });
    return this.generateDSN(payrolls);
  }

  private calculateTax(gross: number): number {
    // Tax brackets for FCFA (simplified)
    if (gross < 10000) return 0;
    if (gross < 25000) return gross * 0.11;
    if (gross < 70000) return gross * 0.30;
    return gross * 0.41;
  }

  private generateDSN(payrolls: Payroll[]): string {
    // Simplified DSN generation - in production this would follow URSSAF format
    let dsn = 'DSN Export\n';
    dsn += `Generated: ${new Date().toISOString()}\n\n`;

    payrolls.forEach(p => {
      dsn += `Employee: ${p.employeeName}\n`;
      dsn += `Period: ${p.period}\n`;
      dsn += `Gross: ${p.grossSalary} FCFA\n`;
      dsn += `Net: ${p.netSalary} FCFA\n\n`;
    });

    return dsn;
  }

  private async buildPayslipPdf(
    payroll: Payroll,
    employee: Employee,
    company: Company,
    options: PayslipOptions,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const companyName = options.issuedBy || company.legalName || company.name || 'Entreprise';
        const periodLabel = this.formatPeriod(payroll.period);

        // Header
        doc
          .rect(40, 35, 515, 90)
          .fill('#111827')
          .stroke('#111827');

        doc
          .fill('#FFFFFF')
          .font('Helvetica-Bold')
          .fontSize(20)
          .text(companyName, 55, 55)
          .fontSize(10)
          .font('Helvetica')
          .text(company.addressLine1 ?? '', { lineGap: 2 })
          .text(`${company.city ?? ''} (${company.country ?? ''})`)
          .text(company.email ?? '', { lineGap: 2 });

        doc
          .fill('#0F172A')
          .fontSize(18)
          .font('Helvetica-Bold')
          .text('Bulletin de Paie', 40, 145, { align: 'center' })
          .moveDown();

        doc
          .font('Helvetica')
          .fontSize(12)
          .fill('#111827')
          .text(`Période : ${periodLabel}`, { align: 'center' })
          .moveDown(1.5);

        this.drawInfoSection(doc, 'Informations Employé', [
          ['Nom', `${employee.firstName} ${employee.lastName}`],
          ['Poste', employee.position ?? '—'],
          ['Département', employee.department ?? '—'],
          ['Date d\'embauche', employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') : '—'],
        ]);

        doc.moveDown(1);

        this.drawInfoSection(doc, 'Synthèse Paie', [
          ['Salaire de base', this.formatCurrency(payroll.baseSalary)],
          ['Jours travaillés', `${payroll.workedDays}`],
          ['Primes', this.formatCurrency(payroll.bonuses)],
          ['Retenues', this.formatCurrency(payroll.deductions)],
        ]);

        doc.moveDown(1);

        this.drawTable(doc, 'Détails Financiers', [
          ['Salaire brut', this.formatCurrency(payroll.grossSalary)],
          ['Charges sociales (22%)', this.formatCurrency(payroll.socialCharges)],
          ['Impôt', this.formatCurrency(payroll.tax)],
          ['Net à payer', this.formatCurrency(payroll.netSalary)],
        ]);

        doc.moveDown(2);

        const generatedAt = payroll.payslipGeneratedAt ?? new Date();
        doc
          .font('Helvetica')
          .fontSize(10)
          .fill('#4B5563')
          .text(`Émis le ${generatedAt.toLocaleDateString('fr-FR')} à ${generatedAt.toLocaleTimeString('fr-FR')}`)
          .moveDown(0.5)
          .text('Signature et cachet', { align: 'left' })
          .moveDown(2);

        doc
          .rect(40, doc.y, 200, 70)
          .stroke('#94A3B8');

        doc
          .fontSize(8)
          .fill('#94A3B8')
          .text('Document généré automatiquement par BMS', 40, 770, { align: 'center' });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawInfoSection(doc: PdfDoc, title: string, rows: Array<[string, string]>) {
    const startY = doc.y;
    const height = rows.length * 18 + 40;

    doc
      .roundedRect(40, startY, 515, height, 8)
      .fillAndStroke('#F8FAFC', '#E2E8F0');

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fill('#0F172A')
      .text(title, 55, startY + 12);

    doc
      .font('Helvetica')
      .fontSize(10)
      .fill('#111827');

    rows.forEach(([label, value], index) => {
      const y = startY + 32 + index * 18;
      doc
        .font('Helvetica-Bold')
        .text(`${label} :`, 55, y)
        .font('Helvetica')
        .text(value, 200, y);
    });

    doc.y = startY + height + 10;
  }

  private drawTable(doc: PdfDoc, title: string, rows: Array<[string, string]>) {
    const startY = doc.y;
    const rowHeight = 24;
    const height = rows.length * rowHeight + 40;

    doc
      .roundedRect(40, startY, 515, height, 8)
      .fillAndStroke('#0F172A', '#0F172A');

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fill('#FFFFFF')
      .text(title, 55, startY + 12);

    const contentY = startY + 32;
    doc
      .fill('#FFFFFF')
      .fontSize(10);

    rows.forEach(([label, value], index) => {
      const y = contentY + index * rowHeight;
      if (index % 2 === 0) {
        doc
          .rect(45, y - 4, 505, rowHeight)
          .fill('#1F2937')
          .stroke('#1F2937');
      } else {
        doc
          .rect(45, y - 4, 505, rowHeight)
          .fill('#111827')
          .stroke('#111827');
      }
      doc
        .fill('#E5E7EB')
        .font('Helvetica-Bold')
        .text(label, 55, y)
        .font('Helvetica')
        .text(value, 400, y, { align: 'right' });
    });

    doc.y = startY + height + 10;
  }

  private buildPayslipFileName(payroll: Payroll, employee: Employee): string {
    const safeName = `${employee.firstName}_${employee.lastName}`.replace(/\s+/g, '_');
    return `bulletin_${safeName}_${payroll.period}.pdf`;
  }

  private formatCurrency(value: number | string | null | undefined): string {
    const num = Number(value ?? 0);
    return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 0 })} FCFA`;
  }

  private formatPeriod(period: string): string {
    if (!period) return 'Période inconnue';
    const [year, month] = period.split('-').map((part) => parseInt(part, 10));
    if (!year || !month) return period;
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  }
}
