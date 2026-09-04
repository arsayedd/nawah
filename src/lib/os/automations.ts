import type { OsState } from "@/lib/types";
import { uid } from "@/lib/utils";

const AGENCY_TODAY = "2026-09-04";

function alreadyLogged(logs: OsState["automationLogs"], automationId: string, needle: string) {
  return logs.some((l) => l.automationId === automationId && l.detail.includes(needle));
}

/** Runs enabled rules against the live workspace. Quote-accept stays in acceptQuote. */
export function applyAutomations(state: OsState, today = AGENCY_TODAY): OsState {
  let logs = [...state.automationLogs];
  let notices = [...state.notices];
  let alerts = [...state.alerts];
  const enabled = new Set(state.automations.filter((a) => a.enabled).map((a) => a.id));
  const owner = state.employees.find((e) => e.accessRole === "owner")?.id ?? "u_ahmed";

  function note(automationId: string, title: string, href: string, detail: string) {
    if (alreadyLogged(logs, automationId, detail)) return;
    logs = [
      {
        id: uid("al"),
        automationId,
        at: `${today}T12:00:00`,
        detail,
      },
      ...logs,
    ];
    notices = [
      {
        id: uid("nt"),
        userId: owner,
        fromId: owner,
        title,
        body: detail,
        href,
        channel: "inapp",
        read: false,
        createdAt: `${today}T12:00:00`,
      },
      ...notices,
    ];
    alerts = [
      { id: uid("a"), title, titleAr: title, kind: "alert", href },
      ...alerts,
    ];
  }

  if (enabled.has("auto_3")) {
    for (const inv of state.invoices) {
      if (inv.status !== "overdue" && !(inv.dueDate < today && inv.paidAmount < inv.amount)) continue;
      const client = state.clients.find((c) => c.id === inv.clientId);
      note("auto_3", `${inv.number} overdue`, "/finance", `${inv.number} flagged overdue for ${client?.name ?? inv.clientId}`);
    }
  }

  if (enabled.has("auto_4")) {
    for (const c of state.contracts) {
      if (c.status !== "signed") continue;
      const days = Math.round((new Date(`${c.endDate}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86400000);
      if (days < 0 || days > 14) continue;
      const client = state.clients.find((x) => x.id === c.clientId);
      note("auto_4", `Contract ending · ${client?.name ?? c.clientId}`, "/contracts", `${c.id} ends ${c.endDate}`);
    }
  }

  const late = state.automations.find((a) => a.id === "auto_5");
  if (!late || late.enabled) {
    for (const t of state.tasks) {
      if (!t.due || t.due >= today || t.status === "done") continue;
      note(late?.id ?? "auto_5", `Late task · ${t.title}`, `/projects/${t.projectId}`, `${t.id} due ${t.due}`);
    }
  }

  if (enabled.has("auto_2")) {
    for (const t of state.tasks) {
      if (t.revisionCount < 3) continue;
      const already = state.tickets.some((tk) => tk.title.includes(t.title) && !tk.inScope);
      if (already) continue;
      note("auto_2", `Change request · ${t.title}`, `/projects/${t.projectId}`, `${t.id} revision ${t.revisionCount}`);
    }
  }

  if (enabled.has("auto_6")) {
    for (const r of state.retainers) {
      if (r.status !== "ending") continue;
      note("auto_6", `Retainer ending · ${r.name}`, "/retainers", `${r.id} renews ${r.renewalDate}`);
    }
  }

  return { ...state, automationLogs: logs, notices, alerts };
}
