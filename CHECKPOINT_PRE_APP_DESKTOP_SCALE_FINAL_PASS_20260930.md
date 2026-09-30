# CHECKPOINT PRE — APP DESKTOP SCALE FINAL PASS — 2026-09-30

- Candidate: cr-app-audited-central-alignment-20260930
- Historical base: 652f7aff696ae289c0fdcec75997f1e1c3a33bcc
- Current visual baseline commit: 138f7740dda4c477ae0fe3e3265bfef9b89a3ede
- Scope: desktop density/scale only.
- Production: untouched.

## Goal
Increase desktop visual scale and presence without changing architecture, palette, snapshot, logic, navigation, data, routes or mobile behavior.

## Invariants
- Embedded audited Base64 snapshot remains byte-equivalent.
- No changes inside decompressed snapshot.
- No handler/listener/route/action changes.
- Mobile kept essentially unchanged.
