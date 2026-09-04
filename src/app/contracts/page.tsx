"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function ContractsPage() {
  const locale = useOS((s) => s.locale);
  const contracts = useOS((s) => s.contracts);
  const clients = useOS((s) => s.clients);
  const quotes = useOS((s) => s.quotes);
  const signContract = useOS((s) => s.signContract);
  const dict = t(locale);

  return (
    <div className="space-y-5">
      <PageHeader
        kicker="Legal"
        title={dict.nav.contracts}
        description="Accepting a quotation drafts the contract. Signing here locks dates — e-sign is simulated in this workspace."
      />
      {contracts.length === 0 ? (
        <Card className="p-6 text-sm text-navy/50">No contracts yet. Accept a quotation to draft one.</Card>
      ) : (
        contracts.map((c) => {
          const client = clients.find((x) => x.id === c.clientId);
          const quote = quotes.find((q) => q.id === c.quoteId);
          return (
            <Card key={c.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <div className="font-semibold">
                  {quote ? (locale === "ar" ? quote.titleAr : quote.title) : c.id}
                </div>
                <div className="text-sm text-navy/50">
                  {locale === "ar" ? client?.nameAr : client?.name} · {c.startDate} → {c.endDate}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={c.status === "signed" ? "mint" : "cobalt"}>{c.status}</Badge>
                {c.projectId ? (
                  <Link href={`/projects/${c.projectId}`} className="text-sm text-cobalt">
                    Project
                  </Link>
                ) : null}
                {c.status !== "signed" ? (
                  <Button size="sm" onClick={() => signContract(c.id)}>
                    Sign
                  </Button>
                ) : null}
              </div>
            </Card>
          );
        })
      )}
    </div>
  );
}
