# CHECKPOINT — Identidade Visual Canônica CONSTRU-REI APP V1 — 2026-10-06

## Objetivo
Implantar a prancha visual aprovada e o pacote `CONSTRU_REI_APP_KIT_IMAGENS_V1` como fonte única de marca do ecossistema oficial, sem alterar regras de negócio, dados, integrações ou links homologados.

## Fonte única de assets
`assets/brand/construrei-app-v1/`

Assets canônicos:
- `logo-horizontal.webp`
- `emblema.webp`
- `app-icon-192.png`
- `app-icon-512.png`
- `apple-touch-icon.png`
- `favicon-16.png`
- `favicon-32.png`
- `banner-central.webp`
- `banner-gestor.webp`
- `brand-manifest.json`

## Superfícies incorporadas nesta candidata
1. Central Operacional oficial
   - favicon / Apple Touch
   - marca compacta do sistema
   - emblema institucional
   - banner oficial aplicado à área visual do hero, preservando textos e dados vivos
2. Gestor do Projeto
   - favicon / Apple Touch
   - marca do shell
   - PWA 192 / 512
   - manifest atualizado
   - cache do service worker rotacionado
   - banner do Gestor aplicado ao hero sem alterar governança/dados
3. APP CONSTRU-REI
   - entrada oficial com favicon e app icon
   - superfície ativa do APP alinhada ao app icon canônico
4. F00 → F09
   - shell compartilhado usa um único app icon canônico
   - favicon / Apple Touch inseridos pelo shell
5. Apresentação Institucional
   - favicon e marca canônica
   - logotipo horizontal na abertura
   - equipe humana da página 02 preservada

## Fronteiras preservadas
- Avatar humano continua representando pessoa.
- Emblema / APP icon representam sistema/empresa.
- Nenhuma regra financeira ou operacional foi alterada.
- Nenhuma rota oficial foi alterada neste pacote.
- Arquivos históricos/arquivados não são reescritos; somente superfícies ativas/canônicas recebem a nova marca.

## Antirregressão
- Não criar cópias locais diferentes da logo por produto.
- Novas superfícies devem apontar para `assets/brand/construrei-app-v1/`.
- Não voltar a usar o endpoint legado de logo quando o asset canônico local estiver disponível.
- PWA deve renovar cache quando assets canônicos forem alterados.
- Banner é camada visual: não pode capturar clique nem substituir dados vivos.

## Branch candidata
`cr-brand-canonical-v1-20261006`

## Validação necessária antes do fechamento
- GitHub diff sem alteração funcional inesperada.
- GitHub Pages publicado com sucesso.
- Central desktop: marca + banner + acessos intactos.
- Gestor desktop: marca + banner + navegação intactos.
- APP: marca carregada.
- F00/F01 amostra + shell compartilhado: marca carregada.
- Apresentação: abertura + página 02 preservadas.
- Mobile/PWA: manifest e ícones corretos; validação visual final em aparelho quando disponível.
