import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/types";

let cached: ReturnType<typeof createClient<Database>> | null = null;

/** Service-role client. Bypasses RLS — only for trusted server code (public response/view writes). */
export function createAdminClient() {
  if (cached) return cached;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!key) throw new Error("SUPABASE_SECRET_KEY is not set");
  cached = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
