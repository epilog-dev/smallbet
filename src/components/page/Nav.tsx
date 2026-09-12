import { VpLinkButton } from "./primitives/Button";
import { Container } from "./primitives/Container";
import type { PageContextValue } from "./types";

export function Nav({ ctx }: { ctx: PageContextValue }) {
  const { nav } = ctx.doc;
  return (
    <header className="sticky top-0 z-30 border-b border-vp-border/60 bg-vp-bg/75 backdrop-blur-md">
      <Container className="flex h-14 items-center justify-between">
        <a href="#top" className="vp-display flex items-center gap-2 text-lg text-vp-fg">
          <span aria-hidden className="size-2.5 rounded-sm bg-vp-accent" />
          {nav.logoText}
        </a>
        <VpLinkButton href={`#${ctx.pricingAnchor}`} size="md">
          {nav.ctaLabel}
        </VpLinkButton>
      </Container>
    </header>
  );
}
