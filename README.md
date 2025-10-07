# Fiscal Microservice

Microserviço REST para emissão simulada de NF-e (MOC 4.00) e CT-e, utilizado por agentes orquestradores.

## Rotas
- POST `/api/nfe` → Gera chave de acesso compatível com o leiaute 4.00 e retorna XML completo.
- POST `/api/cte` → Gera chave de acesso de CT-e 4.00 e devolve XML com blocos ide/emit/rem/dest/toma/vPrest/imp/infCarga/infModal.
- POST `/api/certificate` → Recebe upload do certificado A1 (.pfx/.p12) e grava em `storage/certs/`.
- POST `/api/certificate/mock` → Gera certificado fictício para testes internos.
- GET `/playground` → Interface HTML para testar NF-e, CT-e e upload de certificados via navegador.

Documentação interativa em `/docs` (UI) e `/docs/json` (arquivo OpenAPI).

## Payload NF-e
Envie um JSON com blocos equivalentes ao leiaute oficial. Campos obrigatórios:

```json
{
  "ide": {
    "cUF": "35",
    "natOp": "VENDA DE MERCADORIA",
    "mod": "55",
    "serie": "1",
    "nNF": "12345",
    "dhEmi": "2025-07-10T12:00:00-03:00",
    "tpNF": "1",
    "idDest": "1",
    "cMunFG": "3550308",
    "tpImp": "1",
    "tpEmis": "1",
    "tpAmb": "2",
    "finNFe": "1",
    "indFinal": "1",
    "indPres": "1",
    "procEmi": "0",
    "verProc": "1.0.0"
  },
  "emit": {
    "CNPJ": "12345678000199",
    "xNome": "Transportadora JaguareTech LTDA",
    "IE": "123456789012",
    "CRT": "3",
    "enderEmit": {
      "xLgr": "Rua do Progresso",
      "nro": "100",
      "xBairro": "Centro",
      "cMun": "3550308",
      "xMun": "São Paulo",
      "UF": "SP",
      "CEP": "01001000",
      "cPais": "1058",
      "xPais": "BRASIL"
    }
  },
  "dest": {
    "CNPJ": "98765432000155",
    "xNome": "Cliente Exemplo LTDA",
    "indIEDest": "1",
    "enderDest": {
      "xLgr": "Avenida das Nações Unidas",
      "nro": "2000",
      "xBairro": "Pinheiros",
      "cMun": "3550308",
      "xMun": "São Paulo",
      "UF": "SP",
      "CEP": "05415002",
      "cPais": "1058",
      "xPais": "BRASIL"
    }
  },
  "items": [
    {
      "prod": {
        "cProd": "SKU123",
        "cEAN": "7891234567890",
        "xProd": "Monitor 27\" 4K",
        "NCM": "85285200",
        "CFOP": "5102",
        "uCom": "UN",
        "qCom": "2.0000",
        "vUnCom": "2500.0000000000",
        "vProd": "5000.00",
        "cEANTrib": "7891234567890",
        "uTrib": "UN",
        "qTrib": "2.0000",
        "vUnTrib": "2500.0000000000",
        "indTot": "1"
      },
      "imposto": {
        "ICMS": {
          "ICMS00": {
            "orig": "0",
            "CST": "00",
            "modBC": "3",
            "vBC": "5000.00",
            "pICMS": "18.00",
            "vICMS": "900.00"
          }
        },
        "PIS": {
          "PISAliq": {
            "CST": "01",
            "vBC": "5000.00",
            "pPIS": "1.65",
            "vPIS": "82.50"
          }
        },
        "COFINS": {
          "COFINSAliq": {
            "CST": "01",
            "vBC": "5000.00",
            "pCOFINS": "7.60",
            "vCOFINS": "380.00"
          }
        }
      }
    }
  ],
  "transp": {
    "modFrete": "0"
  },
  "pag": {
    "detPag": [
      {
        "indPag": "0",
        "tPag": "01",
        "vPag": "5000.00"
      }
    ]
  },
  "infAdic": {
    "infCpl": "Documento emitido em ambiente de homologação."
  }
}
```

### Resposta

```json
{
  "status": "authorized",
  "nfeKey": "35120712345678000199550010000123451000012349",
  "xml": "<?xml version=...>",
  "issuedAt": "2025-07-10T12:05:00.000Z",
  "accessKeyComponents": {
    "cNF": "00001234",
    "digitoVerificador": "9"
  }
}
```

Use `src/__fixtures__/nfe-payload.ts` como base para payloads de homologação e ajuste campos conforme o cenário.

## Payload CT-e

```json
{
  "ide": {
    "cUF": "35",
    "CFOP": "5351",
    "natOp": "PREST SERV TRANSPORTE",
    "mod": "57",
    "serie": "1",
    "nCT": "67890",
    "dhEmi": "2025-07-10T12:30:00-03:00",
    "tpImp": "1",
    "tpEmis": "1",
    "tpAmb": "2",
    "tpCTe": "0",
    "procEmi": "0",
    "verProc": "1.0.0",
    "cMunEnv": "3550308",
    "xMunEnv": "São Paulo",
    "UFEnv": "SP",
    "modal": "01",
    "tpServ": "0",
    "indIEToma": "1"
  },
  "emit": {
    "CNPJ": "12345678000199",
    "IE": "123456789012",
    "xNome": "Transportadora JaguareTech LTDA",
    "xFant": "JaguareTech",
    "enderEmit": {
      "xLgr": "Rua do Progresso",
      "nro": "100",
      "xBairro": "Centro",
      "cMun": "3550308",
      "xMun": "São Paulo",
      "CEP": "01001000",
      "UF": "SP",
      "cPais": "1058",
      "xPais": "BRASIL"
    }
  },
  "rem": {
    "CNPJ": "98765432000155",
    "IE": "908070605001",
    "xNome": "Remetente Exemplo LTDA",
    "enderReme": {
      "xLgr": "Avenida das Nações Unidas",
      "nro": "2000",
      "xBairro": "Pinheiros",
      "cMun": "3550308",
      "xMun": "São Paulo",
      "CEP": "05415002",
      "UF": "SP",
      "cPais": "1058",
      "xPais": "BRASIL"
    }
  },
  "dest": {
    "CNPJ": "10293847560123",
    "IE": "554433221100",
    "xNome": "Destinatário Industrial SA",
    "enderDest": {
      "xLgr": "Rodovia BR-040",
      "nro": "KM 25",
      "xBairro": "Distrito Industrial",
      "cMun": "3106200",
      "xMun": "Belo Horizonte",
      "CEP": "31275000",
      "UF": "MG",
      "cPais": "1058",
      "xPais": "BRASIL"
    }
  },
  "toma": {
    "toma": "4",
    "toma3": {
      "CNPJ": "74185296000188",
      "IE": "112233445566",
      "xNome": "Tomador Logística Integrada",
      "enderToma": {
        "xLgr": "Rua das Docas",
        "nro": "500",
        "xBairro": "Porto",
        "cMun": "3304557",
        "xMun": "Rio de Janeiro",
        "CEP": "20010000",
        "UF": "RJ",
        "cPais": "1058",
        "xPais": "BRASIL"
      }
    }
  },
  "vPrest": {
    "vTPrest": "6200.00",
    "vRec": "6200.00",
    "component": [
      { "xNome": "Frete peso", "vComp": "5000.00" },
      { "xNome": "Pedágio", "vComp": "200.00" }
    ]
  },
  "imp": {
    "ICMS": {
      "ICMS00": {
        "CST": "00",
        "orig": "0",
        "pICMS": "12.00",
        "vBC": "6200.00",
        "vICMS": "744.00"
      }
    },
    "infAdFisco": "Tributação normal do serviço de transporte."
  },
  "infCarga": {
    "vCarga": "8000.00",
    "proPred": "Equipamentos eletrônicos",
    "infQ": [
      { "cUnid": "00", "tpMed": "KG", "qCarga": "1200.000" }
    ]
  },
  "infModal": {
    "versaoModal": "4.00",
    "rodo": { "RNTRC": "12345678" }
  }
}
```

Resposta CT-e segue o mesmo padrão da NF-e, expondo `cteKey`, XML completo e `accessKeyComponents` com `cCT` e dígito verificador. Consulte `src/__fixtures__/cte-payload.ts` para o payload completo usado nos testes.

> Para modais não rodoviários (`ide.modal` = `02`, `03`, `04`, `05`, `06`), informe o bloco correspondente em `infModal` (`aereo`, `aquav`, `ferro`, `duto`, `multimodal`). O serviço valida que somente o bloco compatível esteja presente e serializa os campos fornecidos.

## Certificados A1

- Use `POST /api/certificate` com `multipart/form-data` (`file` = PFX/P12, `password` opcional) para armazenar o certificado na instância.
- O endpoint retorna o nome sanitizado, caminho e senha informada (se houver). Restrinja permissões do diretório `storage/certs/` em produção.
- Para validar o fluxo sem um arquivo real, chame `POST /api/certificate/mock`; um certificado fictício é gerado com senha `mock-password`.
- Acesse `/playground` para fazer o upload manualmente e visualizar a resposta de cada endpoint.

## Testes

```bash
yarn test
```

Os testes garantem que a chave de acesso tem 44 dígitos com DV calculado por módulo 11 e que o XML contém os blocos obrigatórios do MOC 4.00.
