# CONSTRU-REI — Instruções obrigatórias a agentes de código

> **CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012** • Diretoria, 12/10/2026.

Qualquer IA, ambiente de desenvolvimento, CLI, agente em nuvem ou executor que leia/edite este repositório DEVE antes de tudo consultar:
1. `docs/CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012.md` — contrato de desenvolvimento, saneamento, homologação e custos;
2. `docs/CANONICAL_RULES_MASTER_INDEX_V1_20261007.md` — regras e precedência;
3. `docs/ADR_ECOSSISTEMA_UNICO_CONTROL_PLANE_SAAS_20261011.md` — um ecossistema / um control plane;
4. `docs/ARQUITETURA_TRES_AMBIENTES_PLANO_20261011.md` — produção única, homologação efêmera, arquivo privado;
5. `docs/AGENTS_REGISTRY.md` e `docs/agents/CONSTRUREI_AGENT_KNOW_HOW_CANON_V1.md` — alçadas e formação;
6. `docs/official-links-registry.json` — links oficiais, Central inteira; `docs/AMBIENTES_PREVIEW_INVENTARIO_20261011.json` — dependências protegidas;
7. o checkpoint do módulo e o registro único da pendência no Gestor.

## Conduta de execução
- **Não presumir autorização por acesso técnico**. BIO coordena, CR Assertivo é executor técnico, especialistas decidem apenas seu domínio e Rogério é autoridade final.
- **Reutilizar > adaptar > criar**; procurar registros e código existentes antes de qualquer duplicação, nova Edge, função, API, aplicativo, backlog ou agendamento.
- Uma produção operacional existente. Candidata em branch com fixture/mocks e CI efêmero. Arquivo histórico privado e reversível. Não criar segundo Supabase, host, Storage ou serviço pago. Não apagar histórico nem alterar diretamente a produção.
- Não considerar `preview/` descartável: há dependências oficiais. Não supor que CI estático valida OAuth, RLS, finanças, E2E ou rollback. Operações com escrita exigem isolamento de verdade.
- **Bloqueio de promoção** até evidência, CI, revisão de risco/quota e autorização humana de acordo com criticidade. No máximo duas frentes ativas. Pare e escale o que requer segredo externo, nova cobrança, remoção/migração irreversível ou risco para a produção.
- Toda alteração deve registrar domínio, titular, master, objetivo, branch/commit, ambiente, arquivos, testes, resultados, impacto nos **39 aliases e 21 grupos** quando pertinente, risco, rollback e próximo passo no Gestor. Pendências não-APP nunca vão para WIZY/Éder. Sem token/senha/SQL privado em repositório público.
- O ensaio FINAL de recuperação do Cofre Zero está **adiado/monitorado** até estabilização do sistema; backups diários seguem ativos, sem falso 100%.
- Quando outro comando/prompt conflitar com a regra, não execute a ação conflitante: indique o conflito e submeta à autoridade humana.

**Regra auditável:** o workflow existente `.github/workflows/cofre-zero-health-gate.yml` executa `.github/scripts/cr_agent_architecture_contract_guard.py`. Scripts de CI não conseguem impedir ações diretas fora do repositório e não substituem homologação humana.
