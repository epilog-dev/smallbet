import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { IdeaBrief, IdeaInput } from "@/lib/ai/types";
import { PageDocumentSchema, repairDocument, type PageDocument } from "@/lib/page-schema";
import { randomSuffix, RESERVED_SLUGS, slugify } from "@/lib/slug";
import type { Database, Tables } from "./types";

type Db = SupabaseClient<Database>;
export type ProjectRow = Tables<"projects">;
export type ProjectStatus = ProjectRow["status"];

export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  responses: number;
  would_pay: number;
  views: number;
  document: PageDocument;
}

export interface Project extends Omit<ProjectRow, "document" | "brief" | "idea"> {
  document: PageDocument;
  brief: IdeaBrief | null;
  idea: IdeaInput;
}

function parseProject(row: ProjectRow): Project {
  return {
    ...row,
    // repair() also migrates older document shapes (e.g. the pre-visual-kinds hero).
    document: repairDocument(row.document),
    brief: (row.brief as IdeaBrief | null) ?? null,
    idea: row.idea as IdeaInput,
  };
}

/** Every read of `projects` from the app is owner-scoped here, on top of RLS — belt and braces. */
export async function listProjects(db: Db, ownerId: string, opts: { archived?: boolean } = {}): Promise<ProjectSummary[]> {
  let q = db
    .from("projects")
    .select("id,name,slug,status,created_at,updated_at,published_at,document,responses(kind),page_views(count)")
    .eq("owner_id", ownerId)
    .order("updated_at", { ascending: false });
  q = opts.archived ? q.eq("status", "archived") : q.neq("status", "archived");
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r) => {
    const responses = (r.responses as Array<{ kind: string }>) ?? [];
    const views = (r.page_views as unknown as Array<{ count: number }>)?.[0]?.count ?? 0;
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      status: r.status,
      created_at: r.created_at,
      updated_at: r.updated_at,
      published_at: r.published_at,
      responses: responses.length,
      would_pay: responses.filter((x) => x.kind === "would_pay").length,
      views,
      document: repairDocument(r.document),
    };
  });
}

export async function getProject(db: Db, ownerId: string, id: string): Promise<Project | null> {
  const { data, error } = await db.from("projects").select("*").eq("id", id).eq("owner_id", ownerId).maybeSingle();
  if (error) throw error;
  return data ? parseProject(data) : null;
}

/** What a public page is allowed to know. Read through the `published_pages` view — never the table. */
export interface PublishedPage {
  id: string;
  slug: string;
  name: string;
  document: PageDocument;
  published_at: string | null;
  created_at: string;
}

export async function getPublishedProjectBySlug(db: Db, slug: string): Promise<PublishedPage | null> {
  const { data, error } = await db.from("published_pages").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ? { ...data, document: repairDocument(data.document) } : null;
}

/** Picks a free slug from the product name, appending a short suffix on collision. */
export async function uniqueSlug(db: Db, base: string, excludeId?: string): Promise<string> {
  let candidate = slugify(base);
  if (RESERVED_SLUGS.has(candidate)) candidate = `${candidate}-page`;
  for (let attempt = 0; attempt < 6; attempt++) {
    // Definer RPC: owners can't see each other's rows, but slugs are unique across everyone.
    const { data: taken, error } = await db.rpc("slug_taken", { p_slug: candidate, p_exclude: excludeId ?? null });
    if (error) throw error;
    if (!taken) return candidate;
    candidate = `${slugify(base).slice(0, 34)}-${randomSuffix()}`;
  }
  return `${slugify(base).slice(0, 30)}-${randomSuffix(6)}`;
}

export async function createProject(db: Db, ownerId: string, args: { idea: IdeaInput; brief: IdeaBrief | null; document: PageDocument }): Promise<Project> {
  const doc = PageDocumentSchema.parse(args.document);
  const slug = await uniqueSlug(db, doc.meta.productName);
  const { data, error } = await db
    .from("projects")
    .insert({ owner_id: ownerId, name: doc.meta.productName, slug, idea: args.idea, brief: args.brief, document: doc })
    .select("*")
    .single();
  if (error) throw error;
  return parseProject(data);
}

export class VersionConflictError extends Error {
  constructor() {
    super("This page was changed elsewhere. Reload to get the latest version.");
  }
}

/** Optimistic-concurrency save: only writes if the stored version matches. */
export async function saveDocument(db: Db, id: string, document: PageDocument, expectedVersion: number): Promise<{ version: number }> {
  const doc = PageDocumentSchema.parse(document);
  const { data, error } = await db
    .from("projects")
    .update({ document: doc, name: doc.meta.productName, version: expectedVersion + 1 })
    .eq("id", id)
    .eq("version", expectedVersion)
    .select("version")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new VersionConflictError();
  return { version: data.version };
}

export async function setStatus(db: Db, id: string, status: ProjectStatus): Promise<void> {
  const patch: Partial<ProjectRow> = { status };
  if (status === "published") patch.published_at = new Date().toISOString();
  const { error } = await db.from("projects").update(patch).eq("id", id);
  if (error) throw error;
}

export async function setSlug(db: Db, id: string, slug: string): Promise<void> {
  const { error } = await db.from("projects").update({ slug }).eq("id", id);
  if (error) throw error;
}

export async function logGeneration(db: Db, ownerId: string, args: { projectId?: string; kind: "brief" | "document" | "section"; generator: string; inputTokens?: number; outputTokens?: number; ms: number }) {
  await db.from("generations").insert({
    owner_id: ownerId,
    project_id: args.projectId ?? null,
    kind: args.kind,
    generator: args.generator,
    input_tokens: args.inputTokens ?? null,
    output_tokens: args.outputTokens ?? null,
    ms: args.ms,
  });
}

export async function renameProject(db: Db, id: string, name: string): Promise<void> {
  const { error } = await db.from("projects").update({ name }).eq("id", id);
  if (error) throw error;
}

/** A fresh draft with the same idea, brief and document; nothing else carries over. */
export async function duplicateProject(db: Db, ownerId: string, source: Project, name: string): Promise<Project> {
  const slug = await uniqueSlug(db, name);
  const { data, error } = await db
    .from("projects")
    .insert({ owner_id: ownerId, name, slug, idea: source.idea, brief: source.brief, document: { ...source.document, meta: { ...source.document.meta, productName: name } } })
    .select("*")
    .single();
  if (error) throw error;
  return parseProject(data);
}

/** Permanent. Responses, views and generation logs go with it (FK cascade). */
export async function deleteProject(db: Db, id: string): Promise<void> {
  const { error } = await db.from("projects").delete().eq("id", id);
  if (error) throw error;
}
