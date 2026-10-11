#!/usr/bin/env python3
"""Headless mobile/desktop check in a temporary local HTTP environment.
Never writes official HTML or contacts credential-protected endpoints.
Screenshots are short-lived CI artifacts, not permanent snapshots.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread
from urllib.request import urlopen
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "cr-qa-output"
PAGES = ("f00", "f02", "f09")
SIZES = {"mobile": "390,844", "desktop": "1365,900"}
EXPECTED = "data-cr-checklist-native=\"candidate-20261004\""
SOURCE = "../../central-runtime/_shared/cr-checklist-native-20261004.js?v=20261004"

class SilentHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def main():
    chrome = next((shutil.which(x) for x in ("google-chrome", "chromium", "chromium-browser") if shutil.which(x)), None)
    if not chrome:
        raise RuntimeError("Chrome/Chromium absent on runner; visual stage cannot be validated")
    OUTPUT.mkdir(exist_ok=True)
    for name in PAGES:
        html = (ROOT / "central-runtime" / name / "index.html").read_text(encoding="utf-8")
        assert html.count(SOURCE) == 1, f"Noncandidate import in {name}"
    server = ThreadingHTTPServer(
        ("127.0.0.1", 0), partial(SilentHandler, directory=str(ROOT))
    )
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        for name in PAGES:
            for profile, size in SIZES.items():
                url = f"http://127.0.0.1:{server.server_port}/central-runtime/{name}/index.html"
                with urlopen(url, timeout=5) as res:
                    assert res.status == 200
                dest = OUTPUT / f"qa-{name}-{profile}.png"
                with TemporaryDirectory(prefix="cr-chrome-") as temp:
                    args = [
                        chrome, "--headless=new", "--no-sandbox", "--disable-gpu",
                        "--disable-dev-shm-usage", "--disable-extensions",
                        "--no-first-run", "--disable-background-networking",
                        "--hide-scrollbars", "--virtual-time-budget=3500",
                        f"--user-data-dir={temp}", f"--window-size={size}",
                        f"--screenshot={dest}", "--dump-dom", url
                    ]
                    response = subprocess.run(args, text=True, capture_output=True, timeout=30)
                    assert response.returncode == 0, f"Chrome exited {response.returncode} in {name}/{profile}: {response.stderr[-800:]}"
                    assert EXPECTED in response.stdout, f"Shared JS failed to initialize in Chrome {name}/{profile}"
                    assert dest.exists() and dest.stat().st_size > 1000, f"Empty screenshot {dest}"
                    print(f"PASS: real Chrome / {name} / {profile} / initialized / screenshot {dest.stat().st_size} bytes")
        print("PASS: browser smoke 6/6 responsive scenarios; screenshots are temporary GH artifacts")
        print("IMPORTANT: browser smoke is not human UX/PWA/OAuth homologation")
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=5)

if __name__ == "__main__":
    main()
