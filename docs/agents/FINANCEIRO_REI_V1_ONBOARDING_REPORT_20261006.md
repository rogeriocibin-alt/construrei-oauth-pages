# FINANCEIRO REI V1 — RELATÓRIO DE ONBOARDING

Data: 06/10/2026
Status: **APROVADO / HOMOLOGADO / ATIVO**
Gestor humano: **Rogério**

## Formação embarcada
- Know-How comum CONSTRU-REI;
- manual financeiro específico V1;
- regras de fechamento;
- rateio padrão;
- capital de giro;
- conciliação e divergências;
- cobrança/F08;
- privacidade de dados financeiros;
- handoff com BIO, CR Assertivo, ORÇA-REI, BIO Gestor, Gabi Flow e Infra REI.

## Prova matemática bloqueante
Caso 447-26:
- Receita: R$ 1.530,00
- Custos: R$ 930,05
- Lucro: R$ 599,95
- Margem: 39,21%
- Rateio: 20/28/28/14 + 10% CG
- Soma do rateio = R$ 599,95

Resultado: **PASS**.

## Provas de alçada
- Financeiro tentando alterar HTML → **BLOCK / HANDOFF CR ASSERTIVO**
- BIO recebendo fechamento → **HANDOFF FINANCEIRO REI**
- CR recebendo nova regra de rateio → **BLOCK / FINANCEIRO REI ou ROGÉRIO**
- Exceção financeira → **ROGÉRIO MASTER**
- Dados internos em saída de cliente → **BLOCK**
- Uso de Ágata como aprovadora ativa → **BLOCK**

Resultado: **PASS** nos testes bloqueantes definidos em `agents/onboarding-tests.json`.

## Gate humano
Rogério determinou explicitamente:
- concluir o onboarding;
- embarcar todo o know-how financeiro canônico;
- tornar Financeiro REI o agente automático de assuntos financeiros;
- impedir invasão de alçada por BIO ou CR Assertivo;
- estabelecer Rogério como gestor humano;
- retirar Ágata da estrutura ativa.

Gate: **PASS_EXPLICIT_OWNER_APPROVAL**.

## Estado final
`FINANCEIRO_REI = CANONICAL_ACTIVE_HOMOLOGATED`
