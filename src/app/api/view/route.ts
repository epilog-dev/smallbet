import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateVisitorId } from "@/lib/visitor";

export const runtime = "nodejs";

const Schema = z.object({
  slug: z.string().min(1).max(60),
  referrer: z.string().max(500).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
});

/** Page-view beacon. One row per visitor per page per day (deduped in the RPC). */
export async function POST(req: Request) {
  if (!rateLimit(`view:${clientIp(req)}`).ok) return new NextResponse(null, { status: 429 });
  const parsed = Schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return new NextResponse(null, { status: 422 });
  const visitor = await getOrCreateVisitorId();
  const db = await createClient();
  await db.rpc("record_view", { p_slug: parsed.data.slug, p_visitor: visitor, p_referrer: parsed.data.referrer ?? null, p_utm: parsed.data.utm ?? null });
  return new NextResponse(null, { status: 204 });
}
