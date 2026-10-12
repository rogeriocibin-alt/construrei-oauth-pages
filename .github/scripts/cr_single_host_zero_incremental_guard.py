#!/usr/bin/env python3
"""Contract gate for the one-host/no-new-paid-infrastructure architecture.

Reads existing versioned files only; cannot inspect external billing or
prevent a manual action outside GitHub. Does not provision, delete, deploy,
download data or touch credentials.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORKFLOWS = ROOT / ".github" / "workflows"
PLAN = ROOT / "docs" / "ARQUITETURA_TRES_AMBIENTES_PLANO_20261011.md"
ADR = ROOT / "docs" / "ADR_ECOSSISTEMA_UNICO_CONTROL_PLANE_SAAS_20261011.md"

# Baseline from the eleven existing workflows as confirmed on 11/10/2026.
# Any new workflow or automatic cadence requires an explicit reviewed update
# to this policy, rather than silently creating another scheduled executor.
APPROVED_CRONS = {
    "central-canonical-guard.yml": [],
    "cofre-mobile-smoke.yml": [],
    "cofre-netlify-inventory-offsite.yml": ["15 7 * * *"],
    "cofre-trello-guarded-promote.yml": [],
    "cofre-trello-weekly-dispatch.yml": ["45 7 * * 0"],
    "cofre-zero-edge-integrity.yml": [],
    "cofre-zero-git-offsite.yml": ["37 6 * * 0"],
    "cofre-zero-health-gate.yml": ["30 11 * * *"],
    "cofre-zero-history-full.yml": ["32 6 * * *"],
    "cofre-zero-trello-offsite.yml": [],
    "construrei-cloud-backup.yml": [],
}
REQUIRED_POLICY = {
    PLAN: [
        "ÚNICO ambiente online",
        "R$ 0 de cobrança adicional",
        "BLOQUEADO_POR_ISOLAMENTO",
        "ARQUIVO HISTÓRICO",
        "Gestor é o controle único",
    ],
    ADR: [
        "UM ambiente hospedado",
        "Homologação",
        "Arquivo",
        "Gestor",
        "não é garantia",
    ],
}

def main():
    errors = []
    for p, needles in REQUIRED_POLICY.items():
        if not p.is_file():
            errors.append("Required policy missing: " + str(p.relative_to(ROOT)))
            continue
        body = p.read_text(encoding="utf-8")
        for needle in needles:
            if needle not in body:
                errors.append("Missing single-host policy marker in " + p.name + ": " + needle)
    actual = {p.name: p for p in WORKFLOWS.glob("*.yml")}
    actual.update({p.name: p for p in WORKFLOWS.glob("*.yaml")})
    unknown = sorted(set(actual) - set(APPROVED_CRONS))
    missing = sorted(set(APPROVED_CRONS) - set(actual))
    if unknown:
        errors.append("New GitHub workflow requires cost/schedule review: " + repr(unknown))
    if missing:
        errors.append("Previous workflow disappeared, verify offsite coverage: " + repr(missing))
    schedules = {}
    for name, file in sorted(actual.items()):
        raw = file.read_text(encoding="utf-8")
        got = sorted(
            value.strip()
            for value in re.findall(r"^\s*-\s*cron:\s*['\"]?([^'\"\n#]+)", raw, re.MULTILINE)
        )
        schedules[name] = got
        if name in APPROVED_CRONS and got != sorted(APPROVED_CRONS[name]):
            errors.append("Changed schedule, budget/coverage review required: " + name)
        if re.search(r"^  schedule:\s*$", raw, re.MULTILINE) and not got:
            errors.append("Scheduled workflow has no enumerated cron: " + name)
    result = {
        "decision": "ONE_EXISTING_PRODUCTION_HOST_THREE_LIFECYCLE_STATES",
        "policy_goal": "NO_NEW_PAID_INFRASTRUCTURE",
        "reviewed_workflow_count": len(APPROVED_CRONS),
        "current_workflow_count": len(actual),
        "configured_schedules": schedules,
        "infrastructure_provisioned": False,
        "billing_account_or_quota_verified": False,
        "external_services_audited_by_this_guard": False,
        "note": "Detects workflow/cron drift; external paid provisioning needs a separate approval process.",
        "errors": errors,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 1 if errors else 0

if __name__ == "__main__":
    sys.exit(main())
