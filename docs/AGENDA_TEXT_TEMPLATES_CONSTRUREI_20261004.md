# CONSTRU-REI — Modelos Canônicos de Texto da Agenda

Data de registro: 2026-10-04  
Uso: Central CONSTRU-REI → Agenda Operacional → expandir compromisso → gerar/copiar texto.

## Regra geral

1. Identificar o tipo real do compromisso: **VISITA/VISTORIA**, **EXECUÇÃO** ou **RETORNO**.
2. Usar o número do fluxo/orçamento para localizar os registros correspondentes no **GestãoClick**.
3. Preencher automaticamente cliente, endereço, contato, prestador/equipe, data, horário e escopo/serviços.
4. Adaptar a redação ao motivo real. Não copiar descrição bruta sem contexto.
5. Se algum dado não for localizado, sinalizar claramente antes da cópia; nunca inventar cliente, contato, endereço ou prestador.
6. Fotos/vídeos e conferência final fazem parte do texto operacional conforme o tipo.
7. A agenda continua somente leitura: gerar/copiar texto não altera GestãoClick, calendário ou orçamento.

---

## VISITA / ORÇAMENTO — modelo canônico

📋 CONSTRUREI | INFORMAÇÕES VISITA / ORÇAMENTO

📝 FLUXO: [FLUXO]  
👤 CLIENTE: [CLIENTE]  
📍 ENDEREÇO: [ENDEREÇO]  
📞 CONTATO: [CONTATO]

📅 DATA: [DATA]  
🕒 HORÁRIO: [HORÁRIO]  
👷 PRESTADOR: [PRESTADOR]

🔧 SOLICITAÇÃO DA VISITA:

Realizar vistoria no imóvel para levantamento e elaboração de orçamento referente aos seguintes serviços:

• [SERVIÇO / PONTO 1 ADAPTADO AO MOTIVO];  
• [SERVIÇO / PONTO 2 ADAPTADO AO MOTIVO];  
• [DEMAIS PONTOS, QUANDO HOUVER].

📌 IMPORTANTE PARA O PRESTADOR:  
Conversar com o cliente no local e verificar todos os pontos relacionados à solicitação. Informar separadamente os serviços, materiais e quantidades necessários para cada reparo, incluindo qualquer condição adicional apresentada durante a visita.

📸 REGISTRO DA VISITA:  
Tirar fotos e vídeos detalhados de todos os pontos vistoriados, incluindo o problema informado, possíveis origens quando aplicável, condições existentes e demais reparos apresentados pelo cliente.

### Adaptação inteligente da visita

- Vazamento/infiltração: origem provável, extensão dos danos e reparos.
- Cobertura/telhado/calha/rufo: condições, fixações, emendas, vedação e entrada de água.
- Elétrica: funcionamento, alimentação, conexões e proteções.
- Hidráulica: funcionamento, vazamentos, conexões, vedações e componentes.
- Pintura/gesso/drywall/forro: condição das superfícies, danos, preparação e dimensões.
- Outros: condições existentes, serviço necessário, materiais, quantidades e evidências.

---

## EXECUÇÃO — modelo canônico

👷 INFORMAÇÕES EXECUÇÃO

📝 ORÇAMENTO: [ORÇAMENTO]  
👤 CLIENTE: [CLIENTE]  
📍 ENDEREÇO: [ENDEREÇO]  
📞 CONTATO: [CONTATO]

📅 DATA: [DATA]  
🕒 HORÁRIO: [HORÁRIO]  
👷 PRESTADOR: [PRESTADOR]

📌 SERVIÇOS A SEREM EXECUTADOS:

Executar os serviços conforme escopo aprovado no orçamento [ORÇAMENTO].

• [SERVIÇO 1];  
• [SERVIÇO 2];  
• [DEMAIS SERVIÇOS].

📸 IMPORTANTE:  
Registrar fotos e vídeos antes, durante e após a execução dos serviços.

✅ FINALIZAÇÃO:  
Ao finalizar, realizar conferência dos serviços executados, testar o funcionamento quando aplicável, manter o local organizado e registrar qualquer pendência ou necessidade adicional identificada.

---

## RETORNO — adaptação canônica

📋 CONSTRUREI | INFORMAÇÕES RETORNO

📝 ORÇAMENTO: [ORÇAMENTO]  
👤 CLIENTE: [CLIENTE]  
📍 ENDEREÇO: [ENDEREÇO]  
📞 CONTATO: [CONTATO]

📅 DATA: [DATA]  
🕒 HORÁRIO: [HORÁRIO]  
👷 PRESTADOR: [PRESTADOR]

📌 MOTIVO / SERVIÇOS DO RETORNO:

• [MOTIVO / SERVIÇO 1];  
• [MOTIVO / SERVIÇO 2].

🔧 ORIENTAÇÃO:  
Realizar o retorno referente ao serviço do orçamento [ORÇAMENTO], verificar a condição apresentada, executar os ajustes necessários dentro do escopo aplicável e registrar qualquer necessidade adicional antes de avançar.

📸 IMPORTANTE:  
Registrar fotos e vídeos antes, durante e após o retorno, deixando evidência clara do motivo encontrado e da solução aplicada.

✅ FINALIZAÇÃO:  
Ao finalizar, realizar conferência do serviço, testar o que for aplicável, registrar o resultado e informar imediatamente qualquer pendência ou nova necessidade identificada.

---

## Implementação candidata

- Branch: `cr-central-agenda-smarttext-candidate-20261004`
- API geradora: `cr-agenda-smart-text-candidate-20261004`
- Central candidata: `cr-central-agenda-smarttext-candidate-20261004`
- Base congelada de origem: `2bb528851c343f6464418fadf36b115285aae916`
- Regra de segurança: dados pessoais detalhados do GestãoClick exigem sessão CONSTRU-REI ativa; a sessão é reutilizada e não é solicitada a cada item.
