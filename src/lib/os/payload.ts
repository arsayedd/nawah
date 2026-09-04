import type { Locale, OsState } from "@/lib/types";

export type OsPayload = {
  locale: Locale;
  state: OsState;
};

const keys: (keyof OsState)[] = [
  "employees",
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
];

export function pickOsState(input: OsState): OsState {
  const out = {} as OsState;
  for (const key of keys) {
    out[key] = input[key] as never;
  }
  return out;
}
