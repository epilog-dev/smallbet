"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { IdeaBriefSchema, IdeaInputSchema } from "@/lib/ai/types";
import { createProject as dbCreateProject, logGeneration, saveDocument as dbSaveDocument, setStatus, setSlug, uniqueSlug, VersionConflictError } from "@/lib/db/projects";
import { PageDocumentSchema } from "@/lib/page-schema";
import { RESERVED_SLUGS, SLUG_RE } from "@/lib/slug";
import { createClient, getUser } from "@/lib/supabase/server";

async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

const CreateSchema = z.object({
  idea: IdeaInputSchema,
  brief: IdeaBriefSchema.nullable(),
  document: PageDocumentSchema,
  usage: z.object({ generator: z.string(), inputTokens: z.number().optional(), outputTokens: z.number().optional(), ms: z.number() }).optional(),
});

export async function createProjectAction(raw: z.input<typeof CreateSchema>): Promise<{ id: string }> {
  const user = await requireUser();
  const args = CreateSchema.parse(raw);
  const db = await createClient();
  const project = await dbCreateProject(db, user.id, { idea: args.idea, brief: args.brief, document: args.document });
  if (args.usage) {
    await logGeneration(db, user.id, { projectId: project.id, kind: "document", generator: args.usage.generator, inputTokens: args.usage.inputTokens, outputTokens: args.usage.outputTokens, ms: args.usage.ms });
  }
  revalidatePath("/app");
  return { id: project.id };
}

export async function saveDocumentAction(id: string, rawDoc: unknown, expectedVersion: number): Promise<{ ok: true; version: number } | { ok: false; conflict: true; message: string }> {
  await requireUser();
  const db = await createClient();
  try {
    const r = await dbSaveDocument(db, id, PageDocumentSchema.parse(rawDoc), expectedVersion);
    revalidatePath(`/app/projects/${id}`);
    return { ok: true, version: r.version };
  } catch (e) {
    if (e instanceof VersionConflictError) return { ok: false, conflict: true, message: e.message };
    throw e;
  }
}

export async function publishAction(id: string, publish: boolean): Promise<void> {
  await requireUser();
  const db = await createClient();
  await setStatus(db, id, publish ? "published" : "draft");
  revalidatePath("/app");
  revalidatePath(`/app/projects/${id}`);
}

export async function archiveAction(id: string): Promise<void> {
  await requireUser();
  const db = await createClient();
  await setStatus(db, id, "archived");
  revalidatePath("/app");
  redirect("/app");
}

export async function changeSlugAction(id: string, wanted: string): Promise<{ ok: true; slug: string } | { ok: false; message: string }> {
  await requireUser();
  const slug = wanted.trim().toLowerCase();
  if (!SLUG_RE.test(slug)) return { ok: false, message: "Use 3–40 lowercase letters, numbers and hyphens." };
  if (RESERVED_SLUGS.has(slug)) return { ok: false, message: "That address is reserved." };
  const db = await createClient();
  const free = await uniqueSlug(db, slug, id);
  if (free !== slug) return { ok: false, message: "That address is taken." };
  await setSlug(db, id, slug);
  revalidatePath(`/app/projects/${id}`);
  return { ok: true, slug };
}

export async function signOutAction() {
  const db = await createClient();
  await db.auth.signOut();
  redirect("/login");
}
