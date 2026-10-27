# CONSTRU-REI — Financeiro V12 | Gate de homologação (26/10/2026)

**Situação: CANDIDATA, PR #174 em DRAFT. Produção preservada.**
Não confundir testes unitários ou snapshots textuais com conciliação bancária Cora.

## Evidência executada
- Banco Supabase: 278 extratos textuais de obras 2026; 202 BALANCED, 75 INCOMPLETE, 1 DIVERGENT (apurado em leitura anterior).
- Consulta real sobre 32 cartões / 16 códigos repetidos, sem alterações: 11 EXACT_ARCHIVED_COPY; 3 PROVISIONAL_ARCHIVED_MIRROR (290-26, 320-26, 675-26); 1 REVIEW_DISTINCT_ADDITIVE (411-26); 1 TEST_ONLY_EXCLUDED (9999-26).
- Cópias arquivadas exatas podem produzir **R$ 13.630,18** de duplicidade artificial se ambas forem somadas. É risco *derivado*, NÃO ajuste bancário comprovado. Conservar todos os cartões originais.
- SQL de auditoria executada contra Supabase e versionada em `audits/financeiro-v12-2026-duplicate-live-readonly.sql`, sem instruções de escrita. Contrato de regressão em `audits/financeiro-v12-duplicate-verified-snapshot.test.cjs` replica somente metadados resumidos do corte auditado, não IDs privados.
- 278 textos 2026 comparados entre parser anterior e candidato: **274 inalterados / 4 correções intencionais**: 627-26 CG +R$32,58; 649-26 CG +R$40,71; 655-26 CG +R$71,57; 727-26 rateio Éder -R$150,00 por apoio em custos. Essa evidência NÃO valida Cora.
- 145/145 testes Node aprovados no notebook conectado. CI da cabeça da PR: Central Canonical Guard e Change Trace passaram.

## Restrições objetivas para homologar
1. **666-26, setembro:** bruto R$4.188,88 - custos declarados R$3.571,59 = lucro aritmético R$617,29, mas cartão declara lucro R$547,29. Diferença R$70,00; rateios do cartão se baseiam no lucro declarado. Conferir documento primário antes de corrigir.
2. Snapshots Jan–Set 2026 marcados `DECLARED_UNRECONCILED`; fevereiro tem diferença de R$0,10 entre lucro declarado e calculado no resumo mensal. Out–Dez ainda `OPEN_UNCONFIRMED`.
3. Tabela de envio de períodos V12: **0 fechamentos reais** até a leitura de 26/10. Anotações somente-informativas Cora: **5**; não são despesas nem prova de envio Trello.
4. Ambiente de visualização da candidata mostra alerta **“Falha ao atualizar dados. A interface preserva o último estado carregado”**; portanto o dado exibido não deve ser presumido como atualizado.
5. Testes autenticados, gravação idempotente e recuperação após falha parcial com o Trello real, validação do saldo Cora oficial, 2024/2025 e homologação de uso notebook + celular ainda sem prova nesta entrega.
6. O código de deduplicação está no ramo candidato em modo *read-only*; a consulta SQL não está ligada aos cálculos da tela de produção.

## Critério de saída
Resolver divergências com fonte documental, rodar conciliação cruzada e prova E2E (incluindo falha/retomada sem duplicação), validar Cora e Trello contra documentos primários, depois publicar mediante auditoria com checkpoint/rollback. **Não dar aceite 100% nem fazer merge automático da PR #174** antes disso.

Referências: PR #174; commits 7ab0132, 33cc622, 770a094, cb27284; consulta Supabase apenas leitura de 26/10/2026.
