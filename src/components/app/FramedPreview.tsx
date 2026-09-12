"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Renders children inside a same-origin iframe of a fixed CSS width, then scales the
 * iframe to fit its container. Because the content lives in its own document, media
 * queries and container queries respond to the *design width*, so a 390px preview is
 * actually a phone layout — unlike a transform-scaled div, whose breakpoints follow
 * the browser window.
 */
export interface FramedPreviewHandle {
  /** Scrolls the nearest scrollable ancestor so the first element matching `selector` (inside the frame) is in view. */
  scrollToSelector: (selector: string, offset?: number) => void;
}

export const FramedPreview = forwardRef<
  FramedPreviewHandle,
  {
    width: number;
    /** Design width to use instead of `width` when the container is narrower than `narrowBelow`px (phones). */
    narrowWidth?: number;
    narrowBelow?: number;
    children: ReactNode;
    className?: string;
    maxScale?: number;
    minHeight?: number;
    title?: string;
  }
>(function FramedPreview({ width: wideWidth, narrowWidth, narrowBelow = 640, children, className, maxScale = 1, minHeight = 480, title = "Page preview" }, ref) {
  const outer = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);
  const [narrow, setNarrow] = useState(false);
  const width = narrow && narrowWidth ? narrowWidth : wideWidth;
  const [contentHeight, setContentHeight] = useState(minHeight);
  const scaleRef = useRef(1);
  scaleRef.current = scale;

  useImperativeHandle(
    ref,
    () => ({
      scrollToSelector(selector, offset = 16) {
        const el = iframeRef.current?.contentDocument?.querySelector(selector);
        const o = outer.current;
        if (!el || !o) return;
        const scroller = scrollParent(o);
        // Element top in the (unscaled) frame → scaled position in the parent viewport.
        const topInFrame = el.getBoundingClientRect().top;
        const topInParent = o.getBoundingClientRect().top + topInFrame * scaleRef.current;
        const scrollerTop = scroller === document.scrollingElement ? 0 : (scroller as HTMLElement).getBoundingClientRect().top;
        scroller.scrollBy({ top: topInParent - scrollerTop - offset, behavior: "smooth" });
      },
    }),
    [],
  );

  const attach = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    // An iframe starts with an about:blank document before srcdoc loads; only mount into the real one.
    if (!doc?.body || doc.location.href !== "about:srcdoc" || doc.readyState !== "complete") return false;
    doc.documentElement.className = document.documentElement.className;
    doc.body.style.margin = "0";
    // The frame is sized to its content, so it must never scroll itself — otherwise a transient
    // height mismatch (panel swap, streaming section) shows a stray scrollbar inside the preview.
    doc.documentElement.style.overflow = "hidden";
    doc.body.style.overflow = "hidden";
    syncStyles(document, doc);
    setMount((prev) => (prev === doc.body ? prev : doc.body));
    return true;
  }, []);

  // onLoad usually gets us there, but hydration can happen after load already fired (SSR) or the
  // effect can run against the placeholder document (client nav) — so also poll briefly, and
  // re-attach if the mounted body ever belongs to a stale document.
  useEffect(() => {
    let tries = 0;
    let raf = 0;
    const tick = () => {
      const ok = attach();
      const stale = mount && mount.ownerDocument !== iframeRef.current?.contentDocument;
      if ((!ok || stale) && tries++ < 120) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [attach, mount]);

  // Fit to container; on narrow containers switch to the narrow design width so the page renders its phone layout at ~1:1.
  useEffect(() => {
    const o = outer.current;
    if (!o) return;
    const update = () => {
      const isNarrow = !!narrowWidth && o.clientWidth < narrowBelow;
      setNarrow(isNarrow);
      setScale(Math.min(maxScale, o.clientWidth / (isNarrow ? narrowWidth : wideWidth)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    return () => ro.disconnect();
  }, [wideWidth, narrowWidth, narrowBelow, maxScale]);

  // Follow the content's height. Watch both body and <html>: an absolutely positioned or
  // margin-collapsed child can grow the document without changing the body's box.
  useEffect(() => {
    if (!mount) return;
    const root = mount.ownerDocument.documentElement;
    const update = () => setContentHeight(Math.max(minHeight, mount.scrollHeight, root.scrollHeight));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(mount);
    ro.observe(root);
    return () => ro.disconnect();
  }, [mount, minHeight]);

  // Keep stylesheets and the <html> class (app theme, font vars) in sync with the parent.
  useEffect(() => {
    if (!mount) return;
    const doc = mount.ownerDocument;
    const mo = new MutationObserver(() => {
      syncStyles(document, doc);
      doc.documentElement.className = document.documentElement.className;
    });
    mo.observe(document.head, { childList: true, subtree: true, characterData: true });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, [mount]);

  return (
    <div ref={outer} className={cn("relative w-full overflow-hidden", className)} style={{ height: contentHeight * scale }}>
      <iframe
        ref={iframeRef}
        title={title}
        onLoad={attach}
        srcDoc="<!doctype html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width'></head><body></body></html>"
        style={{ width, height: contentHeight, transform: `scale(${scale})`, transformOrigin: "top left", border: 0, display: "block", background: "transparent" }}
      />
      {mount && createPortal(children, mount)}
    </div>
  );
});

function scrollParent(el: HTMLElement): Element {
  let node: HTMLElement | null = el.parentElement;
  while (node) {
    const { overflowY } = getComputedStyle(node);
    if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
    node = node.parentElement;
  }
  return document.scrollingElement ?? document.documentElement;
}

const SYNC_ATTR = "data-preview-sync";

/** Mirrors the parent document's stylesheets into the iframe, once per node. */
function syncStyles(from: Document, to: Document) {
  const nodes = from.head.querySelectorAll<HTMLLinkElement | HTMLStyleElement>('link[rel="stylesheet"], style');
  nodes.forEach((node) => {
    const key = node instanceof HTMLLinkElement ? `link:${node.href}` : `style:${hash(node.textContent ?? "")}`;
    if (to.head.querySelector(`[${SYNC_ATTR}="${CSS.escape(key)}"]`)) return;
    const clone = node.cloneNode(true) as HTMLElement;
    clone.setAttribute(SYNC_ATTR, key);
    to.head.appendChild(clone);
  });
}

function hash(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return (h >>> 0).toString(36);
}
