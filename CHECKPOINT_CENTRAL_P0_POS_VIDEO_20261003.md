# CHECKPOINT CENTRAL P0 PÓS-VÍDEO — 03/10/2026

Base: 5dd0ea808e911cdbb4f49178d1b87a6cec75bf74
Branch: cr-central-p0-pos-video-navigation-identity-performance-20261003
Canonical/endpoint oficial alterados: NÃO.

## Evidências
- Causa do hero: central.js reconstruía #dashboard após o HTML inicial; CSS aplicado ao hero antigo não atingia o shell efetivo.
- Correção: identidade aplicada no shell runtime real.
- Logo: reutiliza o data:image/webp já presente na marca do shell, agora inserido diretamente no hero runtime.
- Navegação: 1 CR_CANONICAL_ROUTE_REGISTRY; 0 location.assign.
- Contrato: CR_CENTRAL_RETURN_URL enviado a APP e F00-F09 como parâmetro return.
- Limitação conhecida: o consumo de return pelo Edge Function central-atendimento não está no repositório; deve ser validado no runtime antes de declarar PASS completo.
- Performance: FAST e AGENDA deixaram de usar Promise.all bloqueante e atualizam independentemente via Promise.allSettled.
- FULL/GestãoClick continua em segundo plano.

## Gate
CANDIDATA P0 PÓS-VÍDEO PRONTA PARA VALIDAÇÃO DO ROGÉRIO.
NÃO PROMOVER.
