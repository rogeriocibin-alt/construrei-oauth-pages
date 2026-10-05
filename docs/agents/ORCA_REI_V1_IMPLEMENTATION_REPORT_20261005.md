# ORÇA-REI V1 — Relatório de Implementação Técnica

Data: 2026-10-05
Status: **IMPLEMENTADO EM CANDIDATA / AGUARDA HOMOLOGAÇÃO HUMANA**

## Backend
- Edge Function: `cr-flow-runtime-v2`
- Versão: **v12 ACTIVE**
- Build: `CR-FLOW-RUNTIME-V2-ORCA-REI-V1-CANDIDATE-20261005`
- SHA Supabase: `854bd62e1117e64435ed035c754c6e89a40105a5e1a8065a1dac4ec0dd411eaa`
- Snapshot: `snapshots/edge-functions/cr-flow-runtime-v2/v12/index.ts`

## Frontend candidato
- `preview/f02-orca-rei-v1-candidate-20261005/`
- Build: `CR-F02-ORCA-REI-V1-CANDIDATE-20261005`
- Publicação verificada com HTTP 200.

## Compatibilidade preservada
- F01 não alterado.
- F03 não alterado.
- Contrato atual `budget-save` permanece compatível com o F02 anterior.
- Novas regras do ORÇA-REI só são aplicadas quando `orca_rei_v1=true`.
- `budget-release` mantém o fluxo existente e adiciona apenas o gate ORÇA-REI quando o orçamento foi salvo pelo agente.

## Novas capacidades
- API `budget-audit` determinística.
- Separação venda × custo.
- Encargos e margem alvo parametrizados.
- Cálculo de custo direto, custo máximo, lucro, margem e preço mínimo.
- Confiança 0–100.
- Risco BAIXO/MÉDIO/ALTO/CRÍTICO.
- Decisão MANTER/AUMENTAR/COTAR/VISTORIAR/REESTRUTURAR CUSTO.
- Gate humano obrigatório.
- Override comercial explícito para exceções de margem.
- Padrão GestãoClick no candidato.
- Análise interna separada do texto cliente.

## Teste 76626

### Cenário preliminar — custo R$ 1.870
- Venda: R$ 3.683,00
- Custo direto: R$ 1.870,00
- Custo máximo para 18,5% + 30%: R$ 1.896,745
- Lucro projetado: R$ 1.131,645
- Margem: 30,73%
- Confiança: 20
- Risco: CRÍTICO
- Decisão: VISTORIAR
- Gate: BLOQUEADO

### Cenário confirmado — custo R$ 1.870
- Margem: 30,73%
- Confiança: 100
- Risco: BAIXO
- Decisão: MANTER
- Gate: LIBERADO

### Cenário confirmado — custo R$ 2.230
- Preço mínimo: R$ 4.330,10
- Lucro projetado: R$ 771,645
- Margem: 20,95%
- Confiança: 100
- Risco: ALTO
- Decisão: AUMENTAR
- Gate: BLOQUEADO

### Mesmo cenário com override comercial explícito
- Gate: LIBERADO
- Decisão continua AUMENTAR e o risco continua ALTO; o override não mascara a análise.

## Próximo gate
Validação humana de Rogério na candidata. Somente após aprovação promover para o F02 oficial e registrar checkpoint/homologação.