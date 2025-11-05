# BMS Immediate Action Plan
**Start Date:** Today  
**Duration:** 2 Weeks  
**Goal:** Fix critical issues and stabilize the platform

---

## DAY 1: Database & Infrastructure Setup

### Morning (4 hours)
```bash
# 1. Fix TypeORM configuration
cd bms/api-gateway

# Create ormconfig.ts
cat > ormconfig.ts << 'EOF'
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

export default new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: parseInt(configService.get('DB_PORT', '5432')),
  username: configService.get('DB_USER', 'postgres'),
  password: configService.get('DB_PASSWORD', 'postgres'),
  database: configService.get('DB_NAME', 'bms'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
EOF

# 2. Generate initial migration
npm run typeorm migration:generate -- -n InitialSchema

# 3. Run migrations
npm run typeorm migration:run

# 4. Verify database
psql -U postgres -d bms -c "\dt"
```

### Afternoon (4 hours)
```bash
# 5. Setup Redis
docker run -d --name bms-redis -p 6379:6379 redis:alpine

# 6. Enable Redis in AppModule
# Edit bms/api-gateway/src/app.module.ts
# Uncomment Redis cache configuration

# 7. Install cache dependencies
npm install cache-manager cache-manager-redis-store

# 8. Test Redis connection
redis-cli ping
```

---

## DAY 2: Security Hardening

### Morning (4 hours)
```bash
# 1. Implement rate limiting
cd bms/api-gateway/src/common/guards
cat > rate-limit.guard.ts << 'EOF'
import { Injectable, CanActivate, ExecutionContext, HttpException } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(@InjectRedis() private redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ip = request.ip;
    const key = `rate-limit:${ip}`;
    
    const requests = await this.redis.incr(key);
    if (requests === 1) {
      await this.redis.expire(key, 60);
    }
    
    if (requests > 100) {
      throw new HttpException('Too many requests', 429);
    }
    
    return true;
  }
}
EOF

# 2. Add to app.module.ts providers
# {
#   provide: APP_GUARD,
#   useClass: RateLimitGuard,
# }

# 3. Install dependencies
npm install @nestjs-modules/ioredis ioredis
```

### Afternoon (4 hours)
```bash
# 4. Implement comprehensive error handling
cd bms/api-gateway/src/common/filters
cat > all-exceptions.filter.ts << 'EOF'
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('ExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

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
    };

    this.logger.error(`${request.method} ${request.url}`, exception instanceof Error ? exception.stack : 'Unknown error');

    response.status(status).json(errorResponse);
  }
}
EOF

# 5. Register in main.ts
# app.useGlobalFilters(new AllExceptionsFilter());
```

---

## DAY 3: Storage & File Management

### Morning (4 hours)
```bash
# 1. Setup MinIO
docker run -d \
  -p 9000:9000 \
  -p 9001:9001 \
  --name bms-minio \
  -e "MINIO_ROOT_USER=minioadmin" \
  -e "MINIO_ROOT_PASSWORD=minioadmin" \
  minio/minio server /data --console-address ":9001"

# 2. Create MinIO provider
cd bms/api-gateway/src/uploads/providers
cat > minio.provider.ts << 'EOF'
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
      endPoint: config.get('MINIO_ENDPOINT', 'localhost'),
      port: parseInt(config.get('MINIO_PORT', '9000')),
      useSSL: config.get('MINIO_USE_SSL') === 'true',
      accessKey: config.get('MINIO_ACCESS_KEY', 'minioadmin'),
      secretKey: config.get('MINIO_SECRET_KEY', 'minioadmin'),
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
EOF

# 3. Update uploads.module.ts to provide MinioProvider
```

### Afternoon (4 hours)
```bash
# 4. Test file upload
curl -X POST http://localhost:3001/api/v1/uploads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.pdf"

# 5. Verify in MinIO console
open http://localhost:9001

# 6. Test file download
curl http://localhost:3001/api/v1/uploads/FILE_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o downloaded.pdf
```

---

## DAY 4-5: Complete Banking Integrations

### Bridge API Implementation
```bash
cd bms/api-gateway/src/integrations/banking
cat > bridge-api.service.ts << 'EOF'
import { Injectable, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class BridgeApiService {
  private readonly baseUrl = 'https://api.bridgeapi.io/v2';
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private config: ConfigService) {
    this.clientId = config.get('BRIDGE_API_CLIENT_ID');
    this.clientSecret = config.get('BRIDGE_API_CLIENT_SECRET');
  }

  async authenticate(): Promise<string> {
    try {
      const response = await axios.post(`${this.baseUrl}/authenticate`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });
      return response.data.access_token;
    } catch (error) {
      throw new HttpException('Bridge API authentication failed', 500);
    }
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

  async syncTransactions(itemId: string): Promise<void> {
    const token = await this.authenticate();
    await axios.post(
      `${this.baseUrl}/connect/items/${itemId}/refresh`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }
}
EOF

# Add to banking.module.ts providers
```

---

## DAY 6-7: E-commerce Integrations

### WooCommerce Integration
```bash
cd bms/api-gateway/src/integrations/ecommerce

# Install WooCommerce SDK
npm install @woocommerce/woocommerce-rest-api

cat > woocommerce.service.ts << 'EOF'
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

  async syncOrders(companyId: string): Promise<number> {
    const orders = await this.getOrders('processing');
    let synced = 0;
    
    for (const order of orders) {
      // Create invoice from order
      const invoiceData = this.transformOrderToInvoice(order, companyId);
      // Save to database
      synced++;
    }
    
    return synced;
  }

  private transformOrderToInvoice(order: any, companyId: string): any {
    return {
      companyId,
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
EOF
```

---

## DAY 8-9: Monitoring & Logging

### Setup Prometheus Metrics
```bash
# Install dependencies
npm install @willsoto/nestjs-prometheus prom-client

# Update app.module.ts
# Add PrometheusModule

# Create metrics service
cd bms/api-gateway/src/monitoring
cat > metrics.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private httpRequestsTotal: Counter;
  private httpRequestDuration: Histogram;
  private activeUsers: Gauge;

  constructor() {
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });

    this.activeUsers = new Gauge({
      name: 'active_users',
      help: 'Number of active users',
    });
  }

  recordRequest(method: string, path: string, statusCode: number, duration: number) {
    this.httpRequestsTotal.inc({ method, path, status: statusCode });
    this.httpRequestDuration.observe({ method, path }, duration / 1000);
  }

  setActiveUsers(count: number) {
    this.activeUsers.set(count);
  }

  getMetrics(): string {
    return register.metrics();
  }
}
EOF

# Add metrics endpoint
# GET /api/v1/metrics
```

### Setup Winston Logging
```bash
npm install winston winston-daily-rotate-file

cd bms/api-gateway/src/common/services
cat > logger.service.ts << 'EOF'
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
        winston.format.errors({ stack: true }),
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
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
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
EOF
```

---

## DAY 10: Testing & Validation

### Run All Tests
```bash
# Backend tests
cd bms/api-gateway
npm run test
npm run test:e2e

# Frontend tests
cd bms-web
npm run test
npm run test:e2e

# Check for errors
npm run lint
npm run build
```

### Verify All Endpoints
```bash
# Create test script
cat > test-endpoints.sh << 'EOF'
#!/bin/bash

API_URL="http://localhost:3001/api/v1"
TOKEN="YOUR_JWT_TOKEN"

echo "Testing endpoints..."

# Health check
curl -s $API_URL/health | jq

# Auth
curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' | jq

# Companies
curl -s $API_URL/companies \
  -H "Authorization: Bearer $TOKEN" | jq

# Invoices
curl -s $API_URL/invoices \
  -H "Authorization: Bearer $TOKEN" | jq

# CRM
curl -s $API_URL/crm/contacts \
  -H "Authorization: Bearer $TOKEN" | jq

# Banking
curl -s $API_URL/banking/transactions \
  -H "Authorization: Bearer $TOKEN" | jq

echo "All tests completed!"
EOF

chmod +x test-endpoints.sh
./test-endpoints.sh
```

---

## DAY 11-12: Documentation

### API Documentation
```bash
# Swagger is already configured
# Access at http://localhost:3001/api/docs

# Add missing decorators
# Example:
@ApiTags('invoices')
@ApiOperation({ summary: 'Get all invoices' })
@ApiResponse({ status: 200, description: 'Returns all invoices' })
@Get()
async getInvoices() { ... }
```

### Create README files
```bash
# Backend README
cat > bms/api-gateway/README.md << 'EOF'
# BMS API Gateway

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Setup database:
```bash
npm run typeorm migration:run
```

4. Start server:
```bash
npm run start:dev
```

## API Documentation

Visit http://localhost:3001/api/docs

## Testing

```bash
npm run test
npm run test:e2e
```
EOF

# Frontend README
cat > bms-web/README.md << 'EOF'
# BMS Web Frontend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with your API URL
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm run start
```

## Testing

```bash
npm run test
npm run test:e2e
```
EOF
```

---

## DAY 13-14: Performance Optimization

### Database Optimization
```sql
-- Add missing indexes
CREATE INDEX idx_invoices_company_date ON invoices(company_id, invoice_date DESC);
CREATE INDEX idx_transactions_account_date ON bank_transactions(bank_account_id, transaction_date DESC);
CREATE INDEX idx_journal_entries_company_date ON journal_entries(company_id, entry_date DESC);
CREATE INDEX idx_contacts_company_name ON crm_contacts(company_id, name);

-- Analyze tables
ANALYZE invoices;
ANALYZE bank_transactions;
ANALYZE journal_entries;
ANALYZE crm_contacts;
```

### Enable Query Caching
```typescript
// In services, add caching
@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice) private repo: Repository<Invoice>,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async findAll(companyId: string): Promise<Invoice[]> {
    const cacheKey = `invoices:${companyId}`;
    
    // Try cache first
    const cached = await this.cache.get<Invoice[]>(cacheKey);
    if (cached) return cached;
    
    // Query database
    const invoices = await this.repo.find({ where: { companyId } });
    
    // Cache for 5 minutes
    await this.cache.set(cacheKey, invoices, 300);
    
    return invoices;
  }
}
```

### Frontend Optimization
```typescript
// Add React Query for caching
npm install @tanstack/react-query

// Wrap app with QueryClientProvider
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

// Use in components
const { data, isLoading } = useQuery(['invoices'], () => 
  invoicesAPI.getInvoices()
);
```

---

## VERIFICATION CHECKLIST

After 2 weeks, verify:

- [ ] Database migrations working
- [ ] Redis caching enabled and working
- [ ] Rate limiting active
- [ ] File uploads working with MinIO
- [ ] Bridge API integration complete
- [ ] WooCommerce integration complete
- [ ] Prometheus metrics exposed
- [ ] Winston logging active
- [ ] All endpoints tested
- [ ] API documentation complete
- [ ] Performance optimized
- [ ] No critical errors in logs

---

## NEXT STEPS (Week 3+)

1. Build mobile apps
2. Add GraphQL API
3. Implement advanced monitoring
4. Add comprehensive testing
5. Setup CI/CD pipeline

---

## SUPPORT

If you encounter issues:
1. Check logs: `tail -f bms/api-gateway/logs/application-*.log`
2. Verify environment variables
3. Check database connections
4. Review API documentation
5. Run diagnostic script: `npm run diagnose`
