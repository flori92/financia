# 💻 CODE DE DÉMARRAGE - MODULE CRM

Code prêt à l'emploi pour démarrer le Sprint 1 immédiatement.

---

## 📂 STRUCTURE FICHIERS À CRÉER

```
bms/api-gateway/src/crm/
├── entities/
│   ├── contact.entity.ts
│   ├── tag.entity.ts
│   ├── opportunity.entity.ts
│   └── activity.entity.ts
├── dto/
│   ├── create-contact.dto.ts
│   ├── update-contact.dto.ts
│   └── filter-contacts.dto.ts
├── crm.service.ts
├── crm.controller.ts
└── crm.module.ts
```

---

## 1️⃣ Contact Entity (COMPLET)

```typescript
// bms/api-gateway/src/crm/entities/contact.entity.ts

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../auth/entities/user.entity';

export enum ContactType {
  CLIENT = 'client',
  PROSPECT = 'prospect',
  SUPPLIER = 'supplier',
  PARTNER = 'partner',
}

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
}

@Entity('contacts')
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ContactType })
  type: ContactType;

  @Column({ type: 'enum', enum: ContactStatus, default: ContactStatus.ACTIVE })
  status: ContactStatus;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  mobile: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  addressLine1: string;

  @Column({ nullable: true })
  addressLine2: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ nullable: true, default: 'BJ' })
  country: string;

  @Column({ nullable: true })
  taxId: string;

  @Column({ nullable: true })
  vatNumber: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  lifetimeValue: number;

  @Column({ type: 'int', default: 0 })
  opportunityCount: number;

  @Column({ type: 'int', default: 0 })
  invoiceCount: number;

  @Column({ type: 'date', nullable: true })
  lastContactDate: Date;

  @Column({ type: 'date', nullable: true })
  nextFollowUpDate: Date;

  @Column({ type: 'int', default: 0 })
  leadScore: number;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column()
  companyId: string;

  @ManyToOne(() => Company)
  company: Company;

  @Column({ nullable: true })
  assignedToId: string;

  @ManyToOne(() => User, { nullable: true })
  assignedTo: User;

  @Column({ nullable: true })
  source: string;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}
```

---

## 2️⃣ CreateContactDto (COMPLET)

```typescript
// bms/api-gateway/src/crm/dto/create-contact.dto.ts

import { IsEmail, IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ContactType } from '../entities/contact.entity';

export class CreateContactDto {
  @ApiProperty({ enum: ContactType, example: 'client' })
  @IsEnum(ContactType)
  type: ContactType;

  @ApiPropertyOptional({ example: 'SARL Tech Solutions' })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'Jean' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Dupont' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'Directeur Commercial' })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({ example: 'jean.dupont@techsolutions.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+229 21 30 40 50' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: '+229 97 12 34 56' })
  @IsOptional()
  @IsString()
  mobile?: string;

  @ApiPropertyOptional({ example: 'www.techsolutions.com' })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  addressLine1?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: '1805bc61-7cfd-44e9-8a63-17187bf05dc7' })
  @IsString()
  companyId: string;
}
```

---

## 3️⃣ CRM Service (COMPLET)

```typescript
// bms/api-gateway/src/crm/crm.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Contact, ContactType } from './entities/contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';

@Injectable()
export class CrmService {
  constructor(
    @InjectRepository(Contact)
    private contactsRepository: Repository<Contact>,
  ) {}

  async createContact(dto: CreateContactDto, userId: string): Promise<Contact> {
    // Vérifier email unique
    if (dto.email) {
      const existing = await this.contactsRepository.findOne({
        where: { email: dto.email, companyId: dto.companyId },
      });
      if (existing) {
        throw new BadRequestException(`Contact avec email ${dto.email} existe déjà`);
      }
    }

    const contact = this.contactsRepository.create({
      ...dto,
      createdBy: userId,
    });

    return await this.contactsRepository.save(contact);
  }

  async findAll(
    companyId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    type?: ContactType,
  ): Promise<{ contacts: Contact[]; total: number }> {
    const query = this.contactsRepository
      .createQueryBuilder('contact')
      .leftJoinAndSelect('contact.assignedTo', 'assignedTo')
      .where('contact.companyId = :companyId', { companyId })
      .andWhere('contact.isArchived = :isArchived', { isArchived: false });

    if (type) {
      query.andWhere('contact.type = :type', { type });
    }

    if (search) {
      query.andWhere(
        '(contact.companyName ILIKE :search OR contact.firstName ILIKE :search OR contact.lastName ILIKE :search OR contact.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    query
      .orderBy('contact.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [contacts, total] = await query.getManyAndCount();

    return { contacts, total };
  }

  async findOne(id: string, companyId: string): Promise<Contact> {
    const contact = await this.contactsRepository.findOne({
      where: { id, companyId },
      relations: ['assignedTo'],
    });

    if (!contact) {
      throw new NotFoundException(`Contact ${id} introuvable`);
    }

    return contact;
  }

  async update(id: string, dto: Partial<CreateContactDto>, userId: string): Promise<Contact> {
    const contact = await this.findOne(id, dto.companyId);

    Object.assign(contact, {
      ...dto,
      updatedBy: userId,
    });

    return await this.contactsRepository.save(contact);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const contact = await this.findOne(id, companyId);
    contact.isArchived = true;
    await this.contactsRepository.save(contact);
  }

  async getStats(companyId: string): Promise<{
    total: number;
    clients: number;
    prospects: number;
    suppliers: number;
  }> {
    const [total, clients, prospects, suppliers] = await Promise.all([
      this.contactsRepository.count({ where: { companyId, isArchived: false } }),
      this.contactsRepository.count({ where: { companyId, type: ContactType.CLIENT, isArchived: false } }),
      this.contactsRepository.count({ where: { companyId, type: ContactType.PROSPECT, isArchived: false } }),
      this.contactsRepository.count({ where: { companyId, type: ContactType.SUPPLIER, isArchived: false } }),
    ]);

    return { total, clients, prospects, suppliers };
  }
}
```

---

## 4️⃣ CRM Controller (COMPLET)

```typescript
// bms/api-gateway/src/crm/crm.controller.ts

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CrmService } from './crm.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactType } from './entities/contact.entity';

@ApiTags('CRM')
@Controller('crm')
@UseGuards(JwtAuthGuard)
export class CrmController {
  constructor(private readonly crmService: CrmService) {}

  @Post('contacts')
  @ApiOperation({ summary: 'Créer un contact' })
  @ApiResponse({ status: 201, description: 'Contact créé' })
  async createContact(@Body() dto: CreateContactDto, @Request() req) {
    return await this.crmService.createContact(dto, req.user.id);
  }

  @Get('contacts')
  @ApiOperation({ summary: 'Lister les contacts' })
  @ApiQuery({ name: 'companyId', required: true })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'type', required: false, enum: ContactType })
  async getContacts(
    @Query('companyId') companyId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('type') type?: ContactType,
  ) {
    return await this.crmService.findAll(
      companyId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 20,
      search,
      type,
    );
  }

  @Get('contacts/stats')
  @ApiOperation({ summary: 'Statistiques contacts' })
  async getStats(@Query('companyId') companyId: string) {
    return await this.crmService.getStats(companyId);
  }

  @Get('contacts/:id')
  @ApiOperation({ summary: 'Obtenir un contact' })
  async getContact(@Param('id') id: string, @Query('companyId') companyId: string) {
    return await this.crmService.findOne(id, companyId);
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Mettre à jour un contact' })
  async updateContact(
    @Param('id') id: string,
    @Body() dto: Partial<CreateContactDto>,
    @Request() req,
  ) {
    return await this.crmService.update(id, dto, req.user.id);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Supprimer un contact' })
  async deleteContact(@Param('id') id: string, @Query('companyId') companyId: string) {
    await this.crmService.remove(id, companyId);
    return { message: 'Contact archivé avec succès' };
  }
}
```

---

## 5️⃣ CRM Module (COMPLET)

```typescript
// bms/api-gateway/src/crm/crm.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmService } from './crm.service';
import { CrmController } from './crm.controller';
import { Contact } from './entities/contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contact])],
  controllers: [CrmController],
  providers: [CrmService],
  exports: [CrmService],
})
export class CrmModule {}
```

---

## 6️⃣ Migration TypeORM

```typescript
// bms/api-gateway/src/migrations/XXXXXX-CreateCrmTables.ts

import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCrmTables1699000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'contacts',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['client', 'prospect', 'supplier', 'partner'],
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['active', 'inactive', 'archived'],
            default: "'active'",
          },
          { name: 'company_name', type: 'varchar', isNullable: true },
          { name: 'first_name', type: 'varchar', isNullable: true },
          { name: 'last_name', type: 'varchar', isNullable: true },
          { name: 'position', type: 'varchar', isNullable: true },
          { name: 'email', type: 'varchar', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'mobile', type: 'varchar', isNullable: true },
          { name: 'website', type: 'varchar', isNullable: true },
          { name: 'address_line1', type: 'varchar', isNullable: true },
          { name: 'address_line2', type: 'varchar', isNullable: true },
          { name: 'city', type: 'varchar', isNullable: true },
          { name: 'postal_code', type: 'varchar', isNullable: true },
          { name: 'country', type: 'varchar', isNullable: true, default: "'BJ'" },
          { name: 'tax_id', type: 'varchar', isNullable: true },
          { name: 'vat_number', type: 'varchar', isNullable: true },
          {
            name: 'lifetime_value',
            type: 'decimal',
            precision: 15,
            scale: 2,
            default: 0,
          },
          { name: 'opportunity_count', type: 'int', default: 0 },
          { name: 'invoice_count', type: 'int', default: 0 },
          { name: 'last_contact_date', type: 'date', isNullable: true },
          { name: 'next_follow_up_date', type: 'date', isNullable: true },
          { name: 'lead_score', type: 'int', default: 0 },
          { name: 'custom_fields', type: 'jsonb', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'company_id', type: 'uuid' },
          { name: 'assigned_to_id', type: 'uuid', isNullable: true },
          { name: 'source', type: 'varchar', isNullable: true },
          { name: 'is_archived', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'updated_by', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    // Index pour performance
    await queryRunner.query(`CREATE INDEX idx_contacts_company ON contacts(company_id)`);
    await queryRunner.query(`CREATE INDEX idx_contacts_email ON contacts(email)`);
    await queryRunner.query(`CREATE INDEX idx_contacts_type ON contacts(type)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('contacts');
  }
}
```

---

## 🚀 COMMANDES DE DÉMARRAGE

```bash
# 1. Créer le module
cd bms/api-gateway/src
nest g module crm
nest g service crm
nest g controller crm

# 2. Copier les fichiers ci-dessus dans leurs emplacements

# 3. Ajouter CrmModule dans app.module.ts imports

# 4. Générer et exécuter migration
npm run migration:generate -- -n CreateCrmTables
npm run migration:run

# 5. Tester endpoints
npm run start:dev

# 6. Accéder Swagger
# http://localhost:3001/api
```

---

## 📝 TESTS ENDPOINTS (Postman/cURL)

### Créer un contact

```bash
curl -X POST http://localhost:3001/api/v1/crm/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "client",
    "companyName": "Tech Solutions SARL",
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@techsolutions.com",
    "phone": "+229 21 30 40 50",
    "city": "Cotonou",
    "country": "BJ",
    "companyId": "1805bc61-7cfd-44e9-8a63-17187bf05dc7"
  }'
```

### Lister contacts

```bash
curl -X GET "http://localhost:3001/api/v1/crm/contacts?companyId=1805bc61-7cfd-44e9-8a63-17187bf05dc7&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Statistiques

```bash
curl -X GET "http://localhost:3001/api/v1/crm/contacts/stats?companyId=1805bc61-7cfd-44e9-8a63-17187bf05dc7" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## ✅ CHECKLIST SPRINT 1 (Semaine 1-2)

- [ ] Créer module CRM backend
- [ ] Implémenter Contact entity
- [ ] Créer DTOs validation
- [ ] Service CRUD complet
- [ ] Controller avec 7 endpoints
- [ ] Migration DB exécutée
- [ ] Tests Postman tous endpoints OK
- [ ] Documentation Swagger complète
- [ ] Page frontend liste contacts (basique)
- [ ] Formulaire création contact

**Après Sprint 1, vous aurez un module CRM opérationnel avec gestion contacts complète !**
