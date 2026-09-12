"use client";

import { useState } from "react";
import { Pipette, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HEX_RE, HUE_ANGLE, hexToOklch } from "@/components/page/theme/tokens";
import { ACCENT_HUES, type AccentHue } from "@/lib/page-schema";
import { cn } from "@/lib/utils";

export interface AccentValue {
  accent: AccentHue;
  accentHex?: string;
}

/**
 * Eight named hues plus a custom colour. A custom colour only contributes its hue —
 * the palette keeps its tuned lightness/chroma so text on buttons stays legible.
 */
export function AccentPicker({ value, onChange, size = "md" }: { value: AccentValue; onChange: (v: AccentValue) => void; size?: "sm" | "md" }) {
  const custom = value.accentHex && HEX_RE.test(value.accentHex) ? value.accentHex.toLowerCase() : undefined;
  // Text field drafts; resync when the committed colour changes (e.g. via the native picker).
  const [draft, setDraft] = useState(custom ?? "");
  const [synced, setSynced] = useState(custom);
  if (synced !== custom) {
    setSynced(custom);
    setDraft(custom ?? "");
  }

  const swatch = size === "sm" ? "size-6" : "size-7";
  const setHex = (hex: string) => onChange({ ...value, accentHex: hex.toLowerCase() });
  const commitDraft = () => {
    const v = draft.trim().startsWith("#") ? draft.trim() : `#${draft.trim()}`;
    if (HEX_RE.test(v)) setHex(v);
    else setDraft(custom ?? "");
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {ACCENT_HUES.map((h) => (
          <button
            key={h}
            type="button"
            title={h}
            aria-label={h}
            aria-pressed={!custom && value.accent === h}
            onClick={() => onChange({ accent: h, accentHex: undefined })}
            className={cn(swatch, "rounded-full border-2 transition-transform hover:scale-110", !custom && value.accent === h ? "border-foreground" : "border-transparent")}
            style={{ background: `oklch(0.6 0.18 ${HUE_ANGLE[h]})` }}
          />
        ))}
        {/* Custom: the native picker, wrapped so it looks like one more swatch. */}
        <label
          title="Custom colour"
          className={cn(
            swatch,
            "relative flex cursor-pointer items-center justify-center rounded-full border-2 transition-transform hover:scale-110",
            custom ? "border-foreground" : "border-dashed border-border",
          )}
          style={{ background: custom ?? "conic-gradient(oklch(0.65 0.18 20), oklch(0.65 0.18 90), oklch(0.65 0.18 160), oklch(0.65 0.18 230), oklch(0.65 0.18 300), oklch(0.65 0.18 20))" }}
        >
          {!custom && <Pipette className="size-3 text-white drop-shadow" />}
          <input
            type="color"
            value={custom ?? "#3b82f6"}
            onChange={(e) => setHex(e.target.value)}
            aria-label="Custom accent colour"
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
      </div>
      {custom && (
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitDraft}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), commitDraft())}
            spellCheck={false}
            className="h-7 w-28 font-mono text-xs"
            aria-label="Hex colour"
          />
          <span className="text-xs text-muted-foreground">{describe(custom)}</span>
          <button type="button" onClick={() => onChange({ ...value, accentHex: undefined })} className="ml-auto rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Use a preset hue instead">
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function describe(hex: string) {
  const c = hexToOklch(hex);
  if (!c) return "";
  if (c.c < 0.03) return "Near-neutral · used as a soft grey";
  return `Hue ${Math.round(c.h)}° · lightness is tuned for contrast`;
}
