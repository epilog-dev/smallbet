"use client";

import { createContext, useContext } from "react";
import type { PageContextValue } from "./types";

const PageContext = createContext<PageContextValue | null>(null);

export const PageProvider = PageContext.Provider;

export function usePage(): PageContextValue {
  const ctx = useContext(PageContext);
  if (!ctx) throw new Error("usePage must be used inside <PageRenderer>");
  return ctx;
}
