import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PageRenderer } from "@/components/page/PageRenderer";
import { ScaledPreview } from "@/components/app/ScaledPreview";
import { DEMO_DOCS } from "@/lib/demo/docs";
import { getUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { absolute: "validate — find out what people would pay, before you build it" },
  description: "Describe your idea. Get a landing page that asks visitors what they'd pay. Read the answer in numbers, not vibes.",
};

const STEPS = [
  { t: "Describe the idea", d: "One to three sentences. The AI turns it into a brief you confirm: audience, problem, promise, price points." },
  { t: "Get a page in a minute", d: "A finished validation page, written for your audience, on a design you don't have to fight. Edit anything." },
  { t: "Share the link", d: "Visitors pick the price they'd pay or say they wouldn't. Thirty seconds, no signup, no card." },
  { t: "Read the answer", d: "Answers, would-pay rate, median stated price and the tier that maximises revenue — with an honest sample-size warning." },
];

const FEATURES = [
  ["Price intent, not email intent", "Every visitor is asked a price. A stated price beats a waitlist signup as a signal — and 'I wouldn't pay' counts too."],
  ["Written from a brief you approve", "The AI reads the idea, proposes audience, problem and tiers. You correct it before a word of copy is written."],
  ["Pages that don't look generated", "One considered design system, light or dark. Real sections, real hierarchy, a product frame that carries the page."],
  ["Editable to the word", "Every section is a form. Reorder, hide, switch layouts, or ask the AI to rewrite one section with an instruction."],
  ["Reasons, not just counts", "After answering, visitors are asked what would make it a must-have — or why they wouldn't pay. That text is the real learning."],
  ["A defensible number", "Median stated price, distribution by tier and the revenue-maximising tier, plus progress toward your goal and deadline."],
];

const FAQ = [
  ["Is a stated price a real signal?", "It's a much stronger one than an email address. It isn't a purchase — deposits are on the roadmap — but combined with the 'why' answers it tells you far more than a waitlist does."],
  ["Do I need a domain or a design?", "No. Your page lives at validate's address and comes out designed. Custom domains are planned."],
  ["What does it cost?", "Free while we're in early access. We'll say clearly before anything changes."],
  ["Who sees my idea?", "Only people you send the link to. Pages aren't listed anywhere and drafts are private to your account."],
];

export default async function LandingPage() {
  const user = await getUser();
  const demo = DEMO_DOCS.ledgerly;

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      {/* rails */}
      <div aria-hidden className="pointer-events-none absolute inset-0 mx-auto hidden max-w-5xl lg:block">
        <div className="absolute inset-y-0 left-0 w-px bg-border" />
        <div className="absolute inset-y-0 right-0 w-px bg-border" />
      </div>

      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
            <span aria-hidden className="grid size-4 grid-cols-2 gap-px overflow-hidden rounded-[3px]">
              <span className="bg-foreground" />
              <span className="bg-foreground/40" />
              <span className="bg-foreground/40" />
              <span className="bg-foreground" />
            </span>
            validate
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
            <a href="#features" className="hover:text-foreground">
              What you get
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/app" className="inline-flex h-9 items-center rounded-md bg-foreground px-3.5 text-sm font-medium text-background hover:bg-foreground/90">
                Open app
              </Link>
            ) : (
              <>
                <Link href="/login" className="inline-flex h-9 items-center rounded-md border border-border bg-background px-3.5 text-sm font-medium hover:bg-muted">
                  Log in
                </Link>
                <Link href="/login" className="inline-flex h-9 items-center rounded-md bg-foreground px-3.5 text-sm font-medium text-background hover:bg-foreground/90">
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* hero */}
      <section className="relative pt-20 sm:pt-28">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-5 text-center sm:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-[13px] font-medium shadow-[0_1px_0_rgba(0,0,0,0.03)]">
            <span className="size-1.5 rounded-full bg-blue-600" /> Early access · free
          </span>
          <h1 className="mt-6 max-w-[20ch] text-[2.5rem] font-semibold leading-[1.08] tracking-[-0.03em] text-balance sm:text-[3.25rem] sm:leading-[1.06] lg:text-[3.75rem] lg:leading-[1.05]">
            Find out what people would pay <span className="text-muted-foreground/70">before you build it.</span>
          </h1>
          <p className="mt-6 max-w-[36rem] text-[1.05rem] leading-relaxed text-muted-foreground text-pretty sm:text-[1.1rem]">
            Describe the idea. Get a landing page that asks visitors what they&apos;d pay. Read the answer as numbers and reasons — not signups.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            <a href="#how" className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-background px-4 text-sm font-medium hover:bg-muted">
              <span className="size-2.5 rounded-[2px] bg-muted-foreground/50" /> How it works
            </a>
            <Link href={user ? "/app/new" : "/login?next=/app/new"} className="inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90">
              Describe your idea <ArrowRight className="size-4" />
            </Link>
          </div>
          <p className="mt-4 text-[13px] text-muted-foreground">A page in about a minute · No card</p>
        </div>

        <div aria-hidden className="mt-12 h-14 w-full border-y border-border [background-image:repeating-linear-gradient(90deg,rgba(0,0,0,0.06)_0_1px,transparent_1px_6px)]" />

        <div className="mx-auto max-w-5xl">
          <div className="border-b border-border bg-muted/50 p-2 sm:p-3">
            <div className="overflow-hidden rounded-lg border border-border bg-background shadow-[0_24px_60px_-36px_rgba(0,0,0,0.25)]">
              <ScaledPreview width={1280}>
                <div className="max-h-[720px] overflow-hidden">
                  <PageRenderer doc={demo} mode="preview" noReveal />
                </div>
              </ScaledPreview>
            </div>
            <p className="px-2 pt-2 text-center text-xs text-muted-foreground">A page validate wrote from one sentence. Every word is editable.</p>
          </div>
        </div>
      </section>

      {/* how */}
      <section id="how" className="border-b border-border py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">How it works</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.25rem]">From idea to answer in four steps</h2>
          </div>
          <ol className="mt-14 grid gap-10 border-t border-border pt-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((s, i) => (
              <li key={i} className="lg:border-l lg:border-border lg:pl-6 lg:first:border-l-0 lg:first:pl-0">
                <span className="inline-flex size-7 items-center justify-center rounded-full border border-border bg-background text-xs font-medium tabular-nums">{i + 1}</span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight">{s.t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* features */}
      <section id="features" className="border-b border-border py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">What you get</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.25rem]">Built to get you a number you can defend</h2>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(([t, d]) => (
              <div key={t} className="rounded-[10px] border border-border bg-card p-6">
                <div className="mb-5 inline-flex size-9 items-center justify-center rounded-md border border-border bg-muted">
                  <Check className="size-4" strokeWidth={1.75} />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* faq */}
      <section id="faq" className="border-b border-border py-20 sm:py-24">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">FAQ</p>
            <h2 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[2.25rem]">Questions</h2>
          </div>
          <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
            {FAQ.map(([q, a], i) => (
              <details key={q} className="group px-6" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-medium [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="relative overflow-hidden rounded-xl bg-foreground px-8 py-14 text-center text-background sm:px-14">
            <div aria-hidden className="absolute -right-16 -top-16 size-72 rounded-full bg-blue-500/40 blur-3xl" />
            <h2 className="relative text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">Stop guessing. Ask.</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-base opacity-80">Your first page takes about a minute.</p>
            <div className="relative mt-8">
              <Link href={user ? "/app/new" : "/login?next=/app/new"} className="inline-flex h-10 items-center gap-2 rounded-md bg-background px-4 text-sm font-medium text-foreground hover:bg-background/90">
                Describe your idea <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 px-5 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-8">
          <p>© {new Date().getFullYear()} validate</p>
          <p className="flex items-center gap-4">
            <Link href="/login" className="hover:text-foreground">
              Log in
            </Link>
            <a href="#how" className="hover:text-foreground">
              How it works
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
