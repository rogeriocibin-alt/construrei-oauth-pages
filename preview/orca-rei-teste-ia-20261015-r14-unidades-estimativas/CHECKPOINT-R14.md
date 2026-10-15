# ORÇA-REI — CANDIDATA R14 | ESTIMATIVAS POR UNIDADE
Data: 15/10/2026 • Isolada • NÃO HOMOLOGADA.

## Evidência reproduzida na R13
Em Android, para 2 UN de rejunte cimentício, o serviço de IA estimou preço e devolveu unidade PCT, com nota "Custo estimado por unidade de rejunte cimentício para acabamento de base. Preço de venda preliminar sem mão de obra nem deslocamento." A R13 considerou UN/PCT incompatíveis e anulou o preço, bloqueando PDF.

## Correção pontual
1. Nas propostas da IA sem cotação real (estimativa_ia_sem_cotacao), quando solicitado UN, retornado PCT, com texto inequívoco "por unidade" ou "unitário" e sem evidência de pacote com múltiplas unidades, restaurar o preço como ESTIMATIVA POR UNIDADE COMERCIAL PROVISÓRIA.
2. Não multiplicar ou dividir preço; nenhum fator de conversão de embalagem é inventado. A origem, o texto da IA e a etiqueta de correção continuam legíveis.
3. Exigir revisão da embalagem (peso/quantidade por pacote) e aceite de orçamento preliminar; não apresentar o valor como cotação documentada ou homologação comercial.
4. Conservar bloqueio para casos com preço de pacote explicitamente declarado, pacote com múltiplas unidades, outros conflitos de unidade, divergências matemáticas ou preços publicados/históricos. Auditoria matemática da R13 continua intacta.
5. Corrigir mensagem de confirmação e textos móveis de fotografias sem tocar em PDFs e backend.

## Regressão e segurança
- Não alterar R12/R13, produção, central, Supabase, Edge Functions, caches, credenciais ou APIs.
- Reutilizar chamada existente a cr-orca-rei-context-prices-r11-20261015.
- Testar ponta a ponta no navegador real, dois casos de orçamento, pelo menos um parecer e PDF no Android e notebook antes de promoção.
- Demonstração no GitHub e testes lógicos NÃO substituem homologação real de IA/PDF.
