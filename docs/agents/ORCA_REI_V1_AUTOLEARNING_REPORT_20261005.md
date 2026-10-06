# ORÇA-REI V1 — Relatório do Aprendizado Automático

Data: 2026-10-05  
Status: **IMPLEMENTADO EM CANDIDATA / NÃO PROMOVIDO / AGUARDA HOMOLOGAÇÃO HUMANA**

## Objetivo

Eliminar a necessidade de republicar ou atualizar manualmente o ORÇA-REI a cada novo orçamento validado. A solução separa **software versionado** de **conhecimento operacional vivo**.

## Regra arquitetural

O ORÇA-REI **aprende dados e padrões; não se auto-programa**.

Regras canônicas, fórmulas, gates, arquitetura e segurança continuam versionadas e só mudam com governança humana.

## Banco de aprendizado

Migration: `orca_rei_learning_v1` + correção `orca_rei_learning_v1_rpc_fix`.

Estruturas:
- `public.cr_orca_learning_settings_v1`
- `public.cr_orca_learning_events_v1`
- `public.cr_orca_learning_patterns_v1`
- RPC server-side `public.cr_orca_record_learning_item_v1`

Segurança:
- RLS ativado;
- acesso direto de `anon` e `authenticated` revogado;
- gravação/leitura operacional via service role do Edge;
- RPC de aprendizagem sem execução pública.

## Gatilhos automáticos

### F02 → F03

Quando um orçamento ORÇA-REI, já revisado pelo humano, é efetivamente liberado do F02 para o F03:
- serviços e produtos finais são registrados;
- os valores unitários passam a compor o histórico interno revisado;
- evento idempotente evita reaprender a mesma liberação.

### F03 aprovado

Quando a proposta é aprovada:
- os mesmos itens são registrados como histórico **aprovado pelo cliente**;
- essa camada recebe peso superior ao mero histórico revisado.

## Uso do aprendizado

Ao processar nova Entrada Inteligente, o runtime consulta padrões equivalentes já validados e devolve, quando existir:
- número de amostras revisadas;
- número de amostras aprovadas pelo cliente;
- média unitária revisada;
- média unitária aprovada;
- mínimo/máximo aprovado;
- último caso relacionado;
- confiança.

A referência é consultiva: **não substitui automaticamente o preço do caso atual**.

## Runtime candidato

Edge Function: `cr-flow-runtime-v2-orca-intake-candidate`  
Versão: **v6 ACTIVE**  
Build: `CR-FLOW-RUNTIME-V2-ORCA-REI-V1-INTAKE-CANDIDATE-R6-AUTOLEARNING-20261005`  
SHA Supabase: `ed8d17614b2e24fcf5a1596717deec55fc46349909f3fe096d9f553bf24ea8dd`
Snapshot Edge: `snapshots/edge-functions/cr-flow-runtime-v2-orca-intake-candidate/v6/index.ts`

## Frontend candidato

`preview/f02-orca-rei-v1-r6-autolearning-20261005/`

Build: `CR-F02-ORCA-REI-V1-R6-AUTOLEARNING-PREMIUM-20261005`

A tela informa:
- **Aprendizado automático • ATIVO**;
- conhecimento vivo sem republicação;
- referências históricas quando houver correspondência.

## O que NÃO é aprendido automaticamente

- rascunho;
- texto bruto;
- IA terceira;
- hipótese;
- valor A CONFERIR;
- divergência não resolvida;
- orçamento recusado tratado como preço aceito;
- mudança de regra canônica.

## Teste técnico executado

A RPC de aprendizagem foi exercitada dentro de transação com rollback:
- evento criado na transação;
- padrão agregado criado na transação;
- rollback confirmado;
- nenhuma amostra fictícia permaneceu no banco.

## Próximo gate

1. publicar/abrir a candidata R5;
2. validar visualmente em celular e notebook;
3. testar caso 766-26;
4. liberar um orçamento de teste F02 → F03 e conferir aprendizado automático;
5. aprovar no F03 e conferir incremento da camada aprovada;
6. repetir item equivalente e conferir referência histórica sem sobrescrita;
7. somente depois promover/congelar o F02 oficial.
