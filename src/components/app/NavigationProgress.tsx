"use client";

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { progress } from "@/lib/progress";

/**
 * Thin bar along the top while a client-side navigation is in flight. Starts on clicks of
 * same-origin links (and on `progress.start()`), finishes when the URL changes.
 */
export function NavigationProgress() {
  const value = useSyncExternalStore(progress.subscribe, progress.get, () => 0);
  const pathname = usePathname();
  const search = useSearchParams();

  // The route committed → finish.
  useEffect(() => {
    progress.done();
  }, [pathname, search]);

  // Start on any internal link click that will actually navigate.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // hash / same page
      progress.start();
    };
    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", progress.start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", progress.start);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5"
      style={{ opacity: value > 0 ? 1 : 0, transition: value === 0 ? "opacity 200ms ease 100ms" : "opacity 100ms" }}
    >
      <div
        className="h-full bg-foreground"
        style={{
          width: `${value * 100}%`,
          transition: value === 0 ? "none" : value === 1 ? "width 150ms ease-out" : "width 200ms linear",
          boxShadow: "0 0 8px color-mix(in oklab, var(--foreground) 60%, transparent)",
        }}
      />
    </div>
  );
}
