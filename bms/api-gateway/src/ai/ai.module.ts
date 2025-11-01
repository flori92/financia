import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { OcrService } from './services/ocr.service';
import { OllamaRAGService } from './services/ollama-rag.service';
import { JournalEntry } from '../accounting/entities/journal-entry.entity';
import { JournalEntryLine } from '../accounting/entities/journal-entry-line.entity';
import { Account } from '../accounting/entities/account.entity';
import { Company } from '../companies/entities/company.entity';
import { User } from '../auth/entities/user.entity';
// import { AnomalyDetectionService } from './services/anomaly-detection.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      JournalEntry,
      JournalEntryLine,
      Account,
      Company,
      User,
    ]),
  ],
  controllers: [AIController],
  providers: [
    AIService,
    OcrService,
    OllamaRAGService,
    // AnomalyDetectionService, // Temporarily disabled (TensorFlow deps)
  ],
  exports: [AIService],
})
export class AIModule {}