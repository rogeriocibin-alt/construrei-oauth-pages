# APP CONSTRU-REI — ENCAIXE ORÇA-REI R15 | CHECKPOINT
Data: 15/10/2026
Estado: **CANDIDATA ISOLADA**, ainda não homologada para substituir o APP oficial.

## Baseline imutável
R15 homologada funcional/visualmente pelo responsável; checkpoint em `docs/orca-rei/HOMOLOGACAO_R15_20261015.md`. O motor R15 permanece **inalterado** e roda em iframe *same-origin* dentro do F02 integrado, usando código publicado diretamente de sua própria pasta original. Não clonar motor, banco, Edge Function, credenciais ou serviços.

## Conectividade implementada nesta candidata
- Abas APP / F00 / F01 / F02 + ORÇA-REI / F02 oficial / F03 / F04 com os **paths oficiais atuais** apontando para `production/flow-canonical-20261001/f00-f04`. Não alterar esses destinos em produção.
- No F02 integrado: busca por número exato na fila F02 via `cr-flow-runtime-v2?api=list`; leitura `?api=get`; importação de número, cliente, endereço, escopo, itens e retorno técnico na R15 (somente mediante clique). Nenhum token gravado em storage ou URL público do encaixe.
- R15 opera normalmente com geração IA, preço, PDF, parecer e fotos. A precificação e a geração documental não foram copiadas nem modificadas.
- Depois de revisar/completar preços, somente com checkbox humano, action **`budget-save` com `budget_ready:false`** e permanência em F02. Antes de gravar, compara a versão/revisão atual para bloquear sobrescrita de caso atualizado por outra pessoa. Se existir orçamento anterior, exige autorização explícita para substituir.
- Adaptação conservadora de esquema: a R15 tem diversas linhas de mão de obra e material; o F02 oficial tem linhas indexadas aos itens recebidos da triagem F01. Para evitar perder subtotais, gravar **mão de obra TOTAL e materiais TOTAL** na primeira linha, zero nas demais e preservar a **discriminação completa e texto técnico** em `budget.copy_ready_text`. A tela oficial F02 volta a carregar após o salvamento; não tratar campos consolidados como substitutos de preços individualizados da R15.
- F03 continua recebendo somente por `budget-release` no fluxo oficial, mediante revisão e marcação de pronto. O encaixe nunca chama esse endpoint automaticamente.
- F04: só carrega handoff real quando `cr-flow-runtime-v2?api=get` confirma `to_flow === F04`. O backend só faz essa transferência após F03 registrar `APROVADA`.

## Restrições de segurança
Não gravar outro chamado, não fazer status PRONTO_F03 automaticamente, não emitir OS, não anexar fotos/PDF ao banco sem contrato de armazenamento, não ocultar preço preliminar ou confundir custo e venda. Contexto acima do limite de entrada é bloqueado em vez de truncado silenciosamente. Sem alterações em produção, outras etapas, Supabase ou infraestrutura paga.

## Aceite pendente para promoção
1. Teste em notebook e Android da candidata de encaixe, inclusive iframe e impressão PDF (fallback em aba para mobile).
2. Verificar F00→F01→F02 com um chamado real autorizado, importar e gerar documentos reais com IA.
3. Conferir totais e detalhamento em `F02 oficial` após salvar rascunho no backend, sem perda nem sobrescrita.
4. Validar revisão comercial, prontidão e transferência F02→F03, aprovação F03→F04 e carregamento do token F04, com autorização responsável.
5. Se diferenças de itemização no F02/F03 afetarem processo comercial, evoluir esquema/UX em nova candidata aprovada ANTES de promover. Não substituir APP homologado sem novo aceite do responsável.

## Referências
- Produção atual: `app-construrei/` é alias para Edge `central-atendimento?mode=app`; a presente candidata não altera esse destino.
- Contrato `APP_EVOLUTION_POLICY_20261001.md`: toda melhoria primeiro em candidata isolada; produção só após aprovação.
- Gate de regressão na `.github/workflows/orca-rei-r15-regression.yml` com SHA pins da R15, matemática e fluxos de revisão e não-transição.
