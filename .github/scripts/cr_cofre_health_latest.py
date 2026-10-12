#!/usr/bin/env python3
"""Cofre Zero: find latest GitHub workflow evidence safely.

The mobile status Edge Function currently reads only the newest 100 overall
Actions runs. Busy CI pushes an otherwise valid archive run out of that window.
Fallback queries the workflow's OWN run history; never invents a PASS.
Read-only, public GitHub Actions metadata, no secrets and no remote writes.
"""
import json
import os
from urllib.parse import quote
from urllib.request import Request, urlopen

REPO = "rogeriocibin-alt/construrei-oauth-pages"
WORKFLOW_MAP = {
    "Immutable daily full archive": "cofre-zero-history-full.yml",
    "Netlify inventory and published offsite": "cofre-netlify-inventory-offsite.yml",
}


def latest(workflows, needle, getter=None):
    """Return (run-or-None, evidence-source). No success assumptions."""
    for item in workflows:
        if needle in item.get("name", ""):
            if item.get("latest") is not None:
                return item["latest"], "edge-summary"
            break
    filename = WORKFLOW_MAP.get(needle)
    if not filename:
        raise ValueError("Unmapped backup workflow: " + needle)
    api = (
        "https://api.github.com/repos/" + REPO
        + "/actions/workflows/" + quote(filename, safe="")
        + "/runs?per_page=5"
    )
    if getter is None:
        def getter(url):
            headers = {
                "User-Agent": "CONSTRU-REI-Cofre-readonly",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            }
            # Avoid GitHub public unauthenticated 403 rate limit in busy CI.
            # GITHUB_TOKEN is the ephemeral workflow token, with actions:read.
            # NEVER print or include token in summaries or errors.
            token = os.environ.get("GITHUB_TOKEN")
            if token:
                headers["Authorization"] = "Bearer " + token
            req = Request(url, headers=headers)
            with urlopen(req, timeout=20) as r:
                return json.load(r)
    payload = getter(api)
    runs = payload.get("workflow_runs", [])
    if not isinstance(runs, list):
        raise RuntimeError("Invalid GitHub workflow run response")
    relevant = [r for r in runs if needle in r.get("name", "")]
    latest_run = max(relevant, key=lambda r: r.get("created_at", "")) if relevant else None
    if latest_run is None:
        return None, "github-workflow-history-not-found"
    return {
        "status": latest_run.get("status"),
        "conclusion": latest_run.get("conclusion"),
        "created_at": latest_run.get("created_at"),
        "url": latest_run.get("html_url"),
        "branch": latest_run.get("head_branch"),
        "event": latest_run.get("event"),
    }, "github-workflow-history"
