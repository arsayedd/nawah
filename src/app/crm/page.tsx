"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RecordChrome } from "@/components/records/chrome";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import type { PipelineStage } from "@/lib/types";
import { egp, pct } from "@/lib/utils";
import { useOS } from "@/store/use-os";

const order: PipelineStage[] = [
  "new",
  "contacted",
  "qualified",
  "discovery",
  "brief",
  "proposal",
  "negotiation",
  "won",
  "lost",
  "followup",
];

export default function CrmPage() {
  const locale = useOS((s) => s.locale);
  const leads = useOS((s) => s.leads);
  const moveLead = useOS((s) => s.moveLead);
  const employees = useOS((s) => s.employees);
  const dict = t(locale);
  const [dragging, setDragging] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, typeof leads> = {};
    for (const s of order) map[s] = [];
    for (const l of leads) map[l.stage]?.push(l);
    return map;
  }, [leads]);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Sales"
        title={dict.nav.crm}
        description={
          locale === "ar"
            ? "اسحب الصفقة بين المراحل. المرحلة الأخيرة مربوطة بالكوتيشن والتنفيذ."
            : "Drag deals across stages. Won does not stop at CRM — it becomes delivery."
        }
      />
      <PageSection page="/crm" id="forecast" label="Sales forecast">
        <div className="grid gap-3 sm:grid-cols-3">
          {(() => {
            const open = leads.filter((l) => !["won", "lost"].includes(l.stage));
            const weighted = open.reduce((s, l) => s + l.value * l.probability, 0);
            const best = open.reduce((s, l) => s + l.value, 0);
            const discovery = leads.filter((l) => l.stage === "discovery" || l.stage === "brief").length;
            return (
              <>
                <Card className="p-4">
                  <div className="text-[11px] uppercase tracking-wide text-navy/40">Weighted forecast</div>
                  <div className="mt-1 text-2xl font-semibold">{egp(weighted, locale)}</div>
                  <p className="mt-1 text-xs text-navy/45">Value × probability on open deals</p>
                </Card>
                <Card className="p-4">
                  <div className="text-[11px] uppercase tracking-wide text-navy/40">Unweighted pipeline</div>
                  <div className="mt-1 text-2xl font-semibold">{egp(best, locale)}</div>
                  <p className="mt-1 text-xs text-navy/45">{open.length} open · win mix {pct(leads.filter((l) => l.stage === "won").length / Math.max(1, leads.filter((l) => l.stage === "won" || l.stage === "lost").length), locale)}</p>
                </Card>
                <Card className="p-4">
                  <div className="text-[11px] uppercase tracking-wide text-navy/40">In discovery / brief</div>
                  <div className="mt-1 text-2xl font-semibold">{discovery}</div>
                  <p className="mt-1 text-xs text-navy/45">Forms feed the quotation and project brief</p>
                </Card>
              </>
            );
          })()}
        </div>
      </PageSection>
      <PageSection page="/crm" id="board" label="Pipeline board">
      <div className="flex gap-3 overflow-x-auto pb-4">
        {order.map((stage) => (
          <div
            key={stage}
            className="w-[260px] shrink-0"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragging) moveLead(dragging, stage);
              setDragging(null);
            }}
          >
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="text-sm font-semibold">{dict.stages[stage]}</span>
              <Badge tone="slate">{grouped[stage]?.length ?? 0}</Badge>
            </div>
            <div className="min-h-[420px] space-y-2 rounded-[14px] bg-navy/[0.03] p-2">
              {grouped[stage]?.map((lead) => {
                const owner = employees.find((e) => e.id === lead.ownerId);
                return (
                  <RecordChrome key={lead.id} collection="leads" id={lead.id}>
                  <Card
                    draggable
                    onDragStart={() => setDragging(lead.id)}
                    className="cursor-grab p-3 active:cursor-grabbing"
                  >
                    <Link href={`/crm/${lead.id}`} className="block">
                      <div className="text-sm font-semibold">{lead.company}</div>
                      <div className="text-xs text-navy/50">{lead.name}</div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span>{egp(lead.value, locale)}</span>
                        <span>{Math.round(lead.probability * 100)}%</span>
                      </div>
                      <div className="mt-2 text-[11px] text-navy/45">
                        {locale === "ar" ? owner?.nameAr : owner?.name} · {lead.source}
                      </div>
                    </Link>
                  </Card>
                  </RecordChrome>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      </PageSection>
    </div>
  );
}
