# CONSTRU-REI — Cofre Zero / Recuperação de Edge e Cobertura Externa

Data de auditoria: 10/10/2026 — registro após a sessão noturna em Curitiba.
Estado: **RECUPERAÇÃO COMPLEMENTAR EFETUADA; COBERTURA INTEGRAL AINDA NÃO HOMOLOGADA**.

## Evidência de referência
- Supabase Centro de Controle: 366 Edge Functions ativas/inventariadas.
- Backup de código anterior em Google Drive `CONSTRUREI-BACKUP-AUTO/EDGE_FUNCTIONS_CURRENT`: 338 diretórios com arquivo de listagem e manifesto SHA-256 (339 registros de arquivo).
- Comparação por slug com origem atual: 28 funções ausentes da cópia anterior.
- Comparação de atualização com captura-base de 04/10/2026 08:15 UTC: 9 funções antes copiadas receberam versões posteriores.
- **37 funções preservadas como código-fonte JSON versionado em Drive privado**, divididas em 4 lotes de Delta (28) e 2 lotes de Refresh (9). Conteúdo conferido com leitura de volta e igualdade de textos, sem teste de deploy em produção.
- Local: Drive privado `CONSTRUREI-COFRE-ZERO/24_EXTERNAL_SOURCES/EDGE_DELTA_20261010_28_FUNCOES` e `EDGE_REFRESH_20261010_09_FUNCOES`.
- Manifest privado `COFRE_ZERO_MANIFEST_COBERTURA_20261010__366_EDGE_GITHUB_NETLIFY` contém slug, versão, hash do bundle, localização de recuperação e instruções.
- A baseline histórica continua intacta; documentos privados não devem ser publicados no GitHub nem tratados como executáveis diretamente.

## GitHub
- Repositório principal `rogeriocibin-alt/construrei-oauth-pages` — branch `checkpoint/cofre-zero-offsite-edge-20261010` criada sobre commit `1e79057beb10fde734f4cd6ea1ce39a63ae5a6ca`.
- Repositório financeiro privado `rogeriocibin-alt/construrei-dashboard-v4-candidate` — branch `checkpoint/cofre-zero-source-baseline-20261010` criada sobre commit `9d244e76e9e292e753ea126bbc70fe6d146c2139`.
- Checkpoints não constituem cópia externa independente do GitHub. Nenhum código do `main` foi modificado.

## Netlify
- Sete sites inventariados pelo conector, metadados de deploy registrados no manifesto privado. Configurações, artefatos de deploy e backups independentes não foram exportados nesta etapa.

## Estado da rotina principal
- Backups diários oficiais do banco/Storage continuam sob Google Cloud Run + Scheduler, às 03:00 America/Sao_Paulo, sem notebook.
- Última evidência do pacote: 10/10/2026; três arquivos SQL, 4.526 objetos Storage. Restore integral independente homologado em 05/10/2026.
- Não foi alterada configuração de Cloud Run, Scheduler, cofres/segredos, RLS, Edge Functions, banco de dados operacional, central, APP ou rotas.

## Pendências tecnicamente necessárias
1. Verificar arquivo a arquivo o conteúdo e hash dos 338 diretórios da baseline antiga; somente a existência dos diretórios e do manifesto foi auditada em 10/10.
2. Exportar externamente dados completos dos dois repositórios GitHub (incluindo branch/tag e artefatos críticos) e das sete implantações Netlify em armazenamento independente, com credencial cloud apropriada, sem custo adicional e sem notebook.
3. Repetir restauração isolada e validar recuperação de código completo, metadados e configuração não secreta; recuperar segredos somente do gerenciador seguro apropriado.
4. Garantir que mecanismo contínuo capture novas funções/redeploys e produza manifesto versionado, sem depender de chat/manualidade.

## Banco mestre
- `EXEC-BACKUP-AUTO-20261006`: Concluído; não reabrir.
- `EXEC-COFRE-COVERAGE-20261010`: Em andamento, P1, checklist 3/5; separar implementação de backup offsite de mera auditoria de inventário.

## Regras invioláveis
Sem dependência do notebook, sem segredos no repositório público, sem dados destrutivos, sem custos não autorizados, sem alterar o motor diário e sem declarar 100% sem restauração e integridade provadas.
