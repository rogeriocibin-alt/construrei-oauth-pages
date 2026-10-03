# CR Assertivo — Contrato de Execução do Gestor do Projeto CONSTRU-REI

Data-base: 2026-10-03
Escopo: Gestor do Projeto CONSTRU-REI V1, no mesmo endereço publicado.

## Missão
Transformar e manter o Gestor do Projeto como o cockpit único do proprietário/desenvolvedor do ecossistema CONSTRU-REI, sem substituir nem duplicar a Central operacional.

## Arquitetura obrigatória
1. Rogério entra pelo Gestor do Projeto. O Gestor é a camada superior de direção, desenvolvimento, governança, histórico e homologação.
2. Gabriele, Éder e Fabrício entram pela Central CONSTRU-REI. A Central continua sendo a camada operacional da equipe.
3. O Gestor deve ter um acesso destacado e inequívoco à Central, com identidade de produto, status, fonte e botão de entrada.
4. O Gestor pode abrir APP, Dashboard, F00–F09, Academy, Documentação, Apresentação e Saúde do Sistema, mas não deve replicar cópias desses produtos.
5. O objetivo é um único PWA para o proprietário. Links e rotas existem por trás; não podem virar uma gaveta de links para o usuário.

## Regra-mãe de sincronismo
Se qualquer produto, módulo, candidata, canônica, versão, homologação, regressão ou checkpoint relevante mudar e essa mudança não aparecer no Gestor, a entrega NÃO está concluída.

## Fonte de verdade
- Registro canônico de links: HOMOLOGACAO_LINK_REGISTRY_AUDIT_20261001.md
- Estado técnico e histórico: repositório GitHub rogeriocibin-alt/construrei-oauth-pages
- Estado de projeto: project-data.json do próprio Gestor
Nunca inventar versão, status, link ou homologação ausente.

## Gestão viva
Toda informação importante deve ter, quando aplicável:
- fonte/evidência;
- status atual;
- versão ou referência;
- última movimentação;
- idade;
- responsável;
- próximo passo;
- critério objetivo de conclusão.
Nada crítico deve depender de Rogério lembrar, copiar/colar ou atualizar manualmente para continuar existindo.

## PWA
- Manter o mesmo endereço do Gestor.
- Manifest e service worker devem privilegiar rede primeiro, para evitar conteúdo congelado.
- Offline é contingência; online vivo é a prioridade.
- Não criar outro aplicativo ou outro link para cada evolução.

## Segurança de evolução
1. Antes de alteração relevante, preservar checkpoint da versão funcional.
2. Alterar somente o necessário no Gestor.
3. Não modificar Central canônica, APP canônico ou F00–F09 como efeito colateral.
4. Testar sintaxe, carregamento, navegação, mobile e instalação PWA.
5. Criar checkpoint final após validação.
6. Registrar a mudança no histórico do Gestor.

## Interface do proprietário
Priorizar gestão à vista. Na primeira tela devem ser fáceis de enxergar:
- acesso à Central;
- pendências do projeto;
- ações que dependem de Rogério;
- frentes ativas;
- bloqueios e envelhecimento;
- estado dos produtos;
- histórico e versões;
- homologações;
- saúde/sincronismo.

## Critério de pronto
Só considerar pronto quando o mesmo Gestor:
- abrir normalmente desktop e celular;
- instalar como PWA;
- abrir a Central pelo acesso principal;
- permitir chegar aos produtos sem caça a links;
- mostrar informação atualizada do projeto;
- preservar histórico e checkpoints;
- não exigir atualização manual de Rogério para manter o estado do projeto coerente.

Execute de forma assertiva, incremental e auditável. Se houver incerteza, marque como não confirmado em vez de fabricar certeza.


## Infraestrutura & TI — extensão obrigatória de 03/10/2026
O Gestor passa a ser também a fonte de verdade da infraestrutura do projeto. Manter visíveis, com status e evidência: Supabase, GitHub, Netlify, Vercel, notebook Rogerio-2022, Cofre Zero, backups e integrações externas.

### Estado auditado
- Supabase CONSTRU-REI: ACTIVE_HEALTHY; 157 tabelas public; 330 Edge Functions ativas.
- GitHub: 2 repositórios visíveis na conexão; principal público e dashboard candidato privado.
- Netlify: 7 sites CONSTRU-REI; plano Free confirmado.
- Vercel: 1 time conectado; 0 projetos.
- Cofre Zero: presente; RESTORE_PROVEN=TRUE em 26/09/2026.
- Backup diário: crítico; falhou em 01/10, 02/10 e 03/10 no dump do banco porque a engine do Docker não estava disponível.
- A rotina alcançou Google Drive e o remote de Storage antes da falha do dump.
- Edge semanal: instalação registrada para domingo 04:30, mas execução ainda não comprovada por marcador/log na auditoria.

### Regras
1. Não presumir plano, quota, custo ou limite. Quando a fonte não retornar a informação, mostrar “não confirmado”.
2. Não publicar valores de acesso no PWA; mostrar somente metadados, saúde e atalhos administrativos.
3. Toda nova hospedagem, conta, site, projeto, banco, bucket ou integração deve aparecer no Gestor no mesmo pacote de entrega.
4. O backup precisa ser redesenhado para reduzir dependência do notebook/Docker e depois ter restauração comprovada.
5. A documentação de desenvolvimento pertence ao Gestor: arquitetura, infraestrutura, deploy, branches, checkpoints, releases, backup, restore, incidentes e saúde técnica.
6. A Central conserva documentação operacional: APP, dashboards usados pela equipe, F00–F09, links, procedimentos e referência operacional.
7. A retirada de conteúdo de desenvolvimento da Central deve ocorrer primeiro em candidata isolada, com validação antes de promoção.
