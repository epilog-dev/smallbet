import type { AccentHue, ColorMode } from "@/lib/page-schema";

/** OKLCH hue angles for each accent token. */
export const HUE_ANGLE: Record<AccentHue, number> = {
  blue: 259,
  indigo: 277,
  violet: 293,
  teal: 183,
  emerald: 163,
  amber: 75,
  orange: 55,
  rose: 16,
};

const oklch = (l: number, c: number, h: number) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h})`;

/**
 * Accent variables for a hue in a given mode. The neutral palette (bg, surface,
 * border, fg…) lives in globals.css under `.vp` / `.vp[data-mode="dark"]`.
 */
export function accentVariables(accent: AccentHue, mode: ColorMode): Record<`--vp-${string}`, string> {
  const h = HUE_ANGLE[accent];
  const dark = mode === "dark";
  return {
    "--vp-accent-hue": String(h),
    "--vp-accent": dark ? oklch(0.72, 0.16, h) : oklch(0.55, 0.2, h),
    "--vp-accent-fg": dark ? oklch(0.15, 0.02, h) : oklch(0.99, 0.01, h),
    "--vp-accent-soft": dark ? oklch(0.3, 0.07, h) : oklch(0.94, 0.045, h),
    "--vp-accent-ink": dark ? oklch(0.82, 0.12, h) : oklch(0.45, 0.17, h),
  };
}
