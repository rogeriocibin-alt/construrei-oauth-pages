#!/usr/bin/env python3
"""F00-F09 temporary local cutover simulation; never changes production files."""
from functools import partial
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from tempfile import TemporaryDirectory
from threading import Thread
from urllib.parse import urljoin
from urllib.request import urlopen
import hashlib

ROOT = Path(__file__).resolve().parents[2]
MODULES = ["f00", "f01-canonical-20261001"] + [f"f{i:02d}" for i in range(2, 10)]
BEFORE = "../../preview/_shared/cr-checklist-native-20261004.js?v=20261004"
AFTER = "../../central-runtime/_shared/cr-checklist-native-20261004.js?v=20261004"
CANON = "central-runtime/_shared/cr-checklist-native-20261004.js"
ORIGINAL = "preview/_shared/cr-checklist-native-20261004.js"

class Scripts(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []

    def handle_starttag(self, tag, attrs):
        if tag.lower() == "script":
            self.sources += [v for k, v in attrs if k.lower() == "src" and v]

class SilentHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def main():
    old = (ROOT / ORIGINAL).read_bytes()
    new = (ROOT / CANON).read_bytes()
    assert old == new, "Shared JS diverged"
    assert len(MODULES) == 10 and len(set(MODULES)) == 10
    with TemporaryDirectory(prefix="cr-f00-f09-staging-") as working:
        temp = Path(working)
        shared = temp / CANON
        shared.parent.mkdir(parents=True, exist_ok=True)
        shared.write_bytes(new)
        for name in MODULES:
            original = ROOT / "central-runtime" / name / "index.html"
            body = original.read_text(encoding="utf-8")
            assert body.count(BEFORE) == 1, f"Expected exactly one original JS import: {name}"
            candidate = body.replace(BEFORE, AFTER)
            assert candidate.replace(AFTER, BEFORE) == body, f"Unexpected HTML change: {name}"
            destination = temp / "central-runtime" / name / "index.html"
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(candidate, encoding="utf-8")
        server = ThreadingHTTPServer(
            ("127.0.0.1", 0),
            partial(SilentHandler, directory=str(temp))
        )
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            for name in MODULES:
                page_url = f"http://127.0.0.1:{server.server_port}/central-runtime/{name}/index.html"
                with urlopen(page_url, timeout=3) as response:
                    assert response.status == 200
                    html = response.read().decode("utf-8")
                parser = Scripts()
                parser.feed(html)
                assert AFTER in parser.sources, f"Canonical script not referenced: {name}"
                assert BEFORE not in parser.sources, f"Old preview script still referenced: {name}"
                script_url = urljoin(page_url, AFTER)
                with urlopen(script_url, timeout=3) as response:
                    assert response.status == 200 and response.read() == new
                print(f"PASS: {name} -> isolated temporary canonical script")
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=5)
    print("PASS: 10/10 temporary HTTP smoke tests; files automatically discarded")
    print("SHA-256 source/copy:", hashlib.sha256(new).hexdigest())
    print("NOT a UI/mobile/PWA homologation or production cutover")

if __name__ == "__main__":
    main()
