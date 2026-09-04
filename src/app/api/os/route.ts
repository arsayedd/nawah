import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { pickOsState, type OsPayload } from "@/lib/os/payload";
import { osStatus, readOs, writeOs } from "@/lib/os/repo";
import { redactForClient } from "@/lib/scope";
import { SESSION_COOKIE, readSession } from "@/lib/session";
import type { Locale } from "@/lib/types";
import { seed } from "@/data/seed";

async function requireSession() {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value);
}

function present(state: Awaited<ReturnType<typeof readOs>>["state"], session: NonNullable<Awaited<ReturnType<typeof requireSession>>>) {
  if (session.kind === "client" && session.clientId) return redactForClient(state, session.clientId);
  return state;
}

export async function GET() {
  try {
    const session = await requireSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const data = await readOs();
    const status = await osStatus();
    const state = present(data.state, session);
    return NextResponse.json({
      locale: data.locale,
      state: {
        ...state,
        prefs: { ...state.prefs, currentUserId: session.kind === "staff" ? session.userId : state.prefs.currentUserId },
      },
      revision: data.revision,
      schemaVersion: data.schemaVersion,
      status,
      session,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.kind === "client") {
      return NextResponse.json({ error: "Portal users cannot write the workspace snapshot" }, { status: 403 });
    }
    const me = seed.employees.find((e) => e.id === session.userId);
    if (me?.accessRole === "reviewer") {
      return NextResponse.json({ error: "Reviewer cannot save the workspace" }, { status: 403 });
    }
    const body = (await request.json()) as Partial<OsPayload> & { locale?: Locale; revision?: number };
    if (!body.state) {
      return NextResponse.json({ error: "Missing state" }, { status: 400 });
    }
    const nextState = pickOsState(body.state);
    nextState.prefs = { ...nextState.prefs, currentUserId: session.userId };
    const saved = await writeOs(
      {
        locale: body.locale ?? "en",
        state: nextState,
      },
      { expectedRevision: body.revision },
    );
    if (saved.conflict) {
      return NextResponse.json(
        { error: "conflict", revision: saved.revision, state: saved.state },
        { status: 409 },
      );
    }
    return NextResponse.json({ backend: saved.backend, revision: saved.revision });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
