# CONSTRU-REI — Auditoria de Avatares, Links e Apresentação V3

**Data:** 06/10/2026  
**Branch:** `cr-avatar-link-sync-v3-20261006`  
**Release do Gestor:** `V1.2.2 • CR-PM-V1.2.2-AVATAR-LINK-SYNC-V3-OFFICIAL-20261006`

## Problema encontrado

A inconsistência não era uma única falha visual. Havia quatro pontos de drift:

1. O Gestor do Projeto ainda mantinha vários links internos apontando diretamente para roteadores Supabase em vez dos aliases canônicos do GitHub Pages.
2. A Central possuía identidade contextual em páginas internas e na Agenda, mas o Dashboard Executivo não exibia a equipe humana; por isso a entrada da Central parecia “sem avatares”.
3. Alguns atalhos com fragmento (`#pendapp`, `#wizy`, `#eder`, `#sst`) passavam primeiro por uma Edge Function. Fragmentos de URL não são enviados ao servidor e podiam se perder antes de chegar à Central.
4. A Apresentação Viva já possuía a equipe humana, porém o conteúdo de inteligência/agentes e o rótulo no Gestor estavam atrasados em relação ao Agent Hub atual e ao Financeiro REI V1.

## Correções aplicadas

- Gestor passa a abrir Central, APP, Apresentação e F00–F09 por aliases canônicos estáveis.
- `/central/` aponta diretamente para a Central UX R1.2 oficial, mantendo chamadas `?api=` no backend Supabase.
- Central ganhou **Human Identity V8**:
  - logo do APP continua no topo;
  - sino/agenda continua funcional;
  - miniavatares da Agenda continuam dinâmicos;
  - Dashboard Executivo passa a mostrar a faixa **EQUIPE CONSTRU-REI** com Rogério, Éder, Gabrielly e Fabrício;
  - páginas contextuais continuam mostrando somente os responsáveis reais.
- Pendências APP, Wizy FLOW, Éder Agora, Academy e SST agora abrem diretamente a rota/hash correta da Central.
- Apresentação Executiva Viva:
  - mantém slide da equipe com os quatro retratos;
  - mantém dados vivos;
  - atualiza a arquitetura de agentes para BIO, CR Assertivo, Financeiro REI e ORÇA-REI;
  - mantém Rogério como autoridade Master;
  - passa a usar o alias canônico da Central.
- Gestor PWA atualizado para V1.2.2 e cache rotacionado; o endereço permanece o mesmo no celular e no notebook.
- Assets de identidade do Gestor passam a fazer parte do núcleo cacheado pelo Service Worker.

## Matriz de identidade revisada

| Superfície | Identidade esperada |
|---|---|
| Central / Dashboard Executivo | Equipe: Rogério + Éder + Gabrielly + Fabrício |
| Agenda | Participantes reais de cada compromisso |
| APP / módulo Atendimento | Gabrielly |
| APP / módulos | Avatar do responsável em cada módulo |
| F00 | Gabrielly |
| F01 | Gabrielly |
| F02 | Éder + Rogério |
| F03 | Éder + Rogério |
| F04 | Gabrielly + Fabrício |
| F05 | Fabrício + Éder |
| F06 | Fabrício |
| F07 | Éder + Fabrício |
| F08 | Rogério |
| F09 | Gabrielly + Éder |
| APP Pendências | Rogério |
| Wizy FLOW | Éder |
| Éder Agora | Éder |
| Academy | Os quatro |
| Sala da Equipe | Os quatro |
| Apresentação Viva | Os quatro |
| SST | Sem avatar decorativo |
| Gestor do Projeto | Sem cluster humano decorativo; agentes digitais ficam no Agent Hub |

## Validação automatizada

**33/33 verificações PASS** divididas em três lotes:

- 14/14: release PWA, aliases principais, sintaxe JS, Central V8, Agenda e Apresentação.
- 10/10: rotas contextuais + F00–F04.
- 9/9: F05–F09 + APP + Central alias + Apresentação alias + Meet.

## Regra antirregressão

O Gestor deve referenciar **aliases estáveis** e não caminhos versionados/roteadores intermediários para navegação humana. O alias é responsável por apontar para a versão oficial vigente. Identidade humana deve ser contextual, exceto no Dashboard Executivo, Sala da Equipe, Academy e Apresentação Institucional/Viva, onde a equipe completa é parte explícita do contexto.
