# HOMOLOGAÇÃO — COLOR MATCH AUDIT — 2026-10-01

## Scope
Color-only refinement of:
`preview/homologacao-color-match-candidate-20261001/index.html`

Source candidate:
`preview/homologacao-links-candidate-20261001/index.html`

Source commit:
`8197f9eb6f32e042bbfbf8da98ddf65623f65ccb`

Canonical color source:
`production/central-homologada-20261001/index.html`

## Effective canonical Central palette used
| Token | Effective value | Applied in Homologação |
|---|---|---|
| Navy | `#031b46` | mobile dock / canonical dark chrome |
| Navy 2 | `#05265f` | sidebar family |
| Blue | `#0877f9` | primary actions / menu |
| Blue 2 | `#075bd8` | primary gradients / labels |
| Blue top | `#1688ff` | primary button gradient |
| Blue border | `#0b6fe6` | primary button border |
| Gold | `#ffc514` | canonical accent |
| Gold strong | `#ffc400` | mobile Home action |
| Background | `#eaf6fc` | page / content surface |
| Panel | `#f5fbff` | metrics / protected surfaces |
| Card | `#ffffff` | cards / search |
| Line | `#c9e0ef` | borders |
| Ink | `#07165b` | headings |
| Text | `#17315d` | body text |
| Muted | `#6d8299` | secondary text |
| Success | `#0daf67` | operational/homologated |
| Warning | `#f2a500` | in-validation state |
| Danger | `#ee2147` | error state family |
| Shadow | `0 4px 14px rgba(18,69,112,.075)` | cards/search/metrics |
| Shadow 2 | `0 14px 34px rgba(5,42,91,.16)` | canonical depth reference |

## Canonical cascade basis
The Central contains historical dark-theme definitions early in the document. They were not used as the effective target. The palette above comes from the later canonical HOME/reference layers and the final Phase 3/desktop/mobile equalization overrides, including the effective `--crh-*` values.

## Replacements
The Homologação candidate previously used manually selected approximations such as:
- `#f3f7fb`
- `#123b6b`
- `#106eb2`
- `#dbe6ef`
- `#27a574`

The color-match layer overrides those presentation values with the canonical Central family listed above.

## Non-functional guarantee
No registry item, URL, group, title, search behavior, action, protected state, navigation behavior or responsive structure was modified.

The only difference from the prior approved links candidate is the appended style block:
`cr-homolog-color-match-central-20261001`

Removing that style block (and its single insertion newline) restores the previous candidate content exactly.

## Promotion gate
Do not promote to production until Rogério explicitly says:

`Homologação color match aprovada e validada`
