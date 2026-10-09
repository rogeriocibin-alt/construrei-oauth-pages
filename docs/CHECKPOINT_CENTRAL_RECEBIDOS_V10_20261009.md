# CHECKPOINT — CENTRAL RECEBIDOS V10 — 09/10/2026

Estado: APROVADO pela diretoria após teste funcional da candidata V10. Promoção V10 ao endereço oficial, com conservação de rollback e sem mudança de URL.

- Oficial: https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/central-operacional-v2-ux-r1-2-homologada-20261005/
- Candidata aprovada: https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/central-recebidos-v10-20261009-candidate/index.html
- JS aprovado de origem: preview/central-recebidos-v10-20261009-candidate/status-drilldown.js; blob SHA 7a131824ab6b73779f6648a438fc6f3a9078cacd
- JS de produção anterior para restauração: production/central-operacional-v2-ux-r1-2-homologada-20261005/clean-native.js; blob SHA 4149b09125b8651eea0b52b5517447159d48b027
- HTML de produção anterior para restauração: production/central-operacional-v2-ux-r1-2-homologada-20261005/index.html; blob SHA 54aed946ca46d96f5ec9698d2afd96da3894e4b7
- Período mês corrente determinado em America/Sao_Paulo, sem valores fixos.
- Fonte recebimentos: Supabase cr-gc-recebidos-v10-candidate-20261009; total_cents, count, period_start, read_at; atualização automática em 120 segundos enquanto página aberta.
- Falha da fonte: indicador indisponível ('—'), jamais inventar valor nem converter indisponibilidade em zero.
- Os sete cartões/status oficiais seguem com seus IDs e cores originais. Ao clicar em Recebidos, abre a listagem financeira filtrada pelo mês corrente.
- Verificação humana declarada: candidata funcionou. Teste posterior em produção/celular ainda não observado nesta execução.
- Antirregressão: mudar somente por candidata isolada, validação do diretor, checkpoint e promoção com rollback.
- Observação técnica: arquivo JS anterior em produção apresentava trecho inconsistente na região do oitavo cartão; recuperável pelo SHA acima.
