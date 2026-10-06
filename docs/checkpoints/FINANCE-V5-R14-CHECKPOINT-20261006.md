# FINANCEIRO V5 — CHECKPOINT R14 — 06/10/2026

## Estado
Candidata ativa em desenvolvimento seguro. Produção financeira não foi promovida nem alterada.

- UI build: `CR-FINANCE-V5-CANDIDATE-20261006-R14`
- Página candidata: `preview/gestao-financeira-v5-cost-center-candidate-20261006/index.html`
- Commit R14: `ceec35a15778f22249ba042e493b9dc43d98eca3`
- GitHub Pages confirmado servindo R14 via HTTP 200.
- Trello continua como fonte operacional temporária.
- GestãoClick continua complementar.
- Cora Stage continua aguardando retorno/suporte após `invalid_client`; Cora Produção intocada.

## Princípio operacional aprovado
Cada obra numerada é tratada como centro de custo operacional. O centro deve concentrar receita, custos, saldo, lucro, margem, rateio, comprovantes e ciclo financeiro.

Fluxo alvo:
EM EXECUÇÃO → ENCERRAR OBRA → AGUARDANDO PAGAMENTO → OBRA RECEBIDA → AGUARDANDO ACERTO → ACERTO REALIZADO → ARQUIVO DO MÊS.

## Implementado até R14

### Regra pétrea dos filtros
Todo filtro relevante deve apresentar também quantidade e agregado financeiro do recorte.

Em Operação e Obras:
- quantidade;
- faturamento;
- custos;
- lucro;
- margem;
- contagem e soma por status.

Em Acertos:
- filtro por orçamento/cliente recalcula os KPIs e rateios do recorte;
- exportações usam a seleção manual quando houver; sem seleção manual, usam o recorte filtrado.

### Avatares
Avatares humanos aplicados em Acertos para Fabrício, Éder, Rogério e Gabrielly/Gabi nos pontos em que ajudam leitura e identificação. Capital de Giro usa ícone financeiro. Não inserir avatar isolado quando o conjunto exibido não possui identidade visual equivalente para os demais participantes.

### Auditoria de rateios
Modos:
- obra a obra;
- semana;
- mês;
- ano.

Histórico é preservado conforme registrado. Obras fechadas não são reabertas nem recalculadas automaticamente.

Regra atual do Acerto Vivo:
- Fabrício 20%;
- Éder 28%;
- Rogério 28%;
- Gabi 14%;
- Capital de Giro 10%;
- ajuste de centavos exclusivamente no Capital de Giro.

Auditoria 2026:
- 214 obras com algum sinal de rateio/capital;
- 138 com composição explícita suficiente;
- 76 com composição parcial/ausente;
- 137 completas com lucro comparável;
- 10 rateios completos divergem mais de R$ 1,00;
- 5 divergem mais de R$ 100,00;
- lucro-base comparável: R$ 77.256,18;
- distribuído comparável: R$ 79.214,99;
- diferença líquida comparável: -R$ 1.958,81.

Principais divergências materiais já sinalizadas: 280-26, 109-26, 191-26, 211-26 e 91-26. Não corrigir automaticamente; investigar origem histórica/base/custos.

### Centros de custo históricos — ponte Trello
Nova visão 2024 / 2025 / 2026 com filtros, autosoma e abertura do centro.

Cobertura identificada:
- 2026: 244 centros; 225 com faturamento; 233 com custos; 217 com lucro.
- 2025: 354 centros; 347 com faturamento; 350 com custos; 350 com lucro.
- 2024: 329 centros; 317 com faturamento; 310 com custos; 318 com lucro.

A ponte é leitura operacional de cards individuais. Não substituir nem misturar com o consolidado anual reconciliado.

### Visão Executiva R13
Adicionados:
- evolução mensal do faturamento;
- destaque do mês selecionado;
- diferença visível entre consolidado anual e soma dos resumos mensais;
- ranking de maiores origens/clientes identificados;
- número de obras por origem;
- concentração Top 3;
- cobertura de identificação.

Ranking é gerencial e deriva apenas de nomes/origens identificáveis nos labels/títulos; não substitui cadastro formal de clientes.

### Laboratório do centro de custo R14
Ao abrir um centro histórico, há agora laboratório seguro para validar UX:
- categoria;
- valor;
- data;
- fornecedor/prestador;
- arquivo local (nome apenas);
- forma/origem de pagamento;
- observação;
- simulação acumulada de custos;
- lucro projetado;
- margem projetada.

A simulação é somente local da sessão. Nada é persistido, enviado ao Trello, Cora ou tabelas financeiras.

Os botões reais de:
- Encerrar obra;
- Obra recebida;
- Acerto realizado

permanecem bloqueados até homologação do fluxo de escrita canônico.

## Banco canônico
Preservar sem criar ledger paralelo:
- `cr_cases_v1`;
- `cr_quotes_v1`;
- `cr_quote_approvals_v1`;
- `cr_financial_entries_v1`;
- `cr_working_capital_periods_v1`;
- `cr_working_capital_state_v1`.

Contagens verificadas:
- cases: 28;
- quotes: 0;
- approvals: 0;
- financial entries: 0;
- working capital periods: 0;
- working capital state: 1.

Capital de Giro GLOBAL:
- gerado: R$ 20.139,21;
- saldo real: R$ 4.006,60;
- consumo líquido: R$ 16.132,61;
- acerto atual pendente: R$ 216,55.

## Qualidade de dados
O consolidado 2026 e a soma dos resumos mensais ainda divergem. Isso deve permanecer visível até reconciliação; não inventar bridge.

O faturamento semanal histórico não deve ser afirmado enquanto a data financeira não estiver comprovada. A Cora deverá tornar essa leitura viva e confiável do presente para frente.

## Próximas etapas
1. validação humana do layout R14 em notebook e celular;
2. investigar as divergências materiais de rateio sem alterar histórico;
3. definir e homologar o contrato de escrita do centro de custo;
4. somente depois habilitar lançamento persistente de custo/anexo/status;
5. Cora Stage: retomar autenticação quando houver retorno do suporte;
6. implementar fila obrigatória de provisionamento bancário após Cora Stage aprovada;
7. promover somente após validação humana e checkpoint.
