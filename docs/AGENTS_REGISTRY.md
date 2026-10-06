# CONSTRU-REI — REGISTRO CANÔNICO DE AGENTES

Atualização: 06/10/2026
Versão: **AGENT-HUB-V1 — OFICIAL / HOMOLOGADO**

| Agente | Papel | Alçada | Estado atual | Escalonamento |
|---|---|---|---|---|
| Rogério / Diretoria Master | Autoridade humana | 100 | OFICIAL | — |
| BIO | Orquestrador Mestre | 90 | CANÔNICO / ACTIVE | Rogério |
| CR Assertivo | Executor Técnico | 70 | CANÔNICO / ACTIVE | BIO / Rogério |
| BIO Gestor | Inteligência Gerencial | 60 | CANÔNICO / ACTIVE / READ_ONLY | BIO |
| Infra REI | Continuidade | 50 | REGISTRADO / ONBOARDING | CR Assertivo |
| ORÇA-REI | Orçamento F02 | 45 | CANDIDATO / R6 | BIO Gestor |
| Financeiro REI | Financeiro | 40 | CANÔNICO / ACTIVE / HOMOLOGADO | Rogério / Diretoria Master |
| Gabi Flow | Atendimento / Triagem | 35 | REGISTRADO / ONBOARDING | BIO Gestor |

## Motores e automação
Estes itens **não são agentes CONSTRU-REI**:
- n8n: automação/integração;
- Flowise: plataforma/fábrica de fluxos/agentes;
- OpenClaw: runtime/plataforma de agente;
- OpenAI/modelos: motor de IA.

## Regra visual
Toda ação exposta ao usuário deve mostrar:
**avatar/boneco + agente + função + ação + estado + cadeia de handoff quando existir**.

## Regra de onboarding
Todos os agentes devem estudar e ser testados contra:
`docs/agents/CONSTRUREI_AGENT_KNOW_HOW_CANON_V1.md`

Cadastro não equivale a homologação.

## Agent Hub V1 — homologação
- Módulo de governança: **OFICIAL / HOMOLOGADO / CONGELADO**.
- Build base do Gestor: `CR-PM-V1.2-AGENT-HUB-V1-OFFICIAL-20261005`.
- A homologação do Hub **não altera automaticamente o estado individual dos agentes**.
- ORÇA-REI continua candidato e Gabi Flow / Infra REI continuam em onboarding até prova específica.

## Financeiro REI V1 — homologação e titularidade — 06/10/2026
- Estado: **CANÔNICO / ACTIVE / HOMOLOGADO**.
- Build: `CR-FINANCEIRO-REI-V1-OFFICIAL-20261006`.
- Gestor humano direto: **Rogério / Diretoria Master**.
- Manual de especialidade: `docs/agents/FINANCEIRO_REI_V1.md`.
- Roteamento automático: toda intenção predominantemente financeira vai para Financeiro REI.
- BIO: classifica/roteia/consolida; **não executa a especialidade financeira**.
- CR Assertivo: executa camada técnica somente após handoff; **não define nem altera regra financeira**.
- Ágata não integra mais a equipe ativa e não possui responsabilidade, aprovação ou alçada atual.
- Registro histórico anterior permanece apenas como evidência quando aplicável.
