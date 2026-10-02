# NO-REGRESSION GUARD — CONSTRU-REI F00→F09

Status: **ACTIVE / LOCKED**
Effective date: **2026-10-01**

This guard is mandatory for every future change to the CONSTRU-REI operational journey.

## Source of truth
- One Central
- One journey: `production/flow-canonical-20261001/`
- One current baseline
- One candidate per phase
- One promotion at a time
- Forward only

Machine-readable baseline:
`FLOW_BASELINE_MANIFEST.json`

Governance policy:
`FLOW_EVOLUTION_POLICY.md`

## Hard guard
Before any FXX change, compare the current production hashes against `FLOW_BASELINE_MANIFEST.json`.

If an unrelated file changed, STOP.

During an isolated FXX candidate:
- only FXX may change
- shared CSS must remain identical
- shared shell must remain identical
- Central HOME must remain identical
- sibling phases must remain identical
- shared runtime must remain identical unless a separately isolated backend candidate was explicitly authorized

## Promotion gate
Only the explicit phrase:
`FXX aprovado e validado`
authorizes promotion.

Promotion must:
1. verify scope
2. verify regression gates
3. replace only FXX
4. checkpoint the new FXX baseline
5. update only the approved FXX hash in `FLOW_BASELINE_MANIFEST.json`
6. retain the immediately previous FXX as rollback
7. keep all global visual hashes unchanged

## Rejection gate
If a candidate is not approved:
- discard/archive candidate
- do not alter production
- do not alter the manifest
- do not search historical versions
- do not rollback the whole journey

## Global visual lock
The following are frozen:
- `production/flow-canonical-20261001/_shared/cr-flow-canonical-20261001.css`
- `production/flow-canonical-20261001/_shared/cr-shell-production-20261001.js`
- Central HOME visual baseline

Any edit to them is a global visual change and requires explicit Rogério authorization.

## Shared backend lock
`cr-flow-runtime-v2` is shared. Never edit it directly as part of an ordinary phase review.
Use an isolated/versioned backend candidate and full regression gates first.

## Operational rule
No agent may replace the current journey with a historical preview, old candidate, old F01, or reconstructed full journey as a shortcut.

**NO GLOBAL ROLLBACK. NO PARALLEL ESTEIRAS. NO AUTOMATIC HISTORICAL RESTORE. FORWARD ONLY.**
