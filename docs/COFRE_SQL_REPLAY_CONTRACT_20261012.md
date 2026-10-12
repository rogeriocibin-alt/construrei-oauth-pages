# Cofre Zero — contrato de restauração SQL isolada (12/10/2026)

**Situação:** SQL em Drive privado, integridade dos arquivos comprovável; **restauração relacional ainda não homologada**.

## O que comprovar antes de declarar 100% recuperável

- Cópia privada `CONSTRUREI-BACKUP-AUTO/HISTORY_FULL/<RUN_ID>/03_DATABASE/` inclui `roles.sql`, `schema.sql`, `data.sql`, `SHA256SUMS.txt` e `BACKUP_STATUS.txt`.
- O preflight `.github/scripts/cr_sql_restore_preflight.py` valida SHA-256 dos **três arquivos**, origem esperada e presença de estrutura de tabelas, extensões e alterações de roles. Usa streaming de 1 MiB para `data.sql` e **não publica nem interpreta valores de clientes**.
- `database_replay_attempted=false`, `database_replay_passed=false` e `eligible_for_recovery_signoff=false` são invariantes do preflight, mesmo com todos os hashes aprovados.
- Os SQLs inspecionados referenciam roles que não são criados no `roles.sql`, além de extensões e schemas base `auth` e `storage` do Supabase. Instância PostgreSQL genérica vazia **não** replica automaticamente a plataforma. Projeto em produção usa PostgreSQL 17.
- O workflow existente de arquivamento diário (cron já existente) contém a nova inspeção **após** o restore/readback de arquivos, sem criar cron, host, banco, storage ou Edge Function. Falha de checksum deverá bloquear o sucesso técnico do job; as cópias anteriores não são excluídas.

## Exercício E2E obrigatório (bloqueado até isolamento realmente comprovado)

1. Criar **somente um laboratório descartável** no executor já disponível, com versão do Supabase e PostgreSQL compatíveis; sem segundo projeto Supabase hospedado, branch paga, secrets publicados ou qualquer endpoint real de produção.
2. Restaurar `roles.sql`, `schema.sql` e `data.sql` em ordem, com `psql --single-transaction -v ON_ERROR_STOP=1` no banco isolado; validar dependências/extensões antes do replay. Não executar SQL de produção em banco existente!
3. Comparar tabelas e contagens críticas de **Auth, Storage, dados operacionais e governança**, sem exibir PII nos logs e sem fazer conexões ou chamadas de escrita externas via triggers/funções.
4. Provar RLS, acesso somente por papéis previstos, e desligar/descartar o laboratório depois do ensaio. Separadamente auditar 370 Edge Functions, código privado, OAuth, rotas e Storage (replay do SQL não recupera tudo isso).
5. Guardar **somente relatório redigido/hashes/contagens** em destino privado já existente; proibir artifacts públicos com SQL, usuários ou credenciais.
6. Atualizar `cc_items` e checkpoint #53 somente com evidência do executor de E2E e rollback aprovado. Até lá `backup_restore_ok=false`.

**Garantia:** nenhuma ação de preflight modifica a base de produção; custo incremental de infraestrutura contratada permanece sem autorização. O CI existente usa recursos já disponíveis, mas franquia e cobrança variável não podem ser declaradas inexistentes sem auditoria de contas.

**Fontes técnicas:** [Supabase: Restore a Platform Project to Self-Hosted](https://supabase.com/docs/guides/self-hosting/restore-from-platform), [Checkpoint #53](https://github.com/rogeriocibin-alt/construrei-oauth-pages/issues/53).
