"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Dialog for generated pages, themed with --vp-* tokens (no shadcn here). Inside a preview iframe
 * the frame is as tall as the page, so `position: fixed` would centre the panel somewhere off-screen;
 * there it's anchored to the section instead (`anchor`).
 */
export function VpModal({ open, onClose, title, children, className }: { open: boolean; onClose: () => void; title: string; children: ReactNode; className?: string }) {
  const panel = useRef<HTMLDivElement>(null);
  const framed = useSyncExternalStore(
    () => () => {},
    () => window.self !== window.top,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    // Lock the page behind the dialog — but not inside a preview frame, where the host scrolls.
    const body = document.body;
    const prevOverflow = body.style.overflow;
    if (!framed) body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      if (!framed) body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
  }, [open, framed, onClose]);

  if (!open) return null;
  return (
    <div className={cn(framed ? "absolute inset-0 z-40" : "fixed inset-0 z-[60]", "flex items-center justify-center p-4")} role="presentation">
      <div aria-hidden className={cn("absolute inset-0 bg-vp-fg/40 backdrop-blur-[2px]", framed ? "rounded-vp-xl" : "")} onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative w-full max-w-md rounded-vp-xl border border-vp-border bg-vp-surface text-vp-fg shadow-vp-frame outline-none",
          "max-h-[calc(100dvh-2rem)] overflow-y-auto",
          "animate-in fade-in-0 zoom-in-95 duration-200",
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 inline-flex size-8 items-center justify-center rounded-full text-vp-muted transition-colors hover:bg-vp-surface-2 hover:text-vp-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vp-accent"
        >
          <X className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
