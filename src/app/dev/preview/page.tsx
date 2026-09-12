import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page/PageRenderer";
import { DEMO_DOCS, DEMO_KEYS } from "@/lib/demo/docs";
import { ACCENT_HUES, COLOR_MODES, type AccentHue, type ColorMode } from "@/lib/page-schema";
import { PreviewToolbar } from "./toolbar";

export const dynamic = "force-dynamic";

export default async function DevPreviewPage({ searchParams }: PageProps<"/dev/preview">) {
  if (process.env.NODE_ENV === "production") notFound();
  const sp = await searchParams;
  const docKey = typeof sp.doc === "string" && DEMO_KEYS.includes(sp.doc) ? sp.doc : DEMO_KEYS[0];
  const base = DEMO_DOCS[docKey];
  const mode = (COLOR_MODES as readonly string[]).includes(String(sp.mode)) ? (sp.mode as ColorMode) : base.theme.mode;
  const accent = (ACCENT_HUES as readonly string[]).includes(String(sp.accent)) ? (sp.accent as AccentHue) : base.theme.accent;
  const doc = { ...base, theme: { ...base.theme, mode, accent } };

  return (
    <div className="min-h-dvh">
      <PreviewToolbar docKey={docKey} mode={mode} accent={accent} />
      <PageRenderer doc={doc} mode="preview" />
    </div>
  );
}
