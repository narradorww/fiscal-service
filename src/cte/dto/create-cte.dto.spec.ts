import { BadRequestException } from '@nestjs/common';
import { homologationCtePayload } from '../../__fixtures__/cte-payload';
import { validateCtePayload } from './create-cte.dto';

describe('validateCtePayload', () => {
  it('aceita payload completo', () => {
    expect(() => validateCtePayload(homologationCtePayload)).not.toThrow();
  });

  it('exige endereço do tomador quando toma = 4', () => {
    const payload = structuredClone(homologationCtePayload);
    payload.toma.toma3 = undefined as never;

    expect(() => validateCtePayload(payload)).toThrow(BadRequestException);
  });

  it('rejeita dados extras de tomador quando toma != 4', () => {
    const payload = structuredClone(homologationCtePayload);
    payload.toma = {
      toma: '1',
      toma3: payload.toma.toma3,
    } as never;

    expect(() => validateCtePayload(payload)).toThrow(BadRequestException);
  });

  it('aceita modal aéreo com bloco correspondente', () => {
    const payload = structuredClone(homologationCtePayload);
    payload.ide.modal = '02';
    payload.infModal = {
      aereo: {
        nMinu: 'MINUTA123',
        nOCA: 'OCAXYZ',
      },
    } as never;

    expect(() => validateCtePayload(payload)).not.toThrow();
  });

  it('rejeita cUF inválido', () => {
    const payload = structuredClone(homologationCtePayload);
    payload.ide.cUF = 'AA';

    expect(() => validateCtePayload(payload)).toThrow(BadRequestException);
  });
});
