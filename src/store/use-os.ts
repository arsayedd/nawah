"use client";

import { create } from "zustand";
import { quoteTotals, seed } from "@/data/seed";
import { pickOsState } from "@/lib/os/payload";
import type {
  Client,
  Expense,
  Invoice,
  Lead,
  Locale,
  OsState,
  PipelineStage,
  Project,
  Quote,
  Task,
  TaskStatus,
  Ticket,
} from "@/lib/types";
import { uid } from "@/lib/utils";

type QuickKind =
  | "lead"
  | "client"
  | "quote"
  | "project"
  | "task"
  | "invoice"
  | "expense"
  | "employee"
  | "meeting"
  | "request";

type AcceptResult = {
  clientId: string;
  projectId: string;
  invoiceId: string;
  quoteId: string;
};

type Store = OsState & {
  locale: Locale;
  hydrated: boolean;
  setHydrated: (v: boolean) => void;
  setLocale: (locale: Locale) => void;
  resetDemo: () => void;
  moveLead: (id: string, stage: PipelineStage) => void;
  acceptQuote: (quoteId: string) => AcceptResult | null;
  markQuoteViewed: (quoteId: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  requestRevision: (taskId: string) => void;
  approveDeliverable: (taskId: string) => void;
  logTime: (taskId: string, userId: string, hours: number) => void;
  quickAdd: (kind: QuickKind, title: string) => string;
  addQuoteFromCatalog: (opts: {
    leadId?: string;
    clientId?: string;
    catalogId: string;
  }) => string;
  hydrateFromRemote: (payload: { locale: Locale; state: OsState }) => void;
};

function pickAssignee(employees: OsState["employees"], role: string, load: Record<string, number>) {
  const scored = employees
    .filter((e) => e.id !== "u_ahmed")
    .map((e) => {
      const skill = e.skills.includes(role) ? 0 : 1;
      const hours = load[e.id] ?? 0;
      return { e, score: skill * 1000 + hours + e.hourlyCost / 1000 };
    })
    .sort((a, b) => a.score - b.score);
  return scored[0]?.e.id;
}

export const useOS = create<Store>()((set, get) => ({
      ...seed,
      locale: "en",
      hydrated: false,
      setHydrated: (v) => set({ hydrated: v }),
      hydrateFromRemote: ({ locale, state }) =>
        set({ ...pickOsState(state), locale, hydrated: true }),
      setLocale: (locale) => set({ locale }),
      resetDemo: () => {
        const locale = get().locale;
        set({ ...seed, locale, hydrated: true });
        void fetch("/api/os/reset", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale }),
        });
      },
      moveLead: (id, stage) =>
        set({
          leads: get().leads.map((l) => (l.id === id ? { ...l, stage } : l)),
        }),
      markQuoteViewed: (quoteId) =>
        set({
          quotes: get().quotes.map((q) =>
            q.id === quoteId && q.status === "sent"
              ? { ...q, status: "viewed", openedAt: new Date().toISOString() }
              : q,
          ),
        }),
      acceptQuote: (quoteId) => {
        const state = get();
        const quote = state.quotes.find((q) => q.id === quoteId);
        if (!quote || quote.status === "accepted") return null;
        const totals = quoteTotals(quote.items, quote.discount, quote.taxRate);
        const lead = quote.leadId
          ? state.leads.find((l) => l.id === quote.leadId)
          : undefined;

        let clientId = quote.clientId;
        const clients = [...state.clients];
        const contacts = [...state.contacts];
        if (!clientId && lead) {
          clientId = uid("c");
          clients.push({
            id: clientId,
            name: lead.company,
            nameAr: lead.company,
            industry: "New",
            email: lead.email,
            phone: lead.phone,
            health: 70,
            satisfaction: 8,
            portalEnabled: true,
            createdAt: new Date().toISOString().slice(0, 10),
          });
          contacts.push({
            id: uid("ct"),
            clientId,
            name: lead.name,
            role: "Decision maker",
            email: lead.email,
            phone: lead.phone,
            canApprove: true,
          });
        }
        if (!clientId) return null;

        const projectId = uid("p");
        const start = new Date();
        const due = new Date(start);
        due.setDate(due.getDate() + quote.durationWeeks * 7);
        const project: Project = {
          id: projectId,
          clientId,
          quoteId: quote.id,
          name: quote.title,
          nameAr: quote.titleAr,
          status: "healthy",
          startDate: start.toISOString().slice(0, 10),
          dueDate: due.toISOString().slice(0, 10),
          expectedRevenue: totals.afterDiscount,
          expectedCost: totals.cost,
          expectedHours: totals.hours,
        };

        const load: Record<string, number> = {};
        for (const t of state.tasks) {
          if (t.assigneeId && t.status !== "done") {
            load[t.assigneeId] = (load[t.assigneeId] ?? 0) + t.estimateHours;
          }
        }

        const tasks: Task[] = quote.items.map((item, idx) => {
          const day = new Date(start);
          day.setDate(day.getDate() + idx * 4);
          return {
            id: uid("t"),
            projectId,
            milestone: idx === 0 ? "Kickoff" : "Delivery",
            title: item.name,
            titleAr: item.nameAr,
            status: idx === 0 ? "doing" : "todo",
            priority: idx === 0 ? "high" : "med",
            assigneeId: pickAssignee(state.employees, item.role, load),
            start: start.toISOString().slice(0, 10),
            due: day.toISOString().slice(0, 10),
            estimateHours: item.hours * item.qty,
            actualHours: 0,
            billable: true,
            checklist: [
              { id: uid("ck"), text: "Brief locked", done: idx === 0 },
              { id: uid("ck"), text: "Access collected", done: false },
            ],
            revisionCount: 0,
            approvalStatus: "working",
          };
        });

        const deposit = Math.round(totals.total * quote.depositPercent);
        const invoice: Invoice = {
          id: uid("inv"),
          number: `INV-${2200 + state.invoices.length + 1}`,
          clientId,
          projectId,
          quoteId: quote.id,
          amount: deposit,
          status: "sent",
          dueDate: start.toISOString().slice(0, 10),
          paidAmount: 0,
          issuedAt: start.toISOString().slice(0, 10),
          note: "Deposit on accepted quotation",
        };

        const contract = {
          id: uid("con"),
          quoteId: quote.id,
          clientId,
          projectId,
          status: "ready" as const,
          startDate: project.startDate,
          endDate: project.dueDate,
        };

        const invite = {
          id: uid("pi"),
          clientId,
          email: lead?.email ?? clients.find((c) => c.id === clientId)?.email ?? "",
          sentAt: new Date().toISOString(),
        };

        set({
          clients,
          contacts,
          quotes: state.quotes.map((q) =>
            q.id === quote.id
              ? {
                  ...q,
                  status: "accepted",
                  clientId,
                  acceptedAt: new Date().toISOString(),
                }
              : q,
          ),
          leads: state.leads.map((l) =>
            l.id === quote.leadId ? { ...l, stage: "won" as const } : l,
          ),
          projects: [project, ...state.projects],
          tasks: [...tasks, ...state.tasks],
          invoices: [invoice, ...state.invoices],
          contracts: [contract, ...state.contracts],
          portalInvites: [invite, ...state.portalInvites],
          meetings: [
            {
              id: uid("m"),
              title: `${quote.title} kickoff`,
              titleAr: `كيك أوف ${quote.titleAr}`,
              clientId,
              projectId,
              when: new Date(start.getTime() + 86400000 * 2).toISOString(),
              notes: "Kickoff after deposit. Confirm access and timeline.",
            },
            ...state.meetings,
          ],
          alerts: [
            {
              id: uid("a"),
              title: `${quote.number} accepted — deposit invoice ${invoice.number} sent`,
              titleAr: `تم قبول ${quote.number} — فاتورة الدفعة ${invoice.number} اتبعتت`,
              kind: "success",
              href: `/projects/${projectId}`,
            },
            ...state.alerts,
          ],
          docs: [
            {
              id: uid("d"),
              title: `${quote.title} brief`,
              titleAr: `بريف ${quote.titleAr}`,
              clientId,
              projectId,
              body: quote.summary,
              bodyAr: quote.summaryAr,
            },
            ...state.docs,
          ],
        });

        return { clientId, projectId, invoiceId: invoice.id, quoteId: quote.id };
      },
      updateTaskStatus: (id, status) =>
        set({
          tasks: get().tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  approvalStatus:
                    status === "review"
                      ? "internal"
                      : status === "client"
                        ? "client"
                        : status === "done"
                          ? "delivered"
                          : t.approvalStatus,
                }
              : t,
          ),
        }),
      requestRevision: (taskId) =>
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  status: "doing",
                  approvalStatus: "revision",
                  revisionCount: t.revisionCount + 1,
                }
              : t,
          ),
          tickets:
            (get().tasks.find((t) => t.id === taskId)?.revisionCount ?? 0) >= 2
              ? [
                  {
                    id: uid("tk"),
                    clientId:
                      get().projects.find(
                        (p) => p.id === get().tasks.find((t) => t.id === taskId)?.projectId,
                      )?.clientId ?? "",
                    projectId: get().tasks.find((t) => t.id === taskId)?.projectId,
                    title: "Change request — extra revision round",
                    titleAr: "طلب تغيير — جولة تعديل إضافية",
                    priority: "high",
                    inScope: false,
                    status: "open",
                  } satisfies Ticket,
                  ...get().tickets,
                ]
              : get().tickets,
        }),
      approveDeliverable: (taskId) =>
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId
              ? { ...t, status: "done", approvalStatus: "approved" }
              : t,
          ),
        }),
      logTime: (taskId, userId, hours) =>
        set({
          timeEntries: [
            {
              id: uid("te"),
              taskId,
              userId,
              hours,
              billable: true,
              date: new Date().toISOString().slice(0, 10),
            },
            ...get().timeEntries,
          ],
          tasks: get().tasks.map((t) =>
            t.id === taskId ? { ...t, actualHours: t.actualHours + hours } : t,
          ),
        }),
      addQuoteFromCatalog: ({ leadId, clientId, catalogId }) => {
        const catalog = get().catalog.find((c) => c.id === catalogId);
        if (!catalog) return "";
        const id = uid("q");
        const quote: Quote = {
          id,
          number: `NW-${1040 + get().quotes.length + 3}`,
          leadId,
          clientId,
          title: catalog.name,
          titleAr: catalog.nameAr,
          summary: catalog.description,
          summaryAr: catalog.descriptionAr,
          lang: get().locale,
          status: "draft",
          items: catalog.items.map((item) => ({
            id: uid("qi"),
            name: item.name,
            nameAr: item.nameAr,
            qty: 1,
            hours: item.hours,
            role: item.role,
            hourlyCost: item.hourlyCost,
            sellPrice: item.sellPrice,
            toolsCost: 0,
            productionCost: 0,
            freelancerCost: 0,
            revisions: item.revisions,
          })),
          discount: 0,
          taxRate: 0.14,
          depositPercent: 0.5,
          paymentTerms: "50% to start, 50% on delivery",
          durationWeeks: 4,
          assumptions: "Client provides brand assets in week 1.",
          exclusions: "Media spend, photography, third-party licenses.",
          revisionPolicy: "Two rounds included per deliverable.",
          expiry: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set({ quotes: [quote, ...get().quotes] });
        return id;
      },
      quickAdd: (kind, title) => {
        const id = uid(kind.slice(0, 2));
        const today = new Date().toISOString().slice(0, 10);
        if (kind === "lead") {
          const lead: Lead = {
            id,
            name: title,
            company: title,
            email: "",
            phone: "",
            source: "Manual",
            service: "TBD",
            ownerId: "u_sara",
            probability: 0.2,
            value: 0,
            stage: "new",
            createdAt: today,
            nextStep: "Qualify",
          };
          set({ leads: [lead, ...get().leads] });
        } else if (kind === "client") {
          const client: Client = {
            id,
            name: title,
            nameAr: title,
            industry: "—",
            email: "",
            phone: "",
            health: 70,
            satisfaction: 8,
            portalEnabled: true,
            createdAt: today,
          };
          set({ clients: [client, ...get().clients] });
        } else if (kind === "project") {
          const clientId = get().clients[0]?.id ?? "";
          const project: Project = {
            id,
            clientId,
            name: title,
            nameAr: title,
            status: "healthy",
            startDate: today,
            dueDate: today,
            expectedRevenue: 0,
            expectedCost: 0,
            expectedHours: 0,
          };
          set({ projects: [project, ...get().projects] });
        } else if (kind === "task") {
          const projectId = get().projects[0]?.id ?? "";
          const task: Task = {
            id,
            projectId,
            milestone: "General",
            title,
            titleAr: title,
            status: "todo",
            priority: "med",
            estimateHours: 2,
            actualHours: 0,
            billable: true,
            checklist: [],
            revisionCount: 0,
            approvalStatus: "working",
          };
          set({ tasks: [task, ...get().tasks] });
        } else if (kind === "invoice") {
          const invoice: Invoice = {
            id,
            number: `INV-${Date.now().toString().slice(-4)}`,
            clientId: get().clients[0]?.id ?? "",
            amount: 0,
            status: "draft",
            dueDate: today,
            paidAmount: 0,
            issuedAt: today,
            note: title,
          };
          set({ invoices: [invoice, ...get().invoices] });
        } else if (kind === "expense") {
          const expense: Expense = {
            id,
            category: "other",
            amount: 0,
            date: today,
            note: title,
          };
          set({ expenses: [expense, ...get().expenses] });
        } else if (kind === "employee") {
          set({
            employees: [
              {
                id,
                name: title,
                nameAr: title,
                role: "Team member",
                roleAr: "عضو فريق",
                department: "Delivery",
                hourlyCost: 150,
                billRate: 400,
                skills: [],
                weeklyHours: 40,
              },
              ...get().employees,
            ],
          });
        } else if (kind === "meeting") {
          set({
            meetings: [
              {
                id,
                title,
                titleAr: title,
                when: new Date().toISOString(),
                notes: "",
              },
              ...get().meetings,
            ],
          });
        } else if (kind === "request") {
          set({
            tickets: [
              {
                id,
                clientId: get().clients[0]?.id ?? "",
                title,
                titleAr: title,
                priority: "med",
                inScope: true,
                status: "open",
              },
              ...get().tickets,
            ],
          });
        } else if (kind === "quote") {
          return get().addQuoteFromCatalog({ catalogId: get().catalog[0]?.id ?? "svc_smm" });
        }
        return id;
      },
}));

export function useHydratedOS() {
  const hydrated = useOS((s) => s.hydrated);
  return hydrated;
}
