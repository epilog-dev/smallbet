import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/lib/page-schema";
import { cn } from "@/lib/utils";
import { pageFontClassName } from "./fonts";
import { accentVariables } from "./tokens";

export const MODE_STORAGE_KEY = "vp-mode";

/**
 * Scoped wrapper for a generated page. Sets `data-mode` (light/dark) and the accent
 * variables. A tiny inline script applies the visitor's saved mode before paint so
 * there's no flash; `ModeToggle` writes the same key.
 */
export function ThemeScope({
  id,
  theme,
  className,
  children,
  style,
  persistMode = true,
  followApp = false,
}: {
  id: string;
  theme: Theme;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** false in editor/preview so the founder's chosen default is what they see */
  persistMode?: boolean;
  /** Follow the host site's light/dark theme instead of the page's own mode (landing-page demo). */
  followApp?: boolean;
}) {
  const button = theme.button ?? "accent";
  // In app mode both accent sets are shipped suffixed (-light / -dark) and globals.css maps the
  // real --vp-* names from whichever the site's theme calls for; inline values would otherwise win.
  const suffixed = (mode: "light" | "dark") =>
    Object.fromEntries(Object.entries(accentVariables(theme.accent, mode, button, theme.accentHex)).map(([k, v]) => [`${k}-${mode}`, v]));
  const vars = (followApp ? { ...suffixed("light"), ...suffixed("dark") } : accentVariables(theme.accent, theme.mode, button, theme.accentHex)) as CSSProperties;
  const boot = persistMode
    ? `try{var m=localStorage.getItem(${JSON.stringify(MODE_STORAGE_KEY)});if(m==='light'||m==='dark'){var e=document.getElementById(${JSON.stringify(id)});if(e)e.setAttribute('data-mode',m);}}catch(e){}`
    : null;
  return (
    <div
      id={id}
      className={cn("vp", pageFontClassName, className)}
      data-mode={followApp ? "app" : theme.mode}
      data-accent={theme.accent}
      data-live={persistMode ? "" : undefined}
      style={{ ...vars, ...style }}
    >
      {boot && <script dangerouslySetInnerHTML={{ __html: boot }} />}
      {children}
    </div>
  );
}
