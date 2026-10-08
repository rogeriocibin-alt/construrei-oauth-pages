# CONSTRU-REI · F02 MOTOR DE PARECER 710-26 · BLUEPRINT V1
Data: 08/10/2026 | Estado: especificação implementável; IA multimodal não conectada; sem homologação funcional.

## Fonte canônica estudada
PDF original DOC-20260918-WA0084(1).pdf, Parecer Técnico 710-26, 2 páginas. Caso: vistoria hidráulica, interrupção intermitente de abastecimento. Página 1: cabeçalho, metadados, objetivo/escopo, verificações e 6 registros fotográficos legendados em grade 3×2. Página 2: análise técnica, elementos compatíveis, recomendações, critério para confirmação da origem e conclusão. **Não copiar o diagnóstico da Sanepar para novos casos.**

## DNA visual a reproduzir
- A4 vertical; área superior com logo real CONSTRU-REI em fundo claro à esquerda e bloco azul-marinho à direita; título branco, número em dourado; faixa fina dourada no topo; coluna direita MANUTENÇÃO / REFORMAS / DIAGNÓSTICO e “Análise com prudência e evidência.”
- Primeira página: quatro cartões azul-pálido com cliente/origem, endereço, data da vistoria e responsável; títulos de seções numeradas em barras azul-marinho.
- Grade de fotos 3 colunas × 2 linhas, cada cartão com imagem sem distorção, número destacado e legenda curta ligada à evidência; observação sobre limites probatórios dos frames.
- Análises em parágrafos densos, com chamada amarela para interpretação de teste; conclusão em quadro azul-pálido; rodapé navy+dourado com contatos, slogan e “Página X de Y”.
- Não há valores comerciais no parecer; orçamento ORÇA-REI R8 permanece em motor visual separado. **Logo canônica obrigatória em ambos.** Capturar e fixar assets de marca num pacote versionado, com fallback explícito e verificação de carregamento antes do PDF.

## Pipeline a implementar no F02
1. **Ingestão**: ler F00/F01/F02, cliente/endereço, cronologia, textos, vídeos, fotos originais, laudos, testes, medições, responsáveis; preservar IDs, permissões, MIME, ordem e origem. Extrair frames de vídeo com timestamp e autorização.
2. **Normalização factual**: converter relatos em objetos `claim` com `type=observed|reported|measured|hypothesis|recommendation`, `source_ids`, `timestamp`, `confidence` e `verification_status`. Não promover relato a fato testado.
3. **Análise multimodal (adaptador de IA)**: descrever apenas conteúdo visual verificável; detectar duplicatas, baixa qualidade e necessidades de revisão; escolher melhores fotos por relevância; produzir legendas ancoradas em `media_id` e preferencialmente `evidence_id`. Não inventar origem de vazamento, materiais ocultos, medida, norma ou causalidade.
4. **Planejador de investigação**: para o domínio detectado (hidráulica/caça-vazamentos, infiltração/coberturas, elétrica, estrutura, vedações etc.), listar hipóteses concorrentes, testes necessários, resultado esperado, elementos contrários, lacunas e critério que confirmaria/refutaria cada hipótese. Ex.: teste no cavalete 710-26 confirma dependência funcional de ramais; NÃO comprova retrospectivamente causa de falhas da concessionária.
5. **Pesquisa com fontes verificáveis**: pesquisa web ou biblioteca técnica por conectores próprios, mediante disponibilidade/credenciais; priorizar documentos de fabricante, normas ABNT licenciadas, organismos técnicos, artigos e instituições; armazenar URL, entidade, publicação, trecho relevante, acesso e versão; jamais fabricar número ou texto de norma. Sem acesso: marcar “pesquisa externa não realizada”, nunca simular referências.
6. **Redação estruturada**: gerar seções 1 Objetivo e escopo; 2 Verificações; 3 Registro fotográfico; 4 Análise técnica; 5 Elementos compatíveis e divergentes; 6 Recomendações; 7 Critérios para confirmação; 8 Conclusão e limitações. Adaptar ao caso mantendo lógica, sem forçar seções vazias. Sem valores.
7. **Motor documental determinístico**: receber JSON de seções, ativos de fotos e marca, renderizar PDF A4 reproduzindo o DNA do 710-26; paginação dinâmica, quebras seguras, legenda colada à foto, fonte legível e sem fotos deformadas. PDF separado do provedor de IA. Exigir preview renderizado e inspeção.
8. **F03/revisão**: permitir alterações de texto, legendas, classificação factual, fontes e seleção de imagens; trilha de revisão, responsável, data, aprovação. Nunca liberar parecer como laudo profissional automático; validação humana obrigatória para afirmações conclusivas.

## Interface do provedor IA
`analyzeCase(input: CaseEvidenceBundle, options: {provider, model, prompt_version, policy_version}) -> TechnicalAssessment`
`researchQuestion(input: ResearchQuery) -> SourceReference[]`
`captionMedia(media: MediaEvidence[]) -> CaptionProposal[]`
`render710(input: ReviewedTechnicalDocument) -> PDFArtifact`
- Adaptadores ChatGPT/OpenAI, Gemini ou outros são opcionais e substituíveis; operar no backend, chaves em secrets, isolamento e minimização de PII, consentimento/base adequada e controle de custos. Fallback de formulário determinístico quando IA indisponível, rotulado como sem análise IA.
- `TechnicalAssessment`: `case_id`, `observations[]`, `reported[]`, `measurements[]`, `hypotheses[]`, `tests[]`, `media[]`, `sources[]`, `uncertainties[]`, `recommendations[]`, `conclusion_draft`, `audit{provider,model,prompt_version,generated_at}`.
- Cada hipótese contém `supporting_evidence_ids[]`, `contradicting_evidence_ids[]`, `confirmation_needed[]`. Cada foto contém `media_id`, `source_stage`, `timestamp`, `caption_draft`, `caption_approved`.

## Aceite e teste do padrão 710
- Golden test: extrair do PDF 710-26 apenas seus atributos visuais; comparação visual do template sem reproduzir diagnósticos.
- Teste sem fotos, com seis fotos, com vídeo/frame, com dados faltantes, com hipóteses concorrentes e fontes indisponíveis.
- Teste de hidráulica: diferenciar alimentação funcional e causa dos episódios; exigência de rastreio por evidência.
- Teste de marca: logo visível e nítida em cada PDF; cores/rodapés/numeração; nenhum preço no parecer.
- Teste de provedor trocado sem mudar UI/JSON/template e teste F00→F01→F02→F03 com preservação de evidências.
- QA notebook + celular, rollback, revisão humana, congelamento somente após aceite explícito.

## Implantação incremental sem refazer
Fase A: ativos de marca + template visual 710 + pacote de esquema e API mockada.
Fase B: persistência e ingestão de evidências do F00, frames, mídia e legendas.
Fase C: conectar provedor multimodal + pesquisa, fontes e trilha de auditoria.
Fase D: F03, validação humana, QA integral e congelamento F00–F02.

**Estado real:** este documento especifica o motor e a ordem de implantação. Não comprova integração IA, busca web em produção ou emissão automática fiel já operantes.
