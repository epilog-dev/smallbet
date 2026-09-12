import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "./types";

type Db = SupabaseClient<Database>;
export type ResponseRow = Tables<"responses">;

export async function listResponses(db: Db, projectId: string): Promise<ResponseRow[]> {
  const { data, error } = await db.from("responses").select("*").eq("project_id", projectId).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function countViews(db: Db, projectId: string): Promise<number> {
  const { count, error } = await db.from("page_views").select("id", { count: "exact", head: true }).eq("project_id", projectId);
  if (error) throw error;
  return count ?? 0;
}
