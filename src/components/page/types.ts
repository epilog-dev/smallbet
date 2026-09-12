import type { PageDocument, Section, SectionOfType, SectionType, Theme } from "@/lib/page-schema";

export type PageMode = "live" | "preview" | "editor";

export interface PageStats {
  responses: number;
  wouldPay: number;
  target: number;
  daysLeft: number | null;
}

export interface PageContextValue {
  mode: PageMode;
  slug?: string;
  doc: PageDocument;
  theme: Theme;
  stats: PageStats;
  /** id of the `.vp` root element (mode toggle, reveal) */
  rootId: string;
  /** id of the pricing-intent section, for CTA anchors */
  pricingAnchor: string;
}

export interface SectionProps<T extends SectionType = SectionType> {
  section: SectionOfType<T>;
  ctx: PageContextValue;
}

export type SectionComponent<T extends SectionType> = (props: SectionProps<T>) => React.ReactNode;

export type SectionRegistry = {
  [T in SectionType]: Record<SectionOfType<T>["variant"], SectionComponent<T>>;
};

export type AnySection = Section;
