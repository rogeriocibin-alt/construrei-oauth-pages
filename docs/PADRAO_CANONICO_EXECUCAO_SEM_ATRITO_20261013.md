# Padrão canônico — execução segura sem atrito
Data: 2026-10-13. Aprovado verbalmente pelo gestor da CONSTRU-REI.

## Princípio
Segurança rigorosa nos bastidores; simplicidade para o gestor. A complexidade técnica e a obtenção das evidências são responsabilidades dos agentes; decisões de negócio, autorizações materiais e homologação são do gestor humano. Não equiparar documentação a automação executável.

## Rotina obrigatória por melhoria
1. Identificar componente, versão homologada, fonte de verdade, dependências e responsável lógico; aproveitar checkpoints existentes, sem pedir informações já fornecidas.
2. Classificar risco baixo / médio / alto. Baixo: aparência/UX sem escrita operacional; médio: cálculos, fluxos, integrações; alto: credenciais, permissões, banco, migração, infraestrutura. Reclassificar se houver risco a dados.
3. Registrar base, escopo mínimo, critérios de aceite, riscos e rollback antes de modificar.
4. Implementar candidata isolada (sem afetar URLs, integrações e código homologado); testar sintaxe, casos de borda, regressão e quaisquer chamadas com escrita usando mocks/fixtures.
5. Verificar que a publicação realmente entrega a candidata (resposta HTTP e conteúdo/versão no caminho utilizado; não confundir commit com deploy). Se a verificação externa falhar, registrar falha, não dizer que publicou/testou visualmente.
6. Entregar em uma única comunicação: link de candidata confirmado, localização da alteração, roteiro curto de teste, riscos, o que foi preservado e status real. Não solicitar que o gestor descubra o link.
7. Após homologação explícita, promover só o delta aprovado com checkpoint e rollback; comprovar arquivo final e, quando acessível, comportamento do link oficial.
8. Registrar decisão, evidências e pendência residual no Gestor mestre sem abrir duplicatas; congelar funcionalidade homologada conforme orientação. Não declarar proteção técnica de branch sem comprová-la.

## Controles não negociáveis
Sem lançamentos reais em testes, sem atalhos em Auth/RLS/RBAC ou exposição de credenciais, sem alterações de produção antecipadas, sem migrações ou custos novos sem autorização. Falha de CI, falta de link verificável ou falta de prova de restauração não viram PASS. Exceções são escaladas apenas quando essenciais. Independência de notebook como regra: validações devem funcionar por celular e navegador, sem exigir dispositivo específico.

## Critérios objetivos de melhoria
Medir solicitações repetidas por entrega; % de candidatas entregues com URL realmente testada; taxa de testes regressivos; tempo entre pedido e candidata; rollbacks; incidentes; passos exigidos do gestor. Objetivo: uma solicitação por melhoria e uma única homologação, salvo bloqueio real.

## Implementação progressiva (não concluída com este documento)
A. Criar gate automático para link publicado e versão verificável, sem duplicar CI existente.
B. Templates/checklists executáveis por nível de risco, incorporados aos agentes.
C. Checkpoint e relatório de entrega padronizados no Gestor mestre, sem duplicação.
D. Validar este padrão em uma melhoria de baixo risco real, auditando evidência do fluxo completo.

## Escopo desta formalização
Somente documentação; zero alteração em produção, APIs, banco, Pages, Trello, CI ou custos. O padrão está aprovado como processo; a aplicação automatizada nos agentes ainda depende das etapas A–D.
