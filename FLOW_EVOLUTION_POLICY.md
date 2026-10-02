# FLOW EVOLUTION POLICY — CONSTRU-REI

Status: ACTIVE
Effective date: 2026-10-01

## Canonical rule
ONE CENTRAL. ONE F00→F09 JOURNEY. ONE STABLE BASELINE. ONE PHASE CANDIDATE AT A TIME.

Canonical production namespace:
`production/flow-canonical-20261001/`

Canonical journey entrypoint:
`production/flow-canonical-20261001/f00/`

Official Central:
`https://yspuaamokjbrosytqjpg.supabase.co/functions/v1/centro-operacoes`

## Global visual/architectural lock
The following are globally homologated and must not change during functional phase reviews:
- visual identity and color system
- shell and F00→F09 navigation
- logo
- typography
- button system
- spacing and hierarchy
- responsive behavior
- active-phase behavior
- previous/next navigation
- return-to-Central behavior
- one-journey architecture

Protected shared files:
- `production/flow-canonical-20261001/_shared/cr-flow-canonical-20261001.css`
- `production/flow-canonical-20261001/_shared/cr-shell-production-20261001.js`

Any requested edit to these shared files is a GLOBAL VISUAL CHANGE and requires explicit Rogério authorization before implementation.

## Functional status
Global visual/UI/UX/shell/journey architecture: HOMOLOGATED / LOCKED.
Functional behavior of F00–F09: SUBJECT TO INDIVIDUAL REVALIDATION.

Order of planned revalidation:
F00 → F01 → F02 → F03 → F04 → F05 → F06 → F07 → F08 → F09.

## Mandatory phase workflow
For phase FXX:
1. Start from the current official baseline.
2. Create ONE isolated FXX candidate.
3. Change only FXX and any strictly isolated candidate backend needed for FXX.
4. Do not alter F00–F09 siblings.
5. Do not alter shared shell/CSS.
6. Do not alter Central, Dashboard, APP, Presentation, Academy or Documentation unless explicitly authorized.
7. Test candidate.
8. Wait for Rogério's explicit command: `FXX aprovado e validado`.
9. If rejected: discard/archive candidate; official baseline remains untouched.
10. If approved: promote only FXX atomically, checkpoint it, keep immediate prior FXX as rollback, and continue forward.

## Promotion command
The phrase `FXX aprovado e validado` is the explicit authorization to:
- compare candidate to current baseline
- verify only intended FXX scope changed
- run functional and regression gates
- promote only FXX
- create checkpoint
- freeze that FXX as new official functional baseline
- retain only the immediately previous official FXX as rollback

Without that explicit approval, no candidate becomes official.

## Rollback rule
Rollback is phase-scoped only.
Never rollback the entire journey because one phase candidate failed.
Never restore an unrelated historical journey.
Never search old candidates automatically.

If a candidate fails, discard it and keep the current official phase.

## Shared backend rule
`cr-flow-runtime-v2` is shared across multiple phases and must not be edited directly during an isolated phase review.

If a phase requires backend evolution:
- create an isolated/versioned candidate or backward-compatible change
- verify impact on all consumers
- promote only after regression gates pass

The same rule applies to shared tables, RPCs, triggers, handoff contracts, automations and APIs.

F00 currently uses `cr-f00-intake`.
The richer historical F01 implementation using `cr-f01-canonical-runtime` may be compared during F01 revalidation, but its visual shell must not replace the locked journey UI.

## Version discipline
Keep conceptually only:
- OFFICIAL: currently approved phase
- CANDIDATE: phase under test
- ROLLBACK: immediately previous official phase

Rejected/obsolete candidates are never selected automatically.

## Forward-only rule
Every approved phase becomes the next baseline.
Development proceeds from the latest approved baseline only.
No automatic historical restoration.
No full-journey rebuild for a single-phase improvement.

## Scope guard
A phase change that touches shared visual files, multiple phase pages, Central routing, or a shared runtime is not an ordinary phase edit. Stop and require explicit scope authorization before making it.

## Current next authorized work
Functional revalidation of F00 in an isolated candidate.
Do not start it automatically.
