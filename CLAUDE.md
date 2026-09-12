# smallbet (repo: validate)

AI idea-validation platform: founder describes an idea → AI builds a typed `PageDocument` → React renders it from a section registry → published page collects price-intent responses → dashboard.

- Plan of record: `docs/PLAN.md`
- Page schema (source of truth for AI, editor, renderer): `src/lib/page-schema/`
- Generated-page component library (themed via `--vp-*` CSS vars, never shadcn): `src/components/page/`
- Founder app UI uses shadcn/ui in `src/components/ui` + `src/components/app`
- AI layer: `src/lib/ai/` (Vercel AI SDK, provider chosen by `AI_PROVIDER`)
- Env vars: see `.env.example`; secrets live in `.env.local` (git-ignored)

Commands: `npm run dev`, `npm run build`, `npm run lint`, `npx tsc --noEmit`
