#!/usr/bin/env python3
"""Non-invasive public-route regression gate for CONSTRU-REI.

Safeguards official Edge redirect locations using HEAD only. No credentials,
customer data, database calls, deployments, network redirects or app mutations.
Existing APP preview exception remains a WARNING until approved remediation.
Network unavailability is NOT proof of a healthy route.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

EDGE = "https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/central-atendimento"
PAGES = "https://rogeriocibin-alt.github.io/construrei-oauth-pages"
# These destinations were read in the active Edge router v160 on 2026-10-12.
# Do NOT treat the known APP preview as an approved permanent production URL.
ROUTES = {
    "app": ("/preview/app-official-candidate-20261002/", "KNOWN_UNHOMOLOGATED_PREVIEW"),
    "app&host=fallback": ("/production/app-canonical-20261001/", "OFFICIAL_FALLBACK"),
    "f00": ("/production/flow-canonical-20261001/f00/", "OFFICIAL_FLOW"),
    "f09": ("/production/flow-canonical-20261001/f09/", "OFFICIAL_FLOW"),
}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        return None


def evaluate(key: str, status: int, destination: str | None) -> tuple[str, str]:
    expected, label = ROUTES[key]
    if status not in (301, 302, 303, 307, 308) or not destination:
        return "UNVERIFIED", "No HTTP redirect observed"
    parsed = urllib.parse.urlsplit(urllib.parse.urljoin(EDGE, destination))
    prefix = urllib.parse.urlsplit(PAGES)
    if parsed.scheme != "https" or parsed.netloc != prefix.netloc:
        return "FAIL", "Redirect moved outside canonical HTTPS origin"
    if parsed.path != "/construrei-oauth-pages" + expected:
        return "FAIL", "Redirect destination drifted from owner-recorded route"
    if parsed.query or parsed.fragment:
        return "FAIL", "Unexpected query or fragment on clean probe"
    if label == "KNOWN_UNHOMOLOGATED_PREVIEW":
        return "WARNING", "APP currently points to an unhomologated preview; candidate fix needs device validation"
    return "PASS", "Redirect is the known production destination"


def self_test() -> None:
    for key, (path, _) in ROUTES.items():
        state, _ = evaluate(key, 302, PAGES + path)
        assert state == ("WARNING" if key == "app" else "PASS"), (key, state)
    checks = [
        ("f00", 302, PAGES + "/preview/unknown/"),
        ("app", 302, PAGES + "/preview/other-candidate/"),
        ("f09", 302, "http://rogeriocibin-alt.github.io/construrei-oauth-pages/production/flow-canonical-20261001/f09/"),
        ("app&host=fallback", 302, "https://untrusted.example/production/app-canonical-20261001/"),
    ]
    for key, code, url in checks:
        assert evaluate(key, code, url)[0] == "FAIL", key
    assert evaluate("f00", 503, None)[0] == "UNVERIFIED"
    print("PASS: known routes and 4 negative redirect regression cases")


def probe() -> int:
    opener = urllib.request.build_opener(NoRedirect)
    observations = []
    for key in ROUTES:
        url = EDGE + "?mode=" + key
        request = urllib.request.Request(
            url, method="HEAD", headers={"User-Agent": "CONSTRU-REI-Canonical-ReadOnly-CI/1"}
        )
        try:
            with opener.open(request, timeout=9) as response:
                status = response.status
                location = response.headers.get("Location")
        except urllib.error.HTTPError as exc:
            status = exc.code
            location = exc.headers.get("Location") if exc.headers else None
        except (urllib.error.URLError, TimeoutError, OSError) as exc:
            observations.append({"route": key, "status": "UNVERIFIED", "reason": type(exc).__name__})
            continue
        result, reason = evaluate(key, status, location)
        observations.append({
            "route": key, "status": result, "http_status": status,
            "reason": reason,
        })
    counts = {x: sum(r["status"] == x for r in observations)
              for x in ("PASS", "FAIL", "WARNING", "UNVERIFIED")}
    print(json.dumps({
        "audit": "CR_OFFICIAL_EDGE_ROUTER_READ_ONLY",
        "timestamp_source": "current GitHub Actions runtime",
        "requests": "HEAD only; redirects never followed",
        "live_probe_complete": counts["UNVERIFIED"] == 0,
        "not_full_e2e_or_authorization_test": True,
        "known_app_preview_not_approved": True,
        "counts": counts, "checks": observations,
    }, ensure_ascii=False, indent=2))
    # Surface persistent debt where operators see workflow health, not only logs.
    # These annotations reveal no headers, credentials, query payload or user data.
    for observation in observations:
        state = observation["status"]
        if state in ("WARNING", "UNVERIFIED"):
            print("::warning title=CONSTRU-REI route "+state+"::"
                  + observation["route"]+" — "+observation["reason"])
        elif state == "FAIL":
            print("::error title=CONSTRU-REI route drift::"
                  + observation["route"]+" — "+observation["reason"])

    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        lines = [
            "## CONSTRU-REI • Roteamento oficial (somente HEAD)",
            "",
            "| Rota | Resultado | Observação |",
            "|---|---|---|",
        ]
        for observation in observations:
            lines.append("| "+observation["route"]+" | "+observation["status"]
                         +" | "+observation["reason"]+" |")
        lines += [
            "",
            "**"+str(counts["PASS"])+" PASS; "+str(counts["WARNING"])
            +" WARNING; "+str(counts["FAIL"])+" FAIL; "
            +str(counts["UNVERIFIED"])+" UNVERIFIED.**",
            "",
            "Aviso de APP em preview **não representa homologação**. "
            "Sem teste E2E, autenticação ou escrita.",
            "Se houver UNVERIFIED, a observação de rede ficou incompleta.",
            "",
        ]
        with open(summary, "a", encoding="utf-8") as fp:
            fp.write("\n".join(lines))
    if counts["FAIL"]:
        print("FAIL CLOSED: unexpected official redirect destination", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
        self_test()
        sys.exit(0)
    if len(sys.argv) == 2 and sys.argv[1] == "--probe":
        sys.exit(probe())
    raise SystemExit("Usage: --self-test | --probe")
