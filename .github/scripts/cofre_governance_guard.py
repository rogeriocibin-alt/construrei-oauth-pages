#!/usr/bin/env python3
"""Guardrail de governanca do Cofre Zero. Somente leitura, sem segredos nem rede."""
import json
import os
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
POLICY = ROOT / "gestor-projeto/cofre-mobile/cofre-governance-v1.json"
WORKFLOWS = ROOT / ".github/workflows"
CRON = re.compile(r"(?m)^\s*-\s*cron:\s*['\"]?([^'\"\r\n]+)")
ISSUES = []
WARNINGS = []

def emit(message):
    print(message)

def main():
    config = json.loads(POLICY.read_text(encoding="utf-8"))
    assert config["mode"] == "audit_only_no_deletion", "Governanca inesperadamente destrutiva"
    paths = set()
    schedules = []
    for item in config["managed_workflows"]:
        name = item["path"]
        if not re.fullmatch(r"[a-zA-Z0-9_.-]+\.yml", name) or name in paths:
            ISSUES.append("Invalido ou duplicado no inventario: " + name)
            continue
        paths.add(name)
        target = WORKFLOWS / name
        if not target.is_file():
            ISSUES.append("Workflow oficial ausente: " + name)
            continue
        contents = target.read_text(encoding="utf-8")
        values = [v.strip() for v in CRON.findall(contents)]
        expected = item.get("cron_utc")
        if expected and values != [expected]:
            ISSUES.append(f"Agendamento fora do inventario: {name} esperado={expected!r} atual={values!r}")
        if not expected and values:
            ISSUES.append(f"Workflow nao agendado ganhou cron: {name} {values}")
        if item["classification"] in {"active_backup", "monitor_not_backup", "conditional_dispatch"}:
            if "concurrency:" not in contents:
                WARNINGS.append(f"Sem trava de concorrencia: {name}")
        if expected:
            schedules.append((name, expected))
    for path in WORKFLOWS.glob("*.yml"):
        name = path.name
        if ("cofre" in name or name == "construrei-cloud-backup.yml") and name not in paths:
            text = path.read_text(encoding="utf-8")
            if CRON.search(text):
                ISSUES.append(f"Novo Cofre agendado sem aprovacao/inventario: {name}")
            else:
                WARNINGS.append(f"Workflow Cofre nao classificado (nao agendado): {name}")
    collisions = Counter(cron for _, cron in schedules)
    for cron, count in collisions.items():
        if count > 1:
            WARNINGS.append(f"Mesmo horario UTC compartilhado por {count} workflows: {cron}")
    gaps = config.get("known_recovery_gaps", [])
    if not gaps:
        ISSUES.append("Lacunas de recuperacao nao podem desaparecer sem evidencia")
    summary = [
        "## CONSTRU-REI | Governanca unificada (somente auditoria)",
        f"- Inventario oficial: {len(paths)} workflows catalogados",
        f"- Rotinas agendadas: {len(schedules)}",
        "- Regra: apenas producao homologada e fonte canonica; candidatos ficam isolados.",
        "- Retencao: SEM EXCLUSAO AUTOMATICA ate politica e restauracao testada.",
        f"- Recuperacao integral: NAO HOMOLOGADA; lacunas documentadas: {len(gaps)}",
        "- Agendamentos Supabase / Cloud Scheduler / repo privado: catalogados, mas este teste local nao os verifica.",
    ]
    for name, cron in schedules:
        summary.append(f"  - {name}: {cron} (UTC)")
    for warning in WARNINGS:
        summary.append("- AVISO: " + warning)
    for issue in ISSUES:
        summary.append("- FALHA: " + issue)
    report = "\n".join(summary) + "\n"
    emit(report)
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if path:
        with open(path, "a", encoding="utf-8") as output:
            output.write(report)
    return 1 if ISSUES else 0

if __name__ == "__main__":
    sys.exit(main())
