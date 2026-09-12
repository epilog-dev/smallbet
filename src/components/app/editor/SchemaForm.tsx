"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { describe, emptyValue, humanize, itemLabel } from "./schema-form-utils";

/** Keys the founder shouldn't touch through the generic form. */
const HIDDEN_KEYS = new Set(["id", "type", "variant", "hidden"]);

/** Per-key overrides for label/help where the humanized key isn't enough. */
const LABELS: Record<string, string> = {
  headlineHighlight: "Highlighted words",
  primaryCta: "Primary button",
  secondaryCta: "Secondary button",
  ctaLabel: "Button label",
  noPayLabel: "\"Wouldn't pay\" label",
  askEmail: "Ask for email after answering",
  followUpQuestion: "Follow-up question",
  highlightedTierId: "Highlighted tier",
  mockTitle: "Window title",
  mockRows: "Rows",
  seoTitle: "Title tag",
  seoDescription: "Meta description",
  logoText: "Logo text",
  targetResponses: "Target answers",
  deadlineDays: "Days to decide",
};

export interface SchemaFormProps {
  schema: z.ZodType;
  value: unknown;
  onChange: (next: unknown) => void;
  /** Optional per-field enum overrides, e.g. highlightedTierId → tier ids. */
  enumOptions?: (path: string[]) => Array<{ value: string; label: string }> | undefined;
  path?: string[];
}

/** Renders an editing form for any value described by a Zod object schema. */
export function SchemaForm({ schema, value, onChange, enumOptions, path = [] }: SchemaFormProps) {
  const f = describe(schema);
  if (f.kind !== "object") return <Field schema={schema} value={value} onChange={onChange} enumOptions={enumOptions} path={path} name={path.at(-1) ?? "value"} />;
  const obj = (value ?? {}) as Record<string, unknown>;
  return (
    <div className="space-y-4">
      {Object.entries(f.shape)
        .filter(([k]) => !HIDDEN_KEYS.has(k))
        .map(([k, s]) => (
          <Field
            key={k}
            name={k}
            schema={s}
            value={obj[k]}
            onChange={(v) => onChange({ ...obj, [k]: v })}
            enumOptions={enumOptions}
            path={[...path, k]}
          />
        ))}
    </div>
  );
}

function Field({
  name,
  schema,
  value,
  onChange,
  enumOptions,
  path,
  bare,
}: {
  name: string;
  schema: z.ZodType;
  value: unknown;
  onChange: (v: unknown) => void;
  enumOptions?: SchemaFormProps["enumOptions"];
  path: string[];
  /** render the control without its label (primitive array items) */
  bare?: boolean;
}) {
  const f = describe(schema);
  const label = LABELS[name] ?? humanize(name);
  const id = path.join(".");

  switch (f.kind) {
    case "literal":
      return null;

    case "string": {
      const v = typeof value === "string" ? value : "";
      const common = {
        id,
        value: v,
        maxLength: f.max,
        placeholder: f.optional ? "Optional" : undefined,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value === "" && f.optional ? undefined : e.target.value),
      };
      return (
        <div className="space-y-1.5">
          {!bare && <FieldLabel htmlFor={id} label={label} help={f.description} count={f.max ? `${v.length}/${f.max}` : undefined} />}
          {f.long ? <Textarea rows={3} className="resize-none text-sm" {...common} /> : <Input className="text-sm" {...common} />}
        </div>
      );
    }

    case "number":
      return (
        <div className="space-y-1.5">
          <FieldLabel htmlFor={id} label={label} help={f.description} />
          <Input
            id={id}
            type="number"
            className="text-sm"
            min={f.min}
            max={f.max}
            value={typeof value === "number" ? value : ""}
            onChange={(e) => onChange(e.target.value === "" ? (f.optional ? undefined : 0) : Number(e.target.value))}
          />
        </div>
      );

    case "boolean":
      return (
        <div className="flex items-center justify-between gap-3 py-1">
          <FieldLabel htmlFor={id} label={label} help={f.description} />
          <Switch id={id} checked={Boolean(value)} onCheckedChange={(c) => onChange(c)} />
        </div>
      );

    case "enum": {
      const override = enumOptions?.(path);
      const options = override ?? f.options.map((o) => ({ value: o, label: humanize(o) }));
      const current = typeof value === "string" ? value : "";
      return (
        <div className="space-y-1.5">
          <FieldLabel htmlFor={id} label={label} help={f.description} />
          <Select value={current || undefined} onValueChange={(v) => onChange(v)}>
            <SelectTrigger id={id} className="w-full text-sm">
              <SelectValue placeholder={f.optional ? "None" : "Choose…"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    case "object": {
      const obj = (value ?? {}) as Record<string, unknown>;
      return (
        <fieldset className="rounded-md border border-border p-3">
          <legend className="px-1 text-xs font-medium text-muted-foreground">{label}</legend>
          <SchemaForm schema={schema} value={obj} onChange={onChange} enumOptions={enumOptions} path={path} />
        </fieldset>
      );
    }

    case "array":
      return <ArrayField name={name} label={label} f={f} value={value} onChange={onChange} enumOptions={enumOptions} path={path} />;

    default:
      return null;
  }
}

function ArrayField({
  label,
  f,
  value,
  onChange,
  enumOptions,
  path,
}: {
  name: string;
  label: string;
  f: Extract<ReturnType<typeof describe>, { kind: "array" }>;
  value: unknown;
  onChange: (v: unknown) => void;
  enumOptions?: SchemaFormProps["enumOptions"];
  path: string[];
}) {
  const items = Array.isArray(value) ? (value as unknown[]) : [];
  const elem = describe(f.element);
  const [open, setOpen] = useState<number | null>(elem.kind === "object" ? 0 : null);
  const canAdd = f.max === undefined || items.length < f.max;
  const canRemove = f.min === undefined || items.length > f.min;

  const set = (i: number, v: unknown) => onChange(items.map((x, k) => (k === i ? v : x)));
  const remove = (i: number) => onChange(items.filter((_, k) => k !== i));
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
    setOpen(j);
  };
  const add = () => {
    onChange([...items, emptyValue(f.element)]);
    setOpen(items.length);
  };

  // Array of primitives: compact inline list.
  if (elem.kind !== "object") {
    return (
      <div className="space-y-1.5">
        <FieldLabel label={label} help={f.description} count={f.max ? `${items.length}/${f.max}` : undefined} />
        <div className="space-y-1.5">
          {items.map((it, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="flex-1">
                <Field name={label} schema={f.element} value={it} onChange={(v) => set(i, v)} enumOptions={enumOptions} path={[...path, String(i)]} bare />
              </div>
              <Button type="button" variant="ghost" size="icon-sm" onClick={() => remove(i)} disabled={!canRemove} aria-label="Remove">
                <Trash2 />
              </Button>
            </div>
          ))}
        </div>
        {canAdd && (
          <Button type="button" variant="outline" size="sm" onClick={add}>
            <Plus /> Add
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <FieldLabel label={label} help={f.description} count={f.max ? `${items.length}/${f.max}` : undefined} />
      <div className="space-y-1.5">
        {items.map((it, i) => {
          const isOpen = open === i;
          return (
            <div key={i} className={cn("rounded-md border border-border", isOpen && "bg-muted/30")}>
              <div className="flex items-center gap-1 px-2 py-1.5">
                <button type="button" onClick={() => setOpen(isOpen ? null : i)} className="flex flex-1 items-center gap-2 text-left text-sm">
                  <span className="text-xs tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="truncate">{itemLabel(it, i)}</span>
                </button>
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up">
                  <ChevronUp />
                </Button>
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down">
                  <ChevronDown />
                </Button>
                <Button type="button" variant="ghost" size="icon-xs" onClick={() => remove(i)} disabled={!canRemove} aria-label="Remove">
                  <Trash2 />
                </Button>
              </div>
              {isOpen && (
                <div className="border-t border-border p-3">
                  <SchemaForm schema={f.element} value={it} onChange={(v) => set(i, v)} enumOptions={enumOptions} path={[...path, String(i)]} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {canAdd && (
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <Plus /> Add {label.replace(/s$/, "").toLowerCase()}
        </Button>
      )}
    </div>
  );
}

function FieldLabel({ htmlFor, label, help, count }: { htmlFor?: string; label: string; help?: string; count?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <Label htmlFor={htmlFor} className="text-xs font-medium" title={help}>
        {label}
      </Label>
      {count && <span className="text-[10px] tabular-nums text-muted-foreground">{count}</span>}
    </div>
  );
}
