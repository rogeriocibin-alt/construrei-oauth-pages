# GitHub Copilot — CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012

Ao sugerir, escrever ou alterar código da CONSTRU-REI, siga [AGENTS.md](../AGENTS.md) e [docs/CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012.md](../docs/CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012.md), a ADR única, o Índice Mestre de Regras e o cadastro oficial de 39 aliases.

**Processo obrigatório:** consulta ao Gestor e ao módulo homologado → buscar/reutilizar antes de criar → candidata em branch com isolamento real → testes estáticos, regressão e rollback → revisão e aceite antes de publicar → checkpoint e atualização do registro único no Gestor.

Mantenha a produção atual, backups, OAuth, RLS, Trello, financeiro, Central inteira e APP/F00–F09 inalterados fora do escopo. Não crie banco/host/cron/Edge nova ou serviço pago sem autorização explícita. Não faça remoção/saneamento físico sem mapa de consumidores, histórico recuperável e autorização humana. CI é apenas prova parcial; sem acesso externo não alegar E2E. O teste integral do Cofre Zero permanece adiado e monitorado até estabilização.
