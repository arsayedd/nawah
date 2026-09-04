import { seed } from "@/data/seed";
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
  "activities",
  "audit",
];

export function pickOsState(input: Partial<OsState> | OsState): OsState {
  const out = {} as OsState;
  for (const key of keys) {
    out[key] = (input[key] ?? seed[key]) as never;
  }
  return out;
}
