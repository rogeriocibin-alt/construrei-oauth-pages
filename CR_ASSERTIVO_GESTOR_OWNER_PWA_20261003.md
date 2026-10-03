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
