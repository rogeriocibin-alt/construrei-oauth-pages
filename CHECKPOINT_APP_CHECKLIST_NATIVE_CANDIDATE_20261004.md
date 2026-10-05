# CHECKPOINT — APP CHECKLIST NATIVE CANDIDATE 2026-10-04
Status: CANDIDATA / NÃO HOMOLOGADA / NÃO PROMOVIDA
Branch: cr-app-checklist-native-f00-f09-candidate-20261004
Baseline: cr-app-f01-ux-v11-mobile-fix-20261002 @ 3f59802bb84ba57a78ef40995bfbac64aeafe888
Objetivo: incorporar estruturalmente o patrimônio útil do Checklist no APP F00→F09 sem duplicar aplicação/banco/agenda.
Implementado nesta etapa:
- matriz canônica de reaproveitamento F00→F09;
- camada compartilhada CRChecklistNative com Core/Caso360 e contratos de capacidades;
- camada ligada aos runtimes F00, F01 canônico e F02→F09;
- entrypoint público da candidata;
- produção e Central R9 intocadas.
Importante: a camada estabelece contratos e pontos de incorporação. Capacidades que exigem backend real, migração, Auth/RBAC, Storage privado, GestãoClick, Wizy, NF ou mutações financeiras NÃO são declaradas prontas sem implementação/teste específico.
Validação: homologação humana continua F00→F09.
