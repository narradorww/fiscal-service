import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

const STORAGE_ROOT = path.join(process.cwd(), 'storage', 'certs');

@Injectable()
export class CertificateService {
  private async ensureStorage(): Promise<void> {
    await fs.mkdir(STORAGE_ROOT, { recursive: true });
  }

  async saveCertificate(filename: string, content: Buffer, password?: string) {
    await this.ensureStorage();
    const sanitized = this.sanitizeFilename(filename || 'certificate.pfx');
    const fullPath = path.join(STORAGE_ROOT, sanitized);

    try {
      await fs.writeFile(fullPath, content);
    } catch (error) {
      throw new InternalServerErrorException('Não foi possível salvar o certificado.', {
        cause: error as Error,
      });
    }

    return {
      filename: sanitized,
      path: fullPath,
      password: password ?? null,
    };
  }

  async createMockCertificate() {
    const mockContent = Buffer.from('Mock A1 certificate for testing purposes only.');
    return this.saveCertificate('mock-cert.pfx', mockContent, 'mock-password');
  }

  private sanitizeFilename(filename: string) {
    return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}
