"use client";

import Link from "next/link";
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
import { t } from "@/lib/i18n";
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
  ["/files", "Files"],
  ["/portal", "Portal"],
  ["/calendar", "Calendar"],
  ["/book", "Booking"],
  ["/time", "Time"],
  ["/finance", "Finance"],
  ["/hr", "People"],
  ["/team", "Team"],
  ["/analytics", "Analytics"],
  ["/automations", "Automations"],
  ["/ai", "Nawah AI"],
  ["/settings", "Settings"],
] as const;

export default function HomePage() {
  const locale = useOS((s) => s.locale);
  const ws = useWorkspace();
  const dict = t(locale);
  const alerts = ws.alerts;
  const employees = ws.employees;
  const tasks = ws.tasks;
  const clients = ws.clients;
  const leads = ws.leads;
  const quotes = ws.quotes;
  const invoices = ws.invoices;
  const contracts = ws.contracts;
  const retainers = ws.retainers;
  const meetings = ws.meetings;
  const subscriptions = ws.subscriptions;
  const catalog = ws.catalog;
  const k = useKpis();

  const kpis = [
    { label: dict.kpi.revenue, value: egp(k.revenue, locale), up: true, delta: "+12%" },
    { label: dict.kpi.forecast, value: egp(k.expected, locale), up: true, delta: "open" },
    { label: dict.kpi.profit, value: egp(k.profit, locale), up: k.profit > 0, delta: "" },
    { label: dict.kpi.overdue, value: egp(k.overdue, locale), up: false, delta: "" },
    { label: dict.kpi.pipeline, value: egp(k.pipeline, locale), up: true, delta: "" },
    { label: dict.kpi.expenses, value: egp(k.expensesSum, locale), up: false, delta: "" },
    { label: dict.kpi.leads, value: String(k.newLeads), up: true, delta: "" },
    { label: dict.kpi.winRate, value: pct(k.winRate, locale), up: true, delta: "" },
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
    .sort((a, b) => a.paid - b.paid);

  return (
    <div className="space-y-7 text-[#071B3A]" data-nawah-home="ready">
      <PageHeader
        kicker={dict.slogan}
        title={dict.greeting}
        description={dict.greetingSub}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href="/q/q_bloom">
              <Button size="sm" variant="outline">
                NW-1042
              </Button>
            </Link>
            <Link href="/">
              <Button size="sm" variant="outline">
                Product story
              </Button>
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2 text-[12px] text-navy/50">
        {["Lead", "Quote", "Scope", "Project", "Approval", "Invoice", "Profit", "Renewal"].map(
          (step, i) => (
            <span key={step} className="inline-flex items-center gap-2">
              {i > 0 ? <ArrowRight className="h-3 w-3 text-navy/25" /> : null}
              <span className="rounded-full bg-white px-2.5 py-1 font-medium text-navy/70 shadow-[0_1px_0_rgba(7,27,58,0.06)]">
                {step}
              </span>
            </span>
          ),
        )}
      </div>

      {k.overdue > 0 ? (
        <Link
          href="/finance"
          className="flex items-center justify-between gap-3 rounded-[16px] border border-coral/30 bg-coral/8 px-4 py-3"
        >
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-coral">
              Cash at risk
            </div>
            <div className="text-sm">
              {egp(k.overdue, locale)} overdue — collect before you sell more work.
            </div>
          </div>
          <ArrowRight className="h-4 w-4 shrink-0 text-coral" />
        </Link>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <Card key={item.label} className="p-4 text-[#071B3A]">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#071B3A]/55">
              {item.label}
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="text-[1.55rem] font-semibold tracking-tight text-[#071B3A]">
                {item.value}
              </div>
              {item.delta ? (
                <span
                  className={`inline-flex items-center text-xs font-medium ${
                    item.up ? "text-emerald-600" : "text-coral"
                  }`}
                >
                  {item.up ? (
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5" />
                  )}
                  {item.delta}
                </span>
              ) : null}
            </div>
          </Card>
        ))}
      </div>

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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>
              {locale === "ar" ? "قرارات اليوم" : "Needs a decision today"}
            </SectionTitle>
            <Badge tone="coral">{alerts.length}</Badge>
          </div>
          <ul className="space-y-2">
            {alerts.length === 0 ? (
              <li className="rounded-[12px] border border-dashed border-navy/10 px-3 py-6 text-center text-sm text-navy/45">
                {locale === "ar" ? "مفيش قرارات معلّقة." : "Nothing waiting on you."}
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
                    <CheckCircle2
                      className={`mt-0.5 h-4 w-4 ${
                        a.kind === "success" ? "text-mint" : "text-cobalt"
                      }`}
                    />
                  )}
                  <span className="text-sm leading-6">
                    {locale === "ar" ? a.titleAr : a.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle className="mb-4">
            {locale === "ar" ? "ضغط العمل" : "Team load"}
          </SectionTitle>
          <div className="space-y-3.5">
            {load.map(({ e, booked, ratio }) => (
              <div key={e.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{locale === "ar" ? e.nameAr : e.name}</span>
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
                    className={`h-full ${ratio > 1 ? "bg-coral" : "bg-cobalt"}`}
                    style={{ width: `${Math.min(100, ratio * 100)}%` }}
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">
            Weakest client
          </div>
          <Link href={`/clients/${worstClient?.id}`} className="mt-2 block">
            <div className="text-lg font-semibold">
              {locale === "ar" ? worstClient?.nameAr : worstClient?.name}
            </div>
            <Badge tone="coral">Health {worstClient?.health}</Badge>
          </Link>
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">
            Quotes waiting
          </div>
          <div className="mt-2 text-2xl font-semibold">{k.pendingQuotes.length}</div>
          {k.pendingQuotes.map((q) => (
            <Link key={q.id} href={`/quotes/${q.id}`} className="mt-1 block text-sm text-cobalt">
              {q.number}
            </Link>
          ))}
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">
            Approvals waiting
          </div>
          <div className="mt-2 text-2xl font-semibold">{k.waitingClient.length}</div>
          <Link href="/portal" className="text-sm text-cobalt">
            Open portal queue
          </Link>
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">
            Next meetings
          </div>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <SectionTitle>Open pipeline</SectionTitle>
            <Link href="/crm" className="text-sm text-cobalt">
              CRM
            </Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {pipeline.length === 0 ? (
              <p className="text-sm text-navy/50">Pipeline is empty.</p>
            ) : null}
            {pipeline.map((lead) => (
              <Link
                key={lead.id}
                href={`/crm/${lead.id}`}
                className="min-w-[180px] rounded-[12px] border border-navy/8 bg-paper/80 p-3"
              >
                <div className="text-sm font-semibold">{lead.company}</div>
                <div className="mt-1 text-[11px] text-navy/45">
                  {dict.stages[lead.stage]} · {egp(lead.value, locale)}
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
                <span>{locale === "ar" ? p.nameAr : p.name}</span>
                <Badge tone="coral">{dict.health[p.status]}</Badge>
              </Link>
            ))
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <SectionTitle className="mb-3">Contracts ending</SectionTitle>
          {endingContracts.length === 0 ? (
            <p className="text-sm text-navy/50">No contracts ending this quarter.</p>
          ) : null}
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
          {retainers.length === 0 ? (
            <p className="text-sm text-navy/50">No retainers yet.</p>
          ) : null}
          {retainers.map((r) => (
            <Link key={r.id} href="/retainers" className="mb-2 block text-sm">
              {r.name} · {r.consumedHours}/{r.monthlyHours}h · {r.status}
            </Link>
          ))}
        </Card>
        <Card>
          <SectionTitle className="mb-3">SaaS renewals</SectionTitle>
          {subscriptions.length === 0 ? (
            <p className="text-sm text-navy/50">No SaaS seats tracked.</p>
          ) : null}
          {subscriptions.map((s) => (
            <div key={s.id} className="mb-2 text-sm">
              {s.name} · {s.renew}
              {s.overlap ? <span className="text-coral"> · overlap</span> : null}
            </div>
          ))}
        </Card>
      </div>

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
                <span>{pct(tot.margin, locale)}</span>
              </div>
            );
          })}
        </Card>
        <Card>
          <SectionTitle className="mb-3">Client cash collected</SectionTitle>
          {clientProfit.map(({ c, paid }) => (
            <Link key={c.id} href={`/clients/${c.id}`} className="flex justify-between py-1 text-sm">
              <span>{c.name}</span>
              <span>{egp(paid, locale)}</span>
            </Link>
          ))}
        </Card>
      </div>

      <Card>
        <SectionTitle className="mb-3">{dict.nav.projects}</SectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          {k.projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="rounded-[14px] border border-navy/8 p-4 transition hover:border-cobalt/30 hover:bg-paper/50"
            >
              <Badge
                tone={
                  p.status === "healthy" ? "mint" : p.status === "delayed" ? "coral" : "cobalt"
                }
              >
                {dict.health[p.status]}
              </Badge>
              <div className="mt-2 font-medium">{locale === "ar" ? p.nameAr : p.name}</div>
              <div className="mt-1 text-xs text-navy/50">
                {egp(p.expectedRevenue, locale)} · {p.dueDate}
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle className="mb-4">The whole OS</SectionTitle>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {osLinks.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="rounded-[10px] border border-navy/8 bg-paper/70 px-3 py-2.5 text-sm font-medium hover:border-cobalt/40"
            >
              {label}
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
