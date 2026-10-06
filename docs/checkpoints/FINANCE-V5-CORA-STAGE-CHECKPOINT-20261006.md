# CHECKPOINT — Finance V5 / Cora Stage — 2026-10-06

## Estado
- Branch candidata: `cr-finance-v5-cost-center-cora-candidate-20261006`
- Integração: Cora — Integração Direta
- Ambiente: Stage / teste
- Produção: não configurada nesta etapa
- Nenhum segredo Cora é registrado neste arquivo ou no GitHub

## Credenciais de Stage
- `CORA_STAGE_CLIENT_ID`: presente no runtime
- `CORA_STAGE_CERT_PEM`: presente no runtime
- `CORA_STAGE_PRIVATE_KEY`: presente no runtime
- O Client ID armazenado no Supabase foi confrontado por hash com a credencial Stage ativa exibida no Cora Web e corresponde à credencial ativa.
- Nenhum valor sensível, token, certificado ou private key foi registrado neste checkpoint.

## Regras de segurança
- Não enviar certificado, private key, ZIP ou valores secretos em chat, GitHub, front-end ou HTML
- Segredos ficam apenas no backend / gerenciamento de secrets do Supabase
- Preservar integralmente o conteúdo PEM e as quebras de linha
- Não ativar Produção nem gravar dados financeiros reais nesta fase
- Primeira integração permanece candidata / Stage

## Validação de runtime
- Edge Function diagnóstica: `cora-stage-auth-check-20261006`
- Os três secrets canônicos foram confirmados como visíveis no runtime.
- A chamada real de autenticação mTLS foi realizada no endpoint Stage oficial da Cora.
- Endpoint: `https://matls-clients.api.stage.cora.com.br/token`
- Resultado repetido em duas tentativas: HTTP 400 da Cora
- Erro retornado: `invalid_client` / `Invalid client credentials`
- Token recebido: não
- Interpretação: o backend Supabase alcança o endpoint mTLS e consegue carregar os três materiais; porém a Cora ainda rejeita a combinação de credenciais.
- Como o Client ID corresponde à credencial Stage ativa, o próximo diagnóstico deve priorizar o pareamento/validade do certificado + private key da mesma emissão Stage ou eventual provisionamento da credencial pela Cora.

## Estado fechado deste checkpoint
- Configuração manual dos três secrets: **VALIDADA NO RUNTIME**
- Autenticação Stage: **BLOQUEADA POR INVALID_CLIENT**
- Produção: **INTOCADA**
- Dados financeiros reais: **NENHUMA GRAVAÇÃO**
- Próxima etapa de centro de custo/conciliação: **AGUARDANDO AUTENTICAÇÃO STAGE**

## Próxima etapa
1. Confirmar que certificado e private key usados no Supabase pertencem exatamente à mesma emissão da credencial Stage ativa.
2. Se necessário, regenerar/reemitir a credencial Stage e substituir o trio no Supabase.
3. Repetir o teste de token sem expor o access token.
4. Após sucesso, avançar para leitura segura e candidata de conciliação/centro de custo.
