import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Pencil } from "lucide-react";
import { PageRenderer } from "@/components/page/PageRenderer";
import { FramedPreview } from "@/components/app/FramedPreview";
import { PublishControls } from "@/components/app/PublishControls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/components/app/dashboard/Dashboard";
import { computePricingStats } from "@/lib/analytics/pricing-stats";
import { getProject } from "@/lib/db/projects";
import { countViews, listResponses } from "@/lib/db/responses";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/app/projects/[id]">): Promise<Metadata> {
  const { id } = await params;
  const db = await createClient();
  const p = await getProject(db, id);
  return { title: p?.name ?? "Project" };
}

export default async function ProjectPage({ params }: PageProps<"/app/projects/[id]">) {
  const { id } = await params;
  const db = await createClient();
  const project = await getProject(db, id);
  if (!project) notFound();
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/p/${project.slug}`;
  const published = project.status === "published";
  const [rows, views] = await Promise.all([listResponses(db, project.id), countViews(db, project.id)]);
  const stats = computePricingStats(project.document, rows, views, project.published_at);
  const pricing = project.document.sections.find((s) => s.type === "pricing-intent");
  const tierNames = Object.fromEntries(pricing?.type === "pricing-intent" ? pricing.props.tiers.map((t) => [t.id, t.name]) : []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{project.name}</h1>
            <Badge variant={project.status === "published" ? "default" : "secondary"} className="capitalize">
              {project.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {project.status === "published" ? (
              <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline-offset-4 hover:underline">
                {publicUrl.replace(/^https?:\/\//, "")} <ExternalLink className="size-3" />
              </a>
            ) : (
              <>Will publish at {publicUrl.replace(/^https?:\/\//, "")}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" render={<Link href={`/app/projects/${project.id}/edit`} />} nativeButton={false}>
            <Pencil /> Edit page
          </Button>
          <PublishControls id={project.id} status={project.status} slug={project.slug} publicUrl={publicUrl} />
        </div>
      </div>

      <Dashboard stats={stats} rows={rows} tierNames={tierNames} projectName={project.name} published={project.status === "published"} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium">Page</h2>
          {published ? (
            <Button variant="outline" size="sm" render={<a href={publicUrl} target="_blank" rel="noreferrer" />} nativeButton={false}>
              <ExternalLink /> Open live page
            </Button>
          ) : (
            <Button variant="outline" size="sm" render={<Link href={`/app/projects/${project.id}/edit`} />} nativeButton={false}>
              <Pencil /> Open in editor
            </Button>
          )}
        </div>
        {/* A glimpse, not the whole page: the full thing lives at the link above. */}
        <div className="relative max-h-[26rem] overflow-hidden rounded-lg border border-border bg-background">
          <FramedPreview width={1280} narrowWidth={390} maxScale={1}>
            <PageRenderer doc={project.document} mode="preview" noReveal />
          </FramedPreview>
          <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t from-background to-transparent" />
          <div className="absolute inset-x-0 bottom-4 flex justify-center">
            {published ? (
              <Button size="sm" render={<a href={publicUrl} target="_blank" rel="noreferrer" />} nativeButton={false}>
                View the full page <ExternalLink />
              </Button>
            ) : (
              <Button size="sm" render={<Link href={`/app/projects/${project.id}/edit`} />} nativeButton={false}>
                View the full page in the editor <Pencil />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
