import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { seed } from "@/data/seed";
import {
  SESSION_COOKIE,
  demoPortalPassword,
  demoStaffPassword,
  readSession,
  signSession,
  type Session,
} from "@/lib/session";

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.NODE_ENV === "production",
  };
}

export async function GET() {
  const jar = await cookies();
  const session = await readSession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ session: null }, { status: 401 });
  return NextResponse.json({ session });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
    kind?: "staff" | "client";
  };
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  if (body.kind === "client") {
    if (password !== demoPortalPassword()) {
      return NextResponse.json({ error: "Wrong portal password" }, { status: 401 });
    }
    const client = seed.clients.find((c) => c.email.toLowerCase() === email && c.portalEnabled);
    if (!client) return NextResponse.json({ error: "No portal for this email" }, { status: 401 });
    const session: Session = {
      kind: "client",
      userId: `client:${client.id}`,
      clientId: client.id,
      name: client.name,
      role: "client",
    };
    const token = await signSession(session);
    const res = NextResponse.json({ session });
    res.cookies.set(SESSION_COOKIE, token, cookieOptions());
    return res;
  }

  if (password !== demoStaffPassword()) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  const employee = seed.employees.find((e) => e.email?.toLowerCase() === email && e.status !== "inactive");
  if (!employee) return NextResponse.json({ error: "Unknown staff email" }, { status: 401 });
  const session: Session = {
    kind: "staff",
    userId: employee.id,
    name: employee.name,
    role: employee.accessRole ?? "team",
  };
  const token = await signSession(session);
  const res = NextResponse.json({ session });
  res.cookies.set(SESSION_COOKIE, token, cookieOptions());
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return res;
}
