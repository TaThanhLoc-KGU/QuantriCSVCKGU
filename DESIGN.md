# DESIGN.md — "Bảng lịch" (ruled roster sheet)

Recorded by hand from the built world (the documenter subagent was not available in this harness).

## Thesis
A department site is a timetable everyone already reads. Content is set in ruled cells with 1px rules and date-slot columns, one brand hue, square corners by default. It refuses the shadowed rounded-card news template.

## Theme system (runtime, configurable)
- `theme.primary` → generated 10-step `--color-brand-50..900` scale (HSL lightness ladder, hue kept; step 600 = the chosen colour). `theme.accent` → `--color-accent-*`.
- `theme.radius` (sharp | soft | round) overrides `--radius-sm..2xl`; default sharp (0–6px).
- `theme.header` (solid | light) sets `data-header` on `<html>`.
- Logo, name, subtitle, addresses, phone, email, socials, top-strip links, home shortcut cells and footer note come from `/api/public/site-info` (system settings). Cached in localStorage so the theme applies before first paint.
- Editing UI: admin "Giao diện & cấu hình" with live preview.

## Public surface
- Type: Be Vietnam Pro (400–800), tabular numerals for dates/counters. Titles uppercase only in masthead and section tags.
- Structure: utility strip (neutral-900) → white masthead (logo, name, phone, search) → brand ruled nav (cells separated by 1px white/15 rules, "Dịch vụ" dropdown) → notice ticker (urgent tag + date + latest title) → 1200px content.
- Components: `.sheet` (1px neutral-300 border), `.sheet-head` (brand tag cell + 2px brand-700 underline), `.slot` (date cell: large day, month/year), shortcut grid of ruled cells that fill brand on hover, flat post cards (border, no shadow), 4-column footer between brand rules.
- Home: lead story/banner beside a dated notice list (no empty side), shortcut grid, latest news + most-read, gallery/video.

## Admin surface (Operate)
- Dark neutral-900 sidebar with group labels and 3px accent left marker for the active item; mobile drawer; sticky white top bar.
- Dense ruled tables (thead neutral-100, row hover brand-50), compact controls, square buttons/badges, 2px brand rule under each page title.
- Dashboard leads with pending work (feedback, account-recovery requests) as a ruled strip.

## Refused
Eyebrows above headings, gradient text, coloured side borders, icon-tile cards, emoji as icons (replaced with drawn SVG), hard offset shadows.
