"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge, Card } from "@/components/ui/card";
import { quoteTotals } from "@/data/seed";
import { t } from "@/lib/i18n";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function Client360Page() {
  const { id } = useParams<{ id: string }>();
  const locale = useOS((s) => s.locale);
  const client = useOS((s) => s.clients.find((c) => c.id === id));
  const contacts = useOS((s) => s.contacts.filter((c) => c.clientId === id));
  const projects = useOS((s) => s.projects.filter((p) => p.clientId === id));
  const quotes = useOS((s) => s.quotes.filter((q) => q.clientId === id));
  const invoices = useOS((s) => s.invoices.filter((i) => i.clientId === id));
  const tickets = useOS((s) => s.tickets.filter((t) => t.clientId === id));
  const meetings = useOS((s) => s.meetings.filter((m) => m.clientId === id));
  const expenses = useOS((s) => s.expenses);
  const tasks = useOS((s) => s.tasks);
  const employees = useOS((s) => s.employees);
  const activities = useOS((s) => s.activities.filter((a) => a.clientId === id));
  const contracts = useOS((s) => s.contracts.filter((c) => c.clientId === id));
  const dict = t(locale);

  if (!client) {
    return <p>{locale === "ar" ? "العميل مش موجود." : "Client not found."}</p>;
  }

  const revenue = invoices.reduce((s, i) => s + i.paidAmount, 0);
  const projectIds = new Set(projects.map((p) => p.id));
  const cost =
    expenses.filter((e) => e.projectId && projectIds.has(e.projectId)).reduce((s, e) => s + e.amount, 0) +
    tasks
      .filter((t) => projectIds.has(t.projectId))
      .reduce((s, t) => s + t.actualHours * 165, 0);
  const profit = revenue - cost;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link href="/clients" className="text-sm text-cobalt">
            ← {dict.nav.clients}
          </Link>
          <h1 className="mt-2 text-2xl font-bold">
            {locale === "ar" ? client.nameAr : client.name}
          </h1>
          <p className="text-sm text-navy/55">
            {client.industry} · {client.email}
            {client.accountManagerId ? " · AM on file" : ""}
          </p>
        </div>
        <Badge tone={client.health >= 70 ? "mint" : "coral"}>
          Health {client.health} · CSAT {client.satisfaction}/10
        </Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          [locale === "ar" ? "إيراد كلي" : "Lifetime revenue", egp(revenue, locale)],
          [locale === "ar" ? "تكلفة فعلية" : "Actual cost", egp(cost, locale)],
          [locale === "ar" ? "صافي الربح" : "Net profit", egp(profit, locale)],
          [locale === "ar" ? "المشاريع" : "Projects", String(projects.length)],
        ].map(([k, v]) => (
          <Card key={k} className="p-4">
            <div className="text-xs text-navy/50">{k}</div>
            <div className="mt-1 text-xl font-semibold">{v}</div>
          </Card>
        ))}
      </div>

      {client.risk ? (
        <Card className="border-coral/30 bg-coral/8">
          <div className="text-sm font-medium text-[#c2410c]">{client.risk}</div>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">
            {locale === "ar" ? "جهات الاتصال" : "Contacts"}
          </h2>
          {contacts.map((c) => (
            <div key={c.id} className="mb-2 text-sm">
              {c.name} · {c.role}
              {c.canApprove ? (
                <Badge tone="mint" className="ms-2">
                  Approver
                </Badge>
              ) : null}
            </div>
          ))}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">{dict.nav.projects}</h2>
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.id}`} className="mb-2 block text-sm text-cobalt">
              {locale === "ar" ? p.nameAr : p.name}
            </Link>
          ))}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">{dict.nav.quotes}</h2>
          {quotes.map((q) => {
            const tot = quoteTotals(q.items, q.discount, q.taxRate);
            return (
              <Link key={q.id} href={`/quotes/${q.id}`} className="mb-2 block text-sm">
                {q.number} · {egp(tot.total, locale)} · {dict.quoteStatus[q.status]}
              </Link>
            );
          })}
        </Card>
        <Card>
          <h2 className="mb-3 font-semibold">
            {locale === "ar" ? "فواتير وطلبات" : "Invoices & requests"}
          </h2>
          {invoices.map((i) => (
            <div key={i.id} className="mb-1 text-sm">
              {i.number} · {egp(i.amount, locale)} · {i.status}
            </div>
          ))}
          {tickets.map((tk) => (
            <div key={tk.id} className="mt-2 text-sm">
              {locale === "ar" ? tk.titleAr : tk.title}{" "}
              {!tk.inScope ? (
                <Badge tone="coral">Out of scope</Badge>
              ) : null}
            </div>
          ))}
          {meetings.map((m) => (
            <div key={m.id} className="mt-2 text-xs text-navy/50">
              {locale === "ar" ? m.titleAr : m.title} · {m.when.slice(0, 16)}
            </div>
          ))}
          {contracts.map((c) => (
            <div key={c.id} className="mt-2 text-sm">
              Contract {c.status} · {c.startDate} → {c.endDate}
            </div>
          ))}
          {activities.map((a) => (
            <div key={a.id} className="mt-2 text-xs text-navy/50">
              {a.kind} · {a.note}
            </div>
          ))}
          {client.accountManagerId ? (
            <div className="mt-3 text-sm">
              Account manager:{" "}
              {employees.find((e) => e.id === client.accountManagerId)?.name}
            </div>
          ) : null}
          {client.upsell ? (
            <div className="mt-1 text-sm text-cobalt">Upsell: {client.upsell}</div>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
