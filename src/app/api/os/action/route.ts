import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { readOs, writeOs } from "@/lib/os/repo";
import { SESSION_COOKIE, readSession } from "@/lib/session";

export async function POST(request: Request) {
  const jar = await cookies();
  const session = await readSession(jar.get(SESSION_COOKIE)?.value);
  if (!session || session.kind !== "client" || !session.clientId) {
    return NextResponse.json({ error: "Portal session required" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { type?: string; taskId?: string };
  const data = await readOs();
  const state = data.state;
  if (body.type === "approveDeliverable" && body.taskId) {
    const task = state.tasks.find((t) => t.id === body.taskId);
    const project = state.projects.find((p) => p.id === task?.projectId);
    if (!task || project?.clientId !== session.clientId) {
      return NextResponse.json({ error: "Not your deliverable" }, { status: 403 });
    }
    const next = {
      ...state,
      tasks: state.tasks.map((t) =>
        t.id === body.taskId ? { ...t, status: "done" as const, approvalStatus: "approved" as const } : t,
      ),
    };
    const saved = await writeOs({ locale: data.locale, state: next }, { expectedRevision: data.revision });
    if (saved.conflict) return NextResponse.json({ error: "conflict" }, { status: 409 });
    return NextResponse.json({ ok: true, revision: saved.revision });
  }
  if (body.type === "requestRevision" && body.taskId) {
    const task = state.tasks.find((t) => t.id === body.taskId);
    const project = state.projects.find((p) => p.id === task?.projectId);
    if (!task || project?.clientId !== session.clientId) {
      return NextResponse.json({ error: "Not your deliverable" }, { status: 403 });
    }
    const next = {
      ...state,
      tasks: state.tasks.map((t) =>
        t.id === body.taskId
          ? {
              ...t,
              status: "doing" as const,
              approvalStatus: "revision" as const,
              revisionCount: t.revisionCount + 1,
            }
          : t,
      ),
    };
    const saved = await writeOs({ locale: data.locale, state: next }, { expectedRevision: data.revision });
    if (saved.conflict) return NextResponse.json({ error: "conflict" }, { status: 409 });
    return NextResponse.json({ ok: true, revision: saved.revision });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
