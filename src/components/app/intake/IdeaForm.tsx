"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TONES } from "@/lib/ai/types";
import type { IdeaInput } from "@/lib/ai/types";

const EXAMPLES = [
  "Bookkeeping that closes itself for solo consultants: reads the bank feed and invoices, categorises every line, sends a finished P&L on the 1st.",
  "A Figma plugin that diffs design changes and posts a plain-English change list with specs to the Linear ticket.",
  "Replay any failing production request locally with a debugger attached — captures inputs, dependency responses and timing.",
];

export function IdeaForm({ initial, busy, onSubmit }: { initial?: IdeaInput; busy: boolean; onSubmit: (input: IdeaInput) => void }) {
  const [idea, setIdea] = useState(initial?.idea ?? "");
  const [audience, setAudience] = useState(initial?.audience ?? "");
  const [priceHint, setPriceHint] = useState(initial?.priceHint ?? "");
  const [tone, setTone] = useState<IdeaInput["tone"]>(initial?.tone);
  const valid = idea.trim().length >= 12;

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid || busy) return;
        onSubmit({ idea: idea.trim(), audience: audience.trim() || undefined, priceHint: priceHint.trim() || undefined, tone });
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="idea">What are you thinking of building?</Label>
        <Textarea
          id="idea"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          rows={5}
          placeholder="One to three sentences. What it does, who it's for, and what's different about it."
          className="resize-none text-[15px] leading-relaxed"
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
          <Input id="price" value={priceHint} onChange={(e) => setPriceHint(e.target.value)} placeholder="$19/mo, or one-time $99" maxLength={120} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Tone</Label>
        <Select
          value={tone ?? "auto"}
          onValueChange={(v) => setTone(v === "auto" ? undefined : (v as IdeaInput["tone"]))}
          items={{ auto: "Let the AI decide", ...Object.fromEntries(TONES.map((t) => [t, t[0].toUpperCase() + t.slice(1)])) }}
        >
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Let the AI decide</SelectItem>
            {TONES.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" size="lg" disabled={!valid || busy} className="w-full sm:w-auto">
        {busy ? <Loader2 className="animate-spin" /> : null}
        {busy ? "Reading your idea…" : "Analyse idea"}
        {!busy && <ArrowRight />}
      </Button>
    </form>
  );
}
