"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CURRENCIES, CURRENCY_LABELS } from "@/lib/page-schema";
import type { IdeaInput } from "@/lib/ai/types";

const EXAMPLES = [
  "Bookkeeping that closes itself for solo consultants: reads the bank feed and invoices, categorises every line, sends a finished P&L on the 1st.",
  "A Figma plugin that diffs design changes and posts a plain-English change list with specs to the Linear ticket.",
  "Replay any failing production request locally with a debugger attached — captures inputs, dependency responses and timing.",
];

const CURRENCY_ITEMS: Record<string, string> = { auto: "Auto", ...Object.fromEntries(CURRENCIES.map((c) => [c, `${c} · ${CURRENCY_LABELS[c]}`])) };

export function IdeaForm({ initial, busy, onSubmit }: { initial?: IdeaInput; busy: boolean; onSubmit: (input: IdeaInput) => void }) {
  const [idea, setIdea] = useState(initial?.idea ?? "");
  const [audience, setAudience] = useState(initial?.audience ?? "");
  const [priceHint, setPriceHint] = useState(initial?.priceHint ?? "");
  const [currency, setCurrency] = useState<IdeaInput["currency"]>(initial?.currency);
  const valid = idea.trim().length >= 12;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || busy) return;
        onSubmit({ idea: idea.trim(), audience: audience.trim() || undefined, priceHint: priceHint.trim() || undefined, currency });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="idea">What are you thinking of building?</Label>
        <Textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="One to three sentences. What it does, who it's for, and what's different about it."
          className="h-36 resize-none overflow-y-auto text-[15px] leading-relaxed [field-sizing:fixed]"
          maxLength={1200}
          autoFocus
        />
        <div className="flex flex-wrap gap-1.5 pt-1">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdea(ex)}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              Example {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="audience">
            Who is it for? <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input id="audience" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Solo consultants who bill hourly" maxLength={200} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price">
            Price you have in mind <span className="text-muted-foreground">(optional)</span>
          </Label>
          <div className="flex gap-2">
            <Select value={currency ?? "auto"} onValueChange={(v) => setCurrency(v === "auto" ? undefined : (v as IdeaInput["currency"]))} items={CURRENCY_ITEMS}>
              <SelectTrigger className="w-36 shrink-0" aria-label="Currency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CURRENCY_ITEMS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input id="price" value={priceHint} onChange={(e) => setPriceHint(e.target.value)} placeholder="19/mo, or one-time 99" maxLength={120} className="min-w-0 flex-1" />
          </div>
          <p className="text-xs text-muted-foreground">Auto picks the currency from your hint, or US dollars. You can change it later in the editor.</p>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-5 border-t border-border bg-background/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:m-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <Button type="submit" size="lg" disabled={!valid || busy} className="w-full sm:w-auto">
          {busy ? <Loader2 className="animate-spin" /> : null}
          {busy ? "Reading your idea…" : "Analyse idea"}
          {!busy && <ArrowRight />}
        </Button>
      </div>
    </form>
  );
}
