"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Badge, Card } from "@/components/ui/card";
import { quoteTotals } from "@/data/seed";
import { t } from "@/lib/i18n";
import { egp, pct } from "@/lib/utils";
import { useKpis } from "@/store/selectors";
import { useOS } from "@/store/use-os";

export default function AnalyticsPage() {
  const locale = useOS((s) => s.locale);
  const leads = useOS((s) => s.leads);
  const clients = useOS((s) => s.clients);
  const quotes = useOS((s) => s.quotes);
  const tasks = useOS((s) => s.tasks);
  const invoices = useOS((s) => s.invoices);
  const expenses = useOS((s) => s.expenses);
  const projects = useOS((s) => s.projects);
  const catalog = useOS((s) => s.catalog);
  const employees = useOS((s) => s.employees);
  const dict = t(locale);
  const k = useKpis();
  const [tab, setTab] = useState<"owner" | "sales" | "ops" | "people" | "client" | "service">("owner");

  const bySource = Object.entries(
    leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.source] = (acc[l.source] ?? 0) + 1;
      return acc;
    }, {}),
  );

  const late = tasks.filter((t) => t.due && t.due < "2026-09-04" && t.status !== "done");
  const revisions = tasks.filter((t) => t.revisionCount > 0).length;

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Insight"
        title={dict.nav.analytics}
        description="Owner, sales, operations, people, client health, and service profit — same numbers as Home."
      />
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["owner", "Owner"],
            ["sales", "Sales"],
            ["ops", "Operations"],
            ["people", "People"],
            ["client", "Client health"],
            ["service", "Service profit"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`rounded-full px-3 py-1 text-xs ${tab === id ? "bg-navy text-white" : "bg-white text-navy/70"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "owner" ? (
      <PageSection page="/analytics" id="kpis" label="Headline KPIs">
      <div className="grid gap-3 md:grid-cols-4">
        {[
          ["Revenue", egp(k.revenue, locale)],
          ["Pipeline", egp(k.pipeline, locale)],
          ["Win rate", pct(k.winRate, locale)],
          ["Overdue", egp(k.overdue, locale)],
        ].map(([l, v]) => (
          <Card key={l} className="p-4">
            <div className="text-xs text-navy/45">{l}</div>
            <div className="mt-1 text-xl font-semibold">{v}</div>
          </Card>
        ))}
      </div>
      </PageSection>
      ) : null}
      <PageSection page="/analytics" id="detail" label="Breakdowns">
      <div className="grid gap-4 lg:grid-cols-2">
        {tab === "sales" || tab === "owner" ? (
        <Card>
          <h2 className="mb-3 font-semibold">Sales — leads by source</h2>
          {bySource.map(([src, n]) => (
            <div key={src} className="flex justify-between py-1 text-sm">
              <span>{src}</span>
              <span>{n}</span>
            </div>
          ))}
        </Card>
        ) : null}
        {tab === "ops" || tab === "owner" ? (
        <Card>
          <h2 className="mb-3 font-semibold">Operations</h2>
          <div className="text-sm">Late tasks: {late.length}</div>
          <div className="text-sm">Tasks with revisions: {revisions}</div>
          <div className="text-sm">
            Estimated vs actual hours: {k.soldHours} / {k.usedHours}
          </div>
        </Card>
        ) : null}
        {tab === "client" || tab === "owner" ? (
        <Card>
          <h2 className="mb-3 font-semibold">Client health</h2>
          {clients.map((c) => (
            <Link key={c.id} href={`/clients/${c.id}`} className="flex justify-between py-1 text-sm">
              <span>{c.name}</span>
              <Badge tone={c.health >= 70 ? "mint" : "coral"}>{c.health}</Badge>
            </Link>
          ))}
        </Card>
        ) : null}
        {tab === "people" || tab === "owner" ? (
        <Card>
          <h2 className="mb-3 font-semibold">People</h2>
          {employees
            .filter((e) => e.id !== "u_ahmed")
            .map((e) => {
              const mine = tasks.filter((t) => t.assigneeId === e.id);
              const booked = mine
                .filter((t) => t.status !== "done")
                .reduce((s, t) => s + t.estimateHours, 0);
              return (
                <div key={e.id} className="flex justify-between py-1 text-sm">
                  <span>
                    {e.name}
                    {e.kind === "freelancer" ? " (F)" : ""}
                  </span>
                  <span>
                    {booked}/{e.weeklyHours}h
                  </span>
                </div>
              );
            })}
        </Card>
        ) : null}
        {tab === "service" || tab === "owner" ? (
        <Card>
          <h2 className="mb-3 font-semibold">Service profitability</h2>
          {catalog.map((svc) => {
            const q = quotes.filter(
              (x) => x.title.includes(svc.name.split(" ")[0]) || x.status === "accepted",
            );
            const tot = q[0]
              ? quoteTotals(q[0].items, q[0].discount, q[0].taxRate)
              : null;
            return (
              <div key={svc.id} className="py-1 text-sm">
                {svc.name}
                {tot ? ` · margin ${pct(tot.margin, locale)}` : " · catalog only"}
              </div>
            );
          })}
          {projects.map((p) => {
            const extra = expenses
              .filter((e) => e.projectId === p.id)
              .reduce((s, e) => s + e.amount, 0);
            const paid = invoices
              .filter((i) => i.projectId === p.id)
              .reduce((s, i) => s + i.paidAmount, 0);
            return (
              <div key={p.id} className="flex justify-between py-1 text-sm">
                <span>{p.name}</span>
                <span>{egp((paid || p.expectedRevenue) - p.expectedCost - extra, locale)}</span>
              </div>
            );
          })}
        </Card>
        ) : null}
      </div>
      </PageSection>
    </div>
  );
}
