"use client";

import { useEffect } from "react";

/** Fires one page-view beacon per page per browser session. */
export function ViewBeacon({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `vp-viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const [k, v] of params) if (k.startsWith("utm_")) utm[k] = v.slice(0, 200);
    void fetch("/api/view", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug, referrer: document.referrer || undefined, utm: Object.keys(utm).length ? utm : undefined }),
      keepalive: true,
    }).catch(() => {});
  }, [slug]);
  return null;
}
