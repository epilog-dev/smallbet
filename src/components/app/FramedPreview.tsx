"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/**
 * Renders children inside a same-origin iframe of a fixed CSS width, then scales the
 * iframe to fit its container. Because the content lives in its own document, media
 * queries and container queries respond to the *design width*, so a 390px preview is
 * actually a phone layout — unlike a transform-scaled div, whose breakpoints follow
 * the browser window.
 */
export function FramedPreview({
  width,
  children,
  className,
  maxScale = 1,
  minHeight = 480,
  title = "Page preview",
}: {
  width: number;
  children: ReactNode;
  className?: string;
  maxScale?: number;
  minHeight?: number;
  title?: string;
}) {
  const outer = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(minHeight);

  const attach = useCallback(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc?.body) return;
    doc.documentElement.className = document.documentElement.className;
    doc.body.style.margin = "0";
    doc.body.style.overflowX = "hidden";
    syncStyles(document, doc);
    setMount(doc.body);
  }, []);

  // `srcDoc` iframes usually fire onLoad, but if the document is already complete
  // (fast paths, strict-mode remounts) onLoad never comes — attach directly.
  useEffect(() => {
    const f = iframeRef.current;
    if (f?.contentDocument?.readyState === "complete" && f.contentDocument.body) attach();
  }, [attach]);

  // Fit to container.
  useEffect(() => {
    const o = outer.current;
    if (!o) return;
    const update = () => setScale(Math.min(maxScale, o.clientWidth / width));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(o);
    return () => ro.disconnect();
  }, [width, maxScale]);

  // Follow the content's height.
  useEffect(() => {
    if (!mount) return;
    const update = () => setContentHeight(Math.max(minHeight, mount.scrollHeight));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(mount);
    return () => ro.disconnect();
  }, [mount, minHeight]);

  // Keep stylesheets in sync (dev HMR injects new <style>/<link> tags into the parent head).
  useEffect(() => {
    if (!mount) return;
    const doc = mount.ownerDocument;
    const mo = new MutationObserver(() => syncStyles(document, doc));
    mo.observe(document.head, { childList: true, subtree: true, characterData: true });
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
