import { z } from "zod";

export type FieldKind =
  | { kind: "string"; max?: number; min?: number; long: boolean; description?: string; optional: boolean }
  | { kind: "number"; min?: number; max?: number; description?: string; optional: boolean }
  | { kind: "boolean"; description?: string; optional: boolean }
  | { kind: "enum"; options: string[]; description?: string; optional: boolean }
  | { kind: "literal"; value: unknown }
  | { kind: "object"; shape: Record<string, z.ZodType>; description?: string; optional: boolean }
  | { kind: "array"; element: z.ZodType; min?: number; max?: number; description?: string; optional: boolean }
  | { kind: "unknown" };

/** Strip Optional/Default wrappers, remembering optionality. */
export function unwrap(schema: z.ZodType): { inner: z.ZodType; optional: boolean } {
  let inner = schema;
  let optional = false;
  while (true) {
    if (inner instanceof z.ZodOptional) {
      optional = true;
      inner = inner.unwrap() as z.ZodType;
    } else if (inner instanceof z.ZodDefault) {
      inner = inner.unwrap() as z.ZodType;
    } else if (inner instanceof z.ZodNullable) {
      optional = true;
      inner = inner.unwrap() as z.ZodType;
    } else break;
  }
  return { inner, optional };
}

function arrayBounds(a: z.ZodArray) {
  const checks = (a._zod.def.checks ?? []) as Array<{ _zod: { def: { check: string; minimum?: number; maximum?: number } } }>;
  let min: number | undefined;
  let max: number | undefined;
  for (const c of checks) {
    if (c._zod.def.check === "min_length") min = c._zod.def.minimum;
    if (c._zod.def.check === "max_length") max = c._zod.def.maximum;
  }
  return { min, max };
}

export function describe(schema: z.ZodType): FieldKind {
  const { inner, optional } = unwrap(schema);
  const description = inner.description ?? schema.description;
  if (inner instanceof z.ZodString) {
    const max = inner.maxLength ?? undefined;
    return { kind: "string", max, min: inner.minLength ?? undefined, long: (max ?? 0) > 100, description, optional };
  }
  if (inner instanceof z.ZodNumber) return { kind: "number", min: inner.minValue ?? undefined, max: inner.maxValue ?? undefined, description, optional };
  if (inner instanceof z.ZodBoolean) return { kind: "boolean", description, optional };
  if (inner instanceof z.ZodEnum) return { kind: "enum", options: inner.options as string[], description, optional };
  if (inner instanceof z.ZodLiteral) return { kind: "literal", value: inner.value };
  if (inner instanceof z.ZodObject) return { kind: "object", shape: inner.shape as Record<string, z.ZodType>, description, optional };
  if (inner instanceof z.ZodArray) return { kind: "array", element: inner.element as unknown as z.ZodType, ...arrayBounds(inner), description, optional };
  return { kind: "unknown" };
}

/** A sensible empty value for a schema, used when adding array items or enabling optional objects. */
export function emptyValue(schema: z.ZodType): unknown {
  const f = describe(schema);
  switch (f.kind) {
    case "string":
      return "";
    case "number":
      return f.min ?? 0;
    case "boolean":
      return false;
    case "enum":
      return f.options[0];
    case "literal":
      return f.value;
    case "object":
      return Object.fromEntries(Object.entries(f.shape).map(([k, v]) => [k, unwrap(v).optional ? undefined : emptyValue(v)]));
    case "array": {
      const n = f.min ?? 0;
      return Array.from({ length: n }, () => emptyValue(f.element));
    }
    default:
      return undefined;
  }
}

export function humanize(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

/** A short label for an array item, from its first string field. */
export function itemLabel(item: unknown, index: number): string {
  if (item && typeof item === "object") {
    for (const v of Object.values(item as Record<string, unknown>)) {
      if (typeof v === "string" && v.trim()) return v.length > 40 ? v.slice(0, 40) + "…" : v;
    }
  }
  if (typeof item === "string" && item.trim()) return item.length > 40 ? item.slice(0, 40) + "…" : item;
  return `Item ${index + 1}`;
}
