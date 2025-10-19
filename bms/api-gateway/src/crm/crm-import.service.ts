import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Contact, ContactStatus, ContactType } from './entities/contact.entity';
import { Tag } from './entities/tag.entity';
import { ContactImport, ContactImportStatus } from './entities/contact-import.entity';
import { ImportContactsDto } from './dto/import-contacts.dto';
import { ExportContactsDto } from './dto/export-contacts.dto';
import { CrmService } from './crm.service';

type ParsedRow = Record<string, string>;

@Injectable()
export class CrmImportService {
  private readonly logger = new Logger(CrmImportService.name);

  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(ContactImport)
    private readonly contactImportRepository: Repository<ContactImport>,
    private readonly crmService: CrmService,
  ) {}

  async importContacts(dto: ImportContactsDto) {
    const delimiter = dto.delimiter || this.detectDelimiter(dto.csvContent);
    const lines = dto.csvContent
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      throw new BadRequestException('CSV vide ou invalide');
    }

    const headers = lines[0].split(delimiter).map((value) => value.trim().toLowerCase());
    const rows = lines.slice(1);

    const contactImport = this.contactImportRepository.create({
      companyId: dto.companyId,
      fileName: dto.fileName ?? 'import-contacts.csv',
      status: ContactImportStatus.PENDING,
      createdBy: dto.createdBy ?? null,
      totalRows: rows.length,
    });

    await this.contactImportRepository.save(contactImport);

    const errors: { row: number; message: string }[] = [];
    let successCount = 0;
    let skippedCount = 0;

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const rawRow = rows[rowIndex];
      const columns = rawRow.split(delimiter).map((value) => value.trim());
      if (columns.length === 0 || columns.every((value) => value === '')) {
        skippedCount++;
        continue;
      }

      try {
        const parsedRow = this.mapRow(headers, columns);
        const contact = await this.buildContactFromRow(parsedRow, dto);

        const duplicate = await this.contactRepository.findOne({
          where: {
            companyId: dto.companyId,
            email: contact.email ?? undefined,
            phone: contact.phone ?? undefined,
          } as any,
        });

        if (duplicate) {
          skippedCount++;
          continue;
        }

        const tags = await this.resolveTags(parsedRow.tags, dto.companyId);
        contact.tags = tags;

        const savedContact = await this.contactRepository.save(contact);

        await this.crmService.updateContactStats(savedContact.id, dto.companyId);

        successCount++;
      } catch (error) {
        this.logger.warn(`Erreur import ligne ${rowIndex + 2}: ${error.message}`);
        errors.push({ row: rowIndex + 2, message: error.message });
      }
    }

    contactImport.successCount = successCount;
    contactImport.skippedCount = skippedCount;
    contactImport.errorCount = errors.length;
    contactImport.errors = errors;
    contactImport.status =
      errors.length > 0 && successCount === 0
        ? ContactImportStatus.FAILED
        : ContactImportStatus.COMPLETED;

    await this.contactImportRepository.save(contactImport);

    return {
      importId: contactImport.id,
      status: contactImport.status,
      totalRows: contactImport.totalRows,
      successCount,
      skippedCount,
      errorCount: errors.length,
      errors,
    };
  }

  async exportContacts(dto: ExportContactsDto) {
    const delimiter = dto.delimiter || ';';
    const contactsQuery = this.contactRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.tags', 'tags')
      .where('contact.companyId = :companyId', { companyId: dto.companyId });

    if (dto.search) {
      contactsQuery.andWhere(
        '(contact.companyName ILIKE :search OR contact.firstName ILIKE :search OR contact.lastName ILIKE :search OR contact.email ILIKE :search)',
        { search: `%${dto.search}%` },
      );
    }

    if (dto.type) {
      contactsQuery.andWhere('contact.type = :type', { type: dto.type });
    }

    if (dto.status) {
      contactsQuery.andWhere('contact.status = :status', { status: dto.status });
    }

    if (dto.assignedToId) {
      contactsQuery.andWhere('contact.assignedToId = :assignedToId', { assignedToId: dto.assignedToId });
    }

    if (dto.tagIds && dto.tagIds.length > 0) {
      contactsQuery.innerJoin('contact.tags', 'exportTags', 'exportTags.id IN (:...tagIds)', {
        tagIds: dto.tagIds,
      });
    }

    contactsQuery.orderBy('contact.createdAt', 'DESC');

    const contacts = await contactsQuery.getMany();

    const header = [
      'Type',
      'Statut',
      'Société',
      'Prénom',
      'Nom',
      'Poste',
      'Email',
      'Téléphone',
      'Mobile',
      'Site Web',
      'Adresse 1',
      'Adresse 2',
      'Ville',
      'Code Postal',
      'Pays',
      'N° TVA',
      'Score',
      'Valeur Vie',
      'Opportunités',
      'Factures',
      'Dernier Contact',
      'Prochaine Relance',
      'Tags',
      'Notes',
    ];

    const rows = contacts.map((contact) => [
      contact.type,
      contact.status,
      contact.companyName ?? '',
      contact.firstName ?? '',
      contact.lastName ?? '',
      contact.position ?? '',
      contact.email ?? '',
      contact.phone ?? '',
      contact.mobile ?? '',
      contact.website ?? '',
      contact.addressLine1 ?? '',
      contact.addressLine2 ?? '',
      contact.city ?? '',
      contact.postalCode ?? '',
      contact.country ?? '',
      contact.vatNumber ?? '',
      String(contact.leadScore ?? 0),
      contact.lifetimeValue?.toString() ?? '0',
      String(contact.opportunityCount ?? 0),
      String(contact.invoiceCount ?? 0),
      contact.lastContactDate ? contact.lastContactDate.toISOString().split('T')[0] : '',
      contact.nextFollowUpDate ? contact.nextFollowUpDate.toISOString().split('T')[0] : '',
      contact.tags?.map((tag) => tag.name).join('|') ?? '',
      this.sanitizeValue(contact.notes ?? ''),
    ]);

    const csvContent = [header, ...rows]
      .map((columns) => columns.map((value) => this.escapeValue(value, delimiter)).join(delimiter))
      .join('\n');

    const fileName = `contacts-${new Date().toISOString().split('T')[0]}.csv`;

    return {
      fileName,
      mimeType: 'text/csv; charset=utf-8',
      base64Data: Buffer.from(csvContent, 'utf8').toString('base64'),
      rowCount: contacts.length,
    };
  }

  private detectDelimiter(csv: string): string {
    const commaCount = (csv.match(/,/g) || []).length;
    const semicolonCount = (csv.match(/;/g) || []).length;
    return semicolonCount >= commaCount ? ';' : ',';
  }

  private mapRow(headers: string[], columns: string[]): ParsedRow {
    const row: ParsedRow = {};
    headers.forEach((header, index) => {
      row[header] = columns[index] ?? '';
    });
    return row;
  }

  private async buildContactFromRow(row: ParsedRow, dto: ImportContactsDto): Promise<Contact> {
    const contact = this.contactRepository.create({
      companyId: dto.companyId,
      type: this.resolveType(row.type, dto.defaultType ?? ContactType.PROSPECT),
      status: this.resolveStatus(row.status, dto.defaultStatus ?? ContactStatus.ACTIVE),
      companyName: row['company'] || row['companyname'] || row['société'] || null,
      firstName: row['firstname'] || row['first_name'] || row['prénom'] || null,
      lastName: row['lastname'] || row['last_name'] || row['nom'] || null,
      position: row['position'] || row['title'] || null,
      email: this.sanitizeValue(row['email'] || row['courriel']) || null,
      phone: this.sanitizeValue(row['phone'] || row['telephone']) || null,
      mobile: this.sanitizeValue(row['mobile'] || row['portable']) || null,
      website: this.sanitizeValue(row['website']) || null,
      addressLine1: row['address'] || row['addressline1'] || null,
      addressLine2: row['addressline2'] || null,
      city: row['city'] || row['ville'] || null,
      postalCode: row['postalcode'] || row['codepostal'] || null,
      country: row['country'] || row['pays'] || 'BJ',
      vatNumber: row['vatnumber'] || row['n° tva'] || null,
      notes: row['notes'] || null,
      leadScore: row['score'] ? Number(row['score']) || 0 : 0,
      nextFollowUpDate: row['nextfollowupdate'] ? new Date(row['nextfollowupdate']) : null,
      lastContactDate: row['lastcontactdate'] ? new Date(row['lastcontactdate']) : null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return contact;
  }

  private resolveType(value: string | undefined, defaultType: ContactType): ContactType {
    if (!value) return defaultType;
    const lower = value.toLowerCase();
    const mapping: Record<string, ContactType> = {
      client: ContactType.CLIENT,
      customer: ContactType.CLIENT,
      prospect: ContactType.PROSPECT,
      supplier: ContactType.SUPPLIER,
      fournisseur: ContactType.SUPPLIER,
      partner: ContactType.PARTNER,
      partenaire: ContactType.PARTNER,
    };
    return mapping[lower] ?? defaultType;
  }

  private resolveStatus(value: string | undefined, defaultStatus: ContactStatus): ContactStatus {
    if (!value) return defaultStatus;
    const lower = value.toLowerCase();
    const mapping: Record<string, ContactStatus> = {
      active: ContactStatus.ACTIVE,
      inactif: ContactStatus.INACTIVE,
      inactive: ContactStatus.INACTIVE,
      archived: ContactStatus.ARCHIVED,
      archivé: ContactStatus.ARCHIVED,
    };
    return mapping[lower] ?? defaultStatus;
  }

  private async resolveTags(rawTags: string | undefined, companyId: string): Promise<Tag[]> {
    if (!rawTags) {
      return [];
    }

    const tagNames = rawTags
      .split(/\||,/)
      .map((value) => value.trim())
      .filter((value) => value.length > 0);

    if (tagNames.length === 0) {
      return [];
    }

    const existingTags = await this.tagRepository.find({
      where: {
        companyId,
        name: In(tagNames),
      },
    });

    const existingTagNames = existingTags.map((tag) => tag.name.toLowerCase());

    const newTags = tagNames
      .filter((name) => !existingTagNames.includes(name.toLowerCase()))
      .map((name) =>
        this.tagRepository.create({
          name,
          companyId,
        }),
      );

    if (newTags.length > 0) {
      const savedNewTags = await this.tagRepository.save(newTags);
      return [...existingTags, ...savedNewTags];
    }

    return existingTags;
  }

  private sanitizeValue(value: string): string {
    return value?.replace(/\r|\n|\t/g, ' ').trim() ?? '';
  }

  private escapeValue(value: string, delimiter: string): string {
    const needsQuotes = value.includes(delimiter) || value.includes('"') || value.includes('\n');
    const sanitized = value.replace(/"/g, '""');
    return needsQuotes ? `"${sanitized}"` : sanitized;
  }
}
