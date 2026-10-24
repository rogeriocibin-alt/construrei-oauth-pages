# Cofre Zero — lacunas de recuperação verificadas (24/10/2026)

## Evidências observadas na main
- `.github/workflows/cofre-zero-history-full.yml`: cron `47 8 * * *`, CAS histórico e preflight SHA256. O próprio workflow escreve **SQL RESTORE NOT HOMOLOGATED** e valida `sql_restore_attempted == false`.
- `.github/workflows/cofre-zero-trello-offsite.yml`: teste de restauração independente aprovado no run 40051773338; incremento Trello foi skipped nesse run.
- `.github/workflows/construrei-cloud-backup.yml`: workflow_dispatch, dump PG17 e verificação de hashes/arquivos; `RESTORE_DRILL=PASS` indica readback de arquivos, **não replay SQL em PG17**.
- Supabase projeto yspuaamokjbrosytqjpg ativo e PostgreSQL 17; inventários de migrações e Edge disponíveis, mas não constituem backup restaurável completo.

## Gate de homologação ainda não atendido
1. Restaurar backup SQL real em PostgreSQL 17 isolado, registrar saída de psql/pg_restore, contagens e integridade, sem dados em artifacts públicos.
2. Comprovar recuperação Auth, Storage (objetos e permissões), Edge, OAuth e configuração operacional.
3. Demonstrar bootstrap de Central, Gestor, Dashboard e APP a partir dos artefatos preservados.
4. Comprovar scheduler, retenção, armazenamento, custo real, RPO e RTO medidos.
5. Atualizar registros operacionais e issue #53 com links para evidências.

**Status: NÃO HOMOLOGADO INTEGRALMENTE.** Não alterar produção nem promover candidata sem testes e autorização de custo.
