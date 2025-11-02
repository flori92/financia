import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { SEPAController } from './sepa.controller';
import { SEPAService } from './sepa.service';

@Module({
  imports: [
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
      fileFilter: (req, file, callback) => {
        // Accepter seulement les fichiers XML
        if (file.mimetype === 'application/xml' || file.mimetype === 'text/xml' || file.originalname.endsWith('.xml')) {
          callback(null, true);
        } else {
          callback(new Error('Seuls les fichiers XML sont autorisés'), false);
        }
      },
    }),
  ],
  controllers: [SEPAController],
  providers: [SEPAService],
  exports: [SEPAService],
})
export class SEPAModule {}
