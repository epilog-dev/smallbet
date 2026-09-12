import { z } from "zod";

export const THEME_PRESETS = ["haze", "paper", "aurora", "editorial"] as const;
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
    "haze: light neutral canvas with a soft accent wash — default for most B2B/consumer SaaS. paper: off-white, grain, hairlines — analytics, dev tools, writing tools. aurora: near-black with an accent aurora — AI, infra, developer platforms, fintech. editorial: warm cream + light serif — healthcare, finance for individuals, wellness, services, premium consumer.",
  ),
  accent: AccentHueSchema.describe("Brand accent hue used for buttons, highlights and the background wash."),
  rationale: z
    .string()
    .max(200)
    .optional()
    .describe("One sentence on why this preset and accent suit the idea."),
});
export type Theme = z.infer<typeof ThemeSchema>;
