# CONSTRU-REI — REGRA CANÔNICA F02 | Motor de Parecer Técnico Inteligente
**Decisão da direção:** 08/10/2026. **Estado:** arquitetura e regras HOMOLOGADAS pela direção; implementação integral e qualidade documental A VALIDAR. Não confundir homologação de especificação com homologação do software.

## Regras pétreas
1. A logo oficial CONSTRU-REI deve constar em TODO documento institucional emitido (orçamento, parecer, relatório, PDF, anexos e derivados). Usar asset canônico, sem redesenhos ou logos substitutas. Validar resolução, carregamento e incorporação efetiva no PDF.
2. Dois documentos, identidades distintas: **orçamento = ORÇA-REI V1 R8 Premium** (referência 766-26, 05/10/2026); **parecer = modelo canônico 710-26** (cores, layout, capa/cabeçalho, hierarquia, fotos com legendas e paginação). Nunca replicar automaticamente o layout do orçamento no parecer.
3. F00 coleta relatos, evidências e fotos; F01 organiza e qualifica; F02 transforma esses dados em pré-orçamento, orçamento e parecer técnico; F03 permite revisão orientada, sugestões, edição e aprovação. Preservar vínculos de origem e histórico.
4. Botão **Gerar Parecer** aciona motor de análise estruturada, não mero template de texto: extrair fatos da coleta, organizar evidências, analisar imagens, propor legendas contextualizadas, hipóteses, métodos de verificação, ressalvas, conclusão preliminar e recomendações; identificar lacunas e solicitar validação técnica.
5. **Não inventar** fatos, medições, fotografias, causalidade, responsabilidades ou resultados de testes. Distinguir observado, relatado, inferido e não verificado. Inspeção técnica e aprovação humana necessárias para conclusões definitivas.
6. Fotografias efetivamente associadas ao chamado devem seguir com identificação estável, origem, ordem, legenda proposta e revisão humana; se não existirem, informar ausência, sem imagens fictícias.
7. IA integrada por **camada de provedor intercambiável**, apta a OpenAI/ChatGPT, Gemini ou outro motor autorizado, sem acoplamento de interface, documentos ou regras a um fornecedor. Contrato de entrada/saída estável, versão do prompt, rastreabilidade e fallbacks. Não armazenar chaves no frontend.
8. Preservar isolamento de candidatos, rollback, proteção de dados, controle de acesso, privacidade de clientes, trilha de alterações e auditoria. Não alterar versões homologadas sem nova validação.
9. PDF deve usar identidade oficial com logo embarcada, imagens e legendas, paginação A4, leitura no celular e impressão; testar com dados reais autorizados e caso fictício antes de homologação.
10. **Congelamento F00–F02 só após validação funcional completa da candidata e aprovação expressa da direção.** Até lá, V21 é base funcional candidata e o motor avançado é pendência de desenvolvimento. F03 é etapa seguinte, sem impedir definição antecipada de seu contrato.

## Contrato lógico estável
Entrada: identificador do chamado, dados normalizados F00/F01, escopo editado F02, ocorrências, evidências e anexos com referências, configuração/modelo, autor, versões e permissões.
Saída: fatos vinculados às fontes; análise técnica separada de hipóteses; lacunas; verificações; recomendações; legendas por ID de foto; seções editáveis; estado (rascunho/preliminar/revisão/aprovado); versão do modelo, motor e provedor; PDF e histórico.
No modo sem IA externa, o sistema pode estruturar texto determinístico, mas não pode apresentar esse resultado como análise multimodal realizada.
Fluxo: F00 → F01 → F02 → opção gerar orçamento / parecer / enviar F03 → revisão humana → emissão validada.

## Aceite obrigatório
- Teste de equivalência visual do 710-26 para parecer e R8 para orçamento, ambos com logo correta.
- Teste de fotos de F00 no PDF com legendas verificáveis; teste de ausência de fotos.
- Teste de análise de ocorrência de caça-vazamentos (referência 675-26), sem presumir constatações.
- Teste da troca de provedor IA sem refazer templates, preservação de versões, edição F03 e rollback.
- Validação no celular e notebook. Registrar checkpoint, commit, link e assinatura de aprovação antes do congelamento.

**Registro:** homologada a NORMA de produto. NÃO declarar motor IA multimodal já integrado, parecer 710-26 reproduzido fielmente, nem F00–F02 congelados sem evidência de testes.
