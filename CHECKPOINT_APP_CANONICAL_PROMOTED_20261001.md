# CHECKPOINT — APP CANONICAL PROMOTED — 2026-10-01

## Status
PASS — Approved APP candidate promoted as the canonical APP used by the Central.

## Approved source
- branch: `cr-app-new-central-identity-20261001`
- commit: `e76057789a8b0812b5f61cd3508f241b74c03ff9`
- source path: `central-runtime/app/index.html`
- source blob: `769722c8e31c54b2890986efeb70f2a7f79acb82`

## Canonical production release
- path: `production/app-canonical-20261001/index.html`
- production blob: `769722c8e31c54b2890986efeb70f2a7f79acb82`
- byte-equivalent to approved source: YES
- official physical URL: `https://rogeriocibin-alt.github.io/construrei-oauth-pages/production/app-canonical-20261001/`

## Central routing
The Central continues to use:
`central-atendimento?mode=app`

No Central HOME change was required.

### Router before
- function: `central-atendimento`
- version: 150
- hash: `37c32ba842979c207ba14797615db88f537162ae69eb033105ae64445894c08d`
- APP PRIMARY/FALLBACK: legacy v7.6.6 URL

### Router after
- version: 151
- status: ACTIVE
- hash: `bdcfc67ef3db247f9a1a4193f90975fd989f4bfbe5619ebf32bb652b0f88e593`
- APP PRIMARY: canonical approved production release
- APP FALLBACK: canonical approved production release
- legacy v7.6.6 APP URL occurrences: 0

The only router edit performed was replacement of the two exact APP URL occurrences (PRIMARY and FALLBACK).

## Flow protection
All F00–F09 routes remain mapped to:
`production/flow-canonical-20261001/fXX/`

Protected flow files and shared visual files were not changed.

## Baseline preservation
- Central HOME unchanged
- F00–F09 unchanged
- shared flow CSS unchanged
- shared flow shell unchanged
- `cr-f00-intake` unchanged
- `cr-flow-runtime-v2` unchanged
- `cr-f01-canonical-runtime` unchanged
- `centro-operacoes` unchanged
- database/data/auth/tables/automations unchanged

## Governance
`FLOW_BASELINE_MANIFEST.json` was updated only to:
- register the approved canonical APP
- advance `central-atendimento` from v150 to v151

No flow hashes were changed.

## Rollback
Immediate rollback source remains the prior APP at:
`central-runtime/app/`

Do not select it automatically.
Rollback only on explicit failure/authorization.

## Rule
ONE OFFICIAL APP.
NO APP REDESIGN DURING THIS PROMOTION.
NO FLOW CHANGES.
FORWARD ONLY.
