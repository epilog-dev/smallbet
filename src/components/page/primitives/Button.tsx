import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-vp-btn font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vp-accent focus-visible:ring-offset-2 focus-visible:ring-offset-vp-bg disabled:opacity-60 disabled:pointer-events-none";
const variants: Record<Variant, string> = {
  primary: "bg-vp-btn text-vp-btn-fg hover:bg-vp-btn-hover",
  secondary: "border border-vp-border bg-vp-surface text-vp-fg hover:bg-vp-surface-2",
  ghost: "text-vp-fg hover:bg-vp-surface-2",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-[15px]",
};

export function VpButton({ variant = "primary", size = "md", className, ...props }: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export function VpLinkButton({ variant = "primary", size = "md", className, ...props }: ComponentProps<"a"> & { variant?: Variant; size?: Size }) {
  return <a className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
