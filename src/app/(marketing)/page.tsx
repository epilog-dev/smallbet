import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { AnswerCard, type AnswerExample } from "@/components/marketing/AnswerCard";
import { PageThumb } from "@/components/marketing/PageThumb";
import { TryTheQuestion } from "@/components/marketing/TryTheQuestion";
import { ThemeToggle } from "@/components/app/ThemeToggle";
import { SmallbetLogo } from "@/components/brand/Logo";
import { DEMO_DOCS } from "@/lib/demo/docs";
import { getUser } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: { absolute: "smallbet — get a price, not a waitlist" },
  description: "Describe your idea. Get a page that asks visitors what they'd pay, and a number you can plan around.",
};

const EXAMPLE: AnswerExample = {
  product: "Ledgerly",
  price: "$39",
  per: "/mo",
  tier: "Pro",
  answers: 41,
  wouldPay: 28,
  median: "$39",
  days: 9,
  buckets: [
    { label: "Hobby", price: "$9", count: 2 },
    { label: "Solo", price: "$19", count: 8 },
    { label: "Pro", price: "$39", count: 13, highlight: true },
    { label: "With accountant", price: "$79", count: 4 },
    { label: "Studio", price: "$149", count: 1 },
    { label: "Wouldn't pay", count: 13, no: true },
  ],
  reasons: [
    { kind: "yes", text: "If it actually reconciles Stripe payouts I'd switch tomorrow." },
    { kind: "no", text: "My accountant already does this for a flat fee." },
    { kind: "yes", text: "$39 is less than one hour of my time each month." },
  ],
};

const CONTRAST: Array<{ label: string; waitlist: string; price: string }> = [
  { label: "What it costs the visitor", waitlist: "Nothing. An email they already give everyone.", price: "A small commitment: picking a number they'd stand behind." },
  { label: "What it tells you", waitlist: "Someone was curious for a second.", price: "Whether there's demand, and roughly where it breaks." },
  { label: "What a 'no' looks like", waitlist: "Silence. You never hear from the 95% who bounced.", price: "\"I wouldn't pay for this\" — and one line on why." },
  { label: "What you do with it", waitlist: "Email a list that mostly won't open.", price: "Pick a price, or kill the idea, with numbers to point at." },
];

const NOT = [
  ["Not a purchase.", "Nobody is charged. A stated price is a strong signal, not a contract — and we say so on every page."],
  ["Not traffic.", "You bring the visitors. smallbet makes sure each one is asked the one question that matters, and that you can read the answers."],
  ["Not a verdict.", "Under ten answers the dashboard tells you it's a hint, not a result. It never dresses up thin data."],
];

export default async function LandingPage() {
  const user = await getUser();
  const demo = DEMO_DOCS.ledgerly;
  const start = user ? "/app/new" : "/login?next=/app/new";

  return (
    <div data-smooth-scroll className="relative min-h-dvh bg-background text-foreground [&_section[id]]:scroll-mt-14">
      <div aria-hidden className="pointer-events-none absolute inset-0 mx-auto hidden max-w-5xl lg:block">
        <div className="absolute inset-y-0 left-0 w-px bg-border" />
        <div className="absolute inset-y-0 right-0 w-px bg-border" />
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center text-[15px]">
            <SmallbetLogo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#try" className="hover:text-foreground">
              Try the question
            </a>
            <a href="#why" className="hover:text-foreground">
              Why a price
            </a>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#plans" className="hover:text-foreground">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Link href="/app" className="inline-flex h-9 items-center rounded-vp-md bg-cta px-3.5 text-sm font-medium text-cta-foreground hover:bg-cta-hover">
                Open app
              </Link>
            ) : (
              <>
                <Link href="/login" className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3.5 text-sm font-medium hover:bg-muted">
                  Log in
                </Link>
                <Link href={start} className="inline-flex h-9 items-center rounded-vp-md bg-cta px-3.5 text-sm font-medium text-cta-foreground hover:bg-cta-hover">
                  Price my idea
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ---------- hero: the answer ---------- */}
      <section className="relative pt-16 sm:pt-24">
        <div className="mx-auto grid max-w-5xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[13px] font-medium shadow-[0_1px_0_rgba(0,0,0,0.03)]">
              <span className="size-1.5 rounded-full bg-foreground" /> For founders with an idea and no proof
            </span>
            <h1 className="mt-6 max-w-[14ch] text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.03em] text-balance sm:text-[3.25rem] sm:leading-[1.06] lg:text-[3.6rem] lg:leading-[1.05]">
              Get a price, <span className="text-muted-foreground/70">not a waitlist.</span>
            </h1>
            <p className="mt-6 max-w-[32rem] text-[1.05rem] leading-relaxed text-muted-foreground text-pretty sm:text-[1.1rem]">
              Describe your idea in a sentence. smallbet writes a page that asks visitors what they&apos;d pay — or whether they&apos;d pay at all — and turns the
              answers into a number you can plan around.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <Link href={start} className="inline-flex h-10 items-center gap-2 rounded-vp-md bg-cta px-4 text-sm font-medium text-cta-foreground hover:bg-cta-hover">
                Price my idea <ArrowRight className="size-4" />
              </Link>
              <a href="#try" className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted">
                <span className="size-2.5 rounded-[2px] bg-muted-foreground/50" /> Try the question
              </a>
            </div>
            <p className="mt-4 text-[13px] text-muted-foreground">Free during early access · Your first page takes about a minute</p>
          </div>
          <AnswerCard ex={EXAMPLE} />
        </div>

        <div aria-hidden className="mt-16 h-14 w-full border-y border-border [background-image:repeating-linear-gradient(90deg,color-mix(in_oklab,var(--foreground)_8%,transparent)_0_1px,transparent_1px_6px)]" />
      </section>

      {/* ---------- try the question ---------- */}
      <section id="try" className="border-b border-border py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">Try the question</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.25rem]">Your visitors are asked exactly one thing.</h2>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-muted-foreground">
              This is the whole ask, lifted from a real page. Tap a price or say no, and see how everyone else answered. Nothing here is recorded — thirty seconds, no form, no signup.
            </p>
          </div>
          <div className="mt-10">
            <TryTheQuestion doc={demo} />
          </div>
        </div>
      </section>

      {/* ---------- why a price ---------- */}
      <section id="why" className="border-b border-border py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm text-muted-foreground">Why a price</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.25rem]">A waitlist tells you people are curious. A price tells you if they&apos;re serious.</h2>
          </div>
          <div className="mt-12 overflow-hidden rounded-xl border border-border">
            <div className="hidden grid-cols-[1fr_1.2fr_1.2fr] border-b border-border bg-muted/50 text-xs font-medium text-muted-foreground sm:grid">
              <div className="px-4 py-3" />
              <div className="px-4 py-3">A waitlist signup</div>
              <div className="px-4 py-3 text-foreground">A stated price</div>
            </div>
            {CONTRAST.map((row) => (
              <div key={row.label} className="grid border-b border-border text-sm last:border-b-0 sm:grid-cols-[1fr_1.2fr_1.2fr]">
                <div className="px-4 pt-4 font-medium sm:py-4">{row.label}</div>
                <div className="px-4 pt-2 text-muted-foreground sm:py-4">
                  <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 sm:hidden">Waitlist</span>
                  {row.waitlist}
                </div>
                <div className="px-4 pt-2 pb-4 sm:py-4">
                  <span className="mb-0.5 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 sm:hidden">Stated price</span>
                  {row.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- how: one sentence in, a number out ---------- */}
      <section id="how" className="border-b border-border py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">How it works</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.25rem]">One sentence in. A number out.</h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {/* 1 */}
            <div className="flex flex-col">
              <div className="flex-1 rounded-xl border border-border bg-card p-5">
                <p className="text-[11px] font-medium text-muted-foreground">What you type</p>
                <p className="mt-3 text-[15px] leading-relaxed">
                  “Bookkeeping that closes itself for solo consultants — reads the bank feed and invoices, categorises every line, sends a finished P&amp;L on the
                  1st.”
                </p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-md border border-border bg-background p-2.5">
                    <p className="text-muted-foreground">Audience</p>
                    <p className="mt-0.5 font-medium">Solo consultants who bill hourly</p>
                  </div>
                  <div className="rounded-md border border-border bg-background p-2.5">
                    <p className="text-muted-foreground">Price points</p>
                    <p className="mt-0.5 font-medium tabular-nums">$9 · 19 · 39 · 79 · 149 /mo</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">1 · Describe it.</span> You get a one-screen brief back — audience, problem, promise, price points — and
                correct it before a word of copy is written.
              </p>
            </div>
            {/* 2 */}
            <div className="flex flex-col">
              <div className="flex-1">
                <PageThumb doc={demo} maxHeight={300} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">2 · Get the page.</span> Written for your audience, in your colours, light or dark. Visitors pick the price
                they&apos;d pay from a ladder — or say no — and see how everyone else answered.
              </p>
            </div>
            {/* 3 */}
            <div className="flex flex-col">
              <div className="flex-1 rounded-xl border border-border bg-card p-5">
                <p className="text-[11px] font-medium text-muted-foreground">What you get back</p>
                <p className="mt-3 text-4xl font-semibold tracking-[-0.03em] tabular-nums">
                  $39<span className="text-base font-normal text-muted-foreground">/mo</span>
                </p>
                <dl className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  {[
                    ["Answers", "41"],
                    ["Would pay", "68%"],
                    ["Median", "$39"],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-md border border-border bg-background p-2.5">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="mt-0.5 text-base font-semibold tabular-nums">{v}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 text-xs text-muted-foreground">+ every reason, in the visitor&apos;s words, exportable.</p>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">3 · Share the link.</span> Answers land on your dashboard as they come in: how many picked each price, the
                median, the defensible price, and the reasons behind every no.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- what this isn't ---------- */}
      <section className="border-b border-border py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm text-muted-foreground">Straight answers</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.25rem]">What this isn&apos;t.</h2>
          </div>
          <div className="mt-10 grid gap-8 border-t border-border pt-10 sm:grid-cols-3">
            {NOT.map(([t, d]) => (
              <div key={t}>
                <h3 className="text-lg font-semibold tracking-tight">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- pricing ---------- */}
      <section id="plans" className="border-b border-border py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm text-muted-foreground">Pricing</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.25rem]">Free while we get this right.</h2>
            <p className="mt-4 text-[1.05rem] leading-relaxed text-muted-foreground">
              During early access everything is free — every page, every answer, no limits. Here is what it will cost once we start charging, so nothing surprises
              you later. Pages you make now keep Pro for three months after that.
            </p>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <PriceCard
              name="Free"
              price="$0"
              blurb="One honest test."
              items={["1 live page at a time", "Live for 14 days", "25 answers", "The full result: chart, median, defensible price, reasons, emails", "\"Built with smallbet\" on the page"]}
            />
            <PriceCard
              name="Keep it up"
              price="$29"
              per="/ year, per page"
              blurb="Keep one page live and collecting."
              highlight
              items={["That page stays live", "500 answers", "Weekly email digest", "CSV export", "One-off — no subscription"]}
            />
            <PriceCard
              name="Pro"
              price="$29"
              per="/ month"
              blurb="For people who test ideas often."
              items={["Unlimited pages and answers", "No smallbet footer", "Instant answer notifications", "Unlimited AI rewrites", "CSV export"]}
            />
          </div>

          <p className="mt-8 text-sm text-muted-foreground">
            Nothing is ever locked. The free tier gets the complete result for one 14-day test; you pay for time and volume, not for seeing your own data.
          </p>
        </div>
      </section>

      {/* ---------- cta ---------- */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          {/* Same treatment as a generated page's cta-band/Simple, with the accent being ink. */}
          <div
            className="relative overflow-hidden rounded-vp-xl border border-border px-8 py-14 text-center sm:px-14"
            style={{ background: "radial-gradient(70% 120% at 50% 0%, color-mix(in oklab, var(--foreground) 22%, var(--card)) 0%, var(--card) 70%)" }}
          >
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,var(--foreground),transparent)]" />
            <h2 className="relative text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Put a price on it.</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-base text-muted-foreground">A week of answers beats a year of wondering. Your first page takes about a minute.</p>
            <div className="relative mt-8">
              <Link href={start} className="inline-flex h-10 items-center gap-2 rounded-vp-md bg-cta px-4 text-sm font-medium text-cta-foreground hover:bg-cta-hover">
                Price my idea <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-8">
          <p>© {new Date().getFullYear()} smallbet</p>
          <p className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <a href="#try" className="hover:text-foreground">
              Try the question
            </a>
            <a href="#plans" className="hover:text-foreground">
              Pricing
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function PriceCard({ name, price, per, blurb, items, highlight }: { name: string; price: string; per?: string; blurb: string; items: string[]; highlight?: boolean }) {
  return (
    <div className={cn("relative rounded-xl border bg-card p-6", highlight ? "border-foreground" : "border-border")}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{name}</p>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">Free for now</span>
      </div>
      <p className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold tracking-[-0.03em] tabular-nums">{price}</span>
        {per && <span className="text-sm text-muted-foreground">{per}</span>}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it} className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={2.5} aria-hidden />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
