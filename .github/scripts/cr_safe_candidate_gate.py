#!/usr/bin/env python3
"""CR SAFE: prove a candidate diff adds only approved offline evidence and tests.

This tool is intentionally local. It NEVER contacts APIs, uses credentials,
writes to the repository, deploys, deletes, or changes any database.
It does not certify an external production system or authorize a merge.
"""
import argparse
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ALLOWED_ADDITIONS = frozenset({
    ".github/scripts/cr_safe_candidate_gate.py",
    ".github/scripts/test_cr_safe_candidate_gate.py",
    "docs/CHECKPOINT_SEM_INTERFERENCIA_20261013.md",
})
PROTECTED_PREFIXES = (
    "production/", "central-runtime/", "central/", "gestor-projeto/",
    "preview/", "app-construrei/", "supabase/", "security/",
    ".github/workflows/", "assets/",
)
PROTECTED_EXACT = frozenset({
    "AGENTS.md", "CLAUDE.md", "index.html",
    "docs/official-links-registry.json",
    "docs/CANONICAL_RULES_MASTER_INDEX_V1_20261007.md",
    "docs/CONSTRUREI_CURRENT_STATE.md",
})


def git(repo, *args):
    return subprocess.check_output(
        ["git", "-C", str(repo), *args], stderr=subprocess.PIPE
    )


def assess_changes(entries):
    """Fail closed on modifications, deletions, unexpected files and renames.

    entries is a list of (git_status, repository_relative_path) pairs.
    No directory can be silently treated as disposable.
    """
    problems = []
    found = set()
    for status, path in entries:
        if not path or path.startswith("/") or "\\" in path or ".." in path.split("/"):
            problems.append("Unsafe repository-relative path")
            continue
        if path in found:
            problems.append("Duplicate path in candidate diff: " + path)
        found.add(path)
        if path in PROTECTED_EXACT or path.startswith(PROTECTED_PREFIXES):
            problems.append("Protected operational/control path touched: " + path)
        if status != "A":
            problems.append("Not an addition (possible modification/deletion): " + path + " [" + status + "]")
        if path not in ALLOWED_ADDITIONS:
            problems.append("Not in narrowly approved offline evidence/test scope: " + path)
    if found != ALLOWED_ADDITIONS:
        problems.append("Expected exactly three offline files; missing: "
                        + ", ".join(sorted(ALLOWED_ADDITIONS - found)))
    return problems


def parse_name_status_z(raw):
    fields = raw.decode("utf-8", "strict").split("\0")
    if fields[-1] != "":
        raise ValueError("Truncated git -z diff")
    fields.pop()
    if len(fields) % 2:
        raise ValueError("Unexpected diff format: rename/copy or malformed status")
    entries = list(zip(fields[::2], fields[1::2]))
    if any(not status or status[0] in "RC" for status, _ in entries):
        raise ValueError("Rename/copy must not be present in offline-only candidate")
    return entries


def self_test():
    safe = [("A", p) for p in sorted(ALLOWED_ADDITIONS)]
    assert assess_changes(safe) == []
    assert assess_changes(safe + [("M", "production/central/index.html")])
    assert assess_changes(safe + [("A", ".github/workflows/new.yml")])
    assert assess_changes([("D", "preview/old/index.html")])
    assert assess_changes([("A", "../secret")])
    raw = b"A\0docs/file.md\0M\0production/index.html\0"
    assert parse_name_status_z(raw) == [
        ("A", "docs/file.md"), ("M", "production/index.html")
    ]
    print("PASS: offline safe-candidate positive/negative checks")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", help="Full reviewed immutable Git main SHA; no network access")
    ap.add_argument("--repo", type=Path, default=ROOT)
    ap.add_argument("--self-test", action="store_true")
    args = ap.parse_args()
    if args.self_test:
        self_test()
        return 0
    if not args.base or len(args.base) != 40 or not all(x in "0123456789abcdef" for x in args.base):
        ap.error("--base must be the 40-character immutable Git SHA reviewed before branch creation")
    repo = args.repo.resolve()
    try:
        branch = git(repo, "symbolic-ref", "--quiet", "--short", "HEAD").decode().strip()
        if branch in ("main", "master") or not branch.startswith("candidate/"):
            raise ValueError("Must run on a non-production candidate/ branch")
        git(repo, "merge-base", "--is-ancestor", args.base, "HEAD")
        raw = git(repo, "diff", "--name-status", "--no-renames", "-z", args.base + "...HEAD")
        changes = parse_name_status_z(raw)
        problems = assess_changes(changes)
        for status, path in changes:
            if status == "A" and path in ALLOWED_ADDITIONS:
                target = repo / path
                if target.is_symlink() or not target.is_file():
                    problems.append("Offline candidate must contain an ordinary file: " + path)
        dirty = git(repo, "status", "--porcelain", "--untracked-files=all")
        if dirty.strip():
            problems.append("Working tree not clean (unreviewed local edits present)")
        report = {
            "audit": "CR_CANDIDATE_ZERO_INTERFERENCE_DIFF",
            "base": args.base,
            "branch": branch,
            "changed_files": [{"status": s, "path": p} for s, p in changes],
            "protected_runtime_files_modified": sum(
                p in PROTECTED_EXACT or p.startswith(PROTECTED_PREFIXES)
                for _, p in changes
            ),
            "candidate_scope_pass": not problems,
            "external_services_tested": False,
            "production_deployed": False,
            "merge_or_cutover_authorized": False,
            "errors": problems,
        }
        print(json.dumps(report, ensure_ascii=False, indent=2))
        return int(bool(problems))
    except (subprocess.CalledProcessError, UnicodeError, ValueError, OSError) as exc:
        print(json.dumps({
            "audit": "CR_CANDIDATE_ZERO_INTERFERENCE_DIFF",
            "candidate_scope_pass": False,
            "merge_or_cutover_authorized": False,
            "error": type(exc).__name__ + ": " + str(exc)[:180],
        }, ensure_ascii=False))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
