# CONSTRU-REI — ESTADO MESTRE DA CENTRAL

> Fonte de verdade para retomada entre conversas. Não depender do histórico do chat para identificar a candidata atual.

## Estado atual — 2026-10-04

- Projeto: Central CONSTRU-REI
- Repositório: `rogeriocibin-alt/construrei-oauth-pages`
- Branch fonte da candidata: `cr-central-refinement-batch-20261004`
- HEAD funcional da branch fonte: `e892debb21414c09376f11cf6cf46521d698d85c`
- Publicação GitHub Pages da candidata: `ceb2497f77ced35b4853e26609436954bbd6d9f5`
- Arquivo de navegação persistente publicado em: `f5f698e5a09b513711fb86b40e16cc95fd0563f4`
- Base oficial protegida: `ccc8e8a4cc97df5f7646813178287106657df9b1`
- Endpoint oficial: **NÃO ALTERADO**
- Edge candidata: `cr-central-refinement-candidate-20261004` (redirect isolado para a candidata no GitHub Pages)

## Link da última candidata

https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-central-refinement-candidate-20261004/

## Rodada ativa — Navegação e estabilidade R2

1. Shell da Central passa a permanecer aberto durante a navegação interna.
2. Regra **Voltar • Início • Menu** tratada como navegação persistente.
3. APP CONSTRU-REI, Dashboard Financeiro V4 e Esteira F00–F09 abrem dentro do workspace da Central quando acionados pela Central, evitando `location.assign` e perda de contexto.
4. Rotas Diretoria/Rogério e Técnico/Éder são tratadas localmente na candidata, evitando o redirecionamento legado que quebrava a experiência.
5. Saúde e Desenvolvimento passa a usar consultas com timeout e modo fail-safe: falha de API não pode congelar a página.
6. Links internos CONSTRU-REI são interceptados para permanecer na shell; nova aba fica como contingência explícita.
7. Central oficial permanece congelada até validação humana em celular + notebook.

## Regra de continuidade obrigatória

Sempre que houver nova candidata, homologação, promoção, rollback ou checkpoint relevante:

1. Atualizar este arquivo no mesmo ciclo.
2. Registrar link público funcional, branch, commits funcionais/publicados, checkpoint e estado da oficial.
3. Nunca usar somente o histórico do chat como fonte de verdade.
4. Ao retomar o projeto, consultar este arquivo primeiro.
5. Não promover para a Central oficial sem gate de validação humana em notebook + celular.
6. Manter a versão oficial protegida enquanto a candidata estiver em validação.

## Última atualização

2026-10-04 — rodada R2 de navegabilidade plena e estabilidade da Central candidata.
