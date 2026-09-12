"use client";

import { useEffect } from "react";

/**
 * Opts the enclosing `.vp` root into scroll-reveal. Content is visible without JS;
 * once mounted we add `reveal-ready` and reveal items as they enter the viewport.
 * A failsafe sweep reveals anything above the fold the observer may miss.
 */
export function RevealController({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    root.classList.add("reveal-ready");

    const show = (el: Element) => el.classList.add("reveal-in");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (show(e.target), io.unobserve(e.target))),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    items.forEach((el) => io.observe(el));

    const sweep = () => {
      const vh = window.innerHeight;
      items.forEach((el) => {
        if (el.classList.contains("reveal-in")) return;
        if (el.getBoundingClientRect().top < vh * 1.05) show(el);
      });
    };
    sweep();
    window.addEventListener("scroll", sweep, { passive: true });
    window.addEventListener("resize", sweep);
    document.addEventListener("visibilitychange", sweep);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", sweep);
      window.removeEventListener("resize", sweep);
      document.removeEventListener("visibilitychange", sweep);
      root.classList.remove("reveal-ready");
    };
  }, [rootId]);
  return null;
}
