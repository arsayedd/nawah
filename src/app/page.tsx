"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
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
  const k = useKpis();

  const kpis = [
    { label: dict.kpi.revenue, value: egp(k.revenue, locale), up: true, delta: "+12%" },
    { label: dict.kpi.forecast, value: egp(k.expected, locale), up: true, delta: "open" },
    { label: dict.kpi.expenses, value: egp(k.expensesSum, locale), up: false, delta: "" },
    { label: dict.kpi.profit, value: egp(k.profit, locale), up: k.profit > 0, delta: "" },
    { label: dict.kpi.overdue, value: egp(k.overdue, locale), up: false, delta: "" },
    { label: dict.kpi.pipeline, value: egp(k.pipeline, locale), up: true, delta: "" },
    { label: dict.kpi.leads, value: String(k.newLeads), up: true, delta: "" },
    { label: dict.kpi.winRate, value: pct(k.winRate, locale), up: true, delta: "" },
  ];

  const load = employees
    .filter((e) => e.id !== "u_ahmed")
    .map((e) => {
      const booked = tasks
        .filter((t) => t.assigneeId === e.id && t.status !== "done")
        .reduce((s, t) => s + t.estimateHours, 0);
      const ratio = booked / e.weeklyHours;
      return { e, booked, ratio };
    });

  const worstClient = [...clients].sort((a, b) => a.health - b.health)[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {dict.greeting}
        </h1>
        <p className="mt-1 text-navy/55">{dict.greetingSub}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((item) => (
          <Card key={item.label} className="p-4">
            <div className="text-xs font-medium text-navy/50">{item.label}</div>
            <div className="mt-2 flex items-end justify-between">
              <div className="text-2xl font-semibold tracking-tight">
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
            <h2 className="font-semibold">
              {locale === "ar" ? "تنبيهات تحتاج قرارك اليوم" : "Needs a decision today"}
            </h2>
            <Badge tone="coral">{alerts.length}</Badge>
          </div>
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li key={a.id}>
                <Link
                  href={a.href}
                  className="flex items-start gap-3 rounded-[10px] border border-navy/6 px-3 py-3 hover:border-cobalt/30"
                >
                  {a.kind === "alert" ? (
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-coral" />
                  ) : a.kind === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-mint" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-cobalt" />
                  )}
                  <span className="text-sm">
                    {locale === "ar" ? a.titleAr : a.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="mb-4 font-semibold">
            {locale === "ar" ? "ضغط العمل" : "Workload"}
          </h2>
          <div className="space-y-3">
            {load.map(({ e, booked, ratio }) => (
              <div key={e.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{locale === "ar" ? e.nameAr : e.name}</span>
                  <span className="text-navy/50">
                    {booked}/{e.weeklyHours}
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
          <div className="text-xs text-navy/50">
            {dict.kpi.billed}
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {k.soldHours} / {k.usedHours}
          </div>
        </Card>
        <Card>
          <div className="text-xs text-navy/50">
            {locale === "ar" ? "أقل عميل من حيث الصحة" : "Lowest client health"}
          </div>
          <Link href={`/clients/${worstClient?.id}`} className="mt-2 block">
            <div className="text-lg font-semibold">
              {locale === "ar" ? worstClient?.nameAr : worstClient?.name}
            </div>
            <Badge tone="coral">Health {worstClient?.health}</Badge>
          </Link>
        </Card>
        <Card>
          <div className="text-xs text-navy/50">
            {locale === "ar" ? "كوتيشنات تنتظر رد" : "Quotes waiting"}
          </div>
          <div className="mt-2 text-2xl font-semibold">
            {k.pendingQuotes.length}
          </div>
          <Link href="/quotes" className="text-sm text-cobalt">
            {locale === "ar" ? "افتح الكوتيشنات" : "Open quotations"}
          </Link>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">
          {locale === "ar" ? "المشاريع" : "Projects"}
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {k.projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="rounded-[14px] border border-navy/8 p-4 hover:border-cobalt/30"
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
