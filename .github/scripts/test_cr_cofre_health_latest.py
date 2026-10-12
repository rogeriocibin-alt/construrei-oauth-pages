#!/usr/bin/env python3
"""Offline tests for correctly tracing the latest available backup run."""
import unittest
from cr_cofre_health_latest import latest


class BackupHistoryTests(unittest.TestCase):
    def test_edge_summary_has_priority_if_present(self):
        run = {"status": "completed", "conclusion": "success", "created_at": "2026-10-11T19:54:23Z"}
        def never_call(_url):
            raise AssertionError("Unnecessary query")
        got, source = latest([{"name": "Cofre Zero | Immutable daily full archive", "latest": run}],
                             "Immutable daily full archive", never_call)
        self.assertEqual(source, "edge-summary")
        self.assertEqual(got, run)

    def test_fallback_reaches_workflow_history_on_truncation(self):
        def getter(url):
            self.assertIn("/cofre-zero-history-full.yml/runs?", url)
            return {"workflow_runs": [
                {"name": "Cofre Zero | Immutable daily full archive", "conclusion": "success",
                 "status": "completed", "created_at": "2026-10-11T19:54:23Z",
                 "head_branch": "checkpoint/cofre-zero-archive-full-20261011"}
            ]}
        got, source = latest([{"name": "Cofre Zero | Immutable daily full archive", "latest": None}],
                             "Immutable daily full archive", getter)
        self.assertEqual(source, "github-workflow-history")
        self.assertEqual(got["conclusion"], "success")
        self.assertNotEqual(got["branch"], "main")

    def test_latest_failure_is_not_hidden_by_old_success(self):
        got, _ = latest([], "Immutable daily full archive", lambda _: {"workflow_runs": [
            {"name": "Cofre Zero | Immutable daily full archive", "conclusion": "success",
             "status": "completed", "created_at": "2026-10-11T10:00:00Z"},
            {"name": "Cofre Zero | Immutable daily full archive", "conclusion": "failure",
             "status": "completed", "created_at": "2026-10-11T11:00:00Z"},
        ]})
        self.assertEqual(got["conclusion"], "failure")

    def test_no_runs_means_no_evidence(self):
        got, source = latest([], "Immutable daily full archive",
                             lambda _: {"workflow_runs": []})
        self.assertIsNone(got)
        self.assertEqual(source, "github-workflow-history-not-found")

    def test_unmapped_workflow_rejected(self):
        with self.assertRaises(ValueError):
            latest([], "unregistered archive type", lambda _: {})


if __name__ == "__main__":
    unittest.main()
