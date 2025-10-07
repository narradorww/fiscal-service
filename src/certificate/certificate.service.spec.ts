import { CertificateService } from './certificate.service';
import { promises as fs } from 'fs';
import * as path from 'path';

describe('CertificateService', () => {
  const service = new CertificateService();
  const storageDir = path.join(process.cwd(), 'storage', 'certs');

  afterEach(async () => {
    await fs.rm(path.join(process.cwd(), 'storage'), { recursive: true, force: true });
  });

  it('salva certificado com nome sanitizado', async () => {
    const result = await service.saveCertificate('Teste Cert!.pfx', Buffer.from('fake'), 'senha');

    expect(result.filename).toBe('Teste_Cert_.pfx');
    const saved = await fs.readFile(result.path, 'utf-8');
    expect(saved).toBe('fake');
  });

  it('gera certificado mockado para testes', async () => {
    const result = await service.createMockCertificate();

    expect(result.filename).toBe('mock-cert.pfx');
    expect(result.password).toBe('mock-password');
    const saved = await fs.readFile(path.join(storageDir, 'mock-cert.pfx'));
    expect(saved.toString()).toContain('Mock A1 certificate');
  });
});
