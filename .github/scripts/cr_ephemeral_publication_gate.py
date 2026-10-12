#!/usr/bin/env python3
"""CONSTRU-REI — build/read/test disposable publication *candidate*, NEVER deploy.

Data sources: existing 39 official links and preview dependency inventory.
No cloud provisioning, no credentials, no publishing, no deletions from Git.
A passing smoke test proves only route bytes served from a temporary loopback;
it DOES NOT approve a switch in GitHub Pages or prove JS/Auth/API behavior.
"""
import hashlib
import http.server
import json
import os
import re
from pathlib import Path, PurePosixPath
import shutil
import socketserver
import subprocess
import tempfile
import threading
import urllib.request
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parents[2]
BASE = "https://rogeriocibin-alt.github.io/construrei-oauth-pages/"
REGISTRY = ROOT / "docs/official-links-registry.json"
PREVIEW = ROOT / "docs/AMBIENTES_PREVIEW_INVENTARIO_20261011.json"

# Conservative roots used in official pages; more dependencies may be found.
# The test NEVER authorizes a cut-over based on directory names alone.
PUBLIC_SUPPORT = {
    "assets", "central", "central-runtime", "central-call",
    "gestor-projeto", "production", "links-oficiais",
}
PUBLIC_ROOT_FILES = {"index.html", "privacy.html", "terms.html", ".nojekyll"}
PROTECTED_PREVIEW_STATES = {
    "ACTIVE_SHARED_SCRIPT_10_F00_F09",
    "ACTIVE_OFFICIAL_CENTRAL_LINK",
    "GESTOR_HISTORICAL_LINK",
    "PRODUCTION_PROVENANCE_REFERENCE",
    "PINNED_RAW_GITHUB_ASSET_IN_PRODUCTION",
    "PRODUCTION_STYLESHEET_REFERENCE",
}

# Static review PR #65: Gabi v21 embeds v20 in a live iframe.
# Preserve this one direct dependency in the disposable stage only.
# Do not treat v20 as an approved permanent archive or deletion candidate.
REQUIRED_TRANSITIVE_PREVIEW = {"app-gabi-v20-documentos-f02-20261008"}

def tracked():
    raw = subprocess.check_output(["git", "-C", str(ROOT), "ls-files", "-z"])
    result = [p.decode("utf-8") for p in raw.split(b"\0") if p]
    assert len(result) == len(set(result)), "Duplicated tracked paths"
    assert all(not p.startswith("/") and ".." not in PurePosixPath(p).parts for p in result)
    return sorted(result)

def main():
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    preview = json.loads(PREVIEW.read_text(encoding="utf-8"))
    official = registry["links"]
    slugs = {x["slug"] for x in official}
    assert len(official) == len(slugs) == 39, "Official link registry drift; abort stage."
    assert len(preview["folders"]) == preview["folder_count"] == 121
    preview_keep = {p["path"].rstrip("/").split("/")[1] for p in preview["folders"]
                    if p["status"] in PROTECTED_PREVIEW_STATES}
    assert len(preview_keep) == 12, "Review protected preview inventory drift before staging."
    inventory_folders = {p["path"].strip("/").split("/")[1] for p in preview["folders"]}
    assert REQUIRED_TRANSITIVE_PREVIEW <= inventory_folders, "Required Gabi v20 dependency missing"
    assert REQUIRED_TRANSITIVE_PREVIEW.isdisjoint(preview_keep), "Reclassify approved runtime dependencies first"
    preview_keep |= REQUIRED_TRANSITIVE_PREVIEW
    assert len(preview_keep) == 13, "Review stage runtime dependency closure"
    all_paths = tracked()
    all_set = set(all_paths)
    expected = {f"{slug}/index.html" for slug in slugs}
    expected |= {
        "production/central-operacional-v2-ux-r1-2-homologada-20261005/index.html",
        "production/dashboard-financeiro-v4/index.html",
        "gestor-projeto/index.html",
        "preview/_shared/cr-checklist-native-20261004.js",
        "preview/app-gabi-v21-parecer-logo-20261008/index.html",
        "preview/app-gabi-v20-documentos-f02-20261008/index.html",
    }
    absent = sorted(expected - all_set)
    assert not absent, "Cannot stage missing official routes/dependencies: " + repr(absent)
    selected = []
    withheld_unclassified = []
    for rel in all_paths:
        parts = PurePosixPath(rel).parts
        top = parts[0]
        if rel in PUBLIC_ROOT_FILES or top in slugs or top in PUBLIC_SUPPORT:
            selected.append(rel)
        elif top == "preview" and len(parts) > 2 and parts[1] in preview_keep:
            selected.append(rel)
        else:
            if top == "preview":
                withheld_unclassified.append(rel)
    selected_set = set(selected)
    assert expected <= selected_set
    # No known ops route omitted, and no source control/private archive in stage.
    assert not any(p.startswith((".github/", "docs/", "archive/", "snapshots/", "agents/"))
                   for p in selected)
    assert not any(p.startswith("preview/") and p.split("/")[1] not in preview_keep
                   for p in selected)
    assert withheld_unclassified, "No withheld candidate previews; check baseline."

    digest = hashlib.sha256()
    total = 0
    with tempfile.TemporaryDirectory(prefix="cr-ephemeral-stage-") as temp:
        target = Path(temp)
        for rel in selected:
            source = ROOT / rel
            assert source.is_file() and not source.is_symlink(), "Unsafe stage source: " + rel
            dest = target / rel
            dest.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, dest)
            data = dest.read_bytes()
            assert data == source.read_bytes(), "Copy differs: " + rel
            digest.update(rel.encode("utf-8") + b"\0" + hashlib.sha256(data).digest())
            total += len(data)
        # Local-only ephemeral HTTP check: no external requests, no DB, no Auth.
        class Handler(http.server.SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=str(target), **kwargs)
            def log_message(self, *_):
                pass
        class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
            daemon_threads = True
            allow_reuse_address = True
        with Server(("127.0.0.1", 0), Handler) as server:
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            base = f"http://127.0.0.1:{server.server_port}/"
            smoke = sorted(expected)
            smoke += [s + "/index.html" for s in sorted(slugs)]
            seen = set()
            try:
                for rel in smoke:
                    if rel in seen:
                        continue
                    seen.add(rel)
                    with urllib.request.urlopen(base + rel, timeout=5) as resp:
                        payload = resp.read()
                        assert resp.status == 200 and payload, "Failed HTTP route: " + rel
                        if rel.endswith(".html"):
                            assert b"<" in payload, "HTML bytes missing: " + rel
            finally:
                server.shutdown()
                thread.join(timeout=5)
        # Read-only consumer scan over potential operational entrypoints.
        # This catches explicit literal links, not composed/dynamic JS paths.
        preview_folders = {p["path"].split("/")[1] for p in preview["folders"]}
        literal_ref = re.compile(rb"preview/([A-Za-z0-9_.~-]+)")
        live_consumers = {}
        snapshot_consumers = {}
        for rel in selected:
            if not rel.endswith((".html", ".css", ".js", ".json", ".svg")):
                continue
            raw = (ROOT / rel).read_bytes()
            if len(raw) > 3_000_000:
                continue
            folders = {m.group(1).decode("ascii", "ignore")
                       for m in literal_ref.finditer(raw)}
            found = sorted(folders & preview_folders)
            if not found:
                continue
            # Historical UI record intentionally contains links to older
            # candidates, which are references, not deletion authorization.
            dest = snapshot_consumers if rel.startswith("preview/") or rel == "gestor-projeto/project-data.json" else live_consumers
            for folder in found:
                dest.setdefault(folder, []).append(rel)
        directly_excluded = {
            folder: sorted(set(origins))
            for folder, origins in live_consumers.items()
            if folder not in preview_keep
        }
        directly_protected = {
            folder: sorted(set(origins))
            for folder, origins in live_consumers.items()
            if folder in preview_keep
        }
        summary = {
            "kind": "DRY_RUN_LOCAL_ONLY",
            "production_published": False,
            "production_modified": False,
            "new_cloud_host_or_database": False,
            "new_scheduled_workflows": False,
            "official_aliases_tested": len(official),
            "local_routes_checked": len(seen),
            "included_tracked_files": len(selected),
            "included_bytes": total,
            "excluded_tracked_files": len(all_paths) - len(selected),
            "excluded_preview_files": len(withheld_unclassified),
            "static_preview_folders_referenced_from_operational_tree": len(live_consumers),
            "static_preview_folders_referenced_but_excluded_from_stage": len(directly_excluded),
            "static_preview_refs_to_protected_folders": len(directly_protected),
            "excluded_but_referenced_folders_sample": dict(list(sorted(directly_excluded.items()))[:20]),
            "historical_snapshot_preview_ref_folders": len(snapshot_consumers),
            "static_consumer_scan_complete": False,
            "preview_folders_preserved_in_candidate": len(preview_keep),
            "transitive_preview_dependency_folders": sorted(REQUIRED_TRANSITIVE_PREVIEW),
            "candidate_manifest_digest": digest.hexdigest(),
            "eligible_for_production_cutover": False,
            "next_gate": "Review remaining unclassified runtime dependencies; then UX mobile/notebook and rollback. Do not publish automatically.",
            "blind_spots": [
                "No JS execution or browser/cookie service-worker test",
                "No authorized Supabase Auth, OAuth, RLS or data writes",
                "No dynamic URL dependency closure proven",
                "No live Trello/Click/Cora/Google Calendar integrations",
                "No recovery of live data in disposable DB",
            ],
        }
        print(json.dumps(summary, ensure_ascii=False, indent=2))
        if os.environ.get("GITHUB_STEP_SUMMARY"):
            with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
                f.write("### Publicação: candidata efêmera SEM deploy\n")
                for k in ("official_aliases_tested", "local_routes_checked",
                          "included_tracked_files", "excluded_preview_files",
                          "candidate_manifest_digest",
                          "static_preview_folders_referenced_but_excluded_from_stage",
                          "static_preview_refs_to_protected_folders"):
                    f.write(f"- {k}: \`{summary[k]}\`\n")
                f.write("- **NOT_FOR_PRODUCTION_CUTOVER**: dependências e UX ainda exigem verificação.\n")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
