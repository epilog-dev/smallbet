import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogle } from "@ai-sdk/google";
import type { LanguageModel } from "ai";

export type ProviderName = "google" | "anthropic" | "mock";

const DEFAULT_MODEL: Record<Exclude<ProviderName, "mock">, string> = {
  google: "gemini-3.6-flash",
  anthropic: "claude-sonnet-5",
};

/** Which provider the env selects. Falls back to mock when the chosen provider has no key. */
export function resolveProvider(): ProviderName {
  const wanted = (process.env.AI_PROVIDER ?? "google").toLowerCase() as ProviderName;
  if (wanted === "mock") return "mock";
  if (wanted === "anthropic") return process.env.ANTHROPIC_API_KEY ? "anthropic" : "mock";
  return process.env.GOOGLE_GENERATIVE_AI_API_KEY ? "google" : "mock";
}

export function resolveModelId(provider: Exclude<ProviderName, "mock">): string {
  return process.env.AI_MODEL?.trim() || DEFAULT_MODEL[provider];
}

export function resolveModel(provider: Exclude<ProviderName, "mock">): { model: LanguageModel; id: string } {
  const id = resolveModelId(provider);
  if (provider === "anthropic") {
    const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return { model: anthropic(id), id };
  }
  const google = createGoogle({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  return { model: google(id), id };
}
