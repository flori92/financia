import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage-provider.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly uploadDir = process.env.UPLOAD_DIR || './uploads';

  constructor() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    const filePath = path.join(this.uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  async getFile(filePath: string): Promise<Buffer> {
    return fs.readFileSync(filePath);
  }

  async deleteFile(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  getPublicUrl(filePath: string): string {
    // L'URL sera gérée par l'API (GET /uploads/:id)
    return filePath;
  }
}
