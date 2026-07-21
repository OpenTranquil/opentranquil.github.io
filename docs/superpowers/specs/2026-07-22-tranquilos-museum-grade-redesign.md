# TranquilOS Website — Museum-Grade Redesign

**Date**: 2026-07-22
**Status**: Approved
**Approach**: A (Design Token System) → B (Page-by-page polish) → C (Component refinement)

## Goal

Elevate the TranquilOS static website to museum-grade aesthetic quality across three dimensions:

1. **Extreme minimalism** — intentional white space, reduced visual noise, spatial rhythm
2. **Cyber-engineering atmosphere** — refined glass morphism, atmospheric depth, subtle glow
3. **Editorial typography** — precise type scale, vertical rhythm, controlled measure

Every page, every component, in both Chinese and English, must feel like it came from the same hand.

---

## Phase A: Design Token System

### File Structure Change

- **New**: `theme.css` — all design tokens (~200 lines), loaded before `style.css`
- **Modified**: `style.css` — all bare values replaced with token references
- Every HTML page adds `<link rel="stylesheet" href="theme.css">` before `style.css`

### Token Architecture (~80 tokens in 2 layers, 7 categories)

#### Layer 0 — Primitives
Raw values, not referenced directly by components.

```
--font-sans-stack: "Alibaba PuHuiTi", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif
--font-mono-stack: "SF Mono", "Cascadia Code", "JetBrains Mono", "Fira Code", ui-monospace, monospace
```

#### Layer 1 — Semantic Tokens (7 categories)
All component CSS references this layer. Light/dark switching happens only on color tokens; all other tokens are shared across themes.

**Color (light theme)**:
```
--color-bg:          oklch(0.985 0.001 105)   — #FAFAF8
--color-surface-1:   oklch(0.965 0.002 105)   — #F1F1ED
--color-surface-2:   oklch(0.935 0.003 105)   — #E8E8E2
--color-surface-3:   oklch(0.905 0.004 105)   — #DCDCD4
--color-border-1:    rgba(20,20,18,.07)
--color-border-2:    rgba(20,20,18,.14)
--color-border-3:    rgba(20,20,18,.22)
--color-text-1:      oklch(0.12 0.003 105)    — #141412
--color-text-2:      oklch(0.42 0.005 105)    — #6E6E66
--color-text-3:      oklch(0.60 0.004 105)    — #9A9A90
--color-accent:      oklch(0.55 0.22 275)     — #2E5BFF
--color-accent-dim:  oklch(0.65 0.16 265)
--color-accent-bright: oklch(0.50 0.24 278)
--color-accent-soft: rgba(46,91,255,.08)
--color-ok:          oklch(0.62 0.17 155)     — #1F9D55
--color-warn:        oklch(0.70 0.15 80)
--color-err:         oklch(0.55 0.19 22)
--color-glow:        rgba(46,91,255,.08)
--color-overlay:     rgba(0,0,0,.04)
```

**Color (dark theme)** — same keys, different values:
```
--color-bg:          oklch(0.06 0.006 260)    — #08080B
--color-surface-1:   oklch(0.10 0.008 260)    — #0E0E12
--color-surface-2:   oklch(0.14 0.010 260)    — #16161C
--color-surface-3:   oklch(0.18 0.012 260)    — #24242C
--color-border-1:    rgba(255,255,255,.06)
--color-border-2:    rgba(255,255,255,.10)
--color-border-3:    rgba(255,255,255,.16)
--color-text-1:      oklch(0.95 0.002 100)    — #F4F4F0
--color-text-2:      oklch(0.65 0.006 260)    — #9A9AA4
--color-text-3:      oklch(0.42 0.005 260)    — #60606A
--color-accent:      oklch(0.62 0.18 270)     — #5B8CFF
--color-accent-dim:  oklch(0.55 0.14 260)
--color-accent-bright: oklch(0.68 0.20 272)
--color-accent-soft: rgba(91,140,255,.10)
--color-ok:          oklch(0.68 0.17 150)     — #4ADE80
--color-warn:        oklch(0.72 0.16 85)
--color-err:         oklch(0.60 0.20 20)
--color-glow:        rgba(91,140,255,.10)
--color-overlay:     rgba(0,0,0,.30)
```

**Typography scale** (major third: 1.25):
```
--text-xs:    0.6875rem   — 11px
--text-sm:    0.75rem     — 12px
--text-base:  0.875rem    — 14px
--text-md:    1rem        — 16px
--text-lg:    1.125rem    — 18px
--text-xl:    1.25rem     — 20px
--text-2xl:   1.5rem      — 24px
--text-3xl:   1.875rem    — 30px
--text-4xl:   2.25rem     — 36px
--text-5xl:   2.75rem     — 44px
--text-6xl:   3.375rem    — 54px
--text-7xl:   4.25rem     — 68px
```

**Leading**:
```
--leading-tight:   1.15
--leading-normal:  1.6
--leading-relaxed: 1.8
--leading-loose:   2.0
```

**Tracking**:
```
--tracking-tight:  -0.03em   — major headings
--tracking-normal: -0.01em   — body
--tracking-wide:   0.05em    — mono labels
--tracking-ultra:  0.14em    — eyebrow uppercase
```

**Font weight**:
```
--weight-normal:  400
--weight-medium:  500
--weight-semi:    580
--weight-bold:    620
--weight-heavy:   650
```

**Spacing** (based on 4px grid):
```
--space-0:   0
--space-1:   0.25rem   — 4px
--space-2:   0.5rem    — 8px
--space-3:   0.75rem   — 12px
--space-4:   1rem      — 16px
--space-5:   1.25rem   — 20px
--space-6:   1.5rem    — 24px
--space-7:   2rem      — 32px
--space-8:   2.5rem    — 40px
--space-9:   3rem      — 48px
--space-10:  3.5rem    — 56px
--space-11:  4rem      — 64px
--space-12:  5rem      — 80px
--space-13:  6rem      — 96px
--space-section: clamp(5rem, 8vw, 10rem)   — responsive section padding
```

**Layout**:
```
--wrap-width:      74rem    — 1184px
--content-width:   48rem    — 768px (optimal reading)
--header-height:   3.75rem  — 60px
--sidebar-width:   18rem
```

**Animation duration**:
```
--duration-instant: 80ms
--duration-fast:    150ms
--duration-normal:  250ms
--duration-slow:    400ms
--duration-glacial: 700ms
```

**Easing**:
```
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1)
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1)
```

**Elevation (shadow stack)**:
```
--shadow-0: none
--shadow-1: 0 1px 2px rgba(0,0,0,.04), 0 1px 0 rgba(255,255,255,.05) inset
--shadow-2: 0 4px 12px rgba(0,0,0,.06), 0 1px 0 rgba(255,255,255,.06) inset
--shadow-3: 0 12px 32px rgba(0,0,0,.10), 0 1px 0 rgba(255,255,255,.07) inset
--shadow-4: 0 24px 64px rgba(0,0,0,.16), 0 1px 0 rgba(255,255,255,.08) inset
```
Dark mode shadows use black with higher alpha.

**Radius**:
```
--radius-none: 0
--radius-sm:   0.25rem   — 4px
--radius-md:   0.375rem  — 6px
--radius-lg:   0.625rem  — 10px
--radius-xl:   1rem      — 16px
--radius-full: 9999px
```

---

## Phase B: Page-by-Page Visual Polish

### Per-page checklist
Each page (zh + en mirror) gets audited and polished:

1. **Atmosphere**: Hero/phero glow references `--color-glow`, consistent radial-gradient syntax
2. **Vertical rhythm**: Section padding uses `--space-section`, card padding uses spacing tokens
3. **Component semantics**: Content type matches component choice (timeline→pipe, features→card grid, comparison→table, specs→split)
4. **Responsive**: Breakpoint behavior verified at 320/768/1024/1440
5. **Bilingual parity**: zh and en versions share identical structure and token references

### Page priority order
1. `index.html` / `en/index.html` — sets the tone for everything
2. `architecture.html` / `en/architecture.html` — most complex, most components
3. `features.html` / `en/features.html` — checklist-heavy, typography stress test
4. `build.html` / `en/build.html` — terminal + code blocks
5. `roadmap.html` / `en/roadmap.html` — lane component
6. `download.html` / `en/download.html` — card grid, CTA focus
7. `docs/index.html` — different layout, needs to feel part of the family

### Key visual changes by page

**index.html**:
- Hero grid gap increased, ring diagram given more breathing room
- Metrics strip: `border-radius: 0` → full-bleed within a rounded container
- Design pillars cards: three cards, equal visual weight
- Terminal: refined dot styling, cursor blink easing

**architecture.html**:
- SVG diagram: stroke widths unified, colors from token
- Capability table: row hover refined
- Code blocks: line-height tightened for code readability

---

## Phase C: Component Refinement

### 1. Header / Navigation
- Glass: `backdrop-filter: blur(20px) saturate(1.6)`, bg opacity 78%
- Nav links: underline animation uses `--ease-spring`, 220ms
- Active state: subtle glow on the underline
- Mobile: menu slide-down with spring easing

### 2. Hero Section
- Atmosphere glow: two radial-gradient ellipses, 60-70% radius from viewport
- Grid overlay: dot/grid pattern masked by radial-gradient, same as current but larger spacing (52px)
- Title: `--text-7xl` → `--text-6xl` responsive clamp, `--tracking-tight`, `--weight-heavy`
- Meta strip: monospace with consistent tabular-nums spacing

### 3. Card (grid items)
- Spotlight: radius 320px, softer gradient fall-off
- Padding: `--space-6` (24px) on mobile, `--space-7` (32px) on desktop
- Border: `--color-border-1`, hover → `--color-border-2` + glow ring
- Inner highlight: removed from individual cards, added as single gradient on grid container
- Tag: all same height, same padding, same font

### 4. Terminal
- Window dots: exact 10px diameter, exact 8px gap
- Title: centered in the header bar
- Code: `--text-sm`, line-height 1.75
- Cursor: `--ease-in-out` blink (not steps(1)), softer
- Boot animation: same timing as current (110ms stagger), using `--duration-fast`

### 5. Pipeline (numbered steps)
- Numbers: `--text-3xl`, `--weight-heavy`, `--color-accent-dim`
- Connector: subtle arrow or line between steps (new micro-detail)
- Hover: translateY(-2px) with `--ease-spring`

### 6. Table
- Header: `--text-xs`, `--tracking-ultra`, uppercase
- Cell padding: `--space-3` vertical, `--space-4` horizontal
- Row hover: `--color-surface-2` background
- Border: `--color-border-1`, only horizontal rules

### 7. Badge / Chip
- Height: fixed 28px
- Padding: `--space-2` horizontal
- Hover: `translateY(-1px)` + border → accent

### 8. Button
- Primary: gradient from `--color-accent` → `--color-accent-dim`
- Hover: brightness 1.06 + `--shadow-2`
- Active/press: `translateY(0)` + `--shadow-0` (loses lift)
- Loading state: skeleton pulse animation (new)

### 9. Footer
- Top border: `--color-border-1`
- Visual weight: balanced with header (same height feel)
- Links: same hover transition as nav

---

## Implementation Constraints

- **No framework**: plain HTML + CSS + vanilla JS, as today
- **No build step**: files served as-is
- **Browser targets**: all modern browsers (Safari 16+, Firefox 115+, Chrome 120+)
- **Backward compatible**: existing URLs, SEO meta, language switching preserved
- **Performance**: no new external dependencies, CSS split into theme.css + style.css (one extra request, ~3KB)
- **Migration strategy**: existing token names (`--bg`, `--sf`, `--tx`, `--ac`, `--ln`, `--mut`, `--dim`, `--r`, etc.) are renamed to the new naming scheme. `style.css` references the new names. No legacy aliases — clean break, single file to update.

---

## Success Criteria

1. Every spacing value in style.css references a token
2. Every color in style.css references a token (except one-off SVG fills)
3. Every animation duration references `--duration-*`
4. All 10 pages × 2 languages pass visual review
5. Mobile (320px) → desktop (1440px) looks intentional at every width
6. Light and dark themes feel like the same design system, not two different sites
