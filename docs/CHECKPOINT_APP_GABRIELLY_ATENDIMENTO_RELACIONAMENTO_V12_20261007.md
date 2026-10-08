# CHECKPOINT — Gabrielly • Atendimento e Relacionamento V12 — 2026-10-07

Status: CANDIDATA ISOLADA / AGUARDANDO HOMOLOGAÇÃO HUMANA.

Origem preservada: `preview/app-official-candidate-20261002/index.html` em `main`, blob `5dc444a52fd703c32a9b91bc13be293c22f9eea6`.
Candidata publicada: `preview/app-gabi-atendimento-relacionamento-v12-candidate-20261007/index.html`.
Commit da candidata com hotfix de expressão regular: `0c2c556960302bf392c36a41c5f312e66083289a`.
URL esperada após GitHub Pages concluir: https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/app-gabi-atendimento-relacionamento-v12-candidate-20261007/

Escopo: APENAS evolução aditiva do módulo Atendimento e Relacionamento de Gabrielly. Identidade canônica visual mantida, F00/F01 preservados, demais fluxos, Central e produção não modificados.

Entregas nesta candidata:
1. Guia contextual das seis prioridades já definidas pela direção.
2. Sinalizador de possível emergência no texto dos chamados, com triagem humana obrigatória.
3. Correção de prioridade: atraso de 24h não é automaticamente P0.
4. Nova entrada em coleta há menos de 12h recebe prioridade P1 (limiar provisório de UX, NÃO SLA homologado).
5. Retornos aguardando há mais de 24h recebem P2, sem alegar emergência.
6. Preservação do endpoint F00/F01 e bridge de agenda preexistentes.

Observações críticas: palavras-chave não constituem diagnóstico, apenas alerta. Lógica de classificação ainda deve ser testada com casos reais, falso-positivo e falso-negativo. Não habilitar execução autônoma, notificações externas ou escrita transacional sem autenticação/gates.

Auditoria do Supabase indica RLS nas tabelas operacionais e papéis definidos no RBAC, mas isso não comprova por si só isolamento ponta a ponta. Conectores WhatsApp empresarial, GestãoClick, Trello, Calendar e Cora ainda precisam de validação operacional. O HTML atual refere-se ao serviço `cr-f00-intake-candidate-20261002` e à agenda `cr-agenda-executive-v8-candidate-20261002`; antes da homologação conferir JWT, vínculo de usuário, idempotência e retorno em erros.

Validação pendente: GitHub Pages concluir deploy, abrir candidato em notebook/celular, conferir visual, abrir um caso e testar ordenação da fila, ações de F00/F01 e agenda. Não promover, não alterar produção. Se falhar, retornar à candidata original 02/10 sem mexer na produção.
