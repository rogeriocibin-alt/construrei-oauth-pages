# P0 Financeiro REI — Integração de webhooks Trello, candidato isolado

**Status:** rascunho técnico, sem deploy. Fonte única Gestor: SEC-FIN-TRELLO-AUTH-20261012.

## O que está implementado **apenas como contrato**

1. `trello-webhook-signature.mjs`: verifica assinatura HMAC-SHA1 recebida do Trello sobre corpo bruto exato + URL de callback cadastrada, sem reserializar JSON. Somente callbackURL e segredo vindos de configuração segura do servidor.
2. `trello-webhook-envelope.mjs`: após assinatura válida, limita tamanho (256 KiB), recusa UTF-8/JSON inválidos, exige IDs de modelo/ação, aplica allowlist de eventos **somente do servidor** e calcula identificador determinístico SHA-256 de `model.id + action.id`.
3. Suítes sintéticas Node para negativo/positivo, inválidos, conteúdo alterado, erro de assinatura, tipo não autorizado e mesma ação repetida. Runner Cofre Zero existente; nenhuma credencial, chamada de rede ou mutação operacional.

## Arquitetura necessária ANTES de habilitar

- Criar/usar um inbox **privado e persistente** com restrição única `(provider, event_key)`, autorização estrita de escrita server-side, retenção definida, contadores e registro de tentativas. **Não criado**.
- Em transação, reservar ação assinada e criar outbox de processamento com ID estável. Callback só confirma sucesso após persistência atômica; duplicidade não repete efeitos. Processador reprocessável idempotente marca sucesso ao confirmar downstream. Definir regras de retry/DLQ e auditoria sem armazenar tokens.
- O SHA estável é identidade potencial de repetição, **não** previne replay sozinho, nem garante exatamente uma vez sem transação e tratamento de crash.
- Rotas de lançamento **manual** no financeiro exigem autenticação de sessão/role separada e vinculação obra/orçamento; uma assinatura válida de webhook Trello não autoriza pagamento, fechamento de obra, distribuição de lucro ou escrita genérica.
- Quotas/rate limiting, tamanhos, verificação de callback com origem real, segredo rotacionável, monitoramento de falhas e rollback devem ser homologados em sandbox.
- Sem alterar a verdade financeira do Trello, obras fechadas, distribuição canônica, integrações atuais e histórico.

## Matriz de testes futura

Assinado genuíno; assinatura ausente/trocada; callback errado; JSON reordenado; corpo alterado; ação repetida; mesmo modelo + ação com reenvio; ações diferentes; tipo não permitido; limite 256 KiB; UTF-8 inválido; falha de reserva transacional; dois workers concorrentes; crash após reserva e antes do downstream; queda na confirmação downstream; retry seguro; permissão manual sem autenticação; redirecionamento de tenant/obra; rollback.

**Gate:** PR CI verde = contrato isolado aprovado tecnicamente. Não equivale a proteção de produção. Promover somente após provas de processamento persistente, perfil humano, integração segura e retorno testado; manter este PR draft até então.
