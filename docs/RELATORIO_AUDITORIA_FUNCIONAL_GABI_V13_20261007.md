# CONSTRU-REI — Evidência de auditoria V13 e bloqueio de segurança
Data 2026-10-07 — candidatas, sem alteração de produção.

## Análise e correções da interface
Candidata V13: `preview/app-gabi-atendimento-relacionamento-v13-functional-candidate-20261007/index.html`
Commit `d54ab96ebb9f969a3284eecd79610d2fea3ac89e`.

13 correções ou defesas implantadas na candidata:
- `AGUARDANDO_RESPOSTA` retorna à fila ACTIVE, mantendo o retorno visível.
- Reset dos filtros ao iniciar novo chamado.
- Cópia retorna sucesso/erro real; sem confirmação fictícia.
- Cópia de orçamento só confirma êxito após clipboard efetivo.
- ID do chamado é capturado antes da atualização.
- Resumo de agenda deixa de atestar sincronização ponta a ponta.
- Selo sincronizado depende de leitura concluída.
- Falha de API recebe mensagem explícita.
- Fila não se autodeclara vazia durante carregamento inicial.
- Expressão de emergência evita o falso positivo mais evidente: gás em manutenção preventiva.
- Identidade e CSS human-identity-canon preservados.

### Testes estáticos concluídos
Passou em 10 verificações estáticas de presença de elementos/fluxos (navegação, criação, update, reentrada na fila, gate F01, cópia, falha de leitura, identidade, upload, endpoint isolado). Sintaxe JavaScript dos dois blocos principais: PASS.
IMPORTANTE: testes estáticos e parsing não comprovam execução ponta a ponta, integração de produção ou comportamento em navegador. Não marcar homologado.

## Achado crítico (P0): autorização do endpoint
Edge Function `cr-f00-intake-candidate-20261002`:
- `verify_jwt=false` nos metadados Supabase.
- Usa cliente Supabase com chave server-side privilegiada para operações.
- Função `auth(req)` definida para conferir `x-f00-key`, porém **nenhuma chamada** à função é encontrada no código de atendimento.
- Handler define diretamente `const id={display_name:"Gabrielly / F00",role:"OPERADOR_F00"};` e executa `list/get/create/update/wait/release` a partir da rota.
- O HTML da candidata não envia credencial de identificação de operador.
Isso configura potencial de acesso não autorizado a casos/alterações se endpoint estiver público e roteável, independente da identidade visual da interface. Não realizar exploração, consultar nem gravar dados reais para provar.

### Ação de contenção e correção, antes de qualquer teste real
1. Responsável técnico deve corrigir a exigência de sessão válida e RBAC por operação no Edge Function; nunca colocar service-role no navegador.
2. Restringir CORS/origins não substitui autenticação; não tomar como prova de proteção.
3. Colocar `verify_jwt=true` onde aplicável e validar Supabase Auth + claims/roles, ou implementar outro gate equivalente validado no servidor, preservando fluxos legados autorizados.
4. Para testes fictícios, usar projeto/namespace isolado com operadores QA e nenhum cliente real.
5. Testes negativos 401 sem token, 403 perfil indevido, isolamento por registro, auditoria e idempotência.
6. Só após gates: rodar o cenário 99001-26, anotar eventos e validar em notebook e celular.

## Caso fictício
Ver `docs/QA_GABRIELLY_V13_CASO_FICTICIO_99001-26.md`.
Roteiro: imobiliária fictícia -> captura incompleta -> solicita faltantes -> espera -> resposta incremental -> F01 -> pré-orçamento sem valores -> aprovação F03 -> agenda -> encerramento.
Estado: cenário desenhado, **não executado no backend**, devido ao P0 de segurança. Nenhuma comprovação falsa.

## Decisão
Não homologar V12 ou V13; não publicar V13 como produção. Registrar bloqueio P0 no Gestor do Projeto quando o canal canônico de escrita estiver identificado e apto. Manter candidata 02/10 como referência visual e de rollback.
