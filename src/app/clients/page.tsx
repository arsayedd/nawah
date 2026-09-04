"use client";

import Link from "next/link";
import { Badge, Card } from "@/components/ui/card";
import { egp } from "@/lib/utils";
import { t } from "@/lib/i18n";
import { quoteTotals } from "@/data/seed";
import { useOS } from "@/store/use-os";

export default function ClientsPage() {
  const locale = useOS((s) => s.locale);
  const clients = useOS((s) => s.clients);
  const projects = useOS((s) => s.projects);
  const invoices = useOS((s) => s.invoices);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{dict.nav.clients}</h1>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((c) => {
          const revenue = invoices
            .filter((i) => i.clientId === c.id)
            .reduce((s, i) => s + i.paidAmount, 0);
          const count = projects.filter((p) => p.clientId === c.id).length;
          return (
            <Link key={c.id} href={`/clients/${c.id}`}>
              <Card className="h-full p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">
                      {locale === "ar" ? c.nameAr : c.name}
                    </div>
                    <div className="text-xs text-navy/50">{c.industry}</div>
                  </div>
                  <Badge
                    tone={c.health >= 70 ? "mint" : c.health >= 50 ? "cobalt" : "coral"}
                  >
                    Health {c.health}
                  </Badge>
                </div>
                <div className="mt-4 flex justify-between text-sm">
                  <span>
                    {count} {locale === "ar" ? "مشاريع" : "projects"}
                  </span>
                  <span>{egp(revenue, locale)}</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
