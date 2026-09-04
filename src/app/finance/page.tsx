"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function FinancePage() {
  const locale = useOS((s) => s.locale);
  const invoices = useOS((s) => s.invoices);
  const payments = useOS((s) => s.payments);
  const expenses = useOS((s) => s.expenses);
  const projects = useOS((s) => s.projects);
  const clients = useOS((s) => s.clients);
  const dict = t(locale);
  const recordPayment = useOS((s) => s.recordPayment);

  const collected = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const outstanding = invoices.reduce((s, i) => s + (i.amount - i.paidAmount), 0);
  const exp = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{dict.nav.finance}</h1>
      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <div className="text-xs text-navy/50">
            {locale === "ar" ? "محصّل" : "Collected"}
          </div>
          <div className="mt-1 text-2xl font-semibold">{egp(collected, locale)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-navy/50">
            {locale === "ar" ? "مستحق" : "Outstanding"}
          </div>
          <div className="mt-1 text-2xl font-semibold">{egp(outstanding, locale)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-navy/50">
            {locale === "ar" ? "مصروفات مباشرة" : "Direct expenses"}
          </div>
          <div className="mt-1 text-2xl font-semibold">{egp(exp, locale)}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-navy/50">Cash after expenses</div>
          <div className="mt-1 text-2xl font-semibold">{egp(collected - exp, locale)}</div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">
          {locale === "ar" ? "ربحية المشروع" : "Project profitability"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-navy/45">
              <tr>
                <th className="pb-2 text-start">Project</th>
                <th className="text-start">Revenue</th>
                <th className="text-start">Cost</th>
                <th className="text-start">Profit</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => {
                const rev =
                  invoices
                    .filter((i) => i.projectId === p.id)
                    .reduce((s, i) => s + i.paidAmount, 0) || p.expectedRevenue;
                const extra = expenses
                  .filter((e) => e.projectId === p.id)
                  .reduce((s, e) => s + e.amount, 0);
                const cost = p.expectedCost + extra;
                const profit = rev - cost;
                return (
                  <tr key={p.id} className="border-t border-navy/6">
                    <td className="py-2">
                      <Link className="text-cobalt" href={`/projects/${p.id}`}>
                        {locale === "ar" ? p.nameAr : p.name}
                      </Link>
                    </td>
                    <td>{egp(rev, locale)}</td>
                    <td>{egp(cost, locale)}</td>
                    <td>
                      <Badge tone={profit > 0 ? "mint" : "coral"}>
                        {egp(profit, locale)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">
            {locale === "ar" ? "الفواتير" : "Invoices"}
          </h2>
          {invoices.map((i) => {
            const client = clients.find((c) => c.id === i.clientId);
            return (
              <div
                key={i.id}
                className="flex items-center justify-between border-b border-navy/6 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">{i.number}</div>
                  <div className="text-xs text-navy/45">
                    {locale === "ar" ? client?.nameAr : client?.name} · {i.dueDate}
                  </div>
                </div>
                <div className="text-end">
                  <div>{egp(i.amount, locale)}</div>
                  <Badge
                    tone={
                      i.status === "paid"
                        ? "mint"
                        : i.status === "overdue"
                          ? "coral"
                          : "cobalt"
                    }
                  >
                    {i.status}
                  </Badge>
                  {i.status !== "paid" ? (
                    <Button
                      className="mt-1"
                      size="sm"
                      variant="outline"
                      onClick={() => recordPayment(i.id)}
                    >
                      Record payment
                    </Button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">
            {locale === "ar" ? "مدفوعات ومصروفات" : "Payments & expenses"}
          </h2>
          {payments.map((p) => (
            <div key={p.id} className="py-1 text-sm">
              {egp(p.amount, locale)} · {p.method} · {p.date}
            </div>
          ))}
          <div className="my-3 h-px bg-navy/8" />
          {expenses.map((e) => (
            <div key={e.id} className="py-1 text-sm">
              {egp(e.amount, locale)} · {e.category} · {e.note}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
