"use client";

import { create } from "zustand";
import { quoteTotals, seed } from "@/data/seed";
import { pickOsState } from "@/lib/os/payload";
import type {
  AccessRole,
  Client,
  Discovery,
  Employee,
  EntityComment,
  Expense,
  Invoice,
  Lead,
  Locale,
  OsState,
  PipelineStage,
  Project,
  Quote,
  QuoteStatus,
  SaasSub,
  Task,
  TaskStatus,
  Ticket,
} from "@/lib/types";
import { uid } from "@/lib/utils";

export type QuickKind =
  | "lead"
  | "client"
  | "quote"
  | "project"
  | "task"
  | "invoice"
  | "expense"
  | "employee"
  | "meeting"
  | "request"
  | "notice"
  | "mail"
  | "room"
  | "space"
  | "catalog"
  | "contract"
  | "retainer"
  | "file"
  | "doc"
  | "leave"
  | "automation"
  | "booking"
  | "saas"
  | "hours";

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
  setQuoteStatus: (id: string, status: QuoteStatus) => void;
  markQuoteViewed: (quoteId: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  requestRevision: (taskId: string) => void;
  approveDeliverable: (taskId: string) => void;
  logTime: (taskId: string, userId: string, hours: number) => void;
  quickAdd: (
    kind: QuickKind,
    title: string,
    extra?: { amount?: number; projectId?: string; clientId?: string },
  ) => string;
  addQuoteFromCatalog: (opts: {
    leadId?: string;
    clientId?: string;
    catalogId: string;
  }) => string;
  hydrateFromRemote: (payload: { locale: Locale; state: OsState }) => void;
  runningTimer: { taskId: string; startedAt: number } | null;
  startTimer: (taskId: string) => void;
  stopTimer: () => void;
  sendMessage: (channelId: string, body: string, internal: boolean) => void;
  saveDoc: (id: string, patch: { title?: string; body?: string }) => void;
  convertDocToTasks: (docId: string, projectId?: string) => void;
  applySopToProject: (docId: string, projectId: string) => void;
  submitDiscovery: (leadId: string, data: Omit<Discovery, "id" | "leadId">) => void;
  addReviewPin: (taskId: string, x: number, y: number, body: string) => void;
  toggleAutomation: (id: string) => void;
  assignTask: (taskId: string, userId: string) => void;
  assignByCapacity: (taskId: string) => void;
  convertMessageToTask: (messageId: string) => void;
  bookSlot: (slotId: string, name: string, clientId?: string) => void;
  signContract: (id: string) => void;
  recordPayment: (invoiceId: string, amount?: number, method?: string) => void;
  decideLeave: (id: string, status: "approved" | "denied") => void;
  generateRetainerMonth: (retainerId: string) => void;
  addSubtask: (parentId: string, title: string) => void;
  addDoc: (title: string, kind?: "wiki" | "sop" | "brief" | "template" | "database", parentId?: string) => string;
  addDocComment: (docId: string, body: string) => void;
  setAccountManager: (clientId: string, userId: string) => void;
  addDocRow: (docId: string, values: Record<string, string>) => void;
  updateDocCell: (docId: string, rowId: string, column: string, value: string) => void;
  setCurrentUser: (userId: string) => void;
  upsertEmployee: (input: Partial<Employee> & { name: string }) => string;
  removeEmployee: (id: string) => void;
  setEmployeeModules: (id: string, modules: string[]) => void;
  sendNotice: (opts: {
    userIds: string[];
    title: string;
    body: string;
    href?: string;
    channel: "inapp" | "email" | "both";
  }) => void;
  markNoticeRead: (id: string) => void;
  markAllNoticesRead: (userId: string) => void;
  sendMail: (opts: { toId: string; subject: string; body: string }) => string;
  markMailRead: (id: string) => void;
  addChatRoom: (name: string, memberIds: string[]) => string;
  startDirectMessage: (otherId: string) => string;
  joinChatRoom: (roomId: string) => void;
  addEntityComment: (opts: Omit<EntityComment, "id" | "createdAt" | "authorId"> & { authorId?: string }) => void;
  toggleNavItem: (href: string) => void;
  toggleHomeWidget: (id: string) => void;
  togglePageSection: (page: string, id: string) => void;
  setEditLayout: (v: boolean) => void;
  removeRecord: (collection: keyof OsState, id: string) => void;
  removeChatRoom: (id: string) => void;
  upsertSubscription: (input: Partial<SaasSub> & { name: string }) => string;
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
      hydrated: true,
      setHydrated: (v) => set({ hydrated: v }),
      hydrateFromRemote: ({ locale, state }) =>
        set({
          ...pickOsState(state ?? seed),
          locale,
          hydrated: true,
        }),
      runningTimer: null,
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
      markQuoteViewed: (quoteId) => {
        const current = get().quotes.find((q) => q.id === quoteId);
        if (!current || current.status !== "sent") return;
        set({
          quotes: get().quotes.map((q) =>
            q.id === quoteId
              ? { ...q, status: "viewed" as const, openedAt: new Date().toISOString() }
              : q,
          ),
        });
      },
      setQuoteStatus: (id, status) =>
        set({
          quotes: get().quotes.map((q) => (q.id === id ? { ...q, status } : q)),
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
      quickAdd: (kind, title, extra) => {
        const id = uid(kind.slice(0, 2));
        const today = new Date().toISOString().slice(0, 10);
        const clientId = extra?.clientId ?? get().clients[0]?.id ?? "";
        const projectId = extra?.projectId ?? get().projects[0]?.id ?? "";
        const amount = extra?.amount ?? 0;
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
          const project: Project = {
            id,
            clientId,
            name: title,
            nameAr: title,
            status: "healthy",
            startDate: today,
            dueDate: today,
            expectedRevenue: amount || 0,
            expectedCost: 0,
            expectedHours: 0,
          };
          set({ projects: [project, ...get().projects] });
        } else if (kind === "task") {
          const task: Task = {
            id,
            projectId,
            milestone: "General",
            title,
            titleAr: title,
            status: "todo",
            priority: "med",
            estimateHours: amount || 2,
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
            clientId,
            projectId: extra?.projectId,
            amount: amount || 1000,
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
            amount: amount || 250,
            date: today,
            note: title,
            projectId: extra?.projectId,
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
                email: `${title.toLowerCase().replace(/\s+/g, ".")}@nawah.agency`,
                accessRole: "team" as AccessRole,
                salary: 18000,
                status: "active" as const,
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
                when: "2026-09-10T11:00:00",
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
                clientId,
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
          return get().addQuoteFromCatalog({ catalogId: get().catalog[0]?.id ?? "svc_smm", clientId, leadId: get().leads[0]?.id });
        } else if (kind === "notice") {
          get().sendNotice({
            userIds: get().employees.map((e) => e.id),
            title,
            body: title,
            channel: "inapp",
            href: "/notifications",
          });
        } else if (kind === "mail") {
          const toId =
            get().employees.find((e) => e.id !== get().prefs.currentUserId)?.id ??
            get().prefs.currentUserId;
          get().sendMail({ toId, subject: title, body: title });
          return "/mail";
        } else if (kind === "room") {
          return get().addChatRoom(title, get().employees.map((e) => e.id));
        } else if (kind === "space") {
          set({
            spaces: [{ id, name: title, nameAr: title }, ...get().spaces],
          });
        } else if (kind === "catalog") {
          set({
            catalog: [
              {
                id,
                name: title,
                nameAr: title,
                description: title,
                descriptionAr: title,
                items: [
                  {
                    id: uid("ln"),
                    name: "Delivery",
                    nameAr: "تنفيذ",
                    hours: 10,
                    role: "pm",
                    hourlyCost: 200,
                    sellPrice: amount || 15000,
                    revisions: 2,
                    days: 10,
                    minMargin: 0.4,
                    deliverables: ["Kickoff"],
                  },
                ],
              },
              ...get().catalog,
            ],
          });
        } else if (kind === "contract") {
          set({
            contracts: [
              {
                id,
                quoteId: get().quotes[0]?.id ?? "",
                clientId,
                status: "draft",
                startDate: today,
                endDate: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
              },
              ...get().contracts,
            ],
          });
        } else if (kind === "retainer") {
          set({
            retainers: [
              {
                id,
                clientId,
                catalogId: get().catalog[0]?.id ?? "svc_smm",
                name: title,
                monthlyHours: 20,
                monthlyFee: amount || 25000,
                consumedHours: 0,
                renewalDate: today,
                status: "active",
              },
              ...get().retainers,
            ],
          });
        } else if (kind === "file") {
          set({
            files: [
              {
                id,
                name: title,
                clientId,
                projectId,
                kind: "file",
                version: 1,
                status: "working",
              },
              ...get().files,
            ],
          });
        } else if (kind === "doc") {
          return get().addDoc(title);
        } else if (kind === "leave") {
          set({
            leaves: [
              {
                id,
                userId: get().prefs.currentUserId,
                type: "annual",
                start: today,
                end: today,
                days: 1,
                status: "pending",
              },
              ...get().leaves,
            ],
          });
        } else if (kind === "automation") {
          set({
            automations: [
              {
                id,
                name: title,
                trigger: "manual",
                condition: "always",
                action: title,
                enabled: true,
              },
              ...get().automations,
            ],
            automationLogs: [
              {
                id: uid("al"),
                automationId: id,
                at: new Date().toISOString(),
                detail: `Created rule “${title}”`,
              },
              ...get().automationLogs,
            ],
          });
        } else if (kind === "booking") {
          set({
            bookingTypes: [
              {
                id,
                name: title,
                durationMin: 30,
                hostId: get().prefs.currentUserId,
                description: title,
              },
              ...get().bookingTypes,
            ],
          });
        } else if (kind === "saas") {
          set({
            subscriptions: [
              {
                id,
                name: title,
                plan: "Seat",
                monthly: amount || 0,
                seats: 1,
                used: 1,
                renew: today,
                lastUsed: today,
              },
              ...get().subscriptions,
            ],
          });
        } else if (kind === "hours") {
          const taskId = extra?.projectId
            ? get().tasks.find((t) => t.projectId === extra.projectId)?.id
            : get().tasks.find((t) => t.status !== "done")?.id;
          if (taskId) get().logTime(taskId, get().prefs.currentUserId, amount || 1);
          else {
            const tid = get().quickAdd("task", title || "Time log", extra);
            get().logTime(tid, get().prefs.currentUserId, amount || 1);
            return tid;
          }
        }
        return id;
      },
      startTimer: (taskId) => set({ runningTimer: { taskId, startedAt: Date.now() } }),
      stopTimer: () => {
        const timer = get().runningTimer;
        if (!timer) return;
        const hours = Math.max(0.25, Math.round(((Date.now() - timer.startedAt) / 3600000) * 10) / 10);
        get().logTime(timer.taskId, "u_lina", hours);
        set({ runningTimer: null });
      },
      sendMessage: (channelId, body, internal) =>
        set({
          messages: [
            {
              id: uid("msg"),
              channelId,
              authorId: get().prefs.currentUserId,
              body,
              createdAt: new Date().toISOString(),
              internal,
            },
            ...get().messages,
          ],
        }),
      saveDoc: (id, patch) =>
        set({
          docs: get().docs.map((d) =>
            d.id === id
              ? {
                  ...d,
                  title: patch.title ?? d.title,
                  titleAr: patch.title ?? d.titleAr,
                  body: patch.body ?? d.body,
                  bodyAr: patch.body ?? d.bodyAr,
                }
              : d,
          ),
        }),
      convertDocToTasks: (docId, projectId) => {
        const doc = get().docs.find((d) => d.id === docId);
        if (!doc) return;
        const pid = projectId ?? doc.projectId ?? get().projects[0]?.id;
        if (!pid) return;
        const lines = `${doc.body}`
          .split(/[\n→,]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 3)
          .slice(0, 8);
        set({
          tasks: [
            ...lines.map((line) => ({
              id: uid("t"),
              projectId: pid,
              milestone: "From doc",
              title: line,
              titleAr: line,
              status: "todo" as const,
              priority: "med" as const,
              estimateHours: 2,
              actualHours: 0,
              billable: true,
              checklist: [],
              revisionCount: 0,
              approvalStatus: "working" as const,
            })),
            ...get().tasks,
          ],
        });
      },
      applySopToProject: (docId, projectId) => {
        get().convertDocToTasks(docId, projectId);
      },
      submitDiscovery: (leadId, data) => {
        const id = uid("disc");
        set({
          discoveries: [{ id, leadId, ...data }, ...get().discoveries],
          leads: get().leads.map((l) =>
            l.id === leadId
              ? { ...l, stage: "brief", notes: data.goal, nextStep: "Draft quotation" }
              : l,
          ),
          docs: [
            {
              id: uid("d"),
              title: `Brief — ${get().leads.find((l) => l.id === leadId)?.company ?? "Lead"}`,
              titleAr: `بريف`,
              body: Object.values(data).join("\n"),
              bodyAr: Object.values(data).join("\n"),
              clientId: undefined,
            },
            ...get().docs,
          ],
        });
      },
      addReviewPin: (taskId, x, y, body) =>
        set({
          reviewPins: [
            {
              id: uid("rp"),
              taskId,
              x,
              y,
              body,
              authorId: get().prefs.currentUserId,
              createdAt: new Date().toISOString(),
            },
            ...get().reviewPins,
          ],
        }),
      toggleAutomation: (id) =>
        set({
          automations: get().automations.map((a) =>
            a.id === id ? { ...a, enabled: !a.enabled } : a,
          ),
        }),
      assignTask: (taskId, userId) =>
        set({
          tasks: get().tasks.map((t) =>
            t.id === taskId ? { ...t, assigneeId: userId } : t,
          ),
          audit: [
            {
              id: uid("au"),
              at: new Date().toISOString(),
              actorId: "u_ahmed",
              action: "task.assigned",
              detail: `${taskId} → ${userId}`,
            },
            ...get().audit,
          ],
        }),
      assignByCapacity: (taskId) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return;
        const load: Record<string, number> = {};
        for (const t of state.tasks) {
          if (t.assigneeId && t.status !== "done") {
            load[t.assigneeId] = (load[t.assigneeId] ?? 0) + t.estimateHours;
          }
        }
        const pick = pickAssignee(state.employees, "", load);
        if (pick) get().assignTask(taskId, pick);
      },
      convertMessageToTask: (messageId) => {
        const msg = get().messages.find((m) => m.id === messageId);
        if (!msg) return;
        const projectId = msg.channelId.startsWith("project:")
          ? msg.channelId.slice(8)
          : get().projects[0]?.id;
        if (!projectId) return;
        const id = uid("t");
        set({
          tasks: [
            {
              id,
              projectId,
              milestone: "From inbox",
              title: msg.body.slice(0, 80),
              titleAr: msg.body.slice(0, 80),
              status: "todo",
              priority: "med",
              estimateHours: 2,
              actualHours: 0,
              billable: true,
              checklist: [],
              revisionCount: 0,
              approvalStatus: "working",
            },
            ...get().tasks,
          ],
        });
      },
      bookSlot: (slotId, name, clientId) => {
        const slot = get().bookingSlots.find((s) => s.id === slotId);
        if (!slot || slot.bookedName) return;
        set({
          bookingSlots: get().bookingSlots.map((s) =>
            s.id === slotId ? { ...s, bookedName: name, clientId } : s,
          ),
          meetings: [
            {
              id: uid("m"),
              title: `Booked: ${name}`,
              titleAr: `حجز: ${name}`,
              clientId,
              when: slot.start,
              notes: `${slot.durationMin} min with account team`,
            },
            ...get().meetings,
          ],
        });
      },
      signContract: (id) =>
        set({
          contracts: get().contracts.map((c) =>
            c.id === id ? { ...c, status: "signed" as const } : c,
          ),
        }),
      recordPayment: (invoiceId, amount, method = "Bank transfer") => {
        const invoice = get().invoices.find((i) => i.id === invoiceId);
        if (!invoice) return;
        const pay = Math.min(amount ?? invoice.amount - invoice.paidAmount, invoice.amount - invoice.paidAmount);
        if (pay <= 0) return;
        const paidAmount = invoice.paidAmount + pay;
        set({
          payments: [
            {
              id: uid("pay"),
              invoiceId,
              amount: pay,
              date: new Date().toISOString().slice(0, 10),
              method,
            },
            ...get().payments,
          ],
          invoices: get().invoices.map((i) =>
            i.id === invoiceId
              ? {
                  ...i,
                  paidAmount,
                  status: paidAmount >= i.amount ? ("paid" as const) : ("partial" as const),
                }
              : i,
          ),
        });
      },
      decideLeave: (id, status) =>
        set({
          leaves: get().leaves.map((l) => (l.id === id ? { ...l, status } : l)),
        }),
      generateRetainerMonth: (retainerId) => {
        const ret = get().retainers.find((r) => r.id === retainerId);
        if (!ret) return;
        const catalog = get().catalog.find((c) => c.id === ret.catalogId);
        const today = new Date().toISOString().slice(0, 10);
        const projectId = uid("p");
        const project: Project = {
          id: projectId,
          clientId: ret.clientId,
          retainerId: ret.id,
          name: `${ret.name} — cycle`,
          nameAr: ret.name,
          status: "healthy",
          startDate: today,
          dueDate: ret.renewalDate,
          expectedRevenue: ret.monthlyFee,
          expectedCost: Math.round(ret.monthlyFee * 0.35),
          expectedHours: ret.monthlyHours,
          spaceId: "sp_delivery",
        };
        const tasks: Task[] = (catalog?.items ?? []).slice(0, 5).map((item) => ({
          id: uid("t"),
          projectId,
          milestone: "Retainer",
          title: item.name,
          titleAr: item.nameAr,
          status: "todo" as const,
          priority: "med" as const,
          estimateHours: item.hours,
          actualHours: 0,
          billable: true,
          checklist: [],
          revisionCount: 0,
          approvalStatus: "working" as const,
        }));
        const invoice: Invoice = {
          id: uid("inv"),
          number: `INV-R${Date.now().toString().slice(-4)}`,
          clientId: ret.clientId,
          projectId,
          amount: ret.monthlyFee,
          status: "sent",
          dueDate: today,
          paidAmount: 0,
          issuedAt: today,
          note: "Monthly retainer",
        };
        set({
          projects: [project, ...get().projects],
          tasks: [...tasks, ...get().tasks],
          invoices: [invoice, ...get().invoices],
          retainers: get().retainers.map((r) =>
            r.id === retainerId ? { ...r, consumedHours: 0 } : r,
          ),
        });
      },
      addSubtask: (parentId, title) => {
        const parent = get().tasks.find((t) => t.id === parentId);
        if (!parent) return;
        set({
          tasks: [
            {
              ...parent,
              id: uid("t"),
              parentId,
              title,
              titleAr: title,
              status: "todo",
              estimateHours: 1,
              actualHours: 0,
              checklist: [],
              revisionCount: 0,
              approvalStatus: "working",
            },
            ...get().tasks,
          ],
        });
      },
      addDoc: (title, kind = "wiki", parentId) => {
        const id = uid("d");
        set({
          docs: [
            {
              id,
              title,
              titleAr: title,
              parentId,
              body: kind === "database" ? "Linked database" : "",
              bodyAr: "",
              kind,
              columns: kind === "database" ? ["Name", "Status", "Owner"] : undefined,
              rows: kind === "database" ? [] : undefined,
            },
            ...get().docs,
          ],
        });
        return id;
      },
      addDocComment: (docId, body) =>
        set({
          docComments: [
            {
              id: uid("dc"),
              docId,
              authorId: get().prefs.currentUserId,
              body,
              createdAt: new Date().toISOString(),
            },
            ...get().docComments,
          ],
        }),
      setAccountManager: (clientId, userId) =>
        set({
          clients: get().clients.map((c) =>
            c.id === clientId ? { ...c, accountManagerId: userId } : c,
          ),
        }),
      addDocRow: (docId, values) =>
        set({
          docs: get().docs.map((d) =>
            d.id === docId
              ? { ...d, rows: [{ id: uid("r"), values }, ...(d.rows ?? [])] }
              : d,
          ),
        }),
      updateDocCell: (docId, rowId, column, value) =>
        set({
          docs: get().docs.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  rows: (d.rows ?? []).map((row) =>
                    row.id === rowId ? { ...row, values: { ...row.values, [column]: value } } : row,
                  ),
                }
              : d,
          ),
        }),
      setCurrentUser: (userId) =>
        set({ prefs: { ...get().prefs, currentUserId: userId } }),
      upsertEmployee: (input) => {
        const existing = input.id ? get().employees.find((e) => e.id === input.id) : undefined;
        const id = existing?.id ?? uid("u");
        const next: Employee = {
          id,
          name: input.name,
          nameAr: input.nameAr ?? input.name,
          email: input.email ?? existing?.email ?? `${input.name.toLowerCase().replace(/\s+/g, ".")}@nawah.agency`,
          phone: input.phone ?? existing?.phone,
          role: input.role ?? existing?.role ?? "Team member",
          roleAr: input.roleAr ?? existing?.roleAr ?? "عضو فريق",
          accessRole: input.accessRole ?? existing?.accessRole ?? "team",
          department: input.department ?? existing?.department ?? "Delivery",
          hourlyCost: input.hourlyCost ?? existing?.hourlyCost ?? 150,
          billRate: input.billRate ?? existing?.billRate ?? 400,
          skills: input.skills ?? existing?.skills ?? [],
          weeklyHours: input.weeklyHours ?? existing?.weeklyHours ?? 40,
          kind: input.kind ?? existing?.kind ?? "staff",
          salary: input.salary ?? existing?.salary ?? 18000,
          managerId: input.managerId ?? existing?.managerId,
          status: input.status ?? existing?.status ?? "active",
          modules: input.modules ?? existing?.modules,
        };
        set({
          employees: existing
            ? get().employees.map((e) => (e.id === id ? next : e))
            : [next, ...get().employees],
        });
        return id;
      },
      removeEmployee: (id) => {
        if (id === "u_ahmed") return;
        set({ employees: get().employees.filter((e) => e.id !== id) });
      },
      setEmployeeModules: (id, modules) =>
        set({
          employees: get().employees.map((e) => (e.id === id ? { ...e, modules } : e)),
        }),
      sendNotice: ({ userIds, title, body, href, channel }) => {
        const fromId = get().prefs.currentUserId;
        const now = new Date().toISOString();
        const notices = userIds.map((userId) => ({
          id: uid("n"),
          userId,
          fromId,
          title,
          body,
          href,
          read: false,
          channel,
          createdAt: now,
        }));
        const mail =
          channel === "email" || channel === "both"
            ? userIds.map((toId) => ({
                id: uid("mail"),
                fromId,
                toId,
                subject: title,
                body,
                read: false,
                createdAt: now,
              }))
            : [];
        set({
          notices: [...notices, ...get().notices],
          mail: [...mail, ...get().mail],
        });
      },
      markNoticeRead: (id) =>
        set({
          notices: get().notices.map((n) => (n.id === id ? { ...n, read: true } : n)),
        }),
      markAllNoticesRead: (userId) =>
        set({
          notices: get().notices.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
        }),
      sendMail: ({ toId, subject, body }) => {
        const id = uid("mail");
        const fromId = get().prefs.currentUserId;
        const now = new Date().toISOString();
        set({
          mail: [
            { id, fromId, toId, subject, body, read: false, createdAt: now },
            ...get().mail,
          ],
          notices: [
            {
              id: uid("n"),
              userId: toId,
              fromId,
              title: subject,
              body,
              href: "/mail",
              read: false,
              channel: "email",
              createdAt: now,
            },
            ...get().notices,
          ],
        });
        return id;
      },
      markMailRead: (id) =>
        set({
          mail: get().mail.map((m) => (m.id === id ? { ...m, read: true } : m)),
        }),
      addChatRoom: (name, memberIds) => {
        const id = uid("room");
        const me = get().prefs.currentUserId;
        set({
          chatRooms: [
            { id, name, memberIds: Array.from(new Set([me, ...memberIds])), kind: "group" },
            ...get().chatRooms,
          ],
        });
        return id;
      },
      startDirectMessage: (otherId) => {
        const me = get().prefs.currentUserId;
        if (!otherId || otherId === me) return "";
        const existing = get().chatRooms.find(
          (r) =>
            r.kind === "dm" &&
            r.memberIds.includes(me) &&
            r.memberIds.includes(otherId) &&
            r.memberIds.length === 2,
        );
        if (existing) return existing.id;
        const other = get().employees.find((e) => e.id === otherId);
        const self = get().employees.find((e) => e.id === me);
        const id = uid("room");
        set({
          chatRooms: [
            {
              id,
              name: `${self?.name.split(" ")[0] ?? "You"} × ${other?.name.split(" ")[0] ?? "Teammate"}`,
              memberIds: [me, otherId],
              kind: "dm",
            },
            ...get().chatRooms,
          ],
        });
        return id;
      },
      joinChatRoom: (roomId) => {
        const me = get().prefs.currentUserId;
        set({
          chatRooms: get().chatRooms.map((r) =>
            r.id === roomId && !r.memberIds.includes(me)
              ? { ...r, memberIds: [...r.memberIds, me] }
              : r,
          ),
        });
      },
      addEntityComment: ({ entity, entityId, body, authorId }) =>
        set({
          entityComments: [
            {
              id: uid("ec"),
              entity,
              entityId,
              authorId: authorId ?? get().prefs.currentUserId,
              body,
              createdAt: new Date().toISOString(),
            },
            ...get().entityComments,
          ],
        }),
      toggleNavItem: (href) => {
        const hidden = get().prefs.hiddenNav;
        const hiddenNav = hidden.includes(href)
          ? hidden.filter((h) => h !== href)
          : [...hidden, href];
        set({ prefs: { ...get().prefs, hiddenNav } });
      },
      toggleHomeWidget: (id) => {
        const hidden = get().prefs.hiddenHomeWidgets;
        const hiddenHomeWidgets = hidden.includes(id)
          ? hidden.filter((h) => h !== id)
          : [...hidden, id];
        set({ prefs: { ...get().prefs, hiddenHomeWidgets } });
      },
      togglePageSection: (page, id) => {
        if (page === "/home") {
          get().toggleHomeWidget(id);
          return;
        }
        const map = { ...get().prefs.hiddenPageSections };
        const hidden = map[page] ?? [];
        map[page] = hidden.includes(id) ? hidden.filter((h) => h !== id) : [...hidden, id];
        set({ prefs: { ...get().prefs, hiddenPageSections: map } });
      },
      setEditLayout: (v) => set({ prefs: { ...get().prefs, editLayout: v } }),
      removeRecord: (collection, id) => {
        if (collection === "prefs") return;
        if (collection === "employees" && id === "u_ahmed") return;
        const current = get()[collection];
        if (!Array.isArray(current)) return;
        set({
          [collection]: current.filter((row: { id?: string }) => row.id !== id),
        } as Partial<OsState>);
      },
      removeChatRoom: (id) => {
        set({
          chatRooms: get().chatRooms.filter((r) => r.id !== id),
          messages: get().messages.filter((m) => m.channelId !== `chat:${id}`),
        });
      },
      upsertSubscription: (input) => {
        const existing = input.id ? get().subscriptions.find((s) => s.id === input.id) : undefined;
        const id = existing?.id ?? uid("sub");
        const next: SaasSub = {
          id,
          name: input.name,
          plan: input.plan ?? existing?.plan ?? "Team",
          monthly: input.monthly ?? existing?.monthly ?? 0,
          seats: input.seats ?? existing?.seats ?? 1,
          used: input.used ?? existing?.used ?? 1,
          renew: input.renew ?? existing?.renew ?? new Date().toISOString().slice(0, 10),
          lastUsed: input.lastUsed ?? existing?.lastUsed ?? new Date().toISOString().slice(0, 10),
          replacesHref: input.replacesHref ?? existing?.replacesHref,
          replacesLabel: input.replacesLabel ?? existing?.replacesLabel,
        };
        set({
          subscriptions: existing
            ? get().subscriptions.map((s) => (s.id === id ? next : s))
            : [next, ...get().subscriptions],
        });
        return id;
      },
}));

export function useHydratedOS() {
  const hydrated = useOS((s) => s.hydrated);
  return hydrated;
}
