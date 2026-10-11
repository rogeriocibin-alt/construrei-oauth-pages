#!/usr/bin/env python3
"""CONSTRU-REI: inventory only. Never moves, deletes, deploys or mutates files."""
import collections
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "docs" / "ARQUITETURA_TRES_AMBIENTES_PLANO_20261011.md"
PROD_PREFIXES = (
    "production/", "gestor-projeto/", "central-runtime/", "central-canonical/",
    "app-construrei/", "central/", "f00-", "f01-", "f02-", "f03-", "f04-",
    "f05-", "f06-", "f07-", "f08-", "f09-",
)
PATTERN = re.compile(r"(?:https?://[^\s\"'<>)]*/)?preview/[A-Za-z0-9_./%~-]+")
def files_in_git():
    result = subprocess.run(
        ["git", "-C", str(ROOT), "ls-files", "-z"],
        check=True, stdout=subprocess.PIPE
    )
    return [ROOT / os.fsdecode(v) for v in result.stdout.split(b"\0") if v]

def main():
    entries = []
    for p in files_in_git():
        if not p.is_file():
            continue
        rel = p.relative_to(ROOT).as_posix()
        raw = p.read_bytes()
        digest = hashlib.sha256(raw).hexdigest()
        entries.append((rel, len(raw), digest, raw))

    total_bytes = sum(size for _, size, _, _ in entries)
    preview = [(path, size, sha, body) for path, size, sha, body in entries if path.startswith("preview/")]
    by_digest = collections.defaultdict(list)
    for rel, size, digest, _ in entries:
        by_digest[digest].append((rel, size))
    duplicate_bytes = sum((len(items) - 1) * items[0][1] for items in by_digest.values() if len(items) > 1)
    preview_dirs = {name.split("/")[1] for name, _, _, _ in preview if "/" in name}
    preview_bytes = sum(size for _, size, _, _ in preview)
    live_refs = []
    for rel, size, _, raw in entries:
        if not rel.startswith(PROD_PREFIXES) or size > 3_000_000:
            continue
        try:
            body = raw.decode("utf-8")
        except UnicodeDecodeError:
            continue
        for match in sorted(set(PATTERN.findall(body)))[:20]:
            live_refs.append({"file": rel, "reference": match[:200]})
    report = {
        "schema_version": 1,
        "classification": "READ_ONLY_AUDIT_NOT_AN_APPROVED_DELETION_LIST",
        "git_tracked_files": len(entries),
        "logical_bytes": total_bytes,
        "preview_files": len(preview),
        "preview_logical_bytes": preview_bytes,
        "preview_percent": round(preview_bytes / total_bytes * 100, 2) if total_bytes else 0,
        "preview_subdirectories": len(preview_dirs),
        "duplicate_logical_bytes_not_disk_savings": duplicate_bytes,
        "production_area_references_to_preview": live_refs,
        "move_delete_candidates_approved": 0,
        "note": "Volume logico git, nao custo ou espaco fisico; refs devem ser inspecionadas antes de mover."
    }
    print(json.dumps(report, indent=2, ensure_ascii=False))
    lines = [
        "## Auditoria de ambientes — somente leitura",
        f"- Arquivos rastreados: {len(entries)}",
        f"- Volume logico: {total_bytes:,} bytes",
        f"- preview/: {len(preview)} arquivos; {preview_bytes:,} bytes ({report['preview_percent']}%); {len(preview_dirs)} subpastas",
        f"- Repeticoes logicas SHA-256: {duplicate_bytes:,} bytes (nao equivale a economia de disco)",
        f"- Referencias a preview em areas operacionais: {len(live_refs)} (revisar antes de mover)",
        "- Exclusoes, transferencias e deploys: **ZERO**",
        "- Aviso: a relacao de referencias e conservadora e nao comprova dependencia em runtime."
    ]
    for item in live_refs[:30]:
        lines.append(f"  - \`{item['file']}\`: \`{item['reference']}\`")
    summary = "\n".join(lines) + "\n"
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a", encoding="utf-8") as f:
            f.write(summary)
    assert OUTPUT.exists(), "Official plan absent"
    assert len(preview) > 0 and total_bytes > 0, "Inventory failed or unexpected empty checkout"
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
