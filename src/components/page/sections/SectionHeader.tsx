import { Heading, Lead } from "../primitives/Heading";
import { Eyebrow } from "../primitives/Eyebrow";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "start";
  className?: string;
}) {
  return (
    <div data-reveal className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "", className)}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <Heading>{title}</Heading>
      {subtitle && <Lead className="mt-4">{subtitle}</Lead>}
    </div>
  );
}
