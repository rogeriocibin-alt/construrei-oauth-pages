# CONSTRU-REI — Contrato obrigatório de desenvolvimento e saneamento
**Data da decisão:** 12/10/2026 • **Estado:** diretriz de governança aprovada pela Diretoria; homologação de código/CI somente após teste; saneamento físico PENDENTE.

## 1. Precedência — não criar uma segunda arquitetura
Este contrato operacionaliza, sem revogar ou duplicar, o Índice Mestre `docs/CANONICAL_RULES_MASTER_INDEX_V1_20261007.md`, a ADR `docs/ADR_ECOSSISTEMA_UNICO_CONTROL_PLANE_SAAS_20261011.md`, o plano `docs/ARQUITETURA_TRES_AMBIENTES_PLANO_20261011.md`, o cadastro `docs/official-links-registry.json` e o Gestor do Projeto. Na dúvida, seguir a regra de precedência do Índice Mestre e escalar à Diretoria.

- **PRODUÇÃO**: somente sistemas homologados, já hospedados, com seus links oficiais intactos. Uma única produção operacional; não confundir fornecedores externos já existentes com servidores duplicados.
- **HOMOLOGAÇÃO**: branch/commit e CI efêmero, massa fictícia/sanitizada, isolamento verificado. Jamais escrita em produção para simular uma homologação; mocks não provam autenticação, finanças ou E2E.
- **ARQUIVO**: Git/commits/manifestos/Cofre Zero privado; preservar histórico, dependências, hashes e rollback; não hospedar segunda cópia permanente.
- **Custo e escala**: orçamento-alvo de R$ 0 incremental contratado. Não criar bancos, Supabase branches/projetos, Edge Functions duplicadas, host, domínio, workflow agendado, assinatura ou armazenamento adicional sem autorização específica após revisão do custo. Franquias existentes ainda podem sofrer consumo.
- **Gestor** é a fonte única de pendências, estado e decisões; GitHub docs/PR são evidências, não uma segunda lista de pendências. Operação e finanças conservam seus mestres próprios; Central não vira console de engenharia.

## 2. Contrato de ingresso de TODA IA/agente que desenvolva CONSTRU-REI
Qualquer IA interna (BIO, CR Assertivo, BIO Gestor, Infra REI, ORÇA-REI, Gabi Flow, Financeiro REI quando colaborar com desenvolvimento) ou ferramenta externa (Codex, Work, IDE/agent, automação, outro modelo) deve aplicar o contrato ANTES de propor, editar, testar, integrar ou publicar. A execução por uma IA não a autoriza a atuar fora da sua alçada.

**Checklist de entrada obrigatório**:
1. Identificar domínio, pessoa titular, registro mestre de pendência, escopo e aprovação, respeitando no máximo duas frentes ativas. Não registrar outra pendência se uma existente puder receber a ação.
2. Ler as fontes canônicas acima, o `docs/AGENTS_REGISTRY.md`, `docs/agents/CONSTRUREI_AGENT_KNOW_HOW_CANON_V1.md` e os checkpoints do produto. Identificar o último commit oficial e arquivos bloqueados; nunca inferir que `preview/` significa descartável.
3. Executar **BUSCAR → REUTILIZAR → ADAPTAR → CRIAR**. Registrar as alternativas existentes, duplicidade funcional ou técnica e por que criar algo novo seria necessário. Não clonar serviços ou agentes para contornar alçadas.
4. Abrir **branch candidata identificada** sobre a linha canônica. Toda entrega inclui diff restrito, teste estático/funcional aplicável, prova de isolamento, riscos/custo, versão, rota de retorno e estado de homologação.
5. Provar que cobre a **Central inteira** (39 aliases e 21 grupos) quando houver impacto transversal, e também APP/F00–F09, Gestor, financeiro, Trello, Cora, Click, Agenda, WIZY/Éder, checklist, Academy, apresentação, salas e páginas técnicas. Somente escopo explicitamente afetado precisa passar testes funcionais específicos; o restante exige proteção antirregressão.
6. Não promover candidatas sem CI e aceite humano quando relevante (celular/notebook se aplicável); fechamento/financeiro exige Financeiro REI. Escopos OAuth/credenciais/RLS/backend com escrita exigem provas de isolamento real, não testes em produção.
7. Após aceite e promoção autorizada, anexar evidência no único registro mestre no Gestor, referenciar PR/commit e checkpoint. APP/WIZY/Éder exibem somente projeção APP. Versionar rollback e estado do acervo.
8. Incidente, segredo não disponível, duplicidade de fonte, componente antigo ainda consumido, limite de quota ou ausência de isolamento: **BLOQUEAR COM EVIDÊNCIA**, não inventar PASS nem concluir por analogia.

Este documento deve ser consultado por qualquer executor; as rotinas CI verificam presença e conformidade de instruções no repositório, mas não têm como impor políticas a agentes externos desconectados, acessos de administrador fora de PR ou publicações feitas manualmente em fornecedores. Esses canais exigem revisão/auditoria administrativa.

## 3. Saneamento objetivo — progresso e lacunas
Inventários conhecidos, NÃO autorizações para excluir:
- **121 diretórios `preview/`**, com **12 classificados como dependências/proveniência protegidas** e **109 ainda `UNCLASSIFIED_REVIEW_ONLY`** em `docs/AMBIENTES_PREVIEW_INVENTARIO_20261011.json`. Há ainda cadeia Gabi v21→v20 identificada em auditoria transiente. Existência de conteúdo duplicado por SHA não garante arquivos redundantes em produção.
- **39 aliases oficiais / 21 grupos operacionais** sob guard estático PR #58; links e módulos não são sistemas independentes para contagem de infraestrutura.
- **370 Edge Functions** ativas em 12/10; fonte de código reconfirmada pelo Cofre Zero. A tabela histórica `cr_edge_dependency_matrix` tinha **92 slugs** (aproximadamente 15 ainda vivos e 77 históricos); **nenhum `can_remove=true`**. Faltam classificação read-only e eventual atualização da matriz para os demais sem concluir que `verify_jwt=false` é vulnerabilidade automaticamente. Não duplicar nem apagar.
- **Versões do Gestor com semântica não reconciliada**: referências `1.2.4`, `1.2.5.2` e `V1.2.7` podem ser runtime, pacote e snapshot diferentes. Diferenciar `release_publicado`, `build`, `conteudo`, `snapshot` e verificar URL real antes de alterar.
- **Duplicidade de mestres / sincronizações**: Gestor é mestre de pendências; Trello é fonte financeira operacional; Gestão Click é espelho/visão conforme domínio; Google Agenda fonte de eventos; arquivos JSON versionados são fallback, não concorrentes. Mapear autores, direção de escrita, idempotência, correção de conflitos e latência antes de desduplicar.
- **Cofre Zero**: backup automático segue em operação. Ensaio de reimplantação completa Edge/OAuth/APP/rollback **ADIADO e MONITORADO** até conclusão/estabilidade dos produtos, salvo risco crítico; `backup_restore_ok=false` até prova integral. Cron CAS 13/10 e Trello 18/10 demandam evento schedule real.
- **Retenção**: não apagar backups, Git, trechos `preview/`, sites Netlify nem Edge Functions para melhorar indicador. Só classificar `MANTER / REUTILIZAR / CONSOLIDAR CANDIDATA / ARQUIVAR QUANDO SEM CONSUMIDORES`; exclusão precisa de aprovação humana específica, prova de dependências, snapshot e rollback.

## 4. Homologações distintas (não confundir)
- **H-GOV / POLÍTICA:** diretriz da Diretoria aprovada, incorporada a documentação canônica; todo novo executor deve aderir.
- **H-CI / GUARDA:** script offline + workflow existente validam a presença/consistência do contrato e dos agentes; homologar somente com GitHub Actions PASS na PR e no main.
- **H-SAN / SANEAMENTO:** inventário seguro é prova parcial; 109 diretórios, versões e masters permanecem como pendência até classificação e homologação.
- **H-REL / ENTREGA DE APP:** prova funcional real, UI em celular/notebook e rollback exigidos separadamente antes de publicar.
- **H-DR / RECUPERAÇÃO INTEGRAL:** mantida `ADIADA_MONITORADA`, sem PASS fictício, com revisão por risco e retorno ao encerrar o produto.

## 5. Controles permanentes
Checkpoints a cada ~10 minutos de trabalho ativo e antes de troca de dispositivo, sem presumir execução assíncrona da conversa. Apenas jobs existentes executam sem chat. Alterações de produção com efeitos externos, custo ou destruição exigem autorização expressa. Não incrementar número de frentes ativas para governança documental. Verificação de CI é controle de código, NÃO prova de isolamento físico, disponibilidade de serviço, credenciais de terceiros ou segurança das 370 APIs.

**Radar canônico:** Gestor `public.cc_items`; evidência e decisões no issue GitHub #53. Saneamento financeiro Gestão Click mantém `PM-26` independente e pertence ao Financeiro REI; não colapsá-lo na organização geral de arquivos.
