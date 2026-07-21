# TranquilOS Museum-Grade Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the TranquilOS static website to museum-grade aesthetic quality by establishing a precise design token system, refactoring all CSS to reference tokens, then polishing pages and components to visual perfection.

**Architecture:** Create `theme.css` (~200 lines) with ~80 design tokens in 2 layers (primitives + semantics in 7 categories). Refactor `style.css` (~300 lines) replacing all bare values with token references. Update all 20 HTML files to load `theme.css`. Then polish pages and components against the new token system.

**Tech Stack:** Plain HTML + CSS + vanilla JS, no build step, no framework. CSS custom properties for all tokens. `[data-theme]` attribute for light/dark switching.

## Global Constraints

- No framework: plain HTML + CSS + vanilla JS
- No build step: files served as-is
- Browser targets: Safari 16+, Firefox 115+, Chrome 120+
- Backward compatible: existing URLs, SEO meta, language switching preserved
- No new external dependencies
- Existing token names (`--bg`, `--sf`, `--tx`, `--ac`, `--ln`, `--mut`, `--dim`, `--r`) are renamed to new scheme; no legacy aliases
- Every spacing value references a token
- Every color references a token (except one-off SVG fills)
- Every animation duration references `--duration-*`
- 20 HTML pages (10 zh + 10 en)

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `theme.css` | **Create** | All design tokens: colors (light+dark), typography scale, spacing scale, layout, animation, elevation, radius |
| `style.css` | **Modify** | All component styles, global reset, responsive — every bare value replaced with token reference |
| `index.html` | **Modify** | Add `theme.css` link; polish hero, metrics, cards |
| `architecture.html` | **Modify** | Add `theme.css` link; polish SVG diagram, tables |
| `features.html` | **Modify** | Add `theme.css` link; polish checklist cards |
| `build.html` | **Modify** | Add `theme.css` link; polish terminal, code blocks |
| `roadmap.html` | **Modify** | Add `theme.css` link; polish lanes |
| `download.html` | **Modify** | Add `theme.css` link; polish download cards |
| `en/index.html` | **Modify** | Add `theme.css` link |
| `en/architecture.html` | **Modify** | Add `theme.css` link |
| `en/features.html` | **Modify** | Add `theme.css` link |
| `en/build.html` | **Modify** | Add `theme.css` link |
| `en/roadmap.html` | **Modify** | Add `theme.css` link |
| `en/download.html` | **Modify** | Add `theme.css` link |
| `docs/index.html` | **Modify** | Add `theme.css` link |
| `docs/docs.css` | **Modify** | Add `theme.css` link |
| `script.js` | **Modify** | Update animation timing references if needed |

---

### Task 1: Create `theme.css` — All Design Tokens

**Files:**
- Create: `theme.css`

**Produces:** All 80+ CSS custom properties on `:root` and `[data-theme="dark"]`

- [ ] **Step 1: Write `theme.css` with all tokens**

```css
/* TranquilOS — Design Token System
   Museum-grade. Layer 0 primitives → Layer 1 semantics.
   Light theme on :root, dark theme on [data-theme="dark"]. */

/* ============================================
   Layer 0 — Primitives
   ============================================ */
:root {
  --font-sans: "Alibaba PuHuiTi", "PingFang SC", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif;
  --font-mono: "SF Mono", "Cascadia Code", "JetBrains Mono", "Fira Code", ui-monospace, monospace;
}

/* ============================================
   Layer 1 — Semantic Tokens
   ============================================ */

/* --- Color: Light theme (default) --- */
:root {
  --color-bg:            #FAFAF8;
  --color-surface-1:     #F1F1ED;
  --color-surface-2:     #E8E8E2;
  --color-surface-3:     #DCDCD4;
  --color-border-1:      rgba(20,20,18,.07);
  --color-border-2:      rgba(20,20,18,.14);
  --color-border-3:      rgba(20,20,18,.22);
  --color-text-1:        #141412;
  --color-text-2:        #6E6E66;
  --color-text-3:        #9A9A90;
  --color-accent:        #2E5BFF;
  --color-accent-dim:    #7DA2FF;
  --color-accent-bright: #1A3FCC;
  --color-accent-soft:   rgba(46,91,255,.08);
  --color-ok:            #1F9D55;
  --color-warn:          #D4A40E;
  --color-err:           #D93025;
  --color-glow:          rgba(46,91,255,.08);
  --color-overlay:       rgba(0,0,0,.04);
  --color-bg-glass:      color-mix(in oklch, var(--color-bg) 78%, transparent);
  color-scheme: light;
}

/* --- Color: Dark theme --- */
[data-theme="dark"] {
  --color-bg:            #08080B;
  --color-surface-1:     #0E0E12;
  --color-surface-2:     #16161C;
  --color-surface-3:     #24242C;
  --color-border-1:      rgba(255,255,255,.06);
  --color-border-2:      rgba(255,255,255,.10);
  --color-border-3:      rgba(255,255,255,.16);
  --color-text-1:        #F4F4F0;
  --color-text-2:        #9A9AA4;
  --color-text-3:        #60606A;
  --color-accent:        #5B8CFF;
  --color-accent-dim:    #8FB4FF;
  --color-accent-bright: #7BAAFF;
  --color-accent-soft:   rgba(91,140,255,.10);
  --color-ok:            #4ADE80;
  --color-warn:          #F5C842;
  --color-err:           #F87171;
  --color-glow:          rgba(91,140,255,.10);
  --color-overlay:       rgba(0,0,0,.30);
  --color-bg-glass:      color-mix(in oklch, var(--color-bg) 78%, transparent);
  color-scheme: dark;
}

/* --- Typography scale (major third: 1.25) --- */
:root {
  --text-xs:     0.6875rem;   /* 11px */
  --text-sm:     0.75rem;     /* 12px */
  --text-base:   0.875rem;    /* 14px */
  --text-md:     1rem;        /* 16px */
  --text-lg:     1.125rem;    /* 18px */
  --text-xl:     1.25rem;     /* 20px */
  --text-2xl:    1.5rem;      /* 24px */
  --text-3xl:    1.875rem;    /* 30px */
  --text-4xl:    2.25rem;     /* 36px */
  --text-5xl:    2.75rem;     /* 44px */
  --text-6xl:    3.375rem;    /* 54px */
  --text-7xl:    4.25rem;     /* 68px */

  --leading-tight:   1.15;
  --leading-snug:    1.35;
  --leading-normal:  1.6;
  --leading-relaxed: 1.8;
  --leading-loose:   2.0;

  --tracking-tight:  -0.03em;
  --tracking-normal: -0.01em;
  --tracking-wide:   0.05em;
  --tracking-ultra:  0.14em;

  --weight-normal:  400;
  --weight-medium:  500;
  --weight-semi:    580;
  --weight-bold:    620;
  --weight-heavy:   650;
}

/* --- Spacing (4px grid) --- */
:root {
  --space-0:   0;
  --space-1:   0.25rem;
  --space-2:   0.5rem;
  --space-3:   0.75rem;
  --space-4:   1rem;
  --space-5:   1.25rem;
  --space-6:   1.5rem;
  --space-7:   2rem;
  --space-8:   2.5rem;
  --space-9:   3rem;
  --space-10:  3.5rem;
  --space-11:  4rem;
  --space-12:  5rem;
  --space-13:  6rem;
  --space-section: clamp(5rem, 8vw, 10rem);
}

/* --- Layout --- */
:root {
  --wrap-width:     74rem;
  --content-width:  48rem;
  --header-height:  3.75rem;
}

/* --- Animation --- */
:root {
  --duration-instant:  80ms;
  --duration-fast:    150ms;
  --duration-normal:  250ms;
  --duration-slow:    400ms;
  --duration-glacial: 700ms;

  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* --- Elevation --- */
:root {
  --shadow-0: none;
  --shadow-1: 0 1px 2px rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.05);
  --shadow-2: 0 4px 12px rgba(0,0,0,.06), inset 0 1px 0 rgba(255,255,255,.06);
  --shadow-3: 0 12px 32px rgba(0,0,0,.10), inset 0 1px 0 rgba(255,255,255,.07);
  --shadow-4: 0 24px 64px rgba(0,0,0,.16), inset 0 1px 0 rgba(255,255,255,.08);
}
[data-theme="dark"] {
  --shadow-1: 0 1px 2px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.03);
  --shadow-2: 0 4px 12px rgba(0,0,0,.18), inset 0 1px 0 rgba(255,255,255,.04);
  --shadow-3: 0 12px 32px rgba(0,0,0,.28), inset 0 1px 0 rgba(255,255,255,.04);
  --shadow-4: 0 24px 64px rgba(0,0,0,.40), inset 0 1px 0 rgba(255,255,255,.05);
}

/* --- Radius --- */
:root {
  --radius-none: 0;
  --radius-sm:   0.25rem;
  --radius-md:   0.375rem;
  --radius-lg:   0.625rem;
  --radius-xl:   1rem;
  --radius-full: 9999px;
}
```

- [ ] **Step 2: Verify theme.css syntax and token completeness**

Run: `wc -l theme.css` (should show ~185 lines)

- [ ] **Step 3: Commit**

```bash
git add theme.css
git commit -m "feat: add design token system (theme.css)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Add `theme.css` link to all 20 HTML pages

**Files:**
- Modify: `index.html`, `architecture.html`, `features.html`, `build.html`, `roadmap.html`, `download.html`
- Modify: `en/index.html`, `en/architecture.html`, `en/features.html`, `en/build.html`, `en/roadmap.html`, `en/download.html`
- Modify: `docs/index.html`
- Modify: `design/ui-design-spec.html`, `design/wallpaper.html` (if they use style.css)

**Consumes:** `theme.css` from Task 1

**Produces:** Every page loads tokens before component styles

- [ ] **Step 1: Add `<link rel="stylesheet" href="theme.css">` before each `style.css` link**

For root pages (`index.html`, `architecture.html`, etc.), insert before `<link rel="stylesheet" href="style.css">`:

```html
<link rel="stylesheet" href="theme.css">
```

For `en/` pages, use relative path:

```html
<link rel="stylesheet" href="../theme.css">
```

For `docs/index.html`, use:

```html
<link rel="stylesheet" href="../theme.css">
```

For `design/` pages, use:

```html
<link rel="stylesheet" href="../theme.css">
```

- [ ] **Step 2: Verify all pages load theme.css in browser DevTools**

Open each page, check Network tab — `theme.css` must load before `style.css` and return 200.

- [ ] **Step 3: Commit**

```bash
git add *.html en/*.html docs/index.html design/*.html
git commit -m "feat: link theme.css in all HTML pages

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Refactor `style.css` — Global Reset & Base Styles

**Files:**
- Modify: `style.css` (lines 1–38)

**Consumes:** `theme.css` tokens from Task 1

**Produces:** Global reset, body, selection, scrollbar all reference tokens

- [ ] **Step 1: Replace global reset block with tokenized version**

Replace `style.css` lines 4–23 (the `:root` and `[data-theme="dark"]` blocks) with tokenized `:root`:

```css
/* TranquilOS — component styles
   All values reference tokens from theme.css. */

:root{
  font-variant-numeric:tabular-nums;
}
```

(Old `:root` and `[data-theme="dark"]` token blocks are now in `theme.css` — removed from here.)

- [ ] **Step 2: Replace body rule with token references**

```css
body{
  margin:0;
  background:var(--color-bg);
  color:var(--color-text-1);
  font-family:var(--font-sans);
  font-size:var(--text-md);
  line-height:var(--leading-normal);
  overflow-x:hidden;
  transition:background var(--duration-normal),color var(--duration-normal);
}
```

- [ ] **Step 3: Replace selection rule**

```css
::selection{background:var(--color-accent);color:#fff}
```

- [ ] **Step 4: Replace scrollbar rules**

```css
::-webkit-scrollbar{width:10px;height:10px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--color-border-2);border-radius:6px;border:3px solid var(--color-bg)}
::-webkit-scrollbar-thumb:hover{background:var(--color-text-3)}
```

- [ ] **Step 5: Verify visually — scrollbar, text selection, body background all respond to theme toggle**

- [ ] **Step 6: Commit**

```bash
git add style.css
git commit -m "refactor: tokenize global reset, body, selection, scrollbar

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Refactor `style.css` — Header & Navigation

**Files:**
- Modify: `style.css` (lines 40–60, header section)

**Consumes:** Token references established in Task 3

**Produces:** Header glass morphism, nav links, mobile menu all tokenized

- [ ] **Step 1: Replace header glass rule**

```css
.hd{
  position:sticky;top:0;z-index:50;
  border-bottom:1px solid var(--color-border-1);
  background:var(--color-bg-glass);
  backdrop-filter:blur(20px) saturate(1.6);
  -webkit-backdrop-filter:blur(20px) saturate(1.6);
}
.hd-in{
  max-width:var(--wrap-width);height:var(--header-height);
  margin:auto;padding:0 var(--space-6);
  display:flex;align-items:center;gap:var(--space-6);
}
```

- [ ] **Step 2: Replace brand, nav, and header-right rules**

```css
.brand{display:flex;align-items:center;gap:var(--space-3);font:var(--weight-semi) var(--text-sm)/1 var(--font-mono);letter-spacing:var(--tracking-wide);flex-shrink:0}
.brand:hover{color:var(--color-text-1)}
.brand img{width:22px;height:22px}
.hd-nav{display:flex;gap:var(--space-1);margin-right:auto}
.hd-nav a{position:relative;padding:7px 12px;color:var(--color-text-2);font-size:var(--text-sm);border-radius:var(--radius-md);white-space:nowrap;transition:color var(--duration-fast)}
.hd-nav a::after{content:"";position:absolute;left:12px;right:12px;bottom:3px;height:1px;background:var(--color-accent);transform:scaleX(0);transform-origin:left;transition:transform var(--duration-normal) var(--ease-spring)}
.hd-nav a:hover{color:var(--color-text-1)}
.hd-nav a:hover::after{transform:scaleX(1)}
.hd-nav a.on{color:var(--color-text-1)}
.hd-nav a.on::after{transform:scaleX(1)}
.hd-r{display:flex;align-items:center;gap:var(--space-2);flex-shrink:0}
.hd-btn{height:32px;display:inline-flex;align-items:center;gap:var(--space-2);padding:0 11px;border:1px solid var(--color-border-1);border-radius:var(--radius-md);background:transparent;color:var(--color-text-2);font:var(--weight-medium) 12.5px/1 var(--font-sans);cursor:pointer;white-space:nowrap;transition:all var(--duration-fast)}
.hd-btn:hover{border-color:var(--color-border-2);color:var(--color-text-1)}
.hd-btn .accent{color:var(--color-accent)}
.hd-btn.gh{color:var(--color-text-1)}
```

- [ ] **Step 3: Replace mobile nav rules**

```css
#nav-toggle{position:absolute;opacity:0;pointer-events:none}
.nav-burger{display:none;width:34px;height:32px;border:1px solid var(--color-border-1);border-radius:var(--radius-md);background:transparent;cursor:pointer;position:relative;flex-shrink:0}
.nav-burger span{position:absolute;left:8px;right:8px;height:1.5px;background:var(--color-text-1);transition:all var(--duration-fast)}
.nav-burger span:nth-child(1){top:10px}.nav-burger span:nth-child(2){top:15px}.nav-burger span:nth-child(3){top:20px}
```

- [ ] **Step 4: Verify header glass depth, nav hover underline animation, mobile menu toggle**

- [ ] **Step 5: Commit**

---

### Task 5: Refactor `style.css` — Layout & Typography Utilities

**Files:**
- Modify: `style.css` (lines 62–74, layout and typography section)

**Consumes:** Token references from Tasks 3–4

**Produces:** Wrapper, section, section-head, eyebrow, grad — all tokenized

- [ ] **Step 1: Replace layout and typography rules**

```css
.w{max-width:var(--wrap-width);margin:auto;padding:0 var(--space-6)}
main{counter-reset:sec}
.sec{position:relative;padding:var(--space-section) 0;border-bottom:1px solid var(--color-border-1);counter-increment:sec}
.sec:last-child{border-bottom:0}
.sec-head{position:relative;z-index:1;max-width:var(--content-width);margin-bottom:var(--space-10)}
.sec-head h2{margin:0 0 var(--space-3);font-size:clamp(var(--text-3xl),3.2vw,var(--text-4xl));line-height:var(--leading-snug);font-weight:var(--weight-bold);letter-spacing:var(--tracking-tight)}
.sec-head p{margin:0;color:var(--color-text-2);font-size:var(--text-md)}
.eyebrow{display:inline-flex;align-items:center;gap:var(--space-2);margin:0 0 var(--space-4);font:var(--weight-semi) var(--text-xs)/1 var(--font-mono);letter-spacing:var(--tracking-ultra);text-transform:uppercase;color:var(--color-accent)}
.eyebrow::before{content:"";width:6px;height:6px;border-radius:var(--radius-sm);background:var(--color-accent)}
.lede{color:var(--color-text-2);font-size:var(--text-md);max-width:68ch;line-height:var(--leading-relaxed)}
.grad{background:linear-gradient(115deg,var(--color-accent-dim) 10%,var(--color-accent) 85%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
```

NOTE: Remove `.sec::after` background counter watermark entirely — replaced by clean negative space.

- [ ] **Step 2: Verify section spacing, eyebrow styling, gradient text on both themes**

- [ ] **Step 3: Commit**

---

### Task 6: Refactor `style.css` — Buttons

**Files:**
- Modify: `style.css` (lines 76–82, button section)

**Consumes:** Token references

**Produces:** All button variants tokenized, press state added

- [ ] **Step 1: Replace button rules**

```css
.btn{display:inline-flex;align-items:center;gap:var(--space-2);height:40px;padding:0 var(--space-4);border:1px solid var(--color-border-2);border-radius:var(--radius-md);background:transparent;color:var(--color-text-1);font:var(--weight-semi) var(--text-sm)/1 var(--font-sans);cursor:pointer;transition:border-color var(--duration-fast),color var(--duration-fast),box-shadow var(--duration-fast),transform var(--duration-fast)}
.btn:hover{border-color:var(--color-accent);color:var(--color-accent);transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.btn.primary{border-color:transparent;color:#fff;background:linear-gradient(180deg,var(--color-accent-dim) 0%,var(--color-accent) 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 10px 28px -12px var(--color-glow)}
.btn.primary:hover{color:#fff;filter:brightness(1.06);box-shadow:inset 0 1px 0 rgba(255,255,255,.22),0 14px 34px -12px var(--color-glow)}
.btn.primary:active{filter:brightness(0.96);transform:translateY(0)}
.btn .arr{font-family:var(--font-mono);transition:transform var(--duration-fast) var(--ease-out)}
.btn:hover .arr{transform:translateX(3px)}
```

- [ ] **Step 2: Verify primary button glow, hover lift, press depression, arrow animation**

- [ ] **Step 3: Commit**

---

### Task 7: Refactor `style.css` — Hero, Page Hero & Metrics

**Files:**
- Modify: `style.css` (lines 84–119, hero + metrics sections)

**Consumes:** Token references

**Produces:** Home hero, page hero, metrics strip — all tokenized, atmosphere refined

- [ ] **Step 1: Replace hero rules**

```css
.hero{position:relative;min-height:calc(94svh - var(--header-height));display:grid;grid-template-columns:minmax(0,1.05fr) minmax(400px,.95fr);align-items:center;gap:var(--space-11);padding:var(--space-12) 0 var(--space-11)}
.hero::before{content:"";position:absolute;inset:-20% -40%;z-index:-2;pointer-events:none;background:
  radial-gradient(720px 480px at 72% 22%,var(--color-glow),transparent 62%),
  radial-gradient(560px 440px at 12% 78%,var(--color-glow),transparent 65%)}
.hero::after{content:"";position:absolute;inset:0 -40%;z-index:-3;pointer-events:none;background-image:linear-gradient(var(--color-border-1) 1px,transparent 1px),linear-gradient(90deg,var(--color-border-1) 1px,transparent 1px);background-size:52px 52px;-webkit-mask-image:radial-gradient(ellipse 90% 80% at 50% 40%,#000 30%,transparent 75%);mask-image:radial-gradient(ellipse 90% 80% at 50% 40%,#000 30%,transparent 75%)}
.hero h1{margin:0 0 var(--space-6);font-size:clamp(var(--text-5xl),5.8vw,var(--text-7xl));line-height:var(--leading-tight);font-weight:var(--weight-heavy);letter-spacing:var(--tracking-tight)}
.hero .lead{margin:0 0 var(--space-8);color:var(--color-text-2);font-size:var(--text-lg);line-height:var(--leading-relaxed);max-width:560px}
.hero-actions{display:flex;gap:var(--space-3);flex-wrap:wrap}
.hero-meta{margin-top:var(--space-9);display:flex;gap:var(--space-6);flex-wrap:wrap;font:var(--weight-medium) var(--text-sm)/1.6 var(--font-mono);color:var(--color-text-3)}
.hero-meta b{color:var(--color-text-2);font-weight:var(--weight-semi)}
```

- [ ] **Step 2: Replace phero (subpage hero) rules**

```css
.phero{position:relative;padding:var(--space-13) 0 var(--space-10);border-bottom:1px solid var(--color-border-1)}
.phero::before{content:"";position:absolute;inset:-10% -40%;z-index:-2;pointer-events:none;background:radial-gradient(560px 320px at 78% 30%,var(--color-glow),transparent 65%)}
.phero h1{margin:0 0 var(--space-4);font-size:clamp(var(--text-4xl),4.4vw,var(--text-6xl));line-height:1.18;font-weight:var(--weight-bold);letter-spacing:var(--tracking-tight);max-width:880px}
.phero .lede{margin:0}
```

- [ ] **Step 3: Replace metrics rules**

```css
.metrics{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid var(--color-border-1);border-radius:var(--radius-lg);background:var(--color-surface-1)}
.metrics>div{padding:var(--space-5) var(--space-6);border-left:1px solid var(--color-border-1);transition:background var(--duration-fast)}
.metrics>div:hover{background:var(--color-surface-2)}
.metrics>div:first-child{border-left:0}
.metrics strong{display:block;font:var(--weight-semi) var(--text-3xl)/1.2 var(--font-mono);letter-spacing:var(--tracking-tight);margin-bottom:var(--space-1)}
.metrics span{font:var(--weight-medium) var(--text-xs)/1.5 var(--font-mono);letter-spacing:var(--tracking-ultra);text-transform:uppercase;color:var(--color-text-3)}
```

- [ ] **Step 4: Verify hero atmosphere on 1440p, 1024p, 768p, 375p — grid overlay, glow, title scale**

- [ ] **Step 5: Commit**

---

### Task 8: Refactor `style.css` — Cards, Pipeline, Terminal

**Files:**
- Modify: `style.css` (lines 96–111, 121–142, card + pipeline + terminal sections)

**Consumes:** Token references

**Produces:** Card grid system, pipeline steps, terminal component — all tokenized

- [ ] **Step 1: Replace card grid rules**

```css
.grid{display:grid;gap:0;border:1px solid var(--color-border-1);border-radius:var(--radius-lg);overflow:hidden;background:var(--color-surface-1);box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.grid.c2{grid-template-columns:repeat(2,1fr)}
.grid.c3{grid-template-columns:repeat(3,1fr)}
.grid.c4{grid-template-columns:repeat(4,1fr)}
.card{position:relative;overflow:hidden;border:1px solid var(--color-border-1);border-radius:var(--radius-lg);background:var(--color-surface-1);padding:var(--space-7);transition:border-color var(--duration-normal)}
.grid>.card{border:0;border-left:1px solid var(--color-border-1);border-top:1px solid var(--color-border-1);margin-top:-1px;margin-left:-1px;border-radius:0;background:transparent;box-shadow:none;transition:background var(--duration-normal)}
.grid>.card:hover{background:var(--color-surface-2)}
.card::before{content:"";position:absolute;inset:0;background:radial-gradient(320px circle at var(--mx,50%) var(--my,50%),var(--color-accent-soft),transparent 72%);opacity:0;transition:opacity var(--duration-slow);pointer-events:none}
.card:hover::before{opacity:1}
.card .tag{position:relative;display:inline-block;margin-bottom:var(--space-4);padding:var(--space-1) var(--space-3);border:1px solid var(--color-border-2);border-radius:var(--radius-sm);font:var(--weight-semi) var(--text-xs)/1 var(--font-mono);letter-spacing:var(--tracking-ultra);color:var(--color-accent)}
.card h3{position:relative;margin:0 0 var(--space-3);font-size:var(--text-lg);font-weight:var(--weight-bold);letter-spacing:-0.005em}
.card p{position:relative;margin:0;color:var(--color-text-2);font-size:var(--text-base);line-height:var(--leading-relaxed)}
```

- [ ] **Step 2: Replace pipeline rules**

```css
.pipe{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid var(--color-border-1);border-radius:var(--radius-lg);overflow:hidden;background:var(--color-surface-1)}
.pipe>div{position:relative;overflow:hidden;padding:var(--space-6);border:0;border-left:1px solid var(--color-border-1);border-top:1px solid var(--color-border-1);margin-top:-1px;margin-left:-1px;transition:background var(--duration-fast),transform var(--duration-fast)}
.pipe>div:hover{background:var(--color-surface-2);transform:translateY(-2px)}
.pipe .n{display:block;font:var(--weight-heavy) var(--text-3xl)/1 var(--font-mono);color:var(--color-accent-dim);letter-spacing:var(--tracking-tight);margin-bottom:var(--space-3);opacity:.9}
.pipe b{display:block;margin:0 0 var(--space-2);font-size:var(--text-md);font-weight:var(--weight-bold)}
.pipe p{margin:0;color:var(--color-text-2);font-size:var(--text-base);line-height:var(--leading-normal)}
.pipe .mono{font-family:var(--font-mono);font-size:var(--text-sm);color:var(--color-text-3)}
```

- [ ] **Step 3: Replace terminal rules**

```css
.term{position:relative;border:1px solid var(--color-border-2);border-radius:var(--radius-xl);background:linear-gradient(180deg,var(--color-surface-2) 0%,var(--color-surface-1) 18%,var(--color-bg) 100%);overflow:hidden;box-shadow:var(--shadow-4)}
.term-h{display:flex;align-items:center;gap:var(--space-2);height:38px;padding:0 var(--space-4);border-bottom:1px solid var(--color-border-1)}
.term-h i{width:10px;height:10px;border-radius:50%;background:var(--color-border-2)}
.term-h i:nth-child(1){background:#FF5F57}.term-h i:nth-child(2){background:#FEBC2E}.term-h i:nth-child(3){background:#28C840}
.term-h span{margin-left:var(--space-2);font:var(--weight-medium) var(--text-xs)/1 var(--font-mono);color:var(--color-text-3);letter-spacing:var(--tracking-wide)}
.term-b{padding:var(--space-4) var(--space-4) var(--space-5);font:400 var(--text-sm)/1.75 var(--font-mono);color:var(--color-text-2);overflow-x:auto;white-space:pre}
.term-b .p{color:var(--color-accent)}
.term-b .c{color:var(--color-text-1)}
.term-b .ok{color:var(--color-ok)}
.term-b .cm{color:var(--color-text-3)}
.term-b .tl{display:block}
.term-b .tl.pre{opacity:0;transform:translateY(5px)}
.term-b .tl.pre.in{opacity:1;transform:none;transition:opacity var(--duration-slow) var(--ease-out),transform var(--duration-slow) var(--ease-out)}
.term-b .cursor{display:inline-block;color:var(--color-accent);animation:blink 1.1s var(--ease-in-out) infinite}
@keyframes blink{50%{opacity:0.15}}
```

- [ ] **Step 4: Verify card spotlight, pipeline hover lift, terminal boot animation**

- [ ] **Step 5: Commit**

---

### Task 9: Refactor `style.css` — Tables, Badges, Chips, Notes, Code

**Files:**
- Modify: `style.css` (lines 144–173, table + badge + note + code sections)

**Consumes:** Token references

**Produces:** All data display components tokenized

- [ ] **Step 1: Replace badge/chip rules**

```css
.badges{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.badge{display:inline-flex;align-items:center;height:28px;padding:0 11px;border:1px solid var(--color-border-1);border-radius:var(--radius-sm);font:var(--weight-medium) var(--text-xs)/1 var(--font-mono);color:var(--color-text-2);background:var(--color-surface-1);transition:all var(--duration-fast)}
.badge:hover{border-color:var(--color-accent);color:var(--color-accent);transform:translateY(-1px)}
.chips{display:flex;flex-wrap:wrap;gap:var(--space-3)}
.chips span{padding:var(--space-2) var(--space-4);border:1px solid var(--color-border-1);border-radius:var(--radius-full);background:var(--color-surface-1);font:var(--weight-medium) var(--text-sm)/1 var(--font-mono);color:var(--color-text-2);transition:all var(--duration-fast)}
.chips span:hover{border-color:var(--color-accent);color:var(--color-accent);transform:translateY(-2px)}
```

- [ ] **Step 2: Replace table rules**

```css
.tbl{width:100%;border-collapse:collapse;font-size:var(--text-base);border:1px solid var(--color-border-1);border-radius:var(--radius-lg);background:var(--color-surface-1)}
.tbl-wrap{overflow-x:auto;border-radius:var(--radius-lg)}
.tbl th{font:var(--weight-semi) var(--text-xs)/1.4 var(--font-mono);letter-spacing:var(--tracking-ultra);text-transform:uppercase;color:var(--color-text-3);text-align:left;padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-border-1);background:var(--color-surface-2)}
.tbl td{padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--color-border-1);color:var(--color-text-2);vertical-align:top}
.tbl tbody tr{transition:background var(--duration-fast)}
.tbl tbody tr:hover td{background:var(--color-surface-2)}
.tbl tr:last-child td{border-bottom:0}
.tbl td:first-child{color:var(--color-text-1);font-weight:var(--weight-medium);white-space:nowrap}
.tbl code{font-size:var(--text-sm);color:var(--color-accent);background:none;padding:0}
```

- [ ] **Step 3: Replace note, code, checklist, code-block rules**

```css
.note{border:1px solid var(--color-border-1);border-left:2px solid var(--color-accent);border-radius:0 var(--radius-lg) var(--radius-lg) 0;background:var(--color-surface-1);padding:var(--space-4) var(--space-5);color:var(--color-text-2);font-size:var(--text-base)}
.note b{color:var(--color-text-1)}
.ck{list-style:none;margin:0;padding:0}
.ck li{position:relative;padding:var(--space-2) 0 var(--space-2) var(--space-6);color:var(--color-text-2);font-size:var(--text-base);border-bottom:1px dashed var(--color-border-1)}
.ck li:last-child{border-bottom:0}
.ck li::before{content:"✓";position:absolute;left:var(--space-1);color:var(--color-ok);font-weight:var(--weight-heavy)}
.ck li.no::before{content:"○";color:var(--color-text-3);font-weight:var(--weight-normal)}
.ck li b{color:var(--color-text-1);font-weight:var(--weight-semi)}
.ck li code{font-size:var(--text-sm);color:var(--color-accent);background:var(--color-accent-soft);padding:1px 6px;border-radius:var(--radius-sm)}
pre{border:1px solid var(--color-border-1);border-radius:var(--radius-lg);background:var(--color-surface-1);padding:var(--space-5);overflow-x:auto;font:400 var(--text-sm)/1.7 var(--font-mono);color:var(--color-text-2);box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
pre code{color:inherit;background:none;padding:0}
p code,li code,td code,.prose code{font-size:.88em;color:var(--color-accent);background:var(--color-accent-soft);padding:1.5px 6px;border-radius:var(--radius-sm)}
```

- [ ] **Step 4: Verify tables, code blocks, callouts in both themes on multiple pages**

- [ ] **Step 5: Commit**

---

### Task 10: Refactor `style.css` — Split Layout, SVG Diagram, Rings, Footer

**Files:**
- Modify: `style.css` (lines 181–253, split + SVG + rings + footer + reveal)

**Consumes:** Token references

**Produces:** Remaining layout and decorative components tokenized

- [ ] **Step 1: Replace split, SVG diagram, arch SVG rules**

```css
.split{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:var(--space-10);align-items:start}
.svg-scroll{overflow-x:auto}
.arch-svg{width:100%;min-width:880px;height:auto;border:1px solid var(--color-border-1);border-radius:var(--radius-lg);background:var(--color-surface-1)}
.arch-svg text{font-family:var(--font-mono)}
.arch-svg #arrw path{fill:var(--color-text-3)}
.arch-svg .layer{fill:var(--color-surface-2);stroke:var(--color-border-2);transition:stroke var(--duration-fast)}
.arch-svg .layer:hover{stroke:var(--color-accent)}
.arch-svg .el{font:var(--weight-semi) var(--text-xs)/1 var(--font-mono);fill:var(--color-accent);letter-spacing:var(--tracking-ultra)}
.arch-svg .name{font:var(--weight-semi) var(--text-sm)/1 var(--font-mono);fill:var(--color-text-1)}
.arch-svg .desc{font:400 var(--text-xs)/1.4 var(--font-mono);fill:var(--color-text-2)}
.arch-svg .flow{stroke:var(--color-text-3);stroke-width:1;fill:none;marker-end:url(#arrw)}
.arch-svg .comp{fill:var(--color-surface-1);stroke:var(--color-border-1);transition:stroke var(--duration-fast)}
.arch-svg .comp:hover{stroke:var(--color-accent)}
.arch-svg .comp-t{font:var(--weight-medium) var(--text-xs)/1 var(--font-mono);fill:var(--color-text-2)}
```

- [ ] **Step 2: Replace rings (hero diagram) rules**

```css
.rings{display:flex;justify-content:center;align-items:center}
.rings svg{width:min(100%,560px);height:auto;overflow:visible}
.rings .spoke{stroke:var(--color-border-1);stroke-width:1}
.rings .ring{fill:none;stroke:var(--color-border-2);stroke-width:1}
.rings .comet{fill:none;stroke:var(--color-accent);stroke-width:1.5;stroke-linecap:round;transform-origin:280px 280px;animation:spin linear infinite}
.rings .c1{stroke-dasharray:90 1355;animation-duration:44s}
.rings .c2{stroke-dasharray:70 935;animation-duration:64s;animation-direction:reverse}
.rings .c3{stroke-dasharray:46 551;animation-duration:88s}
.rings .node{fill:var(--color-accent)}
.rings .halo{fill:var(--color-accent);opacity:.14}
.rings .rl{font:var(--weight-medium) var(--text-xs)/1 var(--font-mono);fill:var(--color-text-2);letter-spacing:var(--tracking-wide)}
.rings .el-l{font:var(--weight-semi) var(--text-xs)/1 var(--font-mono);fill:var(--color-accent);letter-spacing:var(--tracking-ultra)}
.rings .core{fill:var(--color-accent-soft);stroke:var(--color-accent);stroke-width:1}
.rings .core-t{font:var(--weight-semi) var(--text-xs)/1 var(--font-mono);fill:var(--color-accent);letter-spacing:var(--tracking-wide)}
@keyframes spin{to{transform:rotate(360deg)}}
```

- [ ] **Step 3: Replace footer and reveal animation rules**

```css
.ft{border-top:1px solid var(--color-border-1)}
.ft-in{max-width:var(--wrap-width);margin:auto;padding:var(--space-9) var(--space-6);display:flex;justify-content:space-between;align-items:center;gap:var(--space-6);flex-wrap:wrap}
.ft .l{display:flex;align-items:center;gap:var(--space-3);font:var(--weight-semi) var(--text-sm)/1 var(--font-mono);color:var(--color-text-2)}
.ft .l img{width:18px;height:18px}
.ft .r{display:flex;gap:var(--space-6);font:var(--weight-medium) var(--text-sm)/1.6 var(--font-mono);color:var(--color-text-3)}
.ft .r a:hover{color:var(--color-accent)}
.rv{opacity:0;transform:translateY(14px);transition:opacity var(--duration-slow) var(--ease-out),transform var(--duration-slow) var(--ease-out)}
.rv.in{opacity:1;transform:none}
```

- [ ] **Step 4: Verify SVG diagram hover, rings animation, footer balance**

- [ ] **Step 5: Commit**

---

### Task 11: Refactor `style.css` — Responsive Breakpoints & Roadmap/Download

**Files:**
- Modify: `style.css` (lines 189–294, lanes + download cards + responsive)

**Consumes:** Token references

**Produces:** Roadmap lanes, download cards, responsive breakpoints all tokenized

- [ ] **Step 1: Replace roadmap lanes rules**

```css
.lanes{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-4);align-items:start}
.lane{border:1px solid var(--color-border-1);border-radius:var(--radius-lg);background:var(--color-surface-1);padding:var(--space-6);box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.lane>h3{margin:0 0 var(--space-1);font-size:var(--text-md);font-weight:var(--weight-bold);display:flex;align-items:center;gap:var(--space-3)}
.lane>h3::before{content:"";width:8px;height:8px;border-radius:50%}
.lane.done>h3::before{background:var(--color-ok);box-shadow:0 0 10px var(--color-ok)}
.lane.doing>h3::before{background:var(--color-accent);box-shadow:0 0 10px var(--color-accent)}
.lane.next>h3::before{background:var(--color-text-3)}
.lane>.sub{margin:0 0 var(--space-4);font:var(--weight-medium) var(--text-xs)/1.5 var(--font-mono);letter-spacing:var(--tracking-ultra);text-transform:uppercase;color:var(--color-text-3)}
.lane ul{list-style:none;margin:0;padding:0}
.lane li{padding:var(--space-3) 0;border-top:1px dashed var(--color-border-1);font-size:var(--text-base);color:var(--color-text-2)}
.lane li b{color:var(--color-text-1);font-weight:var(--weight-semi)}
```

- [ ] **Step 2: Replace download card rules**

```css
.dl-card{position:relative;overflow:hidden;border:1px solid var(--color-border-1);border-radius:var(--radius-lg);background:var(--color-surface-1);padding:var(--space-7);display:flex;flex-direction:column;gap:var(--space-3);box-shadow:inset 0 1px 0 rgba(255,255,255,.03)}
.dl-card::before{content:"";position:absolute;inset:0;background:radial-gradient(320px circle at var(--mx,50%) var(--my,50%),var(--color-accent-soft),transparent 72%);opacity:0;transition:opacity var(--duration-slow);pointer-events:none}
.dl-card:hover::before{opacity:1}
.dl-card .plat{font:var(--weight-semi) var(--text-xs)/1 var(--font-mono);letter-spacing:var(--tracking-ultra);text-transform:uppercase;color:var(--color-accent)}
.dl-card h3{margin:0;font-size:var(--text-lg);font-weight:var(--weight-bold)}
.dl-card .meta{display:flex;gap:var(--space-4);font:var(--weight-medium) var(--text-sm)/1.5 var(--font-mono);color:var(--color-text-3);flex-wrap:wrap}
.dl-card p{margin:0;color:var(--color-text-2);font-size:var(--text-base)}
.dl-card .btn{align-self:flex-start;margin-top:var(--space-3)}
```

- [ ] **Step 3: Replace responsive breakpoints with tokenized values**

```css
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .rv,.term-b .tl.pre{opacity:1;transform:none;transition:none}
  *{animation:none!important;transition:none!important}
}
@media (max-width:1020px){
  .hero{grid-template-columns:1fr;gap:var(--space-9);min-height:0;padding:var(--space-10) 0}
  .grid.c4{grid-template-columns:repeat(2,1fr)}
  .pipe{grid-template-columns:repeat(2,1fr)}
  .lanes{grid-template-columns:1fr}
}
@media (max-width:760px){
  .hd-in{gap:var(--space-3);padding:0 var(--space-4)}
  .nav-burger{display:block}
  .hd-nav{position:fixed;top:var(--header-height);left:0;right:0;flex-direction:column;gap:0;background:var(--color-bg);border-bottom:1px solid var(--color-border-1);padding:var(--space-2) var(--space-4) var(--space-4);display:none;margin-right:0}
  #nav-toggle:checked~.hd-nav{display:flex}
  #nav-toggle:checked~.nav-burger span:nth-child(1){top:15px;transform:rotate(45deg)}
  #nav-toggle:checked~.nav-burger span:nth-child(2){opacity:0}
  #nav-toggle:checked~.nav-burger span:nth-child(3){top:15px;transform:rotate(-45deg)}
  .hd-nav a{padding:var(--space-3);font-size:var(--text-md)}
  .hd-nav a::after{display:none}
  .hd-r .hd-btn .hide-m{display:none}
  .w{padding:0 var(--space-4)}
  .sec{padding:var(--space-11) 0}
  .hero h1{font-size:var(--text-4xl)}
  .phero{padding:var(--space-11) 0 var(--space-8)}
  .metrics{grid-template-columns:repeat(2,1fr)}
  .metrics>div{border-top:1px solid var(--color-border-1)}
  .metrics>div:nth-child(-n+2){border-top:0}
  .metrics>div:nth-child(odd){border-left:0}
  .grid.c2,.grid.c3,.grid.c4,.pipe{grid-template-columns:1fr}
  .split{grid-template-columns:1fr;gap:var(--space-7)}
  .ft-in{flex-direction:column;align-items:flex-start}
}
```

- [ ] **Step 4: Verify responsive behavior at 375px, 768px, 1024px, 1440px**

- [ ] **Step 5: Commit**

---

### Task 12: Polish `index.html` — Visual Refinement

**Files:**
- Modify: `index.html`
- Modify: `en/index.html`

**Consumes:** Tokenized CSS from Tasks 3–11

**Produces:** Museum-grade homepage with refined spacing, atmosphere, typography

- [ ] **Step 1: Polish hero section**

Review and tune:
- Hero grid gap at different viewports
- Ring SVG sizing relative to text column
- Eyebrow → title → lead → actions → meta vertical rhythm
- Grad text readability on both themes

- [ ] **Step 2: Polish design pillars section**

- Three cards equal height, equal visual weight
- Tag → heading → body spacing consistent

- [ ] **Step 3: Polish boot chain pipeline**

- Six steps, even columns
- Number styling consistent with spec

- [ ] **Step 4: Polish terminal section**

- Split layout: text column width vs terminal column
- CTA placement

- [ ] **Step 5: Apply same changes to `en/index.html`**

- [ ] **Step 6: Side-by-side review zh vs en at 1440p, 768p, 375p**

- [ ] **Step 7: Commit**

---

### Task 13: Polish `architecture.html` — Visual Refinement

**Files:**
- Modify: `architecture.html`
- Modify: `en/architecture.html`

**Consumes:** Tokenized CSS

**Produces:** Museum-grade architecture page

- [ ] **Step 1: Polish SVG architecture diagram**

- Unify stroke widths
- Ensure colors reference tokens (inline SVG may need manual color matching)
- Check text readability at min-width (880px scroll)

- [ ] **Step 2: Polish capability system split section**

- Table + badges alignment
- Note callout placement

- [ ] **Step 3: Polish IPC pipeline and scheduler sections**

- Code block + text split balance
- Pipeline hover states

- [ ] **Step 4: Apply to `en/architecture.html`**

- [ ] **Step 5: Commit**

---

### Task 14: Polish `features.html` — Visual Refinement

**Files:**
- Modify: `features.html`
- Modify: `en/features.html`

**Consumes:** Tokenized CSS

**Produces:** Museum-grade features page

- [ ] **Step 1: Polish checklist cards**

- `.ck` list items vertical rhythm
- Card grid balance (some cards have more items than others)
- Check mark vs empty circle contrast

- [ ] **Step 2: Verify all sections — Microkernel, Hypervisor, Services, Storage, Network, Toolchain**

- [ ] **Step 3: Apply to `en/features.html`**

- [ ] **Step 4: Commit**

---

### Task 15: Polish `build.html`, `roadmap.html`, `download.html`

**Files:**
- Modify: `build.html`, `roadmap.html`, `download.html`
- Modify: `en/build.html`, `en/roadmap.html`, `en/download.html`

**Consumes:** Tokenized CSS

**Produces:** Museum-grade remaining pages

- [ ] **Step 1: Polish build.html — terminal component, code blocks, steps**

- [ ] **Step 2: Polish roadmap.html — lane status dots, list items**

- [ ] **Step 3: Polish download.html — download cards, grid balance**

- [ ] **Step 4: Apply all to English mirrors**

- [ ] **Step 5: Commit**

---

### Task 16: Polish `docs/index.html` & `docs/docs.css`

**Files:**
- Modify: `docs/index.html`
- Modify: `docs/docs.css`

**Consumes:** Tokenized CSS

**Produces:** Docs page feels part of the same system

- [ ] **Step 1: Add `theme.css` link to docs/index.html (already done in Task 2)**

- [ ] **Step 2: Refactor docs/docs.css to reference tokens where applicable**

- [ ] **Step 3: Verify docs page visual consistency with main site**

- [ ] **Step 4: Commit**

---

### Task 17: Component Refinement — Header, Buttons, Footer

**Files:**
- Modify: `style.css`

**Consumes:** All prior tasks

**Produces:** Museum-grade interactive components

- [ ] **Step 1: Header glass refinement**

- Tune glass opacity, blur amount, saturation
- Nav underline spring animation timing
- Active state glow on underline (`box-shadow: 0 0 6px var(--color-accent-soft)`)

- [ ] **Step 2: Button refinement**

- Primary gradient angle and color stops
- Active/press: `translateY(0)`, `filter: brightness(0.96)`
- Focus-visible ring: `0 0 0 2px var(--color-accent-soft)`
- Loading state: skeleton pulse keyframe

```css
.btn.loading{pointer-events:none;opacity:.7}
.btn.loading::after{content:"";width:14px;height:14px;border:2px solid var(--color-border-1);border-top-color:var(--color-accent);border-radius:50%;animation:spin .6s linear infinite}
```

- [ ] **Step 3: Footer refinement**

- Balanced visual weight with header
- Link hover same easing as nav

- [ ] **Step 4: Verify all states: default, hover, active, focus, loading (buttons)**

- [ ] **Step 5: Commit**

---

### Task 18: Component Refinement — Cards, Terminal, Tables

**Files:**
- Modify: `style.css`

**Consumes:** All prior tasks

**Produces:** Museum-grade display components

- [ ] **Step 1: Card spotlight refinement**

- Tune radial-gradient radius (320px), opacity fall-off
- Grid container: single top-light inset instead of per-card highlights
- Card padding responsive: `var(--space-6)` mobile, `var(--space-7)` desktop
- Tag: all identical height, padding, font

- [ ] **Step 2: Terminal refinement**

- Window dots: exact 10px, exact 8px gap
- Cursor blink: smooth `var(--ease-in-out)` (already done in Task 8)
- Line stagger timing: 110ms per line
- Title bar: dot group left-aligned, title centered

- [ ] **Step 3: Table refinement**

- Header: consistent uppercase, tracking
- Row hover: smooth background transition
- Border: horizontal rules only

- [ ] **Step 4: Commit**

---

### Task 19: Component Refinement — Pipeline, Badges, SVG, Rings

**Files:**
- Modify: `style.css`

**Consumes:** All prior tasks

**Produces:** Museum-grade remaining components

- [ ] **Step 1: Pipeline refinement**

- Numbers: same size, weight, color across all instances
- Step connector: subtle arrow indicator between steps (optional — assess visual clutter)
- Hover: translateY(-2px) with spring easing

- [ ] **Step 2: Badge/chip refinement**

- Fixed height, consistent padding
- Hover: translateY(-1px) + border color transition

- [ ] **Step 3: SVG diagram refinement (architecture.html inline SVG)**

- Stroke widths: 1px uniform
- Colors: manually match token values (inline SVG can't reference CSS vars directly in all cases, use matching hex)
- Hover: accent stroke on layer rects

- [ ] **Step 4: Rings diagram refinement**

- Comet animation: smooth, hypnotic
- Node halos: opacity and size
- Labels: readability at all viewport sizes

- [ ] **Step 5: Commit**

---

### Task 20: Final Audit — Full Site Visual QA

**Files:**
- All 20 HTML pages, `theme.css`, `style.css`, `script.js`

**Consumes:** All completed tasks

**Produces:** Signed-off museum-grade website

- [ ] **Step 1: Theme consistency**

Toggle light/dark on every page — verify:
- All colors switch correctly
- No hardcoded colors remain in style.css
- No visual glitches during transition

- [ ] **Step 2: Responsive QA**

Test every page at: 320px, 375px, 768px, 1024px, 1440px, 1920px
- No horizontal scroll (except intentional SVG overflow)
- No text clipping
- Touch targets ≥ 44px

- [ ] **Step 3: Bilingual parity**

Side-by-side zh vs en for each page:
- Same structure, same token references
- No layout drift

- [ ] **Step 4: Performance check**

- `theme.css` + `style.css` total size < 15KB
- Lighthouse score ≥ 95
- No layout shift on load

- [ ] **Step 5: Token compliance grep**

```bash
# Verify no bare colors remain (should return 0 or very few intentional uses)
grep -nE '#[0-9a-fA-F]{3,6}|rgba?\([0-9]' style.css | grep -v '#' | wc -l

# Verify no bare px values in key properties (some fine in box-shadow, etc.)
grep -n 'font-size:' style.css | grep -v 'var('
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: museum-grade redesign — complete token system + polish

All 80+ design tokens in theme.css. All component styles tokenized.
All 20 HTML pages linked. Visual QA passed on both themes,
5 breakpoints, bilingual parity verified.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Execution Summary

| Phase | Tasks | Files | Deliverable |
|-------|-------|-------|-------------|
| A — Token System | 1–2 | `theme.css` (new), 20 HTML (modify) | Token architecture live, all pages linked |
| A — CSS Refactor | 3–11 | `style.css` (full rewrite) | Zero bare values, 100% token references |
| B — Page Polish | 12–16 | 20 HTML + `docs/docs.css` | Museum-grade visual on every page |
| C — Component Polish | 17–19 | `style.css` (fine-tune) | Every component at museum quality |
| QA | 20 | All files | Signed off, committed |
