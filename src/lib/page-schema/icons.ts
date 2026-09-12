import { z } from "zod";

/**
 * Allow-list of lucide icon names the AI may reference in feature lists.
 * Keep this small and semantic; the renderer maps each name to a component
 * in `components/page/primitives/Icon.tsx`.
 */
export const ICON_NAMES = [
  "zap",
  "shield-check",
  "clock",
  "sparkles",
  "rocket",
  "bar-chart-3",
  "line-chart",
  "layers",
  "lock",
  "bell",
  "calendar",
  "check-circle-2",
  "credit-card",
  "database",
  "file-text",
  "globe",
  "heart",
  "inbox",
  "link",
  "mail",
  "message-square",
  "mic",
  "package",
  "pen-line",
  "refresh-cw",
  "search",
  "settings",
  "smartphone",
  "star",
  "target",
  "timer",
  "trending-up",
  "upload",
  "users",
  "wallet",
  "wand-2",
  "workflow",
  "brain",
  "camera",
  "map-pin",
] as const;

export const IconNameSchema = z.enum(ICON_NAMES);
export type IconName = z.infer<typeof IconNameSchema>;
