import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-vp-bg disabled:opacity-60 disabled:pointer-events-none";
const variants: Record<Variant, string> = {
  primary: "bg-vp-accent text-vp-accent-fg hover:bg-vp-accent-hover shadow-[0_1px_0_0_oklch(1_0_0/0.12)_inset]",
  secondary: "bg-vp-surface text-vp-fg border border-vp-border hover:bg-vp-surface-2",
  ghost: "text-vp-fg hover:bg-vp-surface-2",
};
const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm rounded-vp-md",
  lg: "h-12 px-6 text-base rounded-vp-lg",
};

export function VpButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function VpLinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"a"> & { variant?: Variant; size?: Size }) {
  return <a className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
