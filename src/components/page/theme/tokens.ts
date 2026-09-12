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

const oklch = (l: number, c: number, h: number) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})`;

export const HEX_RE = /^#[0-9a-f]{6}$/i;

/** sRGB hex → OKLCH. Returns null for anything that isn't #rrggbb. */
export function hexToOklch(hex: string): { l: number; c: number; h: number } | null {
  if (!HEX_RE.test(hex)) return null;
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const c = Math.hypot(A, B);
  const h = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

/** The hue a theme resolves to: the custom colour's hue when set and valid, else the named hue. */
export function themeHue(theme: { accent: AccentHue; accentHex?: string }): { h: number; grey: boolean } {
  const custom = theme.accentHex ? hexToOklch(theme.accentHex) : null;
  if (custom) return { h: custom.h, grey: custom.c < 0.03 };
  return { h: HUE_ANGLE[theme.accent], grey: false };
}

/**
 * Accent variables for a hue in a given mode. The neutral palette (bg, surface,
 * border, fg…) lives in globals.css under `.vp` / `.vp[data-mode="dark"]`.
 */
export function accentVariables(accent: AccentHue, mode: ColorMode, button: ButtonStyle = "accent", accentHex?: string): Record<`--vp-${string}`, string> {
  // A custom colour contributes its hue only; lightness and chroma stay tuned for contrast.
  const { h, grey } = themeHue({ accent, accentHex });
  const dark = mode === "dark";
  // Warm hues (amber/orange) read lighter at the same L; pull them down a touch so white text stays legible.
  const warm = h >= 40 && h <= 110;
  const accentL = dark ? 0.74 : warm ? 0.52 : 0.55;
  const chroma = grey ? 0.01 : dark ? 0.16 : 0.2;
  const accentColor = oklch(accentL, chroma, h);
  const accentHover = oklch(dark ? accentL + 0.05 : accentL - 0.06, chroma, h);
  const accentFg = dark ? oklch(0.15, 0.02, h) : oklch(0.99, 0.01, h);
  const ink = dark ? { bg: "oklch(0.96 0 0)", fg: "oklch(0.15 0 0)", hover: "oklch(0.88 0 0)" } : { bg: "oklch(0.17 0 0)", fg: "oklch(0.99 0 0)", hover: "oklch(0.28 0 0)" };
  const btn = button === "ink" ? ink : { bg: accentColor, fg: accentFg, hover: accentHover };
  return {
    "--vp-accent-hue": h.toFixed(1),
    "--vp-accent": accentColor,
    "--vp-accent-hover": accentHover,
    "--vp-accent-fg": accentFg,
    "--vp-accent-soft": dark ? oklch(0.3, grey ? 0.005 : 0.07, h) : oklch(0.94, grey ? 0.003 : 0.045, h),
    "--vp-accent-ink": dark ? oklch(0.82, grey ? 0.01 : 0.12, h) : oklch(0.45, grey ? 0.01 : 0.17, h),
    "--vp-btn-bg": btn.bg,
    "--vp-btn-fg": btn.fg,
    "--vp-btn-hover": btn.hover,
  };
}
