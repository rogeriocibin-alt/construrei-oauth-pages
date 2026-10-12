#!/usr/bin/env python3
"""Stream private pg_dump COPY headers; emit only safe aggregate counts."""
import argparse
import json
import tempfile
from pathlib import Path


def inventory(file: Path):
    counts = {"auth": 0, "storage": 0, "other": 0}
    in_copy = False
    pg17_setting = False
    with file.open('r', encoding='utf-8', errors='replace') as stream:
        for line in stream:
            line = line.rstrip('\r\n')
            if in_copy:
                if line == r'\.':
                    in_copy = False
                continue
            if line.startswith('SET transaction_timeout'):
                pg17_setting = True
            if not line.startswith('COPY '):
                continue
            if not line.endswith(' FROM stdin;'):
                raise ValueError('Unsupported COPY header; private review required')
            if line.startswith('COPY "auth".') or line.startswith('COPY auth.'):
                counts['auth'] += 1
            elif line.startswith('COPY "storage".') or line.startswith('COPY storage.'):
                counts['storage'] += 1
            else:
                counts['other'] += 1
            in_copy = True
    if in_copy:
        raise ValueError('Unterminated COPY block; private review required')
    return {
        'kind': 'COFRE_ZERO_SQL_COPY_HEADER_INVENTORY',
        'copy_headers_by_group': counts,
        'copy_headers_total': sum(counts.values()),
        'pg17_transaction_timeout_setting': pg17_setting,
        'row_content_examined': False,
        'sql_restore_attempted': False,
        'eligible_for_recovery_signoff': False,
    }


def selftest():
    with tempfile.TemporaryDirectory(prefix='cofre-copy-fixture-') as d:
        path = Path(d) / 'fixture.sql'
        path.write_text('SET transaction_timeout = 0;\n'
                        'COPY "auth"."users" (id) FROM stdin;\n'
                        'PRIVATE_ROW_DO_NOT_REPORT\n'
                        '\\.\n'
                        'COPY "storage"."objects" (id) FROM stdin;\n'
                        'PRIVATE_2\n'
                        '\\.\n'
                        'COPY "public"."items" (id) FROM stdin;\n'
                        '999\n'
                        '\\.\n', encoding='utf-8')
        result = inventory(path)
        assert result['copy_headers_by_group'] == {'auth': 1, 'storage': 1, 'other': 1}
        assert result['copy_headers_total'] == 3
        assert result['pg17_transaction_timeout_setting']
        assert 'PRIVATE_ROW' not in json.dumps(result)
        assert result['eligible_for_recovery_signoff'] is False
        path.write_text('COPY "auth"."users" FROM stdin;\nPRIVATE_ROW\n', encoding='utf-8')
        try:
            inventory(path)
        except ValueError as exc:
            assert 'Unterminated COPY block' in str(exc)
        else:
            raise AssertionError('Unclosed COPY was accepted')
        path.write_text('COPY "auth"."users" FROM stdout;\n', encoding='utf-8')
        try:
            inventory(path)
        except ValueError as exc:
            assert 'Unsupported COPY header' in str(exc)
        else:
            raise AssertionError('Unexpected header was accepted')
    print('PASS: safe COPY header inventory and fail-closed fixtures')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', type=Path)
    parser.add_argument('--selftest', action='store_true')
    args = parser.parse_args()
    if args.selftest:
        selftest()
    else:
        if args.root is None:
            parser.error('--root required')
        file = args.root / '03_DATABASE' / 'data.sql'
        if not file.is_file() or file.is_symlink():
            raise ValueError('Missing private data.sql artifact')
        print(json.dumps(inventory(file), sort_keys=True))


if __name__ == '__main__':
    main()
