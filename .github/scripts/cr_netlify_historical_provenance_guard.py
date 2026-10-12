#!/usr/bin/env python3
"""Netlify historical source provenance guard. Git-only, read-only.

The six Netlify sites without a currently published deploy cannot yield a
published static backup. Historical Git candidates are NOT Netlify recoveries.
This guards only known possible source provenance from accidental deletion.
"""
import hashlib
import json
from pathlib import Path
from cofre_netlify_inventory_offsite import SITES

ROOT = Path(__file__).resolve().parents[2]
CANDIDATES = {
    "construrei-f01": ["central-runtime/f01-canonical-20261001/index.html"],
    "construrei-home-reference-preview-20260930": ["preview/home-reference-20260930/index.html"],
    "construrei-f00-canonical-preview-20261001": ["preview/f00-canonical-ui-20261001/index.html"],
}
NO_IDENTICAL_SOURCE_IDENTIFIED = {
    "construrei-knowledge-v3",
    "construrei-central-failover-v1",
    "construrei-agenda-v52",
}
PUBLISHED_STATIC_SNAPSHOT_ALREADY_VERIFIED = {"construrei-dashboard"}


def build():
    registered = [n for n, _ in SITES]
    assert len(registered) == len(set(registered)) == 7, "Unexpected site inventory"
    assert (set(CANDIDATES) | NO_IDENTICAL_SOURCE_IDENTIFIED |
            PUBLISHED_STATIC_SNAPSHOT_ALREADY_VERIFIED) == set(registered), "Site classification drift"
    assert len(CANDIDATES) == 3
    entries = []
    for site in sorted(CANDIDATES):
        paths = []
        for rel in CANDIDATES[site]:
            file = ROOT / rel
            assert file.is_file() and not file.is_symlink(), "Historical Git candidate missing: " + rel
            data = file.read_bytes()
            assert data, "Empty candidate file: " + rel
            paths.append({"path": rel, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
        entries.append({"netlify_site": site, "classification": "GIT_RELATED_SOURCE_CANDIDATE_NOT_DEPLOY_BACKUP", "files": paths})
    return {
        "kind": "HISTORICAL_NETLIFY_SOURCE_PROVENANCE_GUARD",
        "registered_sites": len(registered),
        "published_static_restore_from_netlify_previous_audit": 1,
        "no_current_published_deploy_previous_audit": 6,
        "git_related_source_candidate_sites": len(entries),
        "no_identical_source_identified_sites": sorted(NO_IDENTICAL_SOURCE_IDENTIFIED),
        "related_source_candidates": entries,
        "new_host_or_database": False,
        "netlify_deployment_created": False,
        "published_files_restored_by_this_guard": False,
        "automatic_production_cutover_authorized": False,
        "limitations": [
            "This tool cannot verify historical Netlify deploy content or exact byte equivalence",
            "Git source candidates are not proof of complete site backup nor production use",
            "Netlify current deploy metadata is prior read-only evidence, not fetched here",
            "No Netlify credentials, user data, secrets or remote writes",
        ],
    }


def main():
    report = build()
    assert not report["published_files_restored_by_this_guard"]
    assert not report["automatic_production_cutover_authorized"]
    print(json.dumps(report, ensure_ascii=False, indent=2))
    print("PASS: 7 site classifications, 3 Git source candidates preserved; no claim of Netlify restoration")


if __name__ == "__main__":
    main()
