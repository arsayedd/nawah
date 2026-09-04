export const SESSION_COOKIE = "nawah_session";

export type Session = {
  kind: "staff" | "client";
  userId: string;
  clientId?: string;
  name: string;
  role?: string;
};

function secret() {
  return process.env.NAWAH_SESSION_SECRET || "nawah-dev-only-change-me";
}

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromB64url(s: string) {
  const pad = s.replaceAll("-", "+").replaceAll("_", "/");
  const bin = atob(pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return b64url(sig);
}

export async function signSession(session: Session) {
  const payload = b64url(new TextEncoder().encode(JSON.stringify(session)));
  const mac = await hmac(payload);
  return `${payload}.${mac}`;
}

export async function readSession(token: string | undefined | null): Promise<Session | null> {
  if (!token || !token.includes(".")) return null;
  const [payload, mac] = token.split(".");
  if (!payload || !mac) return null;
  const expected = await hmac(payload);
  if (expected.length !== mac.length) return null;
  let ok = 0;
  for (let i = 0; i < expected.length; i += 1) ok |= expected.charCodeAt(i) ^ mac.charCodeAt(i);
  if (ok !== 0) return null;
  try {
    const json = new TextDecoder().decode(fromB64url(payload));
    const parsed = JSON.parse(json) as Session;
    if (parsed.kind !== "staff" && parsed.kind !== "client") return null;
    if (!parsed.userId) return null;
    if (parsed.kind === "client" && !parsed.clientId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function sessionFromCookieHeader(cookieHeader: string | null) {
  const cookie = cookieHeader ?? "";
  const match = cookie.match(/(?:^|; )nawah_session=([^;]*)/);
  return readSession(match ? decodeURIComponent(match[1]) : null);
}

export function demoStaffPassword() {
  return process.env.NAWAH_DEMO_PASSWORD || "nawah";
}

export function demoPortalPassword() {
  return process.env.NAWAH_PORTAL_PASSWORD || "portal";
}
