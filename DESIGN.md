# Modern Minimalist UI Guidelines (DESIGN.md)

Enforces strict modern, minimalist UI design rules: no shadows, 3-4 colors maximum, flat icons, no uppercase tracking, and bold hero sections.

## Core Design Rules

### 1. Style & Aesthetics (Seamless Canvas)
- **Vibe:** Modern and strictly minimalist.
- **Banned Styles:** NO futuristic elements, NO neon colors, NO glowing effects.
- **Depth:** NO SHADOWS (`box-shadow`, `drop-shadow`, `shadow-sm`, `shadow-md`, `shadow-lg`, etc.).
- **No Enclosing Containers / Cards:** BANNED enclosing sections, stats, cards, or panels inside boxes with borders or background fills (NO `border border-zinc-... rounded-... bg-zinc-...`).
- **Separators:** The canvas background flows continuously. Separate sections and elements using **lightweight linear separators** (subtle horizontal hairline dividers `border-b border-zinc-200 dark:border-zinc-800` or vertical lines `border-r border-zinc-200 dark:border-zinc-800`) and generous whitespace (*negative space*).

### 2. Mobile Viewport & ZERO Horizontal Scroll
- Strict `overflow-x-hidden` on root layouts.
- Header bars, navigation items, and action buttons MUST fit small mobile screens (360px - 400px) without overflowing.
- If an action button has long text (e.g. "Abrir cómic(s)"), condense it on mobile to an icon-only button or short label to preserve viewport integrity.

### 3. Color Palette
- Restrict the entire design to a maximum of 3 to 4 colors:
  1. Base Continuous Background (`#ffffff` light / `#0c0c0e` dark)
  2. Main Text / Ink (`#111111` light / `#f4f4f5` dark)
  3. Muted Neutral (`#71717a` / subtle divider `#e4e4e7` light, `#27272a` dark)
  4. Primary Accent (Single cohesive color chosen by user)
- Do not use a multitude of different colors. Keep the palette highly cohesive and restrained.

### 4. Iconography
- Icons must always be a single, uniform color drawn from the strict palette.
- **Banned:** NEVER use icons with colored backgrounds (no icons sitting inside colored circles, squares, or boxes). Keep them clean, flat, and standalone.

### 5. Typography
- **Banned:** NEVER use ALL CAPS text with tracking (`uppercase tracking-*`). Use standard Sentence case or Title case.
- Emphasize readability and visual hierarchy through font size and weight rather than styling gimmicks.

### 6. Hero & Stats Sections
- Bold headlines sitting directly on the canvas without card enclosures.
- Metrics arranged cleanly and separated by subtle vertical dividers (`|`) or negative space, not box cards.
- Subtitle and context directly on the background.

### 7. Spacing & Layout
- Use generous padding and margins (whitespace/negative space) to let elements breathe.
- Avoid clutter; if an element is not strictly necessary, remove it.
