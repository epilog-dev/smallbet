import type { IconName, PageDocument, Section } from "@/lib/page-schema";
import { repairDocument } from "@/lib/page-schema";
import type { DocumentStream, GenerationUsage, IdeaBrief, IdeaInput, PageGenerator, SectionContext } from "./types";

/**
 * Deterministic generator for development, tests and keyless demos. Seeded by the idea
 * text so the same input always produces the same page. Streams the document section
 * by section so the intake UI exercises the same path as the real provider.
 */
export class MockGenerator implements PageGenerator {
  readonly name = "mock";

  async brief(input: IdeaInput) {
    const t0 = Date.now();
    await sleep(500);
    return { brief: mockBrief(input), usage: usage(t0) };
  }

  document(input: IdeaInput, brief: IdeaBrief): DocumentStream {
    const t0 = Date.now();
    const full = buildDocument(input, brief);
    const partials = (async function* () {
      const acc: Partial<PageDocument> = { version: 1, meta: full.meta, theme: full.theme, nav: full.nav, goal: full.goal, sections: [] };
      yield structuredClone(acc);
      for (const s of full.sections) {
        await sleep(350);
        acc.sections = [...(acc.sections ?? []), s];
        yield structuredClone(acc);
      }
    })();
    const final = (async () => {
      await sleep(350 * (full.sections.length + 1));
      return { doc: full, usage: usage(t0) };
    })();
    return { partials, final };
  }

  async section(ctx: SectionContext) {
    const t0 = Date.now();
    await sleep(400);
    const current = ctx.doc.sections.find((s) => s.id === ctx.sectionId);
    if (!current) throw new Error("Section not found");
    const suffix = ctx.instruction ? ` (${ctx.instruction.slice(0, 24)})` : " — sharper";
    const next = structuredClone(current) as Section;
    const p = next.props as Record<string, unknown>;
    if (typeof p.title === "string") p.title = tweak(p.title, suffix);
    if (typeof p.headline === "string") {
      p.headline = tweak(p.headline, "");
      p.headlineHighlight = undefined;
    }
    return { section: next, usage: usage(t0) };
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const usage = (t0: number): GenerationUsage => ({ model: "mock", ms: Date.now() - t0 });
const tweak = (s: string, suffix: string) => (s.endsWith(".") ? s.slice(0, -1) : s) + suffix;

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
const pick = <T,>(arr: readonly T[], seed: number, salt = 0) => arr[(seed + salt) % arr.length];

const STOP = new Set(["a", "an", "the", "for", "to", "that", "and", "of", "with", "in", "on", "who", "which", "their", "your", "is", "are", "app", "tool", "platform", "service", "i", "want", "build", "it", "helps", "help", "lets", "let", "people", "users"]);

/** Pull a couple of meaningful nouns out of the idea so copy references it. */
function keywords(idea: string): string[] {
  return idea
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP.has(w))
    .slice(0, 6);
}

function titleCase(s: string) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function mockBrief(input: IdeaInput): IdeaBrief {
  const seed = hash(input.idea);
  const kw = keywords(input.idea);
  const stem = kw[0] ?? "thing";
  const names = [titleCase(stem) + "ly", titleCase(stem.slice(0, 5)) + "base", "Get" + titleCase(stem), titleCase(kw[1] ?? "Signal") + "kit"];
  const audience = input.audience?.trim() || `${pick(["Small teams", "Independent professionals", "Founders", "Operations managers"], seed)} who deal with ${kw[1] ?? stem} every week`;
  const dark = /dev|api|infra|deploy|kubernetes|database|security|ai|agent|crypto|terminal|cli/i.test(input.idea);
  const priceNum = Number((input.priceHint ?? "").replace(/[^\d.]/g, "")) || pick([9, 19, 29, 49], seed, 1);
  const oneTime = /one[- ]time|lifetime|once/i.test(input.priceHint ?? "");
  const tiers = oneTime
    ? [{ name: "Lifetime", price: priceNum, blurb: "One payment, every update" }]
    : [
        { name: "Starter", price: priceNum, blurb: `For one person handling ${stem}` },
        { name: "Team", price: Math.round(priceNum * 2.6), blurb: "For a small team, shared workspace" },
      ];
  return {
    productName: names[0],
    nameIdeas: names.slice(1),
    audience,
    problem: `${titleCase(stem)} is handled by hand today, so it takes hours and still goes wrong.`,
    promise: `Turns ${stem} into a job that finishes itself, with a clear result you can trust.`,
    differentiators: [`Built only for ${stem}, not a general tool`, "Works from what you already have; no migration", "Tells you when it needs a decision, silent otherwise"],
    objections: ["We already have a spreadsheet for this", "I don't trust something new with this", "The price is hard to justify for one person"],
    currency: input.currency ?? "USD",
    interval: oneTime ? "one-time" : "month",
    suggestedTiers: tiers,
    tone: input.tone ?? "plain",
    theme: { accent: pick(["blue", "indigo", "teal", "violet", "emerald"] as const, seed, 2), mode: dark ? "dark" : "light" },
    heroVariant: pick(["centered", "centered", "split"] as const, seed, 3),
  };
}

const ICONS: IconName[] = ["refresh-cw", "bell", "shield-check", "bar-chart-3", "clock", "file-text", "users", "workflow"];

export function buildDocument(input: IdeaInput, brief: IdeaBrief): PageDocument {
  const seed = hash(input.idea);
  const kw = keywords(input.idea);
  const stem = kw[0] ?? "work";
  const name = brief.productName;
  const highlight = pick(["without the busywork", "in half the time", "before it goes wrong"], seed);
  const headline = `${titleCase(stem)} ${highlight}.`;

  const doc: PageDocument = {
    version: 1,
    meta: {
      productName: name,
      tagline: brief.promise.slice(0, 90),
      seoTitle: `${name} — ${titleCase(stem)} ${highlight}`.slice(0, 70),
      seoDescription: `Tell us what you would pay for ${name} before it is built. Nothing is charged.`.slice(0, 160),
    },
    theme: brief.theme,
    nav: { logoText: name, ctaLabel: "See pricing" },
    goal: { targetResponses: 25, deadlineDays: 30 },
    sections: [
      {
        id: "hero",
        type: "hero",
        variant: brief.heroVariant,
        hidden: false,
        props: {
          eyebrow: `For ${brief.audience.charAt(0).toLowerCase()}${brief.audience.slice(1)}`.slice(0, 60),
          headline,
          headlineHighlight: highlight,
          subheadline: `${name} takes ${stem} off your plate and hands back a finished result, covering`,
          chips: [titleCase(kw[1] ?? "Setup"), titleCase(kw[2] ?? "Tracking"), "Reporting"],
          primaryCta: "See pricing",
          secondaryCta: "How it works",
          visual: {
            kind: pick(["dashboard", "list", "mobile"] as const, seed, 4),
            title: name,
            headline: `${titleCase(stem)} · this week · 2 need a decision`,
            nav: ["Overview", titleCase(kw[1] ?? "Items"), titleCase(kw[2] ?? "Activity"), "Reports", "Settings"],
            tabs: ["This week", "Last 30 days"],
            series: ["Completed", "Pending", "Errors"],
            axis: "weeks",
            actions: [`New ${stem.replace(/s$/, "")}`],
            rows: [
              { label: "Completed", value: "42", tone: "positive" },
              { label: "Needs a decision", value: "2", tone: "accent" },
              { label: "Time saved", value: "6.5 h", tone: "positive" },
              { label: "Errors caught", value: "3", tone: "neutral" },
            ],
          },
        },
      },
      {
        id: "problem",
        type: "problem",
        variant: "cards",
        hidden: false,
        props: {
          title: `${titleCase(stem)} is the work you didn't sign up for`,
          items: [
            { title: "It takes an evening", description: brief.problem },
            { title: "Nobody trusts the result", description: "Every number gets double-checked by hand, which is the same work twice." },
            { title: "It never stays done", description: "Next week it is back, slightly different, with the same questions." },
          ],
        },
      },
      {
        id: "features",
        type: "features",
        variant: "grid",
        hidden: false,
        props: {
          title: `What ${name} does for you`,
          subtitle: `Built for ${brief.audience.toLowerCase()}, not a whole department.`,
          items: brief.differentiators.slice(0, 3).map((d, i) => ({
            icon: ICONS[(seed + i) % ICONS.length],
            title: d.split(",")[0].split(";")[0].slice(0, 50),
            description: `${d}. You see the result, not the process.`.slice(0, 180),
          })).concat([
            { icon: "bell", title: "Only the questions that matter", description: "If something is genuinely ambiguous you get one message. Everything else is silent." },
            { icon: "shield-check", title: "Nothing moves without you", description: `${name} can read your ${stem} data. It never changes anything without an explicit approval.` },
            { icon: "file-text", title: "A record you can forward", description: "Every run ends in a short summary you can send to whoever asks." },
          ]),
        },
      },
      {
        id: "steps",
        type: "steps",
        variant: "numbered",
        hidden: false,
        props: {
          title: "Set up once, then forget it",
          items: [
            { title: "Connect", description: `Point ${name} at where your ${stem} lives. About four minutes.` },
            { title: "Approve the first run", description: "Confirm or correct the first pass. That becomes the rulebook." },
            { title: "Get the result", description: "From then on you receive the finished output and a short list of anything that needs you." },
          ],
        },
      },
      {
        id: "pricing",
        type: "pricing-intent",
        variant: brief.suggestedTiers.length === 1 ? "single-price" : "tiers",
        hidden: false,
        props: {
          title: `What would you pay for ${stem} that does itself?`,
          subtitle: `${name} isn't built yet. Your honest answer decides whether it gets built and what it costs. Nothing is charged.`,
          currency: brief.currency,
          interval: brief.interval,
          tiers: brief.suggestedTiers.map((t, i) => ({
            id: t.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            name: t.name,
            price: t.price,
            blurb: t.blurb,
            features: i === 0 ? ["Core automation", "Weekly summary", "Email support"] : ["Everything in the first tier", "Shared workspace", "Priority questions", "Export"],
          })),
          highlightedTierId: brief.suggestedTiers[Math.min(1, brief.suggestedTiers.length - 1)].name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          ctaLabel: "I'd pay this",
          noPayLabel: "I wouldn't pay for this",
          askEmail: true,
          followUpQuestion: `What would make ${name} a must-have for you?`,
        },
      },
      {
        id: "faq",
        type: "faq",
        variant: "accordion",
        hidden: false,
        props: {
          title: "Questions",
          items: [
            { question: `Is ${name} available today?`, answer: "No. This page exists to find out whether it should be. If enough people say they'd pay, we build it and email you first." },
            { question: "Am I committing to anything?", answer: "No. Picking a price is a signal, not a purchase. There's no card, no account, and you can change your answer." },
            ...brief.objections.slice(0, 3).map((o) => ({ question: o.endsWith("?") ? o : `${o}?`.replace(/^([a-z])/, (c) => c.toUpperCase()), answer: `Fair. ${name} is meant to earn that: it works alongside what you have today, and the first run is fully reviewable before anything is relied on.` })),
          ],
        },
      },
      {
        id: "cta",
        type: "cta-band",
        variant: "with-progress",
        hidden: false,
        props: { headline: `Help decide if ${name} gets built`, subheadline: "Thirty seconds. No card, no signup.", ctaLabel: "Pick a price" },
      },
    ],
  };
  return repairDocument(doc);
}
