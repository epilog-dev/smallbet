import type { AccentHue, ThemePreset } from "@/lib/page-schema";

/** OKLCH hue angles for each accent token. */
export const HUE_ANGLE: Record<AccentHue, number> = {
  violet: 293,
  indigo: 277,
  blue: 259,
  teal: 183,
  emerald: 163,
  lime: 125,
  amber: 75,
  orange: 55,
  rose: 16,
  pink: 350,
  fuchsia: 322,
  slate: 257,
};

/** Hues that need lower chroma to stay tasteful / in gamut. */
const CHROMA_SCALE: Partial<Record<AccentHue, number>> = { slate: 0.15, lime: 0.85, amber: 0.85 };

export interface AccentTargets {
  /** main accent (buttons, links) */
  l: number;
  c: number;
  /** text/icon colour placed on the accent */
  fgL: number;
  /** tinted background (badges, soft cards, washes) */
  softL: number;
  softC: number;
  /** accent as text on the canvas */
  inkL: number;
  inkC: number;
}

export type Backdrop = "aurora" | "wash" | "rails" | "bloom";
export type ButtonTone = "ink" | "accent" | "paper";

export interface PresetDef {
  id: ThemePreset;
  label: string;
  description: string;
  dark: boolean;
  colors: { bg: string; surface: string; surface2: string; border: string; fg: string; fgMuted: string };
  radius: { sm: string; md: string; lg: string; xl: string; btn: string };
  shadow: string;
  frameShadow: string;
  fonts: { display: string; body: string; displayWeight: number; displayTracking: string; scale: number };
  accent: AccentTargets;
  /** hero background treatment */
  backdrop: Backdrop;
  /** what the primary button is made of: ink = foreground colour, paper = white on dark, accent = accent colour */
  button: ButtonTone;
}

export const PRESETS: Record<ThemePreset, PresetDef> = {
  haze: {
    id: "haze",
    label: "Haze",
    description: "Calm neutral canvas with a soft accent wash behind the hero. Mercury-like.",
    dark: false,
    colors: {
      bg: "oklch(0.975 0.004 80)",
      surface: "oklch(1 0 0)",
      surface2: "oklch(0.955 0.005 80)",
      border: "oklch(0.2 0.01 80 / 0.08)",
      fg: "oklch(0.2 0.01 60)",
      fgMuted: "oklch(0.5 0.012 60)",
    },
    radius: { sm: "0.5rem", md: "0.75rem", lg: "1rem", xl: "1.5rem", btn: "9999px" },
    shadow: "0 1px 2px oklch(0 0 0 / 0.04), 0 16px 40px -24px oklch(0 0 0 / 0.18)",
    frameShadow: "0 40px 100px -40px oklch(0.3 0.08 var(--vp-accent-hue) / 0.45), 0 0 0 1px oklch(0 0 0 / 0.06)",
    fonts: { display: "var(--font-instrument-sans)", body: "var(--font-instrument-sans)", displayWeight: 500, displayTracking: "-0.03em", scale: 1 },
    accent: { l: 0.55, c: 0.19, fgL: 0.99, softL: 0.9, softC: 0.07, inkL: 0.45, inkC: 0.17 },
    backdrop: "wash",
    button: "accent",
  },
  paper: {
    id: "paper",
    label: "Paper",
    description: "Off-white with faint grain and hairline guide rails. Light grotesk, black pill buttons.",
    dark: false,
    colors: {
      bg: "oklch(0.985 0.002 90)",
      surface: "oklch(1 0 0)",
      surface2: "oklch(0.965 0.003 90)",
      border: "oklch(0.2 0 0 / 0.09)",
      fg: "oklch(0.17 0 0)",
      fgMuted: "oklch(0.5 0.005 60)",
    },
    radius: { sm: "0.375rem", md: "0.625rem", lg: "0.875rem", xl: "1.25rem", btn: "9999px" },
    shadow: "0 1px 2px oklch(0 0 0 / 0.05), 0 12px 32px -20px oklch(0 0 0 / 0.16)",
    frameShadow: "0 30px 80px -40px oklch(0 0 0 / 0.3), 0 0 0 1px oklch(0 0 0 / 0.07)",
    fonts: { display: "var(--font-hanken)", body: "var(--font-hanken)", displayWeight: 400, displayTracking: "-0.025em", scale: 1 },
    accent: { l: 0.5, c: 0.19, fgL: 0.99, softL: 0.94, softC: 0.04, inkL: 0.44, inkC: 0.17 },
    backdrop: "rails",
    button: "ink",
  },
  aurora: {
    id: "aurora",
    label: "Aurora",
    description: "Near-black with a soft two-hue aurora behind the hero and a glass product frame.",
    dark: true,
    colors: {
      bg: "oklch(0.13 0.008 280)",
      surface: "oklch(1 0 0 / 0.04)",
      surface2: "oklch(1 0 0 / 0.07)",
      border: "oklch(1 0 0 / 0.1)",
      fg: "oklch(0.97 0.004 280)",
      fgMuted: "oklch(0.72 0.01 280)",
    },
    radius: { sm: "0.5rem", md: "0.75rem", lg: "1rem", xl: "1.5rem", btn: "9999px" },
    shadow: "0 20px 60px -30px oklch(0 0 0 / 0.8)",
    frameShadow: "0 0 0 1px oklch(1 0 0 / 0.08), 0 60px 120px -40px oklch(0.4 0.15 var(--vp-accent-hue) / 0.35)",
    fonts: { display: "var(--font-inter)", body: "var(--font-inter)", displayWeight: 500, displayTracking: "-0.035em", scale: 1 },
    accent: { l: 0.74, c: 0.16, fgL: 0.15, softL: 0.35, softC: 0.09, inkL: 0.85, inkC: 0.1 },
    backdrop: "aurora",
    button: "paper",
  },
  editorial: {
    id: "editorial",
    label: "Editorial",
    description: "Warm cream, light serif display, a peach/accent bloom low in the hero.",
    dark: false,
    colors: {
      bg: "oklch(0.97 0.012 80)",
      surface: "oklch(0.995 0.005 80)",
      surface2: "oklch(0.95 0.014 80)",
      border: "oklch(0.25 0.03 60 / 0.1)",
      fg: "oklch(0.24 0.02 50)",
      fgMuted: "oklch(0.48 0.02 50)",
    },
    radius: { sm: "0.375rem", md: "0.5rem", lg: "0.875rem", xl: "1.25rem", btn: "0.625rem" },
    shadow: "0 1px 2px oklch(0.3 0.05 60 / 0.06), 0 18px 40px -24px oklch(0.3 0.05 60 / 0.25)",
    frameShadow: "0 30px 80px -40px oklch(0.35 0.08 60 / 0.35), 0 0 0 1px oklch(0.3 0.03 60 / 0.08)",
    fonts: { display: "var(--font-instrument-serif)", body: "var(--font-inter)", displayWeight: 400, displayTracking: "-0.015em", scale: 1.14 },
    accent: { l: 0.7, c: 0.16, fgL: 0.2, softL: 0.9, softC: 0.07, inkL: 0.45, inkC: 0.15 },
    backdrop: "bloom",
    button: "accent",
  },
};

const oklch = (l: number, c: number, h: number) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h})`;

/** Build the full `--vp-*` variable set for a preset + accent. */
export function themeVariables(preset: ThemePreset, accent: AccentHue): Record<`--vp-${string}`, string> {
  const p = PRESETS[preset];
  const h = HUE_ANGLE[accent];
  const cs = CHROMA_SCALE[accent] ?? 1;
  const a = p.accent;
  const accentColor = oklch(a.l, a.c * cs, h);
  const accentHover = oklch(p.dark ? a.l + 0.05 : a.l - 0.06, a.c * cs, h);
  const accentFg = oklch(a.fgL, 0.01, h);

  const button =
    p.button === "accent"
      ? { bg: accentColor, fg: accentFg, hover: accentHover }
      : p.button === "paper"
        ? { bg: "oklch(0.98 0 0)", fg: "oklch(0.15 0 0)", hover: "oklch(0.9 0 0)" }
        : { bg: p.colors.fg, fg: p.colors.bg, hover: "oklch(0.3 0 0)" };

  return {
    "--vp-bg": p.colors.bg,
    "--vp-surface": p.colors.surface,
    "--vp-surface-2": p.colors.surface2,
    "--vp-border": p.colors.border,
    "--vp-fg": p.colors.fg,
    "--vp-fg-muted": p.colors.fgMuted,
    "--vp-accent": accentColor,
    "--vp-accent-hover": accentHover,
    "--vp-accent-fg": accentFg,
    "--vp-accent-soft": oklch(a.softL, a.softC * cs, h),
    "--vp-accent-ink": oklch(a.inkL, a.inkC * cs, h),
    "--vp-accent-hue": String(h),
    "--vp-accent-hue-2": String((h + 50) % 360),
    "--vp-btn-bg": button.bg,
    "--vp-btn-fg": button.fg,
    "--vp-btn-hover": button.hover,
    "--vp-radius-sm": p.radius.sm,
    "--vp-radius-md": p.radius.md,
    "--vp-radius-lg": p.radius.lg,
    "--vp-radius-xl": p.radius.xl,
    "--vp-radius-btn": p.radius.btn,
    "--vp-shadow": p.shadow,
    "--vp-frame-shadow": p.frameShadow,
    "--vp-font-display": `${p.fonts.display}, ui-sans-serif, system-ui, sans-serif`,
    "--vp-font-body": `${p.fonts.body}, ui-sans-serif, system-ui, sans-serif`,
    "--vp-display-weight": String(p.fonts.displayWeight),
    "--vp-display-tracking": p.fonts.displayTracking,
    "--vp-display-scale": String(p.fonts.scale),
  };
}
