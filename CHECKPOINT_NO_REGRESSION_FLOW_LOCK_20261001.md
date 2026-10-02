# CHECKPOINT — NO REGRESSION FLOW LOCK — 2026-10-01

## Status
CONSTRU-REI F00→F09 visual/architectural baseline is frozen and protected by governance + machine-readable hash manifest.

## Baseline before this checkpoint
- parent commit: `04106046287da7430967043ca18ce7f3975b296a`
- canonical namespace: `production/flow-canonical-20261001/`
- entrypoint: `production/flow-canonical-20261001/f00/`

## Protection artifacts
- `FLOW_EVOLUTION_POLICY.md`
- `FLOW_BASELINE_MANIFEST.json`
- `NO_REGRESSION_GUARD.md`

## Protected visual blobs
- Central HOME: `d40a9d65ed3ac13836423dec335cb656d17c49c9`
- Shared CSS: `8db504ce0bc4e8871806b12357284e68e0cdcd1e`
- Shared shell: `2e46d31012892138645fc6880add60a9463f1546`

## Phase blobs
- F00 `371cd9cf97759691f87c2c5dfb9be446e3487374`
- F01 `77e964d3661f4a18ff243683786227aa9f64ae74`
- F02 `b3cf6c73f73b92e7c4d9d023010a1ec0a9051ffd`
- F03 `a7fbafd6268a9c6499db27ddada5ab59842fd5c0`
- F04 `9e2976e0b9336a16995ddd3bbae00b9ed3905cb5`
- F05 `64b65790370f23149275a6f4c7ea0a6b38a59a86`
- F06 `0cf95e47a78714ce5089fbafe61b55bbd9593847`
- F07 `3c1956630d6779263cf23722771da0dc4174826c`
- F08 `2f248f251fd0219cd9dd6c3ec5fa7aa5f5ecede4`
- F09 `11d7b1ce4d7fadef65189362e8fbfe35ac45092c`

## Runtime snapshot
- central-atendimento v150 ACTIVE — `37c32ba842979c207ba14797615db88f537162ae69eb033105ae64445894c08d`
- cr-f00-intake v18 ACTIVE — `8c115007001fc9468d86d5b8203a1d00ba85d18005181ce2333e8e00bcb8ab5e`
- cr-flow-runtime-v2 v9 ACTIVE — `868a3cb7a27519d17e5849d117385dac40d29b033d11df47cb0831be0499b3a5`
- cr-f01-canonical-runtime v1 ACTIVE — `b21e449bb43a594ce9d7781a3476039c289d1e41938400fc3b5803fd7733b40e`
- centro-operacoes v274 ACTIVE — `26fd6d54b3d7880b00d934722d3df06b762e5a45011e39798e4d6d2919f52bac`

## Enforcement rule
Every future phase candidate must pass manifest comparison before promotion.
Unrelated drift = STOP.
Global visual drift = STOP unless Rogério explicitly authorizes it.
Shared runtime drift = STOP unless separately isolated and regression-tested.

Explicit phase promotion command:
`FXX aprovado e validado`

## Important platform note
GitHub native branch protection is not enabled on `main` through the current repository connection. Therefore this checkpoint uses immutable commit/branch references, the governance policy, and hash-manifest enforcement as the available protection layer. Do not move locked checkpoint branches forward.

## Next authorized development
F00 functional revalidation in one isolated candidate only.

FORWARD ONLY.
