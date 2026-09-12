"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { IdeaBriefSchema, IdeaInputSchema } from "@/lib/ai/types";
import { createProject as dbCreateProject, logGeneration, saveDocument as dbSaveDocument, setStatus, setSlug, uniqueSlug, VersionConflictError } from "@/lib/db/projects";
import { PageDocumentSchema, repairDocument } from "@/lib/page-schema";
import { RESERVED_SLUGS, SLUG_RE } from "@/lib/slug";
import { computePricingStats } from "@/lib/analytics/pricing-stats";
import { unlockState } from "@/lib/billing/unlock";
import { startCheckout } from "@/lib/billing/provider";
import { getProject } from "@/lib/db/projects";
import { countViews, listResponses } from "@/lib/db/responses";
import { createAdminClient } from "@/lib/supabase/admin";
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
    const r = await dbSaveDocument(db, id, repairDocument(rawDoc), expectedVersion);
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
  redirect("/");
}

export type UnlockResult = { ok: true; unlocked: true } | { ok: true; redirect: string } | { ok: false; message: string };

/**
 * Pay-on-yes unlock. The price is recomputed server-side from the responses, never trusted
 * from the client. Free (market said no) and dev unlocks settle immediately; priced unlocks go
 * to the payment provider and are recorded by its webhook.
 */
export async function unlockProjectAction(id: string): Promise<UnlockResult> {
  const user = await requireUser();
  const db = await createClient();
  const project = await getProject(db, id); // RLS: only the owner can see it
  if (!project) return { ok: false, message: "Project not found." };
  if (project.unlocked_at) return { ok: true, unlocked: true };

  const [rows, views] = await Promise.all([listResponses(db, project.id), countViews(db, project.id)]);
  const state = unlockState(computePricingStats(project.document, rows, views, project.published_at), project.unlocked_at);
  if (state.kind === "collecting") return { ok: false, message: `${state.need} more ${state.need === 1 ? "answer" : "answers"} needed before the result is ready.` };
  if (state.kind === "unlocked") return { ok: true, unlocked: true };

  let provider = "free";
  let ref: string | null = null;
  let cents = 0;
  if (state.kind === "priced") {
    try {
      const r = await startCheckout({ projectId: project.id, userId: user.id, usd: state.usd, returnUrl: `/app/projects/${project.id}` });
      if (r.kind === "redirect") return { ok: true, redirect: r.url };
      provider = r.provider;
      ref = r.ref;
      cents = state.usd * 100;
    } catch (e) {
      return { ok: false, message: e instanceof Error ? e.message : "Couldn't start checkout." };
    }
  }

  const admin = createAdminClient();
  const { error: e1 } = await admin.from("unlocks").insert({ project_id: project.id, owner_id: user.id, amount_cents: cents, currency: "USD", provider, provider_ref: ref });
  if (e1) return { ok: false, message: "Couldn't record the unlock." };
  const { error: e2 } = await admin.from("projects").update({ unlocked_at: new Date().toISOString() }).eq("id", project.id);
  if (e2) return { ok: false, message: "Couldn't unlock the project." };
  revalidatePath(`/app/projects/${project.id}`);
  return { ok: true, unlocked: true };
}
