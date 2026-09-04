"use client";

import Link from "next/link";
import { CommentThread } from "@/components/comments/thread";
import { RecordChrome } from "@/components/records/chrome";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function RetainersPage() {
  const locale = useOS((s) => s.locale);
  const retainers = useOS((s) => s.retainers);
  const clients = useOS((s) => s.clients);
  const generateRetainerMonth = useOS((s) => s.generateRetainerMonth);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Recurring"
        title={dict.nav.retainers}
        description="Monthly hours, consumption, and renewal. Generate this cycle to open tasks, an invoice, and a project from the catalog template."
      />
      <PageSection page="/retainers" id="list" label="Retainers">
      {retainers.map((r) => {
        const client = clients.find((c) => c.id === r.clientId);
        const used = r.consumedHours / r.monthlyHours;
        return (
          <RecordChrome key={r.id} collection="retainers" id={r.id}>
          <Card className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{r.name}</h2>
                <Link href={`/clients/${r.clientId}`} className="text-sm text-cobalt">
                  {locale === "ar" ? client?.nameAr : client?.name}
                </Link>
              </div>
              <Badge tone={r.status === "ending" ? "coral" : "mint"}>{r.status}</Badge>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-4 text-sm">
              <div>Fee {egp(r.monthlyFee, locale)}</div>
              <div>
                Hours {r.consumedHours}/{r.monthlyHours}
              </div>
              <div>Renews {r.renewalDate}</div>
              <div>{used > 0.8 ? "Near scope limit" : "In scope"}</div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-navy/8">
              <div
                className={`h-full ${used > 0.85 ? "bg-coral" : "bg-mint"}`}
                style={{ width: `${Math.min(100, used * 100)}%` }}
              />
            </div>
            <Button className="mt-4" size="sm" onClick={() => generateRetainerMonth(r.id)}>
              Generate this month
            </Button>
            <div className="mt-3">
              <CommentThread entity="retainer" entityId={r.id} collapsed />
            </div>
          </Card>
          </RecordChrome>
        );
      })}
      </PageSection>
    </div>
  );
}
