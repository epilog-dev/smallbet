"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changeSlugAction, publishAction } from "@/app/(app)/app/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PublishControls({ id, status, slug, publicUrl }: { id: string; status: string; slug: string; publicUrl: string }) {
  const [open, setOpen] = useState(false);
  const [wanted, setWanted] = useState(slug);
  const [pending, start] = useTransition();
  const [copied, setCopied] = useState(false);
  const published = status === "published";
  const origin = publicUrl.replace(/\/p\/.*$/, "");

  const copy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const publish = () =>
    start(async () => {
      if (wanted !== slug) {
        const r = await changeSlugAction(id, wanted);
        if (!r.ok) {
          toast.error(r.message);
          return;
        }
      }
      await publishAction(id, true);
      setOpen(false);
      toast.success("Published. Share the link to start collecting answers.");
    });

  const unpublish = () =>
    start(async () => {
      await publishAction(id, false);
      toast("Unpublished. The link now shows nothing.");
    });

  if (published) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={copy} aria-label={copied ? "Copied" : "Copy link"}>
          {copied ? <Check /> : <Copy />} <span className="hidden sm:inline">{copied ? "Copied" : "Copy link"}</span>
        </Button>
        <Button variant="ghost" onClick={unpublish} disabled={pending}>
          {pending && <Loader2 className="animate-spin" />} Unpublish
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Globe /> Publish
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Publish this page</DialogTitle>
          <DialogDescription>Anyone with the link can view it and answer. You can unpublish at any time.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="slug">Address</Label>
          <div className="flex items-center gap-1 text-sm">
            <span className="text-muted-foreground">{origin.replace(/^https?:\/\//, "")}/p/</span>
            <Input id="slug" value={wanted} onChange={(e) => setWanted(e.target.value.toLowerCase())} className="flex-1" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={publish} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />} Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
