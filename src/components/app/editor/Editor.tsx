"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, CloudOff, ExternalLink, Eye, ListOrdered, Loader2, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { PageRenderer } from "@/components/page/PageRenderer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { IdeaBrief } from "@/lib/ai/types";
import { requestSection } from "@/lib/generate-client";
import { briefFromDocument, defaultSection, type PageDocument, type Section, type SectionType } from "@/lib/page-schema";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { PublishControls } from "../PublishControls";
import { ThemeToggle } from "../ThemeToggle";
import { FramedPreview, type FramedPreviewHandle } from "../FramedPreview";
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
  // Below `lg` the editor shows one panel at a time, switched from a bottom bar.
  const isMobile = useIsMobile();
  const [panel, setPanel] = useState<"preview" | "sections" | "edit">("preview");
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { state: saveState } = useAutosave(project.id, doc, project.version);
  const previewRef = useRef<FramedPreviewHandle>(null);
  const brief = useMemo(() => project.brief ?? briefFromDocument(project.document), [project.brief, project.document]);

  const selected = doc.sections.find((s) => s.id === selectedId) ?? null;

  const updateSection = useCallback((next: Section) => {
    setDoc((d) => ({ ...d, sections: d.sections.map((s) => (s.id === next.id ? next : s)) }));
  }, []);

  const select = (id: string) => {
    setSelectedId(id);
    setTab("section");
    if (isMobile) setPanel("edit");
  };

  /** Select from the list: also bring the section into view in the preview (on phones the list hands straight off to the inspector). */
  const selectAndReveal = (id: string) => {
    select(id);
    if (!isMobile) requestAnimationFrame(() => previewRef.current?.scrollToSelector(`[data-section="${CSS.escape(id)}"]`));
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
      if (d.sections.length >= 9) {
        toast("A page can have at most nine sections.");
        return d;
      }
      const section = defaultSection(type);
      // Insert before FAQ/CTA so new content sits with the other value sections.
      const idx = d.sections.findIndex((s) => s.type === "faq" || s.type === "cta-band");
      const sections = [...d.sections];
      sections.splice(idx === -1 ? sections.length : idx, 0, section);
      setSelectedId(section.id);
      setTab("section");
      if (isMobile) setPanel("edit");
      else setTimeout(() => previewRef.current?.scrollToSelector(`[data-section="${CSS.escape(section.id)}"]`), 80);
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

  // A phone always previews the phone layout; a scaled-down desktop page is unreadable there.
  const effectiveDevice = isMobile ? "mobile" : device;
  const previewWidth = effectiveDevice === "desktop" ? 1280 : 390;
  const show = (p: typeof panel) => !isMobile || panel === p;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      {/* top bar */}
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border px-2 sm:gap-3 sm:px-3">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon-sm" render={<Link href={`/app/projects/${project.id}`} aria-label="Back to project" />} nativeButton={false}>
            <ArrowLeft />
          </Button>
          <span className="truncate text-sm font-semibold tracking-tight">{doc.meta.productName}</span>
          <SaveIndicator state={saveState} />
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <div className="hidden lg:contents">
            <ThemeToggle />
            <DeviceSelect value={device} onChange={setDevice} />
          </div>
          {project.status === "published" && (
            <Button variant="ghost" size="sm" render={<a href={publicUrl} target="_blank" rel="noreferrer" aria-label="View live" />} nativeButton={false}>
              <ExternalLink /> <span className="hidden sm:inline">View live</span>
            </Button>
          )}
          <PublishControls id={project.id} status={project.status} slug={project.slug} publicUrl={publicUrl} />
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {/* left: sections */}
        <aside className={cn("shrink-0 border-border lg:w-60 lg:border-r", isMobile ? "w-full" : "w-60", !show("sections") && "hidden")}>
          <SectionList
            sections={doc.sections}
            selectedId={selectedId}
            onSelect={selectAndReveal}
            onReorder={reorder}
            onToggleHidden={toggleHidden}
            onDelete={remove}
            onRegenerate={(id) => void regenerate(id)}
            onAdd={add}
            regeneratingId={regeneratingId}
          />
        </aside>

        {/* centre: preview (kept mounted on phones so the iframe doesn't rebuild on every tab switch) */}
        <main className={cn("min-w-0 flex-1 overflow-y-auto bg-muted/40 p-2 sm:p-4", !show("preview") && "hidden")}>
          <div className={cn("mx-auto overflow-hidden rounded-lg border border-border bg-background shadow-sm", effectiveDevice === "mobile" ? "max-w-[390px]" : "max-w-[1200px]")}>
            <FramedPreview ref={previewRef} width={previewWidth} maxScale={1} title="Page editor preview">
              <PageRenderer doc={doc} mode="editor" selectedId={selectedId} onSelect={select} noReveal />
            </FramedPreview>
          </div>
        </main>

        {/* right: inspector */}
        <aside className={cn("shrink-0 overflow-y-auto border-border lg:w-[340px] lg:border-l", isMobile ? "w-full" : "w-[340px]", !show("edit") && "hidden")}>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="p-3">
            <TabsList className="sticky top-0 z-10 w-full">
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
                <p className="text-sm text-muted-foreground">{isMobile ? "Tap a section in the preview, or pick one from Sections." : "Select a section on the left or click one in the preview."}</p>
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

      {/* phone: panel switcher */}
      {isMobile && (
        <nav className="grid shrink-0 grid-cols-3 border-t border-border bg-background pb-[env(safe-area-inset-bottom)]" aria-label="Editor panels">
          {(
            [
              ["preview", "Preview", Eye],
              ["sections", "Sections", ListOrdered],
              ["edit", "Edit", SlidersHorizontal],
            ] as const
          ).map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setPanel(key)}
              aria-current={panel === key ? "page" : undefined}
              className={cn("flex h-14 flex-col items-center justify-center gap-1 text-[11px] font-medium", panel === key ? "text-foreground" : "text-muted-foreground")}
            >
              <Icon className={cn("size-5", panel === key && "stroke-[2.25]")} />
              {label}
            </button>
          ))}
        </nav>
      )}
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
