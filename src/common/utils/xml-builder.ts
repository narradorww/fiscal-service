import {
  CreateNfeDto,
  NfeAddress,
  NfeInfAdic,
  NfeItem,
  NfePagamento,
  NfeTransp,
} from '../../nfe/dto/create-nfe.dto';
import {
  CreateCteDto,
  CteAddress,
  CteDestinatario,
  CteEmit,
  CteIde,
  CteImp,
  CteInfCarga,
  CteInfModal,
  CteRodoviario,
  CteRemetente,
  CteTomador,
  CteVPrest,
} from '../../cte/dto/create-cte.dto';

type Numeric = string | number;

type GenericObject = Record<string, unknown>;

const NFE_NAMESPACE = 'http://www.portalfiscal.inf.br/nfe';
const CTE_NAMESPACE = 'http://www.portalfiscal.inf.br/cte';

function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function padLeft(value: string | number, length: number): string {
  return String(value).padStart(length, '0');
}

function formatDecimal(value: Numeric, decimals = 2): string {
  const parsed = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (Number.isNaN(parsed)) {
    throw new Error(`Valor numérico inválido: ${value}`);
  }
  return parsed.toFixed(decimals);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrap(tag: string, content: string, attributes: Record<string, string> = {}): string {
  const attrString = Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeXml(value)}"`)
    .join(' ');
  const prefix = attrString ? ` ${attrString}` : '';
  return `<${tag}${prefix}>${content}</${tag}>`;
}

function buildTag(tag: string, value?: Numeric | string, decimals?: number): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  const normalized = typeof value === 'number' || decimals !== undefined ? formatDecimal(value as Numeric, decimals ?? 2) : String(value);
  return wrap(tag, escapeXml(normalized));
}

function buildTextTag(tag: string, value?: string): string {
  if (value === undefined || value === null) {
    return '';
  }
  return wrap(tag, escapeXml(value));
}

function buildOptionalTextTag(tag: string, value?: string): string {
  if (value === undefined || value === null || value === '') {
    return '';
  }
  return buildTextTag(tag, value);
}

function buildOptionalNumericTag(tag: string, value?: Numeric, decimals?: number): string {
  if (value === undefined || value === null) {
    return '';
  }
  return buildTag(tag, value, decimals);
}

function buildAddress(tag: string, address: NfeAddress | CteAddress): string {
  const parts = [
    buildTextTag('xLgr', address.xLgr),
    buildTextTag('nro', address.nro),
    buildOptionalTextTag('xCpl', address.xCpl),
    buildTextTag('xBairro', address.xBairro),
    buildTextTag('cMun', address.cMun),
    buildTextTag('xMun', address.xMun),
    buildTextTag('UF', address.UF),
    buildTextTag('CEP', address.CEP),
    buildTextTag('cPais', address.cPais),
    buildTextTag('xPais', address.xPais),
    buildOptionalTextTag('fone', address.fone),
  ].filter(Boolean);

  return wrap(tag, parts.join(''));
}

function objectToXml(obj: GenericObject): string {
  return Object.entries(obj)
    .map(([key, value]) => serializeValue(key, value))
    .join('');
}

function serializeValue(tag: string, value: unknown): string {
  if (value === undefined || value === null) {
    return '';
  }

  if (Array.isArray(value)) {
    return value.map(item => serializeValue(tag, item)).join('');
  }

  if (typeof value === 'object') {
    const { _attributes, _text, ...rest } = value as GenericObject & {
      _attributes?: Record<string, string>;
      _text?: string | number;
    };

    const attributes = _attributes
      ? Object.entries(_attributes)
          .map(([attr, attrValue]) => `${attr}="${escapeXml(String(attrValue))}"`)
          .join(' ')
      : '';

    const inner = _text !== undefined ? escapeXml(String(_text)) : objectToXml(rest);
    const attrPrefix = attributes ? ` ${attributes}` : '';
    return `<${tag}${attrPrefix}>${inner}</${tag}>`;
  }

  return wrap(tag, escapeXml(String(value)));
}

function buildIdeSection(payload: CreateNfeDto, cNF: string, chave: string): string {
  const { ide } = payload;
  const dv = chave.slice(-1);

  const parts = [
    buildTextTag('cUF', onlyDigits(ide.cUF).padStart(2, '0')),
    buildTextTag('cNF', cNF),
    buildTextTag('natOp', ide.natOp),
    buildTextTag('mod', padLeft(ide.mod, 2)),
    buildTextTag('serie', padLeft(ide.serie, 3)),
    buildTextTag('nNF', padLeft(ide.nNF, 9)),
    buildTextTag('dhEmi', ide.dhEmi),
    buildOptionalTextTag('dhSaiEnt', ide.dhSaiEnt),
    buildTextTag('tpNF', ide.tpNF),
    buildTextTag('idDest', ide.idDest),
    buildTextTag('cMunFG', ide.cMunFG),
    buildTextTag('tpImp', ide.tpImp),
    buildTextTag('tpEmis', ide.tpEmis),
    buildTextTag('cDV', dv),
    buildTextTag('tpAmb', ide.tpAmb),
    buildTextTag('finNFe', ide.finNFe),
    buildTextTag('indFinal', ide.indFinal),
    buildTextTag('indPres', ide.indPres),
    buildOptionalTextTag('indIntermed', ide.indIntermed),
    buildTextTag('procEmi', ide.procEmi),
    buildTextTag('verProc', ide.verProc),
  ].filter(Boolean);

  if (ide.NFref?.length) {
    ide.NFref.forEach(ref => {
      parts.push(`<NFref><refNFe>${escapeXml(ref)}</refNFe></NFref>`);
    });
  }

  return wrap('ide', parts.join(''));
}

function buildEmitSection(payload: CreateNfeDto): string {
  const { emit } = payload;
  const parts = [
    buildTextTag('CNPJ', onlyDigits(emit.CNPJ)),
    buildTextTag('xNome', emit.xNome),
    emit.xFant ? buildTextTag('xFant', emit.xFant) : '',
    buildAddress('enderEmit', emit.enderEmit),
    buildTextTag('IE', emit.IE),
    emit.IEST ? buildTextTag('IEST', emit.IEST) : '',
    emit.IM ? buildTextTag('IM', emit.IM) : '',
    emit.CNAE ? buildTextTag('CNAE', emit.CNAE) : '',
    buildTextTag('CRT', emit.CRT),
  ].filter(Boolean);

  return wrap('emit', parts.join(''));
}

function buildDestSection(payload: CreateNfeDto): string {
  const { dest } = payload;
  const parts = [
    dest.CNPJ ? buildTextTag('CNPJ', onlyDigits(dest.CNPJ)) : '',
    dest.CPF ? buildTextTag('CPF', onlyDigits(dest.CPF)) : '',
    dest.idEstrangeiro ? buildTextTag('idEstrangeiro', dest.idEstrangeiro) : '',
    buildTextTag('xNome', dest.xNome),
    buildAddress('enderDest', dest.enderDest),
    buildTextTag('indIEDest', dest.indIEDest),
    buildOptionalTextTag('IE', dest.IE),
    buildOptionalTextTag('ISUF', dest.ISUF),
    buildOptionalTextTag('IM', dest.IM),
    buildOptionalTextTag('email', dest.email),
  ].filter(Boolean);

  return wrap('dest', parts.join(''));
}

function buildProdSection(item: NfeItem['prod']): string {
  const parts = [
    buildTextTag('cProd', item.cProd),
    buildTextTag('cEAN', item.cEAN),
    buildTextTag('xProd', item.xProd),
    buildTextTag('NCM', item.NCM),
    item.CEST ? buildTextTag('CEST', item.CEST) : '',
    buildTextTag('CFOP', item.CFOP),
    buildTextTag('uCom', item.uCom),
    buildTag('qCom', item.qCom, 4),
    buildTag('vUnCom', item.vUnCom, 10),
    buildTag('vProd', item.vProd),
    buildTextTag('cEANTrib', item.cEANTrib),
    buildTextTag('uTrib', item.uTrib),
    buildTag('qTrib', item.qTrib, 4),
    buildTag('vUnTrib', item.vUnTrib, 10),
    buildOptionalNumericTag('vFrete', item.vFrete),
    buildOptionalNumericTag('vSeg', item.vSeg),
    buildOptionalNumericTag('vDesc', item.vDesc),
    buildOptionalNumericTag('vOutro', item.vOutro),
    buildTextTag('indTot', item.indTot),
    buildOptionalTextTag('xPed', item.xPed),
    buildOptionalTextTag('nItemPed', item.nItemPed),
    buildOptionalTextTag('infAdProd', item.infAdProd),
  ].filter(Boolean);

  return wrap('prod', parts.join(''));
}

function buildImpostoSection(item: NfeItem): string {
  const { imposto } = item;
  const parts: string[] = [];

  if (imposto.vTotTrib !== undefined) {
    parts.push(buildTag('vTotTrib', imposto.vTotTrib));
  }

  if (imposto.ICMS) {
    parts.push(wrap('ICMS', objectToXml(imposto.ICMS as GenericObject)));
  }

  if (imposto.II) {
    parts.push(wrap('II', objectToXml(imposto.II as GenericObject)));
  }

  if (imposto.IPI) {
    parts.push(wrap('IPI', objectToXml(imposto.IPI as GenericObject)));
  }

  if (imposto.PIS) {
    parts.push(wrap('PIS', objectToXml(imposto.PIS as GenericObject)));
  }

  if (imposto.COFINS) {
    parts.push(wrap('COFINS', objectToXml(imposto.COFINS as GenericObject)));
  }

  if (imposto.ISSQN) {
    parts.push(wrap('ISSQN', objectToXml(imposto.ISSQN as GenericObject)));
  }

  return wrap('imposto', parts.join(''));
}

function sum(values: Numeric[]): number {
  return values.reduce<number>((acc, value) => acc + Number(String(value).replace(',', '.')), 0);
}

function buildTotalsSection(payload: CreateNfeDto): string {
  const vProdSum = sum(payload.items.map(item => item.prod.vProd));
  const vDescSum = sum(payload.items.map(item => item.prod.vDesc ?? 0));
  const vFreteSum = sum(payload.items.map(item => item.prod.vFrete ?? 0));
  const vSegSum = sum(payload.items.map(item => item.prod.vSeg ?? 0));
  const vOutroSum = sum(payload.items.map(item => item.prod.vOutro ?? 0));
  const vTotTrib =
    payload.totalOverrides?.vTotTrib !== undefined
      ? Number(String(payload.totalOverrides.vTotTrib).replace(',', '.'))
      : sum(payload.items.map(item => item.imposto.vTotTrib ?? 0));

  const baseTotals = {
    vBC: '0.00',
    vICMS: '0.00',
    vICMSDeson: '0.00',
    vFCPUFDest: '0.00',
    vICMSUFDest: '0.00',
    vICMSUFRemet: '0.00',
    vFCP: '0.00',
    vBCST: '0.00',
    vST: '0.00',
    vFCPST: '0.00',
    vFCPSTRet: '0.00',
    vProd: formatDecimal(vProdSum),
    vFrete: formatDecimal(vFreteSum),
    vSeg: formatDecimal(vSegSum),
    vDesc: formatDecimal(vDescSum),
    vII: '0.00',
    vIPI: '0.00',
    vIPIDevol: '0.00',
    vPIS: '0.00',
    vCOFINS: '0.00',
    vOutro: formatDecimal(vOutroSum),
    vNF: formatDecimal(vProdSum - vDescSum + vFreteSum + vSegSum + vOutroSum),
    vTotTrib: formatDecimal(vTotTrib),
  };

  const overrides = payload.totalOverrides ?? {};
  const totals = { ...baseTotals, ...Object.fromEntries(Object.entries(overrides).map(([k, v]) => [k, formatDecimal(v)])) } as Record<string, string>;

  const order = [
    'vBC',
    'vICMS',
    'vICMSDeson',
    'vFCPUFDest',
    'vICMSUFDest',
    'vICMSUFRemet',
    'vFCP',
    'vBCST',
    'vST',
    'vFCPST',
    'vFCPSTRet',
    'vProd',
    'vFrete',
    'vSeg',
    'vDesc',
    'vII',
    'vIPI',
    'vIPIDevol',
    'vPIS',
    'vCOFINS',
    'vOutro',
    'vNF',
    'vTotTrib',
  ];

  const icmsTot = order.map(key => buildTag(key, totals[key]!)).join('');

  return wrap('total', wrap('ICMSTot', icmsTot));
}

function buildTranspSection(transp: NfeTransp): string {
  const parts = [buildTextTag('modFrete', transp.modFrete)];

  if (transp.transporta) {
    const transporta = transp.transporta;
    const inner = [
      transporta.CNPJ ? buildTextTag('CNPJ', onlyDigits(transporta.CNPJ)) : '',
      transporta.CPF ? buildTextTag('CPF', onlyDigits(transporta.CPF)) : '',
      transporta.xNome ? buildTextTag('xNome', transporta.xNome) : '',
      transporta.IE ? buildTextTag('IE', transporta.IE) : '',
      transporta.xEnder ? buildTextTag('xEnder', transporta.xEnder) : '',
      transporta.xMun ? buildTextTag('xMun', transporta.xMun) : '',
      transporta.UF ? buildTextTag('UF', transporta.UF) : '',
    ].filter(Boolean);
    parts.push(wrap('transporta', inner.join('')));
  }

  if (transp.vol?.length) {
    transp.vol.forEach(volume => {
      const volInner = [
        volume.qVol !== undefined ? buildTag('qVol', volume.qVol, 0) : '',
        volume.esp ? buildTextTag('esp', volume.esp) : '',
        volume.marca ? buildTextTag('marca', volume.marca) : '',
        volume.nVol ? buildTextTag('nVol', volume.nVol) : '',
        volume.pesoL !== undefined ? buildTag('pesoL', volume.pesoL, 3) : '',
        volume.pesoB !== undefined ? buildTag('pesoB', volume.pesoB, 3) : '',
      ].filter(Boolean);
      parts.push(wrap('vol', volInner.join('')));
    });
  }

  return wrap('transp', parts.join(''));
}

function buildPagamentoSection(pag: NfePagamento): string {
  const detPagXml = pag.detPag
    .map(det => {
    const inner = [
      buildOptionalTextTag('indPag', det.indPag),
      buildTag('tPag', det.tPag),
      buildTag('vPag', det.vPag),
      ];

      if (det.card) {
        const cardInner = [
          buildTextTag('tpIntegra', det.card.tpIntegra),
          det.card.CNPJ ? buildTextTag('CNPJ', onlyDigits(det.card.CNPJ)) : '',
          det.card.tBand ? buildTextTag('tBand', det.card.tBand) : '',
          det.card.cAut ? buildTextTag('cAut', det.card.cAut) : '',
        ].filter(Boolean);
        inner.push(wrap('card', cardInner.join('')));
      }

      return wrap('detPag', inner.filter(Boolean).join(''));
    })
    .join('');

  const parts = [detPagXml];

  if (pag.vTroco !== undefined) {
    parts.push(buildTag('vTroco', pag.vTroco));
  }

  return wrap('pag', parts.join(''));
}

function buildInfAdicSection(infAdic?: NfeInfAdic): string {
  if (!infAdic) {
    return '';
  }

  const parts = [
    infAdic.infAdFisco ? buildTextTag('infAdFisco', infAdic.infAdFisco) : '',
    infAdic.infCpl ? buildTextTag('infCpl', infAdic.infCpl) : '',
  ].filter(Boolean);

  if (!parts.length) {
    return '';
  }

  return wrap('infAdic', parts.join(''));
}

export function generateNFeAccessKey(payload: CreateNfeDto): { chave: string; cNF: string } {
  const cUF = onlyDigits(payload.ide.cUF).padStart(2, '0');
  const emissionDate = new Date(payload.ide.dhEmi);
  if (Number.isNaN(emissionDate.getTime())) {
    throw new Error('ide.dhEmi inválido: não foi possível calcular AAMM.');
  }
  const year = emissionDate.getUTCFullYear().toString().slice(-2);
  const month = (emissionDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const aamm = `${year}${month}`;
  const cnpj = onlyDigits(payload.emit.CNPJ).padStart(14, '0');
  const mod = padLeft(payload.ide.mod, 2);
  const serie = padLeft(payload.ide.serie, 3);
  const nNF = padLeft(payload.ide.nNF, 9);
  const tpEmis = padLeft(payload.ide.tpEmis, 1);
  const cNF = payload.ide.cNF ? padLeft(onlyDigits(payload.ide.cNF), 8) : Math.floor(Math.random() * 1e8).toString().padStart(8, '0');

  const keyWithoutDV = `${cUF}${aamm}${cnpj}${mod}${serie}${nNF}${tpEmis}${cNF}`;
  const dv = calculateModulo11DV(keyWithoutDV);
  const chave = `${keyWithoutDV}${dv}`;

  return { chave, cNF };
}

function calculateModulo11DV(sequence: string): number {
  let factor = 2;
  let sum = 0;

  for (let i = sequence.length - 1; i >= 0; i -= 1) {
    sum += Number(sequence[i]) * factor;
    factor = factor === 9 ? 2 : factor + 1;
  }

  const mod = sum % 11;
  const dv = mod === 0 || mod === 1 ? 0 : 11 - mod;
  return dv;
}

export function buildNFeXML(payload: CreateNfeDto, chave: string, cNF: string): string {
  const ide = buildIdeSection(payload, cNF, chave);
  const emit = buildEmitSection(payload);
  const dest = buildDestSection(payload);
  const det = payload.items
    .map((item, index) => {
      const prod = buildProdSection(item.prod);
      const imposto = buildImpostoSection(item);
      return `<det nItem="${index + 1}">${prod}${imposto}</det>`;
    })
    .join('');
  const total = buildTotalsSection(payload);
  const transp = buildTranspSection(payload.transp);
  const pag = buildPagamentoSection(payload.pag);
  const infAdic = buildInfAdicSection(payload.infAdic);

  const infNFeInner = [ide, emit, dest, det, total, transp, pag, infAdic].filter(Boolean).join('');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<NFe xmlns="${NFE_NAMESPACE}">`,
    `<infNFe Id="NFe${chave}" versao="4.00">${infNFeInner}</infNFe>`,
    '</NFe>',
  ].join('');
}

export function generateCTeAccessKey(payload: CreateCteDto): { chave: string; cCT: string } {
  const cUF = onlyDigits(payload.ide.cUF).padStart(2, '0');
  const emissionDate = new Date(payload.ide.dhEmi);
  if (Number.isNaN(emissionDate.getTime())) {
    throw new Error('ide.dhEmi inválido: não foi possível calcular AAMM.');
  }
  const year = emissionDate.getUTCFullYear().toString().slice(-2);
  const month = (emissionDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const aamm = `${year}${month}`;
  const cnpj = onlyDigits(payload.emit.CNPJ).padStart(14, '0');
  const mod = padLeft(payload.ide.mod, 2);
  const serie = padLeft(payload.ide.serie, 3);
  const nCT = padLeft(payload.ide.nCT, 9);
  const tpEmis = padLeft(payload.ide.tpEmis, 1);
  const cCT = payload.ide.cCT ? padLeft(onlyDigits(payload.ide.cCT), 8) : Math.floor(Math.random() * 1e8).toString().padStart(8, '0');

  const keyWithoutDV = `${cUF}${aamm}${cnpj}${mod}${serie}${nCT}${tpEmis}${cCT}`;
  const dv = calculateModulo11DV(keyWithoutDV);
  const chave = `${keyWithoutDV}${dv}`;

  return { chave, cCT };
}

function buildCteIdeSection(ide: CteIde, cCT: string, chave: string): string {
  const dv = chave.slice(-1);
  const parts = [
    buildTextTag('cUF', onlyDigits(ide.cUF).padStart(2, '0')),
    buildTextTag('cCT', cCT),
    buildTextTag('CFOP', ide.CFOP),
    buildTextTag('natOp', ide.natOp),
    buildTextTag('mod', padLeft(ide.mod, 2)),
    buildTextTag('serie', padLeft(ide.serie, 3)),
    buildTextTag('nCT', padLeft(ide.nCT, 9)),
    buildTextTag('dhEmi', ide.dhEmi),
    buildTextTag('tpImp', ide.tpImp),
    buildTextTag('tpEmis', ide.tpEmis),
    buildTextTag('cDV', dv),
    buildTextTag('tpAmb', ide.tpAmb),
    buildTextTag('tpCTe', ide.tpCTe),
    buildTextTag('procEmi', ide.procEmi),
    buildTextTag('verProc', ide.verProc),
    buildTextTag('cMunEnv', ide.cMunEnv),
    buildTextTag('xMunEnv', ide.xMunEnv),
    buildTextTag('UFEnv', ide.UFEnv),
    buildTextTag('modal', ide.modal),
    buildTextTag('tpServ', ide.tpServ),
    buildTextTag('indIEToma', ide.indIEToma),
  ].filter(Boolean);

  return wrap('ide', parts.join(''));
}

function buildCteEmitSection(emit: CteEmit): string {
  const parts = [
    buildTextTag('CNPJ', onlyDigits(emit.CNPJ)),
    buildTextTag('IE', onlyDigits(emit.IE)),
    buildTextTag('xNome', emit.xNome),
    buildOptionalTextTag('xFant', emit.xFant),
    buildAddress('enderEmit', emit.enderEmit),
  ].filter(Boolean);

  return wrap('emit', parts.join(''));
}

function buildCteRemSection(rem: CteRemetente): string {
  const parts = [
    rem.CNPJ ? buildTextTag('CNPJ', onlyDigits(rem.CNPJ)) : '',
    rem.CPF ? buildTextTag('CPF', onlyDigits(rem.CPF)) : '',
    buildOptionalTextTag('IE', rem.IE),
    buildTextTag('xNome', rem.xNome),
    buildOptionalTextTag('fone', rem.fone),
    buildAddress('enderReme', rem.enderReme),
  ].filter(Boolean);

  return wrap('rem', parts.join(''));
}

function buildCteDestSection(dest: CteDestinatario): string {
  const parts = [
    dest.CNPJ ? buildTextTag('CNPJ', onlyDigits(dest.CNPJ)) : '',
    dest.CPF ? buildTextTag('CPF', onlyDigits(dest.CPF)) : '',
    buildOptionalTextTag('IE', dest.IE),
    buildTextTag('xNome', dest.xNome),
    buildOptionalTextTag('fone', dest.fone),
    buildAddress('enderDest', dest.enderDest),
  ].filter(Boolean);

  return wrap('dest', parts.join(''));
}

function buildCteTomadorSection(toma: CteTomador): string {
  const parts = [buildTextTag('toma', toma.toma)];

  if (toma.toma3) {
    const toma3 = toma.toma3;
    const toma3Inner = [
      toma3.CNPJ ? buildTextTag('CNPJ', onlyDigits(toma3.CNPJ)) : '',
      toma3.CPF ? buildTextTag('CPF', onlyDigits(toma3.CPF)) : '',
      buildOptionalTextTag('IE', toma3.IE),
      buildTextTag('xNome', toma3.xNome),
      buildOptionalTextTag('fone', toma3.fone),
      buildAddress('enderToma', toma3.enderToma),
    ].filter(Boolean);
    parts.push(wrap('toma3', toma3Inner.join('')));
  }

  return wrap('toma', parts.join(''));
}

function buildCteVPrestSection(vPrest: CteVPrest): string {
  const components = vPrest.component
    .map(comp => wrap('comp', [buildTextTag('xNome', comp.xNome), buildTag('vComp', comp.vComp)].join('')))
    .join('');

  const parts = [
    buildTag('vTPrest', vPrest.vTPrest),
    buildTag('vRec', vPrest.vRec),
    components,
  ].filter(Boolean);

  return wrap('vPrest', parts.join(''));
}

function buildCteImpSection(imp: CteImp): string {
  const parts: string[] = [];

  if (imp.ICMS) {
    parts.push(wrap('ICMS', objectToXml(imp.ICMS as GenericObject)));
  }

  if (imp.infAdFisco) {
    parts.push(buildTextTag('infAdFisco', imp.infAdFisco));
  }

  return wrap('imp', parts.join(''));
}

function buildCteInfCargaSection(infCarga: CteInfCarga): string {
  const infQXml = infCarga.infQ
    .map(info => {
      const inner = [
        buildTextTag('cUnid', info.cUnid),
        buildTextTag('tpMed', info.tpMed),
        buildTag('qCarga', info.qCarga, 3),
      ].join('');
      return wrap('infQ', inner);
    })
    .join('');

  const parts = [
    buildTag('vCarga', infCarga.vCarga),
    buildTextTag('proPred', infCarga.proPred),
    buildOptionalTextTag('xOutCat', infCarga.xOutCat),
    infQXml,
  ].filter(Boolean);

  return wrap('infCarga', parts.join(''));
}

const CTE_MODAL_MAP: Record<string, keyof CteInfModal> = {
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

function buildCteInfModalSection(infModal: CteInfModal, modalCode: string): string {
  const versao = infModal.versaoModal ?? '4.00';
  const modalKey = CTE_MODAL_MAP[modalCode] ?? 'rodo';
  const modalData = infModal[modalKey];

  if (!modalData) {
    throw new Error(`infModal.${modalKey} ausente para modal ${modalCode}`);
  }

  let inner = '';
  if (modalKey === 'rodo') {
    inner = wrap('rodo', buildTextTag('RNTRC', (infModal.rodo as CteRodoviario).RNTRC));
  } else {
    inner = wrap(modalKey === 'duto' ? 'duto' : modalKey, objectToXml(modalData as GenericObject));
  }

  return wrap('infModal', inner, { versaoModal: versao });
}

function buildCteComplSection(payload: CreateCteDto): string {
  if (!payload.compl) {
    return '';
  }

  const parts = [
    buildOptionalTextTag('xObs', payload.compl.xObs),
    payload.compl.ObsCont
      ? payload.compl.ObsCont
          .map(obs => wrap('ObsCont', [buildOptionalTextTag('xCampo', obs.xCampo), buildTextTag('xTexto', obs.xTexto)].join('')))
          .join('')
      : '',
  ].filter(Boolean);

  if (!parts.length) {
    return '';
  }

  return wrap('compl', parts.join(''));
}

function buildCteAutXMLSection(payload: CreateCteDto): string {
  if (!payload.autXML?.length) {
    return '';
  }

  return payload.autXML
    .map(entry => {
      const inner = [
        entry.CNPJ ? buildTextTag('CNPJ', onlyDigits(entry.CNPJ)) : '',
        entry.CPF ? buildTextTag('CPF', onlyDigits(entry.CPF)) : '',
      ].filter(Boolean);
      return wrap('autXML', inner.join(''));
    })
    .join('');
}

function buildCteProtSection(payload: CreateCteDto): string {
  if (!payload.prot?.infRespTec) {
    return '';
  }

  const { infRespTec } = payload.prot;
  const inner = [
    buildTextTag('CNPJ', onlyDigits(infRespTec.CNPJ)),
    buildTextTag('xContato', infRespTec.xContato),
    buildTextTag('email', infRespTec.email),
    buildOptionalTextTag('fone', infRespTec.fone),
  ].filter(Boolean);

  return wrap('infRespTec', inner.join(''));
}

export function buildCTeXML(payload: CreateCteDto, chave: string, cCT: string): string {
  const ide = buildCteIdeSection(payload.ide, cCT, chave);
  const compl = buildCteComplSection(payload);
  const emit = buildCteEmitSection(payload.emit);
  const rem = buildCteRemSection(payload.rem);
  const dest = buildCteDestSection(payload.dest);
  const toma = buildCteTomadorSection(payload.toma);
  const vPrest = buildCteVPrestSection(payload.vPrest);
  const imp = buildCteImpSection(payload.imp);
  const infCarga = buildCteInfCargaSection(payload.infCarga);
  const infModal = buildCteInfModalSection(payload.infModal, payload.ide.modal);
  const autXML = buildCteAutXMLSection(payload);
  const infRespTec = buildCteProtSection(payload);

  const inner = [ide, compl, emit, rem, dest, toma, vPrest, imp, infCarga, infModal, autXML, infRespTec]
    .filter(Boolean)
    .join('');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<CTe xmlns="${CTE_NAMESPACE}">`,
    `<infCte Id="CTe${chave}" versao="4.00">${inner}</infCte>`,
    '</CTe>',
  ].join('');
}
