import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { HrCertificate, HrCertificateStatus, HrCertificateType } from './entities/hr-certificate.entity';
import { Employee } from './entities/employee.entity';
import { Company } from '../../companies/entities/company.entity';

interface CreateCertificateDto {
  companyId: string;
  employeeId: string;
  type: HrCertificateType;
  purpose?: string;
  notes?: string;
}

interface GenerateOptions {
  issuedBy?: string;
}

const CERTIFICATE_LABELS: Record<HrCertificateType, string> = {
  attestation_emploi: "Attestation d'emploi",
  attestation_salaire: "Attestation de salaire",
  certificat_travail: 'Certificat de travail',
  autre: 'Attestation',
};

@Injectable()
export class HrCertificateService {
  constructor(
    @InjectRepository(HrCertificate)
    private readonly certificateRepo: Repository<HrCertificate>,
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async listCertificates(companyId: string, status?: HrCertificateStatus): Promise<HrCertificate[]> {
    const query = this.certificateRepo
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.employee', 'employee')
      .where('certificate.companyId = :companyId', { companyId })
      .orderBy('certificate.createdAt', 'DESC');

    if (status) {
      query.andWhere('certificate.status = :status', { status });
    }

    return query.getMany();
  }

  async createRequest(payload: CreateCertificateDto): Promise<HrCertificate> {
    const employee = await this.employeeRepo.findOne({ where: { id: payload.employeeId, companyId: payload.companyId } });
    if (!employee) {
      throw new NotFoundException("Employé introuvable pour cette société");
    }

    const certificate = this.certificateRepo.create({
      ...payload,
      status: 'pending',
      requestDate: new Date(),
    });

    return this.certificateRepo.save(certificate);
  }

  async getCertificate(id: string, companyId: string): Promise<HrCertificate> {
    const certificate = await this.certificateRepo.findOne({
      where: { id, companyId },
      relations: ['employee'],
    });

    if (!certificate) {
      throw new NotFoundException('Attestation introuvable');
    }

    return certificate;
  }

  async generateCertificate(id: string, companyId: string, options: GenerateOptions = {}) {
    const certificate = await this.certificateRepo
      .createQueryBuilder('certificate')
      .leftJoinAndSelect('certificate.employee', 'employee')
      .where('certificate.id = :id', { id })
      .andWhere('certificate.companyId = :companyId', { companyId })
      .getOne();

    if (!certificate) {
      throw new NotFoundException('Attestation introuvable');
    }

    const company = await this.companyRepo.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Société introuvable');
    }

    const buffer = await this.buildCertificatePdf(certificate, certificate.employee, company, options);
    const fileName = this.buildCertificateFileName(certificate, certificate.employee);

    certificate.status = 'generated';
    certificate.generatedAt = new Date();
    certificate.pdfFile = buffer;
    certificate.pdfFileSize = buffer.length;
    certificate.pdfMimeType = 'application/pdf';
    certificate.pdfFileName = fileName;

    await this.certificateRepo.save(certificate);

    return {
      id: certificate.id,
      fileName,
      mimeType: 'application/pdf',
      size: buffer.length,
    };
  }

  async markDelivered(id: string, companyId: string) {
    const certificate = await this.getCertificate(id, companyId);
    certificate.status = 'delivered';
    certificate.deliveredAt = new Date();
    return this.certificateRepo.save(certificate);
  }

  async downloadCertificate(id: string, companyId: string) {
    const certificate = await this.certificateRepo
      .createQueryBuilder('certificate')
      .leftJoin('certificate.employee', 'employee')
      .where('certificate.id = :id', { id })
      .andWhere('certificate.companyId = :companyId', { companyId })
      .addSelect(['certificate.pdfFile'])
      .getOne();

    if (!certificate || !certificate.pdfFile) {
      throw new BadRequestException("Attestation non générée pour le moment");
    }

    return {
      buffer: certificate.pdfFile,
      fileName: certificate.pdfFileName ?? 'attestation.pdf',
      mimeType: certificate.pdfMimeType ?? 'application/pdf',
    };
  }

  private async buildCertificatePdf(
    certificate: HrCertificate,
    employee: Employee,
    company: Company,
    options: GenerateOptions,
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const title = CERTIFICATE_LABELS[certificate.type] ?? 'Attestation';
        const issuedBy = options.issuedBy ?? company.legalName ?? company.name;

        // Header
        doc
          .rect(50, 40, 510, 80)
          .fill('#0F172A')
          .stroke('#0F172A');

        doc
          .fill('#FFFFFF')
          .font('Helvetica-Bold')
          .fontSize(20)
          .text(issuedBy, 60, 60, { align: 'left' })
          .fontSize(12)
          .moveDown(0.5)
          .font('Helvetica')
          .text(company.addressLine1 ?? '', { lineGap: 2 })
          .text(`${company.city ?? ''} (${company.country ?? ''})`)
          .text(company.email ?? '', { lineGap: 2 });

        doc.moveDown(2);

        doc
          .fill('#0F172A')
          .font('Helvetica-Bold')
          .fontSize(22)
          .text(title, { align: 'center' })
          .moveDown(1.5);

        const today = new Date();
        const formattedDate = today.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        });

        doc
          .fill('#111827')
          .font('Helvetica')
          .fontSize(12)
          .text(`Nous, soussigné ${issuedBy}, attestons que :`, { align: 'left' })
          .moveDown(1);

        // Employee Information Card
        this.drawInfoCard(doc, 'Informations Employé', [
          ['Nom complet', `${employee.firstName} ${employee.lastName}`],
          ['Poste', employee.position ?? 'N/A'],
          ['Département', employee.department ?? 'N/A'],
          ['Date d\'embauche', employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') : 'N/A'],
        ]);

        doc.moveDown(1);

        const paragraph = this.buildCertificateParagraph(certificate, employee, company);
        doc.text(paragraph, {
          align: 'justify',
          lineGap: 6,
        });

        if (certificate.purpose) {
          doc.moveDown(1);
          this.drawInfoCard(doc, 'Objet de la demande', [[certificate.purpose, '']]);
        }

        if (certificate.notes) {
          doc.moveDown(1);
          this.drawInfoCard(doc, 'Notes complémentaires', [[certificate.notes, '']]);
        }

        doc.moveDown(2);
        doc.text(`Fait à ${company.city ?? 'Cotonou'}, le ${formattedDate}.`, {
          align: 'left',
        });

        doc.moveDown(3);

        doc
          .font('Helvetica-Bold')
          .text('Signature et cachet', { align: 'left' })
          .moveDown(0.5)
          .font('Helvetica')
          .text(issuedBy)
          .moveDown(0.5);

        doc
          .rect(50, doc.y, 200, 70)
          .stroke('#94A3B8');

        doc
          .fontSize(8)
          .fill('#64748B')
          .text('Document généré automatiquement par BMS - Bureau de Management & Services', 50, 760, {
            align: 'center',
          });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  private drawInfoCard(doc: PDFKit.PDFDocument, title: string, rows: Array<[string, string]>) {
    const startY = doc.y;
    doc
      .roundedRect(50, startY, 510, rows.length * 20 + 40, 8)
      .fillAndStroke('#F8FAFC', '#E2E8F0')
      .fill('#0F172A');

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text(title, 65, startY + 12);

    const valueYStart = startY + 32;
    doc.font('Helvetica').fontSize(10).fill('#111827');

    rows.forEach(([label, value], index) => {
      const y = valueYStart + index * 18;
      if (label && value) {
        doc
          .font('Helvetica-Bold')
          .text(`${label} :`, 65, y)
          .font('Helvetica')
          .text(value, 220, y);
      } else if (label) {
        doc.font('Helvetica').text(label, 65, y, { width: 470 });
      }
    });

    doc.y = valueYStart + rows.length * 18 + 16;
  }

  private buildCertificateParagraph(
    certificate: HrCertificate,
    employee: Employee,
    company: Company,
  ): string {
    const employeeName = `${employee.firstName} ${employee.lastName}`;
    const hireDate = employee.hireDate ? new Date(employee.hireDate).toLocaleDateString('fr-FR') : 'N/A';
    const baseSalary = employee.baseSalary ? Number(employee.baseSalary).toLocaleString('fr-FR', { minimumFractionDigits: 0 }) : undefined;

    switch (certificate.type) {
      case 'attestation_emploi':
        return `M./Mme ${employeeName} est employé(e) au sein de notre structure ${company.legalName ?? company.name} en qualité de ${employee.position ?? 'employé'}, depuis le ${hireDate}. Il/Elle est en situation régulière et exerce ses fonctions avec assiduité.`;
      case 'attestation_salaire':
        return `Nous attestons que M./Mme ${employeeName}, recruté(e) le ${hireDate}, occupe le poste de ${employee.position ?? 'employé'} au sein de ${company.legalName ?? company.name}. Sa rémunération mensuelle brute est de ${baseSalary ? baseSalary + ' FCFA' : '—'}, à laquelle peuvent s'ajouter des primes variables selon la performance et les responsabilités exercées.`;
      case 'certificat_travail':
        return `M./Mme ${employeeName} a occupé le poste de ${employee.position ?? 'employé'} au sein de ${company.legalName ?? company.name} du ${hireDate} à ce jour. Durant cette période, il/elle a fait preuve de professionnalisme et a rempli ses missions conformément aux attentes de l'entreprise.`;
      default:
        return `Nous certifions que M./Mme ${employeeName} est en règle vis-à-vis de notre entreprise. Cette attestation est délivrée à la demande de l'intéressé(e) pour servir et valoir ce que de droit.`;
    }
  }

  private buildCertificateFileName(certificate: HrCertificate, employee: Employee): string {
    const typeLabel = CERTIFICATE_LABELS[certificate.type] ?? 'attestation';
    const safeName = `${employee.firstName}_${employee.lastName}`.replace(/\s+/g, '_');
    const timestamp = new Date().toISOString().slice(0, 10);
    return `${typeLabel.replace(/\s+/g, '_')}_${safeName}_${timestamp}.pdf`;
  }
}
