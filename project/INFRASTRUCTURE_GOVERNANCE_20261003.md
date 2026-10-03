# CONSTRU-REI — Governança de Infraestrutura e Documentação

Data-base: 03/10/2026

## Princípio
O Gestor do Projeto é a camada do proprietário/desenvolvedor. A Central é a camada operacional da equipe. Infraestrutura, arquitetura, hospedagens, branches, checkpoints, backups, Cofre Zero, incidentes, releases e saúde técnica pertencem ao Gestor.

## Segurança de acesso
O Gestor pode informar conta, provedor, plano, saúde, projeto, URL administrativa, localização lógica de segredo e última validação. **Nunca** deve gravar em HTML/JSON público o valor de senha, token, service-role, chave privada ou credencial. O repositório principal é público; portanto segredos ficam no cofre/provedor apropriado e o Gestor mostra somente metadados.

## Central — documentação que permanece
- APP operacional e uso pela equipe.
- Dashboards operacionais/gerenciais disponibilizados à equipe.
- F00–F09 e suas regras de operação.
- Links e acessos operacionais.
- Manuais, instruções e referência necessários a Gabriele, Éder e Fabrício.

## Gestor — documentação que passa a ser dona
- Infraestrutura e arquitetura técnica.
- Supabase, GitHub, Netlify, Vercel, storage, banco e hospedagens.
- Planos, quotas, limites, custos e saúde técnica.
- Branches, commits, checkpoints, candidatas, homologações e releases.
- Cofre Zero, backup, restore, checksums, continuidade e incidentes.
- Notebook Rogerio-2022, conectores e dependências locais.
- Pendências e decisões de engenharia.
- Secrets apenas por metadados; nunca o conteúdo.

## Auditoria de 03/10/2026
- Supabase CONSTRU-REI: ACTIVE_HEALTHY, 157 tabelas public, 330 Edge Functions ativas.
- GitHub: 2 repositórios visíveis na conexão; principal público e dashboard candidato privado.
- Netlify: time Free, 7 sites CONSTRU-REI, MFA não exigido no time.
- Vercel: 1 time conectado e 0 projetos.
- Notebook Rogerio-2022: online via Desktop Commander.
- Cofre Zero: presente e RESTORE_PROVEN=TRUE em 26/09/2026.
- Backup diário: FALHA em 01/10, 02/10 e 03/10 porque o Supabase CLI tentou usar Docker e a engine não estava disponível.
- Google Drive e remote S3 responderam antes da falha do dump na tentativa de 03/10.
- Backup semanal das Edge Functions: instalação registrada para domingo 04:30, porém execução ainda não comprovada pelos marcadores/logs auditados.

## Regra de migração da Central
A Central canônica não será alterada destrutivamente. Conteúdo de desenvolvimento deve ser primeiro absorvido pelo Gestor; a retirada/redirect da Central ocorre em candidata isolada e só é promovida após validação. Isso evita regressão e mantém a equipe sem dependência da camada de desenvolvimento.

## Critério de pronto da infraestrutura
A gestão de infraestrutura estará completa quando o Gestor conseguir responder, sem memória humana: onde cada componente está hospedado, quem é a fonte de verdade, saúde atual, plano, quota/limite, custo quando disponível, última atualização, backup/restore, dependências, risco e próximo passo.
