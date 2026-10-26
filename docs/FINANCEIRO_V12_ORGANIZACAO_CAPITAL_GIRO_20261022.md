# CONSTRU-REI — V12 | Organização do Capital de Giro (22/10/2026)
**Responsáveis:** Bio / CR Assertivo • Financeiro REI • **PR #142 (DRAFT)**

## Decisão de arquitetura visual
Foi comprovado que a V12 tinha:
- um bloco "Capital de Giro / Auditoria" **aninhado nos rateios históricos** de Resultados e Acertos, com resumo e formulário V11 logo abaixo;
- uma segunda apresentação com **gerado, saldo e pendente** em Auditoria e Saúde;
- um atalho executivo fora do fluxo principal;
- um quadro bancário Cora repetido nas telas Auditoria e Qualidade.

**Solução implementada:** uma única central `#v12-capital-workspace` colocada **no topo** de `Resultados e Acertos`, antes de `Acertos em aberto` e `Histórico e rateios`. Navegação interna direta entre estas três seções.

## Central única: dados e ações
- Fonte de dados `S.capital` da integração Trello existente, sem criar saldo paralelo.
- 4 métricas bem separadas: **saldo disponível** (destaque principal), **gerado**, **consumido líquido** e **acerto pendente fora do saldo**.
- Validação aritmética gerado - consumido = saldo disponível quando todos os valores estão presentes. Ausência de dados = "Indisponível", nunca zero presumido.
- Operação V11 `#v11cap` integrada uma única vez em `#v11cap-slot`, preservando leitura dos períodos, prévia, confirmação explícita e bloqueio de repetição após falha ambígua. API já existente, sem novas funções.
- Atalho da Visão Executiva apenas navega à central, sem segundo formulário nem novo resumo concorrente.

## Demais áreas
- **Auditoria e Saúde:** mantém somente contagem de períodos e divergências de títulos, contexto do período histórico e botão de retorno à central. Não replica saldos ou ações.
- **Qualidade dos dados:** agora se dedica aos problemas de classificação operacional; quadro de saldos Cora aparece uma única vez em Auditoria.
- **Cora Pro V2:** integração, iframe, filtros, credenciais e consultas preservados; texto explicativo esclarece onde ficam Capital de Giro e acertos.

## Identidade visual e responsividade
- Cartão principal azul-marinho, dourado discreto e indicadores neutros; acerto pendente em amarelo suave e sem ser somado ao saldo disponível.
- Contêiner único com cabeçalho, fonte Trello, botões para atualizar e auditar, quatro métricas e formulário de lançamento.
- Tipografia com hierarquia explícita, fundos claros, alto contraste, ações discretas e grade responsiva para celular/notebook.
- Sem duplicar `id="cap"`, `id="v11cap-slot"` ou `id="v12-capital-workspace"`.

## Testes e restrições
- Smoke offline inclui ordem da navegação, central única, formulário existente e ausência de auditoria Cora duplicada.
- Nenhum lançamento financeiro, saldo real, rateio, obra fechada, credencial ou função Supabase foi alterado.
- A V11 oficial e seu alias permanecem intactos.
- Não é homologação: testes E2E de escrita isolados, comparação Cora × Trello e validação visual notebook + celular continuam pendentes.
- Publicar somente rota separada da V12 e manter PR #142 DRAFT; rollback pelo commit anterior da página.
