import type { AccentHue, ButtonStyle, ColorMode } from "@/lib/page-schema";

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
export function accentVariables(accent: AccentHue, mode: ColorMode, button: ButtonStyle = "accent"): Record<`--vp-${string}`, string> {
  const h = HUE_ANGLE[accent];
  const dark = mode === "dark";
  // Warm hues (amber/orange) read lighter at the same L; pull them down a touch so white text stays legible.
  const warm = accent === "amber" || accent === "orange";
  const accentL = dark ? 0.74 : warm ? 0.52 : 0.55;
  const accentColor = oklch(accentL, dark ? 0.16 : 0.2, h);
  const accentHover = oklch(dark ? accentL + 0.05 : accentL - 0.06, dark ? 0.16 : 0.2, h);
  const accentFg = dark ? oklch(0.15, 0.02, h) : oklch(0.99, 0.01, h);
  const ink = dark ? { bg: "oklch(0.96 0 0)", fg: "oklch(0.15 0 0)", hover: "oklch(0.88 0 0)" } : { bg: "oklch(0.17 0 0)", fg: "oklch(0.99 0 0)", hover: "oklch(0.28 0 0)" };
  const btn = button === "ink" ? ink : { bg: accentColor, fg: accentFg, hover: accentHover };
  return {
    "--vp-accent-hue": String(h),
    "--vp-accent": accentColor,
    "--vp-accent-hover": accentHover,
    "--vp-accent-fg": accentFg,
    "--vp-accent-soft": dark ? oklch(0.3, 0.07, h) : oklch(0.94, 0.045, h),
    "--vp-accent-ink": dark ? oklch(0.82, 0.12, h) : oklch(0.45, 0.17, h),
    "--vp-btn-bg": btn.bg,
    "--vp-btn-fg": btn.fg,
    "--vp-btn-hover": btn.hover,
  };
}
