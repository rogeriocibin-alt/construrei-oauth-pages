# CONSTRU-REI — Identidade Humana Canônica V1 — 2026-10-06

## Estado
- Escopo: somente superfícies canônicas vigentes; versões históricas permanecem congeladas.
- Fonte única: `assets/team/team-registry.json`.
- Assets confirmados: `rogerio.webp`, `eder.webp`, `gabrielly.webp`, `fabricio.webp` e respectivos `*-face.webp`.
- Regra: pessoa real representada = retrato + nome + função. Agente digital mantém avatar próprio e separado.
- F00–F09: cluster compacto da equipe inteira, sem atribuir falsamente um único dono.
- Agenda: miniavatares dinâmicos conforme responsáveis detectados no compromisso.

## Componentes
- Compartilhado APP/F00–F09: `assets/team/human-identity-canon-v1.js/css`.
- Central: `human-identity-v6.js/css` sem MutationObserver global.
- Gestor: `human-context-v1.js/css` + Team Identity V2 existente.
- Central de Links: lê o registro canônico e decora os links humanos.
- Apresentação e Sala da Equipe: aliases corrigidos para as superfícies que já contêm os quatro retratos.

## Cobertura dos links canônicos que necessitam identidade humana

| Link | Avatar(es) | Onde aparece | Evidência |
|---|---|---|---|
| `/links-oficiais/` | Rogério, Éder, Gabrielly, Fabrício | hero + cards humanos | registry + `cr-link-human-avatars` |
| `/central/` | Rogério + responsáveis dinâmicos | header, Agenda e áreas por responsabilidade | Human Identity V6 |
| `/gestor-projeto/` | equipe completa; Rogério/Éder por contexto | topbar, Agent Hub, `?area=admin/technical` | Team Identity V2 + Human Context V1 |
| `/app-construrei/` | equipe completa | cluster canônico do APP | shared Human Identity Canon V1 |
| `/f00-captura-inteligente/` | equipe completa | cluster canônico | shared Human Identity Canon V1 |
| `/f01-atendimento/` | equipe completa | cluster canônico | shared Human Identity Canon V1 |
| `/f02-orcamentos/` | equipe completa | cluster canônico | shared Human Identity Canon V1 |
| `/f03-propostas-os/` | equipe completa | cluster canônico | shared Human Identity Canon V1 |
| `/f04-agenda/` | equipe completa + responsáveis dinâmicos na Agenda da Central | cluster + miniavatares por compromisso | shared component + Human Identity V6 |
| `/f05-materiais-terceiros/` | equipe completa | cluster canônico | shared Human Identity Canon V1 |
| `/f06-campo-evidencias/` | equipe completa | cluster canônico | shared Human Identity Canon V1 |
| `/f07-qualidade-documentos/` | equipe completa | cluster canônico | shared Human Identity Canon V1 |
| `/f08-financeiro-cobranca/` | equipe completa | cluster canônico | shared Human Identity Canon V1 |
| `/f09-pos-venda-garantia/` | equipe completa | cluster canônico | shared Human Identity Canon V1 |
| `/pendencias-app/` | Gabrielly | card do link + área Central | registry + V6 `pendapp` |
| `/pendencias-wizy-flow/` | Éder | card do link + área Central | registry + V6 `wizy` |
| `/pendencias-eder-agora/` | Éder | card do link + área Central | registry + V6 `eder` |
| `/central-os/` | Éder + Fabrício | card do link + área Central | registry + V6 `os` |
| `/documentacao/` | Rogério + Éder | card do link + área Central | registry + V6 `docs` |
| `/academy/` | Éder + Gabrielly | card do link + área Central | registry + V6 `academy` |
| `/apresentacao/` | equipe completa | slide “Quem conduz a operação” | alias direto para `presentation/` |
| `/google-meet-central/` | equipe completa | Sala da Equipe | alias direto para `call/` |
| `/diretoria-master/` | Rogério | Gestor com `area=admin` | Human Context V1 |
| `/admin-tecnico/` | Éder | Gestor com `area=technical` | Human Context V1 |
| `/sst/` | Fabrício | card do link + área Central | registry + V6 `sst` |
| `/checklist-operacional/` | Fabrício no link canônico | Central de Links; app externo preservado | registry; destino externo não representa pessoa |

## Verificação estática da candidata
- Registro canônico: 4 pessoas: PASS.
- Central carregando V6 JS/CSS: PASS.
- Mapa de responsabilidade Central: PASS.
- Agenda dinâmica: PASS.
- Gestor carregando Human Context V1: PASS.
- Rotas `admin → Rogério` e `technical → Éder`: PASS.
- APP + F00–F09 carregando componente compartilhado: 11/11 PASS.
- Apresentação: quatro retratos: PASS.
- Sala da Equipe: quatro retratos `*-face.webp`: PASS.
- Central de Links: runtime do registro + cards com avatares: PASS.
- Alias Apresentação deixa de abrir a área intermediária e vai à apresentação viva: PASS.
- Alias Google Meet deixa de cair na tela sem retratos e vai à Sala da Equipe com os quatro avatares: PASS.

## Antirregressão
1. Não reativar `team-identity-v2.js`/V3 observers globais na Central.
2. Não promover preview antiga inteira para recuperar avatares.
3. Não duplicar arquivos de retrato; novos componentes devem consumir `team-registry.json`.
4. Links puramente técnicos ou redirecionamentos secos não precisam renderizar avatar; a superfície humana de destino deve renderizá-lo.
5. O Checklist externo permanece funcional e não é alterado apenas por identidade visual.
