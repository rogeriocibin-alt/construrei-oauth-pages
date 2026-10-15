# CONSTRU-REI — ORÇA-REI R13 | AUDITORIA DE PREÇOS UNITÁRIOS
Data: 2026-10-15
Estado: CANDIDATA ISOLADA / NÃO HOMOLOGADA. Origem: R12 (PDF mobile), sem alteração da R12 ou produção.

## Evidência da falha
Captura Android de 15/10: fixação para bacia sanitária (4 CJ, R$ 8 de custo unitário conforme nota da IA) recebeu R$ 49,23/CJ, valor que coincide com preço DE LOTE (4 x R$ 8 / 0,65). Rejunte (2 UN, nota R$ 15 cada) recebeu PCT como unidade e foi recusado pela interface, permanecendo sem preço.

## Mitigação isolada implementada
- Auditar respostas do endpoint R11, sem mudar ou duplicar a Edge Function compartilhada.
- Quando a própria nota da IA declara custo de N unidades e preço retornado concilia exatamente com o total de venda de N unidades a margem referencial de 35%, corrigir automaticamente para preço de venda de UMA unidade e registrar justificativa ao lado do item.
- Conferir a quantidade textual da nota contra a quantidade digitada: divergência bloqueia precificação desse item.
- Caso demonstrável de PCT retornado para UN: converter o rótulo apenas se a nota explicitar N UNIDADES com custo por unidade e reconciliação matemática. Não aplicar conversões gerais entre pacotes e unidades sem fator documentado.
- Caso o preço da IA não concilie com a nota de custo, barrar a estimativa e exigir revisão: nenhum preço comercial incoerente é introduzido silenciosamente.
- Preservar valores explicitamente informados pelo usuário e preços publicados/históricos; auditoria restringe-se às estimativas IA.
- Exibir no diagnóstico total de itens corrigidos, incompatíveis e pendentes.

## Testes de lógica
9 cenários determinísticos em JS puro: lote de 4 corrigido, rejunte PCT→UN conciliado, preço unitário já correto, ausência de custo detalhado, divergência de nota, evidência histórica preservada, embalagem indefinida bloqueada e quantidade conflitante bloqueada.
**IMPORTANTE:** os testes são lógicos, não certificam chamada real da IA ou emissão PDF mobile. Exigir rodada única de homologação notebook + celular e dois casos reais antes de promover.

## Limitações
- Margem de 35% usada apenas para validar/reconciliar a estimativa da função R11, conforme prompt existente. Custo hipotético não é custo comprovado nem preço de mercado. Valores devem ser revisados.
- Não editar produção, R11, R12, credenciais, autenticação, backend, PDF homologado ou central.
