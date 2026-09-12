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
  /** tinted background (badges, soft cards) */
  softL: number;
  softC: number;
  /** darker/lighter accent used for text on the canvas */
  inkL: number;
  inkC: number;
}

export interface PresetDef {
  id: ThemePreset;
  label: string;
  description: string;
  dark: boolean;
  colors: {
    bg: string;
    surface: string;
    surface2: string;
    border: string;
    fg: string;
    fgMuted: string;
  };
  radius: { sm: string; md: string; lg: string; xl: string };
  shadow: string;
  fonts: { display: string; body: string; displayWeight: number; displayTracking: string };
  accent: AccentTargets;
  flags: { wash: boolean; doodles: boolean; squiggle: boolean; blobs: boolean; glow: boolean };
  /**
   * Structural personality, applied via `.vp[data-preset=…]` CSS in globals.css:
   * eyebrow   pill | label | bracket | sticker
   * cards     soft (rounded, filled) | ruled (no fill, top rules) | grid (hairline bento) | lifted (hard offset shadow)
   * tint      whether dark surfaces borrow the accent hue
   */
  flavor: { eyebrow: "pill" | "label" | "bracket" | "sticker"; cards: "soft" | "ruled" | "grid" | "lifted"; tint: boolean };
}

export const PRESETS: Record<ThemePreset, PresetDef> = {
  editorial: {
    id: "editorial",
    label: "Editorial",
    description: "Warm, literary. Cream canvas, serif display, hand-drawn accents.",
    dark: false,
    colors: {
      bg: "oklch(0.975 0.008 80)",
      surface: "oklch(0.995 0.004 80)",
      surface2: "oklch(0.955 0.012 80)",
      border: "oklch(0.2 0.02 60 / 0.09)",
      fg: "oklch(0.21 0.02 50)",
      fgMuted: "oklch(0.48 0.02 50)",
    },
    radius: { sm: "0.5rem", md: "0.875rem", lg: "1.25rem", xl: "1.75rem" },
    shadow: "0 24px 70px -28px oklch(0.3 0.06 300 / 0.35)",
    fonts: { display: "var(--font-fraunces)", body: "var(--font-inter)", displayWeight: 600, displayTracking: "-0.02em" },
    accent: { l: 0.52, c: 0.2, fgL: 0.99, softL: 0.93, softC: 0.05, inkL: 0.42, inkC: 0.18 },
    flags: { wash: true, doodles: true, squiggle: true, blobs: false, glow: false },
    flavor: { eyebrow: "pill", cards: "soft", tint: false },
  },
  clean: {
    id: "clean",
    label: "Clean",
    description: "Crisp SaaS. Paper white, hairline bento grids, geometric sans.",
    dark: false,
    colors: {
      bg: "oklch(0.992 0.003 240)",
      surface: "oklch(1 0 0)",
      surface2: "oklch(0.972 0.005 240)",
      border: "oklch(0.2 0.01 240 / 0.1)",
      fg: "oklch(0.18 0.015 250)",
      fgMuted: "oklch(0.48 0.02 250)",
    },
    radius: { sm: "0.375rem", md: "0.5rem", lg: "0.75rem", xl: "1rem" },
    shadow: "0 1px 2px oklch(0 0 0 / 0.05), 0 12px 32px -16px oklch(0 0 0 / 0.15)",
    fonts: { display: "var(--font-jakarta)", body: "var(--font-jakarta)", displayWeight: 700, displayTracking: "-0.025em" },
    accent: { l: 0.5, c: 0.2, fgL: 0.99, softL: 0.95, softC: 0.035, inkL: 0.44, inkC: 0.18 },
    flags: { wash: false, doodles: false, squiggle: false, blobs: false, glow: false },
    flavor: { eyebrow: "label", cards: "grid", tint: false },
  },
  bold: {
    id: "bold",
    label: "Bold",
    description: "Poster-like. Deep ink tinted by the accent, ruled sections, mono labels.",
    dark: true,
    colors: {
      // bg/surface are re-tinted by the accent hue in themeVariables (flavor.tint)
      bg: "oklch(0.17 0.03 270)",
      surface: "oklch(0.21 0.032 270)",
      surface2: "oklch(0.25 0.034 270)",
      border: "oklch(1 0 0 / 0.14)",
      fg: "oklch(0.97 0.008 90)",
      fgMuted: "oklch(0.74 0.02 90)",
    },
    radius: { sm: "0.125rem", md: "0.25rem", lg: "0.375rem", xl: "0.5rem" },
    shadow: "0 30px 80px -30px oklch(0 0 0 / 0.7)",
    fonts: { display: "var(--font-bricolage)", body: "var(--font-inter)", displayWeight: 800, displayTracking: "-0.03em" },
    accent: { l: 0.78, c: 0.17, fgL: 0.16, softL: 0.32, softC: 0.07, inkL: 0.84, inkC: 0.14 },
    flags: { wash: false, doodles: false, squiggle: false, blobs: false, glow: true },
    flavor: { eyebrow: "bracket", cards: "ruled", tint: true },
  },
  playful: {
    id: "playful",
    label: "Playful",
    description: "Friendly consumer. Pastel surfaces, big radius, soft shadows.",
    dark: false,
    colors: {
      bg: "oklch(0.985 0.012 95)",
      surface: "oklch(1 0 0)",
      surface2: "oklch(0.96 0.02 95)",
      border: "oklch(0.3 0.03 60 / 0.1)",
      fg: "oklch(0.24 0.03 290)",
      fgMuted: "oklch(0.5 0.03 290)",
    },
    radius: { sm: "0.75rem", md: "1rem", lg: "1.5rem", xl: "2rem" },
    shadow: "0 20px 50px -20px oklch(0.4 0.1 300 / 0.3)",
    fonts: { display: "var(--font-nunito)", body: "var(--font-dm-sans)", displayWeight: 800, displayTracking: "-0.02em" },
    accent: { l: 0.58, c: 0.2, fgL: 0.99, softL: 0.92, softC: 0.07, inkL: 0.45, inkC: 0.18 },
    flags: { wash: false, doodles: true, squiggle: true, blobs: true, glow: false },
    flavor: { eyebrow: "sticker", cards: "lifted", tint: false },
  },
};

const oklch = (l: number, c: number, h: number) => `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h})`;

/** Build the full `--vp-*` variable set for a preset + accent. */
export function themeVariables(preset: ThemePreset, accent: AccentHue): Record<`--vp-${string}`, string> {
  const p = PRESETS[preset];
  const h = HUE_ANGLE[accent];
  const cs = CHROMA_SCALE[accent] ?? 1;
  const a = p.accent;
  const tintC = accent === "slate" ? 0.012 : 0.03;
  const bg = p.flavor.tint ? oklch(0.17, tintC, h) : p.colors.bg;
  const surface = p.flavor.tint ? oklch(0.21, tintC + 0.004, h) : p.colors.surface;
  const surface2 = p.flavor.tint ? oklch(0.25, tintC + 0.006, h) : p.colors.surface2;
  return {
    "--vp-bg": bg,
    "--vp-surface": surface,
    "--vp-surface-2": surface2,
    "--vp-border": p.colors.border,
    "--vp-fg": p.colors.fg,
    "--vp-fg-muted": p.colors.fgMuted,
    "--vp-accent": oklch(a.l, a.c * cs, h),
    "--vp-accent-hover": oklch(p.dark ? a.l + 0.05 : a.l - 0.06, a.c * cs, h),
    "--vp-accent-fg": oklch(a.fgL, 0.01, h),
    "--vp-accent-soft": oklch(a.softL, a.softC * cs, h),
    "--vp-accent-ink": oklch(a.inkL, a.inkC * cs, h),
    "--vp-accent-hue": String(h),
    "--vp-radius-sm": p.radius.sm,
    "--vp-radius-md": p.radius.md,
    "--vp-radius-lg": p.radius.lg,
    "--vp-radius-xl": p.radius.xl,
    "--vp-shadow": p.shadow,
    "--vp-font-display": `${p.fonts.display}, ui-sans-serif, system-ui, sans-serif`,
    "--vp-font-body": `${p.fonts.body}, ui-sans-serif, system-ui, sans-serif`,
    "--vp-display-weight": String(p.fonts.displayWeight),
    "--vp-display-tracking": p.fonts.displayTracking,
  };
}
