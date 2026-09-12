import { Hanken_Grotesk, Instrument_Sans, Instrument_Serif, Inter } from "next/font/google";

/** Every font any preset can use, loaded once and exposed as CSS variables. */
export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
export const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
  display: "swap",
});
export const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});
export const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken", display: "swap" });

export const pageFontClassName = [inter.variable, instrumentSans.variable, instrumentSerif.variable, hanken.variable].join(" ");
