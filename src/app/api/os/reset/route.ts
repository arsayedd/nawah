import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { resetOs } from "@/lib/os/repo";
import { SESSION_COOKIE, readSession } from "@/lib/session";
import type { Locale } from "@/lib/types";
import { seed } from "@/data/seed";

export async function POST(request: Request) {
  try {
    const jar = await cookies();
    const session = await readSession(jar.get(SESSION_COOKIE)?.value);
    if (!session || session.kind !== "staff") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const me = seed.employees.find((e) => e.id === session.userId);
    if (me?.accessRole !== "owner" && me?.accessRole !== "admin") {
      return NextResponse.json({ error: "Only owner can reset the demo" }, { status: 403 });
    }
    const body = (await request.json().catch(() => ({}))) as { locale?: Locale };
    const data = await resetOs(body.locale ?? "en");
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
