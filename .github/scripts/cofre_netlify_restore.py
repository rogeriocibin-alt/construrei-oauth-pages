#!/usr/bin/env python3
"""Restore downloaded static bundles locally. Never deploy or call production."""
import hashlib
import http.server
import json
import pathlib
import stat
import sys
import threading
import urllib.parse
import urllib.request
import zipfile
from functools import partial


def require(condition, message):
    if not condition:
        raise ValueError(message)


def relative(name):
    require(isinstance(name, str) and name and not name.startswith('/')
            and '\\' not in name and '\x00' not in name
            and all(p not in ('', '.', '..') for p in name.split('/')),
            'Unsafe archive path')
    return pathlib.PurePosixPath(name)


def sha(path, algorithm):
    digest = hashlib.new(algorithm)
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def restore(source, destination):
    source, destination = pathlib.Path(source), pathlib.Path(destination)
    require(not destination.exists(), 'Restore destination must be new')
    manifest = json.loads((source / 'NETLIFY_STATIC_MANIFEST.json').read_text())
    sites = manifest['sites']
    require(manifest['status'] in ('PASS_STATIC_ONLY', 'PARTIAL'), 'Unknown snapshot status')
    require(manifest['expected_sites'] == 7 and manifest['verified_sites'] == len(sites) and 0 < len(sites) <= 7, 'Expected seven sites')
    require(len({s['site_id'] for s in sites}) == len(sites), 'Duplicate site IDs')
    destination.mkdir(parents=True)
    result = []
    for index, site in enumerate(sites):
        archive = source / relative(site['archive'])
        require(sha(archive, 'sha256') == site['archive_sha256'], 'Archive SHA256 mismatch')
        expected = {f['path']: f for f in site['files']}
        require(len(expected) == len(site['files']) == site['file_count'] > 0, 'Manifest count mismatch')
        target = destination / str(index)
        target.mkdir()
        with zipfile.ZipFile(archive) as z:
            infos = z.infolist()
            require(len(infos) == len(expected), 'ZIP count mismatch')
            require(set(z.namelist()) == set(expected), 'ZIP inventory mismatch')
            for info in infos:
                name = relative(info.filename)
                require(not info.is_dir() and not stat.S_ISLNK(info.external_attr >> 16), 'Non-regular ZIP member')
                data = z.read(info)
                require(len(data) == expected[info.filename]['bytes'], 'File size mismatch')
                require(hashlib.sha1(data).hexdigest() == expected[info.filename]['sha1'], 'File SHA1 mismatch')
                output = target / name
                output.parent.mkdir(parents=True, exist_ok=True)
                output.write_bytes(data)
                require(sha(output, 'sha1') == expected[info.filename]['sha1'], 'Restored disk hash mismatch')
        entry = 'index.html' if 'index.html' in expected else next(iter(expected))
        server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(target)))
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        try:
            url = 'http://127.0.0.1:' + str(server.server_port) + '/' + urllib.parse.quote(entry, safe='/')
            with urllib.request.urlopen(url, timeout=10) as response:
                require(response.status == 200, 'Local HTTP restore failed')
                require(hashlib.sha1(response.read()).hexdigest() == expected[entry]['sha1'], 'HTTP content mismatch')
        finally:
            server.shutdown()
            server.server_close()
            thread.join()
        result.append({'site_id': site['site_id'], 'name': site['name'], 'files': len(expected),
                       'archive_sha256': site['archive_sha256'], 'disk_restore': 'PASS', 'local_http': 'PASS'})
    report = {'status': 'PASS_STATIC_RESTORE_ONLY' if len(result) == 7 and not manifest['errors'] else 'PASS_PARTIAL_STATIC_RESTORE', 'expected_sites': 7, 'sites': result, 'site_count': len(result),
              'file_count': sum(s['files'] for s in result), 'production_modified': False,
              'scope': 'Full Drive ZIP readback, isolated disk extraction and hashes, local HTTP byte check. No JS execution or live deployment. Functions, secrets, DNS, external services and application behavior NOT tested.'}
    (source / 'RESTORE_REPORT.json').write_text(json.dumps(report, indent=2))
    print(report['status'], 'sites=', len(result), '/7 files=', report['file_count'])
    return report


if __name__ == '__main__':
    restore(sys.argv[1], sys.argv[2])
