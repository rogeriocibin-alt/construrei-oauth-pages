# CHECKPOINT — GESTOR DO PROJETO CONSTRU-REI V1 CANDIDATA — 03/10/2026

## Estado
- Produto: Gestor do Projeto CONSTRU-REI
- Versão: V1
- Status: CANDIDATA ISOLADA
- Homologada: NÃO
- Canônica: NÃO
- Promoção para produto oficial: NÃO
- Aprovação humana pendente: Rogério

## Branch de desenvolvimento
- `cr-project-manager-v1-candidate-20261003`
- A candidata foi construída separadamente a partir do estado anterior do repositório.
- O snapshot publicado em `main` está limitado ao namespace estático de preview abaixo.
- Nenhum endpoint oficial da Central, APP, F00–F09, Dashboard ou Supabase foi alterado para publicar esta candidata.

## Namespace de preview
- `preview/project-manager-v1-candidate-20261003/`
- URL esperada do GitHub Pages:
  https://rogeriocibin-alt.github.io/construrei-oauth-pages/preview/project-manager-v1-candidate-20261003/

## Arquivos da V1
- `preview/project-manager-v1-candidate-20261003/index.html`
- `preview/project-manager-v1-candidate-20261003/styles.css`
- `preview/project-manager-v1-candidate-20261003/app.js`
- `preview/project-manager-v1-candidate-20261003/project-data.json`

## Validação estrutural
- JavaScript: sintaxe PASS.
- JSON: sintaxe PASS.
- Views obrigatórias presentes:
  - Agora
  - Cadeia Canônica
  - Frentes
  - Versões
  - Decisões
  - Linha do Tempo
  - Produtos
  - Recuperáveis
  - Governança
- Busca global presente.
- Modo apresentação presente.
- Responsividade CSS presente.
- Menu lateral presente.
- App carrega dados de `project-data.json`.

## Escopo de dados inicial
Carga estruturada da V1:
- 13 produtos/fontes.
- 13 versões.
- 12 checkpoints.
- 5 frentes.
- 5 decisões.
- 12 marcos de timeline.
- 3 itens recuperáveis.
- 4 lacunas explicitamente marcadas como não confirmadas.

## Governança aplicada
1. Máximo de duas frentes em execução.
2. Ideia não é frente.
3. Candidata não é canônica.
4. A última versão segura não é destruída por teste.
5. Entrega exige teste, versão/checkpoint e decisão.
6. Canônica não é ambiente de experimento.
7. Evolução deve ser comparada ao plano canônico.
8. Regressões permanecem visíveis.
9. Histórico não é apagado.
10. O foco é concluir e entregar.

## Situação das frentes na carga V1
- Em execução: Gestor do Projeto CONSTRU-REI V1.
- Em homologação: cadeia Central Executiva V9→V11.
- APP F01, Academy e Documentação permanecem fora da execução principal / em fila, respeitando disciplina de foco.

## Cadeia histórica inicial registrada
Inclui, entre outras referências verificadas:
- Central canônica aprovada 01/10 — commit `92ef8f27d71ac176abc6452df165a048c4405d60`.
- Executiva V6 aprovada — `43edad3801f5e38cf2604b82dc45be33aff3bc29`.
- V7 Agenda Bridge — `1ac6a831db51ffd0eb2103e3866e531bedea6ae3`.
- V8 Agenda Viva — `caeb85fd5eb747911ab071c57ad2801542d25b61`.
- V9 Google Agenda.
- V10 Executive Model.
- V11 Premium Detail — `52b6833cd60bc6541ae30884e9d9edf5c17f6c38`.
- APP baseline oficial 01/10.
- F00→F09 canônico 01/10.
- Apresentação Executiva Viva canônica 02/10.

## Proteção / anti-regressão
Comparação entre a base anterior da main (`52b6833cd60bc6541ae30884e9d9edf5c17f6c38`) e a publicação da candidata (`c6004f250759b855713445cee116d26acd2dca77`) mostra alterações somente em quatro arquivos dentro de:
`preview/project-manager-v1-candidate-20261003/`

Não houve alteração incidental em:
- Central oficial;
- APP oficial;
- F00–F09 canônico;
- Apresentação canônica;
- Dashboard;
- rotas Supabase;
- autenticação;
- runtimes oficiais.

## Lacunas conhecidas
- Histórico anterior às evidências atualmente consolidadas, especialmente antes de 29/09/2026, ainda precisa de enriquecimento.
- Motivos detalhados de todas as versões históricas ainda não estão presentes em um único artefato.
- Google Meet embutido foi relatado como existente/validado anteriormente, mas sua implementação exata ainda precisa ser localizada.
- Alguns checkpoints identificados por branch/nome ainda precisam de leitura documental profunda.

## Próxima ação
VALIDAÇÃO HUMANA DO ROGÉRIO:
1. Abrir o preview.
2. Avaliar visual, clareza, navegação e lógica dos medidores.
3. Confirmar se o Gestor de fato permite entender “onde estamos / de onde viemos / o que fazer agora”.
4. Não conectar Banco Mestre persistente nem automatizar ingestão antes desta validação.

## Regra de retomada
Toda evolução do Gestor parte desta V1 candidata ou de uma sucessora explicitamente aprovada.
Não homologar automaticamente.
Não promover como canônica sem decisão explícita do Rogério.
