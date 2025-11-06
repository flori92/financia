import { describe, beforeAll, afterAll, afterEach, it, expect } from '@jest/globals';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { Repository } from 'typeorm';
import { HRModule } from '../hr.module';
import { HrCertificate } from '../entities/hr-certificate.entity';
import { Employee } from '../entities/employee.entity';
import { Payroll } from '../entities/payroll.entity';
import { Company } from '../../../companies/entities/company.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function seedCompany(repo: Repository<Company>) {
  const company = repo.create({
    name: 'BMS Demo',
    legalName: 'BMS Demo SARL',
    email: 'hr@bms-demo.test',
    city: 'Cotonou',
    country: 'BJ',
  });
  return repo.save(company);
}

async function seedEmployee(repo: Repository<Employee>, companyId: string) {
  const employee = repo.create({
    companyId,
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@test.com',
    phone: '+22900000000',
    position: 'Développeur',
    department: 'Tech',
    baseSalary: 400000,
    hireDate: new Date('2020-01-15'),
    status: 'active',
  });
  return repo.save(employee);
}

describe('HR Certificates (e2e)', () => {
  let app: INestApplication;
  let company: Company;
  let employee: Employee;
  let certificateRepo: Repository<HrCertificate>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Company, Employee, Payroll, HrCertificate],
          synchronize: true,
        }),
        HRModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api/v1');
    await app.init();

    const companyRepo = moduleFixture.get<Repository<Company>>(getRepositoryToken(Company));
    const employeeRepo = moduleFixture.get<Repository<Employee>>(getRepositoryToken(Employee));
    certificateRepo = moduleFixture.get<Repository<HrCertificate>>(getRepositoryToken(HrCertificate));

    company = await seedCompany(companyRepo);
    employee = await seedEmployee(employeeRepo, company.id);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await certificateRepo.delete({ companyId: company.id });
  });

  const basePath = '/api/v1/hr';

  it('crée une demande d’attestation et la retrouve dans la liste', async () => {
    const resCreate = await request(app.getHttpServer())
      .post(`${basePath}/certificates`)
      .send({
        companyId: company.id,
        employeeId: employee.id,
        type: 'attestation_emploi',
        purpose: 'Demande de visa',
      })
      .expect(201);

    expect(resCreate.body).toMatchObject({
      companyId: company.id,
      employeeId: employee.id,
      type: 'attestation_emploi',
      status: 'pending',
    });

    const resList = await request(app.getHttpServer())
      .get(`${basePath}/certificates`)
      .query({ companyId: company.id })
      .expect(200);

    expect(Array.isArray(resList.body)).toBe(true);
    expect(resList.body).toHaveLength(1);
    expect(resList.body[0]).toMatchObject({
      id: resCreate.body.id,
      status: 'pending',
    });
  });

  it('génère le PDF, le télécharge puis marque l’attestation délivrée', async () => {
    const { body: created } = await request(app.getHttpServer())
      .post(`${basePath}/certificates`)
      .send({
        companyId: company.id,
        employeeId: employee.id,
        type: 'attestation_salaire',
      })
      .expect(201);

    const resGenerate = await request(app.getHttpServer())
      .post(`${basePath}/certificates/${created.id}/generate`)
      .send({ companyId: company.id, issuedBy: 'Service RH' })
      .expect(201);

    expect(resGenerate.body).toMatchObject({
      id: created.id,
      mimeType: 'application/pdf',
    });

    const resDownload = await request(app.getHttpServer())
      .get(`${basePath}/certificates/${created.id}/download`)
      .query({ companyId: company.id })
      .expect(200);

    expect(resDownload.header['content-type']).toBe('application/pdf');
    expect(Number(resDownload.header['content-length'])).toBeGreaterThan(0);

    const resDeliver = await request(app.getHttpServer())
      .post(`${basePath}/certificates/${created.id}/deliver`)
      .send({ companyId: company.id })
      .expect(201);

    expect(resDeliver.body).toMatchObject({
      id: created.id,
      status: 'delivered',
    });
  });
});
