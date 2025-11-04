import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { AuditService } from '../audit/audit.service';
import { AccountingAutomationService } from '../accounting/accounting-automation.service';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(InvoiceItem)
    private invoiceItemRepository: Repository<InvoiceItem>,
    private readonly auditService: AuditService,
    private readonly automation: AccountingAutomationService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, userId: string): Promise<Invoice> {
    const { items, ...invoiceData } = createInvoiceDto;

    // Générer le numéro de facture
    const invoiceNumber = await this.generateInvoiceNumber(
      invoiceData.companyId,
      invoiceData.invoiceType,
    );

    // Calculer les totaux
    let subtotal = 0;
    let totalTax = 0;
    let totalDiscount = 0;

    const invoiceItems = items.map((item) => {
      const quantity = item.quantity || 1;
      const unitPrice = item.unitPrice;
      const discountPercent = item.discountPercent || 0;
      const taxPercent = item.taxPercent || 0;

      const lineSubtotal = quantity * unitPrice;
      const discountAmount = (lineSubtotal * discountPercent) / 100;
      const lineAfterDiscount = lineSubtotal - discountAmount;
      const taxAmount = (lineAfterDiscount * taxPercent) / 100;
      const lineTotal = lineAfterDiscount + taxAmount;

      subtotal += lineSubtotal;
      totalDiscount += discountAmount;
      totalTax += taxAmount;

      return this.invoiceItemRepository.create({
        ...item,
        quantity,
        unitPrice,
        discountPercent,
        discountAmount,
        taxPercent,
        taxAmount,
        lineTotal,
      });
    });

    const totalAmount = subtotal - totalDiscount + totalTax;
    const outstandingAmount = totalAmount; // Initialement, tout est impayé

    // Générer QR Code pour Mobile Money si spécifié
    let qrCodeData = null;
    if (createInvoiceDto.mobileMoneyProvider) {
      qrCodeData = await this.generateMobileMoneyQRCode(
        createInvoiceDto.mobileMoneyProvider,
        totalAmount,
        invoiceNumber,
      );
    }

    // Créer la facture
    const invoice = this.invoiceRepository.create({
      ...invoiceData,
      invoiceNumber,
      invoiceDate: invoiceData.invoiceDate || new Date(),
      subtotal,
      taxAmount: totalTax,
      discountAmount: totalDiscount,
      totalAmount,
      outstandingAmount,
      paidAmount: 0,
      qrCodeData,
      status: 'draft',
      paymentStatus: 'unpaid',
      createdBy: userId,
      items: invoiceItems,
    });

    const saved = await this.invoiceRepository.save(invoice);

    // Auto-posting journal si demandé
    try {
      if ((createInvoiceDto as any).autoPostJournal) {
        const amountHT = subtotal - totalDiscount;
        const vatAmount = totalTax;
        const amountTTC = totalAmount;
        const entryDate = (invoiceData.invoiceDate || new Date()).toString().slice(0,10);
        if (invoiceData.invoiceType === 'sales') {
          await this.automation.generateSaleEntry({
            companyId: invoiceData.companyId,
            invoiceNumber,
            invoiceDate: typeof invoiceData.invoiceDate === 'string' ? invoiceData.invoiceDate : new Date().toISOString().slice(0,10),
            customerName: invoiceData.partyName,
            amountHT,
            vatAmount,
            amountTTC,
            serviceType: (createInvoiceDto as any).autoServiceType || 'services',
            userId,
          });
        } else if (invoiceData.invoiceType === 'purchase') {
          await this.automation.generatePurchaseEntry({
            companyId: invoiceData.companyId,
            invoiceNumber,
            invoiceDate: typeof invoiceData.invoiceDate === 'string' ? invoiceData.invoiceDate : new Date().toISOString().slice(0,10),
            supplierName: invoiceData.partyName,
            amountHT,
            vatAmount,
            amountTTC,
            purchaseType: (createInvoiceDto as any).autoServiceType || 'goods',
            userId,
          });
        }
      }
    } catch (e) {
      // ne pas bloquer la création de facture si l'automatisation échoue
    }

    return this.findOne(saved.id, invoiceData.companyId);
  }

  async findAll(companyId: string, filters?: any): Promise<Invoice[]> {
    const query = this.invoiceRepository
      .createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.items', 'items')
      .where('invoice.company_id = :companyId', { companyId });

    if (filters?.status) {
      query.andWhere('invoice.status = :status', { status: filters.status });
    }

    if (filters?.paymentStatus) {
      query.andWhere('invoice.payment_status = :paymentStatus', {
        paymentStatus: filters.paymentStatus,
      });
    }

    if (filters?.startDate) {
      query.andWhere('invoice.invoice_date >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters?.endDate) {
      query.andWhere('invoice.invoice_date <= :endDate', { endDate: filters.endDate });
    }

    return query.orderBy('invoice.created_at', 'DESC').getMany();
  }

  async findOne(id: string, companyId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id, companyId },
      relations: ['items'],
    });

    if (!invoice) {
      throw new NotFoundException(`Facture ${id} non trouvée`);
    }

    return invoice;
  }

  async submit(id: string, companyId: string): Promise<Invoice> {
    const invoice = await this.findOne(id, companyId);

    if (invoice.status !== 'draft') {
      throw new Error('Seules les factures brouillon peuvent être soumises');
    }

    invoice.status = 'submitted';
    return this.invoiceRepository.save(invoice);
  }

  async cancel(id: string, companyId: string): Promise<Invoice> {
    const invoice = await this.findOne(id, companyId);

    if (invoice.status === 'paid') {
      throw new Error('Une facture payée ne peut pas être annulée');
    }

    invoice.status = 'cancelled';
    return this.invoiceRepository.save(invoice);
  }

  async validate(id: string, companyId: string, userId: string): Promise<Invoice> {
    const invoice = await this.findOne(id, companyId);
    if (invoice.status !== 'submitted') {
      throw new BadRequestException('Seules les factures soumises peuvent être validées');
    }
    invoice.status = 'validated' as any;
    const saved = await this.invoiceRepository.save(invoice);
    await this.auditService.log('invoice', id, 'validate', userId);
    return saved;
  }

  async sendInvoice(
    id: string,
    companyId: string,
    method: 'whatsapp' | 'sms' | 'email',
  ): Promise<Invoice> {
    const invoice = await this.findOne(id, companyId);

    // TODO: Implémenter l'envoi réel via WhatsApp/SMS/Email
    // Pour l'instant, on marque juste comme envoyé

    invoice.deliveryMethod = method;
    invoice.sentAt = new Date();

    return this.invoiceRepository.save(invoice);
  }

  private async generateInvoiceNumber(
    companyId: string,
    type: 'sales' | 'purchase',
  ): Promise<string> {
    const prefix = type === 'sales' ? 'FINV' : 'PINV';
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    // Compter les factures du mois
    const count = await this.invoiceRepository.count({
      where: {
        companyId,
        invoiceType: type,
      },
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `${prefix}-${year}${month}-${sequence}`;
  }

  private async generateMobileMoneyQRCode(
    provider: string,
    amount: number,
    reference: string,
  ): Promise<string> {
    // Format QR Code pour Mobile Money
    // TODO: Adapter au format spécifique de chaque opérateur
    const qrData = {
      provider,
      amount,
      currency: 'XOF',
      reference,
      merchant: 'BMS',
    };

    return JSON.stringify(qrData);
  }
}
