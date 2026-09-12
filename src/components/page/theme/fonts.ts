import { Bricolage_Grotesque, DM_Sans, Fraunces, Inter, Nunito } from "next/font/google";

/**
 * Every font any preset can use, loaded once and exposed as CSS variables.
 * Geist is provided by the root layout (`--font-geist-sans`).
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
  display: "swap",
});
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
export const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito", display: "swap" });
export const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

export const pageFontClassName = [fraunces.variable, inter.variable, bricolage.variable, nunito.variable, dmSans.variable].join(" ");
