# CONSTRU-REI — Contrato para agentes Claude e ferramentas compatíveis

**CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012**

As instruções canônicas para qualquer trabalho neste repositório estão em [AGENTS.md](AGENTS.md) e [docs/CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012.md](docs/CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012.md). Leia também o Índice Mestre de Regras e a ADR referenciados lá. Trate os documentos como **obrigatórios**, não como exemplos.

Sem segunda produção ou banco, sem recurso faturável não autorizado, sem criar duplicatas, sem tocar em serviços homologados para testar. Trabalhe em branch/candidata efêmera, teste com mocks/fixtures, preserve fontes mestres, evidências, histórico e rollback. Máximo de duas frentes ativas. Todo novo agente exige onboarding no Gestor. CI e PR PASS não são aprovação automática de deploy/E2E. Segredos e acessos privilegiados jamais em código público, logs ou chat.

A falta de contexto, permissão, isolamento ou validação impede a ação correspondente; é melhor bloquear que colocar a Central ou os dados da CONSTRU-REI em risco.
