"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { quoteTotals } from "@/data/seed";
import { t } from "@/lib/i18n";
import { egp, pct } from "@/lib/utils";
import { useOS } from "@/store/use-os";

export default function CatalogPage() {
  const locale = useOS((s) => s.locale);
  const catalog = useOS((s) => s.catalog);
  const addQuoteFromCatalog = useOS((s) => s.addQuoteFromCatalog);
  const router = useRouter();
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Services"
        title={dict.nav.catalog}
        description="Every line carries hours, role, cost, sell price, revisions, and deliverables. Quotes are assembled from here — not from a blank spreadsheet."
      />
      {catalog.map((svc) => {
        const tot = quoteTotals(
          svc.items.map((i) => ({
            id: i.id,
            name: i.name,
            nameAr: i.nameAr,
            qty: 1,
            hours: i.hours,
            role: i.role,
            hourlyCost: i.hourlyCost,
            sellPrice: i.sellPrice,
            toolsCost: 0,
            productionCost: 0,
            freelancerCost: 0,
            revisions: i.revisions,
          })),
        );
        return (
          <Card key={svc.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {locale === "ar" ? svc.nameAr : svc.name}
                </h2>
                <p className="mt-1 max-w-xl text-sm text-navy/55">
                  {locale === "ar" ? svc.descriptionAr : svc.description}
                </p>
              </div>
              <div className="text-end">
                <div className="text-sm font-semibold">{egp(tot.sell, locale)}</div>
                <div className="text-xs text-navy/45">
                  Cost {egp(tot.cost, locale)} · {pct(tot.margin, locale)} margin
                </div>
                <Button
                  className="mt-2"
                  size="sm"
                  onClick={() => {
                    const id = addQuoteFromCatalog({ catalogId: svc.id });
                    router.push(`/quotes/${id}`);
                  }}
                >
                  Build quotation
                </Button>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wide text-navy/40">
                  <tr>
                    <th className="pb-2 text-start">Line</th>
                    <th className="text-start">Role</th>
                    <th className="text-start">Hours</th>
                    <th className="text-start">Sell</th>
                    <th className="text-start">Min margin</th>
                    <th className="text-start">Deliverables</th>
                  </tr>
                </thead>
                <tbody>
                  {svc.items.map((line) => (
                    <tr key={line.id} className="border-t border-navy/6">
                      <td className="py-2">{locale === "ar" ? line.nameAr : line.name}</td>
                      <td>{line.role}</td>
                      <td>{line.hours}h</td>
                      <td>{egp(line.sellPrice, locale)}</td>
                      <td>{pct(line.minMargin, locale)}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {line.deliverables.map((d) => (
                            <Badge key={d} tone="slate">
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
