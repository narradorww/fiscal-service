# Repository Guidelines

## Project Structure & Module Organization
- NestJS microserviço que converte JSON agentic em NF-e/CT-e 4.00 mockados.
- `src/nfe` concentra o fluxo de NF-e: `dto/create-nfe.dto.ts` define o contrato oficial e validações básicas; `nfe.service.ts` gera chave de acesso (módulo 11) e delega para `src/common/utils/xml-builder.ts` montar o XML com blocos ide/emit/dest/det/total/transp/pag/infAdic.
- `src/cte` replica o padrão: `dto/create-cte.dto.ts` valida o payload (ide, emit, rem, dest, toma, vPrest, imp, infCarga, infModal) e `cte.service.ts` monta chave de acesso e XML completo usando o mesmo builder.
- `src/__fixtures__/nfe-payload.ts` e `src/__fixtures__/cte-payload.ts` armazenam payloads homologatórios prontos para copy/paste durante testes.
- Artifactos compilados residem em `dist/`; mantenha-o fora de commits.

## Build, Test, and Development Commands
- `yarn install` (Node 22+) mantém dependências alinhadas ao `yarn.lock`.
- `yarn start` ou `yarn start:dev` sobem a API em `http://localhost:3000/api`.
- `yarn nest build` gera artefatos TypeScript antes de empacotar.
- `yarn test` executa Jest em modo `--runInBand`, cobrindo validação de payload e geração da chave/XML.
- Após subir o serviço, consulte `http://localhost:3000/docs` (UI) ou `http://localhost:3000/docs/json` para o contrato OpenAPI.
- Upload de certificados A1: `POST /api/certificate` (multipart) grava `.pfx/.p12` em `storage/certs/`; `POST /api/certificate/mock` cria um arquivo fictício para automações.

## Coding Style & Naming Conventions
- Two-space indent, aspas simples e ponto-e-vírgula; siga o padrão de `nfe.service.ts`.
- Classes e providers em `PascalCase`, funções/variáveis em `camelCase`; DTOs terminam com `Dto`.
- No `xml-builder`, mantenha helpers puros (`objectToXml`, `formatDecimal`) e sempre escape valores com `escapeXml`.
- Evite literais mágicos: derive campos (ex.: `cNF`) via helpers reutilizáveis.

## NF-e Contract Essentials
- Payload deve espelhar o MOC 4.00: blocos `ide`, `emit`, `dest`, `items[]` (com `prod` + `imposto`), `transp`, `pag` e `infAdic`.
- Campos numéricos devem chegar como string/number saneados; o serviço converte para casas decimais corretas (qCom/qTrib: 4, valores monetários: 2, unitários: 10).
- Utilize `totalOverrides` para sobrepor valores agregados quando necessário; caso contrário, o serviço calcula `vProd`, `vNF`, `vTotTrib` automaticamente.

## CT-e Contract Essentials
- O payload segue o MOC CT-e 4.00 com blocos `ide`, `emit`, `rem`, `dest`, `toma` (atributo `toma` + detalhamento `toma3` quando aplicável), `vPrest`, `imp`, `infCarga`, `infModal` e opcionais (`compl`, `autXML`, `infRespTec`).
- Informe `ide.cCT` para gerar chave determinística; se omitido, o serviço cria um número randômico de 8 dígitos e devolve em `accessKeyComponents.cCT`.
- Quantidades de carga usam três casas decimais (`qCarga`), valores monetários duas, e todos os campos são normalizados pelo builder com escapo XML automático.
- `infModal` aceita apenas o bloco correspondente ao modal informado em `ide.modal` (ex.: `rodo` para `01`, `aereo` para `02`, `aquav` para `03`); qualquer outro bloco é rejeitado para garantir consistência.

## Testing Guidelines
- Escreva specs em `*.spec.ts` próximos ao código; use `structuredClone` para não mutar fixtures.
- Amplie coberturas validando cenários de erro (CNPJ inválido, item faltante, impostos inconsistentes) e gerando snapshots XML se fizer alterações estruturais.
- Mantenha os testes verdes (`yarn test`) antes de abrir PRs.

## Commit & Pull Request Guidelines
- Use Conventional Commits (`feat:`, `fix:`, `refactor:`) e escopo enxuto.
- Documente validação manual (curl) ou automática (tests) no corpo da PR e anexe trechos relevantes do XML quando o schema mudar.
- Garanta que docs (`README.md`, `AGENTS.md`) reflitam qualquer ajuste no contrato consumido pelos agentes.

## Agent Integration Notes
- Respostas são determinísticas: se informar `ide.cNF`, a chave gerada será estável; caso contrário, o serviço randomiza e devolve o `cNF` em `accessKeyComponents` para rastreio.
- Atualize integrações CREWAI sempre que novos campos forem requeridos e revise o Swagger (se habilitado) para expor o contrato atualizado.
