# Design Brief Template

## 1. Product Context
- **Product Name**: 
- **Target Audience**: 
- **Primary User Action**: 

## 2. Brand Personality & Tone
- **Keywords**: [e.g. Dense, Technical, Quietly Luxurious, Fast, Focused]
- **Mood**: High signal-to-noise ratio, near-black canvas, hairline precision.

## 3. Visual & Spatial Direction
- **Canvas Base**: Near-black slate (`#010102` or equivalent)
- **Surface Ladder**: Multi-step elevation (`surface-1` through `surface-4`)
- **Dividers**: 1px hairline borders (`#23252a`), zero heavy drop shadows.
- **Accents**: Intentional single chromatic accent (e.g. lavender `#5e6ad2` or brand accent) used only for primary CTAs and active focus states.
- **Grid & Spacing**: 8-point base grid (`8px`, `16px`, `24px`, `32px`).
- **Radius**: Consistent `rounded-md` (6px - 8px) throughout.

## 4. Typography Hierarchy
- **Primary Typeface**: Inter / Geist / System Sans
- **Monospace Typeface**: JetBrains Mono / Geist Mono (for numbers, metrics, code, timestamps)
- **Scale**: Display XL (80px), Headline (28px), Card Title (22px), Body (14-16px), Caption (12px).

## 5. Interaction & State Coverage
- [ ] Hover & Focus states on all interactive elements
- [ ] Visual `<kbd>` hotkey badges for power users
- [ ] Accessible focus rings (`ring-2 ring-primary/50`)
- [ ] Loading skeleton states for every async component
- [ ] Empty state illustrations and call-to-actions
- [ ] Error boundary and retry states

## 6. References & Anti-Patterns
- **References**: Linear, Vercel, Raycast.
- **Anti-Patterns**: Neon gradients, generic card-soup, ad-hoc inline styles, oversized padding, unstyled browser inputs.
