"use client";

import { useEffect, useRef } from "react";

/**
 * In preview/editor mode the page is a real document inside an iframe. Block anything that
 * would navigate that document away (external links, the footer link, form submits) while
 * still letting same-page anchors scroll. Without this, clicking a link inside a dashboard
 * preview loads the whole app inside the preview.
 */
export function PreviewGuard({ rootId }: { rootId: string }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // Resolve the root in *this* element's document — previews live in an iframe.
    const root = marker.current?.ownerDocument.getElementById(rootId);
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("#")) return; // in-page anchor: fine
      e.preventDefault();
      e.stopPropagation();
    };
    const onSubmit = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    root.addEventListener("click", onClick, true);
    root.addEventListener("submit", onSubmit, true);
    return () => {
      root.removeEventListener("click", onClick, true);
      root.removeEventListener("submit", onSubmit, true);
    };
  }, [rootId]);
  return <span ref={marker} hidden />;
}
