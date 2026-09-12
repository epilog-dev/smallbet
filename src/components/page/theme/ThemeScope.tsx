import type { CSSProperties, ReactNode } from "react";
import type { Theme } from "@/lib/page-schema";
import { cn } from "@/lib/utils";
import { pageFontClassName } from "./fonts";
import { PRESETS, themeVariables } from "./presets";

/** Applies a preset + accent as `--vp-*` CSS variables on a scoped wrapper. */
export function ThemeScope({
  theme,
  className,
  children,
  style,
  id,
}: {
  id?: string;
  theme: Theme;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const preset = PRESETS[theme.preset];
  return (
    <div
      id={id}
      className={cn("vp", pageFontClassName, className)}
      data-preset={theme.preset}
      data-accent={theme.accent}
      data-dark={preset.dark ? "true" : "false"}
      style={{ ...(themeVariables(theme.preset, theme.accent) as CSSProperties), ...style }}
    >
      {children}
    </div>
  );
}
