# CHECKPOINT — F01 CANÔNICO PROMOVIDO — 2026-10-01

Status: HOMOLOGADO / FORWARD ONLY

Baseline anterior:
- main PRE promotion: c8d263a5eccff16254b40c35cce507d1f913a6d4
- checkpoint PRE: CHECKPOINT_PRE_PROMOTION_F01_CANONICAL_20261001

F01 oficial:
- central-runtime/f01/index.html
- blob SHA: c88a0cbafd82394449d49c3ff6e54fbb4793ed42
- commit de promoção: 23403db779c3ad3e5c8434b8064ca66511b6e06a

API oficial F01:
- slug: cr-f01-canonical-runtime
- version: 1
- hash: b21e449bb43a594ce9d7781a3476039c289d1e41938400fc3b5803fd7733b40e
- contrato: F01_CANONICAL_OPS_V1
- autoridade de transição: cr-flow-runtime-v2

Contratos preservados:
- F00_F01_HANDOFF_V6
- F01_F02_HANDOFF_V2
- F02_F03_HANDOFF_V2

Proteções:
- F00 index: c5d968b92659b87a3e6276dcef29075e49311cfc
- F00/fluxos CSS: b56caeb368316f6b128a8476f6bdbbeb0b319457
- shell canônico: 2288f552ec5c6cd1471051a3bcc0d1e23e217e23
- F02: a25851e1e91a4f09c21cae1c3d45c6f248f5917d
- F09: 0978b6565c9910df88767d0525fcc69e8cc68ea2
- cr-flow-runtime-v2: version 9 / hash 868a3cb7a27519d17e5849d117385dac40d29b033d11df47cb0831be0499b3a5
- central-atendimento: version 147 / hash 3202380ccd839ade69b79c3be41127ac14958d9f30adf5255283eee5f048eb3d

Teste controlado:
- save qualification: PASS
- log contact: PASS
- save prebudget: PASS
- VISIT via cr-flow-runtime-v2: PASS
- visit-return via cr-flow-runtime-v2: PASS
- DIRECT_BUDGET F01→F02 via cr-flow-runtime-v2: PASS
- optimistic revision conflict 409: PASS
- casos sintéticos removidos: PASS

Contagens após cleanup:
- cr_flow_handoffs: 32
- cr_flow_events: 53
- F01 ativos: 4
- sintéticos remanescentes: 0

Tabelas candidatas:
- cr_f01_candidate_state_20261001: 0 registros
- cr_f01_candidate_events_20261001: 0 registros
- não migradas para produção

Rotas:
- centro-operacoes?open=f01 → F01 oficial: PASS
- central-atendimento?mode=f01 → F01 oficial: PASS
- F01 usa shell canônico para Central/F00/F02

Regra:
F01 CANÔNICO HOMOLOGADO POR ROGÉRIO.
QUALQUER EVOLUÇÃO FUTURA DEVE PARTIR DESTE ESTADO.
NÃO RESTAURAR VERSÕES ANTERIORES.
NÃO INICIAR F02 SEM NOVA AUTORIZAÇÃO DE ROGÉRIO.
