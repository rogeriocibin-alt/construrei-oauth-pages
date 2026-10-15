# CONSTRU-REI — ORÇA-REI R12 | CHECKPOINT CONTROLADO
Data: 2026-10-15. Estado: CANDIDATA ISOLADA (não homologada). Base: R11 refino PDF1.
Escopo alterado APENAS em preview/orca-rei-teste-ia-20261015-r12-mobile-pdf-auditoria/ (index.html, app.js, brand.js).
Nenhum link homologado, Supabase Edge Function, central, banco de dados ou produção foi alterado.

## Melhoria funcional implementada
- Pré-visualização responsiva, com leitura ampliada no celular ANTES do diálogo de impressão; ações separadas Imprimir/Salvar, Abrir em outra aba e Fechar.
- Layout móvel para tabelas de orçamento em cartões legíveis sem zoom, metadados em 2 colunas e fotos em coluna única.
- Impressão A4 preservada em CSS dedicado, com tabela compacta, galeria de até 3 fotos por linha, rodapé institucional fixo e margens reservadas.
- Rodapé com contatos, slogan e faixa azul/dourada em aproximação ao Parecer 710-26; logomarca embarcada (brand.js original).
- Metadados diferenciados de parecer (DATA DA VISTORIA / RESPONSÁVEL PELA VISTORIA).
- Bloqueio de PDF de parecer se contiver valores financeiros ou totais comerciais.
- Preço unitário zero passa a ser inválido no orçamento, tanto para cálculo quanto para emissão comercial.
- Bloqueio de preço externo com unidade incompatível (p.ex. CJ x UN); classificação conservadora entre referência documentada e estimativa.
- Advertências da auditoria automática para termos categóricos em pareceres, itens sem quantidades/preços positivos, valores preliminares.
- Orientações textuais conservadoras inseridas na geração com IA: separar relato, observação, hipótese e recomendação; não concluir a partir só de fotos; não presumir preços e medidas.
- Motor automático de precificação, IA Groq/Gemini, legendas e PDFs de origem preservados da R11; integrações/backends não duplicados.

## Testes comprovados
- 3 arquivos da R12 gravados e relidos por SHA no GitHub.
- Fonte JavaScript R12 aprovada em verificação de sintaxe.
- 8 testes isolados de parsing e controles concluídos (moeda BRL, unidades, quantidades, preço, bloqueio de valores de parecer, inferência de assunto, histórico).
- Página GitHub Pages carregada e exibiu título R12, motor comercial e estado IA/credenciais presentes por navegador conectado.
- NÃO comprovado ainda: fluxo real Gemini/Groq → PDF no navegador móvel, impressão real em Android e Windows, paginação final de documentos longos, coerência técnica de gerações futuras e qualidade de todas as fontes de preços.

## Regressões proibidas/condições para promoção
- Não editar a R11 nem produção; alteração apenas em candidata até aprovação.
- Parecer não contém valores, orçamento conserva serviços/materiais, quantidades, preços e observações.
- Fotos com legendas verificáveis; sem atribuir causa não constatada.
- Resultado final: 710-26 identidade azul/dourado e logo, rodapé e paginação sem página órfã.
- Orçamento com preços estimados identificados e bloqueio de publicação comercial quando ausentes ou zero.
- Validar celular e notebook em uma rodada consolidada, usando pelo menos dois casos (520-26 e caso diferente), antes de eventual sincronização com o app oficial F00/F03.
- Sincronização deve ser feita por comparação de funcionalidades e migração seletiva, nunca substituição integral do link oficial.

## Referências
PARECER TÉCNICO 520-26 (3), ORÇAMENTO PRELIMINAR 520-26 (3), Parecer Técnico 710-26 corrigido (2).
