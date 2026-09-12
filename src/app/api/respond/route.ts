import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateVisitorId } from "@/lib/visitor";

export const runtime = "nodejs";

const PostSchema = z.object({
  slug: z.string().min(1).max(60),
  kind: z.enum(["would_pay", "would_not_pay"]),
  tierId: z.string().max(40).optional(),
  amount: z.number().min(0).max(1000000).optional(),
  currency: z.string().length(3).optional(),
  interval: z.string().max(12).optional(),
  email: z.string().email().max(254).optional().or(z.literal("")),
  referrer: z.string().max(500).optional(),
  utm: z.record(z.string(), z.string().max(200)).optional(),
});

const PatchSchema = z
  .object({
    responseId: z.string().uuid(),
    reason: z.string().min(1).max(1000).optional(),
    email: z.string().email().max(254).optional(),
  })
  .refine((v) => v.reason || v.email, { message: "Nothing to update" });

function limited(req: Request) {
  const r = rateLimit(`respond:${clientIp(req)}`);
  return r.ok ? null : NextResponse.json({ error: "Too many requests. Try again in a moment." }, { status: 429, headers: { "retry-after": String(r.retryAfter ?? 5) } });
}

export async function POST(req: Request) {
  const lim = limited(req);
  if (lim) return lim;
  const parsed = PostSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid response" }, { status: 422 });
  const b = parsed.data;
  const visitor = await getOrCreateVisitorId();
  const db = await createClient();
  const { data, error } = await db.rpc("submit_response", {
    p_slug: b.slug,
    p_visitor: visitor,
    p_kind: b.kind,
    p_tier_id: b.tierId ?? null,
    p_amount_cents: b.amount != null ? Math.round(b.amount * 100) : null,
    p_currency: b.currency ?? null,
    p_interval: b.interval ?? null,
    p_email: b.email || null,
    p_referrer: b.referrer ?? req.headers.get("referer") ?? null,
    p_utm: b.utm ?? null,
  });
  if (error) {
    const notFound = error.code === "P0002";
    return NextResponse.json({ error: notFound ? "This page is not accepting answers." : "Couldn't record your answer." }, { status: notFound ? 404 : 500 });
  }
  const row = data?.[0];
  if (!row) return NextResponse.json({ error: "Couldn't record your answer." }, { status: 500 });
  // Per-option counts power the "here's how everyone else answered" reveal.
  const { data: bucketRows } = await db.rpc("project_public_buckets", { p_slug: b.slug });
  const buckets = (bucketRows ?? []).map((r) => ({ tierId: r.tier_id, count: r.n }));
  return NextResponse.json({ ok: true, responseId: row.id, stats: { responses: row.responses, wouldPay: row.would_pay, buckets } });
}

export async function PATCH(req: Request) {
  const lim = limited(req);
  if (lim) return lim;
  const parsed = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reason" }, { status: 422 });
  const visitor = await getOrCreateVisitorId();
  const db = await createClient();
  const { error } = await db.rpc("set_response_details", {
    p_id: parsed.data.responseId,
    p_visitor: visitor,
    p_reason: parsed.data.reason ?? null,
    p_email: parsed.data.email ?? null,
  });
  if (error) return NextResponse.json({ error: "Couldn't save that." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
