# Modern Minimalist UI Guidelines (DESIGN.md)

Enforces strict modern, minimalist UI design rules: no shadows, 3-4 colors maximum, flat icons, no uppercase tracking, and bold hero sections.

## Core Design Rules

### 1. Style & Aesthetics
- **Vibe:** Modern and strictly minimalist.
- **Banned Styles:** NO futuristic elements, NO neon colors, NO glowing effects.
- **Depth:** NO SHADOWS (`box-shadow`, `drop-shadow`, `shadow-sm`, `shadow-md`, `shadow-lg`, etc.). Use flat design, subtle borders, or generous whitespace to separate elements instead of elevation.

### 2. Color Palette
- Restrict the entire design to a maximum of 3 to 4 colors:
  1. Base Background (`#ffffff` light / `#0c0c0d` dark)
  2. Main Text / Ink (`#111111` light / `#f4f4f5` dark)
  3. Muted Neutral (`#71717a` / subtle border `#e4e4e7` light, `#27272a` dark)
  4. Primary Accent (Single cohesive color chosen by user)
- Do not use a multitude of different colors. Keep the palette highly cohesive and restrained.

### 3. Iconography
- Icons must always be a single, uniform color drawn from the strict palette.
- **Banned:** NEVER use icons with colored backgrounds (no icons sitting inside colored circles, squares, or boxes). Keep them clean, flat, and standalone.

### 4. Typography
- **Banned:** NEVER use ALL CAPS text with tracking (`uppercase tracking-*`). Use standard Sentence case or Title case.
- Emphasize readability and visual hierarchy through font size and weight rather than styling gimmicks.

### 5. Hero Sections
- Must be visually striking with large, bold typography for headlines (`text-3xl` to `text-5xl font-black`).
- Include engaging visual elements like large cover artwork, clean presentation, and contextual tags.

### 6. Spacing & Layout
- Use generous padding and margins (whitespace/negative space) to let elements breathe.
- Avoid clutter; if an element is not strictly necessary, remove it.
