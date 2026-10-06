# CONSTRU-REI — Identidade Humana Contextual V2

**Data:** 06/10/2026  
**Status da candidata:** pronta para promoção canônica  
**Branch:** `cr-human-identity-context-v2-20261006`

## Regra canônica

Avatar não é decoração. Uma pessoa real só é representada quando existe responsabilidade humana contextual. Quando houver representação, usar **retrato + nome + função**. Superfícies puramente técnicas não recebem avatares.

## Aplicação

| Superfície | Regra |
|---|---|
| Central de Links | Sem avatares. Lista técnica de acessos. |
| Central CONSTRU-REI | Topo com logo do APP; sino de agenda/notificações; agenda com miniavatares dinâmicos dos participantes reais. |
| Gestor do Projeto | Sem cluster humano no topo/cockpit. Identidade humana apenas em contextos de pessoa e em Agentes & Automações. |
| APP CONSTRU-REI | Quatro módulos com avatar do responsável: Gabrielly, Fabrício, Éder e Rogério. |
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
| APP • Pendências | Rogério |
| Pendências Wizy FLOW | Éder |
| Pendências Éder Agora | Éder |
| Checklist Operacional | Fabrício na camada canônica interna; sem forçar avatar no app externo Vercel. |
| SST | Sem avatar; base normativa/técnica. |
| Academy | Rogério + Éder + Gabrielly + Fabrício. |
| Apresentação Institucional | Manter os quatro. |
| Google Meet • Central | Manter os quatro. |
| Central OS | Atalho desativado. |
| Documentação Viva | Retirada da Central/Links; direcionada ao Gestor do Projeto. |
| Rogério Diretor/Master | Atalho direto desativado; lógica de perfil preservada para autenticação futura. |
| Éder Admin Técnico | Atalho direto desativado; lógica de perfil preservada para autenticação futura. |

## Controles antirregressão

1. `assets/team/team-registry.json` é a fonte única de responsabilidades humanas.
2. F00–F09 não usam mais o cluster genérico de quatro pessoas.
3. A Central de Links não executa script de avatar.
4. O Gestor não injeta mais os quatro retratos no topo.
5. A Central usa `human-identity-v7.js/css`, que mantém a Agenda dinâmica e converte o topo para logo + notificações.
6. Perfis de Rogério e Éder continuam modelados internamente para a futura camada de autenticação, mas não aparecem como atalhos atuais.
7. O Checklist externo não recebe alteração visual forçada enquanto a redistribuição tecnológica pelos fluxos não estiver validada.

## Escopo de validação

- JSON do registro canônico: parse válido.
- JavaScript compartilhado, Gestor e Central V7: parse válido.
- APP e F00–F09: cache/versionamento atualizado para a regra contextual V2.
- Central de Links: avatares e atalhos obsoletos removidos.
- Central: perfil fixo de Rogério removido do topo; logo APP preservada; sino de agenda implementado.
