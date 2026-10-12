#!/usr/bin/env python3
"""Classificacao incremental, read-only, de consumidores das previews CONSTRU-REI.

Nao remove, move, hospeda, implanta, publica, altera banco ou autoriza limpeza.
Relacoes estaticas e identidade de bytes sao INDICIOS, nunca prova de desuso.
Fonte do inventario: docs/AMBIENTES_PREVIEW_INVENTARIO_20261011.json.
"""
import hashlib
import json
import re
import subprocess
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INVENTORY = ROOT / "docs/AMBIENTES_PREVIEW_INVENTARIO_20261011.json"
LINKS = ROOT / "docs/official-links-registry.json"
# Conservative literal paths only: dynamic JS, URLs assembled at runtime,
# service workers, external consumers, pinned revisions remain out of scope.
LITERAL = re.compile(r"""(?<![\w.-])preview/([A-Za-z0-9_.-]+)(?=/|[?#\s"']|$)""")
TEXT_SUFFIXES = {".html", ".css", ".js", ".mjs", ".ts", ".tsx", ".json", ".svg"}
PROTECTED = {
    "ACTIVE_SHARED_SCRIPT_10_F00_F09",
    "ACTIVE_OFFICIAL_CENTRAL_LINK",
    "GESTOR_HISTORICAL_LINK",
    "PRODUCTION_PROVENANCE_REFERENCE",
    "PINNED_RAW_GITHUB_ASSET_IN_PRODUCTION",
    "PRODUCTION_STYLESHEET_REFERENCE",
}
TRANSITIVE = {"app-gabi-v20-documentos-f02-20261008"}


def main():
    errors = []
    inventory = json.loads(INVENTORY.read_text(encoding="utf-8"))
    links = json.loads(LINKS.read_text(encoding="utf-8"))["links"]
    aliases = {item["slug"] for item in links}
    entries = inventory.get("folders", [])
    names = [item["path"].strip("/").split("/")[1] for item in entries]
    if len(entries) != 121 or len(set(names)) != 121:
        errors.append("Inventario preview alterado: requer reconciliacao")
    if len(links) != len(aliases) or len(aliases) != 39:
        errors.append("Catalogo de aliases requer reconciliacao")
    if any(item.get("authorized_to_delete") or item.get("authorized_to_move")
           for item in entries):
        errors.append("Mover/apagar preview exige homologacao independente")
    if not TRANSITIVE.issubset(names):
        errors.append("Cadeia operacional Gabi v21 -> v20 ausente do inventario")
    declared = set(names)

    paths = [p.decode("utf-8") for p in
             subprocess.check_output(["git", "-C", str(ROOT), "ls-files", "-z"]).split(b"\0") if p]
    actual = {p.split("/")[1] for p in paths
              if p.startswith("preview/") and len(p.split("/")) > 2}
    if actual != declared:
        errors.append("Pastas rastreadas e snapshot divergentes (nao apagar): "
                      + repr({"sem_inventario": sorted(actual - declared),
                              "nao_rastreada": sorted(declared - actual)}))

    by_file = defaultdict(list)
    consumers = defaultdict(set)
    # Ignore documentation/test references to avoid treating a policy as a
    # runtime link. Scan both deployed code and preview-to-preview links.
    for rel in paths:
        if rel.startswith(("docs/", ".github/", "agents/")):
            continue
        path = ROOT / rel
        if path.suffix.lower() not in TEXT_SUFFIXES or not path.is_file():
            continue
        if path.stat().st_size > 5_000_000:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for match in LITERAL.finditer(text):
            folder = match.group(1)
            if folder not in declared:
                continue
            category = "CANDIDATE_INTERNAL" if rel.startswith("preview/") else "NON_PREVIEW_STATIC"
            consumers[folder].add((category, rel))

    # Equal byte hashes are duplication *candidates* only. Identical content
    # does not imply that a published URL or origin can be retired.
    equal_content = defaultdict(list)
    preview_file_count = 0
    for rel in paths:
        if not rel.startswith("preview/"):
            continue
        path = ROOT / rel
        if not path.is_file():
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        equal_content[digest].append(rel)
        preview_file_count += 1
    identical_groups = [g for g in equal_content.values() if len(g) > 1]

    protected = {name for name, item in zip(names, entries)
                 if item["status"] in PROTECTED} | TRANSITIVE
    unclassified = {name for name, item in zip(names, entries)
                    if item["status"] == "UNCLASSIFIED_REVIEW_ONLY"}
    if len(protected - TRANSITIVE) != 12 or len(unclassified) != 109:
        errors.append("Base 12 protegidos/109 por revisar mudou: rever inventario")
    referred_from_non_preview = {
        name for name, refs in consumers.items()
        if any(kind == "NON_PREVIEW_STATIC" for kind, _ in refs)
    }
    linked_from_preview = {
        name for name, refs in consumers.items()
        if any(kind == "CANDIDATE_INTERNAL" for kind, _ in refs)
    }
    # Prioritize investigation without changing inventory, links, or removal flags.
    # Source paths are already public in the tracked repository. A static
    # reference can be dead code; its absence never authorizes deletion.
    high_priority = sorted(unclassified & referred_from_non_preview)
    candidate_chain = sorted(unclassified & linked_from_preview)
    referenced_union = sorted(set(high_priority) | set(candidate_chain))
    byte_duplicate_examples = [
        sorted(group)
        for group in sorted(identical_groups, key=lambda g: (-len(g), sorted(g)[0]))
    ][:10]
    result = {
        "audit": "CR_PREVIEW_CONSUMER_DELTA_READ_ONLY",
        "status": "PASS_INVENTORY_ONLY" if not errors else "FAIL_CLOSED",
        "tracked_preview_folders": len(actual),
        "tracked_preview_files": preview_file_count,
        "preclassified_protected": len(protected - TRANSITIVE),
        "transitive_gabi_v20_preserved": bool(TRANSITIVE <= declared),
        "unclassified_requires_review": len(unclassified),
        "static_refs_from_non_preview": len(referred_from_non_preview),
        "static_refs_from_other_previews": len(linked_from_preview),
        "unclassified_with_non_preview_ref": len(unclassified & referred_from_non_preview),
        "unclassified_with_internal_preview_ref": len(unclassified & linked_from_preview),
        "priority_unclassified_referenced_by_non_preview": high_priority,
        "unclassified_referenced_by_other_previews": candidate_chain,
        "unclassified_referenced_by_either_count": len(referenced_union),
        "sample_duplicate_byte_groups_review_only": byte_duplicate_examples,
        "static_reference_absence_does_not_prove_removability": True,
        "identical_byte_hash_groups": len(identical_groups),
        "identical_byte_hash_paths": sum(len(g) for g in identical_groups),
        "no_static_reference_is_not_proof_of_disuse": True,
        "dynamic_or_external_consumers_verified": False,
        "authorized_to_delete_anything": False,
        "production_changed": False,
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
