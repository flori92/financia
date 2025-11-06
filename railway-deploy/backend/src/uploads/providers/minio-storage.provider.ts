import { Injectable } from '@nestjs/common';
import { StorageProvider } from './storage-provider.interface';
import * as Minio from 'minio';

@Injectable()
export class MinioStorageProvider implements StorageProvider {
  private client: Minio.Client;
  private bucket: string;

  constructor() {
    const rawEndpoint = process.env.MINIO_ENDPOINT || 'http://minio:9000';
    const endpointUrl = rawEndpoint.startsWith('http')
      ? new URL(rawEndpoint)
      : new URL(`http://${rawEndpoint}`);

    const useSSL = process.env.MINIO_USE_SSL
      ? process.env.MINIO_USE_SSL === 'true'
      : endpointUrl.protocol === 'https:';

    const config: Minio.ClientOptions = {
      endPoint: endpointUrl.hostname,
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123',
      useSSL,
    };

    const port = endpointUrl.port ? parseInt(endpointUrl.port, 10) : undefined;
    if (port) {
      config.port = port;
    }

    const region = process.env.MINIO_REGION;
    if (region) {
      config.region = region;
    }

    const forcePathStyle = (process.env.MINIO_FORCE_PATH_STYLE || 'false') === 'true';
    if (forcePathStyle) {
      config.pathStyle = true;
    }

    this.client = new Minio.Client(config);

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
    const baseUrl = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    return `${baseUrl}/${this.bucket}/${filePath}`;
  }
}
