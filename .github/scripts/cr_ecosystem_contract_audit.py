#!/usr/bin/env python3
"""Ecossistema CONSTRU-REI: contract inventory / drift gate (read-only).

This consumes EXISTING canonical sources; it is not a second master database.
It does not check live URLs, credentials, finance amounts, cross-tenant security
or backup restore. It never writes into application code or production data.
"""
import collections
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[2]
DOCS = ROOT / "docs"
RULES = DOCS / "CANONICAL_RULES_MASTER_INDEX_V1_20261007.md"
LINKS = DOCS / "official-links-registry.json"
PROJECT = ROOT / "gestor-projeto/project-data.json"
VERSION = ROOT / "gestor-projeto/version.json"
PREVIEW = DOCS / "AMBIENTES_PREVIEW_INVENTARIO_20261011.json"
OWNERS = DOCS / "MATRIZ_PROPRIEDADE_DADOS_E_ROTEAMENTO_20261012.md"
EDGE_GRAPH = DOCS / "EDGE_OFFICIAL_LITERAL_GRAPH_20261012.json"
WORKFLOWS = ROOT / ".github/workflows"
# All 27 pre-existing governance rules reconciled; refuse future silent drift.
# Any new rule must appear in both the master index and Gestor fallback.
KNOWN_DOC_ONLY = set()
KNOWN_GESTOR_ONLY = set()
MIN_ALIASES = 39
# Identity/function contracts replace the obsolete pre-V2 total workflow count.
CRITICAL_BACKUP_WORKFLOWS = {
    "construrei-cloud-backup.yml": "canonical",
    "cofre-zero-history-full.yml": "weekly_archive",
    "cofre-zero-trello-offsite.yml": "same_schedule_dispatch",
}
ARCHIVE_UTC_CRON = "47 8 * * 0"


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def main():
    errors = []
    warnings = []
    required = [
        RULES, LINKS, PROJECT, VERSION, PREVIEW,
        ROOT / "gestor-projeto/index.html",
        ROOT / "gestor-projeto/sw.js",
        ROOT / "docs/ARQUITETURA_TRES_AMBIENTES_PLANO_20261011.md",
        ROOT / "docs/CONSTRUREI_CURRENT_STATE.md",
        OWNERS, EDGE_GRAPH,
        ROOT / ".github/scripts/cr_central_full_scope_audit.py",
    ]
    for path in required:
        if not path.is_file():
            errors.append("Required master or protected component missing: " + str(path.relative_to(ROOT)))
    if errors:
        print(json.dumps({"errors": errors}, ensure_ascii=False, indent=2))
        return 1

    reg, project, version, preview = map(load, (LINKS, PROJECT, VERSION, PREVIEW))
    aliases = reg.get("links", [])
    slugs = [item.get("slug", "") for item in aliases]
    if len(aliases) < MIN_ALIASES:
        errors.append("The existing official alias catalogue shrank below its agreed baseline")
    if len(slugs) != len(set(slugs)):
        errors.append("Duplicate official alias slug")
    if not {"central", "gestor-projeto", "app-construrei", "gestao-financeira"}.issubset(slugs):
        errors.append("Official Central / Gestor / APP / Financeiro access missing")
    for item in aliases:
        if urlsplit(item.get("target", "")).scheme != "https":
            errors.append("Non-HTTPS target registered for alias " + item.get("slug", "<unnamed>"))

    # The existing 39 public aliases fan into two direct Edge roots for the
    # majority of routes. Protect direct roots from accidental redirects,
    # *without* inferring that other Edge functions have zero consumers.
    direct_edge_counts = collections.Counter()
    for item in aliases:
        target = urlsplit(item.get("target", ""))
        if (target.netloc == "yspuaamokjbrosytqjpg.supabase.co"
                and target.path.startswith("/functions/v1/")):
            slug = target.path[len("/functions/v1/"):].split("/")[0]
            if slug:
                direct_edge_counts[slug] += 1
    direct_edge_count = sum(direct_edge_counts.values())
    expected_roots = {"centro-operacoes": 24, "central-atendimento": 11}
    if len(aliases) == 39 and dict(direct_edge_counts) != expected_roots:
        errors.append("Official direct Edge gateway contract changed; require explicit homologation: "
                      + repr({"expected": expected_roots,
                              "observed": dict(direct_edge_counts)}))
    if EDGE_GRAPH.is_file():
        graph = load(EDGE_GRAPH)
        nodes = graph.get("functions", [])
        node_slugs = [n.get("slug") for n in nodes]
        all_slugs = set(node_slugs)
        if (graph.get("artifact") != "CR_OFFICIAL_EDGE_LITERAL_GRAPH_READ_ONLY"
                or graph.get("retirement_authorized") is not False
                or graph.get("live_execution_verified") is not False
                or graph.get("authority") != "DATED_EVIDENCE_ONLY_NOT_A_DEPENDENCY_DATABASE"):
            errors.append("Edge dated inventory lost its read-only provenance or no-delete gate")
        if len(nodes) < 11 or len(node_slugs) != len(all_slugs):
            errors.append("Edge graph baseline shrank or has duplicated slugs")
        if graph.get("official_entry_routes") != expected_roots:
            errors.append("Edge graph direct entry route counts drifted from protected aliases")
        if not set(expected_roots).issubset(all_slugs):
            errors.append("Official Edge roots missing from dated graph")
        for node in nodes:
            if (node.get("status") != "ACTIVE"
                    or not isinstance(node.get("version"), int)
                    or not isinstance(node.get("direct_literal_references"), list)):
                errors.append("Invalid Edge source snapshot node: " + str(node.get("slug")))
            if not set(node.get("direct_literal_references", [])).issubset(all_slugs):
                errors.append("Partial Edge snapshot: out-of-scope references in " + str(node.get("slug")))
        warnings.append("Edge code graph is a dated literal snapshot, not a live authorization or runtime dependency proof")

    if OWNERS.is_file():
        owners_text = OWNERS.read_text(encoding="utf-8")
        for required_term in (
            "Matriz de propriedade", "35", "centro-operacoes",
            "central-atendimento", "Trello", "Google Calendar",
            "Click", "idempotency_key", "não",
        ):
            if required_term not in owners_text:
                errors.append("Source-of-truth evidence lacks: " + required_term)

    # Index is the written authority; PWA JSON is a projection/fallback, not another rule master.
    master_ids = re.findall(
        r"^###\s+([A-Z][A-Z0-9]*-\d{3})\s+[—–-]",
        RULES.read_text(encoding="utf-8"), flags=re.MULTILINE,
    )
    gestalt_ids = [r.get("id") for r in project.get("canonical_rules", [])]
    for label, ids in (("Index", master_ids), ("Gestor snapshot", gestalt_ids)):
        if len(ids) != len(set(ids)):
            errors.append(label + " has duplicated rule IDs")
        if not ids:
            errors.append(label + " has no rule IDs")
    if len(master_ids) < 27 or len(gestalt_ids) < 27:
        errors.append("Canonical 27/27 reconciled baseline shrank unexpectedly")
    doc_only = set(master_ids) - set(gestalt_ids)
    gestor_only = set(gestalt_ids) - set(master_ids)
    unexpected_doc = doc_only - KNOWN_DOC_ONLY
    unexpected_gestor = gestor_only - KNOWN_GESTOR_ONLY
    if unexpected_doc or unexpected_gestor:
        errors.append("Unregistered drift in canonical rule IDs: " +
                      repr({"index_only": sorted(unexpected_doc),
                            "gestor_only": sorted(unexpected_gestor)}))
    if doc_only or gestor_only:
        warnings.append("Pre-existing rule drift, owner reconciliation required; no rule was deleted")
    if not {"GOV-001", "GOV-003", "GOV-004", "ARCH-001", "ARCH-002",
            "PEND-001", "DEV-001", "LINK-001"}.issubset(master_ids):
        errors.append("Fundamental governance controls disappeared from Index Master")

    # Only extract semantics; don't declare different version fields corrupt.
    release = {
        "version_json": version.get("version"),
        "version_build": version.get("build"),
        "gestor_snapshot_label": project.get("meta", {}).get("version"),
        "gestor_snapshot_build": project.get("meta", {}).get("build"),
        "source_of_live_release": "NOT_VERIFIED_BY_STATIC_AUDIT",
    }
    if not release["version_json"] or not release["version_build"]:
        errors.append("Gestor release metadata is incomplete")
    warnings.append("Gestor release semantics/runtime still require reconciliation and live check")

    # Release identity in repository source: the service worker cache key and
    # HTML build marker must match version.json. project-data.json is a
    # separate dated governance snapshot and may retain another version label.
    # Do not mutate it or claim this proves what is served behind a PWA cache.
    index_text = (ROOT / "gestor-projeto/index.html").read_text(encoding="utf-8")
    sw_text = (ROOT / "gestor-projeto/sw.js").read_text(encoding="utf-8")
    index_build = re.search(r'<meta\s+name="cr-build"\s+content="([^"]+)"', index_text)
    sw_build = re.search(r"""(?m)^\s*const\s+BUILD\s*=\s*['"]([^'"]+)['"]""", sw_text)
    builds = {
        "version_json_build": version.get("build"),
        "index_meta_build": index_build.group(1) if index_build else None,
        "service_worker_cache_build": sw_build.group(1) if sw_build else None,
    }
    release["repository_build_contract"] = builds
    release["repository_builds_consistent"] = (
        all(builds.values()) and len(set(builds.values())) == 1
    )
    release["repo_static_conformance_is_not_live_pwa_verification"] = True
    # app.js is the *running* release classifier used by update prompts and
    # version chip. Its value may be older than package metadata even when
    # HTML/SW/version.json agree. Surface it separately; do not silently
    # rewrite a homologated UI or bypass mobile PWA/cache testing.
    app_js = (ROOT / "gestor-projeto/app.js").read_text(encoding="utf-8")
    js_release = re.search(
        r"(?s)const\s+CURRENT_RELEASE\s*=\s*\{\s*version\s*:\s*'([^']+)'\s*,"
        r"\s*build\s*:\s*'([^']+)'", app_js)
    chip_literal = re.search(
        r"chip\.textContent\s*=\s*'([^']+)'", app_js)
    release["app_js_release_identity"] = {
        "version": js_release.group(1) if js_release else None,
        "build": js_release.group(2) if js_release else None,
        "chip_label": chip_literal.group(1) if chip_literal else None,
        "verified_in_live_browser": False,
    }
    release["app_js_agrees_with_version_manifest"] = bool(
        js_release and js_release.group(1) == version.get("version")
        and js_release.group(2) == version.get("build")
    )
    if not release["app_js_agrees_with_version_manifest"]:
        warnings.append(
            "Gestor app.js release identity differs from version.json; "
            "runtime update banner/version chip may be stale. "
            "Candidate fix requires PWA/cache and mobile/notebook homologation"
        )
    if not release["repository_builds_consistent"]:
        errors.append("Gestor index / Service Worker / version.json build identities differ")
    if project.get("meta", {}).get("version") != version.get("version"):
        warnings.append("Snapshot project-data has independent version metadata; never auto-promote snapshot as published runtime")

    active = preview.get("production_contracts", [])
    if not active:
        errors.append("Known production dependencies on preview/ lost from snapshot")
    for dep in active:
        src = dep.get("source", "")
        if not src.startswith("preview/"):
            errors.append("Preview dependency record lacks a preview/ path")
        if dep.get("id") in {"f00_f09_checklist_script", "central_official_app_gabi"}:
            if not (ROOT / src).exists():
                errors.append("Protected operational preview dependency missing: " + src)
    folders = preview.get("folders", [])
    if len(folders) != preview.get("folder_count"):
        errors.append("Preview inventory folder count inconsistent")
    if any(f.get("authorized_to_delete") or f.get("authorized_to_move") for f in folders):
        errors.append("An unapproved preview move/delete flag was introduced")
    # Counts are snapshot evidence, not the full live deployment inventory.
    status = collections.Counter(f.get("status", "UNREVIEWED") for f in folders)
    warnings.append("preview/ inventory is a dated Git snapshot, not a proven runtime dependency graph")

    # COFRE ZERO canonico: artefatos antigos são rollback, não execução concorrente.
    cofre_release = "COFRE_ZERO_WEEKLY_CANONICAL_20261024_R1"
    cofre = project.get("cofre_zero_canonical", {})
    declared = version.get("cofre_zero_canonical", {})
    manifest = DOCS / "COFRE_ZERO_CANONICO_SEMANAL_20261024.md"
    if not manifest.is_file() or cofre_release not in manifest.read_text(encoding="utf-8"):
        errors.append("Missing unique Cofre Zero canonical weekly release manifest")
    if cofre.get("version") != cofre_release or declared.get("release") != cofre_release:
        errors.append("Cofre Zero project-data and version registry not linked to canonical weekly release")
    if (cofre.get("operational_status") != "weekly_active"
            or cofre.get("complete_ecosystem_restore_homologated") is not False
            or declared.get("ecosystem_full_restore_proven") is not False
            or declared.get("legacy_daily_active") is not False):
        errors.append("Cofre Zero release lost weekly authority or external restore truth boundary")
    planned = cofre.get("cloud_scheduler", {})
    if (planned.get("job") != "construrei-backup-diario"
            or planned.get("cron") != "0 3 * * 0"
            or planned.get("timezone") != "America/Sao_Paulo"
            or planned.get("status") != "ENABLED"):
        errors.append("Cofre Zero Cloud scheduler declaration reverted to legacy/daily")
    if cofre.get("github", {}).get("cron_utc") != ARCHIVE_UTC_CRON:
        errors.append("Cofre Zero GitHub weekly schedule declaration diverged")
    if not any(
        x.get("id") == "backup" and "SEMANAL" in x.get("description", "")
        and "diário às 03:00" not in x.get("description", "")
        for x in project.get("owner_access", [])
    ):
        errors.append("Gestor still presents historical daily backup as active")
    if any("Backup automático diário às 03:00 permanece inalterado" in str(x)
           for x in version.get("changes", [])):
        errors.append("Stale Cofre Zero daily claim leaked into published PWA metadata")
    if (cofre.get("deprecated", {}).get("legacy_scheduler_mode") != "DELETED_ARCHIVED"
            or cofre.get("cloud_scheduler", {}).get("only_active_job_confirmed") is not True):
        errors.append("Cofre Zero legacy Cloud Scheduler deletion / unique live job proof missing")
    if not (cofre.get("precedence", "").startswith("LIVE_AUTHENTICATED_OPERATOR")
            and cofre.get("deprecated", {}).get("prior_snapshots") == "READ_ONLY_RECOVERY_ONLY"):
        errors.append("Historical Cofre Zero snapshots could regain operational authority")

    workflow_files = sorted([*WORKFLOWS.glob("*.yml"), *WORKFLOWS.glob("*.yaml")])
    workflow_names = {f.name for f in workflow_files}
    cofre_crons = []
    for file in workflow_files:
        if any(token in file.stem.lower() for token in ("cofre", "backup")):
            workflow = file.read_text(encoding="utf-8")
            found = re.findall(r'^\s*-\s*cron:\s*["\x27]?([^"\x27\n#]+)', workflow, re.MULTILINE)
            cofre_crons.extend((file.name, cron.strip()) for cron in found)
    if cofre_crons != [("cofre-zero-history-full.yml", ARCHIVE_UTC_CRON)]:
        errors.append("Cofre Zero duplicate/obsolete cron reintroduced: " + repr(cofre_crons))
    for essential, role in CRITICAL_BACKUP_WORKFLOWS.items():
        if essential not in workflow_names:
            errors.append("Missing critical Cofre Zero workflow: " + essential + " (role=" + role + ")")
    canonical = WORKFLOWS / "construrei-cloud-backup.yml"
    if canonical.is_file():
        text = canonical.read_text(encoding="utf-8")
        if "workflow_dispatch:" not in text or "group: construrei-cloud-backup" not in text:
            errors.append("Canonical Cofre Zero lost dispatch or concurrency lock")
        if "HISTORY_FULL" not in text or "SHA256SUMS.txt" not in text or "rclone check" not in text:
            errors.append("Canonical Cofre Zero lost archive/manifest/integrity gates")
        # FULL snapshots are manual-only; the historical CAS now uses the approved weekly schedule.
        # Fail if an accidental automatic trigger would reintroduce full Storage copies.
        if not re.search(r"(?m)^on:\s*$", text):
            errors.append("Canonical FULL workflow lost its event block")
        if re.search(r"(?m)^  (?:push|schedule|pull_request|pull_request_target):\s*$", text):
            errors.append("Canonical FULL must remain manual-only (no automatic trigger)")
    history = WORKFLOWS / "cofre-zero-history-full.yml"
    if history.is_file():
        text = history.read_text(encoding="utf-8")
        scheduled = re.findall(r'^\s*-\s*cron:\s*["\x27]?([^"\x27\n#]+)', text, re.MULTILINE)
        if [x.strip() for x in scheduled] != [ARCHIVE_UTC_CRON]:
            errors.append("Cofre Zero history must have one Sunday 05:47 America/Sao_Paulo schedule")
        if re.search(r"(?m)^  push:\s*$", text):
            errors.append("Cofre Zero weekly CAS must not run on ordinary pushes")
        if "cofre-zero-history-full" not in text or "cancel-in-progress: false" not in text:
            errors.append("Cofre Zero history concurrency contract changed")
        if "cr_history_cas_append.py" not in text or "cr_sql_restore_preflight.py" not in text:
            errors.append("Cofre Zero history lost CAS or SQL restore preflight")
        if "static_site_recovery_weekly:" not in text or "git_offsite_weekly:" not in text:
            errors.append("Cofre Zero weekly lost Git history or Central/Gestor recovery proof")
        if "trello_text_weekly_dispatch:" not in text:
            errors.append("Cofre Zero Trello incremental dispatch no longer under single weekly schedule")
        if "exit 21" not in text:
            errors.append("Cofre Zero history lost fail-closed Drive marker access check")
    workflows = []
    crons = collections.defaultdict(list)
    for file in workflow_files:
        raw = file.read_text(encoding="utf-8")
        # Inventory only. Cron text is not evidence that runs succeeded.
        expressions = re.findall(r'^\s*-\s*cron:\s*["\x27]?([^"\x27\n#]+)', raw, re.MULTILINE)
        for expression in expressions:
            crons[expression.strip()].append(file.name)
        workflows.append({"name": file.name, "cron_expressions": expressions,
                          "configured_only": True})
    shared_schedules = {k: v for k, v in crons.items() if len(v) > 1}
    if shared_schedules:
        warnings.append("Multiple GitHub workflows share cron expressions; review purpose before consolidating")
    warnings.append("Cloud Scheduler, Supabase, Netlify, Trello and SQL restoration need separate authenticated checks")

    products = project.get("products", [])
    product_ids = [p.get("id") for p in products]
    if len(product_ids) != len(set(product_ids)):
        errors.append("Duplicated Gestor product IDs")
    if not {"central", "gestor", "app", "dashboard"}.issubset(product_ids):
        errors.append("Critical product absent from Gestor fallback")
    evidence = {
        "audit": "ECOSYSTEM_CONTRACT_STATIC_ONLY",
        "data_authorities": {
            "links": "docs/official-links-registry.json",
            "governance_rules": "docs/CANONICAL_RULES_MASTER_INDEX_V1_20261007.md",
            "gestor_snapshot": "gestor-projeto/project-data.json (projection, not verified live)",
            "preview_snapshot": "docs/AMBIENTES_PREVIEW_INVENTARIO_20261011.json",
            "workflow_definitions": ".github/workflows/ (configured, execution unverified)",
        },
        "official_aliases": len(aliases),
        "official_direct_edge_gateway": {
            "route_count": direct_edge_count,
            "root_slug_counts": dict(sorted(direct_edge_counts.items())),
            "direct_roots_only_not_internal_dependencies": True,
            "approval_to_decommission_any_function": False,
            "source": "docs/official-links-registry.json",
        },
        "data_ownership_evidence": str(OWNERS.relative_to(ROOT)),
        "edge_literal_graph_evidence": {"source": str(EDGE_GRAPH.relative_to(ROOT)),
                                        "snapshot_only": True,
                                        "nodes": len(nodes) if EDGE_GRAPH.is_file() else 0,
                                        "no_deletion_authorized": True},
        "official_alias_groups": dict(sorted(collections.Counter(x.get("group", "N/A") for x in aliases).items())),
        "gestor_products_snapshot": len(products),
        "canonical_rule_count": {"index": len(master_ids), "gestor_snapshot": len(gestalt_ids),
                                 "index_only": sorted(doc_only), "gestor_only": sorted(gestor_only)},
        "gestor_version_metadata": release,
        "preview_snapshot": {"folders": len(folders), "status_counts": dict(sorted(status.items())),
                             "protected_runtime_references": len(active), "approved_to_move": 0},
        "github_workflow_inventory": workflows,
        "shared_cron_expressions_for_review": shared_schedules,
        "production_modified": False,
        "external_live_verification": False,
        "restore_tested": False,
        "warnings": warnings,
        "errors": errors,
    }
    print(json.dumps(evidence, ensure_ascii=False, indent=2))
    summary = (
        "### CONSTRU-REI | contrato de ecossistema (auditoria estática)\n"
        f"- Links oficiais: **{len(aliases)}**; produtos do Gestor no snapshot: **{len(products)}**\n"
        f"- Regras: Índice **{len(master_ids)}**, Gestor fallback **{len(gestalt_ids)}**; "
        f"diferenças conhecidas: {', '.join(sorted(doc_only | gestor_only)) or 'nenhuma'}\n"
        f"- Inventário preview/: **{len(folders)}** pastas; workflows GitHub configurados: **{len(workflow_files)}**\n"
        f"- Alertas: **{len(warnings)}** | erros contratuais: **{len(errors)}**\n"
        "- **Sem** teste de login, saldo, APIs vivas, backup/restore ou isolamento físico de ambientes.\n"
    )
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as out:
            out.write(summary)
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())
