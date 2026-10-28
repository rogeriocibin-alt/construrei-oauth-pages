# Financeiro V12 — correção de validação manual na candidata canônica

**Data:** 27/10/2026 (Brasil). **Ambiente:** apenas a página `preview/dashboard-financeiro-v12-oficial-com-auditoria-20261027/index.html`, baseada na V12 homologada e na PR #202.

## Relato do usuário
Captura Android do lançamento manual com **MISSING_FINANCIAL_DETAILS** ao tentar o passo 1 — validar/pré-visualizar. A captura mostrava os campos **Favorecido / origem**, **Descrição / observação** e **Referência bancária** em branco. A tela antiga repassava um código técnico sem identificar o campo obrigatório.

## Causa comprovada
Edge Function efetivamente ativa `cr-finance-v12-safe-trello-candidate-20261021` (versão 3) contém a validação:
```ts
if(!c || !category || (!description && !reference && !counterparty))
 throw Error("MISSING_FINANCIAL_DETAILS");
```
Ou seja, requer valor positivo, categoria e ao menos um entre descrição/favorecido/referência. Não houve prova de indisponibilidade do Trello; tratar como problema de orientação/validação e não como perda de lançamentos. A função também exige obra 2024–2026, data e ID válido.

## Correções, sem mudar a rotina de escrita
- Mensagem no formulário explica **obra, data, valor positivo, categoria** e identificação do lançamento; favorecido/descrição/referência não são todos obrigatórios individualmente, mas pelo menos um deles é.
- Antes da chamada remota, checa formato da obra, data calendário, valor e categoria; destaca campos inválidos com `aria-invalid` e coloca foco no primeiro problema; nenhum POST de prévia é disparado com campos faltantes.
- Traduz `MISSING_FINANCIAL_DETAILS`, `INVALID_DATE`, `INVALID_CASE_2024_2026`, `INVALID_OPERATION_ID` sem esconder mensagens de outras falhas.
- Mantém segurança existente: passo 1 prévia, passo 2 lançamento Trello apenas quando operador aciona, fingerprint/ID idempotente no backend, bloqueio após mudança de dados, estado de consulta, fechar obra independente, limpar formulário.
- `manualCheckStatus()` agora captura falha de construção do payload no bloco `try`, evitando erro JavaScript sem orientação.
- Distingue explicitamente registro real Trello de **anotação somente informativa no Extrato Cora**, que não duplica custos de obras.

## Evidências de teste
- **9/9 testes Node PASS**, validam compilação de scripts, preservação de módulos e controle dos campos.
- Chrome/Puppeteer autorizado (390×844): dados incompletos = 0 requisições e botão de lançamento desabilitado, com mensagem específica; dados válidos de **teste simulado**, obra 579-26, R$ 100,00, favorecido fictício = passo 1 prévia mock habilita passo 2; edição após prévia bloqueia passo 2; Limpar zera ID visual e bloqueia; 0 erros JS, 0 operações bancárias/Trello reais, sem overflow horizontal.
- O backend foi **lido** para confirmar contrato real; não foram usados login real nem quaisquer ações de commit, baixa Cora, CG, Trello ou fechamento real.

## Limites e acompanhamento
- Um teste mock de prévia não constitui homologação E2E com sessão de diretor. Testar uma prévia real autenticada, sem commit, antes de declarar confiabilidade total.
- Se o erro aparecer com campos completos na candidata publicada, examinar no momento os campos, o código HTTP e a resposta do backend antes de repetir. Nunca efetuar reenvio de commit sem consultar registro e cartão Trello.
- As demais pendências de auditoria, conciliação Cora e fechamento PR #174 continuam separadas.

**Produção** `production/dashboard-financeiro-v12-operacoes-homologada-20261023/index.html` intocada; a candidata preserva todos os blocos de resultados, equipe, histórico, Cora, auditoria, Capital de Giro e acertos. Reverter esta PR restaura apenas o HTML da candidata.
