import { Injectable } from '@nestjs/common';
import { buildCTeXML, generateCTeAccessKey } from '../common/utils/xml-builder';
import { CreateCteDto, validateCtePayload } from './dto/create-cte.dto';

@Injectable()
export class CteService {
  async emitCTe(data: CreateCteDto) {
    validateCtePayload(data);
    const { chave, cCT } = generateCTeAccessKey(data);
    const xml = buildCTeXML(data, chave, cCT);
    return {
      status: 'authorized',
      cteKey: chave,
      xml,
      issuedAt: new Date().toISOString(),
      accessKeyComponents: {
        cCT,
        digitoVerificador: chave.slice(-1),
      },
    };
  }
}
