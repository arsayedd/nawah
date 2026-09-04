"use client";

import { useEffect, useState } from "react";
import { PageSection } from "@/components/shell/page-section";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AGENCY_NAME } from "@/lib/brand";
import { INTEGRATIONS } from "@/lib/os-map";
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
      <PageSection page="/settings" id="workspace" label="Workspace">
      <Card>
        <h2 className="font-semibold">
          {locale === "ar" ? "مساحة العمل" : "Workspace"}
        </h2>
        <p className="mt-1 text-sm text-navy/55">{AGENCY_NAME} · EGP · VAT 14%</p>
        <p className="mt-2 text-sm text-navy/55">
          {locale === "ar"
            ? "الأدوار: Owner, Admin, Sales, Account Manager, PM, Team, Finance, HR, Freelancer, Client."
            : "Roles: Owner, Admin, Sales, Account Manager, PM, Team, Finance, HR, Freelancer, Client."}
        </p>
        <Button className="mt-4" variant="outline" onClick={() => resetDemo()}>
          {dict.reset}
        </Button>
      </Card>
      </PageSection>
      <SupabaseCard locale={locale} />
      <PageSection page="/settings" id="saas" label="SaaS subscriptions">
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
      </PageSection>
      <Card>
        <h2 className="font-semibold">Roles</h2>
        <p className="mt-1 text-sm text-navy/55">
          Field-level finance lock is enforced in the portal (clients never see cost). Workspace roles below are the operating model.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-navy/40">
                <th className="py-2 text-start">Role</th>
                <th className="text-start">CRM</th>
                <th className="text-start">Delivery</th>
                <th className="text-start">Money</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Owner", "Full", "Full", "Full"],
                ["Account Manager", "Clients", "Comments", "Invoices send"],
                ["Project Manager", "Read", "Full", "Hidden cost"],
                ["Finance", "Read", "Read", "Full"],
                ["Freelancer", "None", "Assigned tasks", "None"],
                ["Client", "None", "Portal only", "Pay / approve"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-navy/6">
                  {row.map((c, i) => (
                    <td key={`${row[0]}-${i}`} className="py-2">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <AuditCard />
      <Card>
        <h2 className="mb-3 font-semibold">API & webhooks</h2>
        <p className="mb-3 text-sm text-navy/55">
          Workspace events can POST to your URL. Keys stay in this tenant — never across agencies.
        </p>
        <div className="space-y-2 text-sm">
          <div className="rounded-[10px] bg-paper px-3 py-2 font-mono text-xs">POST /api/os · workspace snapshot</div>
          <div className="rounded-[10px] bg-paper px-3 py-2">quote.accepted · invoice.overdue · task.late · retainer.ending</div>
        </div>
      </Card>
      <Card>
        <h2 className="mb-3 font-semibold">Integrations</h2>
        <p className="mb-3 text-sm text-navy/55">
          Operating layer stays in Nawah. Connect the specialist tools when you need them.
        </p>
        <div className="space-y-4">
          {INTEGRATIONS.map((g) => (
            <div key={g.group}>
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-navy/40">{g.group}</div>
              <div className="grid gap-2 sm:grid-cols-2">
                {g.tools.map((name) => (
                  <div
                    key={name}
                    className="flex items-center justify-between rounded-[10px] border border-navy/8 px-3 py-2 text-sm"
                  >
                    <span>{name}</span>
                    <span className="text-xs text-navy/40">Connect</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function AuditCard() {
  const audit = useOS((s) => s.audit);
  const employees = useOS((s) => s.employees);
  return (
    <Card>
      <h2 className="mb-3 font-semibold">Audit log</h2>
      {audit.map((e) => (
        <div key={e.id} className="border-b border-navy/6 py-2 text-sm">
          <div className="font-medium">{e.action}</div>
          <div className="text-navy/50">
            {employees.find((x) => x.id === e.actorId)?.name} · {e.at.slice(0, 16)} · {e.detail}
          </div>
        </div>
      ))}
    </Card>
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
