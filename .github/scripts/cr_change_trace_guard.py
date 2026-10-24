#!/usr/bin/env python3
"""Trilha de mudanças CONSTRU-REI: recibo CI sem acesso a dados ou segredos.

Nao se confunde com backup, homologacao funcional ou auditoria DB.
"""
import datetime as dt
import json
import os
import re
import subprocess
import sys
from pathlib import Path

FIELDS = (
    "Motivo",
    "Escopo",
    "Fonte oficial e Gestor",
    "Evidencias e testes",
    "Impacto e regressao",
    "Rollback",
)
PLACEHOLDERS = {"", "-", "todo", "tbd", "a definir", "preencher", "n/a", "na", "pendente"}


def contract_missing(body):
    missing = []
    for field in FIELDS:
        pat = re.compile(r"(?ims)^##[ \t]+" + re.escape(field) +
                         r"[ \t]*\n(.*?)(?=^##[ \t]+|\Z)")
        match = pat.search(body or "")
        value = match.group(1).strip() if match else ""
        cleaned = re.sub(r"(?m)^\s*[-*]\s*\[[ xX]\]\s*", "", value).strip()
        cleaned = re.sub(r"(?m)^\s*[-*]\s*", "", cleaned).strip()
        if (not cleaned or cleaned.casefold() in PLACEHOLDERS
                or cleaned.startswith("<!--")
                or cleaned.casefold().startswith("todo:")):
            missing.append(field)
    return missing


def self_test():
    valid = "\n".join("## " + name + "\nProva concreta de " + name + ".\n" for name in FIELDS)
    assert contract_missing(valid) == [], "Full contract rejected"
    assert contract_missing(valid.replace("Prova concreta de Rollback.", "TODO")) == ["Rollback"]
    assert "Escopo" in contract_missing(valid.replace("## Escopo", "## Outro"))
    assert len(contract_missing("")) == len(FIELDS)
    print("PASS: self-test for governance metadata contract")


def changed_files():
    p = subprocess.run(
        ["git", "diff", "--name-only", "HEAD^", "HEAD"],
        capture_output=True, text=True, check=True, timeout=30,
    )
    return sorted(set(x.strip() for x in p.stdout.splitlines() if x.strip()))[:500]


def run():
    if "--self-test" in sys.argv:
        self_test()
        return 0

    event_name = os.environ.get("GITHUB_EVENT_NAME", "")
    path = os.environ.get("GITHUB_EVENT_PATH", "")
    event = json.loads(Path(path).read_text(encoding="utf-8")) if path else {}
    receipt = {
        "schema": "CR_CHANGE_TRACE_V1",
        "recorded_at_utc": dt.datetime.now(dt.timezone.utc).isoformat(),
        "repository": os.environ.get("GITHUB_REPOSITORY", ""),
        "event": event_name,
        "sha": os.environ.get("GITHUB_SHA", ""),
        "run_id": os.environ.get("GITHUB_RUN_ID", ""),
        "run_attempt": os.environ.get("GITHUB_RUN_ATTEMPT", ""),
        "proof_kind": "CI_CHANGE_METADATA_ONLY_NOT_RELEASE_ACCEPTANCE",
    }
    fail = False
    if event_name == "pull_request":
        pr = event.get("pull_request") or {}
        missing = contract_missing(pr.get("body") or "")
        draft = bool(pr.get("draft"))
        receipt.update({
            "pr_number": pr.get("number") or event.get("number"),
            "pr_url": pr.get("html_url"),
            "pr_head_sha": (pr.get("head") or {}).get("sha"),
            "draft": draft,
            "missing_fields": missing,
            "status": ("DRAFT_NOT_APPROVED" if draft else
                       "METADATA_INCOMPLETE" if missing else "METADATA_OK"),
        })
        fail = bool(missing and not draft)
    elif event_name == "push":
        head = event.get("head_commit") or {}
        msg = head.get("message") or ""
        pr_reference = bool(re.search(r"(?:Merge pull request #[0-9]+|\(#[0-9]+\))", msg))
        receipt.update({
            "commit": head.get("id") or receipt["sha"],
            "commit_subject": msg.splitlines()[0][:200] if msg else "",
            "files": changed_files(),
            "linked_pr_in_commit_message": pr_reference,
            "status": "MERGE_REFERENCE_PRESENT" if pr_reference else "MAIN_PUSH_WITHOUT_PR_REFERENCE",
        })
        # A red CI status is an alert AFTER the push, not branch protection.
        fail = not pr_reference
    elif event_name == "workflow_dispatch":
        receipt["status"] = "MANUAL_SELF_CHECK"
    else:
        receipt["status"] = "UNSUPPORTED_EVENT"
        fail = True

    out = Path(os.environ.get("RUNNER_TEMP", "/tmp")) / "change-trace-receipt.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + "\n",
                   encoding="utf-8")
    print(json.dumps(receipt, ensure_ascii=False))
    if fail:
        print("FAIL: change trace metadata incomplete or main push lacks PR trace")
    return 1 if fail else 0


if __name__ == "__main__":
    raise SystemExit(run())
