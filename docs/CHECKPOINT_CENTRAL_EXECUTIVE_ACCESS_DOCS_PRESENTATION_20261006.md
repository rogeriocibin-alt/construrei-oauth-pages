# CHECKPOINT — Central Executiva • Acessos + Documentação + Apresentação — 2026-10-06

## Escopo autorizado pelo proprietário
1. Manter a Central oficial no link:
   - https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/central-operacional-v2-ux-r1-2-homologada-20261005/
2. Consolidar os cinco acessos principais da Central Executiva:
   - Cora
   - Trello
   - GestãoClick
   - Wizy Flow
   - Gmail CONSTRU-REI
3. Wizy Flow:
   - nome correto: **Wizy Flow**
   - login oficial: https://app.wizyflow.com.br
   - não redirecionar para Pendências Wizy Flow.
4. Gmail:
   - conta operacional: contatoconstrurei@gmail.com
   - botão abre a caixa da CONSTRU-REI no navegador usando authuser;
   - não misturar com conta pessoal.
5. Documentação Operacional:
   - somente operação/uso do APP, F00–F09, procedimentos, manuais, checklists e treinamento;
   - engenharia, arquitetura, releases, APIs, auditorias e desenvolvimento ficam no Gestor do Projeto;
   - corrigir travamento forte ao abrir;
   - responsáveis humanos devem receber miniavatares contextuais quando identificados.
6. Apresentação Institucional:
   - destino oficial da Central: ./presentation/
   - versão moderna aprovada, com a equipe humana na segunda página;
   - manter a versão publicada dentro da pasta oficial da Central.

## Correções implementadas nesta candidata
- Removido o MutationObserver global da Documentação que reexecutava a renderização após cada alteração do próprio DOM, gerando loop e travamento.
- Inicialização da Documentação passa a ter tentativas limitadas e encerra assim que os dados estão disponíveis.
- Alias /documentacao/ passa a abrir diretamente a Documentação Operacional da Central.
- GestãoClick passa a usar ícone do domínio oficial.
- Wizy Flow passa a usar login oficial e favicon oficial do domínio.
- Gmail inserido como quinto acesso, preservando a conta operacional da CONSTRU-REI.
- Miniavatares contextuais dos responsáveis são inseridos na coluna Responsável da Documentação.
- Apresentação Institucional permanece vinculada à versão oficial:
  https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/central-operacional-v2-ux-r1-2-homologada-20261005/presentation/

## Regra antirregressão
- Não voltar a chamar Wizy Flow de Easy Flow.
- Não apontar Wizy Flow para /wizy-flow/ ou /pendencias-wizy-flow/.
- Não recolocar documentação técnica/desenvolvimento dentro da Central.
- Não misturar Gmail pessoal com a caixa operacional da CONSTRU-REI.
- Não reintroduzir observer global que renderize Documentação em resposta às próprias mutações do docsTable.

## Branch
- cr-central-access-docs-hotfix-20261006
