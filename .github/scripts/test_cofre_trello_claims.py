#!/usr/bin/env python3
"""Offline contract tests; no credentials or network requests."""
import unittest
from cofre_trello_bootstrap import AUD, WORKFLOW_REF_PREFIX, check_oidc_claims

def claims(ref="refs/heads/main", event="schedule"):
    return {
        "iss": "https://token.actions.githubusercontent.com",
        "aud": AUD,
        "repository": "rogeriocibin-alt/construrei-oauth-pages",
        "repository_id": "1388982225",
        "repository_owner_id": "324275787",
        "ref": ref,
        "workflow_ref": WORKFLOW_REF_PREFIX + ref,
        "event_name": event,
        "run_id": "38180968850",
        "runner_environment": "github-hosted",
    }

class IdentityContractTest(unittest.TestCase):
    def test_main_schedule(self):
        self.assertTrue(all(check_oidc_claims(claims()).values()))

    def test_candidate_push(self):
        ref = "refs/heads/checkpoint/cofre-zero-trello-offsite-20261011"
        self.assertTrue(all(check_oidc_claims(claims(ref, "push")).values()))

    def test_alternate_branch(self):
        self.assertFalse(check_oidc_claims(claims("refs/heads/other"))["branch"])

    def test_workflow_binding(self):
        x = claims()
        x["workflow_ref"] = "other"
        self.assertFalse(check_oidc_claims(x)["workflow"])

    def test_event(self):
        self.assertFalse(check_oidc_claims(claims(event="pull_request"))["event"])

if __name__ == "__main__":
    unittest.main(verbosity=2)
