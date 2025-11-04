import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { Upload } from './entities/upload.entity';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { MinioStorageProvider } from './providers/minio-storage.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Upload]),
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [
    UploadsService,
    {
      provide: 'STORAGE_PROVIDER',
      useFactory: () => {
        const provider = process.env.STORAGE_PROVIDER || 'local';
        if (provider === 'minio') {
          return new MinioStorageProvider();
        }
        return new LocalStorageProvider();
      },
    },
  ],
  exports: [UploadsService],
})
export class UploadsModule {}
