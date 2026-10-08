# CHECKPOINT — GABRIELLY F00–F02 — 2026-10-08
Direção: aprovação explícita para congelar e promover a base funcional V21 de F00/F01/F02. **Aprovação da direção registrada; promoção técnica ainda NÃO realizada.**
## Fontes verificadas
- Link oficial do APP: https://rogeriocibin-alt.github.io/construrei-oauth-pages/app-construrei/ . O arquivo `app-construrei/index.html` atual é REDIRECIONAMENTO para Supabase `/functions/v1/central-atendimento?mode=app`, NÃO o código APP que está na candidata.
- Candidata V21: `preview/app-gabi-v21-parecer-logo-20261008/index.html`, commit `c919eeaefeff08890c7f2acb50b4f0d9eee7a558`. A candidata usa iframe dependente de `preview/app-gabi-v20-documentos-f02-20261008/`, sem integração confirmada ao runtime do APP oficial.
- Snapshot isolado: branch `checkpoint-gabrielly-v21-f00-f02-aprovacao-base-20261008`, criada a partir do commit V21 acima. Esta branch é um marcador de versão e NÃO substitui backup ou comprova testes E2E.
## Regras congeladas como especificação
F00 captura, F01 triagem, F02 pré-orçamento e geração de dois documentos; logo oficial obrigatória; orçamento ORÇA-REI R8; parecer identidade 710-26; F03 futura revisão. Motor multimodal avançado aprovado como arquitetura, mas NÃO integrado.
## Gate de promoção
1. Incorporar candidato aprovado no runtime real `central-atendimento?mode=app` ou ajustar encaminhamento oficial somente com integração compatível e comprovada. Não apontar link oficial para iframe de QA.
2. Validar F00→F01→F02 e os dois PDFs em notebook e celular; fotos, logo, dados, segurança, persistência e retorno/rollback.
3. Registrar commit de deploy real, ambiente e evidência de sucesso antes de marcar como PUBLICADO/HOMOLOGADO TECNICAMENTE.
## Estado
Checkpoint da base aprovado/registrado; produção APP oficial inalterada; promoção bloqueada por dependência de runtime distinto e falta de teste funcional integrado. Não confundir aprovação do diretor com evidência de publicação.
