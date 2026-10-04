# CONSTRU-REI — ESTADO MESTRE DA CENTRAL

> Fonte de verdade para retomada entre conversas. Não depender do histórico do chat para identificar a candidata atual.

## Estado atual — 2026-10-04

- Projeto: Central CONSTRU-REI
- Repositório: `rogeriocibin-alt/construrei-oauth-pages`
- Candidata ativa: **Agenda Inteligente / Textos Operacionais R1**
- Branch fonte: `cr-central-agenda-smarttext-candidate-20261004`
- Commit funcional da branch candidata: `941d161affffdad4f1467f2e8062383aa0bf6115`
- Publicação GitHub Pages correspondente: `bd234a2ed5f39e059105642d4d9cc9db0d2283f1`
- Checkpoint da candidata: `CHECKPOINT_CENTRAL_AGENDA_SMARTTEXT_20261004_R2`
- Edge da Central candidata: `cr-central-agenda-smarttext-candidate-20261004`
- API de geração de texto: `cr-agenda-smart-text-candidate-20261004` v2
- Modelo canônico armazenado em: `docs/AGENDA_TEXT_TEMPLATES_CONSTRUREI_20261004.md`
- Central oficial: **NÃO ALTERADA**
- Base oficial protegida: `ccc8e8a4cc97df5f7646813178287106657df9b1`

## Link da última candidata

https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/cr-central-agenda-smarttext-candidate-20261004/

## Rodada ativa — Agenda Inteligente / Textos Operacionais R2

1. Cada compromisso da Agenda passa a ter opção **Expandir**.
2. Ao expandir, a Central identifica o tipo do compromisso: **VISITA/VISTORIA, EXECUÇÃO ou RETORNO**.
3. O número do fluxo/orçamento é usado para consultar os registros correspondentes no **GestãoClick**.
4. O gerador preenche cliente, endereço, contato, equipe/prestador, data, horário e escopo disponível.
5. A redação é adaptada ao motivo real:
   - visita/vistoria → levantamento para orçamento e orientações de vistoria;
   - execução → escopo aprovado, registro antes/durante/depois e conferência final;
   - retorno → motivo do retorno, correção/ajuste, evidências e finalização.
6. Serviços de visita recebem adaptação contextual para categorias recorrentes como infiltração/vazamento, cobertura/telhado, elétrica, hidráulica, pintura/gesso/drywall e demais serviços.
7. O texto pronto pode ser copiado pelo botão **Copiar texto**.
8. Quando algum dado obrigatório não é localizado no GestãoClick, a Central sinaliza o campo faltante em vez de inventar informação.
9. A consulta é somente leitura; gerar/copiar texto não altera GestãoClick, calendário ou orçamento.
10. Dados pessoais detalhados do GestãoClick exigem sessão CONSTRU-REI ativa. A sessão é reutilizada, evitando autenticação repetida por item.
11. A navegação R2 (**Voltar • Início • Menu**) permanece preservada.

## Congelamento preservado — versão anterior mais completa

- Status: **CONGELADA / PRESERVADA**
- Commit exato: `2bb528851c343f6464418fadf36b115285aae916`
- Branch congelada: `cr-central-most-complete-frozen-20261004-r2`
- Checkpoint redundante: `CHECKPOINT_CENTRAL_MOST_COMPLETE_20261004_R2`
- Regra: essas referências não devem ser alteradas. A candidata de Agenda Inteligente foi criada a partir desse ponto seguro.

## Regra de continuidade obrigatória

Sempre que houver nova candidata, homologação, promoção, rollback ou checkpoint relevante:

1. Atualizar este arquivo no mesmo ciclo.
2. Registrar link público funcional, branch, commits funcionais/publicados, checkpoint e estado da oficial.
3. Nunca usar somente o histórico do chat como fonte de verdade.
4. Ao retomar o projeto, consultar este arquivo primeiro.
5. Não promover para a Central oficial sem gate de validação humana em notebook + celular.
6. Manter a versão oficial protegida enquanto a candidata estiver em validação.

## Última atualização

2026-10-04 — R2: Agenda Inteligente com modelos canônicos de VISITA, EXECUÇÃO e RETORNO, expansão por compromisso, consulta ao GestãoClick e cópia do texto operacional.
