import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageRenderer } from "@/components/page/PageRenderer";
import { ViewBeacon } from "@/components/page/ViewBeacon";
import { getPublishedProjectBySlug } from "@/lib/db/projects";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function load(slug: string) {
  const db = await createClient();
  const project = await getPublishedProjectBySlug(db, slug);
  if (!project) return null;
  const { data } = await db.rpc("project_public_stats", { p_slug: slug });
  const stats = data?.[0] ?? { responses: 0, would_pay: 0 };
  return { project, stats };
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) return { title: "Page not found" };
  const { meta } = r.project.document;
  return {
    title: { absolute: meta.seoTitle },
    description: meta.seoDescription,
    openGraph: { title: meta.seoTitle, description: meta.seoDescription, type: "website" },
    twitter: { card: "summary_large_image", title: meta.seoTitle, description: meta.seoDescription },
    robots: { index: true, follow: true },
  };
}

export default async function PublicPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) notFound();
  const { project, stats } = r;
  const publishedAt = project.published_at ? new Date(project.published_at) : new Date(project.created_at);
  const deadline = new Date(publishedAt.getTime() + project.document.goal.deadlineDays * 86400000);
  const daysLeft = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000));

  return (
    <>
      <PageRenderer
        doc={project.document}
        mode="live"
        slug={project.slug}
        stats={{ responses: stats.responses, wouldPay: stats.would_pay, target: project.document.goal.targetResponses, daysLeft }}
      />
      <ViewBeacon slug={project.slug} />
    </>
  );
}
