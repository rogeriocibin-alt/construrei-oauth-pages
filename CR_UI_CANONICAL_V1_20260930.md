# CR UI CANONICAL V1 — 2026-09-30

Fonte de verdade visual: HOME congelada em `cr-home-canonical-frozen-20260930`.

## Princípio
A identidade canônica não é apenas cor. Ela inclui hierarquia de ações, estados, dimensões, bordas, foco, radius, sombras, densidade e comportamento responsivo dos controles.

## Tokens principais
- Navy: `#031b46`
- Navy 2: `#05265f`
- Blue: `#0877f9`
- Blue dark: `#075bd8`
- Gold: `#ffc514`
- Gold dark: `#dca900`
- Success: `#0da867`
- Danger: `#d94a57`
- Background: `#eaf6fc`
- Surface: `#ffffff`
- Soft surface: `#f5fbff`
- Border: `#c9e0ef`
- Text: `#102f55`
- Muted: `#6d8299`
- Normal control height: 40px
- Compact control height: 34px
- Mobile primary touch target: >=44px
- Radius: 10px
- Large radius: 14px

## Mapeamento atual
| Componente antigo | Componente canônico |
|---|---|
| `.primary` | botão primário azul |
| `.secondary` | botão secundário branco/azul-gelo |
| `.gold`, `.secondary.gold`, `.btn.gold` | CTA amarelo |
| `.finalBtn` | sucesso verde |
| `.danger`, `.secondary.danger`, `.x` | destrutivo vermelho suave |
| `.copyBtn` | secundário |
| `.attachBtn` | secundário |
| `.miniBtn` | compacto |
| `.retryUpload` | compacto contextual |
| `.cloudControls button` | secundário |
| `.cr-btn-primary` | primário azul |
| `.cr-btn-secondary` | secundário |
| `.cr-btn-gold` | CTA amarelo |
| `.cr-btn-success` | positivo |
| `.cr-btn-danger` | destrutivo |
| `.cr-btn-icon` | botão de ícone |
| `.cr-btn-sm` | botão compacto |

## Hierarquia
- Um CTA primário por bloco quando possível.
- CTA amarelo reservado a ações de destaque.
- Azul para ação primária operacional.
- Verde para conclusão/sucesso.
- Vermelho somente para destrutivo.
- Branco/azul-gelo para auxiliares.

## Estados
Todos os controles visuais devem contemplar normal, hover, active, focus-visible e disabled, sem alterar lógica.

## Regra de propagação
Nos próximos módulos, reutilizar estes tokens e mapeamentos sem exigir refatoração estrutural. Preferir seletores combinados/classes existentes e CSS scoped por módulo quando houver risco de regressão.
