import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Editor } from "@/components/app/editor/Editor";
import { getProject } from "@/lib/db/projects";
import { createClient, getUser } from "@/lib/supabase/server";

export async function generateMetadata({ params }: PageProps<"/app/projects/[id]/edit">): Promise<Metadata> {
  const { id } = await params;
  const db = await createClient();
  const user = await getUser();
  const p = user ? await getProject(db, user.id, id) : null;
  return { title: p ? `Edit · ${p.name}` : "Edit" };
}

export default async function EditPage({ params }: PageProps<"/app/projects/[id]/edit">) {
  const { id } = await params;
  const db = await createClient();
  const user = (await getUser())!; // layout redirects anonymous visitors
  const project = await getProject(db, user.id, id);
  if (!project) notFound();
  const publicUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/p/${project.slug}`;
  return (
    <Editor
      project={{ id: project.id, slug: project.slug, status: project.status, version: project.version, brief: project.brief, document: project.document }}
      publicUrl={publicUrl}
    />
  );
}
