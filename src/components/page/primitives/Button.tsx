import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-vp-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-vp-bg disabled:opacity-60 disabled:pointer-events-none";
const variants: Record<Variant, string> = {
  primary: "bg-vp-btn text-vp-btn-fg hover:bg-vp-btn-hover",
  secondary: "border border-vp-border-strong bg-vp-surface text-vp-fg shadow-[0_1px_0_oklch(0_0_0/0.03)] hover:bg-vp-surface-2",
  ghost: "text-vp-fg hover:bg-vp-surface-2",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-9 px-3.5 text-sm",
  lg: "h-10 px-4 text-sm",
};

export function VpButton({ variant = "primary", size = "md", className, ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function VpLinkButton({ variant = "primary", size = "md", className, ...props }: ComponentProps<"a"> & { variant?: Variant; size?: Size }) {
  return <a className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
