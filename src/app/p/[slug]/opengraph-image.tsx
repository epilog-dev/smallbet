import { ImageResponse } from "next/og";
import { getPublishedProjectBySlug } from "@/lib/db/projects";
import { createClient } from "@/lib/supabase/server";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Tell us what you'd pay";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = await createClient();
  const project = await getPublishedProjectBySlug(db, slug);
  const doc = project?.document;
  const hero = doc?.sections.find((s) => s.type === "hero");
  const headline = hero?.type === "hero" ? hero.props.headline : (doc?.meta.tagline ?? "Tell us what you'd pay");
  const name = doc?.meta.productName ?? "smallbet";
  const dark = doc?.theme.mode === "dark";
  const bg = dark ? "#151517" : "#fafaf9";
  const fg = dark ? "#f4f4f5" : "#18181b";
  const muted = dark ? "#a1a1aa" : "#71717a";
  const line = dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: bg, color: fg, padding: 72, fontFamily: "Inter, system-ui, sans-serif", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 72, width: 1, background: line }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, right: 72, width: 1, background: line }} />
        <div style={{ display: "flex", alignItems: "center", fontSize: 26, fontWeight: 600, paddingLeft: 24 }}>{name}</div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", paddingLeft: 24 }}>
          <div style={{ fontSize: 30, color: muted, marginBottom: 20 }}>Pre-launch · tell us what you&apos;d pay</div>
          <div style={{ fontSize: 68, fontWeight: 600, letterSpacing: -2.5, lineHeight: 1.05, maxWidth: 980 }}>{headline}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingLeft: 24, fontSize: 22, color: muted }}>
          <span>No card · No signup · 30 seconds</span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9.5" stroke={muted} strokeWidth="3" strokeDasharray="6.95 3" strokeDashoffset="1.5" />
              <circle cx="12" cy="12" r="3.75" fill={muted} />
            </svg>
            smallbet
          </span>
        </div>
      </div>
    ),
    size,
  );
}
