# Plan: `validate` — AI idea-validation platform (Next.js)

## Context

You want a blunlock.com-style product, but better: a founder describes an idea, AI builds a polished landing page, the page collects **price-intent signals** ("what would you pay?" / "I wouldn't pay"), and a dashboard tells the founder whether the idea has demand. Blunlock's weak points we're deliberately fixing later (traffic, real-money deposits, multi-variant tests) are kept out of v1 but the schema leaves room for them.

The earlier Nuxt attempt (`~/Workspace/dummy-projects/idea-validation-platform`) already proved out a *structured page config → fixed section components* approach and a Mercury/Tally visual style. We use it as a design reference only; nothing is ported.

**Decisions made (from Q&A):**
- New project at `~/Workspace/dummy-projects/validate`, Next.js 16 (App Router, TS, Tailwind v4, `src/`), npm (pnpm not installed).
- AI generates a **typed JSON PageDocument** (ordered sections, each with a variant + props + theme). React renders it from a component registry. AI never writes JSX/HTML.
- **Vercel AI SDK 7** (`ai`), structured output via `generateText`/`streamText` + `Output.object(zodSchema)`. **Provider = Gemini for now** (`@ai-sdk/google`, your free `GOOGLE_GENERATIVE_AI_API_KEY`), default model `gemini-2.5-flash` (bump via `AI_MODEL` env, e.g. to the newest Flash). `@ai-sdk/anthropic` is also wired so setting `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` switches to Claude with no code change. A deterministic `MockGenerator` sits behind the same interface for tests and keyless dev.
- **Supabase** (Postgres + Auth + RLS): restore & reuse paused project `test-project` (`vvippletqmhhliwtjocy`, ap-southeast-1).
- v1 signal = **price intent only** (tier pick or "wouldn't pay" + optional email + optional "why?"). No Stripe.
- **One design system (Peec-style) with light/dark**; AI picks accent hue + default mode. Founder can override; visitors can toggle.
- **App UI**: shadcn/ui + Tailwind v4. Generated pages use a **separate** component library (`components/page/*`) so they don't look like shadcn.
- Scope = core loop: auth → describe → generate → edit → publish `/p/[slug]` → dashboard.

---

## 1. Architecture overview

```
Founder                       Visitor
  │  /app/new (idea)            │  /p/[slug]
  ▼                             ▼
POST /api/generate  ──stream──► PageDocument (JSON) ──► <PageRenderer/> ◄── same renderer
  │  brief → document                                    │
  ▼                                                      ▼
projects.document (jsonb)                        POST /api/respond → responses
  │                                                      │
  └──► /app/projects/[id]/edit (inspector edits doc) ◄───┘ dashboard reads responses
```

Two tables carry the product: `projects` (owns the `PageDocument` jsonb) and `responses`. Everything else supports them.

---

## 2. Folder structure

```
validate/
  src/
    app/
      (marketing)/page.tsx                 # landing page (last)
      (auth)/login/page.tsx
      auth/callback/route.ts
      (app)/app/layout.tsx                 # authed shell (sidebar/topbar)
      (app)/app/page.tsx                   # project list
      (app)/app/new/page.tsx               # idea intake + live generation
      (app)/app/projects/[id]/page.tsx     # results dashboard
      (app)/app/projects/[id]/edit/page.tsx# editor
      p/[slug]/page.tsx                    # public validation page
      p/[slug]/opengraph-image.tsx
      dev/preview/page.tsx                 # preset gallery w/ demo docs (dev only)
      api/generate/route.ts                # POST, streams partial PageDocument
      api/projects/[id]/regenerate/route.ts# POST, regenerate one section
      api/respond/route.ts                 # POST visitor response (public)
      api/view/route.ts                    # POST page view beacon (public)
    proxy.ts                               # Next 16 name for middleware: refresh session, guard /app
    components/
      ui/                                  # shadcn primitives
      app/                                 # founder app: editor/, dashboard/, intake/
      page/                                # GENERATED-PAGE LIBRARY (see §4)
        registry.ts
        PageRenderer.tsx
        theme/{presets.ts, ThemeScope.tsx, fonts.ts}
        primitives/{Container,Eyebrow,Heading,Button,Squiggle,Doodle,MockUI,Avatars,Icon}.tsx
        sections/hero/{Centered,Split,Minimal}.tsx
        sections/problem/{Cards,Checklist}.tsx
        sections/features/{Grid,Alternating,List}.tsx
        sections/steps/{Numbered,Timeline}.tsx
        sections/founder-note/{Letter,Quote}.tsx
        sections/pricing-intent/{Tiers,SinglePrice}.tsx   # the validation widget
        sections/faq/{Accordion,TwoColumn}.tsx
        sections/cta-band/{Simple,WithProgress}.tsx
        Footer.tsx
    lib/
      page-schema/{document.ts, theme.ts, icons.ts, sections/*.ts, defaults.ts, repair.ts}
      ai/{generator.ts (interface+factory), client.ts (provider/model resolver), mock.ts, prompts.ts, brief.ts}
      supabase/{client.ts, server.ts, admin.ts, proxy.ts}
      db/{projects.ts, responses.ts, types.ts (generated)}
      analytics/pricing-stats.ts
      slug.ts, rate-limit.ts, visitor.ts
  supabase/migrations/0001_init.sql
  .env.example
```

---

## 3. PageDocument schema (`src/lib/page-schema/`) — the contract between AI, editor and renderer

Zod 4 is the single source of truth; TS types are inferred; the same schemas feed `Output.object()` and the inspector forms.

```ts
PageDocument {
  version: 1
  meta: { productName, tagline, seoTitle, seoDescription }
  theme: { preset: 'editorial'|'clean'|'bold'|'playful', accent: AccentHue, rationale?: string }
  nav: { logoText, ctaLabel }
  sections: Section[]          // ordered; each { id, type, variant, hidden: boolean, props }
  goal: { targetResponses: number (default 25), deadlineDays: number (default 30) }
}
```

Section types → variants → props (discriminated union on `type`; `variant` is an enum per type):

| type | variants | key props |
|---|---|---|
| `hero` | centered, split, minimal | eyebrow, headline, headlineHighlight (substring of headline), subheadline, primaryCta, secondaryCta?, visual: `{kind:'mock-ui'\|'abstract'\|'none', mockTitle?, mockRows?[]}` |
| `problem` | cards, checklist | title, items[{title, description}] (2–4) |
| `features` | grid, alternating, list | title, subtitle?, items[{icon: IconName, title, description}] (3–6) |
| `steps` | numbered, timeline | title, items[{title, description}] (3–4) |
| `founder-note` | letter, quote | title?, body (2–4 short paragraphs), signature |
| `pricing-intent` | tiers, single-price | title, subtitle, currency, interval, tiers[{id, name, price, blurb, features[]}] (1–3), highlightedTierId?, noPayLabel, askEmail, followUpQuestion |
| `faq` | accordion, two-column | title, items[{question, answer}] (3–6) |
| `cta-band` | simple, with-progress | headline, subheadline?, ctaLabel |

- `icons.ts`: allow-list enum of ~40 lucide icon names; renderer maps name → component. AI can only pick from the enum.
- `AccentHue` enum: violet, indigo, blue, teal, emerald, lime, amber, orange, rose, pink, fuchsia, slate.
- **Invariants** enforced by `repair.ts` (run after every generation and before save): exactly one `pricing-intent`; `hero` first; 4–8 sections; unique ids (nanoid); `headlineHighlight` must be a substring of `headline` else cleared; tier ids unique. Repair inserts a default pricing section if missing rather than failing.
- `defaults.ts`: `defaultSection(type, variant)` used by editor "Add section" and by repair.
- Forward-compat: `version` + a `migrate(doc)` no-op now, so future block types don't break saved docs.

---

## 4. Styling & the generated-page component library (`src/components/page/`)

**Design system for generated pages** — separate from the app UI.

**Token layer (CSS variables under a `.vp` scope):**
`--vp-bg, --vp-surface, --vp-surface-2, --vp-border, --vp-fg, --vp-fg-muted, --vp-accent, --vp-accent-fg, --vp-accent-soft, --vp-accent-ink, --vp-radius-sm/md/lg/xl, --vp-shadow, --vp-font-display, --vp-font-body`.
Tailwind v4 `@theme` maps these to utilities (`bg-vp-surface`, `text-vp-fg-muted`, `rounded-vp-lg`, `font-vp-display`…) so section components use ordinary Tailwind classes and are theme-agnostic.

**One design system, two modes** (decided 2026-09-12, replacing the earlier multi-preset idea). Reference: Peec AI (`~/Workspace/Resources/saas-designs/Peec.png`).

- Canvas off-white / near-black; **full-height hairline rails** frame a 64rem column; every section after the hero starts with a hairline rule; a fine **hatched band** separates hero copy from the product frame.
- Type: Inter only. Headline 600 / -0.03em, `headlineHighlight` rendered in the faint tone (the grey second line). Section labels are plain small text.
- Buttons: rectangular, 6px radius; primary is ink-on-paper (black in light, white in dark), secondary is bordered surface. No pills except the tiny eyebrow.
- Hero subhead supports up to 3 inline **metric chips** (`hero.props.chips`).
- Product frame: a dense analytics dashboard (`MockUI`: sidebar, filter chips, chart with tooltip, ranked table fed by `mockRows`) sitting flush inside the rails on a grey band.
- `theme = { accent, mode }`. Accent only colours dots, chart lines, chips and the pricing highlight line. `mode` is the default; visitors toggle via `ModeToggle` (persisted in `localStorage['vp-mode']`, applied pre-paint by an inline script in `ThemeScope`). Neutral palettes live in `globals.css` under `.vp` / `.vp[data-mode="dark"]`; accent vars come from `theme/tokens.ts`.

**Primitives:** `Container` (max-w-6xl), `Eyebrow` (quiet pill), `Heading` (with `HighlightedText`), `Button` (primary/secondary/ghost), `MockUI` (fake product window built from `mockRows` so hero visuals never need images), `Icon`.

**Sections:** one file per variant, each `({ props, theme, mode })` where `mode: 'live' | 'preview'`. Preview mode disables the response POST and shows sample progress. `registry.ts` = `{ hero: { centered: HeroCentered, … }, … }`; `PageRenderer` iterates `doc.sections`, skips `hidden`, looks up `registry[type][variant]`, wraps in `ThemeScope`, appends `Footer` ("Built with validate" + privacy line).

**Pricing-intent widget** (`sections/pricing-intent/*`) is a client component: tier cards (or single price) + "I wouldn't pay for this" link → on select: optional email field + submit → thank-you state with follow-up textarea (`followUpQuestion`) → PATCH reason. Visitor id from a first-party cookie (`visitor.ts`) so one visitor = one response per project (upsert on change).

**Motion:** small scroll-reveal via IntersectionObserver hook that's safe on SSR and degrades to visible (no GSAP dep). Respect `prefers-reduced-motion`.

**Dev gallery** `/dev/preview`: 4 hand-written demo docs (one per preset, different idea each) rendered side-by-side with a preset/accent switcher. This is how we iterate on styling before any AI or DB exists.

---

## 5. AI generation (`src/lib/ai/`)

**Interface**
```ts
interface PageGenerator {
  brief(input: IdeaInput): Promise<IdeaBrief>
  document(input: IdeaInput, brief: IdeaBrief): AsyncIterable<DeepPartial<PageDocument>> & { final: Promise<PageDocument> }
  section(ctx: {brief, doc, sectionId, instruction?}): Promise<Section>
}
createGenerator() // AI_PROVIDER: google (default) | anthropic | mock — all use the same AI SDK calls, only the model differs
```

**Inputs:** `IdeaInput { idea (1–3 sentences), audience?, priceHint?, tone?: 'plain'|'bold'|'friendly'|'premium' }`.

**Two-step pipeline** (better copy + reusable context for per-section regenerate):
1. **Brief** (`brief.ts`): small `generateText` + `Output.object(IdeaBriefSchema)` → `{ audience, problem, promise, differentiators[3], objections[3], suggestedTiers[], tone, themePreset, accent, nameIdeas[] }`. Shown to founder in the intake UI for 1-click confirm/edit before the page is built.
2. **Document**: `streamText` + `Output.object(PageDocumentSchema)`; `partialOutputStream` is forwarded as SSE from `/api/generate` so the preview fills in section by section. On completion: `safeParse` → `repair()` → save to `projects.document` + a row in `generations` (model, token usage).
3. **Section regenerate**: `generateText` + `Output.object(SectionSchemaFor(type))` with brief + compact summary of other sections + founder instruction ("shorter", "more concrete").

**Prompting (`prompts.ts`):** one stable system prompt (cacheable): role, the invariants from §3, copy rules (benefit headline ≤ 10 words, audience-named eyebrow, no "unlock/supercharge/seamless", pain points as plain statements, FAQ answers the pricing/refund/timeline objections, tiers anchored to `priceHint`/market norms, `headlineHighlight` is a literal substring), theme guidance (dark default for dev/infra/AI tools, light otherwise; accent blue unless the idea has an obvious colour). Volatile content (idea, brief) goes in the user message.

**Model config (`client.ts`):** `resolveModel()` reads `AI_PROVIDER` (`google` default | `anthropic` | `mock`) and `AI_MODEL` → `google(AI_MODEL ?? 'gemini-2.5-flash')` or `anthropic(AI_MODEL ?? 'claude-sonnet-5')`. Structured output goes through the AI SDK's provider-native JSON-schema mode for both; Zod 4 schemas are kept Gemini-compatible (no `z.record` with dynamic keys, no unions except the `type` discriminator, enums as `z.enum`). `maxOutputTokens` 8k; on schema failure retry once with the Zod issues appended; if still failing, `repair()` the partial. Free-tier Gemini rate limits (RPM) → generation endpoint returns a friendly 429 and the UI offers retry.

**MockGenerator (`mock.ts`):** deterministic (seeded by idea text): derives a product name, picks preset by keywords, fills every section from template banks with the idea's nouns spliced in, streams with small delays to exercise the UI. Passes the same Zod schema, so the renderer/editor can't tell the difference.

---

## 6. Data model & Supabase (`supabase/migrations/0001_init.sql`, applied via MCP `apply_migration`)

```sql
profiles      (id uuid pk references auth.users, display_name, created_at)  -- trigger on auth.users insert
projects      (id uuid pk, owner_id uuid fk, name, slug text unique, status text check in (draft,published,archived),
               idea jsonb, brief jsonb, document jsonb, version int default 1,
               published_at, created_at, updated_at)
generations   (id, project_id fk, kind text (brief|document|section), model, input_tokens, output_tokens, ms, created_at)
page_views    (id bigserial, project_id fk, visitor_id text, referrer, utm jsonb, created_at)
responses     (id uuid, project_id fk, visitor_id text, kind text check in (would_pay, would_not_pay),
               tier_id text, amount_cents int, currency text, email text, reason text,
               referrer, utm jsonb, created_at, updated_at, unique(project_id, visitor_id))
```
Indexes: `projects(owner_id)`, `projects(slug)`, `responses(project_id, created_at)`, `page_views(project_id)`.

**RLS:** enable on all. `profiles`/`projects`/`generations`: owner-only (`auth.uid() = owner_id`). `projects` additionally `select` for anon where `status='published'`. `responses`/`page_views`: **no anon policies**; writes go through route handlers using the service-role client (`supabase/admin.ts`) after validation + rate limiting; owners can `select` their project's rows.

**Auth:** Supabase Auth email + password and magic link (no OAuth provider setup needed). `proxy.ts` refreshes the session cookie and redirects unauthenticated `/app/*` → `/login`. Types generated with the MCP `generate_typescript_types` into `lib/db/types.ts`.

**Env (`.env.example`):** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`, `AI_PROVIDER` (google|anthropic|mock, default google), `AI_MODEL` (optional), `ANTHROPIC_API_KEY` (optional), `NEXT_PUBLIC_APP_URL`. You paste your Gemini key into `.env.local` yourself; I never handle it.

---

## 7. Founder app (shadcn/ui)

- **`/app`** — project cards (status, responses count, would-pay %, "copy link"). Empty state → "Describe your idea".
- **`/app/new`** — textarea + optional fields → "Analyse" → brief card (editable chips for audience/promise/tiers, preset+accent picker prefilled) → "Build page" → right pane shows the live-streaming `PageRenderer` in preview mode → on completion redirects to editor.
- **Editor `/app/projects/[id]/edit`** — three panes:
  - Left: section list (dnd-kit sortable), per-row: eye toggle, variant select, ↻ regenerate (with instruction popover), delete, + add section.
  - Center: `PageRenderer mode="preview"` at desktop/mobile widths, scaled to fit.
  - Right: **schema-driven inspector** — walks the selected section's Zod shape and renders inputs (string → Input, long string → Textarea, enum → Select, boolean → Switch, number → Input, array of objects → repeatable group with add/remove). Theme tab: preset cards + accent swatches. Meta tab: product name, slug, SEO, goal.
  - Autosave: debounced 800ms server action `saveDocument(id, doc, version)` with optimistic-concurrency check on `version`.
  - Top bar: Preview / Publish (slug availability check, confirm dialog) / Unpublish / Copy link.
- **Dashboard `/app/projects/[id]`** — KPI tiles (views, responses, conversion %, would-pay %), **price signal**: distribution bar chart per tier + "wouldn't pay", median stated price, and a **"defensible price"** = tier maximising `count × price` (with a note when n < 10); progress toward `goal` (e.g. 12/25 in 18 days left); responses table (tier, email if given, reason, referrer, time) with CSV export. Charts with Recharts, styled per the dataviz skill.

---

## 8. Public page `/p/[slug]`

Server component: fetch published project by slug (anon client, RLS), render `PageRenderer mode="live"`, `generateMetadata` from `meta`, `opengraph-image.tsx` renders headline + product name on the theme's surface/accent. `revalidateTag('project:'+slug)` on save/publish. Client beacon `POST /api/view` once per visitor per day. `POST /api/respond` validates with Zod, rate-limits per IP (simple in-memory token bucket — swap to Upstash later), upserts on `(project_id, visitor_id)`, returns aggregate counts for the "with-progress" CTA.

---

## 9. Implementation order

| # | Phase | Output | Verify |
|---|---|---|---|
| 0 | Scaffold | `create-next-app@latest validate --ts --tailwind --eslint --app --src-dir --turbopack --use-npm`; `shadcn init` + button/input/textarea/select/switch/dialog/dropdown/tabs/card/badge/table/tooltip/sonner; deps: `ai @ai-sdk/google @ai-sdk/anthropic zod @supabase/ssr @supabase/supabase-js @dnd-kit/core @dnd-kit/sortable recharts nanoid lucide-react`; `.env.example`; git init | `npm run dev` boots |
| 1 | Schema + theme + page library | §3 + §4 fully, 4 demo docs, `/dev/preview` gallery | Screenshot light + dark (desktop+mobile) in the browser pane |
| 2 | AI layer | §5 with Gemini provider + MockGenerator, `/api/generate` SSE, `/app/new` (no auth yet, in-memory) | Gemini: 5 varied ideas all pass Zod + repair (log schema-failure rate); streaming preview fills live; mock path also green |
| 3 | Supabase + auth + persistence | restore `test-project`, migration, RLS, types; login/callback/proxy; projects CRUD; `/app` list; save generation | Sign up → create → reload persists; RLS: anon can't read drafts (checked via `execute_sql` as anon role) |
| 4 | Editor | §7 editor incl. inspector, dnd, regenerate, theme tab, autosave | Edit copy/reorder/variant/theme → reload matches; concurrent-save conflict surfaces toast |
| 5 | Publish + public page + responses | §8, pricing-intent widget live mode, OG image | Publish → open `/p/slug` in a fresh incognito-like tab → respond → row appears; duplicate visitor upserts |
| 6 | Dashboard | §7 dashboard + `pricing-stats.ts` (unit-tested) | Seed 30 fake responses via SQL → KPIs/chart/defensible price correct |
| 7 | Marketing landing + polish | `(marketing)/page.tsx` via the `mercury-tally-landing` skill; loading/empty/error states; `npm run build` clean | Lighthouse ≥ 90 on `/p/[slug]`; `tsc --noEmit`, `next lint`, `next build` pass |

Phase 1 is where "specific styling and components" gets settled — I'll pause after it so you can react to the look before AI/DB work builds on it.

---

## 10. Out of scope for v1 (schema leaves room)

Stripe refundable deposits (`responses.kind` extensible, `amount_cents` already there), A/B variants (a `variants` table pointing at alternate documents), traffic/promotion tools, community showcase & leaderboard, AI summary of "why not" reasons, custom domains, team members.
