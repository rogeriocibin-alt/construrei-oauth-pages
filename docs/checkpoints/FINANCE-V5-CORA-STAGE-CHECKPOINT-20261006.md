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
- Certificado PEM: informado como salvo pelo Rogério no Supabase; verificação de runtime ainda não o encontrou pelo nome canônico
- Nome canônico do secret: `CORA_STAGE_CERT_PEM`
- Private Key: informada como salva pelo Rogério no Supabase; verificação de runtime ainda não a encontrou pelo nome canônico
- Nome canônico do secret: `CORA_STAGE_PRIVATE_KEY`

## Regras de segurança
- Não enviar certificado, private key, ZIP ou valores secretos em chat, GitHub, front-end ou HTML
- Segredos ficam apenas no backend / gerenciamento de secrets do Supabase
- Preservar integralmente o conteúdo PEM e as quebras de linha
- Não ativar Produção nem gravar dados financeiros reais nesta fase
- Primeira integração permanece candidata / Stage

## Checkpoint fechado
- Entrada manual das três credenciais Stage no Supabase: **REALIZADA**; validação de runtime **PENDENTE**
- `CORA_STAGE_CLIENT_ID`: configurado
- `CORA_STAGE_CERT_PEM`: não visível para a Edge Function na verificação de runtime
- `CORA_STAGE_PRIVATE_KEY`: não visível para a Edge Function na verificação de runtime
- Nenhum valor sensível foi registrado neste arquivo ou no GitHub
- Produção permanece intocada

## Próxima etapa pendente
1. Validar autenticação Cora no ambiente Stage a partir do backend
2. Confirmar leitura segura sem gravar dados financeiros reais
3. Só depois avançar para a candidata de conciliação/centro de custo


## Verificação de runtime — 2026-10-06
- Edge Function diagnóstica: `cora-stage-auth-check-20261006`
- `CORA_STAGE_CLIENT_ID`: presente = true
- `CORA_STAGE_CERT_PEM`: presente = false
- `CORA_STAGE_PRIVATE_KEY`: presente = false
- Interpretação: autenticação Cora ainda não foi testada; primeiro é necessário corrigir/confirmar os nomes dos dois secrets no Supabase.
