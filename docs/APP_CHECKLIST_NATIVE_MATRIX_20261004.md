# MATRIZ CANÔNICA DE INCORPORAÇÃO — CHECKLIST → APP F00-F09
Data: 2026-10-04
Status: CANDIDATA / NÃO HOMOLOGADA
Baseline APP: cr-app-f01-ux-v11-mobile-fix-20261002 @ 3f59802bb84ba57a78ef40995bfbac64aeafe888
Proteção: production/* e Central R9 NÃO ALTERADOS.

| Fase | Capacidades do Checklist | Decisão | Destino / regra |
|---|---|---|---|
| F00 | anexos, evidências, identificação, problema/serviço | ADAPTAR | captura leve; não transformar em checklist pesado |
| F01 | cliente, endereço, coleta, evidências, disponibilidade, responsáveis, pré-orçamento | REUTILIZAR+ADAPTAR | Gabi Flow action-first + Caso 360; preservar V11 |
| F02 | PDF orçamento, extração, itens, MO, descontos, valores, IA | REUTILIZAR+ADAPTAR | SPEC-005/F02 v3; snapshot/versionamento; sem duplicar motor |
| F03 | proposta, OS, PDF, WhatsApp, cliente/serviços/materiais | REUTILIZAR+ADAPTAR | CR-05; patch F03→F04 somente após validar runtime |
| F04 | agenda, horários, múltiplos responsáveis/prestadores, serviços por prestador | ADAPTAR | Agenda Core é autoridade; proibida segunda agenda |
| F05 | materiais, terceiros, tipo MO, especialidade, troca prestador | REUTILIZAR+ADAPTAR | histórico de recebimento/uso/sobra/devolução |
| F06 | checklist execução, tarefas, equipe, datas, observações, fotos/vídeos, assinatura, relatório | REUTILIZAR+ADAPTAR | evidência privada/auditável; storage local não é autoridade |
| F07 | pendências, alertas, tarefas/resultados, retorno | REUTILIZAR+ADAPTAR | separar NC/retrabalho/garantia/novo escopo |
| F08 | receita/despesa, parcelas, bancos, comprovantes, divergência, parceiros, CG, fechamento, NF | REUTILIZAR+ADAPTAR | regras financeiras canônicas; obra liquidada não reabre |
| F09 | assinatura/aceite, relatório final, retorno, cancelamento, garantia/histórico | REUTILIZAR+ADAPTAR | garantia ≠ retrabalho ≠ novo escopo |

## Core compartilhado obrigatório
Caso 360, cliente, imóvel, serviço/item, evidência/anexo, responsável/prestador, agenda, material, tarefa, documento, pagamento, evento, aprovação e garantia.

## Regra de execução
INCORPORADO ≠ TESTADO ≠ HOMOLOGADO. Esta candidata prepara a estrutura. Homologação permanece por gates F00→F09.
