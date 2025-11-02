import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage-provider.interface';
import * as Minio from 'minio';

@Injectable()
export class MinioStorageProvider implements StorageProvider {
  private client: Minio.Client;
  private bucket: string;

  constructor() {
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost:9000';
    const [host, port] = endpoint.replace('http://', '').replace('https://', '').split(':');

    this.client = new Minio.Client({
      endPoint: host,
      port: parseInt(port || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
    });

    this.bucket = process.env.MINIO_BUCKET || 'bms-uploads';
  }

  async saveFile(buffer: Buffer, fileName: string): Promise<string> {
    await this.client.putObject(this.bucket, fileName, buffer, buffer.length, {
      'Content-Type': 'application/octet-stream',
    });
    return fileName;
  }

  async getFile(filePath: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucket, filePath);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.client.removeObject(this.bucket, filePath);
  }

  getPublicUrl(filePath: string): string {
    const endpoint = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
    return `${endpoint}/${this.bucket}/${filePath}`;
  }
}
