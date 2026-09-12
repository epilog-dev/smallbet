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
export const BUTTON_STYLES = ["accent", "ink"] as const;
export const ButtonStyleSchema = z.enum(BUTTON_STYLES);
export type ButtonStyle = z.infer<typeof ButtonStyleSchema>;

export const ThemeSchema = z.object({
  accent: AccentHueSchema.describe("Brand accent hue: buttons, highlighted words, labels, icon tiles, chart lines. blue is the safe default."),
  accentHex: z.string().max(7).optional().describe("Founder-chosen brand colour as #rrggbb; its hue replaces `accent`. Leave unset."),
  mode: ColorModeSchema.describe("Default colour mode the page opens in. Visitors can toggle."),
  button: ButtonStyleSchema.optional().describe("accent (default): primary buttons use the accent colour. ink: black/white buttons for a quieter look."),
  rationale: z.string().max(200).optional().describe("One sentence on why this accent/mode suits the idea."),
});
export type Theme = z.infer<typeof ThemeSchema>;
