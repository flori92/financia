# 🚀 IMMEDIATE ACTION PLAN - BMS

**Date**: 19 October 2025  
**Priority**: CRITICAL  
**Timeline**: This Week

---

## ✅ COMPLETED

- [x] User entity updated with 2FA fields
- [x] TwoFactorService implemented
- [x] Analysis documents created

---

## 🔴 TODAY (Day 1)

### 1. Create 2FA Migration

```bash
cd bms/api-gateway

# Create migration file
cat > src/migrations/1729300000000-AddTwoFactorFields.ts << 'EOF'
import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddTwoFactorFields1729300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn('users', new TableColumn({
      name: 'two_factor_secret',
      type: 'varchar',
      isNullable: true,
    }));
    
    await queryRunner.addColumn('users', new TableColumn({
      name: 'two_factor_enabled',
      type: 'boolean',
      default: false,
    }));
    
    await queryRunner.addColumn('users', new TableColumn({
      name: 'two_factor_temp_secret',
      type: 'varchar',
      isNullable: true,
    }));
    
    await queryRunner.addColumn('users', new TableColumn({
      name: 'two_factor_backup_codes',
      type: 'jsonb',
      isNullable: true,
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('users', 'two_factor_backup_codes');
    await queryRunner.dropColumn('users', 'two_factor_temp_secret');
    await queryRunner.dropColumn('users', 'two_factor_enabled');
    await queryRunner.dropColumn('users', 'two_factor_secret');
  }
}
EOF

# Run migration
npm run typeorm migration:run
```

### 2. Install 2FA Dependencies

```bash
cd bms/api-gateway
npm install speakeasy qrcode
npm install -D @types/speakeasy @types/qrcode
```

### 3. Create 2FA DTOs

```bash
cat > src/auth/dto/two-factor.dto.ts << 'EOF'
import { IsString, IsNotEmpty, Length } from 'class-validator';

export class Enable2FADto {
  @IsString()
  @IsNotEmpty()
  @Length(6, 6)
  token: string;
}

export class Verify2FADto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class Disable2FADto {
  @IsString()
  @IsNotEmpty()
  password: string;
}
EOF
```

---

## 🟡 DAY 2

### 4. Create 2FA Controller

```bash
cat > src/auth/two-factor.controller.ts << 'EOF'
import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TwoFactorService } from './services/two-factor.service';
import { Enable2FADto, Verify2FADto, Disable2FADto } from './dto/two-factor.dto';

@Controller('auth/2fa')
@UseGuards(JwtAuthGuard)
export class TwoFactorController {
  constructor(private readonly twoFactorService: TwoFactorService) {}

  @Get('generate')
  async generateSecret(@Request() req) {
    return this.twoFactorService.generateSecret(req.user.id);
  }

  @Post('enable')
  async enable(@Request() req, @Body() dto: Enable2FADto) {
    return this.twoFactorService.enable(req.user.id, dto.token);
  }

  @Post('verify')
  async verify(@Request() req, @Body() dto: Verify2FADto) {
    const isValid = await this.twoFactorService.verify(req.user.id, dto.token);
    return { valid: isValid };
  }

  @Post('disable')
  async disable(@Request() req, @Body() dto: Disable2FADto) {
    await this.twoFactorService.disable(req.user.id, dto.password);
    return { message: '2FA désactivé avec succès' };
  }
}
EOF
```

### 5. Update Auth Module

Edit `src/auth/auth.module.ts`:

```typescript
import { TwoFactorService } from './services/two-factor.service';
import { TwoFactorController } from './two-factor.controller';

@Module({
  // ... existing imports
  controllers: [AuthController, TwoFactorController],
  providers: [AuthService, JwtStrategy, LocalStrategy, TwoFactorService],
  // ... rest
})
```

---

## 🟢 DAY 3-5

### 6. Fix Integration Services

```bash
cd bms/api-gateway/src/integrations

# Create services directory
mkdir -p services

# Create banking integration service
cat > services/banking-integration.service.ts << 'EOF'
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BankingIntegrationService {
  private readonly logger = new Logger(BankingIntegrationService.name);

  async connect(connectionDetails: any) {
    this.logger.log('Banking connection requested');
    // TODO: Implement Budget Insight integration
    throw new Error('Not implemented yet');
  }

  async getTransactions(accountId: string) {
    this.logger.log(`Get transactions for account ${accountId}`);
    // TODO: Implement transaction fetching
    throw new Error('Not implemented yet');
  }
}
EOF

# Create ecommerce integration service
cat > services/ecommerce-integration.service.ts << 'EOF'
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EcommerceIntegrationService {
  private readonly logger = new Logger(EcommerceIntegrationService.name);

  async sync(syncParams: any) {
    this.logger.log('Ecommerce sync requested');
    // TODO: Implement WooCommerce/Shopify integration
    throw new Error('Not implemented yet');
  }

  async getOrders() {
    this.logger.log('Get ecommerce orders');
    // TODO: Implement order fetching
    throw new Error('Not implemented yet');
  }
}
EOF

# Create webhook service
cat > services/webhook.service.ts << 'EOF'
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  async register(webhookConfig: any) {
    this.logger.log('Webhook registration requested');
    // TODO: Implement webhook registration
    throw new Error('Not implemented yet');
  }
}
EOF
```

### 7. Start CRM Frontend

```bash
cd bms-web/src/app/crm/contacts

# Implement contacts list page
# (See full implementation in BMS_IMPLEMENTATION_STATUS_REPORT.md)
```

---

## 📋 WEEK 1 CHECKLIST

- [ ] 2FA migration created and run
- [ ] 2FA dependencies installed
- [ ] 2FA DTOs created
- [ ] 2FA controller created
- [ ] Auth module updated
- [ ] 2FA tested with Postman/curl
- [ ] Integration services created
- [ ] CRM contacts page started
- [ ] Contact detail page started
- [ ] Contact form started

---

## 🎯 SUCCESS CRITERIA

### End of Week 1

1. **2FA Working**
   - Can generate QR code
   - Can enable 2FA
   - Can verify 2FA token
   - Can disable 2FA

2. **Integration Services Fixed**
   - No more import errors
   - Services return proper errors
   - Ready for implementation

3. **CRM Frontend Started**
   - Contacts list page rendering
   - Can view contact details
   - Can create new contact

---

## 🧪 TESTING COMMANDS

### Test 2FA Flow

```bash
# 1. Generate secret
curl -X GET http://localhost:3001/auth/2fa/generate \
  -H "Authorization: Bearer YOUR_TOKEN"

# 2. Enable 2FA (scan QR code with authenticator app first)
curl -X POST http://localhost:3001/auth/2fa/enable \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "123456"}'

# 3. Verify 2FA
curl -X POST http://localhost:3001/auth/2fa/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"token": "123456"}'

# 4. Disable 2FA
curl -X POST http://localhost:3001/auth/2fa/disable \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"password": "your_password"}'
```

### Test Backend

```bash
cd bms/api-gateway
npm run test
npm run test:e2e
```

### Test Frontend

```bash
cd bms-web
npm run dev
# Open http://localhost:3000
```

---

## 📞 SUPPORT

If you encounter issues:

1. Check logs: `docker-compose logs -f api-gateway`
2. Check database: `docker-compose exec postgres psql -U bms -d bms`
3. Check Redis: `docker-compose exec redis redis-cli`
4. Review error messages carefully
5. Consult documentation in BMS_IMPLEMENTATION_STATUS_REPORT.md

---

**Start Date**: Today  
**Target Completion**: End of Week 1  
**Next Review**: Friday EOD

