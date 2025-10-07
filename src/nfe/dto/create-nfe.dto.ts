import { BadRequestException } from '@nestjs/common';

type StringOrNumber = string | number;

export interface NfeIde {
  cUF: string;
  cNF?: string;
  natOp: string;
  mod: string;
  serie: string | number;
  nNF: string | number;
  dhEmi: string;
  dhSaiEnt?: string;
  tpNF: '0' | '1';
  idDest: '1' | '2' | '3';
  cMunFG: string;
  tpImp: '0' | '1' | '2' | '3' | '4';
  tpEmis: '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
  tpAmb: '1' | '2';
  finNFe: '1' | '2' | '3' | '4';
  indFinal: '0' | '1';
  indPres: '0' | '1' | '2' | '3' | '4' | '5' | '9';
  procEmi: '0' | '1' | '2' | '3';
  verProc: string;
  indIntermed?: '0' | '1' | '2';
  NFref?: string[];
}

export interface NfeAddress {
  xLgr: string;
  nro: string;
  xCpl?: string;
  xBairro: string;
  cMun: string;
  xMun: string;
  UF: string;
  CEP: string;
  cPais: string;
  xPais: string;
  fone?: string;
}

export interface NfeEmit {
  CNPJ: string;
  xNome: string;
  xFant?: string;
  IE: string;
  IEST?: string;
  IM?: string;
  CNAE?: string;
  CRT: '1' | '2' | '3';
  enderEmit: NfeAddress;
}

export interface NfeDest {
  CNPJ?: string;
  CPF?: string;
  idEstrangeiro?: string;
  xNome: string;
  indIEDest: '1' | '2' | '9';
  IE?: string;
  ISUF?: string;
  IM?: string;
  email?: string;
  enderDest: NfeAddress;
}

export interface NfeItemProd {
  cProd: string;
  cEAN: string;
  xProd: string;
  NCM: string;
  CEST?: string;
  CFOP: string;
  uCom: string;
  qCom: StringOrNumber;
  vUnCom: StringOrNumber;
  vProd: StringOrNumber;
  cEANTrib: string;
  uTrib: string;
  qTrib: StringOrNumber;
  vUnTrib: StringOrNumber;
  indTot: '0' | '1';
  nItemPed?: string;
  xPed?: string;
  infAdProd?: string;
  vDesc?: StringOrNumber;
  vFrete?: StringOrNumber;
  vSeg?: StringOrNumber;
  vOutro?: StringOrNumber;
}

export interface NfeItemImpostoICMS00 extends Record<string, StringOrNumber> {
  orig: string;
  CST: string;
  modBC: string;
  vBC: StringOrNumber;
  pICMS: StringOrNumber;
  vICMS: StringOrNumber;
}

export interface NfeItemImpostoICMS {
  ICMS00?: NfeItemImpostoICMS00;
  [schema: string]: Record<string, StringOrNumber> | undefined;
}

export interface NfeItemImposto {
  ICMS?: NfeItemImpostoICMS;
  IPI?: Record<string, Record<string, StringOrNumber> | StringOrNumber>;
  PIS?: Record<string, Record<string, StringOrNumber> | StringOrNumber>;
  COFINS?: Record<string, Record<string, StringOrNumber> | StringOrNumber>;
  II?: Record<string, StringOrNumber>;
  ISSQN?: Record<string, StringOrNumber>;
  vTotTrib?: StringOrNumber;
}

export interface NfeItem {
  prod: NfeItemProd;
  imposto: NfeItemImposto;
}

export interface NfeTransp {
  modFrete: string;
  transporta?: {
    CNPJ?: string;
    CPF?: string;
    xNome?: string;
    IE?: string;
    xEnder?: string;
    xMun?: string;
    UF?: string;
  };
  vol?: Array<{
    qVol?: StringOrNumber;
    esp?: string;
    marca?: string;
    nVol?: string;
    pesoL?: StringOrNumber;
    pesoB?: StringOrNumber;
  }>;
}

export interface NfePagamento {
  detPag: Array<{
    indPag?: '0' | '1' | '2';
    tPag: string;
    vPag: StringOrNumber;
    card?: {
      tpIntegra: '1' | '2';
      CNPJ?: string;
      tBand?: string;
      cAut?: string;
    };
  }>;
  vTroco?: StringOrNumber;
}

export interface NfeInfAdic {
  infAdFisco?: string;
  infCpl?: string;
}

export interface NfeTotalOverrides {
  vBC?: StringOrNumber;
  vICMS?: StringOrNumber;
  vICMSDeson?: StringOrNumber;
  vFCPUFDest?: StringOrNumber;
  vICMSUFDest?: StringOrNumber;
  vICMSUFRemet?: StringOrNumber;
  vFCP?: StringOrNumber;
  vBCST?: StringOrNumber;
  vST?: StringOrNumber;
  vFCPST?: StringOrNumber;
  vFCPSTRet?: StringOrNumber;
  vProd?: StringOrNumber;
  vFrete?: StringOrNumber;
  vSeg?: StringOrNumber;
  vDesc?: StringOrNumber;
  vII?: StringOrNumber;
  vIPI?: StringOrNumber;
  vIPIDevol?: StringOrNumber;
  vPIS?: StringOrNumber;
  vCOFINS?: StringOrNumber;
  vOutro?: StringOrNumber;
  vNF?: StringOrNumber;
  vTotTrib?: StringOrNumber;
}

export interface CreateNfeDto {
  ide: NfeIde;
  emit: NfeEmit;
  dest: NfeDest;
  items: NfeItem[];
  transp: NfeTransp;
  pag: NfePagamento;
  infAdic?: NfeInfAdic;
  totalOverrides?: NfeTotalOverrides;
}

const REQUIRED_FIELDS: Array<[string, (payload: CreateNfeDto) => boolean]> = [
  ['ide', payload => !!payload.ide],
  ['emit', payload => !!payload.emit?.CNPJ && !!payload.emit?.xNome && !!payload.emit?.IE],
  ['dest', payload => !!payload.dest?.xNome && (!!payload.dest?.CNPJ || !!payload.dest?.CPF)],
  ['items', payload => Array.isArray(payload.items) && payload.items.length > 0],
  ['transp', payload => !!payload.transp?.modFrete],
  ['pag', payload => Array.isArray(payload.pag?.detPag) && payload.pag.detPag.length > 0],
];

function ensureDigits(value: string, field: string, length?: number) {
  const digitsOnly = value.replace(/\D/g, '');
  if (!digitsOnly) {
    throw new BadRequestException(`${field} deve conter apenas dígitos`);
  }
  if (length && digitsOnly.length !== length) {
    throw new BadRequestException(`${field} deve conter ${length} dígitos`);
  }
  return digitsOnly;
}

export function validateNfePayload(payload: unknown): asserts payload is CreateNfeDto {
  if (!payload || typeof payload !== 'object') {
    throw new BadRequestException('Payload inválido: objeto esperado.');
  }

  const candidate = payload as CreateNfeDto;

  for (const [field, predicate] of REQUIRED_FIELDS) {
    if (!predicate(candidate)) {
      throw new BadRequestException(`Payload inválido: campo obrigatório "${field}" ausente ou incompleto.`);
    }
  }

  ensureDigits(candidate.ide.cUF, 'ide.cUF', 2);
  ensureDigits(candidate.emit.CNPJ, 'emit.CNPJ', 14);

  if (candidate.dest.CNPJ) {
    ensureDigits(candidate.dest.CNPJ, 'dest.CNPJ', 14);
  }

  if (candidate.dest.CPF) {
    ensureDigits(candidate.dest.CPF, 'dest.CPF', 11);
  }

  const emissionDate = new Date(candidate.ide.dhEmi);
  if (Number.isNaN(emissionDate.getTime())) {
    throw new BadRequestException('ide.dhEmi inválido: data/hora não reconhecida.');
  }

  const requiredAddressFields: Array<[string, NfeAddress | undefined]> = [
    ['emit.enderEmit', candidate.emit.enderEmit],
    ['dest.enderDest', candidate.dest.enderDest],
  ];

  requiredAddressFields.forEach(([label, address]) => {
    if (!address) {
      throw new BadRequestException(`${label} é obrigatório.`);
    }
    const mandatoryKeys: Array<keyof NfeAddress> = ['xLgr', 'nro', 'xBairro', 'cMun', 'xMun', 'UF', 'CEP', 'cPais', 'xPais'];
    mandatoryKeys.forEach(key => {
      if (!address[key]) {
        throw new BadRequestException(`${label}.${key} é obrigatório.`);
      }
    });
  });

  if (!candidate.ide.mod) {
    throw new BadRequestException('ide.mod é obrigatório.');
  }

  if (!candidate.ide.serie && candidate.ide.serie !== 0) {
    throw new BadRequestException('ide.serie é obrigatório.');
  }

  if (!candidate.ide.nNF && candidate.ide.nNF !== 0) {
    throw new BadRequestException('ide.nNF é obrigatório.');
  }

  candidate.items.forEach((item, index) => {
    if (!item?.prod?.cProd || !item?.prod?.xProd) {
      throw new BadRequestException(`Item ${index + 1}: campos de produto obrigatórios ausentes.`);
    }
    if (item.prod.indTot !== '0' && item.prod.indTot !== '1') {
      throw new BadRequestException(`Item ${index + 1}: prod.indTot deve ser "0" ou "1".`);
    }
  });
}
