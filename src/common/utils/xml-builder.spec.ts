import { homologationNfePayload } from '../../__fixtures__/nfe-payload';
import { homologationCtePayload } from '../../__fixtures__/cte-payload';
import { buildCTeXML, buildNFeXML, generateCTeAccessKey, generateNFeAccessKey } from './xml-builder';
import { validateNfePayload } from '../../nfe/dto/create-nfe.dto';
import { validateCtePayload } from '../../cte/dto/create-cte.dto';

describe('NF-e XML builder', () => {
  it('gera chave de acesso com 44 dígitos e DV válido', () => {
    const payload = structuredClone(homologationNfePayload);
    payload.ide.cNF = '12345678';

    validateNfePayload(payload);
    const { chave, cNF } = generateNFeAccessKey(payload);

    expect(cNF).toBe('12345678');
    expect(chave).toHaveLength(44);
    expect(/^[0-9]{44}$/.test(chave)).toBe(true);

    const base = chave.slice(0, -1);
    const dv = Number(chave.slice(-1));
    expect(dv).toBe(calcDV(base));
  });

  it('monta XML alinhado com o leiaute 4.00 contendo blocos obrigatórios', () => {
    const payload = structuredClone(homologationNfePayload);
    payload.ide.cNF = '22223333';

    const { chave, cNF } = generateNFeAccessKey(payload);
    const xml = buildNFeXML(payload, chave, cNF);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<NFe xmlns="http://www.portalfiscal.inf.br/nfe">');
    expect(xml).toContain(`<infNFe Id="NFe${chave}" versao="4.00">`);
    expect(xml).toContain('<ide>');
    expect(xml).toContain('<emit>');
    expect(xml).toContain('<dest>');
    expect(xml).toContain('<det nItem="1">');
    expect(xml).toContain('<total><ICMSTot>');
    expect(xml).toContain('<transp>');
    expect(xml).toContain('<pag>');
    expect(xml).toContain('<infAdic>');
    expect(xml).toContain('<cDV>');
    expect(xml).toContain(`<vProd>${payload.items[0].prod.vProd}</vProd>`);
    expect(xml).toContain('<ICMS00>');
    expect(xml).toContain('<PISAliq>');
    expect(xml).toContain('<COFINSAliq>');
  });
});

describe('CT-e XML builder', () => {
  it('gera chave de acesso com 44 dígitos e DV válido', () => {
    const payload = structuredClone(homologationCtePayload);
    payload.ide.cCT = '87654321';

    validateCtePayload(payload);
    const { chave, cCT } = generateCTeAccessKey(payload);

    expect(cCT).toBe('87654321');
    expect(chave).toHaveLength(44);
    expect(/^[0-9]{44}$/.test(chave)).toBe(true);

    const base = chave.slice(0, -1);
    const dv = Number(chave.slice(-1));
    expect(dv).toBe(calcDV(base));
  });

  it('monta XML alinhado com o leiaute 4.00 contendo blocos essenciais', () => {
    const payload = structuredClone(homologationCtePayload);
    payload.ide.cCT = '11112222';

    const { chave, cCT } = generateCTeAccessKey(payload);
    const xml = buildCTeXML(payload, chave, cCT);

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<CTe xmlns="http://www.portalfiscal.inf.br/cte">');
    expect(xml).toContain(`<infCte Id="CTe${chave}" versao="4.00">`);
    expect(xml).toContain('<ide>');
    expect(xml).toContain('<emit>');
    expect(xml).toContain('<rem>');
    expect(xml).toContain('<dest>');
    expect(xml).toContain('<toma><toma>4</toma>');
    expect(xml).toContain('<vPrest>');
    expect(xml).toContain('<comp>');
    expect(xml).toContain('<imp>');
    expect(xml).toContain('<infCarga>');
    expect(xml).toContain('<infModal versaoModal="4.00">');
    expect(xml).toContain('<rodo>');
    expect(xml).toContain('<RNTRC>12345678</RNTRC>');
    expect(xml).toContain('<infRespTec>');
  });

  it.each([
    ['0', 'Remetente'],
    ['1', 'Expedidor'],
    ['2', 'Recebedor'],
    ['3', 'Destinatário'],
  ])('renderiza bloco toma simples para código %s (%s)', (codigo) => {
    const payload = structuredClone(homologationCtePayload);
    payload.toma = { toma: codigo as '0' | '1' | '2' | '3' };

    const { chave, cCT } = generateCTeAccessKey(payload);
    const xml = buildCTeXML(payload, chave, cCT);

    expect(xml).toContain(`<toma><toma>${codigo}</toma></toma>`);
    expect(xml).not.toContain('<toma3>');
  });

  it('renderiza modal aéreo genérico', () => {
    const payload = structuredClone(homologationCtePayload);
    payload.ide.modal = '02';
    payload.infModal = {
      versaoModal: '5.00',
      aereo: {
        nMinu: 'MINUTA123',
        nOCA: 'OCA456',
        dPrevAereo: '2025-07-11',
      },
    };

    const { chave, cCT } = generateCTeAccessKey(payload);
    const xml = buildCTeXML(payload, chave, cCT);

    expect(xml).toContain('<infModal versaoModal="5.00"><aereo>');
    expect(xml).toContain('<nMinu>MINUTA123</nMinu>');
    expect(xml).toContain('<dPrevAereo>2025-07-11</dPrevAereo>');
    expect(xml).not.toContain('<rodo>');
  });
});

function calcDV(sequence: string): number {
  let factor = 2;
  let sum = 0;

  for (let i = sequence.length - 1; i >= 0; i -= 1) {
    sum += Number(sequence[i]) * factor;
    factor = factor === 9 ? 2 : factor + 1;
  }

  const mod = sum % 11;
  return mod === 0 || mod === 1 ? 0 : 11 - mod;
}
