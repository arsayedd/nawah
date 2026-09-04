"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { CommentThread } from "@/components/comments/thread";
import { PageSection } from "@/components/shell/page-section";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function LeadPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useOS((s) => s.locale);
  const lead = useOS((s) => s.leads.find((l) => l.id === id));
  const owner = useOS((s) => s.employees.find((e) => e.id === lead?.ownerId));
  const quotes = useOS((s) => s.quotes.filter((q) => q.leadId === id));
  const activities = useOS((s) => s.activities.filter((a) => a.leadId === id));
  const dict = t(locale);

  if (!lead) {
    return <p>{locale === "ar" ? "الـ Lead مش موجود." : "Lead not found."}</p>;
  }

  const rows = [
    [locale === "ar" ? "الشركة" : "Company", lead.company],
    [locale === "ar" ? "الاسم" : "Name", lead.name],
    ["Email", lead.email],
    [locale === "ar" ? "موبايل" : "Phone", lead.phone],
    [locale === "ar" ? "المصدر" : "Source", lead.source],
    ["UTM", lead.utm ?? "—"],
    [locale === "ar" ? "الخدمة" : "Service", lead.service],
    [locale === "ar" ? "الميزانية" : "Budget", lead.budget ? egp(lead.budget, locale) : "—"],
    [locale === "ar" ? "قيمة الصفقة" : "Deal value", egp(lead.value, locale)],
    [locale === "ar" ? "احتمالية الإغلاق" : "Probability", `${Math.round(lead.probability * 100)}%`],
    [locale === "ar" ? "المسؤول" : "Owner", locale === "ar" ? owner?.nameAr : owner?.name],
    [locale === "ar" ? "آخر تواصل" : "Last contact", lead.lastContact ?? "—"],
    [locale === "ar" ? "الخطوة الجاية" : "Next step", lead.nextStep ?? "—"],
    [locale === "ar" ? "المرحلة" : "Stage", dict.stages[lead.stage]],
    [locale === "ar" ? "سبب الفوز/الخسارة" : "Win/loss", lead.winLossReason ?? "—"],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/crm" className="text-sm text-cobalt">
        ← {dict.nav.crm}
      </Link>
      <h1 className="text-2xl font-bold">{lead.company}</h1>
      <Link href={`/crm/${id}/discover`} className="text-sm text-cobalt">
        Discovery form
      </Link>
      <Card>
        <dl className="grid gap-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs text-navy/45">{k}</dt>
              <dd className="text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        {lead.notes ? (
          <p className="mt-4 rounded-[10px] bg-paper p-3 text-sm">{lead.notes}</p>
        ) : null}
      </Card>
      <Card>
        <h2 className="mb-2 font-semibold">Activity</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-navy/50">No logged calls or emails yet.</p>
        ) : (
          activities.map((a) => (
            <div key={a.id} className="border-b border-navy/6 py-2 text-sm">
              <span className="font-medium capitalize">{a.kind}</span>
              <span className="text-navy/40"> · {a.at.slice(0, 16)}</span>
              <p className="text-navy/70">{a.note}</p>
            </div>
          ))
        )}
      </Card>
      <Card>
        <h2 className="mb-2 font-semibold">
          {locale === "ar" ? "الكوتيشنات" : "Quotations"}
        </h2>
        {quotes.length === 0 ? (
          <p className="text-sm text-navy/50">
            {locale === "ar" ? "لا يوجد كوتيشن بعد." : "No quotation yet."}
          </p>
        ) : (
          quotes.map((q) => (
            <Link key={q.id} href={`/quotes/${q.id}`} className="block text-cobalt">
              {q.number} · {dict.quoteStatus[q.status]}
            </Link>
          ))
        )}
      </Card>
      {lead ? (
        <PageSection page="/crm/:id" id="comments" label="Comments">
          <CommentThread entity="lead" entityId={lead.id} />
        </PageSection>
      ) : null}
    </div>
  );
}
