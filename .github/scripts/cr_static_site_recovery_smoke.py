#!/usr/bin/env python3
"""Restore a checked-out static Central/Gestor/landing tree in a disposable loopback server.

No production writes, accounts, HTTP network egress or external provider tokens.
Passing this probe does NOT certify OAuth, dynamic APIs, Supabase or Netlify.
"""
from __future__ import annotations

import argparse
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.request import urlopen

ROUTES = {
    "/": "home",
    "/gestor-projeto/": "gestor",
    "/production/central-operacional-v2-ux-r1-2-homologada-20261005/": "central",
}


def exercise(root: Path) -> None:
    root = root.resolve(strict=True)

    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, directory=str(root), **kwargs)

        def log_message(self, *_args):
            pass

    server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    server.daemon_threads = True
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        for route, label in ROUTES.items():
            url = f"http://127.0.0.1:{server.server_port}{route}"
            with urlopen(url, timeout=8) as response:
                body = response.read(5 * 1024 * 1024)
                assert response.status == 200, f"{label}: non-200"
                assert b"<html" in body.lower(), f"{label}: invalid HTML"
                assert len(body) > 500, f"{label}: empty/truncated"
                assert "text/html" in response.headers.get("Content-Type", ""), f"{label}: wrong content type"
                print(f"STATIC_RECOVERY_PASS {label} HTTP=200 HTML_BYTES={len(body)}")
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=8)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path("."))
    args = parser.parse_args()
    exercise(args.root)
    print("STATIC_RECOVERY_SCOPE=static_HTML_only_OAuth_and_dynamic_backends_not_tested")
