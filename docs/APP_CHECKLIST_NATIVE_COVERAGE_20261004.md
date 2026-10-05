# RELATÓRIO DE COBERTURA — CHECKLIST NATIVE
Data: 2026-10-04
Status: CANDIDATA / NÃO HOMOLOGADA

| Fase | Reutilizado/Adaptado nesta rodada | UI | Persistência | Integração/Teste |
|---|---|---|---|---|
| F00 | captura/evidências já existentes; camada nativa conectada | existente | runtime existente | homologação pendente |
| F01 | Gabi Flow/V11 + F01 canônico já cobrem contato, pagamento, disponibilidade, coleta, pré-orçamento, histórico | existente | existente conforme runtime atual | handoff/teste pendente |
| F02 | itens/MO/material + cotações, desconto/justificativa, margem, markup, refinamento IA | ampliada | payload do budget ampliado no runtime existente | teste controlado pendente |
| F03 | proposta/decisão/OS + referências proposta PDF, OS PDF e envio/WhatsApp | ampliada | payload proposal ampliado | validar APROVADA→F04 |
| F04 | agenda + prestadores por serviço + confirmação | ampliada | flow_data/runtime v2 | teste pendente |
| F05 | materiais + tipo MO + especialidade + recebimento/uso/sobra/devolução | ampliada | flow_data/runtime v2 | teste pendente |
| F06 | execução + tarefas por serviço + horários + foto/vídeo + aceite + relatório | ampliada | flow_data/runtime v2 | storage privado real ainda é gap |
| F07 | pendência + classificação NC/retrabalho/garantia/novo escopo + ação/reinspeção | ampliada | flow_data/runtime v2 | teste pendente |
| F08 | financeiro + receitas/despesas + comprovante + divergência + parceiros/acertos + CG + fechamento + NF docs | ampliada | flow_data/runtime v2 | NF externa continua gap |
| F09 | aceite/relatório + retorno + classificação garantia/retrabalho/novo serviço | ampliada | flow_data/runtime v2 | teste pendente |

## Não declarado como pronto
Auth/RBAC final, Storage privado de evidências, GestãoClick, Wizy, emissão fiscal externa e E2E F00→F09.

## Regra
INCORPORADO ≠ TESTADO ≠ HOMOLOGADO.
