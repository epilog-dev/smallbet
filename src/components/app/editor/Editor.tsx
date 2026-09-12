"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { ArrowLeft, Check, CloudOff, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageRenderer } from "@/components/page/PageRenderer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IdeaBrief } from "@/lib/ai/types";
import { requestSection } from "@/lib/generate-client";
import { briefFromDocument, defaultSection, type PageDocument, type Section, type SectionType } from "@/lib/page-schema";
import { cn } from "@/lib/utils";
import { PublishControls } from "../PublishControls";
import { FramedPreview } from "../FramedPreview";
import { DeviceSelect, PagePanel, SectionPanel, ThemePanel } from "./Panels";
import { SectionList, SINGLETONS } from "./SectionList";
import { useAutosave, type SaveState } from "./useAutosave";

export interface EditorProps {
  project: { id: string; slug: string; status: string; version: number; brief: IdeaBrief | null; document: PageDocument };
  publicUrl: string;
}

export function Editor({ project, publicUrl }: EditorProps) {
  const [doc, setDoc] = useState<PageDocument>(project.document);
  const [selectedId, setSelectedId] = useState<string | null>(project.document.sections[0]?.id ?? null);
  const [tab, setTab] = useState<"section" | "theme" | "page">("section");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { state: saveState } = useAutosave(project.id, doc, project.version);
  const brief = useMemo(() => project.brief ?? briefFromDocument(project.document), [project.brief, project.document]);

  const selected = doc.sections.find((s) => s.id === selectedId) ?? null;

  const updateSection = useCallback((next: Section) => {
    setDoc((d) => ({ ...d, sections: d.sections.map((s) => (s.id === next.id ? next : s)) }));
  }, []);

  const select = (id: string) => {
    setSelectedId(id);
    setTab("section");
  };

  const reorder = (from: number, to: number) =>
    setDoc((d) => {
      const next = [...d.sections];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { ...d, sections: next };
    });

  const toggleHidden = (id: string) =>
    setDoc((d) => ({ ...d, sections: d.sections.map((s) => (s.id === id && !SINGLETONS.has(s.type) ? { ...s, hidden: !s.hidden } : s)) }));

  const remove = (id: string) =>
    setDoc((d) => {
      const target = d.sections.find((s) => s.id === id);
      if (!target || SINGLETONS.has(target.type) || d.sections.length <= 4) {
        if (d.sections.length <= 4) toast("A page needs at least four sections.");
        return d;
      }
      const sections = d.sections.filter((s) => s.id !== id);
      if (selectedId === id) setSelectedId(sections[0]?.id ?? null);
      return { ...d, sections };
    });

  const add = (type: SectionType) =>
    setDoc((d) => {
      if (d.sections.length >= 8) {
        toast("A page can have at most eight sections.");
        return d;
      }
      const section = defaultSection(type);
      // Insert before FAQ/CTA so new content sits with the other value sections.
      const idx = d.sections.findIndex((s) => s.type === "faq" || s.type === "cta-band");
      const sections = [...d.sections];
      sections.splice(idx === -1 ? sections.length : idx, 0, section);
      setSelectedId(section.id);
      setTab("section");
      return { ...d, sections };
    });

  const regenerate = async (id: string, instruction?: string) => {
    setRegeneratingId(id);
    try {
      const r = await requestSection({ brief, doc, sectionId: id, instruction });
      updateSection(r.section);
      toast.success("Section rewritten");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't rewrite this section");
    } finally {
      setRegeneratingId(null);
    }
  };

  const previewWidth = device === "desktop" ? 1280 : 390;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-border px-3">
        <div className="flex min-w-0 items-center gap-2">
          <Button variant="ghost" size="icon-sm" render={<Link href={`/app/projects/${project.id}`} aria-label="Back to project" />} nativeButton={false}>
            <ArrowLeft />
          </Button>
          <span className="truncate text-sm font-semibold tracking-tight">{doc.meta.productName}</span>
          <SaveIndicator state={saveState} />
        </div>
        <div className="flex items-center gap-2">
          <DeviceSelect value={device} onChange={setDevice} />
          {project.status === "published" && (
            <Button variant="ghost" size="sm" render={<a href={publicUrl} target="_blank" rel="noreferrer" />} nativeButton={false}>
              <ExternalLink /> View live
            </Button>
          )}
          <PublishControls id={project.id} status={project.status} slug={project.slug} publicUrl={publicUrl} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* left: sections */}
        <aside className="w-60 shrink-0 border-r border-border">
          <SectionList
            sections={doc.sections}
            selectedId={selectedId}
            onSelect={select}
            onReorder={reorder}
            onToggleHidden={toggleHidden}
            onDelete={remove}
            onRegenerate={(id) => void regenerate(id)}
            onAdd={add}
            regeneratingId={regeneratingId}
          />
        </aside>

        {/* centre: preview */}
        <main className="min-w-0 flex-1 overflow-y-auto bg-muted/40 p-4">
          <div className={cn("mx-auto overflow-hidden rounded-lg border border-border bg-background shadow-sm", device === "mobile" ? "max-w-[390px]" : "max-w-[1200px]")}>
            <FramedPreview width={previewWidth} maxScale={1} title="Page editor preview">
              <PageRenderer doc={doc} mode="editor" selectedId={selectedId} onSelect={select} noReveal />
            </FramedPreview>
          </div>
        </main>

        {/* right: inspector */}
        <aside className="w-[340px] shrink-0 overflow-y-auto border-l border-border">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="p-3">
            <TabsList className="w-full">
              <TabsTrigger value="section" className="flex-1">
                Section
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex-1">
                Theme
              </TabsTrigger>
              <TabsTrigger value="page" className="flex-1">
                Page
              </TabsTrigger>
            </TabsList>
            <TabsContent value="section" className="mt-4">
              {selected ? (
                <SectionPanel
                  key={selected.id}
                  section={selected}
                  onChange={updateSection}
                  onRegenerate={(instruction) => void regenerate(selected.id, instruction)}
                  regenerating={regeneratingId === selected.id}
                />
              ) : (
                <p className="text-sm text-muted-foreground">Select a section on the left or click one in the preview.</p>
              )}
            </TabsContent>
            <TabsContent value="theme" className="mt-4">
              <ThemePanel theme={doc.theme} onChange={(theme) => setDoc((d) => ({ ...d, theme }))} />
            </TabsContent>
            <TabsContent value="page" className="mt-4">
              <PagePanel doc={doc} slug={project.slug} onChange={(patch) => setDoc((d) => ({ ...d, ...patch }))} />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  const map: Record<SaveState, { icon: React.ReactNode; label: string; cls: string }> = {
    saved: { icon: <Check className="size-3" />, label: "Saved", cls: "text-muted-foreground" },
    dirty: { icon: null, label: "Unsaved", cls: "text-muted-foreground" },
    saving: { icon: <Loader2 className="size-3 animate-spin" />, label: "Saving…", cls: "text-muted-foreground" },
    error: { icon: <CloudOff className="size-3" />, label: "Not saved", cls: "text-destructive" },
    conflict: { icon: <CloudOff className="size-3" />, label: "Changed elsewhere — reload", cls: "text-destructive" },
  };
  const m = map[state];
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", m.cls)}>
      {m.icon} {m.label}
    </span>
  );
}
