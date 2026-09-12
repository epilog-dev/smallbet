import { VpLinkButton } from "./primitives/Button";
import { Container } from "./primitives/Container";
import { ModeToggle } from "./theme/ModeToggle";
import type { PageContextValue } from "./types";

const LINKS: Array<[type: string, label: string]> = [
  ["steps", "How it works"],
  ["features", "Features"],
  ["pricing-intent", "Pricing"],
  ["faq", "FAQ"],
];

export function Nav({ ctx }: { ctx: PageContextValue }) {
  const { nav, sections } = ctx.doc;
  const links = LINKS.map(([type, label]) => {
    const s = sections.find((x) => x.type === type && !x.hidden);
    return s ? { href: `#${s.id}`, label } : null;
  }).filter(Boolean) as Array<{ href: string; label: string }>;

  return (
    <header className="sticky top-0 z-30 border-b border-vp-border bg-vp-bg/80 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between">
        <a href="#top" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-vp-fg">
          <span aria-hidden className="grid size-4 grid-cols-2 gap-px overflow-hidden rounded-[3px]">
            <span className="bg-vp-fg" />
            <span className="bg-vp-fg/40" />
            <span className="bg-vp-fg/40" />
            <span className="bg-vp-fg" />
          </span>
          {nav.logoText}
        </a>
        <nav className="hidden items-center gap-6 text-sm text-vp-muted md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-vp-fg">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle rootId={ctx.rootId} initial={ctx.theme.mode} persist={ctx.mode === "live"} />
          <VpLinkButton href={`#${ctx.pricingAnchor}`} size="md">
            {nav.ctaLabel}
          </VpLinkButton>
        </div>
      </Container>
    </header>
  );
}
