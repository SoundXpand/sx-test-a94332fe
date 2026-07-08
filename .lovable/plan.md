# SoundXpand — Premium Marketing Redesign

Visual-only overhaul of every public page. Zero changes to routes, forms, CTAs, APIs, DB, auth, SEO, packages, or navigation structure. All existing components keep their exports, props, and link destinations — only their internal JSX and styling change.

## 1. New design language

**Palette** (replaces purple/pink/cyan/multicolor in `src/styles.css`):
- `--ink`: deep black `oklch(0.08 0.005 60)`
- `--charcoal`: `oklch(0.16 0.006 60)`
- `--charcoal-2`: `oklch(0.22 0.006 60)`
- `--cream`: soft warm `oklch(0.96 0.02 85)`
- `--bone`: `oklch(0.92 0.025 85)`
- `--amber`: warm yellow `oklch(0.83 0.16 85)` (primary accent)
- `--amber-glow`: `oklch(0.88 0.14 90)` (soft light source)
- `--amber-deep`: `oklch(0.68 0.17 75)`

All existing brand tokens (`--brand-violet`, `--brand-pink`, `--brand-cyan`, etc.) get rewired to point at the new amber/cream/ink system so any component still referencing them stays visually consistent — no component-level refactor needed for tokens.

**Typography**: keep Syne (display) + DM Sans (body). Introduce tighter tracking on display sizes, uppercase micro-labels with letter-spacing, and a new "editorial" heading utility.

**Light source**: single warm radial glow per section (top or off-canvas), never rainbow orbs. Replace all multi-color orb backdrops with one amber/cream soft fade + subtle grain.

**Component tokens**: new `.btn-tactile` (inset highlight + soft shadow), `.card-lift` (hairline border + hover translate + amber edge glow), `.chip-mono` (cream on ink), `.divider-hair`.

## 2. Section-by-section redesign

Each landing section gets a distinct composition — no repeated card grid.

- **Hero** (`landing-hero.tsx`): editorial split — oversized display headline left, layered floating UI stack right (dashboard preview card + artwork tile + platform badge cluster + stream counter chip), single warm glow behind. Cut-out artist silhouette via CSS mask. Keep DistributionNetwork below.
- **Stats** (`landing-stats.tsx`): move from 4-up divided box to asymmetric editorial row — one hero stat oversize + three secondary stats stacked. Animated counters preserved.
- **Features** (`landing-features.tsx`): bento-style asymmetric grid (1 large + 2 medium + 3 small), each tile with a distinct treatment (screenshot mock, icon+text, product chip cluster).
- **How It Works** (`landing-how.tsx`): switch from 4 identical cards to a vertical timeline with alternating left/right content blocks and a hairline connector.
- **Artists / testimonials** (`landing-artists.tsx`): magazine-style — one featured quote with large portrait cut-out, secondary quotes as compact cards below. Marquee of artist names.
- **Pricing** (`landing-pricing.tsx`): three cards, middle elevated with amber hairline + glow. Tactile buttons. Feature checklists with cream dividers.
- **FAQ** (`landing-faq.tsx`): two-column — sticky heading left, accordion right on desktop; single column on mobile.
- **CTA** (`landing-cta.tsx`): full-bleed cream section (light break in the dark flow) with ink text + amber button — the only inverted section, creating rhythm.
- **Footer** (`landing-footer.tsx`): editorial multi-column with prominent wordmark, keep every link intact.
- **Nav** (`landing-nav.tsx`): thinner glass bar, refined dropdown styling for Monetization/Build, amber underline on hover. Structure and destinations unchanged.

## 3. Solution / secondary pages

`src/components/landing/solution-page.tsx` (used by publishing, sync, youtube-cms, youtube-content-id, ai-tools, music-promotion, advanced-insights, more-features) gets a redesigned template with:
- Editorial hero (eyebrow + display headline + supporting paragraph + dual CTA + hero visual)
- Alternating dark/cream section bands
- Asymmetric feature blocks (not identical cards)
- Amber accents only

Pages that render their own layout (`brand-assets.tsx`, `pledges.tsx`, `digital-music-platforms.tsx`, `contact.tsx`) get the same treatment inline — reusing new utility classes and section patterns.

## 4. Motion

Reuse existing `framer-motion` (already installed). Add:
- Scroll-reveal fade+rise on section entry (once, viewport margin)
- Subtle 3D tilt on featured cards via CSS `perspective` + mouse-move (lightweight, no new deps)
- Hover lift + amber border transition on cards
- Marquee for platform/artist strips (CSS keyframes)
- Counters keep existing IntersectionObserver logic

Nothing heavy, all under 200ms easing, respects `prefers-reduced-motion`.

## 5. Files touched (visual only)

Edited:
- `src/styles.css` — new tokens, rewire brand aliases, new utilities, keyframes
- `src/components/landing/landing-nav.tsx`
- `src/components/landing/landing-hero.tsx`
- `src/components/landing/landing-stats.tsx`
- `src/components/landing/landing-features.tsx`
- `src/components/landing/landing-how.tsx`
- `src/components/landing/landing-artists.tsx`
- `src/components/landing/landing-pricing.tsx`
- `src/components/landing/landing-faq.tsx`
- `src/components/landing/landing-cta.tsx`
- `src/components/landing/landing-footer.tsx`
- `src/components/landing/solution-page.tsx`
- `src/components/landing/distribution-network.tsx` (recolor to amber/cream only)
- `src/routes/brand-assets.tsx`, `pledges.tsx`, `digital-music-platforms.tsx`, `contact.tsx`, `more-features.tsx` — restyle in place
- `src/components/landing-page.tsx` — noise overlay tuning only

No new files, no new packages, no route changes, no logic changes, no auth/DB/API touches. Dashboard and authenticated app untouched.

## 6. Out of scope (explicit)

- No changes to `_authenticated/*` routes
- No changes to agreement flow, PDF generation, R2
- No changes to `dsp-list`, `distributors`, or any data lib
- No SEO metadata rewording (only structural JSX)
- No new dependencies

## Technical notes

Because dashboard components (e.g. `dashboard-shell`, `topbar`, `charts-carousel`) consume the same shadcn tokens (`--primary`, `--accent`, `--ring`), those tokens will shift from violet to amber. This is intentional to unify branding but is a visual side-effect on the authenticated app. If the dashboard must remain violet, say so and I'll scope the new palette to a `.marketing` wrapper on public routes only.
