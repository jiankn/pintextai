# PinTextAI Design System — Master

> UI/UX Pro MAX generated the initial direction on 2026-07-20. This master applies the approved Pinterest-inspired product brief and overrides the raw recommendation where the user made an explicit choice.

## Product architecture

- Public generator and SEO pages: focused, single-task conversion path. The tool is visible above the fold and results expand in place.
- Authenticated workspace: responsive three-column production layout—navigation, source/settings, results—with a two-pane tablet mode and stacked mobile mode.
- Brand expression: warm, editorial and content-first. Borrow Pinterest's visual principles (warm red, rounded forms, masonry rhythm), never its logo, wordmark or exact product UI.
- Primary audience: Etsy sellers, bloggers, small e-commerce teams and Pinterest marketers working repeatedly across products and articles.

## Color tokens

| Role | Value | Purpose |
|---|---|---|
| Cherry | `#C51F3A` | Primary CTA, selection and important emphasis |
| Cherry hover | `#A9152E` | Hover/pressed primary state |
| Canvas | `#FFF8F4` | Page background |
| Surface | `#FFFFFF` | Tool, result and dashboard surfaces |
| Ink | `#20181B` | Primary text |
| Muted ink | `#685D61` | Supporting text |
| Border | `#E9DCDA` | Dividers and input outlines |
| Blush | `#F9E7EB` | Selected and promotional surfaces |
| Peach | `#FFE3D5` | Creative/offer grouping |
| Sage | `#DDE8D8` | Natural/success grouping |
| Lavender | `#E8E2F4` | Modern/article grouping |
| Warning | `#9A5B00` | Warning text on pale amber |
| Destructive | `#B42318` | Destructive actions only |
| Focus | `#2D65F2` | Accessible keyboard focus ring |

Normal text must meet 4.5:1 contrast. Color is never the only state indicator.

## Typography

- Display: Calistoga, Georgia, Cambria, serif. Use only for large marketing headings and small editorial accents.
- UI/body: Inter, `Segoe UI`, Arial, sans-serif.
- Body: 16px minimum, 1.55-1.7 line-height. Long text max-width 68ch.
- Marketing H1: clamp(2.5rem, 5vw, 4.5rem). Tool H1: clamp(2.25rem, 4vw, 3.5rem).
- Use tabular numerals for credits, prices, counts and dates.

## Geometry and spacing

- 4/8px spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Card/input radius: 20px. Compact cards: 16px. Pills: 999px.
- Interactive height: at least 44px; 8px gap between adjacent targets.
- Public container: max 1200px. Generator reading width: 880px. Dashboard: fluid with 280px nav/source rails.
- Z-index tokens: base 0, sticky 10, dropdown 30, dialog 50, toast 60.

## Components and interaction

- One primary CTA per screen. Cherry solid, white text, pill radius, no gradient.
- Secondary actions use white/transparent surfaces with visible borders; tertiary actions are labeled text buttons.
- Inputs always have visible labels and persistent helper text for non-obvious fields.
- Vibes and goals are button-like pills with icons from Lucide, text labels and `aria-pressed`.
- Results are editable textareas/cards with direct Copy, Regenerate and feedback actions. Copy confirmation uses icon + text in an `aria-live` region.
- Source preview expands in the current generator card. Skeleton appears after 300ms. Failure keeps the original input and offers a manual fallback.
- Upgrade is a blush banner after the results, never an interrupting modal.
- Motion duration 150-250ms, transform/opacity only, and disabled under `prefers-reduced-motion`.

## Responsive behavior

- Test 320, 375, 768, 1024 and 1440px. Never introduce horizontal page scrolling.
- Public header collapses to an accessible menu under 768px.
- Dashboard sidebar becomes a top/bottom compact navigation on mobile; generator controls stack before results.
- Results prioritize text and copy actions on small screens; secondary metadata wraps below.
- Sticky controls reserve layout space and safe-area padding.

## Accessibility and quality gates

- Skip link, sequential headings, native controls, descriptive labels, visible focus ring and keyboard-complete flows.
- Lucide is the only structural icon family; no emoji icons.
- Never rely on hover for discovery or meaning.
- Loading, empty, error, success and disabled states are designed for each async feature.
- Social proof is hidden until real, verifiable data exists.
- No user content is public without explicit consent and review.
- PinTextAI visibly states it is not affiliated with or endorsed by Pinterest.
