"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/shell/page-header";
import { PageSection } from "@/components/shell/page-section";
import { Badge, Card } from "@/components/ui/card";
import { AGENCY_SPINE, OS_PILLARS } from "@/lib/os-map";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function OsMapPage() {
  const locale = useOS((s) => s.locale);
  const dict = t(locale);

  return (
    <div className="space-y-7">
      <PageHeader
        kicker="Agency OS"
        title={dict.nav.map}
        description="One data core. Every module below is live in this workspace — not a slide deck."
        actions={
          <Link href="/q/q_bloom" className="text-sm text-cobalt">
            Live quote NW-1042 →
          </Link>
        }
      />

      <PageSection page="/map" id="spine" label="Data spine">
        <Card className="p-5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-navy/40">
            Accept a quotation and the OS walks this path
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {AGENCY_SPINE.map((step, i) => (
              <span key={step.label} className="inline-flex items-center gap-2">
                {i > 0 ? <ArrowRight className="h-3.5 w-3.5 text-mint" /> : null}
                <Link
                  href={step.href}
                  className="rounded-full bg-paper px-3 py-1 text-sm font-medium text-navy hover:bg-cobalt/10 hover:text-cobalt"
                >
                  {step.label}
                </Link>
              </span>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-navy/55">
            Client is created, contract drafted, project opened from catalog, tasks generated,
            first invoice issued, portal invited, calendar set, expected profit shown, automations
            start.
          </p>
        </Card>
      </PageSection>

      <PageSection page="/map" id="pillars" label="OS pillars">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {OS_PILLARS.map((p) => (
            <Card key={p.id} className="flex h-full flex-col p-4">
              <Link href={p.href} className="font-semibold hover:text-cobalt">
                {p.title}
              </Link>
              <p className="mt-1 text-xs leading-5 text-navy/50">{p.blurb}</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.children.map((c) => (
                  <Link key={`${p.id}-${c.label}`} href={c.href}>
                    <Badge tone="slate">{c.label}</Badge>
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </PageSection>
    </div>
  );
}
