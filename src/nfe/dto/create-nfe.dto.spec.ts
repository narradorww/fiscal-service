import { BadRequestException } from '@nestjs/common';
import { homologationNfePayload } from '../../__fixtures__/nfe-payload';
import { validateNfePayload } from './create-nfe.dto';

describe('validateNfePayload', () => {
  it('aceita payload completo', () => {
    expect(() => validateNfePayload(homologationNfePayload)).not.toThrow();
  });

  it('rejeita falta de itens', () => {
    const payload = structuredClone(homologationNfePayload);
    payload.items = [];

    expect(() => validateNfePayload(payload)).toThrow(BadRequestException);
  });

  it('rejeita CNPJ inválido', () => {
    const payload = structuredClone(homologationNfePayload);
    payload.emit.CNPJ = '12A';

    expect(() => validateNfePayload(payload)).toThrow(BadRequestException);
  });
});
