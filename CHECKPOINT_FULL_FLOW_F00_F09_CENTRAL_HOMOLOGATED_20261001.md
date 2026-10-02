# CHECKPOINT — FULL FLOW F00–F09 CENTRAL HOMOLOGATED — 2026-10-01

## Decision
The approved preview journey is promoted as ONE canonical operational product.
Source of truth used:
- preview/f00-canonical-ui-20261001/
- preview/f01-canonical-ui-20261001/
- preview/f02-canonical-ui-20261001/
- preview/f03-canonical-ui-20261001/
- preview/f04-canonical-ui-20261001/
- preview/f05-canonical-ui-20261001/
- preview/f06-canonical-ui-20261001/
- preview/f07-canonical-ui-20261001/
- preview/f08-canonical-ui-20261001/
- preview/f09-canonical-ui-20261001/
- preview/_shared/cr-flow-canonical-20261001.css
- preview/_shared/cr-shell-candidate-20261001.js

## Canonical production namespace
- production/flow-canonical-20261001/
- entrypoint: production/flow-canonical-20261001/f00/
- shared CSS: _shared/cr-flow-canonical-20261001.css
- shared router shell: _shared/cr-shell-production-20261001.js

## Central integration
production/central-homologada-20261001/index.html changed only in go('flows'):
- Esteira F00 → F09 now opens the canonical production F00 entrypoint.
- HOME layout, Dashboard, APP, Presentation, Academy, Documentation, auth and admin areas were not redesigned.

## Router integration
central-atendimento:
- PRE version: 149
- PRE hash: 0487bc1b9789e1d6f3055eb907b4d470ed191ac3ea173c920810f6d7bccfccaa
- POST version: 150
- POST status: ACTIVE
- POST hash: 37c32ba842979c207ba14797615db88f537162ae69eb033105ae64445894c08d
- PRIMARY and FALLBACK for F00–F09 all point to the same canonical production namespace.
- mode=app and non-flow routing preserved.

## Production blobs
- F00: 371cd9cf97759691f87c2c5dfb9be446e3487374
- F01: 77e964d3661f4a18ff243683786227aa9f64ae74
- F02: b3cf6c73f73b92e7c4d9d023010a1ec0a9051ffd
- F03: a7fbafd6268a9c6499db27ddada5ab59842fd5c0
- F04: 9e2976e0b9336a16995ddd3bbae00b9ed3905cb5
- F05: 64b65790370f23149275a6f4c7ea0a6b38a59a86
- F06: 0cf95e47a78714ce5089fbafe61b55bbd9593847
- F07: 3c1956630d6779263cf23722771da0dc4174826c
- F08: 2f248f251fd0219cd9dd6c3ec5fa7aa5f5ecede4
- F09: 11d7b1ce4d7fadef65189362e8fbfe35ac45092c
- Shared CSS: 8db504ce0bc4e8871806b12357284e68e0cdcd1e
- Shared shell: 2e46d31012892138645fc6880add60a9463f1546
- Central HOME: d40a9d65ed3ac13836423dec335cb656d17c49c9

## Gates
PASS:
- all F00–F09 production pages exist on main
- every page keeps its own cr-flow-code
- every page uses the one production shared shell
- shell routes F00–F09 inside the same production namespace
- shell returns to the official centro-operacoes
- canonical CSS is shared across the journey
- Central go('flows') points to the F00 canonical entrypoint
- central-atendimento v150 maps PRIMARY and FALLBACK for every F00–F09 to this namespace
- no redesign of Central
- no functional reimplementation of F00–F09
- no backend/data/table/auth changes

Public HTTP rendering could not be independently fetched by the execution environment because external DNS/browser connectivity was unavailable. Structural publication, Git main state and Supabase router state were verified directly through GitHub and Supabase.

## Protection
PRE checkpoint:
CHECKPOINT_PRE_FULL_FLOW_F00_F09_PROMOTION_20261001

Branch:
cr-full-flow-f00-f09-central-promotion-20261001

FORWARD ONLY.
The full F00–F09 production journey is the source of truth.
Do not rebuild phases individually.
Do not restore legacy F01.
Do not mix historical flow versions.
