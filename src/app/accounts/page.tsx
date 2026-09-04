"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

const AM = "u_sara";

export default function AccountsPage() {
  const locale = useOS((s) => s.locale);
  const clients = useOS((s) => {
    const mine = s.clients.filter((c) => c.accountManagerId === AM);
    return mine.length ? mine : s.clients;
  });
  const quotes = useOS((s) => s.quotes);
  const invoices = useOS((s) => s.invoices);
  const meetings = useOS((s) => s.meetings);
  const tickets = useOS((s) => s.tickets);
  const leads = useOS((s) => s.leads.filter((l) => l.ownerId === AM));
  const dict = t(locale);
  const sara = useOS((s) => s.employees.find((e) => e.id === AM));

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Account management"
        title={dict.nav.accounts}
        description={`${sara?.name}’s book: health, follow-ups, unpaid invoices, and meetings — not a separate CRM.`}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="text-xs text-navy/45">Clients</div>
          <div className="mt-1 text-2xl font-semibold">{clients.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-navy/45">At-risk health</div>
          <div className="mt-1 text-2xl font-semibold">
            {clients.filter((c) => c.health < 70).length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-navy/45">Open pipeline</div>
          <div className="mt-1 text-2xl font-semibold">{leads.filter((l) => !["won", "lost"].includes(l.stage)).length}</div>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {clients.map((c) => {
          const overdue = invoices.filter(
            (i) => i.clientId === c.id && i.status === "overdue",
          );
          const waiting = quotes.filter(
            (q) => q.clientId === c.id && ["sent", "viewed"].includes(q.status),
          );
          const next = meetings.find((m) => m.clientId === c.id);
          const req = tickets.filter((t) => t.clientId === c.id && t.status !== "done");
          return (
            <Link key={c.id} href={`/clients/${c.id}`}>
              <Card className="h-full p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">{locale === "ar" ? c.nameAr : c.name}</div>
                    <div className="text-xs text-navy/45">{c.industry}</div>
                  </div>
                  <Badge tone={c.health >= 70 ? "mint" : "coral"}>Health {c.health}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-navy/65">
                  {overdue.map((i) => (
                    <div key={i.id} className="text-coral">
                      Overdue {i.number} · {egp(i.amount - i.paidAmount, locale)}
                    </div>
                  ))}
                  {waiting.map((q) => (
                    <div key={q.id}>Quote {q.number} waiting</div>
                  ))}
                  {next ? <div>Next: {next.title} · {next.when.slice(0, 16)}</div> : null}
                  {req.map((t) => (
                    <div key={t.id}>Request: {t.title}</div>
                  ))}
                  {c.upsell ? <div className="text-cobalt">Upsell: {c.upsell}</div> : null}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      <Card>
        <h2 className="mb-3 font-semibold">Leads owned by the AM</h2>
        <div className="flex gap-2 overflow-x-auto">
          {leads.map((l) => (
            <Link
              key={l.id}
              href={`/crm/${l.id}`}
              className="min-w-[180px] rounded-[12px] border border-navy/8 p-3 text-sm"
            >
              <div className="font-medium">{l.company}</div>
              <div className="text-navy/45">{dict.stages[l.stage]}</div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
