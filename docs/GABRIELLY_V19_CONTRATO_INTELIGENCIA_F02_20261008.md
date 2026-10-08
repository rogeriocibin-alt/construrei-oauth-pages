# Gabrielly V19 — contrato de inteligência e transição F01 → F02
Data 08/10/2026. Branch isolada: candidate/gabrielly-v19-inteligencia-f02-20261008. Base congelada: V18, caso QA 99001-26. **Não homologada.**
## Objetivo
Manter visual e funcionalidades anteriores. Remover progressão em telas acumuladas: uma fase operacional de cada vez, histórico persistido, botão voltar. F02 deve ser área de trabalho autônoma e inteligente, não três caixas vazias.
## Entrada da coleta
Campo livre recebe mensagens de WhatsApp e observações. Interpretar entidades: cliente/origem, nome e papel de contato, telefone (DDD e internacional), e-mail, imóvel/endereço, tipo de ocorrência, locais, descrição técnica, acesso, quem paga/autoriza, dia e janela de disponibilidade, evidências e próximos passos. Mensagens podem trazer vários campos em qualquer ordem. Ao clicar Incorporar, gravar texto imutável e separar fatos normalizados com origem, data e confiança. Reconciliar com valores anteriores, sem sobrescrever dados sólidos por especulações. Classificar conflito e questionar quando ambíguo; nunca preencher lacunas por palpite.
## Saída incremental
Atualizar resumo da ocorrência, campos estruturados, pendências reais e bloqueios de etapa numa mesma transação lógica. Responder com campos extraídos, itens resolvidos, itens ainda pendentes e justificativa. Pendência não some sem informação suficiente. Interface prioriza automático; edição manual permanece acessível como exceção, com rastreio.
## F02
Ao concluir qualificação F01, navegar para F02 como única etapa visível, sem acumular telas F00/F01; preservar volta, número do chamado e histórico. Gerar escopo fundamentado na ocorrência e em padrões CONSTRU-REI (MO/MAT/OBS; numeração manual; texto comercial objetivo e observações técnicas apropriadas).
Separar rigorosamente fatos fornecidos, hipóteses técnicas e necessidades de vistoria. Gerar três blocos editáveis: (1) serviços/mão de obra com entregáveis e limites; (2) materiais e insumos justificados, sem quantidades inventadas; (3) observações, exclusões, dependências e alerta de confirmação técnica. Não inferir causa de infiltração, quantidades, preço ou prazo sem dado. F03 só após conferência humana explícita. Nunca escrever no Gestão Click nesta candidata fictícia.
## Exemplo QA 99001-26 (fictício)
Entrada: "Imobiliária Horizonte Testes autorizou a vistoria de infiltração. O proprietário paga. Ana receberá quinta às 14h; acesso pela portaria mediante identificação. Contato Ana (41) 99999-8888, ana.teste@example.com."
Extrair papel de cada ator, pagamento, acesso, telefone, e-mail e disponibilidade. Reduzir pendências correspondentes, mantendo qualquer lacuna de endereço e origem técnica.
F02 esperado, somente se escopo de infiltração estiver identificado:
MO: "Realizar vistoria técnica para investigar a origem da infiltração, inspecionar os pontos afetados e registrar achados para definição do reparo."
MAT: "Materiais para eventual intervenção somente após diagnóstico; especificação e quantidades pendentes de confirmação técnica."
OBS: "A origem da infiltração não está comprovada. Reparos, abertura de acabamento, teste invasivo ou substituição de componentes dependem da vistoria e autorização aplicável."
## Aceite obrigatório
- Mesma entrada com ordem e sinônimos variados gera os mesmos campos normalizados.
- Atualização de telefone/e-mail/horário é incorporada; dados anteriores mantidos; conflito sinalizado.
- Pendências são recalculadas imediatamente, e o manual funciona após falha automática.
- F02 inicia sozinho, produz minuta justificada, oferece revisar, salvar, voltar e avançar para F03.
- Navegação F00→F01→F02→F03 sem telas sobrepostas, botões inertes, perda de dados ou duplicação.
- Teste no navegador de notebook e celular, teste de regressão sobre V16–V18.
- Nenhum endpoint real sem JWT/RBAC validado.
## Estado
Este é o contrato de execução. Não equivale à implementação nem a teste funcional.