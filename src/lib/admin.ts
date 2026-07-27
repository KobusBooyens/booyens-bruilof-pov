import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Minimal admin auth — no database. Credentials live in env vars
 * (ADMIN_USERNAME / ADMIN_PASSWORD). On a successful login we set an httpOnly
 * cookie whose value is an HMAC of the username keyed by the password, so it
 * can't be forged without knowing the password and never exposes it.
 */
export const ADMIN_COOKIE = "bb-admin";

/** The expected cookie value when logged in, or null if admin isn't configured. */
export function adminToken(): string | null {
  const user = process.env.ADMIN_USERNAME;
  const pass = process.env.ADMIN_PASSWORD;
  if (!user || !pass) return null;
  return createHmac("sha256", pass).update(user).digest("hex");
}

/** Constant-time string comparison that tolerates differing lengths. */
export function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** True when the current request carries a valid admin cookie. */
export function isAdmin(): boolean {
  const token = adminToken();
  if (!token) return false;
  const cookie = cookies().get(ADMIN_COOKIE)?.value;
  return !!cookie && safeEqual(cookie, token);
}
