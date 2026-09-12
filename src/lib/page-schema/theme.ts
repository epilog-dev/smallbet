import { z } from "zod";

export const ACCENT_HUES = [
  "blue",
  "indigo",
  "violet",
  "teal",
  "emerald",
  "amber",
  "orange",
  "rose",
] as const;
export const AccentHueSchema = z.enum(ACCENT_HUES);
export type AccentHue = z.infer<typeof AccentHueSchema>;

export const COLOR_MODES = ["light", "dark"] as const;
export const ColorModeSchema = z.enum(COLOR_MODES);
export type ColorMode = z.infer<typeof ColorModeSchema>;

/**
 * One design system, two modes. The accent only colours small things
 * (status dots, chart lines, chips); buttons are always ink-on-paper.
 */
export const ThemeSchema = z.object({
  accent: AccentHueSchema.describe("Accent hue for dots, chart lines and chips. blue is the safe default."),
  mode: ColorModeSchema.describe("Default colour mode the page opens in. Visitors can toggle."),
  rationale: z.string().max(200).optional().describe("One sentence on why this accent/mode suits the idea."),
});
export type Theme = z.infer<typeof ThemeSchema>;
