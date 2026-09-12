"use client";

import { Moon, Sun } from "lucide-react";
import { useCallback, useRef, useSyncExternalStore } from "react";
import type { ColorMode } from "@/lib/page-schema";
import { MODE_STORAGE_KEY } from "./ThemeScope";

/** Light/dark switch for a generated page. Persists per visitor; flips the enclosing `.vp` root. */
export function ModeToggle({ rootId, initial, persist }: { rootId: string; initial: ColorMode; persist: boolean }) {
  // Previews render inside an iframe, so look the root up in *this* element's document.
  const btnRef = useRef<HTMLButtonElement>(null);
  const getRoot = useCallback(() => (btnRef.current?.ownerDocument ?? document).getElementById(rootId), [rootId]);
  // The root's data-mode attribute is the source of truth (the boot script may have set it before hydration).
  const subscribe = useCallback(
    (onChange: () => void) => {
      const root = getRoot();
      if (!root) return () => {};
      const mo = new MutationObserver(onChange);
      mo.observe(root, { attributes: true, attributeFilter: ["data-mode"] });
      return () => mo.disconnect();
    },
    [getRoot],
  );
  const read = useCallback((): ColorMode => {
    const m = getRoot()?.getAttribute("data-mode");
    return m === "dark" ? "dark" : m === "light" ? "light" : initial;
  }, [getRoot, initial]);
  const mode = useSyncExternalStore(subscribe, read, () => initial);

  const toggle = () => {
    const next: ColorMode = mode === "dark" ? "light" : "dark";
    getRoot()?.setAttribute("data-mode", next);
    if (persist) {
      try {
        localStorage.setItem(MODE_STORAGE_KEY, next);
      } catch {}
    }
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={toggle}
      aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex size-9 items-center justify-center rounded-vp-md border border-vp-border-strong bg-vp-surface text-vp-muted transition-colors hover:text-vp-fg"
    >
      {mode === "dark" ? <Sun className="size-4" strokeWidth={1.75} /> : <Moon className="size-4" strokeWidth={1.75} />}
    </button>
  );
}
