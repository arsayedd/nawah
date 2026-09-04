"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { PageHeader, SectionTitle } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { quoteTotals } from "@/data/seed";
import { egp, pct } from "@/lib/utils";
import { useKpis, useWorkspace } from "@/store/selectors";
import { useOS } from "@/store/use-os";

const osLinks = [
  ["/crm", "Pipeline"],
  ["/accounts", "Accounts"],
  ["/clients", "Clients"],
  ["/catalog", "Catalog"],
  ["/quotes", "Quotations"],
  ["/contracts", "Contracts"],
  ["/projects", "Projects"],
  ["/my-work", "My work"],
  ["/workload", "Workload"],
  ["/retainers", "Retainers"],
  ["/docs", "Docs"],
  ["/inbox", "Inbox"],
  ["/chat", "Chat"],
  ["/mail", "Mail"],
  ["/notifications", "Notifications"],
  ["/files", "Files"],
  ["/portal", "Portal"],
  ["/calendar", "Calendar"],
  ["/book", "Booking"],
  ["/time", "Time"],
  ["/finance", "Finance"],
  ["/people", "Employees"],
  ["/hr", "HR"],
  ["/team", "Team rates"],
  ["/customize", "Customize"],
  ["/analytics", "Analytics"],
  ["/automations", "Automations"],
  ["/ai", "Nawah AI"],
  ["/settings", "Settings"],
] as const;

const spine = ["Lead", "Quote", "Scope", "Hours", "Project", "Approval", "Invoice", "Profit", "Renewal"];

function Rise({ delay, children }: { delay: number; children: ReactNode }) {
  return (
    <div className="nawah-rise" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function HomePage() {
  const ws = useWorkspace();
  const k = useKpis();
  const hiddenHome = useOS((s) => s.prefs.hiddenHomeWidgets);
  const notices = useOS((s) => s.notices);
  const mail = useOS((s) => s.mail);
  const rooms = useOS((s) => s.chatRooms);
  const me = useOS((s) => s.prefs.currentUserId);
  const show = (id: string) => !hiddenHome.includes(id);
  const en = "en" as const;

  const alerts = ws.alerts;
  const employees = ws.employees;
  const tasks = ws.tasks;
  const clients = ws.clients;
  const leads = ws.leads;
  const invoices = ws.invoices;
  const contracts = ws.contracts;
  const retainers = ws.retainers;
  const meetings = ws.meetings;
  const subscriptions = ws.subscriptions;
  const catalog = ws.catalog;
  const files = ws.files;
  const automations = ws.automations;

  const kpis = [
    { label: "Revenue this month", value: egp(k.revenue, en), up: true, delta: "+12%" },
    { label: "Expected revenue", value: egp(k.expected, en), up: true, delta: "open" },
    { label: "Net profit", value: egp(k.profit, en), up: k.profit > 0, delta: "" },
    { label: "Overdue receivables", value: egp(k.overdue, en), up: false, delta: "" },
    { label: "Pipeline value", value: egp(k.pipeline, en), up: true, delta: "" },
    { label: "Expenses", value: egp(k.expensesSum, en), up: false, delta: "" },
    { label: "New leads", value: String(k.newLeads), up: true, delta: "" },
    { label: "Win rate", value: pct(k.winRate, en), up: true, delta: "" },
  ];

  const load = employees
    .filter((e) => e.id !== "u_ahmed")
    .map((e) => {
      const booked = tasks
        .filter((task) => task.assigneeId === e.id && task.status !== "done")
        .reduce((s, task) => s + task.estimateHours, 0);
      const ratio = booked / e.weeklyHours;
      return { e, booked, ratio };
    });

  const worstClient = [...clients].sort((a, b) => a.health - b.health)[0];
  const pipeline = leads.filter((l) => !["won", "lost"].includes(l.stage));
  const delayed = k.projects.filter((p) => p.status === "delayed" || p.status === "at_risk");
  const healthy = k.projects.filter((p) => p.status === "healthy");
  const endingContracts = contracts.filter((c) => c.endDate <= "2026-10-01");
  const clientProfit = clients
    .map((c) => {
      const paid = invoices.filter((i) => i.clientId === c.id).reduce((s, i) => s + i.paidAmount, 0);
      return { c, paid };
    })
    .sort((a, b) => b.paid - a.paid);
  const unreadNotices = notices.filter((n) => n.userId === me && !n.read);
  const unreadMail = mail.filter((m) => m.toId === me && !m.read);
  const reviewFiles = files.filter((f) => f.status === "client" || f.status === "internal");
  const liveAutomations = automations.filter((a) => a.enabled);

  return (
    <div dir="ltr" lang="en" className="space-y-7 text-[#071B3A]" data-nawah-home="ready">
      <Rise delay={0}>
        <PageHeader
          kicker="From first lead to real profit"
          title="Good morning, Ahmed"
          description="Your agency core: cash, pipeline, delivery risk, people, and every module in one English workspace."
          actions={
            <div className="flex flex-wrap gap-2">
              <Link href="/q/q_bloom">
                <Button size="sm" variant="outline">
                  Live quote NW-1042
                </Button>
              </Link>
              <Link href="/customize">
                <Button size="sm" variant="outline">
                  Customize home
                </Button>
              </Link>
            </div>
          }
        />
      </Rise>

      {show("spine") ? (
        <Rise delay={40}>
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-navy/50">
            {spine.map((step, i) => (
              <span
                key={step}
                className="inline-flex items-center gap-2 nawah-rise"
                style={{ animationDelay: `${80 + i * 45}ms` }}
              >
                {i > 0 ? <ArrowRight className="h-3 w-3 text-mint" /> : null}
                <span className="rounded-full bg-white px-2.5 py-1 font-medium text-navy/75 shadow-[0_1px_0_rgba(7,27,58,0.06)]">
                  {step}
                </span>
              </span>
            ))}
          </div>
        </Rise>
      ) : null}

      {show("cash") && k.overdue > 0 ? (
        <Rise delay={80}>
          <Link
            href="/finance"
            className="flex items-center justify-between gap-3 rounded-[16px] border border-coral/30 bg-coral/8 px-4 py-3 transition hover:border-coral/50"
          >
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-coral">
                Cash at risk
              </div>
              <div className="text-sm">
                {egp(k.overdue, en)} overdue — collect before you sell more work.
              </div>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-coral" />
          </Link>
        </Rise>
      ) : null}

      {show("kpis") ? (
        <Rise delay={100}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((item, i) => (
              <Card
                key={item.label}
                className="p-4 nawah-rise"
                style={{ animationDelay: `${120 + i * 40}ms` }}
              >
                <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-navy/45">
                  {item.label}
                </div>
                <div className="mt-2 flex items-end justify-between gap-2">
                  <div className="text-[1.55rem] font-semibold tracking-tight">{item.value}</div>
                  {item.delta ? (
                    <span className={`inline-flex items-center text-xs font-medium ${item.up ? "text-emerald-600" : "text-coral"}`}>
                      {item.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                      {item.delta}
                    </span>
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        </Rise>
      ) : null}

      {show("health") ? (
        <Rise delay={180}>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="p-4">
              <div className="text-xs text-navy/45">Healthy projects</div>
              <div className="mt-1 text-2xl font-semibold">{healthy.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-navy/45">At risk / delayed</div>
              <div className="mt-1 text-2xl font-semibold text-coral">{delayed.length}</div>
            </Card>
            <Card className="p-4">
              <div className="text-xs text-navy/45">Hours sold / used</div>
              <div className="mt-1 text-2xl font-semibold">
                {k.soldHours}
                <span className="text-navy/30"> / {k.usedHours}</span>
              </div>
            </Card>
          </div>
        </Rise>
      ) : null}

      {show("inbox") ? (
        <Rise delay={220}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Link href="/notifications">
              <Card className="h-full p-4 hover:border-cobalt/30">
                <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">Notifications</div>
                <div className="mt-2 text-2xl font-semibold">{unreadNotices.length}</div>
                <p className="mt-1 text-xs text-navy/50">Unread in-app notices</p>
              </Card>
            </Link>
            <Link href="/mail">
              <Card className="h-full p-4 hover:border-cobalt/30">
                <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">Internal mail</div>
                <div className="mt-2 text-2xl font-semibold">{unreadMail.length}</div>
                <p className="mt-1 text-xs text-navy/50">Unread messages</p>
              </Card>
            </Link>
            <Link href="/chat">
              <Card className="h-full p-4 hover:border-cobalt/30">
                <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">Chat rooms</div>
                <div className="mt-2 text-2xl font-semibold">{rooms.length}</div>
                <p className="mt-1 text-xs text-navy/50">Ops and DMs</p>
              </Card>
            </Link>
            <Link href="/files">
              <Card className="h-full p-4 hover:border-cobalt/30">
                <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">Files in review</div>
                <div className="mt-2 text-2xl font-semibold">{reviewFiles.length}</div>
                <p className="mt-1 text-xs text-navy/50">Internal or client review</p>
              </Card>
            </Link>
          </div>
        </Rise>
      ) : null}

      {show("decisions") ? (
        <Rise delay={260}>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <SectionTitle>Needs a decision today</SectionTitle>
                <Badge tone="coral">{alerts.length}</Badge>
              </div>
              <ul className="space-y-2">
                {alerts.length === 0 ? (
                  <li className="rounded-[12px] border border-dashed border-navy/10 px-3 py-6 text-center text-sm text-navy/45">
                    Nothing waiting on you.
                  </li>
                ) : null}
                {alerts.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={a.href}
                      className="flex items-start gap-3 rounded-[12px] border border-navy/6 px-3 py-3 transition hover:border-cobalt/30 hover:bg-paper/70"
                    >
                      {a.kind === "alert" ? (
                        <AlertTriangle className="mt-0.5 h-4 w-4 text-coral" />
                      ) : (
                        <CheckCircle2 className={`mt-0.5 h-4 w-4 ${a.kind === "success" ? "text-mint" : "text-cobalt"}`} />
                      )}
                      <span className="text-sm leading-6">{a.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <SectionTitle className="mb-4">Team load</SectionTitle>
              <div className="space-y-3.5">
                {load.map(({ e, booked, ratio }, i) => (
                  <div key={e.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{e.name}</span>
                      <span className="text-navy/45">
                        {booked}/{e.weeklyHours}h
                        {ratio > 1 ? (
                          <Badge tone="coral" className="ms-2">
                            Overbooked
                          </Badge>
                        ) : null}
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-navy/8">
                      <div
                        className={`nawah-bar h-full ${ratio > 1 ? "bg-coral" : "bg-cobalt"}`}
                        style={{
                          width: `${Math.min(100, ratio * 100)}%`,
                          animationDelay: `${300 + i * 80}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/workload" className="mt-4 inline-block text-sm text-cobalt">
                Open workload
              </Link>
            </Card>
          </div>
        </Rise>
      ) : null}

      {show("spotlight") ? (
        <Rise delay={300}>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">Weakest client</div>
              <Link href={`/clients/${worstClient?.id}`} className="mt-2 block">
                <div className="text-lg font-semibold">{worstClient?.name}</div>
                <Badge tone="coral">Health {worstClient?.health}</Badge>
              </Link>
            </Card>
            <Card>
              <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">Quotes waiting</div>
              <div className="mt-2 text-2xl font-semibold">{k.pendingQuotes.length}</div>
              {k.pendingQuotes.map((q) => (
                <Link key={q.id} href={`/quotes/${q.id}`} className="mt-1 block text-sm text-cobalt">
                  {q.number}
                </Link>
              ))}
            </Card>
            <Card>
              <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">Approvals waiting</div>
              <div className="mt-2 text-2xl font-semibold">{k.waitingClient.length}</div>
              <Link href="/portal" className="text-sm text-cobalt">
                Open portal queue
              </Link>
            </Card>
            <Card>
              <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">Next meetings</div>
              <div className="mt-2 space-y-1 text-sm">
                {meetings.slice(0, 3).map((m) => (
                  <div key={m.id}>
                    {m.title}
                    <div className="text-xs text-navy/45">{m.when.slice(0, 16)}</div>
                  </div>
                ))}
              </div>
              <Link href="/calendar" className="mt-2 inline-block text-sm text-cobalt">
                Calendar
              </Link>
            </Card>
          </div>
        </Rise>
      ) : null}

      {show("pipeline") ? (
        <Rise delay={340}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <div className="mb-3 flex items-center justify-between">
                <SectionTitle>Open pipeline</SectionTitle>
                <Link href="/crm" className="text-sm text-cobalt">
                  CRM
                </Link>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {pipeline.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/crm/${lead.id}`}
                    className="min-w-[180px] rounded-[12px] border border-navy/8 bg-paper/80 p-3 transition hover:border-cobalt/30"
                  >
                    <div className="text-sm font-semibold">{lead.company}</div>
                    <div className="mt-1 text-[11px] text-navy/45">
                      {lead.stage} · {egp(lead.value, en)}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
            <Card>
              <SectionTitle className="mb-3">Projects at risk</SectionTitle>
              {delayed.length === 0 ? (
                <p className="text-sm text-navy/50">No delayed work.</p>
              ) : (
                delayed.map((p) => (
                  <Link key={p.id} href={`/projects/${p.id}`} className="mb-2 flex justify-between text-sm">
                    <span>{p.name}</span>
                    <Badge tone="coral">{p.status.replace("_", " ")}</Badge>
                  </Link>
                ))
              )}
            </Card>
          </div>
        </Rise>
      ) : null}

      {show("ops") ? (
        <Rise delay={380}>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card>
              <SectionTitle className="mb-3">Contracts ending</SectionTitle>
              {endingContracts.map((c) => {
                const client = clients.find((x) => x.id === c.clientId);
                return (
                  <Link key={c.id} href="/contracts" className="mb-2 block text-sm">
                    {client?.name} · {c.endDate} · {c.status}
                  </Link>
                );
              })}
            </Card>
            <Card>
              <SectionTitle className="mb-3">Retainers</SectionTitle>
              {retainers.map((r) => (
                <Link key={r.id} href="/retainers" className="mb-2 block text-sm">
                  {r.name} · {r.consumedHours}/{r.monthlyHours}h · {r.status}
                </Link>
              ))}
            </Card>
            <Card>
              <SectionTitle className="mb-3">SaaS renewals</SectionTitle>
              {subscriptions.map((s) => (
                <div key={s.id} className="mb-2 text-sm">
                  {s.name} · {s.renew}
                  {s.overlap ? <span className="text-coral"> · overlap</span> : null}
                </div>
              ))}
            </Card>
          </div>
        </Rise>
      ) : null}

      {show("people") ? (
        <Rise delay={400}>
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle>People</SectionTitle>
              <Link href="/people" className="text-sm text-cobalt">
                Manage access
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map((e) => (
                <Link
                  key={e.id}
                  href={`/people/${e.id}`}
                  className="rounded-[12px] border border-navy/8 p-3 hover:border-cobalt/30"
                >
                  <div className="font-medium">{e.name}</div>
                  <div className="text-xs text-navy/50">
                    {e.role} · {e.accessRole ?? "team"} · {egp(e.salary ?? 0, en)}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </Rise>
      ) : null}

      {show("catalog") ? (
        <Rise delay={420}>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <SectionTitle className="mb-3">Service catalog margin</SectionTitle>
              {catalog.map((svc) => {
                const tot = quoteTotals(
                  svc.items.map((i) => ({
                    id: i.id,
                    name: i.name,
                    nameAr: i.nameAr,
                    qty: 1,
                    hours: i.hours,
                    role: i.role,
                    hourlyCost: i.hourlyCost,
                    sellPrice: i.sellPrice,
                    toolsCost: 0,
                    productionCost: 0,
                    freelancerCost: 0,
                    revisions: i.revisions,
                  })),
                );
                return (
                  <div key={svc.id} className="flex justify-between py-1 text-sm">
                    <span>{svc.name}</span>
                    <span>{pct(tot.margin, en)}</span>
                  </div>
                );
              })}
              <Link href="/catalog" className="mt-2 inline-block text-sm text-cobalt">
                Open catalog
              </Link>
            </Card>
            <Card>
              <SectionTitle className="mb-3">Client cash collected</SectionTitle>
              {clientProfit.map(({ c, paid }) => (
                <Link key={c.id} href={`/clients/${c.id}`} className="flex justify-between py-1 text-sm">
                  <span>{c.name}</span>
                  <span>{egp(paid, en)}</span>
                </Link>
              ))}
            </Card>
          </div>
        </Rise>
      ) : null}

      {show("automations") ? (
        <Rise delay={440}>
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <SectionTitle>Automations running</SectionTitle>
              <Link href="/automations" className="text-sm text-cobalt">
                Rules
              </Link>
            </div>
            {liveAutomations.length === 0 ? (
              <p className="text-sm text-navy/50">No enabled automations.</p>
            ) : (
              liveAutomations.map((a) => (
                <div key={a.id} className="mb-2 flex justify-between text-sm">
                  <span>{a.name}</span>
                  <Badge tone="mint">On</Badge>
                </div>
              ))
            )}
          </Card>
        </Rise>
      ) : null}

      {show("projects") ? (
        <Rise delay={460}>
          <Card>
            <SectionTitle className="mb-3">Projects</SectionTitle>
            <div className="grid gap-3 md:grid-cols-3">
              {k.projects.map((p) => (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="rounded-[14px] border border-navy/8 p-4 transition hover:border-cobalt/30 hover:bg-paper/50"
                >
                  <Badge tone={p.status === "healthy" ? "mint" : p.status === "delayed" ? "coral" : "cobalt"}>
                    {p.status.replace("_", " ")}
                  </Badge>
                  <div className="mt-2 font-medium">{p.name}</div>
                  <div className="mt-1 text-xs text-navy/50">
                    {egp(p.expectedRevenue, en)} · {p.dueDate}
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </Rise>
      ) : null}

      {show("os") ? (
        <Rise delay={500}>
          <Card>
            <SectionTitle className="mb-4">The whole OS</SectionTitle>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {osLinks.map(([href, label], i) => (
                <Link
                  key={href}
                  href={href}
                  className="nawah-rise rounded-[10px] border border-navy/8 bg-paper/70 px-3 py-2.5 text-sm font-medium transition hover:border-cobalt/40 hover:bg-white"
                  style={{ animationDelay: `${520 + i * 25}ms` }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </Card>
        </Rise>
      ) : null}
    </div>
  );
}
