import { VpLinkButton } from "./primitives/Button";
import { Container } from "./primitives/Container";
import type { PageContextValue } from "./types";

export function Nav({ ctx }: { ctx: PageContextValue }) {
  const { nav } = ctx.doc;
  return (
    <header className="sticky top-0 z-30 bg-vp-bg/70 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between">
        <a href="#top" className="flex items-center gap-2 text-[15px] font-semibold tracking-tight text-vp-fg">
          <span aria-hidden className="size-2 rounded-full bg-vp-accent" />
          {nav.logoText}
        </a>
        <VpLinkButton href={`#${ctx.pricingAnchor}`} size="sm">
          {nav.ctaLabel}
        </VpLinkButton>
      </Container>
    </header>
  );
}
