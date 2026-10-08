# Caso fictício auditável — CONSTRU-REI Gabrielly (QA, não produção)
Data: 07/10/2026 — 100% fictício. Não criar card real, não enviar mensagens, não ocupar agenda nem interferir nas contagens.

## Caso QA: 99001-26
Canal: imobiliária fictícia Horizonte Testes.
Primeira mensagem: "Solicito vistoria de infiltração no teto da cozinha do apartamento 402, edifício Exemplo, Rua das Amostras, 123, Curitiba. Cliente: Imobiliária Horizonte Testes. Responsável no local: Ana Exemplo, (41) 90000-0000. A origem do vazamento ainda é desconhecida."

### Passagens esperadas
1. **F00 → Captura**: número 99001-26, texto original e origem preservados, arquivo opcional. Não duplicar se reenviado.
2. **Coleta inteligente**: identificar cliente, endereço, contato, telefone, problema, unidade; faltar pagador/autorização, disponibilidade e acesso. Bloquear liberação se faltarem dados críticos.
3. **Mensagem sugerida**: solicitar apenas as informações faltantes, sem mencionar valores não autorizados.
4. **Retorno**: copiar mensagem (falha explícita se clipboard negado), marcar `AGUARDANDO_RESPOSTA`, manter visível na fila e histórico.
5. **Resposta incremental**: "Autorizado pela imobiliária Horizonte Testes. Quem paga é o proprietário. Ana recebe quinta-feira às 14h. Acesso pela portaria com identificação." Reprocessar no MESMO 99001-26, anexar evento e atualizar somente campos comprovados.
6. **F01 → Qualificação**: confirmar completude, manter card, envolvidos e evidências; impedir liberação com faltas. Revisar autorizador, acesso e risco.
7. **F02 → Pré-orçamento**: preparar escopo de inspeção de infiltração no padrão MO/MAT/OBS, **sem preço inventado**; exigir revisão técnica/comercial.
8. **F03 → Gate**: somente encaminhar após autorização competente; nunca presumir emissão de proposta ou OS.
9. **Agenda**: agendamento e confirmação de prestador/cliente somente após integração real; nesta QA verificar o estado esperado, não gravar evento real.
10. **Relacionamento**: registrar retorno, responsável, próxima ação e fechamento sem apagar histórico.

### Variante de emergência
Outra mensagem fictícia: "Há cheiro de gás e risco imediato no imóvel". Esperado: sinalizar possível P0 e solicitar intervenção humana; não confirmar diagnóstico, nem despachar sem autoridade. Texto "manutenção preventiva de aquecedor a gás" NÃO deve virar P0 por conter apenas gás.

### Evidências mínimas para homologar
- Abrir/fechar navegação, novo chamado, editar, adicionar informação, anexar, copiar, aguardar, abrir da fila, reprocessar, liberar F01, copiar pré-orçamento.
- Registro da mesma identidade 99001-26 e eventos append-only.
- Testes de falha: rede indisponível, servidor 401/403/500, clipboard negado, duplicidade, dados faltantes.
- Controle de autorização para Gabrielly; nenhum valor financeiro confidencial mostrado.
- Conferir celular/notebook e que fluxo original continua íntegro.

## O que já se comprovou por inspeção do código
- Endpoint `cr-f00-intake-candidate-20261002` implementa create/update/get/list/wait/release e reconhece alterações incrementais no update.
- A V12 tinha problema de WAIT não aparecer em ACTIVE, cópia com falso sucesso e estado de sincronização enganoso; correções defensivas estão na V13 da branch de auditoria.
- O endpoint tem função `auth` baseada no header `x-f00-key`, mas o HTML do candidato não o envia explicitamente; precisa auditar como proteção e permissão são efetivamente aplicadas no handler (não considerar seguro ou inseguro sem essa checagem).
- ESTE É UM CASO DE TESTE, e não um teste ponta a ponta já executado no backend. Não afirmar conclusão até execução real e evidências.
