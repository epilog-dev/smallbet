"use client";

import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { AccentPicker } from "@/components/app/AccentPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { IdeaBrief } from "@/lib/ai/types";
import { COLOR_MODES, CURRENCIES, CURRENCY_LABELS, currencySymbol } from "@/lib/page-schema";
import { cn } from "@/lib/utils";

const CURRENCY_ITEMS = Object.fromEntries(CURRENCIES.map((c) => [c, `${c} · ${CURRENCY_LABELS[c]}`])) as Record<(typeof CURRENCIES)[number], string>;

/** The founder confirms or adjusts the AI's read before the page is built. */
export function BriefCard({
  brief,
  onChange,
  onBack,
  onBuild,
  busy,
  generatorName,
}: {
  brief: IdeaBrief;
  onChange: (b: IdeaBrief) => void;
  onBack: () => void;
  onBuild: () => void;
  busy: boolean;
  generatorName?: string;
}) {
  const set = <K extends keyof IdeaBrief>(k: K, v: IdeaBrief[K]) => onChange({ ...brief, [k]: v });
  const names = Array.from(new Set([brief.productName, ...brief.nameIdeas]));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          Step 2 of 3 · {generatorName === "mock" ? "Mock generator (no API key set)" : `Generated with ${generatorName ?? "AI"}`}
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">Here&apos;s how we read it</h2>
        <p className="mt-1 text-sm text-muted-foreground">Fix anything that&apos;s off — the page is written from this.</p>
      </div>

      <div className="space-y-2">
        <Label>Product name</Label>
        <div className="flex flex-wrap gap-1.5">
          {names.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => set("productName", n)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-sm transition-colors",
                n === brief.productName ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-muted",
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <Input value={brief.productName} onChange={(e) => set("productName", e.target.value.slice(0, 30))} className="mt-1" />
      </div>

      <div className="space-y-2">
        <Label>Audience</Label>
        <Input value={brief.audience} onChange={(e) => set("audience", e.target.value.slice(0, 120))} />
      </div>
      <div className="space-y-2">
        <Label>The problem</Label>
        <Textarea rows={2} value={brief.problem} onChange={(e) => set("problem", e.target.value.slice(0, 220))} className="resize-none" />
      </div>
      <div className="space-y-2">
        <Label>The promise</Label>
        <Textarea rows={2} value={brief.promise} onChange={(e) => set("promise", e.target.value.slice(0, 160))} className="resize-none" />
      </div>

      <div className="space-y-2">
        <Label>Price points to test</Label>
        <div className="space-y-2">
          {brief.suggestedTiers.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_6rem] gap-2">
              <Input
                value={t.name}
                onChange={(e) => set("suggestedTiers", brief.suggestedTiers.map((x, k) => (k === i ? { ...x, name: e.target.value.slice(0, 30) } : x)))}
              />
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currencySymbol(brief.currency)}
                </span>
                <Input
                  type="number"
                  min={0}
                  className="pl-6"
                  value={t.price}
                  onChange={(e) => set("suggestedTiers", brief.suggestedTiers.map((x, k) => (k === i ? { ...x, price: Number(e.target.value) || 0 } : x)))}
                />
              </div>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
            <Select value={brief.currency} onValueChange={(v) => set("currency", v as IdeaBrief["currency"])} items={CURRENCY_ITEMS}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CURRENCY_ITEMS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Billed {brief.interval === "one-time" ? "once" : `per ${brief.interval}`}. Visitors pick one of these or say they wouldn&apos;t pay.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Default mode</Label>
          <Select
            value={brief.theme.mode}
            onValueChange={(v) => set("theme", { ...brief.theme, mode: v as IdeaBrief["theme"]["mode"] })}
            items={{ light: "Light", dark: "Dark" }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COLOR_MODES.map((m) => (
                <SelectItem key={m} value={m} className="capitalize">
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Accent</Label>
          <div className="pt-1.5">
            <AccentPicker size="sm" value={{ accent: brief.theme.accent, accentHex: brief.theme.accentHex }} onChange={(v) => set("theme", { ...brief.theme, ...v })} />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-5 flex items-center gap-2 border-t border-border bg-background/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:m-0 lg:border-0 lg:bg-transparent lg:p-0 lg:pt-2 lg:backdrop-blur-none">
        <Button type="button" variant="outline" onClick={onBack} disabled={busy}>
          <ArrowLeft /> Back
        </Button>
        <Button type="button" size="lg" onClick={onBuild} disabled={busy || !brief.productName.trim()} className="flex-1">
          {busy ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {busy ? "Building your page…" : "Build the page"}
        </Button>
      </div>
    </div>
  );
}
