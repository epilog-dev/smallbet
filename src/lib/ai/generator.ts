import { resolveProvider } from "./client";
import { MockGenerator } from "./mock";
import { ModelGenerator } from "./model-generator";
import type { PageGenerator } from "./types";

let cached: { key: string; gen: PageGenerator } | null = null;

/**
 * The generator for this process. `AI_PROVIDER` picks google (default) | anthropic | mock;
 * a missing API key falls back to mock so the app always works.
 */
export function createGenerator(): PageGenerator {
  const provider = resolveProvider();
  const key = `${provider}:${process.env.AI_MODEL ?? ""}`;
  if (cached?.key === key) return cached.gen;
  const gen = provider === "mock" ? new MockGenerator() : new ModelGenerator(provider);
  cached = { key, gen };
  return gen;
}

export * from "./types";
export { GenerationError } from "./model-generator";
