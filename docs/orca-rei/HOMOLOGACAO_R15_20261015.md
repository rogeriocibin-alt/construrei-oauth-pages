# CONSTRU-REI • ORÇA-REI R15 — HOMOLOGAÇÃO DOCUMENTAL E FUNCIONAL

**Data:** 15/10/2026. **Decisão do responsável:** R15 aprovada para ser base congelada e encaixada no APP CONSTRU-REI.

**Status:** HOMOLOGADA COMO BASE FUNCIONAL E VISUAL. Promoção/encaixe no APP permanece em **candidata isolada** até validação da conectividade completa. Não confundir com promoção automática da produção atual.

## Evidências

- Teste real do responsável com geração de parecer e orçamento nº 520-26 (JBA, Rua Yoshiaki Nagano, 500): IA, precificação, edição e exportação operaram no teste.
- Orçamento: Serviços R$ 1.061,54; materiais R$ 1.615,36; total R$ 2.676,90. Rejunte 2 KG × R$ 30,77 = R$ 61,54. Valores PRELIMINARES, exigem revisão comercial; não ficam homologados como preços permanentes.
- Parecer: 2 páginas, sem valores financeiros, com quatro fotografias e legendas; orçamento: 2 páginas, fotos e rodapé íntegros. No material enviado, não se observou o bug anterior de rodapé invadindo o conteúdo.
- Testes automatizados de sintaxe, integração de unidade de embalagem, HTML/rodapé e regressões: GitHub Actions R15 concluído com sucesso em 15/10/2026.

## Congelamento do artefato R15

Origem: `preview/orca-rei-teste-ia-20261015-r15-correcao-precos-pdf/`.

- `app.js`: blob Git SHA `3c612975a3871900a29c2b745bfc914749f0bed3` (59346 caracteres)
- `index.html`: blob Git SHA `280e604c4aade4919b913a993eb2f0ed479df1b1` (8169 caracteres)
- `brand.js`: blob Git SHA `e5ae2ee493fe73f44e7d3b7462471d05f2b1fae4` (25696 caracteres)
- `smoke-r15.cjs`: blob Git SHA `ea8f13fc0864f5c9b59fdec94de5df92408fdc62` (5294 caracteres)

**Regra de engenharia:** NÃO editar, mover ou substituir essa candidata congelada. Evoluções entram em outro diretório/candidata, preservando os blobs acima. Não alterar Edge Functions de preço/IA, credenciais, bancos, regras de cálculos, logomarca, legendas, estrutura dos PDFs e gates de segurança sem revisão explícita.

## Contrato de encaixe APP F00–F04

1. F00/F01 continuam capturando e qualificando pelo fluxo oficial.
2. F02 recebe contexto e mantém ORÇA-REI R15 para elaboração/preço/parecer/PDF na própria interface (enquadramento e pontes em candidata isolada).
3. Dados consolidados são transferidos ao F02 via ação EXPLÍCITA de **salvar rascunho**, preservando documentação técnica e discriminação entre serviços e materiais; nenhuma transição ou aprovação automática.
4. F03 somente recebe proposta mediante validação humana e uso dos gates existentes; F04 continua dependente da aprovação F03 e handoff canônico.
5. Não reescrever nem clonar contratos/Edge Functions do Supabase; não duplicar inteligência, infraestrutura paga nem cron.
6. Gate de promoção do encaixe: notebook + celular; seleção de caso real autorizado, geração real IA/PDF, transferência sem perda de dados, retorno ao F02, passagem F03/F04 apenas após revisão e conformidade com regras financeiras.

**Limites:** aprovação funcional não equivale à aprovação automática dos preços estimados; o ensaio local do encaixe não comprova integração ponta a ponta até promoção validada.
