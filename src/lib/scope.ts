import type { AccessRole, Employee, OsState, QuoteItem } from "@/lib/types";

export function canSeeCost(employee?: Employee | null) {
  const role: AccessRole = employee?.accessRole ?? "team";
  return role === "owner" || role === "admin" || role === "finance";
}

export function canWriteWorkspace(employee?: Employee | null) {
  const role: AccessRole = employee?.accessRole ?? "team";
  return role !== "reviewer";
}

function stripQuoteCosts(items: QuoteItem[]): QuoteItem[] {
  return items.map((i) => ({
    ...i,
    hourlyCost: 0,
    toolsCost: 0,
    productionCost: 0,
    freelancerCost: 0,
  }));
}

export function redactForClient(state: OsState, clientId: string): OsState {
  const clients = state.clients.filter((c) => c.id === clientId);
  const projects = state.projects.filter((p) => p.clientId === clientId);
  const pids = new Set(projects.map((p) => p.id));
  const quotes = state.quotes
    .filter((q) => q.clientId === clientId)
    .map((q) => ({ ...q, items: stripQuoteCosts(q.items) }));
  const invoices = state.invoices.filter((i) => i.clientId === clientId);
  const files = state.files.filter((f) => f.clientId === clientId || (f.projectId && pids.has(f.projectId)));
  const tasks = state.tasks.filter((t) => pids.has(t.projectId));
  const tickets = state.tickets.filter((t) => t.clientId === clientId);
  const messages = state.messages.filter(
    (m) =>
      !m.internal &&
      (m.channelId === `client:${clientId}` || projects.some((p) => m.channelId === `project:${p.id}`)),
  );

  return {
    ...state,
    clients,
    contacts: state.contacts.filter((c) => c.clientId === clientId),
    projects: projects.map((p) => ({ ...p, expectedCost: 0 })),
    quotes,
    invoices,
    payments: state.payments.filter((p) => invoices.some((i) => i.id === p.invoiceId)),
    files,
    tasks,
    tickets,
    messages,
    docs: state.docs.filter((d) => d.clientId === clientId),
    meetings: state.meetings.filter((m) => m.clientId === clientId),
    contracts: state.contracts.filter((c) => c.clientId === clientId),
    portalInvites: state.portalInvites.filter((p) => p.clientId === clientId),
    reviewPins: state.reviewPins.filter((p) => tasks.some((t) => t.id === p.taskId)),
    employees: state.employees.map((e) => ({
      ...e,
      hourlyCost: 0,
      billRate: 0,
      salary: undefined,
      email: undefined,
      phone: undefined,
    })),
    expenses: [],
    payroll: [],
    timeEntries: [],
    subscriptions: [],
    catalog: [],
    leads: [],
    mail: [],
    chatRooms: [],
    notices: [],
    leaves: [],
    attendance: [],
    automations: [],
    automationLogs: [],
    audit: [],
    activities: [],
    retainers: [],
    discoveries: [],
    prefs: { ...state.prefs, currentUserId: `client:${clientId}`, editLayout: false },
  };
}

export function redactMoney(state: OsState): OsState {
  return {
    ...state,
    employees: state.employees.map((e) => ({
      ...e,
      hourlyCost: 0,
      billRate: e.accessRole === "sales" ? e.billRate : 0,
      salary: undefined,
    })),
    expenses: [],
    payroll: [],
    subscriptions: [],
    quotes: state.quotes.map((q) => ({ ...q, items: stripQuoteCosts(q.items) })),
    projects: state.projects.map((p) => ({ ...p, expectedCost: 0 })),
  };
}
