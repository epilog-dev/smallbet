import { Square } from "lucide-react";
import type { HeroProps } from "@/lib/page-schema";
import { VpLinkButton } from "../../primitives/Button";
import { Chip } from "../../primitives/Eyebrow";
import { Lead } from "../../primitives/Heading";
import { ProductVisual } from "../../primitives/MockUI";
import type { PageContextValue } from "../../types";

export function HeroCtas({ props, ctx, align = "center" }: { props: HeroProps; ctx: PageContextValue; align?: "center" | "start" }) {
  return (
    <div data-reveal style={{ transitionDelay: "120ms" }} className={align === "center" ? "flex flex-col items-center" : "flex flex-col items-start"}>
      <div className={`flex flex-wrap gap-2.5 ${align === "center" ? "justify-center" : ""}`}>
        {props.secondaryCta && (
          <VpLinkButton href="#how" variant="secondary" size="lg">
            <Square className="size-2.5 fill-current text-vp-faint" strokeWidth={0} />
            {props.secondaryCta}
          </VpLinkButton>
        )}
        <VpLinkButton href={`#${ctx.pricingAnchor}`} size="lg">
          {props.primaryCta}
        </VpLinkButton>
      </div>
      <p className="mt-4 text-[13px] text-vp-muted">Takes 30 seconds · No card · No signup</p>
    </div>
  );
}

/** Subhead with optional inline metric chips, as in "…key metrics like [Visibility], [Position], and [Sentiment]". */
export function HeroLead({ props, className }: { props: HeroProps; className?: string }) {
  const chips = props.chips?.filter(Boolean) ?? [];
  return (
    <Lead className={className}>
      <span data-reveal style={{ transitionDelay: "60ms" }} className="block">
        {props.subheadline}
        {chips.length > 0 && (
          <>
            {" "}
            {chips.map((c, i) => (
              <span key={i}>
                {i > 0 && (i === chips.length - 1 ? ", and " : ", ")}
                <Chip>{c}</Chip>
              </span>
            ))}
            .
          </>
        )}
      </span>
    </Lead>
  );
}

export function HeroVisual({ props, className }: { props: HeroProps; className?: string }) {
  return <ProductVisual v={props.visual} className={className} />;
}

/** The fine hatched band that separates hero copy from the product frame. */
export function HatchBand({ className }: { className?: string }) {
  return <div aria-hidden className={`vp-hatch h-14 w-full border-y border-vp-border ${className ?? ""}`} />;
}
