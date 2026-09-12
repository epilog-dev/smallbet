"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ACCENT_HUES, COLOR_MODES } from "@/lib/page-schema";
import { DEMO_KEYS } from "@/lib/demo/docs";

export function PreviewToolbar({ docKey, mode, accent }: { docKey: string; mode: string; accent: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const set = (k: string, v: string) => {
    const next = new URLSearchParams(sp.toString());
    next.set(k, v);
    router.replace(`${pathname}?${next}`);
  };
  const sel = "h-8 rounded-md border border-neutral-300 bg-white px-2 text-xs text-neutral-900";
  return (
    <div className="sticky top-0 z-50 flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-neutral-50/95 px-4 py-2 text-xs text-neutral-700 backdrop-blur">
      <span className="font-semibold">dev/preview</span>
      <label className="flex items-center gap-1.5">
        doc
        <select className={sel} value={docKey} onChange={(e) => set("doc", e.target.value)}>
          {DEMO_KEYS.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1.5">
        mode
        <select className={sel} value={mode} onChange={(e) => set("mode", e.target.value)}>
          {COLOR_MODES.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
      <label className="flex items-center gap-1.5">
        accent
        <select className={sel} value={accent} onChange={(e) => set("accent", e.target.value)}>
          {ACCENT_HUES.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
