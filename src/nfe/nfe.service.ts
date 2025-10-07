import { Injectable } from '@nestjs/common';
import { buildNFeXML, generateNFeAccessKey } from '../common/utils/xml-builder';
import { CreateNfeDto, validateNfePayload } from './dto/create-nfe.dto';

@Injectable()
export class NfeService {
  async emitNFe(data: CreateNfeDto) {
    validateNfePayload(data);
    const { chave, cNF } = generateNFeAccessKey(data);
    const xml = buildNFeXML(data, chave, cNF);
    return {
      status: 'authorized',
      nfeKey: chave,
      xml,
      issuedAt: new Date().toISOString(),
      accessKeyComponents: {
        cNF,
        digitoVerificador: chave.slice(-1),
      },
    };
  }
}
