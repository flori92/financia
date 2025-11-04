import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OcrService } from './services/ocr.service';
import { OllamaRAGService } from './services/ollama-rag.service';
import { GoogleVisionService } from './services/google-vision.service';
import { GoogleVisionFallbackService } from './services/google-vision-fallback.service';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../accounting/entities/journal-entry-line.entity';
import { Account } from '../accounting/entities/account.entity';
import { Company } from '../companies/entities/company.entity';
import { User } from '../auth/entities/user.entity';
import { BankTransaction } from '../banking/entities/bank-transaction.entity';
import { TransactionAnomaly } from './entities/transaction-anomaly.entity';
import { AnomalyDetectionService } from './services/anomaly-detection.service';
import { NotificationGateway } from '../notifications/gateways/notification.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JournalEntry,
      JournalEntryLine,
      Account,
      Company,
      User,
      BankTransaction,
      TransactionAnomaly,
    ]),
  ],
  controllers: [AIController],
  providers: [
    AIService,
    OcrService,
    OllamaRAGService,
    GoogleVisionService, // ✅ Google Cloud Vision (si disponible)
    GoogleVisionFallbackService, // ✅ Fallback si Google Vision non installé
    AnomalyDetectionService, // ✅ ACTIVÉ avec TensorFlow
    NotificationGateway,
  ],
  exports: [AIService, AnomalyDetectionService, GoogleVisionService, GoogleVisionFallbackService],
})
export class AIModule {}