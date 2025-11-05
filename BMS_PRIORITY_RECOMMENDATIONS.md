# BMS Priority Recommendations & Implementation Roadmap

## PRIORITY 1: CRITICAL (Weeks 1-2)

### 1.1 Fix Database Schema Management

**Problem:** TypeORM synchronize is disabled, schema.sql exists but isn't used properly.

**Solution:**
```bash
# Create proper migration system
cd bms/api-gateway
npm run typeorm migration:generate -- -n InitialSchema
npm run typeorm migration:run
```

**Files to create:**
- `bms/api-gateway/ormconfig.ts` - TypeORM configuration
- `bms/api-gateway/src/database/migrations/` - Proper migration files

**Implementation:**
```typescript
// ormconfig.ts
export default {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  cli: {
    migrationsDir: 'src/database/migrations'
  }
}
```

### 1.2 Enable Redis Caching

**Problem:** Redis is configured but commented out in AppModule.

**Solution:**
```typescript
// bms/api-gateway/src/app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST', 'localhost'),
        port: config.get('REDIS_PORT', 6379),
        ttl: 300, // 5 minutes default
      }),
    }),
    // ... other imports
  ]
})
```

**Usage in services:**
```typescript
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class InvoicesService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
  
  async getInvoices(companyId: string) {
    const cacheKey = `invoices:${companyId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;
    
    const invoices = await this.invoicesRepo.find({ where: { companyId } });
    await this.cacheManager.set(cacheKey, invoices, 300);
    return invoices;
  }
}
```

### 1.3 Implement Rate Limiting

**Files to create:**
- `bms/api-gateway/src/common/guards/rate-limit.guard.ts`

**Implementation:**
```typescript
import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRedis() private redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const key = `rate-limit:${ip}`;
    
    const requests = await this.redis.incr(key);
    if (requests === 1) {
      await this.redis.expire(key, 60); // 1 minute window
    }
    
    if (requests > 100) { // 100 requests per minute
      throw new HttpException('Too many requests', 429);
    }
    
    return true;
  }
}
```

### 1.4 Complete Storage Provider Implementation

**Problem:** MinIO configured but storage provider incomplete.

**Files to create:**
- `bms/api-gateway/src/uploads/providers/minio.provider.ts`

**Implementation:**
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { StorageProvider } from './storage-provider.interface';

@Injectable()
export class MinioProvider implements StorageProvider {
  private client: Minio.Client;
  private bucket: string;

  constructor(private config: ConfigService) {
    this.client = new Minio.Client({
      endPoint: config.get('MINIO_ENDPOINT'),
      port: parseInt(config.get('MINIO_PORT', '9000')),
      useSSL: config.get('MINIO_USE_SSL') === 'true',
      accessKey: config.get('MINIO_ACCESS_KEY'),
      secretKey: config.get('MINIO_SECRET_KEY'),
    });
    this.bucket = config.get('MINIO_BUCKET', 'bms-documents');
    this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
    }
  }

  async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    await this.client.putObject(this.bucket, fileName, buffer);
    return fileName;
  }

  async getFile(filePath: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, filePath);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.client.removeObject(this.bucket, filePath);
  }

  async getSignedUrl(filePath: string, expirySeconds = 3600): Promise<string> {
    return this.client.presignedGetObject(this.bucket, filePath, expirySeconds);
  }
}
```

### 1.5 Implement Comprehensive Error Handling

**Files to create:**
- `bms/api-gateway/src/common/filters/all-exceptions.filter.ts`
- `bms/api-gateway/src/common/interceptors/logging.interceptor.ts`

**Implementation:**
```typescript
// all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: typeof message === 'string' ? message : (message as any).message,
      error: exception instanceof Error ? exception.message : 'Unknown error',
    };

    // Log error
    console.error('Exception caught:', {
      ...errorResponse,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(errorResponse);
  }
}
```

Register in main.ts:
```typescript
app.useGlobalFilters(new AllExceptionsFilter());
```

---

## PRIORITY 2: HIGH (Weeks 3-4)

### 2.1 Complete Banking Integrations

**Missing integrations:**
- Bridge API
- EBICS
- Open Banking PSD2

**Files to create:**
- `bms/api-gateway/src/integrations/banking/bridge-api.service.ts`
- `bms/api-gateway/src/integrations/banking/ebics.service.ts`
- `bms/api-gateway/src/integrations/banking/open-banking.service.ts`

**Bridge API Implementation:**
```typescript
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class BridgeApiService {
  private readonly baseUrl = 'https://api.bridgeapi.io/v2';
  private readonly clientId = process.env.BRIDGE_API_CLIENT_ID;
  private readonly clientSecret = process.env.BRIDGE_API_CLIENT_SECRET;

  async authenticate(): Promise<string> {
    const response = await axios.post(`${this.baseUrl}/authenticate`, {
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });
    return response.data.access_token;
  }

  async getBanks(): Promise<any[]> {
    const token = await this.authenticate();
    const response = await axios.get(`${this.baseUrl}/banks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.resources;
  }

  async connectBank(userId: string, bankId: number, credentials: any): Promise<any> {
    const token = await this.authenticate();
    const response = await axios.post(
      `${this.baseUrl}/connect/items/add`,
      {
        prefill_email: userId,
        bank_id: bankId,
        ...credentials,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }

  async getAccounts(itemId: string): Promise<any[]> {
    const token = await this.authenticate();
    const response = await axios.get(`${this.baseUrl}/accounts`, {
      params: { item_id: itemId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.resources;
  }

  async getTransactions(accountId: string, since?: Date): Promise<any[]> {
    const token = await this.authenticate();
    const response = await axios.get(`${this.baseUrl}/transactions`, {
      params: {
        account_id: accountId,
        since: since?.toISOString(),
        limit: 500,
      },
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.resources;
  }
}
```

### 2.2 Complete E-commerce Integrations

**Files to create:**
- `bms/api-gateway/src/integrations/ecommerce/woocommerce.service.ts`
- `bms/api-gateway/src/integrations/ecommerce/prestashop.service.ts`

**WooCommerce Implementation:**
```typescript
import { Injectable } from '@nestjs/common';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

@Injectable()
export class WooCommerceService {
  private api: WooCommerceRestApi;

  constructor(storeUrl: string, consumerKey: string, consumerSecret: string) {
    this.api = new WooCommerceRestApi({
      url: storeUrl,
      consumerKey,
      consumerSecret,
      version: 'wc/v3',
    });
  }

  async getOrders(status?: string): Promise<any[]> {
    const response = await this.api.get('orders', { status, per_page: 100 });
    return response.data;
  }

  async getProducts(): Promise<any[]> {
    const response = await this.api.get('products', { per_page: 100 });
    return response.data;
  }

  async getCustomers(): Promise<any[]> {
    const response = await this.api.get('customers', { per_page: 100 });
    return response.data;
  }

  async updateStock(productId: number, quantity: number): Promise<void> {
    await this.api.put(`products/${productId}`, {
      stock_quantity: quantity,
    });
  }

  async createInvoiceFromOrder(order: any): Promise<any> {
    return {
      customerName: `${order.billing.first_name} ${order.billing.last_name}`,
      customerEmail: order.billing.email,
      items: order.line_items.map((item: any) => ({
        description: item.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.price),
        total: parseFloat(item.total),
      })),
      total: parseFloat(order.total),
      currency: order.currency,
      externalId: order.id.toString(),
      externalSource: 'woocommerce',
    };
  }
}
```

### 2.3 Implement SEPA Direct Debit

**Files to enhance:**
- `bms/api-gateway/src/modules/sepa/sepa.service.ts`
- `bms/api-gateway/src/modules/sepa/sepa.controller.ts`

**Implementation:**
```typescript
import { Injectable } from '@nestjs/common';
import { create } from 'xmlbuilder2';

@Injectable()
export class SepaService {
  generateSepaXml(mandates: any[]): string {
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('Document', {
        xmlns: 'urn:iso:std:iso:20022:tech:xsd:pain.008.001.02',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
      })
      .ele('CstmrDrctDbtInitn')
        .ele('GrpHdr')
          .ele('MsgId').txt('MSG-' + Date.now()).up()
          .ele('CreDtTm').txt(new Date().toISOString()).up()
          .ele('NbOfTxs').txt(mandates.length.toString()).up()
          .ele('CtrlSum').txt(this.calculateTotal(mandates).toFixed(2)).up()
          .ele('InitgPty')
            .ele('Nm').txt('Your Company Name').up()
          .up()
        .up()
        .ele('PmtInf')
          .ele('PmtInfId').txt('PMT-' + Date.now()).up()
          .ele('PmtMtd').txt('DD').up()
          .ele('NbOfTxs').txt(mandates.length.toString()).up()
          .ele('CtrlSum').txt(this.calculateTotal(mandates).toFixed(2)).up()
          .ele('ReqdColltnDt').txt(new Date().toISOString().split('T')[0]).up();

    mandates.forEach(mandate => {
      doc.ele('DrctDbtTxInf')
        .ele('PmtId')
          .ele('EndToEndId').txt(mandate.id).up()
        .up()
        .ele('InstdAmt', { Ccy: 'EUR' }).txt(mandate.amount.toFixed(2)).up()
        .ele('DrctDbtTx')
          .ele('MndtRltdInf')
            .ele('MndtId').txt(mandate.mandateId).up()
            .ele('DtOfSgntr').txt(mandate.signatureDate).up()
          .up()
        .up()
        .ele('DbtrAgt')
          .ele('FinInstnId')
            .ele('BIC').txt(mandate.bic).up()
          .up()
        .up()
        .ele('Dbtr')
          .ele('Nm').txt(mandate.debtorName).up()
        .up()
        .ele('DbtrAcct')
          .ele('Id')
            .ele('IBAN').txt(mandate.iban).up()
          .up()
        .up();
    });

    return doc.end({ prettyPrint: true });
  }

  private calculateTotal(mandates: any[]): number {
    return mandates.reduce((sum, m) => sum + m.amount, 0);
  }

  validateIBAN(iban: string): boolean {
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]+$/;
    return ibanRegex.test(iban.replace(/\s/g, ''));
  }

  validateBIC(bic: string): boolean {
    const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return bicRegex.test(bic);
  }
}
```

### 2.4 Implement Request/Response Logging

**Files to create:**
- `bms/api-gateway/src/common/interceptors/logging.interceptor.ts`

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip;

    const now = Date.now();
    
    this.logger.log(`→ ${method} ${url} - ${ip} - ${userAgent}`);
    
    if (Object.keys(body).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const response = context.switchToHttp().getResponse();
          const { statusCode } = response;
          const delay = Date.now() - now;
          
          this.logger.log(`← ${method} ${url} ${statusCode} - ${delay}ms`);
        },
        error: (error) => {
          const delay = Date.now() - now;
          this.logger.error(`← ${method} ${url} ERROR - ${delay}ms - ${error.message}`);
        },
      }),
    );
  }
}
```

Register globally:
```typescript
// app.module.ts
{
  provide: APP_INTERCEPTOR,
  useClass: LoggingInterceptor,
}
```

---

## PRIORITY 3: MEDIUM (Weeks 5-8)

### 3.1 Mobile Applications

**Technology Stack:**
- React Native with Expo
- Offline-first architecture with WatermelonDB
- Background sync

**Project Structure:**
```
bms-mobile/
├── src/
│   ├── screens/
│   ├── components/
│   ├── navigation/
│   ├── services/
│   ├── store/
│   ├── database/
│   └── utils/
├── app.json
├── package.json
└── tsconfig.json
```

**Key files to create:**
```bash
# Initialize React Native project
npx create-expo-app bms-mobile --template
cd bms-mobile
npm install @react-navigation/native @react-navigation/stack
npm install @nozbe/watermelondb @nozbe/with-observables
npm install axios react-query
npm install @react-native-async-storage/async-storage
```

**Offline sync implementation:**
```typescript
// src/services/sync.service.ts
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../database';
import apiClient from './api.client';

export async function syncDatabase() {
  await synchronize({
    database,
    pullChanges: async ({ lastPulledAt }) => {
      const response = await apiClient.get('/sync/pull', {
        params: { lastPulledAt },
      });
      return response.data;
    },
    pushChanges: async ({ changes }) => {
      await apiClient.post('/sync/push', { changes });
    },
  });
}
```

### 3.2 GraphQL API Layer

**Files to create:**
- `bms/api-gateway/src/graphql/schema.graphql`
- `bms/api-gateway/src/graphql/resolvers/`

**Installation:**
```bash
npm install @nestjs/graphql @nestjs/apollo @apollo/server graphql
```

**Implementation:**
```typescript
// app.module.ts
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
      playground: true,
      context: ({ req }) => ({ req }),
    }),
    // ... other modules
  ],
})
```

**Example resolver:**
```typescript
// invoices.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';

@Resolver('Invoice')
@UseGuards(GqlAuthGuard)
export class InvoicesResolver {
  constructor(private invoicesService: InvoicesService) {}

  @Query('invoices')
  async getInvoices(@Args('companyId') companyId: string) {
    return this.invoicesService.findAll(companyId);
  }

  @Mutation('createInvoice')
  async createInvoice(@Args('input') input: CreateInvoiceInput) {
    return this.invoicesService.create(input);
  }
}
```

### 3.3 Monitoring & Observability

**Install dependencies:**
```bash
npm install @willsoto/nestjs-prometheus prom-client
npm install winston winston-daily-rotate-file
```

**Prometheus metrics:**
```typescript
// monitoring/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';

@Injectable()
export class MetricsService {
  constructor(
    @InjectMetric('http_requests_total') public httpRequestsTotal: Counter,
    @InjectMetric('http_request_duration_seconds') public httpRequestDuration: Histogram,
    @InjectMetric('active_users') public activeUsers: Gauge,
  ) {}

  recordRequest(method: string, path: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, path, status: statusCode });
    this.httpRequestDuration.observe({ method, path }, duration / 1000);
  }

  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }
}
```

**Winston logging:**
```typescript
// common/logger.service.ts
import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxSize: '20m',
          maxFiles: '14d',
        }),
        new winston.transports.Console({
          format: winston.format.simple(),
        }),
      ],
    });
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }
}
```

---

## PRIORITY 4: NICE TO HAVE (Weeks 9-12)

### 4.1 Microservices Architecture

**Recommended split:**
1. **Auth Service** - Authentication, authorization, user management
2. **Accounting Service** - Chart of accounts, journal entries, reports
3. **Invoicing Service** - Invoices, quotes, payments
4. **CRM Service** - Contacts, opportunities, pipeline
5. **Integration Service** - Banking, e-commerce, payment gateways
6. **Notification Service** - Emails, SMS, push notifications
7. **File Service** - Document storage, OCR, templates

**Communication:**
- REST APIs between services
- Message broker (RabbitMQ or Kafka) for async events
- API Gateway for routing

### 4.2 Advanced Testing

**Unit tests:**
```bash
npm install --save-dev @nestjs/testing jest @types/jest
```

**E2E tests:**
```bash
npm install --save-dev @playwright/test
```

**Load testing:**
```bash
npm install --save-dev artillery
```

### 4.3 CI/CD Pipeline

**GitHub Actions workflow:**
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: bms-api:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Deploy commands here
```

---

## IMPLEMENTATION TIMELINE

### Week 1-2: Critical Fixes
- [ ] Fix database migrations
- [ ] Enable Redis caching
- [ ] Implement rate limiting
- [ ] Complete storage provider
- [ ] Add comprehensive error handling

### Week 3-4: High Priority
- [ ] Complete banking integrations (Bridge, EBICS)
- [ ] Complete e-commerce integrations (WooCommerce, PrestaShop)
- [ ] Implement SEPA direct debit
- [ ] Add request/response logging
- [ ] Implement password policies

### Week 5-8: Medium Priority
- [ ] Build mobile apps (iOS/Android)
- [ ] Implement offline sync
- [ ] Add GraphQL API
- [ ] Setup monitoring (Prometheus, Grafana)
- [ ] Implement distributed logging

### Week 9-12: Nice to Have
- [ ] Refactor to microservices
- [ ] Add comprehensive testing
- [ ] Setup CI/CD pipeline
- [ ] Implement event sourcing
- [ ] Add multi-language support

---

## QUICK WINS (Can be done immediately)

1. **Enable Redis** - Uncomment in AppModule (5 minutes)
2. **Add .env validation** - Use class-validator (30 minutes)
3. **Fix TypeScript warnings** - Run linter and fix (1 hour)
4. **Add API response types** - Create DTOs for all endpoints (2 hours)
5. **Document all endpoints** - Add Swagger decorators (3 hours)
6. **Add health check endpoints** - Already exists, just expose (30 minutes)
7. **Setup database backups** - Add pg_dump cron job (1 hour)
8. **Add request ID tracking** - UUID middleware (1 hour)
9. **Implement API versioning** - Add v2 routes (2 hours)
10. **Add security headers** - Already has Helmet, configure properly (30 minutes)

---

## ESTIMATED EFFORT

- **Critical (P1):** 80 hours
- **High (P2):** 120 hours
- **Medium (P3):** 200 hours
- **Nice to Have (P4):** 160 hours

**Total:** ~560 hours (~14 weeks with 1 developer, ~7 weeks with 2 developers)

---

## NEXT IMMEDIATE STEPS

1. Run `npm install` in both backend and frontend
2. Setup PostgreSQL database
3. Run database migrations
4. Enable Redis and test caching
5. Implement rate limiting
6. Complete storage provider
7. Add comprehensive error handling
8. Test all existing endpoints
9. Fix any broken integrations
10. Document all APIs properly

