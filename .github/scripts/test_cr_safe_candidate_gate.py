#!/usr/bin/env python3
"""Offline synthetic regression tests for CR's no-interference candidate gate."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import cr_safe_candidate_gate as guard


def git(root, *args):
    return subprocess.check_output(["git", "-C", str(root), *args]).decode().strip()


class CandidateScopeTests(unittest.TestCase):
    def test_only_three_named_additions_are_accepted(self):
        self.assertEqual(
            guard.assess_changes([("A", path) for path in sorted(guard.ALLOWED_ADDITIONS)]), []
        )

    def test_production_or_ci_mutation_is_rejected(self):
        safe = [("A", path) for path in sorted(guard.ALLOWED_ADDITIONS)]
        for status, path in [
            ("M", "production/official/index.html"),
            ("D", "preview/legacy/index.html"),
            ("A", "gestor-projeto/project-data.json"),
            ("M", "security/contracts/wz01-flow-authorization.mjs"),
            ("A", ".github/workflows/extra-cron.yml"),
            ("A", "docs/official-links-registry.json"),
            ("A", "docs/unsafe-new-master.json"),
            ("A", "../outside"),
            ("R100", "production/broken.html"),
        ]:
            with self.subTest(status=status, path=path):
                self.assertTrue(guard.assess_changes(safe + [(status, path)]))

    def test_parser_detects_truncation_and_rename(self):
        self.assertEqual(guard.parse_name_status_z(b"A\0x\0M\0y\0"), [("A", "x"), ("M", "y")])
        with self.assertRaises(ValueError):
            guard.parse_name_status_z(b"A\0x")
        with self.assertRaises(ValueError):
            guard.parse_name_status_z(b"R100\0old\0new\0")

    def test_real_local_git_candidate_and_negative_regression(self):
        """Creates a temporary repository only. No remote, no token, no production."""
        with tempfile.TemporaryDirectory() as scratch:
            root = Path(scratch)
            git(root, "init", "-q", "-b", "main")
            git(root, "config", "user.email", "synthetic@example.invalid")
            git(root, "config", "user.name", "Synthetic CI")
            (root / "README.md").write_text("fixture baseline\n")
            git(root, "add", ".")
            git(root, "commit", "-qm", "synthetic baseline")
            base = git(root, "rev-parse", "HEAD")
            git(root, "checkout", "-qb", "candidate/safe-test")
            for path in guard.ALLOWED_ADDITIONS:
                target = root / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_text("Synthetic offline content\n")
            git(root, "add", ".")
            git(root, "commit", "-qm", "three safe files")
            cmd = [
                sys.executable, str(Path(guard.__file__).resolve()),
                "--repo", str(root), "--base", base,
            ]
            healthy = subprocess.run(cmd, text=True, capture_output=True)
            self.assertEqual(healthy.returncode, 0, healthy.stdout + healthy.stderr)
            self.assertTrue(json.loads(healthy.stdout)["candidate_scope_pass"])
            extra = root / "production/official/index.html"
            extra.parent.mkdir(parents=True, exist_ok=True)
            extra.write_text("fixture unsafe\n")
            git(root, "add", ".")
            git(root, "commit", "-qm", "synthetic forbidden production diff")
            blocked = subprocess.run(cmd, text=True, capture_output=True)
            self.assertEqual(blocked.returncode, 1)
            self.assertFalse(json.loads(blocked.stdout)["candidate_scope_pass"])
            self.assertIn("Protected operational/control path", blocked.stdout)


if __name__ == "__main__":
    unittest.main()
