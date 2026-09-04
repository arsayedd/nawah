"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { RecordChrome } from "@/components/records/chrome";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { quoteTotals } from "@/data/seed";
import { t } from "@/lib/i18n";
import { egp, pct } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function QuotesPage() {
  const locale = useOS((s) => s.locale);
  const quotes = useOS((s) => s.quotes);
  const catalog = useOS((s) => s.catalog);
  const addQuoteFromCatalog = useOS((s) => s.addQuoteFromCatalog);
  const router = useRouter();
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Quotes"
        title={dict.nav.quotes}
        description={
          locale === "ar"
            ? "التكلفة، الهامش، والدفعة تتحسبوا وأنت بتبني العرض."
            : "Price from catalog, protect the margin, then accept into delivery, invoice, and portal."
        }
        actions={catalog.map((c) => (
          <Button
            key={c.id}
            variant="outline"
            size="sm"
            onClick={() => {
              const id = addQuoteFromCatalog({
                catalogId: c.id,
                leadId: "ld_atlas",
              });
              router.push(`/quotes/${id}`);
            }}
          >
            {locale === "ar" ? `من ${c.nameAr}` : `New · ${c.name}`}
          </Button>
        ))}
      />
      <PageSection page="/quotes" id="list" label="Quote list">
      <div className="grid gap-3">
        {quotes.map((q) => {
          const tot = quoteTotals(q.items, q.discount, q.taxRate);
          return (
            <RecordChrome key={q.id} collection="quotes" id={q.id}>
            <Link href={`/quotes/${q.id}`}>
              <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">
                      {locale === "ar" ? q.titleAr : q.title}
                    </span>
                    <Badge
                      tone={
                        q.status === "accepted"
                          ? "mint"
                          : q.status === "sent" || q.status === "viewed"
                            ? "cobalt"
                            : "slate"
                      }
                    >
                      {dict.quoteStatus[q.status]}
                    </Badge>
                  </div>
                  <div className="mt-1 text-xs text-navy/50">
                    {q.number} · {q.durationWeeks}
                    {locale === "ar" ? " أسابيع" : " weeks"}
                    {q.openedAt
                      ? locale === "ar"
                        ? ` · اتفتح ${q.viewSeconds ?? 0} ثانية`
                        : ` · opened ${q.viewSeconds ?? 0}s`
                      : ""}
                  </div>
                </div>
                <div className="text-sm">
                  <div className="font-semibold">{egp(tot.total, locale)}</div>
                  <div className="text-xs text-navy/50">
                    {locale === "ar" ? "هامش" : "Margin"} {pct(tot.margin, locale)}
                  </div>
                </div>
              </Card>
            </Link>
            </RecordChrome>
          );
        })}
      </div>
      </PageSection>
    </div>
  );
}
