"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saveDocumentAction } from "@/app/(app)/app/actions";
import type { PageDocument } from "@/lib/page-schema";

export type SaveState = "saved" | "dirty" | "saving" | "error" | "conflict";

/**
 * Debounced autosave with optimistic concurrency. The stored version advances on each
 * successful save; a conflict freezes further saves until the founder reloads.
 */
export function useAutosave(projectId: string, doc: PageDocument, initialVersion: number, delay = 800) {
  const [state, setState] = useState<SaveState>("saved");
  const versionRef = useRef(initialVersion);
  const lastSaved = useRef<string | null>(null);
  const inFlight = useRef(false);
  const queued = useRef<PageDocument | null>(null);
  const frozen = useRef(false);

  useEffect(() => {
    async function save(next: PageDocument, json: string): Promise<void> {
      if (inFlight.current) {
        queued.current = next;
        return;
      }
      inFlight.current = true;
      setState("saving");
      try {
        const r = await saveDocumentAction(projectId, next, versionRef.current);
        if (r.ok) {
          versionRef.current = r.version;
          lastSaved.current = json;
          setState("saved");
        } else {
          frozen.current = true;
          setState("conflict");
          toast.error(r.message, { duration: 10000 });
        }
      } catch (e) {
        setState("error");
        toast.error(e instanceof Error ? e.message : "Couldn't save");
      } finally {
        inFlight.current = false;
        if (queued.current) {
          const q = queued.current;
          queued.current = null;
          await save(q, JSON.stringify(q));
        }
      }
    }

    const json = JSON.stringify(doc);
    if (lastSaved.current === null) {
      // First render: the incoming document is what's stored.
      lastSaved.current = json;
      return;
    }
    if (json === lastSaved.current || frozen.current) return;
    setState("dirty");
    const t = setTimeout(() => void save(doc, json), delay);
    return () => clearTimeout(t);
  }, [doc, delay, projectId]);

  return { state };
}
