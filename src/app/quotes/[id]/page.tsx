"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CommentThread } from "@/components/comments/thread";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { quoteTotals } from "@/data/seed";
import { t } from "@/lib/i18n";
import { egp, pct } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const locale = useOS((s) => s.locale);
  const quote = useOS((s) => s.quotes.find((q) => q.id === id));
  const acceptQuote = useOS((s) => s.acceptQuote);
  const router = useRouter();
  const dict = t(locale);

  if (!quote) {
    return <p>{locale === "ar" ? "الكوتيشن مش موجود." : "Quote not found."}</p>;
  }

  const tot = quoteTotals(quote.items, quote.discount, quote.taxRate);
  const deposit = Math.round(tot.total * quote.depositPercent);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/quotes" className="text-sm text-cobalt">
            ← {dict.nav.quotes}
          </Link>
          <h1 className="mt-2 text-2xl font-bold">
            {locale === "ar" ? quote.titleAr : quote.title}
          </h1>
          <p className="text-sm text-navy/55">
            {quote.number} · {dict.quoteStatus[quote.status]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 no-print">
          <Button variant="outline" asChild>
            <Link href={`/q/${quote.id}`}>
              {locale === "ar" ? "رابط العميل" : "Client link"}
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            PDF
          </Button>
          {quote.status !== "accepted" ? (
            <Button
              type="button"
              onClick={() => {
                const res = acceptQuote(quote.id);
                if (!res) {
                  toast.error(
                    locale === "ar"
                      ? "مقدرناش نقبل العرض."
                      : "Could not accept this quote.",
                  );
                  return;
                }
                toast.success(dict.acceptedBanner);
                router.push(`/projects/${res.projectId}`);
              }}
            >
              {dict.acceptQuote}
            </Button>
          ) : (
            <Button variant="mint" asChild>
              <Link href={`/portal?client=${quote.clientId}`}>
                {dict.viewPortal}
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {[
          [locale === "ar" ? "التكلفة الداخلية" : "Internal cost", egp(tot.cost, locale)],
          [locale === "ar" ? "سعر البيع" : "Sell price", egp(tot.afterDiscount, locale)],
          [locale === "ar" ? "هامش الربح" : "Margin", pct(tot.margin, locale)],
          [locale === "ar" ? "الدفعة المقدمة" : "Deposit", egp(deposit, locale)],
        ].map(([k, v]) => (
          <Card key={k} className="p-4">
            <div className="text-xs text-navy/50">{k}</div>
            <div className="mt-1 text-xl font-semibold">{v}</div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="mb-3 font-semibold">
          {locale === "ar" ? "بنود العرض" : "Line items"}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-navy/45">
              <tr>
                <th className="pb-2">{locale === "ar" ? "البند" : "Item"}</th>
                <th>{locale === "ar" ? "ساعات" : "Hours"}</th>
                <th>{locale === "ar" ? "تكلفة" : "Cost"}</th>
                <th>{locale === "ar" ? "بيع" : "Sell"}</th>
                <th>{locale === "ar" ? "ربح" : "Profit"}</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((i) => {
                const cost =
                  i.hours * i.hourlyCost +
                  i.toolsCost +
                  i.productionCost +
                  i.freelancerCost;
                return (
                  <tr key={i.id} className="border-t border-navy/6">
                    <td className="py-2">
                      {locale === "ar" ? i.nameAr : i.name}
                    </td>
                    <td>{i.hours * i.qty}</td>
                    <td>{egp(cost, locale)}</td>
                    <td>{egp(i.sellPrice, locale)}</td>
                    <td>
                      <Badge tone={i.sellPrice - cost > 0 ? "mint" : "coral"}>
                        {egp(i.sellPrice - cost, locale)}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 grid gap-2 text-sm md:grid-cols-3">
          <div>
            {locale === "ar" ? "ساعات الفريق" : "Team hours"}: {tot.hours}
          </div>
          <div>
            {locale === "ar" ? "نقطة التعادل" : "Break-even"}: {egp(tot.breakEven, locale)}
          </div>
          <div>
            {locale === "ar" ? "ضريبة" : "VAT"}: {egp(tot.tax, locale)}
          </div>
        </div>
      </Card>
      <PageSection page="/quotes/:id" id="comments" label="Comments">
        <CommentThread entity="quote" entityId={quote.id} />
      </PageSection>
    </div>
  );
}
