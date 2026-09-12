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
}: {
  id: string;
  theme: Theme;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** false in editor/preview so the founder's chosen default is what they see */
  persistMode?: boolean;
}) {
  const vars = accentVariables(theme.accent, theme.mode) as CSSProperties;
  const boot = persistMode
    ? `try{var m=localStorage.getItem(${JSON.stringify(MODE_STORAGE_KEY)});if(m==='light'||m==='dark'){var e=document.getElementById(${JSON.stringify(id)});if(e)e.setAttribute('data-mode',m);}}catch(e){}`
    : null;
  return (
    <div
      id={id}
      className={cn("vp", pageFontClassName, className)}
      data-mode={theme.mode}
      data-accent={theme.accent}
      style={{ ...vars, ...style }}
    >
      {boot && <script dangerouslySetInnerHTML={{ __html: boot }} />}
      {children}
    </div>
  );
}
