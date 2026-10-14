#!/usr/bin/env python3
"""Read-only scan of local static links in the ephemeral publication candidate.

Not browser E2E, not full JS resolution, and NEVER authorizes deletion/cutover.
"""
import json
import posixpath
import re
from collections import defaultdict
from html.parser import HTMLParser
from pathlib import PurePosixPath
from urllib.parse import urlsplit, unquote
from cr_ephemeral_publication_gate import (
    ROOT, REGISTRY, PREVIEW, PUBLIC_ROOT_FILES, PUBLIC_SUPPORT,
    PROTECTED_PREVIEW_STATES, REQUIRED_TRANSITIVE_PREVIEW, tracked,
)

HOST = "rogeriocibin-alt.github.io"
BASE = "/construrei-oauth-pages/"
CSS = re.compile(r"url\(\s*['\"]?([^\)'\"\s]+)|@import\s+['\"]([^'\"]+)", re.I)
JS = re.compile(
    r"(?:\bimport\s*\(|\bimport\s+[^;\n]*?\s+from\s*|\bimport\s+|"
    r"\bfetch\s*\(|\bregister\s*\(|\bnew\s+URL\s*\()\s*['\"]([^'\"\n]+)", re.I
)
DYNAMIC = re.compile(r"preview\s*/\s*(?:\$\{|['\"\x60]|\+|\s|$)", re.I)


# CI has proved the following existing baseline in run 38196805647 (PR #66).
# These are BUDGETS FOR NEW REGRESSIONS, not proof that existing 26
# missing references are harmless. Every exception remains an open issue.
BASELINE_MISSING_REFERENCES = 26
BASELINE_CURRENT_CENTRAL_MISSING = 3
CURRENT_CENTRAL = "production/central-operacional-v2-ux-r1-2-homologada-20261005/"
GABI_V21 = "preview/app-gabi-v21-parecer-logo-20261008/index.html"
GABI_V20 = "preview/app-gabi-v20-documentos-f02-20261008/index.html"


def regression_findings(missing, withheld, included):
    """Fail on *new* missing links or exclusion of known live dependencies."""
    current_missing = {p for p in missing if p[0].startswith(CURRENT_CENTRAL)}
    failures = []
    if withheld:
        failures.append("Existing first-party files omitted from ephemeral stage: " + str(len(withheld)))
    if len(missing) > BASELINE_MISSING_REFERENCES:
        failures.append("Missing first-party links rose above 26: " + str(len(missing)))
    if len(current_missing) > BASELINE_CURRENT_CENTRAL_MISSING:
        failures.append("Current canonical Central missing links rose above 3: " + str(len(current_missing)))
    if (GABI_V21, GABI_V20) not in included:
        failures.append("Gabi v21 -> v20 iframe dependency not present in stage")
    return failures


def refs_css(s):
    return [a or b for a, b in CSS.findall(s)]


def refs_js(s):
    return JS.findall(s)


class HTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.urls = []
        self.mode = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag != "base":
            for name in ("href", "src", "poster", "manifest"):
                if attrs.get(name):
                    self.urls.append((tag + ":" + name, attrs[name]))
            if tag == "object" and attrs.get("data"):
                self.urls.append(("object:data", attrs["data"]))
            if attrs.get("srcset"):
                for x in attrs["srcset"].split(","):
                    if x.strip():
                        self.urls.append(("srcset", x.strip().split()[0]))
            if attrs.get("style"):
                self.urls.extend(("css-inline", x) for x in refs_css(attrs["style"]))
        if tag in ("script", "style"):
            self.mode = tag

    def handle_endtag(self, tag):
        if self.mode == tag:
            self.mode = None

    def handle_data(self, s):
        if self.mode == "style":
            self.urls.extend(("css-inline", x) for x in refs_css(s))
        if self.mode == "script":
            self.urls.extend(("js-inline", x) for x in refs_js(s))


def resolve(origin, raw):
    if not raw or any(x in raw for x in ("$" + "{", "{{", "\\", "<", ">")):
        return None
    raw = raw.strip()
    if raw.startswith(("#", "?", "//")):
        return None
    try:
        u = urlsplit(raw)
    except ValueError:
        return None
    if u.scheme and u.scheme not in ("http", "https"):
        return None
    if u.netloc and u.netloc.lower() != HOST:
        return None
    path = unquote(u.path)
    if not path or any(x in path for x in ("*", "{", "}", "$", "|", "'", '"')):
        return None
    if u.netloc or path.startswith("/"):
        if path == BASE[:-1]:
            path = "/"
        elif path.startswith(BASE):
            path = path[len(BASE):]
        else:
            return None
    else:
        path = posixpath.join(posixpath.dirname(origin), path)
    result = posixpath.normpath(path)
    if result in ("", ".", "/"):
        return "index.html"
    if result == ".." or result.startswith("../"):
        return None
    return result + "/index.html" if path.endswith("/") else result


def main():
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    inventory = json.loads(PREVIEW.read_text(encoding="utf-8"))
    slugs = {x["slug"] for x in registry["links"]}
    keep = {x["path"].strip("/").split("/")[1] for x in inventory["folders"]
            if x["status"] in PROTECTED_PREVIEW_STATES}
    assert len(slugs) == len(registry["links"]) == 39
    assert len(inventory["folders"]) == inventory["folder_count"] == 123
    assert len(keep) == 12
    assert REQUIRED_TRANSITIVE_PREVIEW <= {x["path"].strip("/").split("/")[1] for x in inventory["folders"]}
    assert REQUIRED_TRANSITIVE_PREVIEW.isdisjoint(keep)
    keep |= REQUIRED_TRANSITIVE_PREVIEW
    assert len(keep) == 13
    files = set(tracked())
    staged = set()
    for rel in files:
        p = PurePosixPath(rel).parts
        if (rel in PUBLIC_ROOT_FILES or p[0] in slugs or p[0] in PUBLIC_SUPPORT
                or (p[0] == "preview" and len(p) > 2 and p[1] in keep)):
            staged.add(rel)
    counts = defaultdict(set)
    examples = defaultdict(set)
    for origin in sorted(staged):
        suffix = PurePosixPath(origin).suffix.lower()
        if suffix not in (".html", ".css", ".js", ".mjs", ".svg"):
            continue
        data = (ROOT / origin).read_bytes()
        if len(data) > 3_000_000:
            counts["too_large"].add(origin)
            continue
        s = data.decode("utf-8", "replace")
        counts["inspected"].add(origin)
        if DYNAMIC.search(s):
            counts["dynamic_preview_hints"].add(origin)
        if suffix in (".html", ".svg"):
            parser = HTML()
            parser.feed(s)
            refs = parser.urls
        elif suffix == ".css":
            refs = [("css", x) for x in refs_css(s)]
        else:
            refs = [("js", x) for x in refs_js(s)]
        for category, raw in refs:
            target = resolve(origin, raw)
            if target is None:
                continue
            if target not in files and target + "/index.html" in files:
                target += "/index.html"
            counts["literal_refs"].add((origin, target))
            if target in staged:
                counts["included"].add((origin, target))
            elif target in files:
                counts["withheld"].add((origin, target))
                examples["withheld"].add((origin, target, category))
            else:
                counts["missing"].add((origin, target))
                examples["missing"].add((origin, target, category))
    result = {
        "kind": "READ_ONLY_STATIC_DEPENDENCY_AUDIT",
        "production_modified": False,
        "new_cloud_resources": False,
        "staged_files": len(staged),
        "files_inspected": len(counts["inspected"]),
        "literal_local_refs": len(counts["literal_refs"]),
        "literal_refs_included": len(counts["included"]),
        "repo_files_omitted_from_candidate": len(counts["withheld"]),
        "unresolved_literals_not_in_repo": len(counts["missing"]),
        "canonical_current_central_missing": len({p for p in counts["missing"] if p[0].startswith(CURRENT_CENTRAL)}),
        "static_regression_budget": {"missing_references": BASELINE_MISSING_REFERENCES,
                                     "canonical_current_central": BASELINE_CURRENT_CENTRAL_MISSING,
                                     "withheld_references": 0},
        "dynamic_preview_hint_files": len(counts["dynamic_preview_hints"]),
        "dynamic_preview_hint_sample": sorted(counts["dynamic_preview_hints"])[:20],
        "withheld_sample": [dict(origin=a,target=b,kind=c) for a,b,c in sorted(examples["withheld"])[:25]],
        "missing_sample": [dict(origin=a,target=b,kind=c) for a,b,c in sorted(examples["missing"])[:25]],
        "oversized_uninspected": sorted(counts["too_large"]),
        "eligible_for_production_cutover": False,
        "limits": [
            "Literal refs only; dynamically built URLs, base href and PWA cache not proven",
            "No authentication, API writes, OAuth, RLS, integration or UX verification",
            "External hosts and nonstatic links not checked",
            "Missing links may be optional or intentional; classify before editing",
            "No deletions, migrations or publication approved by this result",
        ],
    }
    findings = regression_findings(counts["missing"], counts["withheld"], counts["included"])
    result["static_regressions_detected"] = findings
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if "--enforce" in __import__("sys").argv and findings:
        raise RuntimeError("STATIC_REGRESSION_BLOCK: " + " | ".join(findings))
    return result


def selftest():
    assert resolve("gestor-projeto/index.html", "./app.js?v=1") == "gestor-projeto/app.js"
    assert resolve("central-runtime/f00/index.html", "../../preview/_shared/a.js") == "preview/_shared/a.js"
    assert resolve("index.html", "https://" + HOST + BASE + "gestor-projeto/") == "gestor-projeto/index.html"
    assert resolve("index.html", "/construrei-oauth-pages/a.css") == "a.css"
    assert resolve("index.html", "../escape.js") is None
    assert resolve("index.html", "mailto:user@example.com") is None
    assert resolve("index.html", "https://other.example/file.js") is None
    p = HTML()
    p.feed('<link href="./a.css"><style>.a{background:url(./b.svg)}</style>'
           '<script>fetch("./data.json");navigator.serviceWorker.register("./sw.js")</script>')
    assert {"./a.css","./b.svg","./data.json","./sw.js"} <= {x[1] for x in p.urls}
    assert refs_js("import './a.js'; import x from '../b.js';") == ["./a.js", "../b.js"]
    baseline_included = {(GABI_V21, GABI_V20)}
    baseline_missing = {(CURRENT_CENTRAL + "clean-native.css", "a" + str(i)) for i in range(3)}
    baseline_missing |= {("old/" + str(i), "missing/" + str(i)) for i in range(23)}
    assert regression_findings(baseline_missing, set(), baseline_included) == []
    assert regression_findings(baseline_missing | {("x", "new")}, set(), baseline_included)
    assert regression_findings(baseline_missing, {("x", "withheld")}, baseline_included)
    assert regression_findings(baseline_missing, set(), set())
    print("PASS: scanner offline selftest")


if __name__ == "__main__":
    import sys
    selftest() if "--selftest" in sys.argv else main()
