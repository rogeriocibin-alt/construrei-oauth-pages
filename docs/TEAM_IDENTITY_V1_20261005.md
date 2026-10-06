# CONSTRU-REI — Team Identity V1

Data: 2026-10-05  
Estado: **CANDIDATA / NÃO PROMOVIDA / AGUARDANDO VALIDAÇÃO HUMANA**

## Objetivo
Personificar as interfaces com a identidade visual das pessoas reais da equipe, sem confundir pessoas com agentes digitais e sem alterar as versões oficiais antes do gate humano.

## Pessoas e papéis
- **Rogério** — Diretor • Gate Master.
- **Éder** — Admin Técnico • operação técnica.
- **Gabrielly** — Atendimento • triagem.
- **Fabrício** — Execução • campo.

## Assets canônicos
Cards completos:
- `assets/team/rogerio.webp`
- `assets/team/eder.webp`
- `assets/team/gabrielly.webp`
- `assets/team/fabricio.webp`

Recortes leves para avatares pequenos:
- `assets/team/rogerio-face.webp`
- `assets/team/eder-face.webp`
- `assets/team/gabrielly-face.webp`
- `assets/team/fabricio-face.webp`

## Regra de identidade
1. Retratos da equipe representam **pessoas reais**.
2. Avatares/bonecos do Agent Hub representam **agentes digitais**.
3. Nunca substituir um agente digital por foto humana nem apresentar uma pessoa como se fosse um agente.
4. Usar retratos em contexto de responsabilidade humana: perfil, equipe responsável, sala da equipe, agenda e gate humano.
5. Preservar responsividade, contraste e identidade azul-marinho + azul institucional + branco + amarelo.

## Candidatas
### Gestor do Projeto
`preview/gestor-team-identity-v1-candidate-20261005/`
- Novo painel **Equipe Humana • Identidade Operacional** dentro de Agentes & Automações.
- Mantém os avatares digitais do Agent Hub separados.

### Central
`preview/central-team-identity-v1-candidate-20261005/`
- Rogério personifica o perfil de Diretoria no cabeçalho.
- Rogério/Éder/Gabrielly/Fabrício aparecem na Sala da Equipe.
- Agenda adiciona miniavatares somente quando o nome do responsável é reconhecido.
- Éder aparece visualmente nas páginas Éder • Agora/Admin Técnico e Rogério no acesso Diretor.

## Proteção antirregressão
- Gestor oficial `gestor-projeto/`: **inalterado** nesta candidata.
- Central oficial `production/central-homologada-exec-r9-20261004/`: **inalterada** nesta candidata.
- Promoção somente após validação em notebook + celular.
- Rollback de referência pré-implementação: `checkpoint-before-team-identity-v1-20261005`.

## Próximo gate
Rogério valida visualmente as duas candidatas. Depois da aprovação explícita, promover a identidade aos caminhos oficiais mantendo os links estáveis e registrar novo checkpoint/congelamento.
