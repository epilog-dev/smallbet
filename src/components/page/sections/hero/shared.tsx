import { VpLinkButton } from "../../primitives/Button";
import { Doodle } from "../../primitives/Doodle";
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
      <p className="mt-3 text-sm text-vp-muted">Takes 30 seconds · No card · No signup</p>
    </div>
  );
}

export function HeroVisual({ props, className }: { props: HeroProps; className?: string }) {
  if (props.visual.kind === "none") return null;
  if (props.visual.kind === "abstract") return <AbstractVisual className={className} />;
  return <MockUI title={props.visual.mockTitle} rows={props.visual.mockRows} className={className} />;
}

/** Soft gradient wash behind the hero (editorial) or accent glow (bold). */
export function HeroBackdrop({ ctx }: { ctx: PageContextValue }) {
  const { flags } = ctx.preset;
  if (flags.wash) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[760px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-vp-accent-soft via-vp-accent-soft/30 to-transparent" />
        <div className="absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-vp-accent/15 blur-3xl" />
      </div>
    );
  }
  if (flags.glow) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[640px] overflow-hidden">
        <div className="absolute left-1/2 top-[-18rem] size-[40rem] -translate-x-1/2 rounded-full bg-vp-accent/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,var(--vp-bg))]" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(var(--vp-fg) 1px, transparent 1px), linear-gradient(90deg, var(--vp-fg) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at top, black, transparent 70%)",
          }}
        />
      </div>
    );
  }
  if (flags.blobs) {
    return (
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[700px] overflow-hidden">
        <div className="absolute -left-20 top-10 size-72 rounded-full bg-vp-accent/20 blur-3xl" />
        <div className="absolute right-[-4rem] top-32 size-80 rounded-full bg-vp-accent-soft blur-3xl" />
      </div>
    );
  }
  return null;
}

export function HeroDoodles({ ctx }: { ctx: PageContextValue }) {
  if (!ctx.preset.flags.doodles) return null;
  return (
    <>
      <Doodle kind="bubble" className="left-[4%] top-[22%] hidden w-14 -rotate-[8deg] text-vp-fg/25 lg:block" />
      <Doodle kind="arrow" className="left-[13%] top-[54%] hidden w-16 text-vp-fg/25 xl:block" />
      <Doodle kind="sparkle" className="right-[7%] top-[20%] hidden w-9 text-vp-accent lg:block" />
      <Doodle kind="loop" className="right-[12%] top-[58%] hidden w-20 text-vp-fg/20 xl:block" />
    </>
  );
}
