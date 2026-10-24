#!/usr/bin/env python3
"""Static, read-only regression gate for published F00–F09 Edge destinations."""
import json
import os
import re
import sys
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FLOW = ROOT / "production/flow-canonical-20261001"
PATTERN = re.compile(r"/functions/v1/([a-z][a-z0-9-]*)")
SESSION_MARKER = re.compile(r"authorization|x-f00-key|auth\.getsession|auth\.getuser|signinwith", re.IGNORECASE)
EXPECTED = {
    "f00": {"cr-f00-intake"},
    "f01": {"cr-flow-runtime-v2"},
    "f02": {"cr-flow-runtime-v2"},
    "f03": {"cr-flow-runtime-v2"},
    **{
        f"f{n:02d}": {"cr-flow-runtime-v2", "central-atendimento"}
        for n in range(4, 10)
    },
}


def compare(flow, data):
    observed = set(PATTERN.findall(data))
    required = EXPECTED[flow]
    return observed, sorted(required - observed), sorted(observed - required)


def self_test():
    for flow, targets in EXPECTED.items():
        fake = "\n".join("/functions/v1/" + target for target in sorted(targets))
        got, missing, introduced = compare(flow, fake)
        assert got == targets and not missing and not introduced
        _, _, introduced = compare(flow, fake + "\n/functions/v1/unknown-new-service")
        assert introduced == ["unknown-new-service"]
        _, missing, _ = compare(flow, "")
        assert missing == sorted(targets)
    assert not SESSION_MARKER.search('headers: {"content-type": "application/json"}')
    assert SESSION_MARKER.search('headers: {Authorization: sessionToken}')
    print("PASS: ten baseline routes, twenty negative routing tests, and marker classification")


def run_offline_trello_security_contracts():
    """Mandatory pure security tests in existing Central Guard CI; no network or writes."""
    paths = sorted((ROOT / "security/contracts").glob("trello-webhook-*.test.mjs"))
    if len(paths) != 3:
        raise RuntimeError(f"Trello security test baseline missing/duplicated: {len(paths)} suites")
    try:
        result = subprocess.run(
            ["node", "--test", *(str(p) for p in paths)],
            cwd=ROOT, timeout=45, check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise RuntimeError("Trello security contract tests unavailable") from exc
    if result.returncode != 0:
        raise RuntimeError("Trello HMAC/caller/replay contract regression")
    print("PASS: 3 Trello contract suites enforced by existing Central CI job (offline)")


def run_app_role_contracts():
    """Require deny-by-default APP policy regression suite without external writes."""
    suite = ROOT / "security/candidates/cr-flow-runtime-v2-secure-20261024/flow-auth-policy.test.mjs"
    if not suite.is_file():
        raise RuntimeError("APP authorization policy suite missing")
    try:
        result = subprocess.run(["node", "--test", str(suite)],
                                cwd=ROOT, timeout=30, check=False)
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise RuntimeError("APP authorization policy tests unavailable") from exc
    if result.returncode != 0:
        raise RuntimeError("APP authorization policy regression")
    print("PASS: 31 isolated APP role and action tests. Runtime integration remains P0 OPEN.")


def main():
    self_test()
    run_offline_trello_security_contracts()
    run_app_role_contracts()
    findings = []
    errors = []
    # A live Edge handler currently lacks authenticated role checks. F04-F09
    # must not suddenly make write-capable ?api= calls while their clients
    # have no verified session mechanism. This blocks accidental PR #171 merges.
    # Removing this gate requires separate runtime RBAC E2E evidence.
    UNAUTHENTICATED_WRITE_CALL = re.compile(
        r'''API\s*\+\s*["']\?api=flow-(?:save|advance)["']''',
        re.IGNORECASE,
    )
    for flow in sorted(EXPECTED):
        source = FLOW / flow / "index.html"
        if not source.is_file():
            errors.append({"flow": flow, "issue": "missing official page"})
            continue
        content = source.read_text(encoding="utf-8")
        observed, missing, introduced = compare(flow, content)
        findings.append({"flow": flow, "edge_targets": sorted(observed),
                         "client_session_marker_present": bool(SESSION_MARKER.search(content))})
        if missing or introduced:
            errors.append({"flow": flow, "missing": missing, "introduced": introduced})
        if flow in {f"f{i:02d}" for i in range(4, 10)} and UNAUTHENTICATED_WRITE_CALL.search(content):
            errors.append({
                "flow": flow,
                "security": "F04-F09 authenticated runtime unproven; forbid enabling ?api=flow-save/advance",
                "required_gate": "server-side RBAC and authenticated live E2E before PR171 promotion",
            })
    print(json.dumps({
        "audit": "CR_F00_F09_OFFICIAL_EDGE_CLIENT_ROUTING",
        "source": "existing official HTML pages",
        "mode": "STATIC_ONLY",
        "pages_checked": len(findings),
        "frontend_authentication_verified": False,
        "auth_approval_status": "P0_WZ_01_PENDING",
        "routes": findings, "errors": errors
    }, ensure_ascii=False, indent=2))
    no_marker = [item["flow"] for item in findings if not item["client_session_marker_present"]]
    if no_marker:
        print("::warning title=CONSTRU-REI WZ-01 P0::Official clients lack visible session markers: "
              + ", ".join(no_marker) + ". Static hint only; Edge authorization unverified.")
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a", encoding="utf-8") as f:
            f.write("\n## WZ-01 • F00–F09 security (static check only)\n\n")
            f.write(f"- HTML pages inspected: **{len(findings)}** / 10\n")
            f.write(f"- Pages without a recognizable session marker: **{len(no_marker)}**\n")
            f.write("- **P0 OPEN**: a marker does not prove identity, role or tenant authorization.\n")
            f.write("- No live cases, API endpoints or production settings probed or modified.\n")
    return int(bool(errors))


if __name__ == "__main__":
    sys.exit(main())
