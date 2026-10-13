#!/usr/bin/env python3
"""Static, read-only regression gate for published F00–F09 Edge destinations."""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FLOW = ROOT / "production/flow-canonical-20261001"
PATTERN = re.compile(r"/functions/v1/([a-z][a-z0-9-]*)")
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
    print("PASS: ten baseline routes and twenty negative routing tests")


def main():
    self_test()
    findings = []
    errors = []
    for flow in sorted(EXPECTED):
        source = FLOW / flow / "index.html"
        if not source.is_file():
            errors.append({"flow": flow, "issue": "missing official page"})
            continue
        content = source.read_text(encoding="utf-8")
        observed, missing, introduced = compare(flow, content)
        findings.append({"flow": flow, "edge_targets": sorted(observed)})
        if missing or introduced:
            errors.append({"flow": flow, "missing": missing, "introduced": introduced})
    print(json.dumps({
        "audit": "CR_F00_F09_OFFICIAL_EDGE_CLIENT_ROUTING",
        "source": "existing official HTML pages",
        "mode": "STATIC_ONLY",
        "pages_checked": len(findings),
        "frontend_authentication_verified": False,
        "auth_approval_status": "P0_WZ_01_PENDING",
        "routes": findings, "errors": errors
    }, ensure_ascii=False, indent=2))
    return int(bool(errors))


if __name__ == "__main__":
    sys.exit(main())
