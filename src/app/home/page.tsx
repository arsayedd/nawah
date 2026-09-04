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
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { egp, pct } from "@/lib/utils";
import { useKpis } from "@/store/selectors";
import { useOS } from "@/store/use-os";

export default function HomePage() {
  const locale = useOS((s) => s.locale);
  const dict = t(locale);
  const alerts = useOS((s) => s.alerts);
  const employees = useOS((s) => s.employees);
  const tasks = useOS((s) => s.tasks);
  const clients = useOS((s) => s.clients);
  const leads = useOS((s) => s.leads);
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

  return (
    <div className="space-y-7">
      <PageHeader
        kicker={dict.slogan}
        title={dict.greeting}
        description={dict.greetingSub}
        actions={
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-[10px] border border-navy/10 bg-white px-3 text-sm text-navy/70"
          >
            Product story
          </Link>
        }
      />

      <div className="flex flex-wrap gap-2 text-[12px] text-navy/50">
        {["Lead", "Quote", "Project", "Approval", "Invoice", "Profit"].map(
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <Card key={item.label} className="p-4">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-navy/45">
              {item.label}
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div className="text-[1.55rem] font-semibold tracking-tight">
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>
              {locale === "ar" ? "قرارات اليوم" : "Needs a decision today"}
            </SectionTitle>
            <Badge tone="coral">{alerts.length}</Badge>
          </div>
          <ul className="space-y-2">
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
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">
            {dict.kpi.billed}
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {k.soldHours}
            <span className="text-navy/30"> / {k.usedHours}</span>
          </div>
        </Card>
        <Card>
          <div className="text-[11px] uppercase tracking-[0.08em] text-navy/45">
            {locale === "ar" ? "أضعف صحة عميل" : "Weakest client health"}
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
            {locale === "ar" ? "عروض تنتظر رد" : "Quotes waiting"}
          </div>
          <div className="mt-2 text-2xl font-semibold">{k.pendingQuotes.length}</div>
          <Link href="/quotes" className="text-sm text-cobalt">
            {locale === "ar" ? "افتح الكوتيشنات" : "Review quotations"}
          </Link>
        </Card>
      </div>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <SectionTitle>
            {locale === "ar" ? "Pipeline مفتوح" : "Open pipeline"}
          </SectionTitle>
          <Link href="/crm" className="text-sm text-cobalt">
            {locale === "ar" ? "المبيعات" : "Open CRM"}
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
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
                  p.status === "healthy"
                    ? "mint"
                    : p.status === "delayed"
                      ? "coral"
                      : "cobalt"
                }
              >
                {dict.health[p.status]}
              </Badge>
              <div className="mt-2 font-medium">
                {locale === "ar" ? p.nameAr : p.name}
              </div>
              <div className="mt-1 text-xs text-navy/50">
                {egp(p.expectedRevenue, locale)} · {p.dueDate}
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
