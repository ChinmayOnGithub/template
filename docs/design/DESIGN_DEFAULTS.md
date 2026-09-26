# Personal Design Defaults

This document defines the recurring personal design preferences used across projects.
These are recommended defaults intended to prevent redesigning basic aesthetics for every new application.
They are defaults, not mandatory dogmas. Individual projects may customize or override them whenever project requirements differ.

---

## 1. Visual Paradigm and Aesthetic

- **Canvas Background**: Deep near-black slate (`#010102`). Provides high contrast and reduced eye strain.
- **Surface Ladder**: Elevation is achieved through a multi-step surface color ladder rather than heavy fuzzy drop shadows:
  - `surface-1` (`#0f1011`): Base card panels and containers.
  - `surface-2` (`#141516`): Hovered states and active card highlights.
  - `surface-3` (`#18191a`): Context menus, input backdrops, dropdowns.
  - `surface-4` (`#191a1b`): Overlays, modal dialog frames, floating tooltips.
- **Hairline Borders**: 1px subtle borders (`#23252a`) for clean division. Hover accent: `#34343a`.
- **Chromatic Accent**: Single intentional brand accent (default: lavender-blue `#5e6ad2`, hover `#828fff`). Used exclusively for primary call-to-actions, active navigation highlights, and focus rings. Never used decoratively.
- **Visual Density**: Technical product density inspired by Linear and Raycast. Compact padding, high information density, high scannability.

---

## 2. Typography Defaults

### Font Stacks
- **Primary Interface Font**:
  ```css
  font-family: Inter, Geist, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  ```
  Inter or Geist provide clean glyph geometry, balanced x-height, and neutral legibility on dark displays.
- **Monospace Font**:
  ```css
  font-family: "JetBrains Mono", "Geist Mono", Menlo, Monaco, Consolas, monospace;
  ```
  Used for all numbers, metrics, code snippets, tags, dates, and tabular lists.
- **Tabular Numbers**: Always enable tabular figures (`font-variant-numeric: tabular-nums` or `tnum`) on numbers to eliminate layout jitter during live updates.

### Type Scale
| Level | Font Size | Weight | Line Height | Letter Spacing | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `display-lg` | 56px | 600 | 1.10 | -1.8px | Large hero headlines |
| `display-md` | 40px | 600 | 1.15 | -1.0px | Main page titles |
| `headline` | 28px | 600 | 1.20 | -0.6px | Section headings |
| `card-title` | 20px | 500 | 1.25 | -0.4px | Card headers, modal titles |
| `body` | 15px - 16px | 400 | 1.50 | -0.05px | Primary text copy |
| `body-sm` | 13px - 14px | 400 | 1.50 | 0px | Form field labels, table rows |
| `caption` | 12px | 400 | 1.40 | 0px | Metadata tags, helper copy |

---

## 3. Spacing, Shapes, and Radii

- **Base Grid**: 8-point system (multiples of 8px: 4px, 8px, 16px, 24px, 32px, 48px).
- **Border Radius**: Consistent `rounded-md` (`0.5rem` / 8px) for buttons, inputs, cards, and dialog frames. Status chips and mini tags use `4px` or full pill (`9999px`).

---

## 4. Icon and Favicon Preferences

- **Icon Library**: `lucide-react` (or platform equivalent Lucide icons).
  - Consistent 1.5px stroke width.
  - Standard sizes: 16px (small action), 20px (medium button/nav), 24px (feature highlight).
- **Favicon Treatment**:
  - Vector SVG favicon with built-in dark/light adaptation via `@media (prefers-color-scheme: dark)`.
  - Stored in `.agents/defaults/assets/favicon.svg`.

---

## 5. UI Component Primitives

The default component foundation uses:
- `<Button>`: Variants `primary`, `secondary`, `outline`, `ghost`, `danger`. Subtle scaling on interaction (`active:scale-98`).
- `<Card>`: Composed of `<CardHeader>`, `<CardBody>`, `<CardFooter>`. Hairline border with surface elevation.
- `<Input>`, `<Textarea>`, `<Select>`: Uniform focus rings (`ring-2 ring-primary/50`).
- `<EmptyState>`: Standardized layout with icon, title, description, and primary CTA.
- `<Skeleton>`: Subtle pulse animation avoiding layout shift during async fetching.
- Hotkey Indicators: Visual `<kbd>` tags displaying keyboard shortcuts for power workflows.

---

## 6. How to Override These Defaults

When starting a new project:
1. To change colors: modify CSS custom properties in `design-system/tokens.css` or project stylesheet.
2. To change fonts: adjust primary font imports in the HTML head or root layout.
3. To disable personal design defaults completely: delete or replace `design-system/` and configure your chosen UI stack.
