# Banco vivo de implementação — Central CONSTRU-REI

Fonte única: [central-implementation-bank.json](central-implementation-bank.json).
Criado em 02/10/2026 por solicitação de Rogério. Faz parte do projeto.

## Uso obrigatório nas próximas implementações
1. Ler o banco e as políticas vigentes antes de iniciar uma melhoria.
2. Usar o ID existente; criar ID novo apenas para demanda distinta.
3. Atualizar status, responsável quando conhecido, data e evidências ao mudar de etapa.
4. Acrescentar evento em history para cada mudança: ID único, data com fuso, item_id, descrição e evidências.
5. Antes de encerrar uma entrega, registrar commit, resultado da validação, checkpoint e homologação quando aplicáveis.
6. Não apagar itens concluídos nem eventos. Correções geram novos eventos. Git preserva o histórico de versões.
7. Não confundir aprovação de escopo com implementação ou homologação.
8. Consultar sempre a fonte atual no projeto ao retomar a conversa; memória não substitui esse banco.

## Separação de alçadas
O Dashboard Executivo acompanha informações e exceções do negócio.
A automação de preenchimento do GestãoClick pertence ao desenvolvimento operacional.
Desenvolvimento / Saúde Técnica deve apresentar o banco de melhorias e os sinais técnicos, sem misturá-los com tarefas operacionais.

## Estado real
O cadastro inicial e o histórico versionado já existem no repositório.
A exibição dentro da Central e a sincronização automática com entregas ainda são pendências CR-IMP-009 e CR-IMP-010.
Não existe neste momento um serviço automático criado por estes arquivos.
Atualizações são feitas junto a cada implementação; o histórico Git registra automaticamente alterações efetivamente salvas.
A integração futura deve ler este cadastro, preservar os IDs e acrescentar eventos, sem criar outro banco concorrente.

## Proteção
Esta inclusão é documental e aditiva. Não altera HOME, rotas, cores, fluxos, runtime ou versão homologada.
Nenhum estado histórico foi marcado como concluído sem verificação.
