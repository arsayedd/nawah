"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { t } from "@/lib/i18n";
import { useOS } from "@/store/use-os";

export default function SettingsPage() {
  const locale = useOS((s) => s.locale);
  const resetDemo = useOS((s) => s.resetDemo);
  const dict = t(locale);
  const subscriptions = useOS((s) => s.subscriptions);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold">{dict.nav.settings}</h1>
      <Card>
        <h2 className="font-semibold">
          {locale === "ar" ? "مساحة العمل" : "Workspace"}
        </h2>
        <p className="mt-1 text-sm text-navy/55">Masar Digital · EGP · VAT 14%</p>
        <p className="mt-2 text-sm text-navy/55">
          {locale === "ar"
            ? "الأدوار: Owner, Admin, Sales, Account Manager, PM, Team, Finance, HR, Freelancer, Client."
            : "Roles: Owner, Admin, Sales, Account Manager, PM, Team, Finance, HR, Freelancer, Client."}
        </p>
        <Button className="mt-4" variant="outline" onClick={() => resetDemo()}>
          {dict.reset}
        </Button>
      </Card>
      <SupabaseCard locale={locale} />
      <Card>
        <h2 className="mb-3 font-semibold">
          {locale === "ar" ? "اشتراكات الأدوات" : "SaaS subscriptions"}
        </h2>
        <p className="mb-3 text-sm text-navy/55">
          {locale === "ar"
            ? "نواة بتحل محل ClickUp وNotion للتشغيل اليومي. المقاعد الفاضية ظاهرة تحت."
            : "Nawah is meant to replace ClickUp and Notion for daily ops. Unused seats are flagged below."}
        </p>
        <div className="space-y-2">
          {subscriptions.map((tool) => (
            <div
              key={tool.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-paper px-3 py-2 text-sm"
            >
              <span className="font-medium">{tool.name}</span>
              <span className="text-navy/50">
                {tool.used}/{tool.seats} seats · {tool.monthly} EGP · {tool.renew}
              </span>
              {tool.overlap ? (
                <span className="text-xs text-coral">Overlap: {tool.overlap}</span>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Integrations</h2>
        <p className="mb-3 text-sm text-navy/55">
          Operating layer stays in Nawah. Connect the specialist tools — ads, banks, Drive — when you need them.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            "Gmail",
            "WhatsApp Business",
            "Google Calendar",
            "Google Drive",
            "Figma",
            "Slack",
            "Meta Ads",
            "Google Ads",
            "Shopify",
            "Stripe / Paymob",
            "QuickBooks / Xero",
          ].map((name) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-[10px] border border-navy/8 px-3 py-2 text-sm"
            >
              <span>{name}</span>
              <span className="text-xs text-navy/40">Connect</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SupabaseCard({ locale }: { locale: "ar" | "en" }) {
  const [status, setStatus] = useState<{
    postgres?: boolean;
    storage?: boolean;
    projectUrl?: string;
    tableError?: string | null;
    backend?: string;
  } | null>(null);

  useEffect(() => {
    void fetch("/api/os")
      .then((r) => r.json())
      .then((d) =>
        setStatus({
          backend: d.backend,
          postgres: d.status?.postgres,
          storage: d.status?.storage,
          projectUrl: d.status?.projectUrl,
          tableError: d.status?.tableError,
        }),
      )
      .catch(() => setStatus({ postgres: false, storage: false }));
  }, []);

  return (
    <Card>
      <h2 className="font-semibold">Supabase</h2>
      <p className="mt-1 text-sm text-navy/55">
        {locale === "ar"
          ? "بيانات الأجنسي بتتحفظ على مشروع Supabase، مش في المتصفح."
          : "Agency data is stored on your Supabase project, not in the browser."}
      </p>
      <div className="mt-3 space-y-1 text-sm">
        <div>Project: {status?.projectUrl ?? "—"}</div>
        <div>
          Backend: {status?.backend ?? "…"} · Postgres tables:{" "}
          {status?.postgres ? "ready" : "pending schema"} · Storage:{" "}
          {status?.storage ? "ready" : "missing"}
        </div>
        {status?.tableError ? (
          <p className="text-xs text-navy/50">
            {locale === "ar"
              ? "الجداول لسه متعملتش. شغّل ملف supabase/migrations في SQL Editor عشان تتحول من Storage لـ Postgres."
              : "Tables are not created yet. Run supabase/migrations in the SQL Editor to move from Storage to Postgres."}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
