/** Browser-side client for the public response endpoints used by the pricing-intent widget. */

export type ResponseKind = "would_pay" | "would_not_pay";

export interface RespondPayload {
  slug: string;
  kind: ResponseKind;
  tierId?: string;
  amount?: number;
  currency?: string;
  interval?: string;
  email?: string;
}

export interface ResponseBucket {
  /** null = wouldn't pay */
  tierId: string | null;
  count: number;
}

export interface RespondStats {
  responses: number;
  wouldPay: number;
  buckets: ResponseBucket[];
}

export interface RespondResult {
  ok: true;
  responseId: string;
  stats: RespondStats;
}

export async function submitResponse(payload: RespondPayload): Promise<RespondResult> {
  const res = await fetch("/api/respond", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

/** Attach a reason and/or email to an answer already recorded. */
export async function updateResponse(responseId: string, details: { reason?: string; email?: string }): Promise<void> {
  const res = await fetch("/api/respond", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ responseId, ...details }),
  });
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
}
