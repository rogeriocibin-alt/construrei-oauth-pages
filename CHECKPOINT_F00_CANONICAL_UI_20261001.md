# CHECKPOINT — F00 CANONICAL UI PILOT — 2026-10-01

## Frente
- Branch: `cr-f00-f09-canonical-ui-20261001`
- Base imutável: `01bbff7af8525132bb138da1a6afcd14469b0088`
- Referência visual: `preview/visual-hierarchy-target-refinement-20261001/`
- Produção/main: NÃO ALTERADA
- Gate: F00 somente; F01–F09 não modificados.

## Inventário de entrada
- F00: `3c634ad83773044f788991ca395b652eddb8b49f`
- F01: `b7b80decd69233bb3a86a2866c4053d8473bffab`
- F02: `a25851e1e91a4f09c21cae1c3d45c6f248f5917d`
- F03: `5259cae4a73201be004c079926ec6fe27643bdd3`
- F04: `0ae327162adcc57dfb2debacc0d5449c038f3b47`
- F05: `ee67a35df1240a892a6424e72745a818293b3c4b`
- F06: `8ba451a660cd9be960731085049f1762553c6218`
- F07: `391caa3ab81916257682219e13432f3fa7a325a6`
- F08: `0aa6f7ee3476c26f094d34e7005a6305e9b9f080`
- F09: `0978b6565c9910df88767d0525fcc69e8cc68ea2`

## Alterações do piloto
1. Adicionado `central-runtime/ui/cr-f00-canonical-pilot-20261001.css`.
2. F00 recebeu somente um meta marcador + link para o CSS piloto.
3. Nenhuma alteração no bloco JavaScript do F00.
4. CSS alinhado à referência canônica: fundo claro, painéis brancos, navy/azul, ouro, hierarquia executiva, notebook e mobile.

## Evidência antirregressão
- Compare base → branch: apenas 2 arquivos de implementação alterados antes deste checkpoint.
- `central-runtime/f00/index.html`: 1 adição/1 remoção de linha na camada head.
- `central-runtime/ui/cr-f00-canonical-pilot-20261001.css`: arquivo novo.
- SCRIPT_IDENTICAL = true.
- Branch estava 3 commits à frente e 0 atrás da base antes deste checkpoint.
- F01–F09 permanecem byte-identical em relação à base porque não foram tocados.

## Próximo gate
Homologar visualmente F00 em notebook e mobile.
NÃO propagar para F01–F09 antes da validação de Rogério.
