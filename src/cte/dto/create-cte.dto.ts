import { BadRequestException } from '@nestjs/common';

type Numeric = string | number;

export interface CteIde {
  cUF: string;
  cCT?: string;
  CFOP: string;
  natOp: string;
  mod: string;
  serie: string | number;
  nCT: string | number;
  dhEmi: string;
  tpImp: '0' | '1' | '2' | '3' | '4' | '5';
  tpEmis: '1' | '2' | '3' | '4' | '5' | '7' | '8' | '9';
  tpAmb: '1' | '2';
  tpCTe: '0' | '1' | '2' | '3';
  procEmi: '0' | '1' | '2' | '3';
  verProc: string;
  cMunEnv: string;
  xMunEnv: string;
  UFEnv: string;
  modal: '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09';
  tpServ: '0' | '1' | '2' | '3' | '4';
  indIEToma: '1' | '2' | '3' | '4' | '5' | '6';
}

export interface CteAddress {
  xLgr: string;
  nro: string;
  xCpl?: string;
  xBairro: string;
  cMun: string;
  xMun: string;
  CEP?: string;
  UF: string;
  cPais: string;
  xPais: string;
  fone?: string;
}

export interface CteEmit {
  CNPJ: string;
  IE: string;
  xNome: string;
  xFant?: string;
  enderEmit: CteAddress;
}

export interface CteRemetente {
  CNPJ?: string;
  CPF?: string;
  IE?: string;
  xNome: string;
  fone?: string;
  enderReme: CteAddress;
}

export interface CteDestinatario {
  CNPJ?: string;
  CPF?: string;
  IE?: string;
  xNome: string;
  fone?: string;
  enderDest: CteAddress;
}

export interface CteTomador {
  toma: '0' | '1' | '2' | '3' | '4';
  toma3?: {
    CNPJ?: string;
    CPF?: string;
    IE?: string;
    xNome: string;
    fone?: string;
    enderToma: CteAddress;
  };
}

export interface CteVPrest {
  vTPrest: Numeric;
  vRec: Numeric;
  component: Array<{
    xNome: string;
    vComp: Numeric;
  }>;
}

export interface CteImp {
  ICMS?: Record<string, Record<string, Numeric | string> | Numeric | string>;
  infAdFisco?: string;
}

export interface CteInfCarga {
  vCarga: Numeric;
  proPred: string;
  xOutCat?: string;
  infQ: Array<{
    cUnid: '00' | '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08';
    tpMed: string;
    qCarga: Numeric;
  }>;
}

export interface CteRodoviario {
  RNTRC: string;
}

type ModalGeneric = Record<string, unknown>;

export interface CteInfModal {
  versaoModal?: string;
  rodo?: CteRodoviario;
  aereo?: ModalGeneric;
  aquav?: ModalGeneric;
  ferro?: ModalGeneric;
  duto?: ModalGeneric;
  multimodal?: ModalGeneric;
}

export interface CteProtAutorizacao {
  infRespTec?: {
    CNPJ: string;
    xContato: string;
    email: string;
    fone?: string;
  };
}

export interface CreateCteDto {
  ide: CteIde;
  compl?: {
    xObs?: string;
    ObsCont?: Array<{ xTexto: string; xCampo?: string }>;
  };
  emit: CteEmit;
  rem: CteRemetente;
  dest: CteDestinatario;
  toma: CteTomador;
  vPrest: CteVPrest;
  imp: CteImp;
  infCarga: CteInfCarga;
  infModal: CteInfModal;
  autXML?: Array<{ CNPJ?: string; CPF?: string }>;
  prot?: CteProtAutorizacao;
}

const MODAL_FIELD_MAP: Record<CteIde['modal'], keyof CteInfModal> = {
  '01': 'rodo',
  '02': 'aereo',
  '03': 'aquav',
  '04': 'ferro',
  '05': 'duto',
  '06': 'multimodal',
  '07': 'multimodal',
  '08': 'multimodal',
  '09': 'multimodal',
};

function ensureDigits(value: string, field: string, length?: number): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) {
    throw new BadRequestException(`${field} deve conter apenas dígitos.`);
  }
  if (length && digits.length !== length) {
    throw new BadRequestException(`${field} deve conter ${length} dígitos.`);
  }
  return digits;
}

function validateAddress(address: CteAddress, field: string) {
  if (!address) {
    throw new BadRequestException(`${field} é obrigatório.`);
  }
  const required: Array<keyof CteAddress> = ['xLgr', 'nro', 'xBairro', 'cMun', 'xMun', 'UF', 'cPais', 'xPais'];
  required.forEach(key => {
    if (!address[key]) {
      throw new BadRequestException(`${field}.${key} é obrigatório.`);
    }
  });
}

function parseDate(date: string, field: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException(`${field} inválido.`);
  }
}

export function validateCtePayload(payload: unknown): asserts payload is CreateCteDto {
  if (!payload || typeof payload !== 'object') {
    throw new BadRequestException('Payload inválido: objeto esperado.');
  }

  const candidate = payload as CreateCteDto;

  if (!candidate.ide) {
    throw new BadRequestException('ide é obrigatório.');
  }
  if (!candidate.emit) {
    throw new BadRequestException('emit é obrigatório.');
  }
  if (!candidate.rem) {
    throw new BadRequestException('rem é obrigatório.');
  }
  if (!candidate.dest) {
    throw new BadRequestException('dest é obrigatório.');
  }
  if (!candidate.toma) {
    throw new BadRequestException('toma é obrigatório.');
  }
  if (!candidate.vPrest) {
    throw new BadRequestException('vPrest é obrigatório.');
  }
  if (!candidate.imp) {
    throw new BadRequestException('imp é obrigatório.');
  }
  if (!candidate.infCarga) {
    throw new BadRequestException('infCarga é obrigatório.');
  }
  if (!candidate.infModal) {
    throw new BadRequestException('infModal é obrigatório.');
  }

  ensureDigits(candidate.ide.cUF, 'ide.cUF', 2);
  candidate.ide.cCT && ensureDigits(candidate.ide.cCT, 'ide.cCT', 8);
  ensureDigits(candidate.emit.CNPJ, 'emit.CNPJ', 14);
  ensureDigits(candidate.emit.IE, 'emit.IE');

  if (candidate.rem.CNPJ) {
    ensureDigits(candidate.rem.CNPJ, 'rem.CNPJ', 14);
  }
  if (candidate.rem.CPF) {
    ensureDigits(candidate.rem.CPF, 'rem.CPF', 11);
  }
  if (candidate.dest.CNPJ) {
    ensureDigits(candidate.dest.CNPJ, 'dest.CNPJ', 14);
  }
  if (candidate.dest.CPF) {
    ensureDigits(candidate.dest.CPF, 'dest.CPF', 11);
  }

  validateAddress(candidate.emit.enderEmit, 'emit.enderEmit');
  validateAddress(candidate.rem.enderReme, 'rem.enderReme');
  validateAddress(candidate.dest.enderDest, 'dest.enderDest');

  const modalKey = MODAL_FIELD_MAP[candidate.ide.modal];
  if (modalKey) {
    const modalEntries = ['rodo', 'aereo', 'aquav', 'ferro', 'duto', 'multimodal'] as const;
    const provided = modalEntries.filter(key => Boolean((candidate.infModal as Record<string, unknown>)[key]));

    if (!provided.length) {
      throw new BadRequestException(`infModal.${modalKey} é obrigatório para modal ${candidate.ide.modal}.`);
    }

    if (provided.length > 1) {
      throw new BadRequestException('infModal deve conter apenas o bloco correspondente ao modal informado.');
    }

    const modalData = candidate.infModal[modalKey];
    if (!modalData) {
      throw new BadRequestException(`infModal.${modalKey} é obrigatório para modal ${candidate.ide.modal}.`);
    }

    if (modalKey === 'rodo') {
      if (!candidate.infModal.rodo?.RNTRC) {
        throw new BadRequestException('infModal.rodo.RNTRC é obrigatório.');
      }
    } else if (typeof modalData === 'object' && Object.keys(modalData as Record<string, unknown>).length === 0) {
      throw new BadRequestException(`infModal.${modalKey} não pode ser vazio.`);
    }
  }

  if (candidate.toma.toma === '4') {
    if (!candidate.toma.toma3) {
      throw new BadRequestException('toma.toma3 é obrigatório quando toma = 4.');
    }
    validateAddress(candidate.toma.toma3.enderToma, 'toma.toma3.enderToma');
  } else if (candidate.toma.toma3) {
    throw new BadRequestException('toma.toma3 deve ser informado apenas quando toma = 4.');
  }

  if (!Array.isArray(candidate.vPrest.component) || !candidate.vPrest.component.length) {
    throw new BadRequestException('vPrest.component precisa ter ao menos um item.');
  }

  if (!Array.isArray(candidate.infCarga.infQ) || !candidate.infCarga.infQ.length) {
    throw new BadRequestException('infCarga.infQ precisa ter ao menos uma referência.');
  }

  parseDate(candidate.ide.dhEmi, 'ide.dhEmi');
}
