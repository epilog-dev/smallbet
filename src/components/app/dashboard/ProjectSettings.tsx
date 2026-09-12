"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive, ArchiveRestore, Copy, Eraser, Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { archiveAction, clearResponsesAction, deleteProjectAction, duplicateProjectAction, renameProjectAction, restoreAction } from "@/app/(app)/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { progress } from "@/lib/progress";

/** Everything about the page that isn't its content: name, copies, archive, and the two destructive actions. */
export function ProjectSettings({ id, name, status, responses }: { id: string; name: string; status: string; responses: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [draft, setDraft] = useState(name);
  const [confirm, setConfirm] = useState<"clear" | "delete" | null>(null);
  const [typed, setTyped] = useState("");
  const archived = status === "archived";

  const rename = () => {
    if (draft.trim() === name) return;
    start(async () => {
      const r = await renameProjectAction(id, draft);
      if (!r.ok) return void toast.error(r.message);
      toast.success("Renamed.");
      router.refresh();
    });
  };

  const duplicate = () =>
    start(async () => {
      const { id: copy } = await duplicateProjectAction(id);
      toast.success("Copied. Opening the copy.");
      progress.start();
      router.push(`/app/projects/${copy}`);
    });

  const archive = () =>
    start(async () => {
      progress.start();
      if (archived) {
        await restoreAction(id);
        toast.success("Restored as a draft.");
        router.refresh();
      } else {
        await archiveAction(id);
      }
    });

  const clear = () =>
    start(async () => {
      const { removed } = await clearResponsesAction(id);
      setConfirm(null);
      setTyped("");
      toast.success(`Cleared ${removed} ${removed === 1 ? "answer" : "answers"}.`);
      router.refresh();
    });

  const remove = () =>
    start(async () => {
      progress.start();
      const r = await deleteProjectAction(id, typed);
      if (r && !r.ok) {
        progress.done();
        toast.error(r.message);
      }
    });

  return (
    <section className="space-y-6">
      <h2 className="text-sm font-medium">Settings</h2>

      <div className="grid gap-6 rounded-lg border border-border bg-card p-5 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="space-y-2">
          <Label htmlFor="project-name">Name</Label>
          <Input id="project-name" value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={60} onKeyDown={(e) => e.key === "Enter" && rename()} />
          <p className="text-xs text-muted-foreground">Only shown to you. The name on the page itself lives in the editor.</p>
        </div>
        <Button variant="outline" onClick={rename} disabled={pending || draft.trim() === name || draft.trim().length < 2}>
          <Pencil /> Rename
        </Button>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        <Row title="Duplicate" desc="A new draft with the same page and brief. Answers don't carry over." action={<Button variant="outline" onClick={duplicate} disabled={pending}><Copy /> Duplicate</Button>} />
        <Row
          title={archived ? "Restore" : "Archive"}
          desc={archived ? "Bring it back as a draft. You can publish it again afterwards." : "Takes the page off the air and hides it from your list. Nothing is deleted; restore it any time."}
          action={
            <Button variant="outline" onClick={archive} disabled={pending}>
              {archived ? <ArchiveRestore /> : <Archive />} {archived ? "Restore" : "Archive"}
            </Button>
          }
        />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-destructive">Danger zone</h3>
        <div className="divide-y divide-destructive/20 rounded-lg border border-destructive/40 bg-card">
          <Row
            title="Clear all answers"
            desc={`Removes ${responses} ${responses === 1 ? "answer" : "answers"} — every price, reason and email — and resets the dashboard. The page stays as it is. Useful after a test run.`}
            action={
              <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirm("clear")} disabled={pending || responses === 0}>
                <Eraser /> Clear answers
              </Button>
            }
          />
          <Row
            title="Delete this page"
            desc="Permanently deletes the page, its answers and its stats. The link stops working. This cannot be undone."
            action={
              <Button variant="destructive" onClick={() => setConfirm("delete")} disabled={pending}>
                <Trash2 /> Delete page
              </Button>
            }
          />
        </div>
      </div>

      <Dialog open={confirm !== null} onOpenChange={(o) => !o && (setConfirm(null), setTyped(""))}>
        <DialogContent>
          {confirm === "clear" ? (
            <>
              <DialogHeader>
                <DialogTitle>Clear all answers?</DialogTitle>
                <DialogDescription>
                  {responses} {responses === 1 ? "answer" : "answers"} will be removed for good — including any emails people left. The page itself is untouched.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirm(null)} disabled={pending}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={clear} disabled={pending}>
                  {pending && <Loader2 className="animate-spin" />} Clear {responses} {responses === 1 ? "answer" : "answers"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Delete {name}?</DialogTitle>
                <DialogDescription>
                  This permanently deletes the page, all {responses} {responses === 1 ? "answer" : "answers"}, and its stats. The public link will stop working. Type{" "}
                  <span className="font-medium text-foreground">{name}</span> to confirm.
                </DialogDescription>
              </DialogHeader>
              <Input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={name} autoFocus onKeyDown={(e) => e.key === "Enter" && typed.trim() === name && remove()} />
              <DialogFooter>
                <Button variant="outline" onClick={() => setConfirm(null)} disabled={pending}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={remove} disabled={pending || typed.trim() !== name}>
                  {pending && <Loader2 className="animate-spin" />} Delete this page
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Row({ title, desc, action }: { title: string; desc: string; action: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}
