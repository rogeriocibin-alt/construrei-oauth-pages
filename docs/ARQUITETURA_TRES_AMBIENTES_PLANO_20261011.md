# CONSTRU-REI — Plano de separação de ambientes (produção / homologação / arquivo)
**Data:** 11/10/2026  
**Responsável pela governança:** Gestor do Projeto CONSTRU-REI  
**Fase atual:** 0 — inventário e análise, **sem transferência nem exclusão**.

## Resultado esperado
Um só Gestor acessível no celular, com três estados identificáveis por ativo:
- **PRODUÇÃO:** somente versões realmente homologadas e links oficiais. Não modificar o runtime ou publicar nova versão sem teste e checkpoint.
- **HOMOLOGAÇÃO:** experimentos e versões candidatas isolados da produção. É proibido testar com credenciais privilegiadas expostas no frontend ou tratar arquivos em `main/preview/` como isolamento verdadeiro.
- **ARQUIVO:** checkpoints, versões substituídas e evidências preservadas com manifesto, hash e recuperação testada, sem servirem como aplicação de produção.

**Princípio-chave:** preservar o histórico não exige publicá-lo junto com a aplicação. Isolar por acesso, deploy e responsabilidade — e não apenas por nome de pasta. Ninguém apaga ou faz force-push como atalho.

## Estado conhecido e linha de base
- Repositório principal: `rogeriocibin-alt/construrei-oauth-pages`, branch `main`; 795 arquivos (blobs) e 30.601.092 bytes lógicos na árvore inspecionada em 11/10/2026.
- `preview/`: 355 arquivos, 22.656.682 bytes (**74,04%** do volume lógico da árvore), distribuídos em 121 subpastas.
- A medição dos conteúdos idênticos entre caminhos aponta cerca de 5,05 MB de repetições lógicas; Git pode deduplicar objetos idênticos, portanto **não** projetar redução física de disco proporcional.
- Os aproximadamente 2 GB de Storage Supabase são escopo operacional separado e não devem ser confundidos com prévias Git.
- Governança do Cofre Zero já integrada pelo PR #50: `gestor-projeto/cofre-mobile/cofre-governance-v1.json` + guard diário.
- Pendências de integridade: restauração integral Trello/anexos, restauração SQL executada em instância descartável; seis projetos Netlify sem deploy publicado recuperável. **Não declarar backup 100%.**

## Execução em etapas — no máximo 2 frentes simultâneas

### Etapa 1 — Inventário automatizado, somente leitura (esta candidata)
- Gerar relatório reproduzível de volume, agrupamento de caminhos, conteúdos idênticos e referências explícitas a `preview/` encontradas em áreas de operação.
- Inventariar links, roteadores, GitHub Pages, PWA/service workers, arquivos publicados, recursos OAuth e integrações F00–F09.
- Classificar cada pasta em `PRODUCTION`, `HOMOLOGATION_CANDIDATE`, `ARCHIVE_CANDIDATE` ou `UNREVIEWED`. **Nunca converter "antigo" automaticamente em "descartável".**
- Critério de saída: relatório de conflitos e lista de dependências revisados, sem arquivos removidos.

### Etapa 2 — Homologação realmente isolada
- Criar a publicação de teste separada e, onde necessário, com acesso autenticado; não depender da pasta `preview/` estar na própria `main`.
- Usar branch candidata e artefato imutável identificados por commit; credenciais de produção não entram na candidata.
- Tests: endpoints, UX notebook/celular, navegação/voltar, avatares/identidade, integração e travas de regressão; só promover **o commit validado**.
- Critério de saída: preview acessível sem afetar produção, com rollback e prova de que nenhum roteamento oficial aponta para candidato.

### Etapa 3 — Arquivo recuperável e segmentação da publicação
- Criar acervo externo privado com manifesto, checksums e restauração isolada, vinculado ao Gestor.
- Migrar em lotes somente caminhos classificados e sem referência operacional; registrar origem, destino e estado de recuperação.
- Não mover arquivos fisicamente enquanto páginas ou scripts oficiais dependerem dos links atuais.
- Publicar a partir de allowlist/artefato de produção **somente após** validar como GitHub Pages é construído e testar troca/rollback. Manter a regra canônica e os links homologados.
- Critério de saída: produção enxuta; candidatos não servidos pelo site oficial; acervo restaurável, auditado.

### Etapa 4 — Eficiência/retenção baseada em medidas
- Reutilizar componentes compartilhados e evitar novos snapshots completos para cada pequena edição.
- Medir tamanho da publicação, espaço realmente cobrado, consumo de CI/CD, Storage, custos e tempo de restauração **antes/depois**.
- Definir e testar retenção de backup com proteção da última cópia válida. Só então propor limpeza, sem eliminar evidências necessárias.

## Travas obrigatórias
1. Nunca alterar ou substituir Central, Gestor, Financeiro e módulos homologados sem validação específica e rollback.
2. Não mover, excluir, reescrever histórico Git, alterar Secrets ou expor tokens automaticamente.
3. Inventário com referência a `preview/` em caminhos de operação gera alerta explícito; não aplicar mudanças às cegas.
4. Distinção entre **pronto**, **em homologação** e **legado** deve ser registrada no Gestor e no relatório.
5. Toda etapa deixa commit, teste, checkpoint e lacunas declaradas. Um PR aprovado não significa que a separação física já foi realizada.
6. Projetos externos GitHub, Supabase, Cloud Run e Netlify continuam serviços separados, coordenados no Gestor. Unificação de controle não é concentrar tudo num único servidor.

## Operação pelo celular / continuidade entre voz e chat
O trabalho técnico pode ser solicitado **neste mesmo chat por escrito** após encerrar a voz. O assistente executa quando a solicitação é processada e há conectores/autorização. **Não existe execução contínua do assistente após a conversa encerrar**, salvo as rotinas na nuvem já agendadas ou tarefas futuras agendadas explicitamente.

## Provas exigidas para considerar a arquitetura concluída
- [ ] Inventário automatizado no CI e lista de referências críticas.
- [ ] Homologação em ambiente independente, sem tocar produção.
- [ ] Acervo com checksum e restauração isolada.
- [ ] Publicação de produção restrita ao conjunto oficial.
- [ ] Teste de rollback e navegação no celular/notebook.
- [ ] Relatório de redução física real, sem confundir tamanho lógico com armazenamento faturado.
- [ ] Cofre Zero: Trello integral e SQL recuperados e testados separadamente.

**Decisão de risco:** esta fase é somente leitura e documentação. Nenhum dado foi excluído por este plano.
