# Auditoria técnica — ORÇA-REI R15 / APP F00–F04 — 15/10/2026

## Escopo e evidência
Arquivos inspecionados na `main`: `preview/app-construrei-orca-rei-r15-f00-f04-20261015/index.html`, `bridge.js`, `preview/orca-rei-teste-ia-20261015-r15-correcao-precos-pdf/index.html` e `production/flow-canonical-20261001/f02/index.html`. Página aberta via Opera, árvore de acessibilidade lida. Não realizado teste E2E autenticado de gravação/recuperação de banco.

## Achados priorizados

**P0 — fidelidade estruturada de orçamento**: `makePayload` preserva discriminação individual em `copy_ready_text`, mas sintetiza mão de obra e material com o primeiro item contendo o total, e itens adicionais de valor zero. `count` deriva dos itens do chamado original, não dos itens precificados da R15. Isso implica que o orçamento estruturado do F02 pode NÃO representar os itens detalhados da R15 e exige adaptador contratual, com teste real de round-trip antes de homologar. Não remapear cegamente sem conhecer validações de `cr-flow-runtime-v2?api=budget-save`.

**P0 — anexos e documentos**: PDFs e fotos são gerados no iframe R15, mas não são enviados pela `budget-save`; o texto avisa que permanecem no navegador. Não declarar histórico documental completo. Projetar upload seguro, referências por caso/versão, checagem de integridade e autorização; não permitir inclusão anônima de dados reais em preview público.

**P1 — segurança/autoria**: `api()` utiliza POST com payload sem header explícito Authorization; `makePayload` fixa `actor:"Rogério"`. Necessário comprovar autenticação/autorização efetivas no backend, e identidade humana derivada da sessão validada no servidor, não da string enviada. Sem essa prova, bloquear uso sensível em produção.

**P1 — captura integral do contexto**: `importSource()` limita a 20 itens e a 3.300 caracteres; lança erro se ultrapassar limite. Isto evita truncamento silencioso, mas não existe fluxo assistido para casos grandes. Campos importados são seleção de `h.state`, sem cópia integral do histórico/anexos.

**P1 — alteração de fase**: a candidata não promove F02→F03→F04. Exibe rotas oficiais em iframes e só navega ao F04 com handoff válido; precisa E2E da cadeia canônica, com aprovação humana explícita.

**P1 — conflito de edições**: `saveDraft()` checa `revision` imediatamente antes de `budget-save`, mas o contrato da gravação não recebe revisão esperada no payload apresentado; confirmar condição atômica no backend contra alterações concorrentes (TOCTOU). Não afirmar proteção completa contra concorrência sem teste de duas sessões.

**P1 — validação quantitativa**: `budgetItems()` lê campos DOM `crq*` e `crv*`, valida positivo e `assumedQty`, mas apenas confere totais agregados no retorno. Testar arredondamento, unidade, linhas duplicadas, ausência de preço, revisão de materiais/rejunte e identidade do item individual salvo/recarregado.

**P2 — UX/identidade**: candidatos exibiam dois F02 na navegação, aumentando confusão. Layout usa CSS próprio, com paleta próxima do APP (azul/dourado) mas sem demonstrar conformidade com tokens do shell canônico; R15 no iframe usa interface clara independente, produzindo uma transição visual evidente. A candidata usa sidebar ao lado de iframe 1300px; em mobile empilha os painéis e pode exigir rolagem extensa. Botão voltar possui histórico local e não necessariamente estado do módulo interno.

**P2 — transparência**: legendas anteriores sugeriam funcionamento completo; primeira candidata de correção simplifica F02 e explicita que rascunho não anexa PDF/fotos nem todos os itens estruturados.

## Critérios de aceite antes de produção
1. Prova de acesso e autoria RBAC em servidor com sessão real; autorização por caso e fase.
2. Teste real autorizado do chamado F01→F02 com itens e quantidades, sem perda; comparar importação campo a campo.
3. Gerar orçamento e parecer R15; validar precificação por item, totais, apresentação GestãoClick e separação financeira do parecer.
4. Persistir **todos** os serviços e materiais estruturados no F02, ler novamente e comparar item/unidade/quantidade/valor sem linhas zeradas artificiais.
5. Preservar anexos e PDFs com readback/checksum ou declarar funcionalidade indisponível até implementação segura.
6. Duas sessões concorrentes: a segunda não deve sobrescrever silenciosamente a revisão.
7. Passagem F02→F03→F04 apenas com aprovação, OS e regras canônicas; rollback de candidato.
8. Homologação visual no celular e notebook. R15 original inalterada, nenhuma promoção automática.

## Diretriz
Congelar R15 aprovada; mudar apenas a camada candidata de integração e, caso necessário, backend em versão isolada com testes e autorização. Nunca usar dados reais em uma prévia pública não autenticada sem controle adequado.
