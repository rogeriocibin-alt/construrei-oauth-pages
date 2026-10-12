#!/usr/bin/env python3
"""Check the whole official Central contract, not only F00-F09.

Read-only, deterministic, local static audit.
Source of truth for aliases: docs/official-links-registry.json.
This is NOT an availability, API, finance-value or UX certification.
"""
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = ROOT / "docs/official-links-registry.json"
CENTRAL = ROOT / "production/central-operacional-v2-ux-r1-2-homologada-20261005/index.html"
PROD = ROOT / "production/central-operacional-v2-ux-r1-2-homologada-20261005"
BASE = "https://rogeriocibin-alt.github.io/construrei-oauth-pages/"
# Names are coverage descriptions and signal markers, NOT parallel source URLs.
# Single authoritative URL registry remains official-links-registry.json.
CONTRACTS = (
    ("Central / painel executivo", "central", ('data-page="dashboard"', 'id="dashboard"', 'Dashboard Executivo', 'crDirectorDashboardMenuV1')),
    ("Dashboard Financeiro V4", "gestao-financeira", ('id="crFinanceDashNav"', 'production/dashboard-financeiro-v4/')),
    ("APP CONSTRU-REI / Gabi", "app-construrei", ('id="crAppCanonicalNav"', 'preview/app-gabi-v21-parecer-logo-20261008/')),
    ("Checklist operacional / Vercel", "checklist-operacional", ('data-page="checklist"', 'id="checkCard"', 'checklistobrasconstrurei.vercel.app')),
    ("Pendencias APP", "pendencias-app", ('data-page="pendapp"', 'id="appBoard"')),
    ("Pendencias WIZY", "pendencias-wizy-flow", ('data-page="wizy"', 'id="boardSummary"')),
    ("Pendencias Eder", "pendencias-eder-agora", ('data-page="eder"', 'id="boardSummary"')),
    ("Apresentacao institucional", "apresentacao", ('data-page="presentation"', 'id="presentation"')),
    ("Documentacao", "documentacao", ('data-page="docs"', 'id="docs"')),
    ("Sala da Equipe / Meet", "google-meet-central", ('data-page="meeting"', 'id="meeting"', 'meet.google.com/')),
    ("Diretoria", "diretoria-master", ('data-page="admin"',)),
    ("Admin tecnico", "admin-tecnico", ('data-page="technical"',)),
    ("Agenda operacional", "f04-agenda", ('id="crAgendaToday"', 'crHeroDate')),
    ("Click / painel de orcamentos", "gestao-financeira", ('GestãoClick', 'cr-budget-status', 'crBizQuick')),
    ("Click / cartoes e totais", "gestao-financeira", ('cr-budget-status', 'cr-budget-head', 'concluídos')),
    ("Medidores / KPIs executivos", "central", ('id="kpis"', 'homeKpi(', 'executive-meters-r8.css')),
    ("Fonte de indicadores executivos", "central", ('dashboard-executivo-summary.candidate.json', 'crLoadExecSnapshot')),
    ("Pendencias vivas / API", "pendencias-app", ('central-pendencias-cockpit', 'central-pendencias-write')),
    ("Academy", "academy", ('data-page="academy"',)),
    ("Acesso Gestor", "gestor-projeto", ('gestor-projeto/?view=infrastructure',)),
    ("Esteira F00-F09 / hub", "f00-captura-inteligente", ('id="flowFull"', 'data-page="flows"')),
)
REQUIRED_LOCAL_FILES = (
    "production/central-operacional-v2-ux-r1-2-homologada-20261005/presentation/index.html",
    "production/central-operacional-v2-ux-r1-2-homologada-20261005/call/index.html",
    "production/central-operacional-v2-ux-r1-2-homologada-20261005/executive-meters-r8.css",
    "production/dashboard-financeiro-v4/index.html",
    "preview/app-gabi-v21-parecer-logo-20261008/index.html",
    "gestor-projeto/index.html",
    "gestor-projeto/sw.js",
)
LIMITATIONS = (
    "Aliases declared as official are not proof of HTTP success, access rights, or live integration.",
    "Embedded metrics/Click UI checks establish source presence, not value accuracy or external API health.",
    "An operational component still under preview/ is PROTECTED_DEPENDENCY, not an archival candidate.",
    "Historical 'candidate.json' referenced by the official executive dashboard must be reviewed before migration.",
)
def main():
    record = json.loads(REGISTRY.read_text(encoding="utf-8"))
    html = CENTRAL.read_text(encoding="utf-8")
    links = record.get("links", [])
    errors = []
    by_slug = {}
    if len(links) < 39:
        errors.append("Approved alias registry unexpectedly shrunk below 39 entries")
    for link in links:
        slug = link.get("slug", "")
        alias = link.get("public_url", "")
        target = link.get("target", "")
        if slug in by_slug:
            errors.append("Duplicated alias slug: " + slug)
        by_slug[slug] = link
        if not re.fullmatch(r"[a-z0-9][a-z0-9-]*", slug):
            errors.append("Invalid alias slug: " + repr(slug))
            continue
        if alias != BASE + slug + "/":
            errors.append("Public alias changed outside stable base: " + slug)
        if not (ROOT / slug / "index.html").is_file():
            errors.append("Public alias HTML is missing: " + slug)
        if urlparse(target).scheme != "https":
            errors.append("Invalid canonical target scheme: " + slug)
    for p in REQUIRED_LOCAL_FILES:
        if not (ROOT / p).is_file():
            errors.append("Protected Central linked resource missing: " + p)
    per_area = {}
    for title, alias, markers in CONTRACTS:
        if alias not in by_slug:
            errors.append("Full Central coverage lost official alias: " + title + " -> " + alias)
        missing = [needle for needle in markers if needle not in html]
        if missing:
            errors.append("Missing Central feature anchors: " + title + " -> " + repr(missing))
        per_area[title] = "FAIL" if missing or alias not in by_slug else "STATIC_PRESENT"
    expected_modes = {f"f{i:02d}" for i in range(10)}
    registered_modes = set()
    for item in links:
        mode = re.fullmatch(r"f(0\d)-.*", item.get("slug", ""))
        if mode:
            registered_modes.add("f" + mode.group(1))
    if registered_modes != expected_modes:
        errors.append("F00-F09 alias coverage incomplete: " + repr(sorted(expected_modes - registered_modes)))
    if len(CONTRACTS) != len(per_area):
        errors.append("Duplicate coverage ID in full Central audit")
    special = {
        "app_from_public_preview": "preview/app-gabi-v21-parecer-logo-20261008/" in html,
        "executive_from_candidate_named_snapshot": "dashboard-executivo-summary.candidate.json" in html,
        "checklist_external_vercel": "checklistobrasconstrurei.vercel.app" in html,
        "uses_supabase_pendencias_api": "central-pendencias-cockpit" in html,
    }
    report = {
        "source_registry": str(REGISTRY.relative_to(ROOT)),
        "central_source": str(CENTRAL.relative_to(ROOT)),
        "registered_official_aliases": len(links),
        "checked_central_feature_groups": len(CONTRACTS),
        "feature_anchor_presence": per_area,
        "cross_host_and_preview_dependencies": special,
        "changed_links_or_application_files": 0,
        "limits": LIMITATIONS,
        "errors": errors,
    }
    print(json.dumps(report, ensure_ascii=False, indent=2))
    if errors:
        sys.exit("FAIL: " + "; ".join(errors))
    print(f"PASS: {len(links)} aliases; {len(CONTRACTS)} protected feature groups; 10 flow aliases; 0 runtime modifications.")
if __name__ == "__main__":
    main()
