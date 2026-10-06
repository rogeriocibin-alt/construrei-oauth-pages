# CHECKPOINT — Finance V5 / Cora Stage — 2026-10-06

## Estado
- Branch candidata: `cr-finance-v5-cost-center-cora-candidate-20261006`
- Integração: Cora — Integração Direta
- Ambiente em configuração: Stage / teste
- Produção: não configurada nesta etapa
- Nenhum segredo Cora é registrado neste arquivo ou no GitHub

## Credenciais
- Client ID de Stage: já configurado pelo Rogério no Supabase como secret
- Nome canônico do secret: `CORA_STAGE_CLIENT_ID`
- Certificado PEM: próximo passo em andamento
- Nome canônico do secret: `CORA_STAGE_CERT_PEM`
- Private Key: pendente, será configurada depois do certificado
- Nome canônico do secret: `CORA_STAGE_PRIVATE_KEY`

## Regras de segurança
- Não enviar certificado, private key, ZIP ou valores secretos em chat, GitHub, front-end ou HTML
- Segredos ficam apenas no backend / gerenciamento de secrets do Supabase
- Preservar integralmente o conteúdo PEM e as quebras de linha
- Não ativar Produção nem gravar dados financeiros reais nesta fase
- Primeira integração permanece candidata / Stage

## Próximo passo exato
1. No Supabase, criar/editar o secret `CORA_STAGE_CERT_PEM`
2. No Value, colar todo o conteúdo do arquivo Certificado PEM, incluindo BEGIN/END CERTIFICATE
3. Salvar
4. Depois configurar `CORA_STAGE_PRIVATE_KEY`
5. Só após os três secrets estarem configurados, validar autenticação Stage no backend
