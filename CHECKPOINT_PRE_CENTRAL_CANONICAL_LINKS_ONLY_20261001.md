# CHECKPOINT PRE — CENTRAL CANONICAL LINKS ONLY — 2026-10-01

- Base: cr-home-canonical-frozen-20260930
- Candidate: cr-central-canonical-links-only-20261001
- Production: untouched.
- Goal: transplant functional link fixes only, with zero visual drift.

## Baseline SHAs
- central/index.html: 17cf9b5e0eaa28a2d99777350c3ed4572385bd19
- central-runtime/ui/cr-home-reference-20260930.css: 1dc2b084b06cec04e2b43d07070b6f323d9abb24
- central-runtime/dashboard/index.html: 75689d83d829439fe83ca2f74e24637098112dae
- central-runtime/f00/index.html: ba33806be52c301182364b4f535f0dce649f0351
- central-runtime/f01/index.html: 5ece24483e4e5a9e5ac2647ebf0e15109d8afd9e
- central-runtime/f02/index.html: a5471463fffc8b1b83e8fc1084543cc80d259bf4
- central-runtime/f03/index.html: 2e9a5a06d61467a640f4c10d2d8e9f223fb98f97
- central-runtime/f04/index.html: 728fa000cb1363c54e87f3e2417d7e44b1b83688
- central-runtime/f05/index.html: 169c2c98b73b98caaee016f6965a6397a6cc2140
- central-runtime/f06/index.html: 3a9aecdf049a9cbf57dde210802befef528d1e4a
- central-runtime/f07/index.html: 60be63f61c921a4cbbe8013b0734805176af431c
- central-runtime/f08/index.html: a2e78031e61d12c3176e53d7de526a5755f5e8c3
- central-runtime/f09/index.html: dfb2bed8406421adb595b2f5a08251d2b05a5237

## Visual invariants
- central-runtime/ui/cr-home-reference-20260930.css must remain byte-identical.
- No legacy/local visual CSS may be added.
- No Pagey visual dependency removal/replacement in this phase because the frozen canonical still contains those resources and visual parity has priority.
- No DOM restructuring.
- Only minimal hash-route / link-security / missing-target behavior may change.
