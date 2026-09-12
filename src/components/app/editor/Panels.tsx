"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HUE_ANGLE } from "@/components/page/theme/tokens";
import { ACCENT_HUES, COLOR_MODES, PageGoalSchema, PageMetaSchema, PageNavSchema, SECTION_LABELS, SECTION_SCHEMAS, SECTION_VARIANTS, type PageDocument, type Section } from "@/lib/page-schema";
import { cn } from "@/lib/utils";
import { SchemaForm } from "./SchemaForm";
import { humanize } from "./schema-form-utils";

/* ---------------- Section panel ---------------- */

export function SectionPanel({
  section,
  onChange,
  onRegenerate,
  regenerating,
}: {
  section: Section;
  onChange: (next: Section) => void;
  onRegenerate: (instruction?: string) => void;
  regenerating: boolean;
}) {
  const [instruction, setInstruction] = useState("");
  const schema = SECTION_SCHEMAS[section.type];
  const propsSchema = (schema as unknown as { shape: { props: Parameters<typeof SchemaForm>[0]["schema"] } }).shape.props;
  const variants = SECTION_VARIANTS[section.type];

  const enumOptions = (path: string[]) => {
    if (section.type === "pricing-intent" && path.at(-1) === "highlightedTierId") {
      return section.props.tiers.map((t) => ({ value: t.id, label: t.name || t.id }));
    }
    return undefined;
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Section</p>
        <h3 className="text-base font-semibold tracking-tight">{SECTION_LABELS[section.type]}</h3>
      </div>

      {variants.length > 1 && (
        <div className="space-y-1.5">
          <Label className="text-xs font-medium">Layout</Label>
          <div className="grid grid-cols-2 gap-1.5">
            {variants.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange({ ...section, variant: v } as Section)}
                className={cn(
                  "rounded-md border px-2 py-1.5 text-xs transition-colors",
                  section.variant === v ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted",
                )}
              >
                {humanize(v)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-md border border-border bg-muted/30 p-3">
        <Label className="text-xs font-medium">Rewrite with AI</Label>
        <Textarea
          rows={2}
          value={instruction}
          onChange={(e) => setInstruction(e.target.value.slice(0, 400))}
          placeholder="Optional instruction: shorter, more concrete, mention the free trial…"
          className="mt-1.5 resize-none text-sm"
        />
        <Button size="sm" variant="outline" className="mt-2" disabled={regenerating} onClick={() => onRegenerate(instruction.trim() || undefined)}>
          {regenerating ? <Loader2 className="animate-spin" /> : <RefreshCw />} {regenerating ? "Rewriting…" : "Rewrite section"}
        </Button>
      </div>

      <SchemaForm
        schema={propsSchema}
        value={section.props}
        onChange={(props) => onChange({ ...section, props } as Section)}
        enumOptions={enumOptions}
        path={[section.id, "props"]}
      />
    </div>
  );
}

/* ---------------- Theme panel ---------------- */

export function ThemePanel({ theme, onChange }: { theme: PageDocument["theme"]; onChange: (t: PageDocument["theme"]) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Theme</p>
        <h3 className="text-base font-semibold tracking-tight">Look</h3>
        <p className="mt-1 text-xs text-muted-foreground">One design system. Visitors can switch light/dark themselves; this sets the default.</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Default mode</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {COLOR_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ ...theme, mode: m })}
              className={cn(
                "rounded-md border px-2 py-1.5 text-xs capitalize transition-colors",
                theme.mode === m ? "border-foreground bg-foreground text-background" : "border-border hover:bg-muted",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Accent</Label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_HUES.map((h) => (
            <button
              key={h}
              type="button"
              title={h}
              onClick={() => onChange({ ...theme, accent: h })}
              className={cn("size-7 rounded-full border-2 transition-transform hover:scale-110", theme.accent === h ? "border-foreground" : "border-transparent")}
              style={{ background: `oklch(0.6 0.18 ${HUE_ANGLE[h]})` }}
              aria-label={h}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Used for dots, chart lines, chips and the highlighted price tier.</p>
      </div>
    </div>
  );
}

/* ---------------- Page panel ---------------- */

export function PagePanel({
  doc,
  slug,
  onChange,
}: {
  doc: PageDocument;
  slug: string;
  onChange: (patch: Partial<Pick<PageDocument, "meta" | "nav" | "goal">>) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-muted-foreground">Page</p>
        <h3 className="text-base font-semibold tracking-tight">Details</h3>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Address</Label>
        <Input value={`/p/${slug}`} readOnly className="text-sm text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Change it from the Publish dialog.</p>
      </div>
      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-medium text-muted-foreground">Name & SEO</legend>
        <SchemaForm schema={PageMetaSchema} value={doc.meta} onChange={(meta) => onChange({ meta: meta as PageDocument["meta"] })} path={["meta"]} />
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-medium text-muted-foreground">Navigation</legend>
        <SchemaForm schema={PageNavSchema} value={doc.nav} onChange={(nav) => onChange({ nav: nav as PageDocument["nav"] })} path={["nav"]} />
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="mb-2 text-xs font-medium text-muted-foreground">Goal</legend>
        <SchemaForm schema={PageGoalSchema} value={doc.goal} onChange={(goal) => onChange({ goal: goal as PageDocument["goal"] })} path={["goal"]} />
        <p className="text-xs text-muted-foreground">Shown on the page as progress when the call-to-action uses the &quot;with progress&quot; layout.</p>
      </fieldset>
    </div>
  );
}

/** Small select used in the top bar for device width. */
export function DeviceSelect({ value, onChange }: { value: "desktop" | "mobile"; onChange: (v: "desktop" | "mobile") => void }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as "desktop" | "mobile")}>
      <SelectTrigger size="sm" className="w-28 text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="desktop">Desktop</SelectItem>
        <SelectItem value="mobile">Mobile</SelectItem>
      </SelectContent>
    </Select>
  );
}
