# CONSTRU-REI — Homologação do Backup Automático e Restore Drill

Data: 05/10/2026

## Status

**HOMOLOGADO / AUTOMÁTICO / RESTAURAÇÃO TESTADA**

## Backup comprovado

- Execução: `DAILY_20261005-145033`
- Banco: `roles.sql`, `schema.sql`, `data.sql`
- Google Drive: `CONSTRUREI-BACKUP-AUTO/CURRENT`
- Validação do conjunto no Drive: **4.532 arquivos correspondentes / 0 diferenças**
- Storage físico: **4.526 arquivos restaurados / 0 diferenças**
- Cofre Zero: preservado
- Produção: não alterada

## Restore drill

Restauração executada em ambiente isolado e descartável.

- `cr_internal`: 6.265 linhas
- `public`: 8.700 linhas
- `public.cr_f00_cases`: 17
- `public.cc_documents`: 8
- `public.cr_incremental_checkpoints_v1`: 33
- `cr_internal.cofre_zero_backup_items`: 4.505
- `public.triage_audit`: 4.119

O schema `auth` possuía 26 tabelas e 0 registros no dump. Diferenças estruturais de `auth` e `storage` encontradas no laboratório são de componentes gerenciados da imagem Supabase local, não perda de dados da aplicação. O conteúdo físico do Storage foi recuperado integralmente do Google Drive.

## Automação oficial

Tarefa canônica: **CONSTRUREI - Backup Automatico**

- Horário: diariamente às 03:00
- Ação: `C:\CONSTRUREI-BACKUP-AUTO\SCRIPTS\daily-safe.ps1`
- Privilégio: Highest
- StartWhenAvailable: true
- WakeToRun: true
- Permitido em bateria
- MultipleInstances: IgnoreNew
- Proteção adicional: `backup.lock`
- Último resultado de consolidação: 0
- Tarefa duplicada `CONSTRUREI - Backup Diario`: desativada

## Regra operacional

Não há tarefa diária manual para o proprietário. O Windows executa a rotina automaticamente. Se o computador estiver desligado no horário programado, a tarefa executará quando o equipamento voltar a ficar disponível.

## Evidências locais

- `C:\CONSTRUREI-BACKUP-AUTO\LOGS\daily-20261005-145033.log`
- `C:\CONSTRUREI-BACKUP-AUTO\LOGS\RESTORE_DRILL_20261005_PROOF.txt`
- `C:\CONSTRUREI-BACKUP-AUTO\LAST_SUCCESS_DIARIO.txt`
- checkpoints: `C:\CONSTRUREI-BACKUP-AUTO\SCRIPTS\checkpoint-20261005\`

## Conclusão

O backup local + Google Drive está **automatizado, validado e restaurável** dentro do escopo testado.
