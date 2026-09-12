import { cookies } from "next/headers";
import { nanoid } from "nanoid";

export const VISITOR_COOKIE = "vp_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Reads the anonymous visitor id, minting one when missing. Only callable from route handlers / actions (sets a cookie). */
export async function getOrCreateVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing && /^[A-Za-z0-9_-]{16,32}$/.test(existing)) return existing;
  const id = nanoid(21);
  store.set(VISITOR_COOKIE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: ONE_YEAR, path: "/" });
  return id;
}
