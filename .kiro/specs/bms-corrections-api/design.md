# Design Document - BMS API Corrections

## Overview

Ce document décrit l'architecture et le design des corrections à apporter au système BMS pour résoudre les problèmes identifiés. Les corrections se concentrent sur trois axes principaux:

1. **Standardisation des appels API** - Éliminer les URLs hardcodées et centraliser la gestion des appels HTTP
2. **Module Communications** - Créer un module REST complet pour gérer emails, SMS, WhatsApp et templates
3. **Qualité du code** - Nettoyer les imports inutilisés et améliorer la gestion des erreurs

## Architecture

### Vue d'ensemble du système

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages (Communications, CRM, Budget, etc.)           │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │  Centralized API Client (lib/api.ts)                 │  │
│  │  - apiGet(), apiPost(), apiPatch(), apiDelete()      │  │
│  │  - Gestion automatique des tokens                    │  │
│  │  - Configuration via env variables                   │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │ HTTP/REST
                         │
┌────────────────────────▼─────────────────────────────────────┐
│              API Gateway (NestJS)                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Communications Module (NEW)                         │  │
│  │  - CommunicationsController                          │  │
│  │  - CommunicationsService                             │  │
│  │  - Integration with NotificationsService             │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Existing Modules                                    │  │
│  │  - Auth, CRM, Accounting, Treasury, etc.            │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Frontend API Client Enhancement

#### Current State
Le fichier `bms-web/src/lib/api.ts` existe déjà avec les fonctions de base:
- `apiGet()`, `apiPost()`, `apiPatch()`, `apiDelete()`
- Gestion des tokens via localStorage
- Configuration via `NEXT_PUBLIC_API_URL`

#### Improvements Needed
- Ajouter une gestion d'erreurs plus robuste
- Implémenter un système de retry pour les requêtes échouées
- Ajouter des logs pour le debugging
- Créer des types TypeScript pour les réponses API

#### Enhanced API Client Interface

```typescript
// bms-web/src/lib/api.ts (enhanced)

export interface ApiError {
  status: number;
  message: string;
  details?: any;
}

export interface ApiOptions extends RequestInit {
  retry?: number;
  retryDelay?: number;
  skipAuth?: boolean;
}

export class ApiClient {
  private baseUrl: string;
  private defaultRetry: number = 2;
  
  constructor() {
    this.baseUrl = this.getBaseUrl();
  }
  
  async get<T>(path: string, params?: Query, options?: ApiOptions): Promise<T>
  async post<T>(path: string, body: any, params?: Query, options?: ApiOptions): Promise<T>
  async patch<T>(path: string, body: any, params?: Query, options?: ApiOptions): Promise<T>
  async delete<T>(path: string, params?: Query, options?: ApiOptions): Promise<T>
  
  private async request<T>(config: RequestConfig): Promise<T>
  private handleError(error: any): ApiError
  private retry<T>(fn: () => Promise<T>, attempts: number, delay: number): Promise<T>
}
```

### 2. Communications Module (Backend)

#### Module Structure

```
bms/api-gateway/src/communications/
├── communications.module.ts
├── communications.controller.ts
├── communications.service.ts
├── dto/
│   ├── create-email.dto.ts
│   ├── create-sms.dto.ts
│   ├── create-whatsapp.dto.ts
│   └── create-template.dto.ts
├── entities/
│   ├── email.entity.ts
│   ├── sms.entity.ts
│   ├── whatsapp.entity.ts
│   └── template.entity.ts
└── interfaces/
    └── communication.interface.ts
```

#### Controller Endpoints

```typescript
@Controller('communications')
export class CommunicationsController {
  
  // Emails
  @Get('emails')
  async getEmails(@Query() query: GetEmailsDto): Promise<Email[]>
  
  @Get('emails/:id')
  async getEmail(@Param('id') id: string): Promise<Email>
  
  @Post('emails')
  async sendEmail(@Body() dto: CreateEmailDto): Promise<Email>
  
  @Delete('emails/:id')
  async deleteEmail(@Param('id') id: string): Promise<void>
  
  // SMS
  @Get('sms')
  async getSMS(@Query() query: GetSMSDto): Promise<SMS[]>
  
  @Post('sms')
  async sendSMS(@Body() dto: CreateSMSDto): Promise<SMS>
  
  // WhatsApp
  @Get('whatsapp')
  async getWhatsAppMessages(@Query() query: GetWhatsAppDto): Promise<WhatsAppMessage[]>
  
  @Post('whatsapp')
  async sendWhatsApp(@Body() dto: CreateWhatsAppDto): Promise<WhatsAppMessage>
  
  // Templates
  @Get('templates')
  async getTemplates(@Query() query: GetTemplatesDto): Promise<Template[]>
  
  @Get('templates/:id')
  async getTemplate(@Param('id') id: string): Promise<Template>
  
  @Post('templates')
  async createTemplate(@Body() dto: CreateTemplateDto): Promise<Template>
  
  @Patch('templates/:id')
  async updateTemplate(@Param('id') id: string, @Body() dto: UpdateTemplateDto): Promise<Template>
  
  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string): Promise<void>
}
```

#### Service Layer

```typescript
@Injectable()
export class CommunicationsService {
  constructor(
    private notificationsService: NotificationsService,
    @InjectRepository(Email) private emailRepo: Repository<Email>,
    @InjectRepository(SMS) private smsRepo: Repository<SMS>,
    @InjectRepository(WhatsAppMessage) private whatsappRepo: Repository<WhatsAppMessage>,
    @InjectRepository(Template) private templateRepo: Repository<Template>,
  ) {}
  
  // Email methods
  async getEmails(companyId: string, filters: any): Promise<Email[]>
  async sendEmail(dto: CreateEmailDto): Promise<Email>
  
  // SMS methods
  async getSMS(companyId: string, filters: any): Promise<SMS[]>
  async sendSMS(dto: CreateSMSDto): Promise<SMS>
  
  // WhatsApp methods
  async getWhatsAppMessages(companyId: string, filters: any): Promise<WhatsAppMessage[]>
  async sendWhatsApp(dto: CreateWhatsAppDto): Promise<WhatsAppMessage>
  
  // Template methods
  async getTemplates(companyId: string): Promise<Template[]>
  async createTemplate(dto: CreateTemplateDto): Promise<Template>
  async updateTemplate(id: string, dto: UpdateTemplateDto): Promise<Template>
  async deleteTemplate(id: string): Promise<void>
  
  // Helper methods
  private async saveToHistory(type: string, data: any): Promise<void>
  private async applyTemplate(templateId: string, variables: any): Promise<string>
}
```

## Data Models

### Email Entity

```typescript
@Entity('communications_emails')
export class Email {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  companyId: string;
  
  @Column()
  from: string;
  
  @Column()
  to: string;
  
  @Column()
  subject: string;
  
  @Column('text')
  body: string;
  
  @Column({ default: false })
  read: boolean;
  
  @Column({ default: false })
  starred: boolean;
  
  @Column({ default: 'inbox' })
  folder: string; // inbox, sent, archive, trash
  
  @Column({ default: false })
  hasAttachment: boolean;
  
  @Column({ type: 'jsonb', nullable: true })
  attachments: any[];
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

### SMS Entity

```typescript
@Entity('communications_sms')
export class SMS {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  companyId: string;
  
  @Column()
  from: string;
  
  @Column()
  to: string;
  
  @Column('text')
  message: string;
  
  @Column({ default: 'sent' })
  status: string; // sent, delivered, failed
  
  @Column({ default: 'outbound' })
  direction: string; // outbound, inbound
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
  
  @CreateDateColumn()
  sentAt: Date;
}
```

### WhatsApp Message Entity

```typescript
@Entity('communications_whatsapp')
export class WhatsAppMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  companyId: string;
  
  @Column()
  from: string;
  
  @Column()
  to: string;
  
  @Column('text')
  message: string;
  
  @Column({ default: 'text' })
  type: string; // text, image, document, audio, video
  
  @Column({ default: 'sent' })
  status: string;
  
  @Column({ default: false })
  read: boolean;
  
  @Column({ type: 'jsonb', nullable: true })
  media: any;
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
  
  @CreateDateColumn()
  sentAt: Date;
}
```

### Template Entity

```typescript
@Entity('communications_templates')
export class Template {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  
  @Column()
  companyId: string;
  
  @Column()
  name: string;
  
  @Column()
  type: string; // email, sms, whatsapp
  
  @Column({ nullable: true })
  subject: string; // for emails
  
  @Column('text')
  content: string;
  
  @Column({ type: 'jsonb', default: [] })
  variables: string[]; // e.g., ['customerName', 'amount', 'invoiceNumber']
  
  @Column({ default: true })
  active: boolean;
  
  @Column({ type: 'jsonb', nullable: true })
  metadata: any;
  
  @CreateDateColumn()
  createdAt: Date;
  
  @UpdateDateColumn()
  updatedAt: Date;
}
```

## Error Handling

### Frontend Error Handling Strategy

```typescript
// bms-web/src/lib/errors.ts

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  
  if (error.response) {
    return new ApiError(
      error.response.status,
      error.response.data?.message || 'Une erreur est survenue',
      error.response.data
    );
  }
  
  if (error.request) {
    return new ApiError(
      0,
      'Impossible de contacter le serveur',
      { originalError: error }
    );
  }
  
  return new ApiError(
    500,
    error.message || 'Une erreur inattendue est survenue',
    { originalError: error }
  );
}

// Usage in components
try {
  const data = await apiGet('/api/v1/communications/emails');
  setEmails(data);
} catch (error) {
  const apiError = handleApiError(error);
  setError(apiError.message);
  console.error('API Error:', apiError);
}
```

### Backend Error Handling

```typescript
// bms/api-gateway/src/common/filters/http-exception.filter.ts

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    
    let status = 500;
    let message = 'Internal server error';
    let details = null;
    
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message;
      details = typeof exceptionResponse === 'object' ? exceptionResponse : null;
    }
    
    response.status(status).json({
      statusCode: status,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

## Testing Strategy

### Unit Tests

#### Frontend Tests
```typescript
// bms-web/src/lib/__tests__/api.test.ts

describe('API Client', () => {
  it('should use environment variable for base URL', () => {
    // Test configuration
  });
  
  it('should include auth token in requests', () => {
    // Test authentication
  });
  
  it('should retry failed requests', () => {
    // Test retry logic
  });
  
  it('should handle errors gracefully', () => {
    // Test error handling
  });
});
```

#### Backend Tests
```typescript
// bms/api-gateway/src/communications/__tests__/communications.service.spec.ts

describe('CommunicationsService', () => {
  it('should send email and save to history', async () => {
    // Test email sending
  });
  
  it('should apply template variables', async () => {
    // Test template rendering
  });
  
  it('should filter emails by folder', async () => {
    // Test filtering
  });
});
```

### Integration Tests

```typescript
// bms-web/tests/e2e/communications.spec.ts

describe('Communications Module', () => {
  it('should load emails page', async () => {
    await page.goto('/communications/emails');
    await expect(page.locator('h1')).toContainText('Emails');
  });
  
  it('should send new email', async () => {
    // Test email sending flow
  });
  
  it('should use template', async () => {
    // Test template usage
  });
});
```

## Migration Strategy

### Phase 1: API Client Standardization
1. Enhance existing `lib/api.ts` with error handling and retry logic
2. Create utility functions for common patterns
3. Update one module at a time (start with communications)
4. Test each module after migration

### Phase 2: Communications Module Implementation
1. Create module structure in backend
2. Implement entities and migrations
3. Implement service layer with mock data initially
4. Implement controller and routes
5. Register module in AppModule
6. Test endpoints

### Phase 3: Frontend Integration
1. Update communications pages to use centralized API client
2. Remove hardcoded URLs
3. Implement proper error handling
4. Add loading states
5. Test user flows

### Phase 4: Code Cleanup
1. Remove unused imports across all files
2. Fix TypeScript warnings
3. Run linter and fix issues
4. Update documentation

## Performance Considerations

### Caching Strategy
- Cache templates in memory for faster access
- Implement Redis caching for frequently accessed emails
- Use pagination for large email lists

### Database Optimization
- Add indexes on frequently queried fields (companyId, folder, createdAt)
- Implement soft deletes for emails (move to trash instead of delete)
- Archive old messages to separate table

### API Optimization
- Implement request debouncing on frontend
- Use batch operations where possible
- Implement lazy loading for email content

## Security Considerations

### Authentication & Authorization
- All endpoints require valid JWT token
- Verify user has access to requested company data
- Implement rate limiting on send operations

### Data Protection
- Encrypt sensitive email content at rest
- Sanitize user inputs to prevent XSS
- Validate email addresses and phone numbers
- Implement GDPR compliance for data retention

### Audit Trail
- Log all communication sends
- Track who accessed what data
- Implement data retention policies

## Deployment Considerations

### Environment Variables
```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_COMPANY_ID=<company-uuid>

# Backend (.env)
DATABASE_URL=postgresql://...
EMAIL_PROVIDER=console|sendgrid
SMS_PROVIDER=console|twilio
WHATSAPP_PROVIDER=console|twilio
```

### Database Migrations
```sql
-- Create communications tables
CREATE TABLE communications_emails (...);
CREATE TABLE communications_sms (...);
CREATE TABLE communications_whatsapp (...);
CREATE TABLE communications_templates (...);

-- Add indexes
CREATE INDEX idx_emails_company_folder ON communications_emails(companyId, folder);
CREATE INDEX idx_emails_created ON communications_emails(createdAt DESC);
```

### Rollback Plan
- Keep old code paths active during migration
- Use feature flags to enable/disable new module
- Monitor error rates and performance metrics
- Have database backup before running migrations

## Monitoring and Observability

### Metrics to Track
- API response times
- Error rates by endpoint
- Email/SMS delivery success rates
- Template usage statistics

### Logging
- Log all API calls with request/response
- Log communication sends with status
- Log errors with full context
- Use structured logging (JSON format)

### Alerts
- Alert on high error rates
- Alert on slow API responses
- Alert on failed communication sends
- Alert on authentication failures
