const addressSchema = {
  type: 'object',
  required: ['xLgr', 'nro', 'xBairro', 'cMun', 'xMun', 'UF', 'cPais', 'xPais'],
  properties: {
    xLgr: { type: 'string' },
    nro: { type: 'string' },
    xCpl: { type: 'string' },
    xBairro: { type: 'string' },
    cMun: { type: 'string' },
    xMun: { type: 'string' },
    CEP: { type: 'string' },
    UF: { type: 'string' },
    cPais: { type: 'string' },
    xPais: { type: 'string' },
    fone: { type: 'string' }
  }
};

const transportComponentSchema = {
  type: 'object',
  required: ['xNome', 'vComp'],
  properties: {
    xNome: { type: 'string' },
    vComp: { type: 'string' }
  }
};

export const NFE_REQUEST_SCHEMA = {
  type: 'object',
  required: ['ide', 'emit', 'dest', 'items', 'transp', 'pag'],
  properties: {
    ide: {
      type: 'object',
      required: [
        'cUF',
        'natOp',
        'mod',
        'serie',
        'nNF',
        'dhEmi',
        'tpNF',
        'idDest',
        'cMunFG',
        'tpImp',
        'tpEmis',
        'tpAmb',
        'finNFe',
        'indFinal',
        'indPres',
        'procEmi',
        'verProc'
      ],
      properties: {
        cUF: { type: 'string', example: '35' },
        cNF: { type: 'string', example: '12345678' },
        natOp: { type: 'string' },
        mod: { type: 'string', example: '55' },
        serie: { type: 'string', example: '1' },
        nNF: { type: 'string', example: '12345' },
        dhEmi: { type: 'string', format: 'date-time' },
        dhSaiEnt: { type: 'string', format: 'date-time' },
        tpNF: { type: 'string', enum: ['0', '1'] },
        idDest: { type: 'string', enum: ['1', '2', '3'] },
        cMunFG: { type: 'string' },
        tpImp: { type: 'string', enum: ['0', '1', '2', '3', '4'] },
        tpEmis: { type: 'string', enum: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] },
        tpAmb: { type: 'string', enum: ['1', '2'] },
        finNFe: { type: 'string', enum: ['1', '2', '3', '4'] },
        indFinal: { type: 'string', enum: ['0', '1'] },
        indPres: { type: 'string', enum: ['0', '1', '2', '3', '4', '5', '9'] },
        indIntermed: { type: 'string', enum: ['0', '1', '2'] },
        procEmi: { type: 'string', enum: ['0', '1', '2', '3'] },
        verProc: { type: 'string' },
        NFref: { type: 'array', items: { type: 'string' } }
      }
    },
    emit: {
      type: 'object',
      required: ['CNPJ', 'xNome', 'IE', 'CRT', 'enderEmit'],
      properties: {
        CNPJ: { type: 'string', example: '12345678000199' },
        xNome: { type: 'string' },
        xFant: { type: 'string' },
        IE: { type: 'string' },
        IEST: { type: 'string' },
        IM: { type: 'string' },
        CNAE: { type: 'string' },
        CRT: { type: 'string', enum: ['1', '2', '3'] },
        enderEmit: addressSchema
      }
    },
    dest: {
      type: 'object',
      required: ['xNome', 'indIEDest', 'enderDest'],
      properties: {
        CNPJ: { type: 'string' },
        CPF: { type: 'string' },
        idEstrangeiro: { type: 'string' },
        xNome: { type: 'string' },
        indIEDest: { type: 'string', enum: ['1', '2', '9'] },
        IE: { type: 'string' },
        ISUF: { type: 'string' },
        IM: { type: 'string' },
        email: { type: 'string', format: 'email' },
        enderDest: addressSchema
      }
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        required: ['prod', 'imposto'],
        properties: {
          prod: {
            type: 'object',
            required: [
              'cProd',
              'cEAN',
              'xProd',
              'NCM',
              'CFOP',
              'uCom',
              'qCom',
              'vUnCom',
              'vProd',
              'cEANTrib',
              'uTrib',
              'qTrib',
              'vUnTrib',
              'indTot'
            ],
            properties: {
              cProd: { type: 'string' },
              cEAN: { type: 'string' },
              xProd: { type: 'string' },
              NCM: { type: 'string' },
              CEST: { type: 'string' },
              CFOP: { type: 'string' },
              uCom: { type: 'string' },
              qCom: { type: 'string' },
              vUnCom: { type: 'string' },
              vProd: { type: 'string' },
              cEANTrib: { type: 'string' },
              uTrib: { type: 'string' },
              qTrib: { type: 'string' },
              vUnTrib: { type: 'string' },
              vFrete: { type: 'string' },
              vSeg: { type: 'string' },
              vDesc: { type: 'string' },
              vOutro: { type: 'string' },
              indTot: { type: 'string', enum: ['0', '1'] },
              xPed: { type: 'string' },
              nItemPed: { type: 'string' },
              infAdProd: { type: 'string' }
            }
          },
          imposto: {
            type: 'object',
            properties: {
              vTotTrib: { type: 'string' },
              ICMS: { type: 'object', additionalProperties: true },
              IPI: { type: 'object', additionalProperties: true },
              PIS: { type: 'object', additionalProperties: true },
              COFINS: { type: 'object', additionalProperties: true },
              II: { type: 'object', additionalProperties: true },
              ISSQN: { type: 'object', additionalProperties: true }
            }
          }
        }
      }
    },
    transp: {
      type: 'object',
      required: ['modFrete'],
      properties: {
        modFrete: { type: 'string' },
        transporta: {
          type: 'object',
          properties: {
            CNPJ: { type: 'string' },
            CPF: { type: 'string' },
            xNome: { type: 'string' },
            IE: { type: 'string' },
            xEnder: { type: 'string' },
            xMun: { type: 'string' },
            UF: { type: 'string' }
          }
        },
        vol: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              qVol: { type: 'string' },
              esp: { type: 'string' },
              marca: { type: 'string' },
              nVol: { type: 'string' },
              pesoL: { type: 'string' },
              pesoB: { type: 'string' }
            }
          }
        }
      }
    },
    pag: {
      type: 'object',
      required: ['detPag'],
      properties: {
        detPag: {
          type: 'array',
          items: {
            type: 'object',
            required: ['tPag', 'vPag'],
            properties: {
              indPag: { type: 'string', enum: ['0', '1', '2'] },
              tPag: { type: 'string' },
              vPag: { type: 'string' },
              card: {
                type: 'object',
                properties: {
                  tpIntegra: { type: 'string', enum: ['1', '2'] },
                  CNPJ: { type: 'string' },
                  tBand: { type: 'string' },
                  cAut: { type: 'string' }
                }
              }
            }
          }
        },
        vTroco: { type: 'string' }
      }
    },
    infAdic: {
      type: 'object',
      properties: {
        infAdFisco: { type: 'string' },
        infCpl: { type: 'string' }
      }
    },
    totalOverrides: {
      type: 'object',
      additionalProperties: { type: 'string' }
    }
  }
};

export const NFE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', example: 'authorized' },
    nfeKey: {
      type: 'string',
      example: '35120712345678000199550010000123451000012349'
    },
    xml: { type: 'string' },
    issuedAt: { type: 'string', format: 'date-time' },
    accessKeyComponents: {
      type: 'object',
      properties: {
        cNF: { type: 'string', example: '00001234' },
        digitoVerificador: { type: 'string', example: '9' }
      }
    }
  }
};

export const CTE_REQUEST_SCHEMA = {
  type: 'object',
  required: ['ide', 'emit', 'rem', 'dest', 'toma', 'vPrest', 'imp', 'infCarga', 'infModal'],
  properties: {
    ide: {
      type: 'object',
      required: [
        'cUF',
        'CFOP',
        'natOp',
        'mod',
        'serie',
        'nCT',
        'dhEmi',
        'tpImp',
        'tpEmis',
        'tpAmb',
        'tpCTe',
        'procEmi',
        'verProc',
        'cMunEnv',
        'xMunEnv',
        'UFEnv',
        'modal',
        'tpServ',
        'indIEToma'
      ],
      properties: {
        cUF: { type: 'string', example: '35' },
        cCT: { type: 'string', example: '12345678' },
        CFOP: { type: 'string', example: '5351' },
        natOp: { type: 'string' },
        mod: { type: 'string', example: '57' },
        serie: { type: 'string', example: '1' },
        nCT: { type: 'string', example: '67890' },
        dhEmi: { type: 'string', format: 'date-time' },
        tpImp: { type: 'string', enum: ['0', '1', '2', '3', '4', '5'] },
        tpEmis: { type: 'string', enum: ['1', '2', '3', '4', '5', '7', '8', '9'] },
        tpAmb: { type: 'string', enum: ['1', '2'] },
        tpCTe: { type: 'string', enum: ['0', '1', '2', '3'] },
        procEmi: { type: 'string', enum: ['0', '1', '2', '3'] },
        verProc: { type: 'string' },
        cMunEnv: { type: 'string' },
        xMunEnv: { type: 'string' },
        UFEnv: { type: 'string' },
        modal: { type: 'string', enum: ['01', '02', '03', '04', '05', '06', '07', '08', '09'] },
        tpServ: { type: 'string', enum: ['0', '1', '2', '3', '4'] },
        indIEToma: { type: 'string', enum: ['1', '2', '3', '4', '5', '6'] }
      }
    },
    emit: {
      type: 'object',
      required: ['CNPJ', 'IE', 'xNome', 'enderEmit'],
      properties: {
        CNPJ: { type: 'string' },
        IE: { type: 'string' },
        xNome: { type: 'string' },
        xFant: { type: 'string' },
        enderEmit: addressSchema
      }
    },
    rem: {
      type: 'object',
      required: ['xNome', 'enderReme'],
      properties: {
        CNPJ: { type: 'string' },
        CPF: { type: 'string' },
        IE: { type: 'string' },
        xNome: { type: 'string' },
        fone: { type: 'string' },
        enderReme: addressSchema
      }
    },
    dest: {
      type: 'object',
      required: ['xNome', 'enderDest'],
      properties: {
        CNPJ: { type: 'string' },
        CPF: { type: 'string' },
        IE: { type: 'string' },
        xNome: { type: 'string' },
        fone: { type: 'string' },
        enderDest: addressSchema
      }
    },
    toma: {
      type: 'object',
      required: ['toma'],
      properties: {
        toma: { type: 'string', enum: ['0', '1', '2', '3', '4'] },
        toma3: {
          type: 'object',
          required: ['xNome', 'enderToma'],
          properties: {
            CNPJ: { type: 'string' },
            CPF: { type: 'string' },
            IE: { type: 'string' },
            xNome: { type: 'string' },
            fone: { type: 'string' },
            enderToma: addressSchema
          }
        }
      }
    },
    vPrest: {
      type: 'object',
      required: ['vTPrest', 'vRec', 'component'],
      properties: {
        vTPrest: { type: 'string' },
        vRec: { type: 'string' },
        component: {
          type: 'array',
          items: transportComponentSchema
        }
      }
    },
    imp: {
      type: 'object',
      properties: {
        ICMS: { type: 'object', additionalProperties: true },
        infAdFisco: { type: 'string' }
      }
    },
    infCarga: {
      type: 'object',
      required: ['vCarga', 'proPred', 'infQ'],
      properties: {
        vCarga: { type: 'string' },
        proPred: { type: 'string' },
        xOutCat: { type: 'string' },
        infQ: {
          type: 'array',
          items: {
            type: 'object',
            required: ['cUnid', 'tpMed', 'qCarga'],
            properties: {
              cUnid: { type: 'string', enum: ['00', '01', '02', '03', '04', '05', '06', '07', '08'] },
              tpMed: { type: 'string' },
              qCarga: { type: 'string' }
            }
          }
        }
      }
    },
    infModal: {
      type: 'object',
      description: 'Informe apenas o bloco compatível com o modal de transporte.',
      properties: {
        versaoModal: { type: 'string', example: '4.00' },
        rodo: {
          type: 'object',
          properties: {
            RNTRC: { type: 'string' }
          }
        },
        aereo: { type: 'object', additionalProperties: true },
        aquav: { type: 'object', additionalProperties: true },
        ferro: { type: 'object', additionalProperties: true },
        duto: { type: 'object', additionalProperties: true },
        multimodal: { type: 'object', additionalProperties: true }
      }
    },
    autXML: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          CNPJ: { type: 'string' },
          CPF: { type: 'string' }
        }
      }
    },
    prot: {
      type: 'object',
      properties: {
        infRespTec: {
          type: 'object',
          properties: {
            CNPJ: { type: 'string' },
            xContato: { type: 'string' },
            email: { type: 'string', format: 'email' },
            fone: { type: 'string' }
          }
        }
      }
    }
  }
};

export const CTE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', example: 'authorized' },
    cteKey: {
      type: 'string',
      example: '35120712345678000199570010000678901000056781'
    },
    xml: { type: 'string' },
    issuedAt: { type: 'string', format: 'date-time' },
    accessKeyComponents: {
      type: 'object',
      properties: {
        cCT: { type: 'string', example: '00005678' },
        digitoVerificador: { type: 'string', example: '1' }
      }
    }
  }
};
