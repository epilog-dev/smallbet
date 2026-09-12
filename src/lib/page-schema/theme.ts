import { z } from "zod";

export const THEME_PRESETS = ["editorial", "clean", "bold", "playful"] as const;
export const ThemePresetSchema = z.enum(THEME_PRESETS);
export type ThemePreset = z.infer<typeof ThemePresetSchema>;

export const ACCENT_HUES = [
  "violet",
  "indigo",
  "blue",
  "teal",
  "emerald",
  "lime",
  "amber",
  "orange",
  "rose",
  "pink",
  "fuchsia",
  "slate",
] as const;
export const AccentHueSchema = z.enum(ACCENT_HUES);
export type AccentHue = z.infer<typeof AccentHueSchema>;

export const ThemeSchema = z.object({
  preset: ThemePresetSchema.describe(
    "editorial: warm, literary B2B/creator feel. clean: crisp neutral SaaS. bold: dark, high-contrast, dev/infra tools. playful: friendly pastel consumer apps.",
  ),
  accent: AccentHueSchema.describe("Brand accent hue used for buttons, highlights and doodles."),
  rationale: z
    .string()
    .max(200)
    .optional()
    .describe("One sentence on why this preset and accent suit the idea."),
});
export type Theme = z.infer<typeof ThemeSchema>;
