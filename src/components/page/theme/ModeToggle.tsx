"use client";

import { Moon, Sun } from "lucide-react";
import { useCallback, useSyncExternalStore } from "react";
import type { ColorMode } from "@/lib/page-schema";
import { MODE_STORAGE_KEY } from "./ThemeScope";

/** Light/dark switch for a generated page. Persists per visitor; flips the enclosing `.vp` root. */
export function ModeToggle({ rootId, initial, persist }: { rootId: string; initial: ColorMode; persist: boolean }) {
  // The root's data-mode attribute is the source of truth (the boot script may have set it before hydration).
  const subscribe = useCallback(
    (onChange: () => void) => {
      const root = document.getElementById(rootId);
      if (!root) return () => {};
      const mo = new MutationObserver(onChange);
      mo.observe(root, { attributes: true, attributeFilter: ["data-mode"] });
      return () => mo.disconnect();
    },
    [rootId],
  );
  const read = useCallback((): ColorMode => {
    const m = document.getElementById(rootId)?.getAttribute("data-mode");
    return m === "dark" ? "dark" : m === "light" ? "light" : initial;
  }, [rootId, initial]);
  const mode = useSyncExternalStore(subscribe, read, () => initial);

  const toggle = () => {
    const next: ColorMode = mode === "dark" ? "light" : "dark";
    document.getElementById(rootId)?.setAttribute("data-mode", next);
    if (persist) {
      try {
        localStorage.setItem(MODE_STORAGE_KEY, next);
      } catch {}
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex size-9 items-center justify-center rounded-vp-md border border-vp-border-strong bg-vp-surface text-vp-muted transition-colors hover:text-vp-fg"
    >
      {mode === "dark" ? <Sun className="size-4" strokeWidth={1.75} /> : <Moon className="size-4" strokeWidth={1.75} />}
    </button>
  );
}
