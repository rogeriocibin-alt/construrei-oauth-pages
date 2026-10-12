#!/usr/bin/env python3
"""Contrato de desenvolvimento CONSTRU-REI. Auditoria deterministica SOMENTE LEITURA.

Nao acessa rede, credenciais, Supabase ou production; nunca deleta ou publica.
CI verifica que novos trabalhos de agentes continuam vinculados as fontes
canonicas ja homologadas. Nao substitui homologacao funcional ou controles
externos a este repositorio.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTRACT = ROOT / "docs" / "CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012.md"
RULES = ROOT / "docs" / "CANONICAL_RULES_MASTER_INDEX_V1_20261007.md"
ARCH = ROOT / "docs" / "ARQUITETURA_TRES_AMBIENTES_PLANO_20261011.md"
ADR = ROOT / "docs" / "ADR_ECOSSISTEMA_UNICO_CONTROL_PLANE_SAAS_20261011.md"
LINKS = ROOT / "docs" / "official-links-registry.json"
PREVIEW = ROOT / "docs" / "AMBIENTES_PREVIEW_INVENTARIO_20261011.json"
AGENTS = ROOT / "agents"
SCOPE = {
    "bio", "bio-gestor", "cr-assertivo", "infra-rei",
    "orca-rei", "gabi-flow", "financeiro-rei"
}
POLICY_MARKER = "CONTRATO_DESENVOLVIMENTO_SANEAMENTO_20261012"
NEEDED_CONTRACT = (
    "PRODUÇÃO", "HOMOLOGAÇÃO", "ARQUIVO", "Gestor",
    "R$ 0", "121", "109", "370", "rollback", "ADIADO",
    "REUTILIZAR", "fonte", "CI"
)
NEEDED_RULE_IDS = (
    "GOV-001", "GOV-002", "GOV-003", "GOV-004", "GOV-005", "GOV-006",
    "DEV-001", "DEV-002", "ARCH-001", "ARCH-002", "PEND-001",
    "AGT-001", "REUSE-001", "AUD-001", "CONT-002", "LINK-001"
)

def main():
    problems = []
    for name, p in (("contrato", CONTRACT), ("regras", RULES),
                    ("arquitetura", ARCH), ("adr", ADR),
                    ("links", LINKS), ("preview", PREVIEW)):
        if not p.is_file():
            problems.append("Fonte canonica ausente: " + name)
    if problems:
        print(json.dumps({"status": "FAIL", "errors": problems}, ensure_ascii=False))
        return 1

    contract = CONTRACT.read_text(encoding="utf-8")
    rules = RULES.read_text(encoding="utf-8")
    for word in NEEDED_CONTRACT:
        if word not in contract:
            problems.append("Contrato perdeu fundamento: " + word)
    for rule_id in NEEDED_RULE_IDS:
        if not re.search(r"(?m)^### " + re.escape(rule_id) + r"\s+[—–-]", rules):
            problems.append("Regra canonica ausente: " + rule_id)

    present = set()
    for entry in AGENTS.iterdir():
        if not entry.is_dir():
            continue
        if (entry / "AGENT.md").is_file():
            present.add(entry.name)
    if present != SCOPE:
        problems.append("Mudanca no inventario de agentes requer revisao: "
                        + repr({"novos": sorted(present - SCOPE),
                                "ausentes": sorted(SCOPE - present)}))
    for slug in sorted(present):
        manifest = AGENTS / slug / "AGENT.md"
        source = manifest.read_text(encoding="utf-8")
        if POLICY_MARKER not in source:
            problems.append("Agente sem contrato vigente: " + slug)
        if "Gestor" not in source or "rollback" not in source:
            problems.append("Agente sem governanca/rollback: " + slug)

    links = json.loads(LINKS.read_text(encoding="utf-8")).get("links", [])
    aliases = [x.get("slug") for x in links]
    if len(links) != 39 or len(aliases) != len(set(aliases)):
        problems.append("Cadastro de 39 aliases sofreu reducao ou duplicacao")
    preview = json.loads(PREVIEW.read_text(encoding="utf-8"))
    entries = preview.get("folders", [])
    if preview.get("folder_count") != 121 or len(entries) != 121:
        problems.append("Inventario de 121 pastas preview requer nova auditoria")
    if any(x.get("authorized_to_delete") or x.get("authorized_to_move") for x in entries):
        problems.append("Movimento/exclusao requer homologacao segregada")
    summary = {
        "audit": "CONSTRUREI_ARCH_AGENT_CONTRACT_OFFLINE",
        "status": "PASS" if not problems else "FAIL",
        "agents_under_contract": len(present & SCOPE),
        "official_aliases": len(links),
        "preview_folders": len(entries),
        "preview_unclassified": sum(x.get("status") == "UNCLASSIFIED_REVIEW_ONLY" for x in entries),
        "approval_for_deletion_by_guard": False,
        "production_modified": False,
        "external_AI_admin_enforcement_proven": False,
        "e2e_homologation_proven": False,
        "errors": problems,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 1 if problems else 0

if __name__ == "__main__":
    sys.exit(main())
