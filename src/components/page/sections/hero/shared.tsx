import { VpLinkButton } from "../../primitives/Button";
import { AbstractVisual, MockUI } from "../../primitives/MockUI";
import type { HeroProps } from "@/lib/page-schema";
import type { PageContextValue } from "../../types";

export function HeroCtas({ props, ctx, align = "center" }: { props: HeroProps; ctx: PageContextValue; align?: "center" | "start" }) {
  return (
    <div data-reveal style={{ transitionDelay: "120ms" }} className={align === "center" ? "flex flex-col items-center" : "flex flex-col items-start"}>
      <div className={`flex flex-wrap gap-3 ${align === "center" ? "justify-center" : ""}`}>
        <VpLinkButton href={`#${ctx.pricingAnchor}`} size="lg">
          {props.primaryCta}
        </VpLinkButton>
        {props.secondaryCta && (
          <VpLinkButton href="#how" variant="secondary" size="lg">
            {props.secondaryCta}
          </VpLinkButton>
        )}
      </div>
      <p className="mt-4 text-[13px] text-vp-muted">Takes 30 seconds · No card · No signup</p>
    </div>
  );
}

export function HeroVisual({ props, className }: { props: HeroProps; className?: string }) {
  if (props.visual.kind === "none") return null;
  if (props.visual.kind === "abstract") return <AbstractVisual className={className} />;
  return <MockUI title={props.visual.mockTitle} rows={props.visual.mockRows} className={className} />;
}

/**
 * Atmospheric hero background, one per preset:
 * aurora — two blurred hue blobs on black · wash — radial accent tint on a light canvas ·
 * rails — hairline guide lines at the container edges · bloom — warm glow low in the hero.
 */
export function HeroBackdrop({ ctx }: { ctx: PageContextValue }) {
  switch (ctx.preset.backdrop) {
    case "aurora":
      return (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[820px] overflow-hidden">
          <div
            className="absolute left-1/2 top-[-22rem] h-[52rem] w-[80rem] -translate-x-1/2 rounded-[100%] opacity-70 blur-[90px]"
            style={{
              background:
                "radial-gradient(closest-side, oklch(0.55 0.2 var(--vp-accent-hue) / 0.55), transparent 70%)",
            }}
          />
          <div
            className="absolute left-[62%] top-[-8rem] h-[36rem] w-[44rem] -translate-x-1/2 rounded-[100%] opacity-60 blur-[100px]"
            style={{
              background:
                "radial-gradient(closest-side, oklch(0.6 0.18 var(--vp-accent-hue-2) / 0.5), transparent 70%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(to_bottom,transparent,var(--vp-bg))]" />
        </div>
      );
    case "wash":
      return (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[780px] overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 60% at 50% 0%, oklch(0.9 0.07 var(--vp-accent-hue) / 0.9), transparent 70%), radial-gradient(45% 45% at 78% 25%, oklch(0.92 0.06 var(--vp-accent-hue-2) / 0.6), transparent 70%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(to_bottom,transparent,var(--vp-bg))]" />
        </div>
      );
    case "bloom":
      return (
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[820px] overflow-hidden">
          <div
            className="absolute inset-x-0 bottom-0 h-[70%]"
            style={{
              background:
                "radial-gradient(55% 60% at 50% 100%, oklch(0.82 0.12 var(--vp-accent-hue) / 0.75), transparent 72%), radial-gradient(35% 45% at 25% 100%, oklch(0.85 0.1 var(--vp-accent-hue-2) / 0.5), transparent 70%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_bottom,transparent,var(--vp-bg))]" />
        </div>
      );
    case "rails":
    default:
      return null;
  }
}

/** Vertical hairlines at the container edges (paper preset only, shown via `.vp-rails` CSS). */
export function Rails() {
  return (
    <div aria-hidden className="vp-rails pointer-events-none absolute inset-y-0 left-0 right-0 mx-auto max-w-6xl">
      <div className="absolute inset-y-0 left-0 w-px bg-vp-border sm:left-4" />
      <div className="absolute inset-y-0 right-0 w-px bg-vp-border sm:right-4" />
    </div>
  );
}
