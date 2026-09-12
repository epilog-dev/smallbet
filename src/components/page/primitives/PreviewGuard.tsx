"use client";

import { useEffect, useRef } from "react";

/**
 * In preview/editor mode the page is a real document inside an iframe. Make it inert for
 * navigation: links (external *and* in-page anchors — a hash jump inside the iframe scrolls
 * the host editor/dashboard too) and form submits do nothing. Clicks still bubble, so the
 * editor's click-to-select keeps working when the click lands on a link inside a section.
 */
export function PreviewGuard({ rootId }: { rootId: string }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    // Resolve the root in *this* element's document — previews live in an iframe.
    const root = marker.current?.ownerDocument.getElementById(rootId);
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest?.("a[href]")) e.preventDefault();
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
