# CONSTRU-REI — Cofre Zero / Proteção do Patrimônio Digital
**Checkpoint 2026-10-11, somente evidência, nenhum segredo.**

## Camadas comprovadas
1. Supabase DB + Storage: Cloud Run/Scheduler diário 03:00 BRT, sem notebook. Pacote CURRENT 20261011-060021: 3 SQL, 4.526 arquivos Storage; manifest SHA256. Link: https://drive.google.com/drive/folders/1C5q2whrJpUFsKZFrgSlSLK0stisKkeg4
2. GitHub PRINCIPAL: backup Git bundle integral (todas as refs disponíveis), obtido por job Actions 38145087751, Git bundle verify + rclone check + download/cmp OK; pacote 6.465.534 bytes; hash SHA256 7bd3352d4c3f74d49c6297dbd664afd0c3306e0e6a0736846db6ca61ac9905ab; pacote em https://drive.google.com/drive/folders/1ubTvosjWU8-jpjPLaeSDkukp8SEMn4lG.
3. Rotina semanal espelho Git (domingo 06:37 UTC) entrou no main via PR #44 commit 77ad27e26702bd7fe1e3d8857e5cf033a6e4b301, workflow .github/workflows/cofre-zero-git-offsite.yml. Não altera rotina diária, APP, Central, Finanças ou dados em produção.
4. GitHub PRIVADO (dashboard-v4-candidate): 47 arquivos-fonte do HEAD 9d244e76e9e292e753ea126bbc70fe6d146c2139 preservados em 4 documentos JSON privados, com leitura de volta 4/4 PASS: https://drive.google.com/drive/folders/1ehjnSih9EmxQtpQW54_WrXuFcEMJGGkR. NÃO é espelho Git de todas as branches e histórico.
5. Netlify: metadados de 7 sites preservados e readback 7/7 OK no documento privado https://docs.google.com/document/d/1fOBiYPqB0kuj3FiYcAAwvgoL67XZV8c3z4wPFApPcwg/edit. NÃO é cópia independente dos binários e configurações dos deploys.
6. Edge Functions: inventário 366, baseline 338 diretórios/339 arquivos, 37 pacotes complementares 28 novos+9 alterados exportados 10/10 no Drive privado. Auditoria SHA independente foi iniciada pelo workflow candidato .github/workflows/cofre-zero-edge-integrity.yml; prova de checksum SHA-256 339/339 registrada na execução 38145379810, mas relatório inicialmente falhou por tentativa rclone check arquivo-a-arquivo; hotfix 621397f96a0477d0d9d0563b6376a00f7b409e7c mudou para copyto+cmp, deve terminar e receber readback antes de homologar.

## Lacunas de recuperação integral — manter pendência em andamento
- GH_PRIVATE bundle completo não gerado: segredo de leitura mínima `COFRE_GITHUB_READ_TOKEN` ausente no Actions. Configurar sem enviar token no chat; a rotina reconhece e fará backup privado após configuração.
- 7 Netlify: exportar e testar recuperação independente de arquivos publicados, configurações e referências, via credenciais autorizadas (não presentes no conector), sem mudar políticas de acesso.
- Edge: confirmar arquivo do resultado de checksum, testar recuperação executável completa e garantir captura incremental permanente 366.
- Ensaiar restauração **completa isolada** de Banco/Storage/Git/Edge/Netlify em ambiente sem efeitos na produção; último teste abrangente documentado em 05/10.
- Não chamar esta etapa de HOMOLOGADA 100%, não inventar custo ou segredos.

## Governança e rollback
- Gestor mestre `public.cc_items.EXEC-COFRE-COVERAGE-20261010` continua Em andamento (P1), backup_restore_ok=false. `EXEC-BACKUP-AUTO-20261006` continua Concluído 5/5 e não deve ser reaberto.
- Toda alteração aqui foi additiva; não houve deploy/destruição, nem alteração de endpoints, acesso de sites, RLS ou bancos financeiros.
- Em eventual rollback de workflow semanal, reverter apenas o arquivo .github/workflows/cofre-zero-git-offsite.yml para o commit anterior; preservar backups privados e o fluxo diário.
