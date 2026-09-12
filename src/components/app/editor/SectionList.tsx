"use client";

import { closestCenter, DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, MoreHorizontal, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SECTION_LABELS, SECTION_TYPES, type Section, type SectionType } from "@/lib/page-schema";
import { cn } from "@/lib/utils";
import { humanize } from "./schema-form-utils";

/** Section types that must exist exactly once and can't be removed or hidden. */
export const SINGLETONS: ReadonlySet<SectionType> = new Set(["hero", "pricing-intent"]);

export function SectionList({
  sections,
  selectedId,
  onSelect,
  onReorder,
  onToggleHidden,
  onDelete,
  onRegenerate,
  onAdd,
  regeneratingId,
}: {
  sections: Section[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (from: number, to: number) => void;
  onToggleHidden: (id: string) => void;
  onDelete: (id: string) => void;
  onRegenerate: (id: string) => void;
  onAdd: (type: SectionType) => void;
  regeneratingId: string | null;
}) {
  // Mouse drags start after 4px; touch drags need a long-press so the list still scrolls with a swipe.
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = sections.map((s) => s.id);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    let to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    // Hero stays first.
    if (sections[from].type === "hero") return;
    if (to === 0) to = 1;
    onReorder(from, to);
  };

  /** Keyboard/touch-friendly alternative to dragging. Hero stays first. */
  const move = (id: string, dir: -1 | 1) => {
    const from = ids.indexOf(id);
    const to = from + dir;
    if (from <= 0 || to <= 0 || to >= ids.length) return;
    onReorder(from, to);
  };

  const present = new Set(sections.map((s) => s.type));
  const addable = SECTION_TYPES.filter((t) => !SINGLETONS.has(t) || !present.has(t));

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">Sections</p>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-xs" aria-label="Add section" />}>
            <Plus />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {addable.map((t) => (
              <DropdownMenuItem key={t} onClick={() => onAdd(t)}>
                {SECTION_LABELS[t]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <DndContext id="section-list" sensors={sensors} collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
            {sections.map((s, i) => (
              <Row
                key={s.id}
                section={s}
                selected={s.id === selectedId}
                regenerating={regeneratingId === s.id}
                canMoveUp={i > 1}
                canMoveDown={i > 0 && i < sections.length - 1}
                onMoveUp={() => move(s.id, -1)}
                onMoveDown={() => move(s.id, 1)}
                onSelect={() => onSelect(s.id)}
                onToggleHidden={() => onToggleHidden(s.id)}
                onDelete={() => onDelete(s.id)}
                onRegenerate={() => onRegenerate(s.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function Row({
  section,
  selected,
  regenerating,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onSelect,
  onToggleHidden,
  onDelete,
  onRegenerate,
}: {
  section: Section;
  selected: boolean;
  regenerating: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onSelect: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
}) {
  const singleton = SINGLETONS.has(section.type);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id, disabled: section.type === "hero" });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 rounded-md border border-transparent pr-1 text-sm",
        selected ? "border-border bg-muted" : "hover:bg-muted/60",
        isDragging && "z-10 shadow-md",
        section.hidden && "opacity-60",
      )}
    >
      <button
        type="button"
        className={cn("cursor-grab touch-none p-1.5 text-muted-foreground/60 hover:text-muted-foreground", section.type === "hero" && "invisible")}
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-3.5" />
      </button>
      <button type="button" onClick={onSelect} className="flex min-w-0 flex-1 flex-col items-start py-2.5 text-left lg:py-1.5">
        <span className="truncate font-medium">{SECTION_LABELS[section.type]}</span>
        <span className="truncate text-[11px] text-muted-foreground">{humanize(section.variant)}</span>
      </button>
      {regenerating ? (
        <RefreshCw className="mr-1 size-3.5 animate-spin text-muted-foreground" />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button variant="ghost" size="icon-xs" className="lg:opacity-0 lg:group-hover:opacity-100 lg:data-[popup-open]:opacity-100 lg:aria-expanded:opacity-100" aria-label="Section actions" />}
          >
            <MoreHorizontal />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onRegenerate}>
              <RefreshCw /> Rewrite with AI
            </DropdownMenuItem>
            {section.type !== "hero" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onMoveUp} disabled={!canMoveUp}>
                  <ArrowUp /> Move up
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onMoveDown} disabled={!canMoveDown}>
                  <ArrowDown /> Move down
                </DropdownMenuItem>
              </>
            )}
            {!singleton && (
              <DropdownMenuItem onClick={onToggleHidden}>
                {section.hidden ? <Eye /> : <EyeOff />} {section.hidden ? "Show" : "Hide"}
              </DropdownMenuItem>
            )}
            {!singleton && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onDelete}>
                  <Trash2 /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}
