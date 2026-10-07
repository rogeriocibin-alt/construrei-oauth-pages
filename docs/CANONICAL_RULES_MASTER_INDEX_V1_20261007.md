# CONSTRU-REI — ÍNDICE MESTRE DE REGRAS CANÔNICAS V1

**Data:** 07/10/2026  
**Estado:** CANDIDATA DE GOVERNANÇA — não altera produtos operacionais  
**Responsável humano:** Rogério / Diretoria Master  
**Fonte de consulta:** Gestor do Projeto → Regras Canônicas

## 1. Finalidade

Este índice é a porta de entrada única para regras, guardrails, parâmetros fundamentais e documentos canônicos da CONSTRU-REI. Ele não duplica toda a documentação: aponta a fonte correta, registra vigência e define qual regra prevalece quando houver conflito.

Objetivos:
- impedir regressões por memória parcial;
- reduzir dubiedade entre BIO, CR Assertivo e agentes especializados;
- preservar decisões validadas;
- separar regra vigente de histórico;
- permitir consulta rápida por domínio, criticidade e status;
- manter continuidade entre voz, texto, notebook e celular.

## 2. Regra de precedência

Quando duas fontes divergirem, aplicar esta ordem:

1. **Decisão explícita mais recente de Rogério / Diretoria Master**, desde que registrada.
2. **Regra canônica vigente e não revogada** no Índice Mestre.
3. **Checkpoint/release homologado mais recente** do produto afetado.
4. **Manual canônico específico do domínio/agente**.
5. **Preferência operacional** ainda não elevada a regra canônica.
6. **Histórico, candidata antiga, documento retirado ou substituído** — serve apenas como evidência; nunca prevalece.

### Regra de revogação
Um aviso explícito de **RETIRADO / NÃO UTILIZAR / SUBSTITUÍDO** prevalece sobre qualquer texto antigo no mesmo documento que diga “oficial”, “homologado” ou equivalente. A leitura deve considerar primeiro o estado de vigência atual.

## 3. Classes de regra

- **FUNDAMENTAL:** freio/contrapeso do projeto; não pode ser ignorado por agente ou implementação.
- **OBRIGATÓRIA:** regra operacional/de desenvolvimento vigente.
- **DOMÍNIO:** válida em uma especialidade (financeiro, orçamento, identidade, agenda etc.).
- **PREFERÊNCIA:** padrão desejado, mas não deve ser tratado como imutável.
- **REVOGADA/HISTÓRICA:** preservada para auditoria; proibido reativar por engano.

## 4. Regras fundamentais vigentes

### GOV-001 — Fonte única de governança
**Classe:** FUNDAMENTAL  
**Domínio:** Governança  
O **Gestor do Projeto** é o radar mestre e a fonte única de verdade de pendências, governança, versões, decisões, checkpoints e desenvolvimento. Superfícies operacionais podem projetar recortes, mas não criar uma segunda verdade.

### GOV-002 — Máximo de duas frentes ativas
**Classe:** FUNDAMENTAL  
**Domínio:** Execução  
Máximo de **2 frentes em execução simultaneamente**. Ideias, melhorias e demandas permanecem em fila até existir capacidade real.

### GOV-003 — Candidata não é canônica
**Classe:** FUNDAMENTAL  
**Domínio:** Desenvolvimento  
Toda evolução parte de baseline/checkpoint seguro e ocorre em **candidata isolada**. Nenhuma candidata substitui a versão oficial sem validação e promoção explícita.

### GOV-004 — Antirregressão
**Classe:** FUNDAMENTAL  
**Domínio:** Desenvolvimento  
Não alterar lógica, roteamento, identidade, dados ou integrações homologadas fora do escopo da tarefa. Recuperação de uma parte antiga não autoriza promover uma versão antiga inteira.

### GOV-005 — Evidência para concluir
**Classe:** OBRIGATÓRIA  
**Domínio:** Entrega  
Uma entrega só é considerada concluída quando houver: objetivo cumprido, teste aplicável, versão/checkpoint e decisão registrada.

### GOV-006 — Histórico preservado
**Classe:** FUNDAMENTAL  
**Domínio:** Continuidade  
Versões substituídas, regressões e recuperações permanecem rastreáveis. Histórico não é apagado para “simplificar” o estado atual.

### CONT-001 — Checkpoint de continuidade
**Classe:** FUNDAMENTAL  
**Domínio:** Continuidade  
Durante trabalho ativo, registrar checkpoint aproximadamente a cada **10 minutos de conversa por voz ou texto**, e também antes de pausa relevante ou troca de dispositivo quando possível. Cada checkpoint deve registrar:
- estado atual;
- decisões tomadas;
- última ação concluída;
- próxima ação;
- bloqueios/dependências;
- branch/commit/checkpoint quando houver código.

### CONT-002 — Independência de dispositivo
**Classe:** FUNDAMENTAL  
**Domínio:** Arquitetura  
A continuidade do projeto não pode depender de um notebook específico para existir. Dependências locais devem ser reduzidas, explicitadas e ter alternativa/recuperação quando tecnicamente possível.

### PEND-001 — Banco Mestre de pendências
**Classe:** FUNDAMENTAL  
**Domínio:** Pendências  
Toda nova pendência entra primeiro no **Gestor do Projeto**. APP • Pendências, WIZY e Éder são projeções operacionais exclusivas do escopo APP/F00–F09/WIZY e não podem receber itens de Central, financeiro independente, infraestrutura, documentação ou governança.

### AUD-001 — Auditoria por baseline + delta
**Classe:** FUNDAMENTAL  
**Domínio:** Auditoria  
Auditorias históricas grandes viram baselines reutilizáveis. Antes de repetir varredura total, consultar a baseline e auditar apenas delta/exceções, salvo justificativa técnica.

### AGT-001 — Alçadas e roteamento
**Classe:** FUNDAMENTAL  
**Domínio:** Agentes  
BIO orquestra; CR Assertivo executa camada técnica; agentes especializados executam sua especialidade. Um agente não deve assumir a alçada de outro. O registro canônico de agentes define titularidade e escalonamento.

### FIN-001 — Titularidade financeira
**Classe:** DOMÍNIO / OBRIGATÓRIA  
**Domínio:** Financeiro  
Financeiro REI é o agente titular para assuntos financeiros. BIO classifica/roteia; CR Assertivo só atua tecnicamente após handoff e não cria regra financeira.

### ID-001 — Identidade humana
**Classe:** DOMÍNIO / OBRIGATÓRIA  
**Domínio:** Identidade  
Pessoa real representada = retrato + nome + função. Agente digital mantém avatar próprio. A fonte canônica humana é o registro de equipe vigente; não duplicar retratos por produto.

### ID-002 — Ativo visual revogado não volta
**Classe:** FUNDAMENTAL  
**Domínio:** Identidade / Antirregressão  
Documentos/ativos marcados como **RETIRADO / NÃO UTILIZAR** não podem ser reativados, mesmo que contenham no corpo um fechamento antigo de “homologado”.

## 5. Documentos-fonte indexados

| Domínio | Documento | Estado |
|---|---|---|
| Estado geral | `docs/CONSTRUREI_CURRENT_STATE.md` | referência viva de continuidade |
| Agentes | `docs/AGENTS_REGISTRY.md` | vigente |
| Identidade humana | `docs/HUMAN_IDENTITY_CANON_V1_20261006.md` | vigente |
| Identidade visual V1 | `docs/CHECKPOINT_BRAND_CANONICAL_V1_20261006.md` | **RETIRADO / NÃO UTILIZAR** |
| Pendências | `gestor-projeto/project-data.json` + Banco Mestre | vigente |
| Checkpoints | `docs/checkpoints/` e documentos CHECKPOINT_* | histórico/continuidade |
| GestãoClick PM26 | `docs/CHECKPOINT_PM26_GESTAOCLICK_MARCO_ZERO_20261007.md` | domínio financeiro/operacional, conforme estado próprio |
| Agenda | `docs/AGENDA_TEXT_TEMPLATES_CONSTRUREI_20261004.md` | padrão de texto |
| Input inteligente | `docs/INTELLIGENT_INPUT_PATTERN_V1_20261005.md` | padrão operacional |

## 6. Como criar ou mudar uma regra

Toda nova regra ou alteração canônica deve ter:
1. ID estável;
2. classe e domínio;
3. texto objetivo;
4. fonte/evidência;
5. data;
6. estado: proposta, vigente, substituída ou revogada;
7. impacto;
8. regra substituída, quando aplicável.

Não criar “regra sobre regra” sem declarar o que ela substitui.

## 7. Gate obrigatório antes de desenvolver

Antes de executar mudança técnica relevante:
1. identificar o produto/domínio;
2. consultar regras FUNDAMENTAIS;
3. consultar regras do domínio;
4. identificar baseline/checkpoint atual;
5. confirmar se há item revogado que possa contaminar a implementação;
6. executar somente em candidata isolada;
7. registrar checkpoint da sessão;
8. só promover após validação aplicável.

## 8. Checkpoint desta implantação

- Branch: `candidate/canonical-governance-index-20261007`
- Base: `main`
- Escopo: governança/documentação + visualização no Gestor.
- Produtos operacionais: **não alterados**.
- Próxima ação: integrar este índice à tela Cadeia Canônica/Regras Canônicas do Gestor e validar filtros/resumo.
