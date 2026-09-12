"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 1023px)"; // below Tailwind's `lg`

const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** True below the `lg` breakpoint. False during SSR and the first client render. */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
