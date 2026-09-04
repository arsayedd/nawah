import { seed } from "@/data/seed";
import type { Locale, OsState } from "@/lib/types";

export type OsPayload = {
  locale: Locale;
  state: OsState;
  schemaVersion?: number;
};

export const OS_SCHEMA = 3;

const keys: (keyof OsState)[] = [
  "prefs",
  "employees",
  "notices",
  "mail",
  "chatRooms",
  "entityComments",
  "leads",
  "clients",
  "contacts",
  "catalog",
  "quotes",
  "projects",
  "tasks",
  "invoices",
  "payments",
  "expenses",
  "timeEntries",
  "docs",
  "tickets",
  "meetings",
  "alerts",
  "contracts",
  "portalInvites",
  "discoveries",
  "messages",
  "files",
  "automations",
  "automationLogs",
  "subscriptions",
  "reviewPins",
  "spaces",
  "retainers",
  "leaves",
  "attendance",
  "payroll",
  "bookingSlots",
  "bookingTypes",
  "activities",
  "audit",
  "docComments",
];

function fillCollection<K extends keyof OsState>(
  remote: Partial<OsState> | OsState | null | undefined,
  key: K,
): OsState[K] {
  const current = remote?.[key];
  const fallback = seed[key];
  if (Array.isArray(current) && Array.isArray(fallback)) {
    if (current.length > 0) return current as OsState[K];
    return fallback;
  }
  return (current ?? fallback) as OsState[K];
}

export function mergeOsState(remote?: Partial<OsState> | OsState | null): OsState {
  const out = {} as OsState;
  for (const key of keys) {
    out[key] = fillCollection(remote, key) as never;
  }
  out.clients = out.clients.map((c) => ({
    ...c,
    accountManagerId: c.accountManagerId ?? "u_sara",
    portalEnabled: c.portalEnabled ?? true,
  }));
  out.prefs = {
    ...seed.prefs,
    ...(remote?.prefs ?? {}),
    hiddenNav: remote?.prefs?.hiddenNav ?? seed.prefs.hiddenNav,
    hiddenHomeWidgets: remote?.prefs?.hiddenHomeWidgets ?? seed.prefs.hiddenHomeWidgets,
    hiddenPageSections: remote?.prefs?.hiddenPageSections ?? seed.prefs.hiddenPageSections,
    editLayout: remote?.prefs?.editLayout ?? seed.prefs.editLayout,
    currentUserId: remote?.prefs?.currentUserId ?? seed.prefs.currentUserId,
  };
  return out;
}

export function pickOsState(input: Partial<OsState> | OsState): OsState {
  return mergeOsState(input);
}

export function isSparseState(state: Partial<OsState> | null | undefined): boolean {
  if (!state) return true;
  return keys.some((key) => {
    const fallback = seed[key];
    const current = state[key];
    return Array.isArray(fallback) && fallback.length > 0 && (!Array.isArray(current) || current.length === 0);
  });
}
