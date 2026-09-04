"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NawahLockup } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { quoteTotals } from "@/data/seed";
import { t } from "@/lib/i18n";
import { egp } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function PublicQuotePage() {
  const { id } = useParams<{ id: string }>();
  const quote = useOS((s) => s.quotes.find((q) => q.id === id));
  const locale = useOS((s) => s.locale);
  const markQuoteViewed = useOS((s) => s.markQuoteViewed);
  const acceptQuote = useOS((s) => s.acceptQuote);
  const router = useRouter();
  const hydrated = useOS((s) => s.hydrated);
  const dict = t(locale);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    if (id) markQuoteViewed(id);
  }, [id, markQuoteViewed]);

  if (!quote) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper p-6">
        <p>{locale === "ar" ? "الرابط غير صالح." : "This link is invalid."}</p>
      </div>
    );
  }

  const tot = quoteTotals(quote.items, quote.discount, quote.taxRate);
  const deposit = Math.round(tot.total * quote.depositPercent);

  return (
    <div className="min-h-screen bg-paper px-4 py-10 text-navy">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <NawahLockup />
          <span className="text-xs text-navy/45">{quote.number}</span>
        </div>
        <Card className="overflow-hidden p-0">
          <div className="bg-navy px-8 py-10 text-white">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
              {dict.tagline}
            </p>
            <h1 className="mt-3 font-sans text-3xl font-semibold tracking-tight">
              {locale === "ar" ? quote.titleAr : quote.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/70">
              {locale === "ar" ? quote.summaryAr : quote.summary}
            </p>
          </div>
          <div className="space-y-6 p-8">
            <section>
              <h2 className="mb-2 font-semibold">
                {locale === "ar" ? "نطاق العمل" : "Scope of work"}
              </h2>
              <ul className="space-y-2 text-sm">
                {quote.items.map((i) => (
                  <li
                    key={i.id}
                    className="flex justify-between border-b border-navy/6 py-2"
                  >
                    <span>{locale === "ar" ? i.nameAr : i.name}</span>
                    <span>{egp(i.sellPrice, locale)}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="grid gap-3 sm:grid-cols-3">
              <div>
                <div className="text-xs text-navy/45">
                  {locale === "ar" ? "الإجمالي شامل الضريبة" : "Total incl. VAT"}
                </div>
                <div className="text-xl font-semibold">{egp(tot.total, locale)}</div>
              </div>
              <div>
                <div className="text-xs text-navy/45">
                  {locale === "ar" ? "الدفعة للبدء" : "To start"}
                </div>
                <div className="text-xl font-semibold">{egp(deposit, locale)}</div>
              </div>
              <div>
                <div className="text-xs text-navy/45">
                  {locale === "ar" ? "المدة" : "Timeline"}
                </div>
                <div className="text-xl font-semibold">
                  {quote.durationWeeks} {locale === "ar" ? "أسابيع" : "weeks"}
                </div>
              </div>
            </section>
            <section className="grid gap-3 text-sm text-navy/70 sm:grid-cols-2">
              <p>
                <strong className="text-navy">
                  {locale === "ar" ? "الافتراضات: " : "Assumptions: "}
                </strong>
                {quote.assumptions}
              </p>
              <p>
                <strong className="text-navy">
                  {locale === "ar" ? "الاستثناءات: " : "Exclusions: "}
                </strong>
                {quote.exclusions}
              </p>
              <p>
                <strong className="text-navy">
                  {locale === "ar" ? "التعديلات: " : "Revisions: "}
                </strong>
                {quote.revisionPolicy}
              </p>
              <p>
                <strong className="text-navy">
                  {locale === "ar" ? "صالح حتى: " : "Valid until: "}
                </strong>
                {quote.expiry}
              </p>
            </section>
            {quote.status === "accepted" ? (
              <p className="rounded-[10px] bg-mint/15 p-3 text-sm">
                {dict.acceptedBanner}
              </p>
            ) : signing ? (
              <div className="space-y-3 rounded-[12px] border border-navy/10 bg-paper p-4">
                <p className="text-sm font-medium">
                  {locale === "ar"
                    ? "وقّع للقبول وتشغيل التسليم."
                    : "Sign to accept and start delivery."}
                </p>
                <p className="text-xs text-navy/50">
                  {locale === "ar"
                    ? "هيتعمل عميل، مشروع، فاتورة دفعة، ودعوة للبوابة."
                    : "This creates the client, project, deposit invoice, and portal invite."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    disabled={!hydrated}
                    onClick={() => {
                      const res = acceptQuote(quote.id);
                      if (!res) {
                        toast.error(
                          locale === "ar"
                            ? "مقدرناش نقبل العرض. جرّب تاني بعد التحميل."
                            : "Could not accept this quote. Wait for the workspace to load and try again.",
                        );
                        return;
                      }
                      toast.success(dict.acceptedBanner);
                      router.push(`/portal?client=${res.clientId}`);
                    }}
                  >
                    {locale === "ar" ? "تأكيد التوقيع" : "Confirm signature"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setSigning(false)}>
                    {locale === "ar" ? "رجوع" : "Back"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => setSigning(true)}>
                  {locale === "ar" ? "قبول وتوقيع" : "Accept & sign"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    toast.message(
                      locale === "ar"
                        ? "طلب التعديل اتسجل عند فريق المبيعات."
                        : "Change request noted for the sales team.",
                    )
                  }
                >
                  {locale === "ar" ? "طلب تعديل" : "Request changes"}
                </Button>
                <Button
                  type="button"
                  variant="coral"
                  onClick={() =>
                    toast.message(
                      locale === "ar" ? "تم رفض العرض." : "Quote marked as declined.",
                    )
                  }
                >
                  {locale === "ar" ? "رفض" : "Reject"}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
