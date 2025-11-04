import { Module, Global } from '@nestjs/common';
import { EncryptionService } from './services/encryption.service';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { AuditModule } from '../audit/audit.module';

@Global()
@Module({
  imports: [AuditModule],
  providers: [EncryptionService, AuditInterceptor],
  exports: [EncryptionService, AuditInterceptor],
})
export class CommonModule {}
