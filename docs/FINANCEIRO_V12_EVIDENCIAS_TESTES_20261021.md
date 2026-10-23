# V12 — Evidência de testes e bloqueio de homologação
Data 21/10/2026. CR Assertivo / Financeiro REI. PR #142 em draft. Produção inalterada.
## Testes executados
Node.js 22.16.0 em ambiente isolado. Os módulos de funções financeiras e suas 13 asserções foram reproduzidos a partir do código da branch e executados localmente. Resultado: PASS (13 asserções).
Abrangência: 49800 centavos de lucro com rateio 20/28/28/14/10; soma 1 centavo; soma 184419 centavos; lucro 120000-70200; margem nula com receita zero; conversão 1.23; bloqueio de recalculo histórico; lucro negativo rejeitado; chave idempotente por origem+sourceId; id ausente; três estados de acerto. Estes são testes de unidade, não E2E.
## Fonte Cora e limitação técnica
Consulta read-only a information_schema.tables no Supabase yspuaamokjbrosytqjpg não encontrou tabelas com nomes contendo cora, bank, statement, transaction ou ledger em schemas usuais. Isso NÃO prova ausência de dados: podem residir em tabelas com outros nomes, storage, cache gerenciado ou funções externas. O checkpoint da V11 documenta 7656 movimentos e 46 competências em 20/10, ainda não validados neste teste.
## Estado de liberação
Visual isolado com seis ambientes existe. Não há integração funcional bancária/operacional homologada na V12. PR não deve ser merged e não se deve publicar sem auditoria numérica, E2E de escrita isolado, autorização humana e CI.
## Questões pendentes com evidência
1. Identificar e aferir store/caches e sincronização efetiva do Cora.
2. Comparar todos os acertos Trello desde 2024, incluindo categorias histórico/pago/devido.
3. Resolver 3 títulos de capital de giro divergentes do card QRs2VwFb, com lastro de origem.
4. Desenvolver interface funcional, testar notebook/celular, e aplicar gate Financeiro REI.
Este checkpoint substitui afirmações anteriores de 'testes não executados' somente para testes UNITÁRIOS. Não alegar conclusão do dashboard ou integridade financeira.
