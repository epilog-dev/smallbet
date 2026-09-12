import { PageRenderer } from "@/components/page/PageRenderer";
import { FramedPreview } from "@/components/app/FramedPreview";
import type { PageDocument } from "@/lib/page-schema";
import { cn } from "@/lib/utils";

/** A real rendered page, scaled down and clipped — used as an artifact in marketing compositions. */
export function PageThumb({ doc, className, maxHeight = 420 }: { doc: PageDocument; className?: string; maxHeight?: number }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-background shadow-[0_20px_50px_-30px_rgba(0,0,0,0.3)]", className)}>
      <FramedPreview width={1280} minHeight={maxHeight * 3}>
        <div style={{ maxHeight: maxHeight * 3 }} className="overflow-hidden">
          <PageRenderer doc={doc} mode="preview" noReveal />
        </div>
      </FramedPreview>
    </div>
  );
}
