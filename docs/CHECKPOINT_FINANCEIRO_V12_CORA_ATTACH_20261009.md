# CONSTRU-REI — Checkpoint Financeiro V12 — Comprovante Cora anexo no Trello

**Data:** 09/10/2026  
**Estado:** escopo auditado, trabalho aberto; NÃO implementado nem homologado.

## Baseline congelada
- Dashboard V11 HOMOLOGADO no URL estável: https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/dashboard-financeiro-v4/
- Capital de Giro: débito real, histórico em card Trello e saldo do Dashboard testados/aprovados pela diretoria.
- Cora Manual: parser do comprovante de Pix e preenchimento de campos validado pela diretoria.
- Compromisso de compatibilidade: não sobrescrever a V11; desenvolver anexo somente em candidata independente, sem alterar o URL de produção antes da homologação.

## Diagnóstico técnico de 09/10
- A UI homologada preserva arquivo no browser para análise; o texto na interface declara que o arquivo NÃO é anexado automaticamente ao Trello.
- A Edge `cr-dashboard-gerencial-v4-manual-cora-ui-candidate-20261007` v3 autentica via `central-gestao-api?api=me` e retransmite operações `manual-cora-preview` e `manual-cora-commit` para `cr-dashboard-gerencial-v4-manual-cora-candidate-20261007`.
- Os fluxos de preview/commit existentes enviam JSON; não recebem o PDF binário na requisição. Não há prova de anexo no card e não se deve rotular o comprovante como arquivado.
- Banco mestre: `FIN-V12-CORA-ATTACH-20261009` Em andamento, área FINANCEIRO, separado do V11 homologado. `EXEC-FIN-V5-20261006` (R18) permanece aberto SOMENTE para auditoria de delta; não assumir que tudo o que fazia já foi substituído.

## Contrato funcional da candidata V12
1. Seleção de PDF/imagem original em Cora Manual; parser V11 continua sugerindo campos com revisão humana.
2. Validar obra/card e operação via API já homologada; nenhuma gravação durante preview.
3. Confirmar movimento financeiro uma única vez com `operation_id` estável (inclusive após falhas de rede/retry).
4. Anexar original ao ID do **mesmo** card devolvido/resolvido pelo backend; credenciais e chaves Trello exclusivamente server-side. Nunca usar URL de terceiros fornecida pelo arquivo para enviar dados.
5. Verificar `attachment.id`, nome, tamanho e `cardId` retornados pela API; armazenar correlação por `operation_id` e hash do arquivo para evitar duplicações.
6. Se a contabilização ocorreu e o anexo falhou, registrar estado **LANÇAMENTO CONFIRMADO / ANEXO PENDENTE** e permitir novo envio SOMENTE do anexo; não repetir o débito.
7. Permitir verificação no card Trello e confirmação em celular/notebook antes de homologação. Nenhum teste real com valores inventados.
8. Não anexar automaticamente sem autorização de usuário, não enviar comprovantes a provedores OCR não aprovados sem avaliação de privacidade.

## Próximas ações
- CR Assertivo: implementação candidata da API segura de upload (preferência para `multipart/form-data` com limites e validações MIME/PDF/PNG/JPEG), persistência de estado e idempotência.
- Financeiro REI: validar o vínculo movimento/obra, segurança do custo e conferência no Trello.
- Rogério: 1 teste controlado, registro evidência no mesmo card, aprovação ou correção.
- Após V12: frente APP F03 e gate F00–F09 (IDs `APP-F03-20261008` e `APP-CLOSE-018`) já registrados; sem abrir dois desenvolvimentos técnicos concorrentes.

## Pendências não encobertas pela V12
- Acesso direto à API Cora e conciliação do extrato não são demonstrados pela leitura manual do PDF.
- O R18 legado precisa de auditoria de delta; não concluir automaticamente.
